import { Coffee } from 'lucide-react';

/**
 * Global Loading Component
 * Displays while pages are loading
 * Can be used by Next.js 13+ app router for loading states
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
      <div className="text-center">
        {/* Loading Animation */}
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6 animate-pulse">
          <Coffee className="h-10 w-10 text-white" />
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <div className="h-4 bg-amber-200 rounded w-32 mx-auto animate-pulse"></div>
          <div className="h-3 bg-amber-100 rounded w-24 mx-auto animate-pulse"></div>
        </div>
        
        {/* Loading Spinner */}
        <div className="mt-6">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
        </div>
        
        {/* Loading Message */}
        <p className="text-amber-600 font-medium mt-4">
          Loading your coffee experience...
        </p>
      </div>
    </div>
  );
}
