import Link from 'next/link';
import { Coffee, Home, ArrowLeft, Search } from 'lucide-react';

/**
 * Not Found Component
 * Displays when a page or route is not found
 * Required by Next.js 13+ app router
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
          <Coffee className="h-10 w-10 text-white" />
        </div>
        
        {/* 404 Message */}
        <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Home
          </Link>
          
          <Link
            href="/coffees"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Coffees
          </Link>
        </div>
        
        {/* Quick Navigation */}
        <div className="mt-8 p-4 bg-white/50 rounded-xl border border-amber-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Navigation</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/sellers"
              className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Our Sellers
            </Link>
            <Link
              href="/coffees"
              className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Explore Coffees
            </Link>
            <Link
              href="/auth/signin"
              className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/admin"
              className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
        
        {/* Search Suggestion */}
        <div className="mt-6 text-sm text-gray-500">
          <p className="flex items-center justify-center">
            <Search className="h-4 w-4 mr-2" />
            Try searching for what you're looking for
          </p>
        </div>
      </div>
    </div>
  );
}
