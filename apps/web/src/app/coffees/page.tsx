'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, MapPin, Calendar, Thermometer, Droplets, Award, Users, Leaf, QrCode, ArrowLeft, ExternalLink, Star, Filter, Sparkles, Crown, User, LogOut, Bookmark, BookmarkCheck } from 'lucide-react';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';
// import { useSavedCoffees } from '../../hooks/useSavedCoffees';
import Header from '../../components/Header';
import { Toast } from '../../components/Toast';

// Define interfaces for coffee data structure
interface CoffeeEntry {
  id: string;
  coffeeName: string;
  origin: string;
  farm: string;
  farmer: string;
  altitude: string;
  variety: string;
  process: string;
  harvestDate: string;
  processingDate: string;
  cuppingScore: string;
  notes: string;
  qrCode?: string;
  slug?: string;
  farmSize: string;
  workerCount: string;
  certifications: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  farmImage?: string;
  farmerImage?: string;
  producerName?: string;
  producerPortrait?: string;
  producerBio?: string;
  roastedBy?: string;
  fermentationTime: string;
  dryingTime: string;
  moistureContent: string;
  screenSize: string;
  beanDensity?: string;
  aroma: string;
  flavor: string;
  acidity: string;
  body: string;
  primaryNotes: string;
  secondaryNotes: string;
  finish: string;
  roastRecommendation: string;
  roastDevelopmentCurve?: string;
  environmentalPractices: string[];
  fairTradePremium: string;
  communityProjects: string;
  womenWorkerPercentage: string;
  available?: boolean;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CoffeesPage() {
  console.log('🚀 CoffeesPage component rendering...');
  
  // State management for coffee data and filtering
  const [coffees, setCoffees] = useState<CoffeeEntry[]>([]);
  const [featuredCoffee, setFeaturedCoffee] = useState<CoffeeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'default' | 'location' | 'specialty'>('default');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [coffeeRatings, setCoffeeRatings] = useState<{[key: string]: {rating: number, count: number}}>({});
  
  // Add a timeout to help debug loading issues
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Loading timeout reached - there may be a JavaScript error');
        console.log('Current state:', { coffees: coffees.length, loading, featuredCoffee: !!featuredCoffee });
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, [loading, coffees.length, featuredCoffee]);
  
  // Authentication
  // const { user, isAuthenticated, signOut } = useSimpleAuth();
  
  // Use the custom hook for saved coffees management
  // const { 
  //   savedCoffees, 
  //   toggleSavedCoffee, 
  //   loading: savedCoffeesLoading 
  // } = useSavedCoffees(user?.id);
  
  // const [savingCoffees, setSavingCoffees] = useState<{[key: string]: boolean}>({});
  
  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Fetch coffee data from API
  useEffect(() => {
    const fetchCoffees = async () => {
      try {
        console.log('🔄 Fetching coffees from API...');
        const response = await fetch('/api/coffee-entries');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📡 API Response:', result);
        
        // Handle different API response formats
        const data = result.success ? result.data : result;
        console.log('🔍 Extracted data:', data);
        
        // API now returns data directly (no more nested structure)
        const coffeeData = data;
        console.log('☕ Coffee data:', coffeeData);
        console.log('📊 Data type:', typeof coffeeData);
        console.log('📊 Is array:', Array.isArray(coffeeData));
        console.log('📊 Length:', coffeeData?.length);
        
        if (Array.isArray(coffeeData)) {
          console.log('✅ Setting coffees state with', coffeeData.length, 'entries');
          setCoffees(coffeeData);
          
          // Select random featured coffee
          if (coffeeData.length > 0) {
            const randomIndex = Math.floor(Math.random() * coffeeData.length);
            setFeaturedCoffee(coffeeData[randomIndex]);
            console.log('⭐ Featured coffee set:', coffeeData[randomIndex].coffeeName);
          }
        } else {
          console.error('❌ Invalid data format received from API:', data);
          setCoffees([]);
        }
        
        setLoading(false);
        console.log('🏁 Loading state set to false');
      } catch (error) {
        console.error('❌ Error fetching coffees:', error);
        setCoffees([]); // Set to empty array on error
        setLoading(false);
      }
    };

    fetchCoffees();
  }, []);

  // Fetch ratings for all coffees
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const ratingsPromises = coffees.map(async (coffee) => {
          const response = await fetch(`/api/comments?coffeeId=${coffee.id}`);
          const result = await response.json();
          
          if (result.success && result.data.length > 0) {
            const totalRating = result.data.reduce((sum: number, comment: any) => sum + (comment.rating || 0), 0);
            const averageRating = totalRating / result.data.length;
            return { coffeeId: coffee.id, rating: averageRating, count: result.data.length };
          }
          return { coffeeId: coffee.id, rating: 0, count: 0 };
        });
        
        const ratings = await Promise.all(ratingsPromises);
        const ratingsMap: {[key: string]: {rating: number, count: number}} = {};
        ratings.forEach(r => {
          ratingsMap[r.coffeeId] = { rating: r.rating, count: r.count };
        });
        
        setCoffeeRatings(ratingsMap);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    if (coffees.length > 0) {
      fetchRatings();
    }
  }, [coffees]);

  // The useSavedCoffees hook automatically handles loading saved coffees
  // No need for manual loading here

  /**
   * Handles saving/unsaving a coffee for the authenticated user
   */
  const handleSaveCoffee = async (coffee: CoffeeEntry) => {
    // if (!isAuthenticated || !user) {
    //   setToast({
    //     message: 'Please sign in to save coffees',
    //     type: 'error',
    //     isVisible: true
    //   });
    //   return;
    // }

    // const isCurrentlySaved = savedCoffees.includes(coffee.id);
    // setSavingCoffees(prev => ({ ...prev, [coffee.id]: true }));
    
    // try {
    //   const success = await toggleSavedCoffee(coffee.id, {
    //     coffeeName: coffee.coffeeName,
    //     origin: coffee.origin,
    //     farm: coffee.farm,
    //     farmer: coffee.farmer,
    //     process: coffee.process,
    //     cuppingScore: coffee.cuppingScore,
    //     notes: coffee.notes
    //   });
      
    //   if (success) {
    //     if (isCurrentlySaved) {
    //       setToast({
    //         message: 'Coffee removed from saved list',
    //         type: 'success',
    //         isVisible: true
    //       });
    //     } else {
    //       setToast({
    //         message: 'Coffee saved to your profile!',
    //         type: 'success',
    //         isVisible: true
    //       });
    //     }
    //   } else {
    //     setToast({
    //       message: 'Failed to update saved coffee list',
    //       type: 'error',
    //       isVisible: true
    //     });
    //   }
    // } catch (error) {
    //   console.error('Error saving coffee:', error);
    //   setToast({
    //     message: 'Failed to save coffee. Please try again.',
    //     type: 'error',
    //     isVisible: true
    //   });
    // } finally {
    //   setSavingCoffees(prev => ({ ...prev, [coffee.id]: false }));
    // }
  };

  // Extract unique specialties and countries for filtering
  const getUniqueFilters = () => {
    const specialties = new Set<string>();
    const countries = new Set<string>();
    
    coffees.forEach(coffee => {
      // Add certifications and process types as specialties
      if (coffee.certifications && Array.isArray(coffee.certifications)) {
        coffee.certifications.forEach(cert => specialties.add(cert));
      }
      if (coffee.process) specialties.add(coffee.process);
      if (coffee.variety) specialties.add(coffee.variety);
      
      // Extract country from origin (e.g., "Yirgacheffe, Ethiopia" -> "Ethiopia")
      if (coffee.origin && typeof coffee.origin === 'string') {
        const parts = coffee.origin.split(',').map(part => part.trim());
        if (parts.length > 1) {
          // If origin has comma, take the last part as country
          const country = parts[parts.length - 1];
          if (country) countries.add(country);
        } else if (parts.length === 1) {
          // If no comma, treat the whole thing as country
          countries.add(parts[0]);
        }
      }
    });
    
    return {
      specialties: Array.from(specialties),
      countries: Array.from(countries).sort() // Sort countries alphabetically
    };
  };

  const { specialties, countries } = getUniqueFilters();
  const allFilters = ['All', ...specialties, ...countries];

  // Filter and sort coffees based on selected criteria
  const getFilteredAndSortedCoffees = () => {
    let filtered = coffees;
    
    // Apply filter
    if (selectedFilter !== 'All') {
      filtered = coffees.filter(coffee => {
        // Safe checking for certifications
        const hasCertification = coffee.certifications && Array.isArray(coffee.certifications) && 
          coffee.certifications.includes(selectedFilter);
        
        // Safe checking for process and variety
        const hasProcess = coffee.process === selectedFilter;
        const hasVariety = coffee.variety === selectedFilter;
        
        // Enhanced country filtering - check if the filter matches the country part of origin
        const hasCountry = coffee.origin && typeof coffee.origin === 'string' && 
          (() => {
            const parts = coffee.origin.split(',').map(part => part.trim());
            if (parts.length > 1) {
              // If origin has comma, check if filter matches the country (last part)
              return parts[parts.length - 1] === selectedFilter;
            } else {
              // If no comma, check if filter matches the whole origin
              return parts[0] === selectedFilter;
            }
          })();
        
        return hasCertification || hasProcess || hasVariety || hasCountry;
      });
    }
    
    // Apply sorting with safe comparisons
    if (sortBy === 'location') {
      filtered.sort((a, b) => {
        const originA = a.origin || '';
        const originB = b.origin || '';
        return originA.localeCompare(originB);
      });
    } else if (sortBy === 'specialty') {
      filtered.sort((a, b) => {
        const varietyA = a.variety || '';
        const varietyB = b.variety || '';
        return varietyA.localeCompare(varietyB);
      });
    }
    
    return filtered;
  };

  const filteredCoffees = getFilteredAndSortedCoffees();

  if (loading) {
    console.log('🔄 Rendering loading state...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          Loading coffee collection... 
          <br />
          <small className="text-gray-400">
            If this takes too long, there may be a JavaScript error.
            <br />
            Check the browser console for details.
          </small>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering coffees page with:', {
    coffeesCount: coffees.length,
    filteredCount: filteredCoffees.length,
    featuredCoffee: featuredCoffee?.coffeeName,
    selectedFilter,
    sortBy
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-amber-300 text-sm font-semibold rounded-full mb-8 border border-white/20 shadow-lg">
              <Sparkles className="h-5 w-5 mr-2 text-amber-400" />
              Premium Coffee Collection
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="block text-white">Discover</span>
              <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Exceptional Coffees
              </span>
            </h1>
            
            <p className="text-2xl lg:text-3xl font-light text-gray-300 mb-6 leading-relaxed">
              From farm to cup, every coffee tells a story
            </p>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Explore our curated collection of premium coffees from around the world, each with complete traceability 
              and detailed profiles showing their unique journey.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Coffee Section */}
      {featuredCoffee && (
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm text-amber-300 text-sm font-semibold rounded-full mb-6 border border-amber-400/30 shadow-lg">
                <Crown className="h-5 w-5 mr-2 text-amber-400" />
                Featured Coffee
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Today's Premium Selection</h2>
              <p className="text-gray-400 text-lg">Handpicked for exceptional quality and unique character</p>
            </div>

            {/* Featured Coffee Card with enhanced glassmorphism */}
            <div className="max-w-4xl mx-auto">
              <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10">
                {/* Customer Rating Badge instead of Premium */}
                {(() => {
                  const rating = coffeeRatings[featuredCoffee.id];
                  if (rating && rating.count > 0) {
                    return (
                      <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{rating.rating.toFixed(1)}</span>
                      </div>
                    );
                  }
                  return (
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-gray-500 to-slate-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      New
                    </div>
                  );
                })()}
                
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">{featuredCoffee.coffeeName}</h3>
                    <div className="flex items-center text-amber-300 mb-4">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span className="text-lg">{featuredCoffee.origin}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="text-amber-400 text-sm font-semibold mb-1">Cupping Score</div>
                        <div className="text-2xl font-bold text-white">{featuredCoffee.cuppingScore}/100</div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="text-amber-400 text-sm font-semibold mb-1">Process</div>
                        <div className="text-white font-medium">{featuredCoffee.process}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">{featuredCoffee.notes}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {featuredCoffee.certifications.map((cert, index) => (
                        <span key={index} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-400/30">
                          {cert}
                        </span>
                      ))}
                    </div>
                    
                                                              <Link 
                      href={`/coffees/${featuredCoffee.slug || featuredCoffee.id}`}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Coffee className="h-5 w-5 mr-2" />
                      Explore This Coffee
                    </Link>
                  </div>
                  
                  {/* Coffee visualization */}
                  <div className="relative">
                    <div className="w-full h-80 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center">
                                      <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <QRCodeDisplay
                      value={`${window.location.origin}/coffees/${featuredCoffee.slug || featuredCoffee.id}`}
                      size={96}
                      bgColor="#FEF3C7"
                      fgColor="#92400E"
                      level="M"
                      showBorder={false}
                    />
                  </div>
                  <p className="text-amber-700 font-medium">QR: {featuredCoffee.qrCode}</p>
                  <p className="text-xs text-amber-600 mt-1">Scan to view details</p>
                </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters and Sorting */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="default">Default</option>
                  <option value="location">Location</option>
                  <option value="specialty">Specialty</option>
                </select>
              </div>
              
              {/* Filter Options */}
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">Filter by:</span>
                <div className="flex flex-wrap gap-2">
                  {/* All filter button */}
                  <button
                    onClick={() => setSelectedFilter('All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedFilter === 'All'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                    }`}
                  >
                    All Coffees
                  </button>
                  
                  {/* Country filters - show first 4 countries */}
                  {countries.slice(0, 4).map((country) => (
                    <button
                      key={country}
                      onClick={() => setSelectedFilter(country)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedFilter === country
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                      }`}
                    >
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {country}
                    </button>
                  ))}
                  
                  {/* Specialty filters - show first 2 specialties */}
                  {specialties.slice(0, 2).map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => setSelectedFilter(specialty)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedFilter === specialty
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                      }`}
                    >
                      <Award className="h-3 w-3 inline mr-1" />
                      {specialty}
                    </button>
                  ))}
                </div>
                
                {/* Show More Filters Button */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowAllFilters(!showAllFilters)}
                    className="px-6 py-2 bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>{showAllFilters ? 'Show Less' : `Show All Filters (${countries.length + specialties.length} total)`}</span>
                  </button>
                </div>
                
                {/* Expanded Filters */}
                {showAllFilters && (
                  <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* All Countries */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          All Countries ({countries.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {countries.map((country) => (
                            <button
                              key={country}
                              onClick={() => setSelectedFilter(country)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                selectedFilter === country
                                  ? 'bg-amber-500 text-white shadow-lg'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                              }`}
                            >
                              {country}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* All Specialties */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          All Specialties ({specialties.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {specialties.map((specialty) => (
                            <button
                              key={specialty}
                              onClick={() => setSelectedFilter(specialty)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                selectedFilter === specialty
                                  ? 'bg-amber-500 text-white shadow-lg'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                              }`}
                            >
                              {specialty}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coffee Grid */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Premium Coffee Collection</h2>
            <p className="text-gray-400 text-lg">
              {filteredCoffees.length} coffee{filteredCoffees.length !== 1 ? 's' : ''} 
              {selectedFilter !== 'All' && (
                <>
                  {countries.includes(selectedFilter) ? (
                    <span>from <span className="text-amber-300 font-semibold">{selectedFilter}</span></span>
                  ) : (
                    <span>featuring <span className="text-amber-300 font-semibold">{selectedFilter}</span></span>
                  )}
                </>
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCoffees.map((coffee) => (
              <Link key={coffee.id} href={`/coffees/${coffee.slug || coffee.id}`}>
                <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:scale-[1.03] hover:bg-white/10 cursor-pointer">
                  {/* Coffee Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                          {coffee.coffeeName}
                        </h3>
                        <div className="flex items-center text-amber-300 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{coffee.origin}</span>
                        </div>
                      </div>
                      
                      {/* Save Button - Only show for authenticated customers */}
                      {/* {isAuthenticated && user?.role === 'customer' && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSaveCoffee(coffee);
                          }}
                          disabled={savingCoffees[coffee.id as string]}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            false // savedCoffees.includes(coffee.id)
                              ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                              : 'text-amber-300 hover:text-amber-200 hover:bg-amber-900/20'
                          }`}
                          title={false ? 'Remove from saved' : 'Save coffee'} // savedCoffees.includes(coffee.id)
                        >
                          {savingCoffees[coffee.id as string] ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : false ? ( // savedCoffees.includes(coffee.id)
                            <BookmarkCheck className="h-5 w-5" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </button>
                      )} */}
                      
                      {/* Seller Logo */}
                      <div className={`w-12 h-12 rounded-xl overflow-hidden shadow-lg flex items-center justify-center ml-4 ${
                        coffee.sellerId === '1' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                        coffee.sellerId === '2' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                        coffee.sellerId === '3' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                        coffee.sellerId === '4' ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
                        coffee.sellerId === '5' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                        coffee.sellerId === '6' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                        'bg-gradient-to-br from-gray-500 to-slate-600'
                      }`}>
                        {/* TODO: Replace with seller logo/image when available */}
                        <Coffee className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Score and Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="text-amber-400 text-xs font-semibold mb-1">Score</div>
                        <div className="text-lg font-bold text-white">{coffee.cuppingScore}</div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="text-amber-400 text-xs font-semibold mb-1">Altitude</div>
                        <div className="text-sm text-white">{coffee.altitude}</div>
                      </div>
                    </div>

                    {/* Customer Rating */}
                    {(() => {
                      const rating = coffeeRatings[coffee.id];
                      if (rating && rating.count > 0) {
                        return (
                          <div className="mb-4 p-3 bg-yellow-500/10 backdrop-blur-sm rounded-lg border border-yellow-400/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < Math.round(rating.rating) 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-400'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-yellow-300 text-sm font-medium">
                                  {rating.rating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-yellow-400 text-xs">
                                ({rating.count} review{rating.count !== 1 ? 's' : ''})
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Tasting Notes */}
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {coffee.notes}
                    </p>

                    {/* Certifications */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {coffee.certifications.slice(0, 2).map((cert, index) => (
                        <span key={index} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-400/30">
                          {cert}
                        </span>
                      ))}
                      {coffee.certifications.length > 2 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-400/30">
                          +{coffee.certifications.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Farm Details */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 mb-4">
                      <div className="text-amber-400 text-xs font-semibold mb-1">Farm & Producer</div>
                      <div className="text-sm text-white font-medium">{coffee.farm}</div>
                      <div className="text-xs text-gray-400">{coffee.farmer}</div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-amber-400 text-sm font-medium">{coffee.process} Process</span>
                      <div className="text-amber-300 font-medium group-hover:text-amber-200 transition-colors">
                        View Details →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* No results message */}
          {filteredCoffees.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Coffee className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No coffees found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search criteria</p>
              <button 
                onClick={() => setSelectedFilter('All')}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Start Your Coffee Journey?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Join our platform to create digital passports for your coffee, connect with customers, 
              and showcase your coffee's unique story from farm to cup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscriptions" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Coffee className="h-5 w-5 mr-2" />
                Become a Seller
              </Link>
              <Link href="/sellers" className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                <Users className="h-5 w-5 mr-2" />
                Meet Our Sellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-xl border-t border-white/10 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              Coffee Break Co
            </span>
          </div>
          <p className="text-gray-400 mb-8">Digital Coffee Passport Platform</p>
          <div className="flex justify-center space-x-8 mb-8">
            <Link href="/" className="text-gray-400 hover:text-amber-300 transition-colors">Home</Link>
            <Link href="/coffees" className="text-gray-400 hover:text-amber-300 transition-colors">Explore Coffees</Link>
            <Link href="/sellers" className="text-gray-400 hover:text-amber-300 transition-colors">Our Sellers</Link>
            <Link href="/admin" className="text-gray-400 hover:text-amber-300 transition-colors">Seller Login</Link>
          </div>
          <p className="text-gray-500">&copy; 2024 Coffee Break Co. Built with ❤️ for coffee excellence.</p>
        </div>
      </footer>
    </div>
  );
}