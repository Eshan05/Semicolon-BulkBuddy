'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDemoUser } from './demo-init';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'buyer' | 'supplier';
  company?: string;
  location?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  userType: 'buyer' | 'supplier';
  company?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    // Initialize demo user on first load
    initializeDemoUser();
    
    const storedUser = localStorage.getItem('bulkbuddy_user');
    const storedToken = localStorage.getItem('bulkbuddy_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('bulkbuddy_user');
        localStorage.removeItem('bulkbuddy_token');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('bulkbuddy_users') || '{}');
      if (existingUsers[data.email]) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        userType: data.userType,
        company: data.company,
        location: 'Pune MIDC', // Default location
        createdAt: new Date().toISOString(),
      };

      // Store user and password (in production, use proper hashing and backend)
      existingUsers[data.email] = {
        ...newUser,
        password: btoa(data.password), // Simple base64 encoding for demo
      };
      
      localStorage.setItem('bulkbuddy_users', JSON.stringify(existingUsers));
      
      // Create session
      const token = btoa(`${data.email}:${Date.now()}`);
      localStorage.setItem('bulkbuddy_token', token);
      localStorage.setItem('bulkbuddy_user', JSON.stringify(newUser));
      
      setUser(newUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const users = JSON.parse(localStorage.getItem('bulkbuddy_users') || '{}');
      const userData = users[email];

      if (!userData) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const storedPassword = userData.password;
      const encodedPassword = btoa(password);
      
      if (storedPassword !== encodedPassword) {
        throw new Error('Invalid email or password');
      }

      // Create session
      const token = btoa(`${email}:${Date.now()}`);
      const userWithoutPassword = { ...userData };
      delete userWithoutPassword.password;
      
      localStorage.setItem('bulkbuddy_token', token);
      localStorage.setItem('bulkbuddy_user', JSON.stringify(userWithoutPassword));
      
      setUser(userWithoutPassword);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('bulkbuddy_token');
      localStorage.removeItem('bulkbuddy_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
