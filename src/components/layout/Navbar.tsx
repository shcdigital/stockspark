import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStock } from '../../context/StockContext';
import { LogOut, Wifi, WifiOff, User } from 'lucide-react';

// Logo del negocio - placeholder URL (debe reemplazarse con el logo real)
const BUSINESS_LOGO = 'https://placehold.co/32x32/f0fdfa/14b8a6?text=S';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isOffline } = useStock();

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-neutral-200 text-neutral-900 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Security Badge */}
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-xl overflow-hidden border border-primary-200 shadow-sm">
              <img src={BUSINESS_LOGO} alt="Logo del Negocio" className="h-7 w-7 object-cover" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-primary-700">
                StockSpark Pro
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full border border-primary-200 font-medium">
                Firestore Spark
              </span>
            </div>
          </div>

          {/* User Status & Actions */}
          <div className="flex items-center space-x-4">
            {/* Offline/Online Badge */}
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
              isOffline 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isOffline ? (
                <>
                  <WifiOff className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  <span>Modo Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  <span>En Línea</span>
                </>
              )}
            </div>

            {currentUser && (
              <div className="flex items-center space-x-3 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200">
                <div className="bg-primary-100 p-1 rounded-full text-primary-600">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-neutral-900 leading-tight">{currentUser.nombre}</p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      currentUser.rol === 'Admin' ? 'bg-primary-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {currentUser.rol}
                    </span>
                    {currentUser.mfaHabilitado && (
                      <span className="text-[10px] bg-sky-100 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded-full font-semibold">
                        2FA
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-neutral-500 hover:text-secondary-500 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};