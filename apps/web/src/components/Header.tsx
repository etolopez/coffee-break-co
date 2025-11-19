'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Coffee, User, LogOut, Menu, X, ArrowLeft, Crown } from 'lucide-react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import { useNavigationHistory } from '../hooks/useNavigationHistory';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
  showProfileButton?: boolean;
  useSmartBack?: boolean; // New prop to enable smart back navigation
}

/**
 * Reusable mobile-friendly header component
 * Handles authentication state and responsive navigation
 * Now supports intelligent back navigation using navigation history
 */
export default function Header({
  showBackButton = false,
  backHref = '/',
  backText = 'Back to Home',
  title = 'Coffee Break Co',
  subtitle = 'Digital Coffee Passport Platform',
  showNavigation = true,
  showProfileButton = true,
  useSmartBack = false // Default to false for backward compatibility
}: HeaderProps) {
  const { user, isAuthenticated, signOut } = useSimpleAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigationHistory = useNavigationHistory();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Smart back navigation logic
  const handleBackNavigation = useCallback(() => {
    if (useSmartBack && navigationHistory.canGoBack) {
      // Use intelligent back navigation
      const success = navigationHistory.goBack();
      if (!success) {
        // Fallback to default backHref if smart navigation fails
        router.push(backHref);
      }
    } else {
      // Use traditional navigation
      router.push(backHref);
    }
  }, [useSmartBack, navigationHistory, router, backHref]);

  // Get intelligent back button text
  const getBackButtonText = useCallback(() => {
    if (useSmartBack && navigationHistory.canGoBack) {
      const previousPage = navigationHistory.getPreviousPage();
      if (previousPage) {
        // Try to extract meaningful text from the path
        const path = previousPage.path;
        if (path === '/') return 'Back to Home';
        if (path === '/admin') return 'Back to Admin';
        if (path === '/seller-dashboard') return 'Back to Dashboard';
        if (path === '/coffees') return 'Back to Coffees';
        if (path === '/sellers') return 'Back to Sellers';
        if (path === '/client/profile') return 'Back to Profile';
        if (path.startsWith('/coffees/')) return 'Back to Coffee List';
        if (path.startsWith('/seller-profile/')) return 'Back to Seller';
        if (path.startsWith('/client/')) return 'Back to Client';
        if (path.startsWith('/auth/')) return 'Back to Authentication';
        
        // Fallback: extract from path
        const pathParts = path.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          // Capitalize and format the path part
          return `Back to ${lastPart.charAt(0).toUpperCase() + lastPart.slice(1)}`;
        }
      }
    }
    return backText;
  }, [useSmartBack, navigationHistory, backText]);

  // Check if we should show the back button
  const shouldShowBackButton = showBackButton || (useSmartBack && navigationHistory.canGoBack);

  return (
    <header className="relative border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Back button or Logo */}
          <div className="flex items-center space-x-4">
            {shouldShowBackButton ? (
              <div className="flex items-center space-x-2">
                {/* Back button */}
                <button
                  onClick={handleBackNavigation}
                  className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium hidden sm:inline">{getBackButtonText()}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Coffee className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <p className="text-xs sm:text-sm text-amber-600/70 font-medium">{subtitle}</p>
                </div>
              </div>
            )}
          </div>

          {/* Center - Navigation (visible on medium screens and up, mobile uses hamburger menu) */}
          {showNavigation && (
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-amber-700 hover:text-amber-900 transition-all duration-200 font-semibold relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/coffees" className="text-amber-700 hover:text-amber-900 transition-all duration-200 font-semibold relative group">
                Explore Coffees
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/sellers" className="text-amber-700 hover:text-amber-900 transition-all duration-200 font-semibold relative group">
                Our Sellers
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              {/* "Become a Seller" button removed from navbar - kept only on homepage */}
            </nav>
          )}

          {/* Right side - Auth buttons and mobile menu */}
          <div className="flex items-center space-x-3">
            {/* Profile button - only show icon when logged in */}
            {showProfileButton && isAuthenticated && (
              <Link 
                href={
                  user?.role === 'admin' ? '/admin' : 
                  user?.role === 'seller' ? '/seller-dashboard' : 
                  '/client/profile'
                } 
                className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                title={
                  user?.role === 'admin' ? 'Admin Panel' : 
                  user?.role === 'seller' ? 'Seller Dashboard' : 
                  'My Profile'
                }
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Desktop auth buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {/* Admin Management Link - Only for admin users */}
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin/management"
                      className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      <span>Management</span>
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-amber-700 hover:text-amber-900 transition-colors font-medium">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-amber-100 py-4">
            <nav className="flex flex-col space-y-3 mb-4">
              <Link 
                href="/" 
                className="text-amber-700 hover:text-amber-900 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/coffees" 
                className="text-amber-700 hover:text-amber-900 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Coffees
              </Link>
              <Link 
                href="/sellers" 
                className="text-amber-700 hover:text-amber-900 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Our Sellers
              </Link>
              {/* "Become a Seller" button removed from mobile menu - kept only on homepage */}
            </nav>
            
            {/* Mobile auth buttons */}
            <div className="flex flex-col space-y-3 pt-3 border-t border-amber-100">
              {isAuthenticated ? (
                <>
                  {/* Admin Management Link - Only for admin users */}
                  {user?.role === 'admin' && (
                    <Link 
                      href="/admin/management"
                      className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Admin Management
                    </Link>
                  )}
                  <Link 
                    href={
                      user?.role === 'admin' ? '/admin' : 
                      user?.role === 'seller' ? '/seller-dashboard' : 
                      '/client/profile'
                    } 
                    className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {
                      user?.role === 'admin' ? 'Admin Panel' : 
                      user?.role === 'seller' ? 'Seller Dashboard' : 
                      'My Profile'
                    }
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin" 
                    className="text-amber-700 hover:text-amber-900 transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

