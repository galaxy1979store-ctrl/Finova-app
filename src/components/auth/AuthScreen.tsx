import React, { useState } from 'react';
import {
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Crown,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinovaLogo } from '../common/FinovaLogo';

export const AuthScreen: React.FC = () => {
  const { login, register } = useFinance();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('12345678');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Por favor ingresa tu usuario o correo y contraseña.');
      return;
    }

    const res = login(loginIdentifier, loginPassword, rememberMe);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales inválidas. Revisa tu usuario o contraseña.');
    } else {
      setSuccessMessage('¡Sesión iniciada con éxito! Entrando al sistema...');
    }
  };

  const handleQuickFill = (identifier: string, pass: string, autoSubmit = false) => {
    setLoginIdentifier(identifier);
    setLoginPassword(pass);
    setErrorMessage('');
    if (autoSubmit) {
      const res = login(identifier, pass, true);
      if (!res.success) {
        setErrorMessage(res.error || 'Error al iniciar sesión.');
      } else {
        setSuccessMessage('¡Sesión iniciada con éxito! Entrando al sistema...');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const res = register(regFullName, regBusinessName, regIdentifier, regPassword, rememberMe);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al registrar la cuenta.');
    } else {
      setSuccessMessage('¡Cuenta creada e iniciada exitosamente!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between selection:bg-amber-200">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-2.5">
              <FinovaLogo size="xl" variant="full" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto">
              Plataforma de finanzas, inventario, deudas y facturación para empresas o personales.
            </p>
          </div>

          {/* Clean Auth Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-100">
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Standard System Accounts Callout */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Cuentas del Sistema disponibles
                    </span>
                    <span className="text-[10px] text-slate-400">Toca para rellenar</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Administrator Account */}
                    <button
                      type="button"
                      onClick={() => handleQuickFill('admin', '12345678')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        loginIdentifier === 'admin'
                          ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-slate-900">Administrador</span>
                        </div>
                        {loginIdentifier === 'admin' && (
                          <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-slate-950">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Usuario: <span className="font-mono font-bold text-slate-800">admin</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Clave: <span className="font-mono font-bold text-slate-800">12345678</span>
                      </p>
                      <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-amber-700">Superadmin</span>
                        <span className="text-[9px] text-slate-400 hover:text-slate-900 font-bold">Usar →</span>
                      </div>
                    </button>

                    {/* Normal User Account */}
                    <button
                      type="button"
                      onClick={() => handleQuickFill('usuario', '12345678')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        loginIdentifier === 'usuario'
                          ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-700" />
                          <span className="text-xs font-black text-slate-900">Usuario</span>
                        </div>
                        {loginIdentifier === 'usuario' && (
                          <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-slate-950">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Usuario: <span className="font-mono font-bold text-slate-800">usuario</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Clave: <span className="font-mono font-bold text-slate-800">12345678</span>
                      </p>
                      <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-600">Usuario normal</span>
                        <span className="text-[9px] text-slate-400 hover:text-slate-900 font-bold">Usar →</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Usuario o Correo Electrónico
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      placeholder="admin, usuario o tu@correo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Contraseña (Clave)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Session Persistence Indicator */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Mantener sesión iniciada permanentemente</span>
                  </label>
                  <p className="text-[10px] text-slate-600 pl-5.5 leading-tight">
                    Tu cuenta permanecerá abierta en este dispositivo hasta que decidas cerrar sesión explícitamente.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                  >
                    ¿Deseas registrar un nuevo negocio o usuario?{' '}
                    <span className="font-bold underline text-slate-900">Crear cuenta</span>
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="Ej: Pedro Pérez"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nombre de tu Negocio o Empresa *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regBusinessName}
                      onChange={e => setRegBusinessName(e.target.value)}
                      placeholder="Ej: Distribuidora Central"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Usuario o Correo Electrónico *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={regIdentifier}
                      onChange={e => setRegIdentifier(e.target.value)}
                      placeholder="ejemplo_usuario o tu@correo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Confirmar *
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
                  <p>
                    Al crear tu cuenta, tu sesión permanecerá guardada y activa en este navegador hasta que decidas salir.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>Crear Cuenta y Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                  >
                    ¿Ya tienes una cuenta?{' '}
                    <span className="font-bold underline text-slate-900">Iniciar sesión</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-center py-4 text-xs text-slate-400 font-medium">
        Fynova · App para finanzas de empresas o personales
      </footer>
    </div>
  );
};
