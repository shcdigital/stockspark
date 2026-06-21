import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';
import { LocalDB } from '../services/firebase';

interface LoginResult {
  step: 'SUCCESS' | 'REQUIRE_2FA' | 'SETUP_2FA';
  user?: UserProfile;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<LoginResult>;
  verify2FA: (code: string) => Promise<boolean>;
  setup2FA: (code: string) => Promise<boolean>;
  logout: () => void;
  tempUser: UserProfile | null;
  error: string | null;
  setError: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('stockspark_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [tempUser, setTempUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, pass: string): Promise<LoginResult> => {
    setError(null);
    const users = LocalDB.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      setError('Credenciales incorrectas o usuario inexistente.');
      throw new Error('No encontrado');
    }

    if (!found.activo) {
      setError('Esta cuenta de usuario ha sido desactivada por el Administrador.');
      throw new Error('Cuenta inactiva');
    }

    // Verificar allowlist
    const config = LocalDB.getConfig();
    if (!config.allowedEmails.map(e => e.toLowerCase()).includes(found.email.toLowerCase())) {
      setError('Acceso denegado: El correo no pertenece a la Allowlist autorizada en Firestore Rules.');
      throw new Error('No en allowlist');
    }

    if (pass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      throw new Error('Contraseña corta');
    }

    setTempUser(found);

    if (found.mfaHabilitado) {
      return { step: 'REQUIRE_2FA', user: found };
    } else {
      return { step: 'SETUP_2FA', user: found };
    }
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    if (!tempUser) return false;
    if (/^\d{6}$/.test(code)) {
      setCurrentUser(tempUser);
      localStorage.setItem('stockspark_session', JSON.stringify(tempUser));
      setTempUser(null);
      return true;
    } else {
      setError('Código TOTP de 6 dígitos inválido. Intente de nuevo.');
      return false;
    }
  };

  const setup2FA = async (code: string): Promise<boolean> => {
    if (!tempUser) return false;
    if (/^\d{6}$/.test(code)) {
      const updatedUser = { ...tempUser, mfaHabilitado: true, mfaSecret: 'TOTP_SECRET_NEW' };
      
      const users = LocalDB.getUsers();
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      LocalDB.saveUsers(updatedUsers);

      setCurrentUser(updatedUser);
      localStorage.setItem('stockspark_session', JSON.stringify(updatedUser));
      setTempUser(null);
      return true;
    } else {
      setError('Código de confirmación inválido. Verifique su app autenticadora.');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setTempUser(null);
    localStorage.removeItem('stockspark_session');
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.rol === 'Admin',
    login,
    verify2FA,
    setup2FA,
    logout,
    tempUser,
    error,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
};
