import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle2, Lock, Smartphone, Users, Key } from 'lucide-react';

// Logo del negocio - placeholder URL (debe reemplazarse con el logo real)
const BUSINESS_LOGO = 'https://placehold.co/64x64/f0fdfa/14b8a6?text=LOGO';

export const LoginView: React.FC = () => {
  const { login, verify2FA, setup2FA, error, tempUser } = useAuth();
  const [email, setEmail] = useState('admin@negocio.com');
  const [password, setPassword] = useState('123456');
  const [totpCode, setTotpCode] = useState('');
  const [authStep, setAuthStep] = useState<'LOGIN' | 'REQUIRE_2FA' | 'SETUP_2FA'>('LOGIN');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      if (res.step === 'REQUIRE_2FA' || res.step === 'SETUP_2FA') {
        setAuthStep(res.step);
      }
    } catch (err) {
      // Error is handled in context
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authStep === 'REQUIRE_2FA') {
      const ok = await verify2FA(totpCode);
      if (!ok) setTotpCode('');
    } else if (authStep === 'SETUP_2FA') {
      const ok = await setup2FA(totpCode);
      if (!ok) setTotpCode('');
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-900 relative overflow-hidden">
      
      {/* Background decoration - pastel soft */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary-200/30 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="p-2 rounded-2xl overflow-hidden shadow-lg border border-primary-200 bg-white">
            <img src={BUSINESS_LOGO} alt="Logo del Negocio" className="h-14 w-14 object-cover" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-primary-700">
          StockSpark Pro
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Sistema de Gestión de Stock Seguro (Cloud Firestore Spark)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-neutral-200 space-y-6">
          
          {error && (
            <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-2xl text-secondary-700 text-sm flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-secondary-500" />
              <span>{error}</span>
            </div>
          )}

          {authStep === 'LOGIN' && (
            <>
              <div className="space-y-3 bg-primary-50/50 p-4 rounded-2xl border border-primary-100 text-xs text-neutral-700">
                <p className="font-bold text-primary-600 flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Acceso Rápido Demo (Allowlist de Pruebas):</span>
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('admin@negocio.com')}
                    className="p-2.5 bg-white hover:bg-primary-50 text-primary-700 border border-primary-200 rounded-xl text-left transition-all font-semibold shadow-sm"
                  >
                    <span className="block text-neutral-900 text-xs font-bold">Carlos Mendoza</span>
                    <span className="text-[10px] text-primary-600 font-mono">admin@negocio.com</span>
                    <span className="block text-[10px] bg-primary-100 px-1 py-0.5 rounded-full text-primary-700 mt-1 w-fit font-semibold">Rol: Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('operador@negocio.com')}
                    className="p-2.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-left transition-all font-semibold shadow-sm"
                  >
                    <span className="block text-neutral-900 text-xs font-bold">Lucía Torres</span>
                    <span className="text-[10px] text-emerald-600 font-mono">operador@negocio.com</span>
                    <span className="block text-[10px] bg-emerald-100 px-1 py-0.5 rounded-full text-emerald-700 mt-1 w-fit font-semibold">Rol: Operador</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 italic pt-1">
                  * Contraseña por defecto para todas las cuentas demo: <code className="bg-white px-2 py-0.5 rounded text-primary-600 font-semibold">123456</code>.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@negocio.com"
                    className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-2.5 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary-200"
                >
                  <Lock className="h-4 w-4" />
                  <span>Iniciar Sesión Segura</span>
                </button>
              </form>
            </>
          )}

          {authStep === 'REQUIRE_2FA' && (
            <div className="space-y-5 text-center">
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl text-sky-700 w-fit mx-auto">
                <Smartphone className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Verificación de Segundo Factor (2FA TOTP)</h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Ingrese el código dinámico de 6 dígitos de su app autenticadora (Google Authenticator / Authy).
                </p>
                <p className="text-[11px] bg-primary-50 text-primary-600 p-2 rounded-xl border border-primary-200 mt-3">
                  💡 <strong>Nota Simulación SPA:</strong> Puede ingresar cualquier número de 6 dígitos (ej: <code className="font-bold text-primary-700 bg-white px-1.5 py-0.5 rounded">123456</code>) para autorizar exitosamente la prueba.
                </p>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-neutral-900 focus:outline-none focus:border-sky-400"
                />

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setAuthStep('LOGIN')}
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-sm transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-sky-200"
                  >
                    Verificar Código
                  </button>
                </div>
              </form>
            </div>
          )}

          {authStep === 'SETUP_2FA' && (
            <div className="space-y-5 text-center">
              <div className="bg-primary-50 border border-primary-200 p-4 rounded-2xl text-primary-600 w-fit mx-auto">
                <Key className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Configuración Inicial 2FA (MFA Obligatorio)</h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Hola <strong>{tempUser?.nombre}</strong>. Este es su primer ingreso al portal o su MFA fue reiniciado por el Administrador.
                </p>
                <p className="text-xs text-neutral-600 mt-2">
                  1. Escanee este código QR con Google Authenticator o Authy.
                </p>
              </div>

              {/* Simulated QR Code illustration */}
              <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-inner border border-neutral-200">
                <div className="text-center space-y-2 text-neutral-900">
                  <div className="grid grid-cols-4 gap-1 w-32 h-32 mx-auto bg-neutral-900 p-2 rounded-lg">
                    <div className="bg-white rounded"></div><div className="bg-neutral-900"></div><div className="bg-white rounded"></div><div className="bg-neutral-900"></div>
                    <div className="bg-neutral-900"></div><div className="bg-white rounded"></div><div className="bg-neutral-900"></div><div className="bg-white rounded"></div>
                    <div className="bg-white rounded"></div><div className="bg-neutral-900"></div><div className="bg-white rounded"></div><div className="bg-neutral-900"></div>
                    <div className="bg-neutral-900"></div><div className="bg-white rounded"></div><div className="bg-neutral-900"></div><div className="bg-white rounded"></div>
                  </div>
                  <span className="text-[10px] font-mono font-bold block text-primary-600">TOTP Secret: JBSWY3DPEH...</span>
                </div>
              </div>

              <div className="text-left space-y-2">
                <p className="text-xs text-neutral-600">
                  2. Ingrese el código de 6 dígitos que genera la aplicación para completar la vinculación:
                </p>
                <p className="text-[11px] bg-primary-50 text-primary-600 p-2 rounded-xl border border-primary-200">
                  💡 <strong>Nota Simulación SPA:</strong> Ingrese cualquier número de 6 dígitos (ej: <code className="font-bold text-primary-700 bg-white px-1.5 py-0.5 rounded">123456</code>) para simular el enrolamiento exitoso.
                </p>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-primary-50/50 border border-primary-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-neutral-900 focus:outline-none focus:border-primary-400"
                />

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setAuthStep('LOGIN')}
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-sm transition-all"
                  >
                    Volver al Inicio
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary-200"
                  >
                    Confirmar Enrolamiento
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="border-t border-neutral-200 pt-4 text-center">
            <p className="text-xs text-neutral-500 flex items-center justify-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" />
              <span>Protegido por StaticCrypt & Firebase App Check</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};