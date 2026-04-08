import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('igcim_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(() => localStorage.getItem('igcim_token') || null);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    
    // Check if 2FA is required for Super Admins
    if (res.data.data?.require2FA) {
      return { require2FA: true, email: res.data.data.email };
    }

    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('igcim_token', newToken);
    localStorage.setItem('igcim_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const verify2FA = useCallback(async (email, otp) => {
    const res = await api.post('/auth/verify-2fa', { email, otp });
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('igcim_token', newToken);
    localStorage.setItem('igcim_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (e) { /* ignore network error on logout */ }
    localStorage.removeItem('igcim_token');
    localStorage.removeItem('igcim_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('igcim_user', JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  const isAuthenticated = !!token && !!user;

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, verify2FA, logout, updateUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
