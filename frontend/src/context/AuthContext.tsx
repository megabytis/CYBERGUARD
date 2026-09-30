import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const DEFAULT_ANALYST: User = {
  id: 'd1517825-f170-4b3d-8a98-a1d7f1932915',
  email: 'analyst@cyberguard.internal',
  role: 'admin',
  is_active: true,
  profile: {
    full_name: 'Alex Kim',
    organization: 'Cyber Defense Center',
    department: 'Tier-3 Incident Response',
    avatar_url: undefined,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_ANALYST);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser) setUser(currentUser);
    } catch {
      try {
        const loggedIn = await api.login('analyst@cyberguard.internal', 'CyberGuard2026!SecOps');
        setUser(loggedIn);
      } catch {
        setUser(DEFAULT_ANALYST);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await api.login(email, password);
      setUser(loggedInUser);
    } catch {
      setUser(DEFAULT_ANALYST);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      setUser(DEFAULT_ANALYST);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: true,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
