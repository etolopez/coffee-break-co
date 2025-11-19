'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, MapPin, Award, Leaf, Shield, ArrowRight, Star, Users, Calendar, RefreshCw } from 'lucide-react';
import Header from '../../components/Header';

// Seller interface matching the API response
interface Seller {
  id: string;
  name: string;
  location: string;
  description: string;
  featuredCoffee: string;
  region: string;
  certifications: string[];
  rating: number;
  coffeeCount: number;
  memberSince: number;
  image: string;
  sellerPhoto?: string;
  specialties: string[];
  brandColor: string;
  logo?: string; // Added logo property
  coffees?: { id: string; name: string; origin: string; cuppingScore: string; available: boolean }[]; // Updated to remove pricing
}

/**
 * Sellers Page Component
 * Displays a dynamic list of all coffee sellers fetched from the API
 * Shows seller information including company details, ratings, and coffee offerings
 * Updates automatically when seller profiles are modified through the API
 * Includes refresh functionality to manually update data after profile edits
 */
export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch sellers data from API
  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sellers');
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('📊 Received sellers data:', result.data);
          console.log('📊 First seller:', result.data[0]);
          setSellers(result.data);
        } else {
          setError(result.error || 'Failed to load sellers data');
        }
      } else {
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching sellers:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sellers data on component mount
  useEffect(() => {
    fetchSellers();
  }, []);

  // Log placeholder usage when sellers data changes
  useEffect(() => {
    if (sellers.length > 0) {
      const sellersWithPlaceholders = sellers.filter(seller => !seller.logo);
      const sellersWithLogos = sellers.filter(seller => seller.logo);
      
      console.log(`📊 Sellers display summary: ${sellers.length} total, ${sellersWithLogos.length} with logos, ${sellersWithPlaceholders.length} using placeholders`);
      
      if (sellersWithPlaceholders.length > 0) {
        console.log(`🎨 Sellers using colored placeholders:`, sellersWithPlaceholders.map(s => s.name));
      }
    }
  }, [sellers]);

  // Auto-refresh when user returns to the page (e.g., after editing a seller profile)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh data when the page regains focus
      fetchSellers();
    };

    const handleVisibilityChange = () => {
      // Refresh data when the page becomes visible again
      if (!document.hidden) {
        fetchSellers();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSellers();
    setRefreshing(false);
  };

  /**
   * Helper function to generate unique colors for coffee cup placeholders
   * Ensures each seller has a distinct and visually appealing color scheme
   * @param sellerId - The seller's unique identifier
   * @returns Object with background and icon colors
   */
  const getPlaceholderColors = (sellerId: string) => {
    const colorSchemes = [
      { bg: 'from-amber-400 to-orange-500', icon: 'text-white', pattern: 'bg-amber-300/20' },
      { bg: 'from-emerald-400 to-teal-500', icon: 'text-white', pattern: 'bg-emerald-300/20' },
      { bg: 'from-blue-400 to-cyan-500', icon: 'text-white', pattern: 'bg-blue-300/20' },
      { bg: 'from-purple-400 to-indigo-500', icon: 'text-white', pattern: 'bg-purple-300/20' },
      { bg: 'from-pink-400 to-rose-500', icon: 'text-white', pattern: 'bg-pink-300/20' },
      { bg: 'from-green-400 to-emerald-500', icon: 'text-white', pattern: 'bg-green-300/20' },
      { bg: 'from-yellow-400 to-amber-500', icon: 'text-white', pattern: 'bg-yellow-300/20' },
      { bg: 'from-red-400 to-pink-500', icon: 'text-white', pattern: 'bg-red-300/20' },
      { bg: 'from-indigo-400 to-purple-500', icon: 'text-white', pattern: 'bg-indigo-300/20' },
      { bg: 'from-cyan-400 to-blue-500', icon: 'text-white', pattern: 'bg-cyan-300/20' }
    ];
    
    // Use the seller ID to consistently assign colors
    const colorIndex = parseInt(sellerId.replace(/\D/g, '')) % colorSchemes.length;
    return colorSchemes[colorIndex] || colorSchemes[0];
  };

  /**
   * Helper function to get a simple background color as fallback
   * Ensures placeholders are always visible even if gradients fail
   */
  const getFallbackColor = (sellerId: string) => {
    const fallbackColors = [
      'bg-amber-500',
      'bg-emerald-500', 
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-cyan-500'
    ];
    
    const colorIndex = parseInt(sellerId.replace(/\D/g, '')) % fallbackColors.length;
    return fallbackColors[colorIndex] || fallbackColors[0];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sellers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <Coffee className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Sellers</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={handleRefresh} 
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-amber-700 text-sm font-semibold rounded-full mb-6 border border-amber-200/50 shadow-lg">
              <Users className="h-5 w-5 mr-2 text-amber-500" />
              Meet Our Coffee Sellers
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="block text-gray-900">Discover Amazing</span>
              <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Coffee Stories
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl font-light text-gray-700/80 mb-4 leading-relaxed">
              From family farms to premium estates
            </p>
            <p className="text-lg lg:text-xl text-gray-600/70 mb-0 max-w-4xl mx-auto leading-relaxed">
              Each seller on our platform brings unique coffee experiences, complete with full traceability, 
              farmer stories, and sustainable practices. Explore their offerings and find your perfect cup.
            </p>
          </div>
        </div>
      </section>

      {/* Sellers Grid */}
      <section className="py-4 lg:py-8 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Refresh Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-white text-amber-700 font-medium rounded-lg hover:bg-amber-50 transition-colors border border-amber-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh sellers data to see latest updates including logo changes"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Sellers Grid with Consistent Heights */}
          {/* Each card has a fixed height of 500px to ensure visual consistency */}
          {/* Content is anchored to bottom with flexbox, and descriptions are truncated with fade effect */}
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {sellers.map((seller) => (
              <div key={seller.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer h-[500px] flex flex-col">
                <div className="p-5 flex flex-col h-full">
                  {/* Header with company name and logo */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {seller.name || `Seller ${seller.id}`}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {/* Location is calculated by the API to prioritize city/country over location field */}
                        {seller.location || 'Location TBD'}
                      </div>
                      {/* Rating and coffee count - using full width with justify-between for consistent spacing */}
                      <div className="flex items-center justify-between w-full mb-3">
                        {(seller.rating || 0) > 0 ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                            <span className="text-sm font-semibold text-gray-900 ml-1">{(seller.rating || 0).toFixed(1)}</span>
                            <span className="text-xs text-gray-500 ml-1">/5</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-gray-300" />
                            <span className="text-sm text-gray-500 ml-1">New</span>
                          </div>
                        )}
                        
                        {/* Coffee count and customer rating - grouped together on the right side */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{seller.coffeeCount || 0} coffee{(seller.coffeeCount || 0) !== 1 ? 's' : ''}</span>
                          {(seller.coffeeCount || 0) > 0 && (
                            <>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-xs text-gray-500">Customer Rating</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ml-3 overflow-hidden flex-shrink-0 transition-all duration-300 hover:scale-105 hover:shadow-xl relative group ${seller.logo ? 'bg-white' : `bg-gradient-to-br ${getPlaceholderColors(seller.id).bg} ${getFallbackColor(seller.id)}`}`}
                      title={seller.logo ? `${seller.name} logo` : `${seller.name} coffee cup placeholder`}
                      role="img"
                      aria-label={seller.logo ? `${seller.name} company logo` : `${seller.name} coffee cup placeholder icon`}
                      tabIndex={0}
                      onMouseEnter={() => {
                        // Debug logging on hover
                        if (!seller.logo) {
                          const colors = getPlaceholderColors(seller.id);
                          const fallback = getFallbackColor(seller.id);
                          console.log(`🎨 ${seller.name} placeholder colors:`, colors);
                          console.log(`🎨 Fallback color:`, fallback);
                          console.log(`🎨 Applied CSS: bg-gradient-to-br ${colors.bg} ${fallback}`);
                          console.log(`🎨 Full className:`, `w-14 h-14 bg-gradient-to-br ${colors.bg} ${fallback} rounded-2xl flex items-center justify-center shadow-lg ml-3 overflow-hidden flex-shrink-0 transition-all duration-300 hover:scale-105 hover:shadow-xl relative group`);
                          console.log(`🎨 Element classes:`, document.activeElement?.className);
                        }
                      }}
                    >
                      {seller.logo ? (
                        <img 
                          src={seller.logo} 
                          alt={`${seller.name} logo`}
                          className="w-12 h-12 object-contain rounded-xl"
                          onError={(e) => {
                            // Fallback to placeholder if logo fails to load
                            console.log(`🖼️ Logo failed to load for ${seller.name}, showing placeholder`);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {/* Coffee cup placeholder - always present but hidden when logo is shown */}
                      <Coffee 
                        className={`h-7 w-7 ${seller.logo ? 'hidden' : ''} ${getPlaceholderColors(seller.id).icon} drop-shadow-sm relative z-10 transition-transform duration-200 group-hover:scale-110`}
                        aria-hidden="true"
                      />
                      {/* Subtle pattern overlay for placeholders */}
                      {!seller.logo && (
                        <div className={`absolute inset-0 ${getPlaceholderColors(seller.id).pattern} opacity-30 rounded-2xl transition-opacity duration-200 group-hover:opacity-50`} aria-hidden="true"></div>
                      )}
                      {/* Subtle indicator for placeholders */}
                      {!seller.logo && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/80 rounded-full border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20" aria-hidden="true"></div>
                      )}
                    </div>
                  </div>

                  {/* Specialty tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.from(new Set([
                      ...(seller.certifications || []), 
                      ...(seller.specialties || [])
                    ])).slice(0, 4).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag === 'Organic' && <Leaf className="h-3 w-3 mr-1 text-green-600" />}
                        {tag === 'Fair Trade' && <Award className="h-3 w-3 mr-1 text-amber-600" />}
                        {tag === 'Rainforest Alliance' && <Shield className="h-3 w-3 mr-1 text-green-600" />}
                        {tag === 'Direct Trade' && <Shield className="h-3 w-3 mr-1 text-blue-600" />}
                        {tag === 'Ocean Positive' && <Shield className="h-3 w-3 mr-1 text-cyan-600" />}
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description with fade effect and truncation */}
                  <div className="relative mb-3 flex-grow">
                    <p className="text-gray-700 leading-relaxed line-clamp-3">
                      {seller.description || 'Premium coffee seller with exceptional quality and sustainable practices.'}
                    </p>
                    {/* Fade effect overlay for long descriptions */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                  </div>
                  
                  {/* Spacer to push content to bottom */}
                  <div className="flex-grow"></div>
                  
                  {/* Featured Coffee or Coming Soon - Fixed to bottom */}
                  {(seller.coffeeCount || 0) > 0 ? (
                    <div className="bg-amber-50 rounded-lg p-3 mb-3">
                      <div className="text-xs font-semibold text-amber-700 mb-1">Featured Coffee</div>
                      <div className="font-medium text-gray-900">{seller.featuredCoffee || 'Premium Selection'}</div>
                      <div className="text-sm text-amber-600">{seller.region || 'Multiple Origins'}</div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-lg p-3 mb-3">
                      <div className="text-xs font-semibold text-amber-700 mb-1">Featured Coffee</div>
                      <div className="font-medium text-amber-700">Coming Soon</div>
                      <div className="text-sm text-amber-600">No coffees yet</div>
                    </div>
                  )}

                  {/* Footer - Fixed to bottom */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-500">Member since {seller.memberSince || 'Recently'}</span>
                    <Link 
                      href={`/seller-coffees/${seller.id}`} 
                      className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
                    >
                      View Coffees →
                    </Link>
                  </div>
                  
                  {/* Seller Info Button - Fixed to bottom */}
                  <Link 
                    href={`/seller-profile/${seller.id}`} 
                    className="inline-flex items-center px-4 py-2 bg-black/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-black/30 transition-all duration-200 border border-white/20 shadow-lg hover:shadow-xl"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Seller Info
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-block p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Want to Join Our Platform?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Showcase your coffee to coffee lovers worldwide. Create beautiful digital passports, 
                share your story, and build trust with complete traceability.
              </p>
              <Link 
                href="/subscriptions" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Coffee className="h-5 w-5 mr-2" />
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
              Coffee Break Co
            </span>
          </div>
          <p className="text-gray-300 mb-8">Digital Coffee Passport Platform</p>
          <div className="flex justify-center space-x-8 mb-8">
            <Link href="/" className="text-gray-300 hover:text-amber-200 transition-colors">Home</Link>
            <Link href="/coffees" className="text-gray-300 hover:text-amber-200 transition-colors">Explore Coffees</Link>
            <Link href="/sellers" className="text-gray-300 hover:text-amber-200 transition-colors">Our Sellers</Link>
            <Link href="/admin" className="text-gray-300 hover:text-amber-200 transition-colors">Seller Login</Link>
          </div>
          <p className="text-gray-400">&copy; 2024 Coffee Break Co. Built with ❤️ for coffee excellence.</p>
        </div>
      </footer>
    </div>
  );
}