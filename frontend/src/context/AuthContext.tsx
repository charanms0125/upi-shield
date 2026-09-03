import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  loginAsDemoUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('upishield_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('upishield_token'));

  useEffect(() => {
    if (token && !user) {
      authApi.getMe()
        .then(u => {
          setUser(u);
          localStorage.setItem('upishield_user', JSON.stringify(u));
        })
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', pass);
    const data = await authApi.login(formData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('upishield_token', data.access_token);
    localStorage.setItem('upishield_user', JSON.stringify(data.user));
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@upishield.demo', 'Admin@123');
  };

  const loginAsDemoUser = async () => {
    await login('user@upishield.demo', 'User@123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('upishield_token');
    localStorage.removeItem('upishield_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        login,
        loginAsDemoAdmin,
        loginAsDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
