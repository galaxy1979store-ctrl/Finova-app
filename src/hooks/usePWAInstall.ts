import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredInstallPrompt) {
      return window.__deferredInstallPrompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  const [isIOS, setIsIOS] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  });

  useEffect(() => {
    // Check standalone
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // Check pre-existing prompt from index.html head
    if (window.__deferredInstallPrompt) {
      setDeferredPrompt(window.__deferredInstallPrompt);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__deferredInstallPrompt = null;
      setDeferredPrompt(null);
    };

    const handlePromptReady = () => {
      if (window.__deferredInstallPrompt) {
        setDeferredPrompt(window.__deferredInstallPrompt);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
    };
  }, []);

  const install = useCallback(async (): Promise<{ success: boolean; reason?: 'ios' | 'dismissed' | 'unsupported' | 'already_installed' }> => {
    if (isInstalled) {
      return { success: false, reason: 'already_installed' };
    }

    // Retrieve prompt from state or window global
    let prompt = deferredPrompt || window.__deferredInstallPrompt;

    // If on Android/Desktop and prompt hasn't arrived yet, wait up to 1000ms for Chrome to finish evaluating heuristics
    if (!prompt && !isIOS) {
      prompt = await new Promise<BeforeInstallPromptEvent | null>((resolve) => {
        let timeoutId: any;
        const handler = () => {
          clearTimeout(timeoutId);
          window.removeEventListener('pwa-prompt-ready', handler);
          resolve(window.__deferredInstallPrompt || null);
        };
        window.addEventListener('pwa-prompt-ready', handler);
        timeoutId = setTimeout(() => {
          window.removeEventListener('pwa-prompt-ready', handler);
          resolve(window.__deferredInstallPrompt || null);
        }, 1000);
      });
    }

    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          window.__deferredInstallPrompt = null;
          setDeferredPrompt(null);
          return { success: true };
        } else {
          return { success: false, reason: 'dismissed' };
        }
      } catch (err) {
        console.warn('Install prompt execution failed:', err);
      }
    }

    // Fallback: iOS Safari must use the Safari Share Menu
    if (isIOS) {
      return { success: false, reason: 'ios' };
    }

    return { success: false, reason: 'unsupported' };
  }, [deferredPrompt, isInstalled, isIOS]);

  return {
    isInstallable: !!deferredPrompt || !!(typeof window !== 'undefined' && window.__deferredInstallPrompt),
    isInstalled,
    isIOS,
    install,
  };
}
