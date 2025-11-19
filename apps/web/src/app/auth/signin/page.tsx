'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useSimpleAuth } from '../../../hooks/useSimpleAuth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { signIn, user, isLoading } = useSimpleAuth();

  // Auto-redirect when user is authenticated
  useEffect(() => {
    console.log('SignIn: useEffect triggered with:', { user, isLoading, userRole: user?.role });
    
    if (user && !isLoading) {
      console.log('SignIn: User state changed, redirecting:', user);
      console.log('SignIn: User role:', user.role);
      console.log('SignIn: User ID:', user.id);
      console.log('SignIn: User email:', user.email);
      
      setTimeout(() => {
        if (user.role === 'admin') {
          console.log('SignIn: Redirecting admin to /admin');
          router.push('/admin');
        } else if (user.role === 'seller') {
          console.log('SignIn: Redirecting seller to /seller-dashboard');
          // Redirect sellers to their dashboard instead of admin panel
          router.push('/seller-dashboard');
        } else {
          console.log('SignIn: Redirecting customer to /');
          router.push('/');
        }
      }, 1000);
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log('SignIn: Attempting to sign in with:', { email, password: '***' });
      
      const result = await signIn(email, password);

      console.log('SignIn: SignIn result:', result);

      if (result.success) {
        setSuccess('Sign in successful! Redirecting...');
        // The useEffect will handle the redirect when user state updates
        
        // Add a fallback redirect in case useEffect doesn't trigger
        setTimeout(() => {
          console.log('SignIn: Fallback redirect check - user state:', { user, isLoading });
          if (user && !isLoading) {
            console.log('SignIn: Fallback redirect triggered');
            if (user.role === 'seller') {
              router.push('/seller-dashboard');
            } else if (user.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/');
            }
          } else {
            console.log('SignIn: Fallback redirect failed - user not ready');
          }
        }, 2000);
      } else {
        setError(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('SignIn: Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <Coffee className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-400">
            Sign in to your Coffee Break account
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-amber-300 mb-2">Demo Credentials:</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="font-medium text-amber-200">Admin Users:</div>
              <div>admin@coffeebreak.com / password</div>
              
              <div className="font-medium text-amber-200 mt-3">Seller Users:</div>
              <div>seller@coffeebreak.com / password</div>
              <div>seller@premiumcoffee.com / password</div>
              <div>seller@mountainview.com / password</div>
              <div>liquidsoul@coffeebreak.com / password</div>
              <div>basic@coffeebreak.com / password</div>
              <div>premium@coffeebreak.com / password</div>
              <div>enterprise@coffeebreak.com / password</div>
              
              <div className="font-medium text-amber-200 mt-3">Customer Users:</div>
              <div>customer@example.com / password</div>
              <div>customer@coffeebreak.com / password</div>
            </div>
          </div>

          {/* Debug Information */}
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-300 mb-2">Debug Info:</h4>
            <div className="space-y-1 text-xs text-gray-400">
              <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
              <div><strong>User:</strong> {user ? `${user.name} (${user.role})` : 'None'}</div>
              <div><strong>Authenticated:</strong> {user ? 'Yes' : 'No'}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('Debug: Current auth state:', { user, isLoading, isAuthenticated: !!user });
                console.log('Debug: localStorage:', localStorage.getItem('coffee-break-user'));
              }}
              className="mt-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30"
            >
              Log State to Console
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-4">
          <div className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Sign up here
            </Link>
          </div>
          
          <div className="text-gray-400">
            <Link href="/" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
