'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// User interface
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName?: string;
  sellerId?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  uniqueSlug?: string; // Unique identifier for user-specific data
  adminId?: string; // Additional admin identifier
  customerId?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => void;
  isAuthenticated: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('coffee-break-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('coffee-break-user');
      }
    }
    setIsLoading(false);
  }, []);

  // Sign in function using our working simple auth route
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Save user to state and localStorage
        setUser(data.user);
        localStorage.setItem('coffee-break-user', JSON.stringify(data.user));
        
        // Ensure loading state is reset after user state is set
        setIsLoading(false);
        
        return { success: true, message: 'Sign in successful!' };
      } else {
        setIsLoading(false);
        return { success: false, message: data.message || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Sign out function
  const signOut = () => {
    setUser(null);
    localStorage.removeItem('coffee-break-user');
    
    // Redirect to home page after sign out
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useSimpleAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within an AuthProvider');
  }
  return context;
}
