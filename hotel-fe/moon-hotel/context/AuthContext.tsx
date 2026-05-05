import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, ApiResponse, Role } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  /** Load user from localStorage (fix F5) */
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('lux_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  /** Normalize user */
  const normalizeUser = (u: User): User => ({
    ...u,
    role: (u.role || '').toUpperCase() as Role
  });

  /** LOGIN */
  const login = (token: string, userData: User) => {
    const normalizedUser = normalizeUser(userData);

    localStorage.setItem('lux_token', token);
    localStorage.setItem('lux_user', JSON.stringify(normalizedUser));

    setUser(normalizedUser);
  };

  /** LOGOUT */
  const logout = async () => {
    try {
      await api.post('/auth/logout');  
    } catch {
      console.warn("Logout request failed.");
    }

    localStorage.removeItem('lux_token');
    localStorage.removeItem('lux_user');
    setUser(null);
  };

  /** CHECK AUTH (run when F5) */
  const checkAuth = async () => {
    const token = localStorage.getItem('lux_token');

    // ❗ KHÔNG xoá token — chỉ return nếu token sai
    if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');

      if (response.data.status === "success" && response.data.data) {
        const normalizedUser = normalizeUser(response.data.data);
        setUser(normalizedUser);
        localStorage.setItem('lux_user', JSON.stringify(normalizedUser));
      }

    } catch (err: any) {
      console.log("Auth check failed:", err?.response?.status);

      // Trường hợp 401 do JWT hết hạn → KHÔNG xoá localStorage
      if (err?.response?.status === 401) {
        console.warn("JWT expired → waiting for refresh interceptor");
        // Do nothing, chờ axios tự refresh token
      } else {
        // ❗ Chỉ xoá token nếu 403, 500 hoặc lỗi nghiêm trọng khác
        localStorage.removeItem('lux_token');
        localStorage.removeItem('lux_user');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** RUN ONE TIME on APP LOAD */
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
