import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { GET_ME } from '../apollo/queries';
import { User } from '../types';
import {jwtDecode} from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const [getMe, { data: meData, loading: meLoading, error: meError }] = useLazyQuery<{ me: User }>(GET_ME);

  useEffect(() => {
    if (meData) {
      setUser(meData.me);
      setIsLoading(false);
    } else if (meError) {
      console.error('Failed to fetch user:', meError);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    } else if (!meLoading && !token) {
      setIsLoading(false);
    }
  }, [meData, meError, meLoading, token]);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          logout();
        } else {
          getMe();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      setIsLoading(false);
    }
  }, [token, getMe]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    getMe();
  };

  const isAdmin = user?.userType?.toLowerCase() === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
