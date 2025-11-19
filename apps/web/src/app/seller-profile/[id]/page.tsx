'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Coffee, MapPin, Award, Leaf, Shield, ArrowLeft, Star, Users, Calendar, Phone, Mail, Globe, Instagram, Facebook, Twitter, Eye, QrCode } from 'lucide-react';
import Header from '../../../components/Header';
import { useSimpleAuth } from '../../../hooks/useSimpleAuth';

// Seller profile interface - simplified to match API response
interface SellerProfile {
  id: string;
  companyName: string;
  companySize: string;
  mission: string;
  logo?: string;
  phone?: string;
  email?: string;
  location: string;
  rating: number;
  totalCoffees: number;
  memberSince: number;
  specialties?: string[];
  featuredCoffeeId?: string;
  description?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  reviews?: any[];
  teamMembers?: TeamMember[];
  certifications?: string[];
  city?: string;
  country?: string;
}

interface TeamMember {
  id: string;
  name: string;
  occupation: string;
  image?: string;
}

// Coffee entry interface - expanded to match admin page
interface CoffeeEntry {
  id: string;
  coffeeName: string;
  country: string;
  specificLocation: string;
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
  // Extended farm details
  farmSize: string;
  workerCount: string;
  certifications: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  // Images
  farmImage?: string;
  farmerImage?: string;
  // Producer/Roaster information
  producerName?: string;
  producerPortrait?: string;
  producerBio?: string;
  roastedBy?: string;
  // Processing details
  fermentationTime: string;
  dryingTime: string;
  moistureContent: string;
  screenSize: string;
  beanDensity?: string;
  // Quality details
  aroma: string;
  flavor: string;
  acidity: string;
  body: string;
  primaryNotes: string;
  secondaryNotes: string;
  finish: string;
  roastRecommendation: string;
  roastDevelopmentCurve?: string;
  // Sustainability
  environmentalPractices: string[];
  fairTradePremium: string;
  communityProjects: string;
  womenWorkerPercentage: string;
  // Client page settings
  available?: boolean;
  sellerId?: string;
}

// Comment interface for ratings
interface Comment {
  id: string;
  coffeeId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/**
 * Seller Profile Page
 * Displays comprehensive information about a specific seller
 * Shows company details, team members, coffee offerings, and contact information
 * Dynamically calculates coffee count and rating from actual data
 * Coffee entries display matches admin page exactly with all details and ratings
 */
export default function SellerProfilePage() {
  const params = useParams();
  const { user, isAuthenticated } = useSimpleAuth();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [coffees, setCoffees] = useState<CoffeeEntry[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SellerProfile>>({});

  // Check if current user is the owner of this seller profile
  // Only the actual seller or an admin can edit the profile
  const isOwner = isAuthenticated && user && (
    // Check if user is admin (can edit any profile)
    user.role === 'admin' ||
    // Check if user is the seller and owns this profile by ID
    (user.role === 'seller' && user.sellerId === params.id) ||
    // Check if user's company name matches the seller's company name
    (user.role === 'seller' && user.companyName === sellerProfile?.companyName)
  );
  
  // Debug logging for ownership check (remove in production)
  useEffect(() => {
    if (sellerProfile) {
      console.log('🔐 Ownership Check Debug:', {
        isAuthenticated,
        userRole: user?.role,
        userId: user?.id,
        userCompanyName: user?.companyName,
        userSellerId: user?.sellerId,
        sellerProfileId: params.id,
        sellerCompanyName: sellerProfile.companyName,
        isOwner
      });
    }
  }, [isAuthenticated, user, sellerProfile, params.id, isOwner]);

  // Calculate actual coffee count and rating from loaded data
  const actualCoffeeCount = coffees.length;
  const actualRating = comments.length > 0 
    ? comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length 
    : 0;

  // Load seller profile data
  useEffect(() => {
    const loadSellerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load seller profile
        const sellerResponse = await fetch(`/api/seller-profile/${params.id}?t=${Date.now()}`, {
          cache: 'no-store' // Ensure fresh data
        });
        
        if (sellerResponse.ok) {
          const sellerResult = await sellerResponse.json();
          
          if (sellerResult.success && sellerResult.data) {
            setSellerProfile(sellerResult.data);
            setError(null);
          } else {
            setError(sellerResult.error || 'Failed to load seller data');
          }
        } else {
          setError(`HTTP ${sellerResponse.status}: ${sellerResponse.statusText}`);
        }
        
        // Load coffees for this seller
        try {
          const coffeesResponse = await fetch(`/api/coffee-entries/seller/${params.id}?t=${Date.now()}`, {
            cache: 'no-store'
          });
          if (coffeesResponse.ok) {
            const coffeesResult = await coffeesResponse.json();
            if (coffeesResult.success) {
              setCoffees(coffeesResult.data || []);
            }
          }
        } catch (coffeeErr) {
          console.error('Coffee loading error (non-critical):', coffeeErr);
          setCoffees([]);
        }

        // Load all comments to calculate ratings
        try {
          const commentsResponse = await fetch(`/api/comments?t=${Date.now()}`, {
            cache: 'no-store'
          });
          if (commentsResponse.ok) {
            const commentsResult = await commentsResponse.json();
            if (commentsResult.success) {
              // Filter comments for coffees belonging to this seller
              const sellerCoffeeIds = coffees.map(coffee => coffee.id);
              const sellerComments = commentsResult.data.filter((comment: Comment) => 
                sellerCoffeeIds.includes(comment.coffeeId)
              );
              setComments(sellerComments);
            }
          }
        } catch (commentsErr) {
          console.error('Comments loading error (non-critical):', commentsErr);
          setComments([]);
        }
        
      } catch (err) {
        console.error('Error loading seller data:', err);
        setError(`Network error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadSellerData();
    }
  }, [params.id]);

  // Reload comments when coffees change to recalculate ratings
  useEffect(() => {
    const loadCommentsForCoffees = async () => {
      if (coffees.length > 0) {
        try {
          const commentsResponse = await fetch(`/api/comments?t=${Date.now()}`, {
            cache: 'no-store'
          });
          if (commentsResponse.ok) {
            const commentsResult = await commentsResponse.json();
            if (commentsResult.success) {
              // Filter comments for coffees belonging to this seller
              const sellerCoffeeIds = coffees.map(coffee => coffee.id);
              const sellerComments = commentsResult.data.filter((comment: Comment) => 
                sellerCoffeeIds.includes(comment.coffeeId)
              );
              setComments(sellerComments);
            }
          }
        } catch (commentsErr) {
          console.error('Comments loading error:', commentsErr);
          setComments([]);
        }
      }
    };

    loadCommentsForCoffees();
  }, [coffees]);

  /**
   * Refreshes all data from the server
   * Useful when data might be stale or after updates
   */
  const refreshAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Reload seller profile
      const sellerResponse = await fetch(`/api/seller-profile/${params.id}?t=${Date.now()}`, {
        cache: 'no-store'
      });
      
      if (sellerResponse.ok) {
        const sellerResult = await sellerResponse.json();
        if (sellerResult.success && sellerResult.data) {
          setSellerProfile(sellerResult.data);
        }
      }
      
      // Reload coffees
      const coffeesResponse = await fetch(`/api/coffee-entries/seller/${params.id}?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (coffeesResponse.ok) {
        const coffeesResult = await coffeesResponse.json();
        if (coffeesResult.success) {
          setCoffees(coffeesResult.data || []);
        }
      }
      
      // Reload comments
      const commentsResponse = await fetch(`/api/comments?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (commentsResponse.ok) {
        const commentsResult = await commentsResponse.json();
        if (commentsResult.success) {
          const sellerCoffeeIds = coffees.map(coffee => coffee.id);
          const sellerComments = commentsResult.data.filter((comment: Comment) => 
            sellerCoffeeIds.includes(comment.coffeeId)
          );
          setComments(sellerComments);
        }
      }
      
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(`Failed to refresh data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Starts editing mode and initializes the edit form
   */
  const startEditing = () => {
    setEditForm({
      companyName: sellerProfile?.companyName || '',
      location: sellerProfile?.location || '',
      city: sellerProfile?.city || '',
      country: sellerProfile?.country || '',
      mission: sellerProfile?.mission || '',
      phone: sellerProfile?.phone || '',
      email: sellerProfile?.email || '',
      website: sellerProfile?.website || '',
      specialties: sellerProfile?.specialties || [],
      certifications: sellerProfile?.certifications || []
    });
    setIsEditing(true);
  };

  /**
   * Saves the edited seller information
   * Ensures location consistency by updating both location and city/country fields
   */
  const saveEdit = async () => {
    try {
      // Prepare the update data with location consistency
      const updateData = {
        ...sellerProfile,
        ...editForm
      };
      
      // If city and country are provided, update the location field to match
      if (editForm.city && editForm.country) {
        updateData.location = `${editForm.city}, ${editForm.country}`;
      } else if (editForm.city) {
        updateData.location = editForm.city;
      } else if (editForm.country) {
        updateData.location = editForm.country;
      }
      
      const response = await fetch(`/api/seller-profile/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSellerProfile(prev => ({
            ...prev,
            ...editForm,
            location: updateData.location // Update the location field as well
          }));
          setIsEditing(false);
          alert('Seller information updated successfully!');
          // Refresh data to ensure consistency across all pages
          setTimeout(refreshAllData, 500);
        } else {
          alert('Failed to update seller information. Please try again.');
        }
      } else {
        alert('Failed to update seller information. Please try again.');
      }
    } catch (error) {
      console.error('Error updating seller information:', error);
      alert('Failed to update seller information. Please try again.');
    }
  };

  /**
   * Cancels editing mode
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  /**
   * Calculates average rating and comment count for a coffee entry
   * @param coffeeId - ID of the coffee entry
   * @returns Object with averageRating and commentCount
   */
  const getCoffeeStats = (coffeeId: string) => {
    const coffeeComments = comments.filter(comment => comment.coffeeId === coffeeId);
    const commentCount = coffeeComments.length;
    
    if (commentCount === 0) {
      return { averageRating: 0, commentCount: 0 };
    }
    
    const totalRating = coffeeComments.reduce((sum, comment) => sum + comment.rating, 0);
    const averageRating = totalRating / commentCount;
    
    return { averageRating, commentCount };
  };

  /**
   * Calculates overall seller score from all coffee comments
   * @returns Object with overallRating and totalReviews
   */
  const getOverallSellerScore = () => {
    const totalReviews = comments.length;
    
    if (totalReviews === 0) {
      return { overallRating: 0, totalReviews: 0 };
    }
    
    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
    const overallRating = totalRating / totalReviews;
    
    return { overallRating, totalReviews };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading seller information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sellerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <Coffee className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The seller you\'re looking for doesn\'t exist.'}
            </p>
            <Link 
              href="/sellers" 
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Sellers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8 flex justify-between items-center">
          <Link 
            href="/sellers" 
            className="inline-flex items-center text-amber-700 hover:text-amber-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to All Sellers
          </Link>
          
          {/* Refresh Button */}
          <button
            onClick={refreshAllData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh seller profile data"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Seller Hero Section */}
        <div className="bg-white rounded-3xl border border-amber-100 p-8 mb-12 shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Company Logo/Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0">
              {sellerProfile.logo ? (
                <img 
                  src={sellerProfile.logo} 
                  alt={`${sellerProfile.companyName} logo`}
                  className="w-20 h-20 object-contain rounded-2xl bg-white p-2"
                />
              ) : (
                <Coffee className="h-12 w-12 text-white" />
              )}
            </div>
            
            {/* Company Information */}
            <div className="flex-1">
              <h1 className="text-4xl font-black text-gray-900 mb-2">{sellerProfile.companyName}</h1>
              <div className="flex items-center text-lg text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2 text-amber-500" />
                {/* Display city/country if available, otherwise fall back to location field */}
                {sellerProfile.city && sellerProfile.country ? `${sellerProfile.city}, ${sellerProfile.country}` : sellerProfile.location || 'Location not specified'}
              </div>
              
              {/* Rating and Stats - Using actual calculated values */}
              <div className="flex items-center space-x-6 mb-4">
                {actualRating > 0 ? (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-500 fill-current" />
                    <span className="text-lg font-semibold text-gray-900 ml-2">{actualRating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">rating</span>
                    {comments.length > 0 && (
                      <span className="text-sm text-gray-500 ml-2">({comments.length} reviews)</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-gray-300" />
                    <span className="text-gray-500 ml-2">New</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Coffee className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">{actualCoffeeCount}</span>
                  <span className="text-gray-500 ml-1">coffee{actualCoffeeCount !== 1 ? 's' : ''}</span>
                  {actualCoffeeCount > 0 && (
                    <span className="text-sm text-gray-500 ml-2">from database</span>
                  )}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-gray-500">Member since {sellerProfile.memberSince}</span>
                </div>
              </div>

              {/* Edit Button - Only visible to profile owner or admin */}
              {isOwner && (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
              
              {/* Owner Info - Only visible to profile owner or admin */}
              {isOwner && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                  You can edit this profile
                </div>
              )}
            </div>

            {/* Logo Upload Section - Only visible to profile owner or admin */}
            {isOwner && (
              <div className="lg:ml-auto">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h3 className="text-sm font-semibold text-amber-800 mb-3">Company Logo</h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async () => {
                            try {
                              // Update the seller profile with the new logo
                              const response = await fetch(`/api/seller-profile/${params.id}`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  ...sellerProfile,
                                  logo: reader.result as string
                                }),
                              });
                              
                              if (response.ok) {
                                const result = await response.json();
                                if (result.success) {
                                  setSellerProfile(prev => ({
                                    ...prev,
                                    logo: reader.result as string
                                  }));
                                  alert('Logo updated successfully!');
                                  // Refresh data to ensure consistency
                                  setTimeout(refreshAllData, 500);
                                } else {
                                  alert('Failed to update logo. Please try again.');
                                }
                              } else {
                                alert('Failed to update logo. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error updating logo:', error);
                              alert('Failed to update logo. Please try again.');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
                    >
                      {sellerProfile.logo ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    {sellerProfile.logo && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/seller-profile/${params.id}`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                ...sellerProfile,
                                logo: undefined
                              }),
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              if (result.success) {
                                setSellerProfile(prev => ({
                                  ...prev,
                                  logo: undefined
                                }));
                                alert('Logo removed successfully!');
                                // Refresh data to ensure consistency
                                setTimeout(refreshAllData, 500);
                              } else {
                                alert('Failed to remove logo. Please try again.');
                              }
                            } else {
                              alert('Failed to remove logo. Please try again.');
                            }
                          } catch (error) {
                            console.error('Error removing logo:', error);
                            alert('Failed to remove logo. Please try again.');
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
                    Upload a square logo (200x200px or larger) for best results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mission Statement */}
            <div className="bg-white rounded-2xl border border-amber-100 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="h-6 w-6 mr-3 text-amber-600" />
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">{sellerProfile.mission}</p>
            </div>

            {/* Coffee Offerings - Updated to match admin page exactly */}
            <div className="bg-white rounded-2xl border border-amber-100 p-8 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Coffee className="h-6 w-6 mr-3 text-amber-600" />
                  Coffee Offerings ({actualCoffeeCount})
                </h2>
                <div className="flex items-center space-x-4">
                  <p className="text-gray-600">{actualCoffeeCount} coffee{actualCoffeeCount !== 1 ? 's' : ''} logged</p>
                  <button
                    onClick={refreshAllData}
                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    title="Refresh customer ratings and reviews"
                  >
                    {/* MessageCircle className="h-4 w-4 mr-1" /> */}
                    Refresh Reviews
                  </button>
                </div>
              </div>

              {/* Country Filter */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Filter by Country:</span>
                  <select
                    value={selectedCountryFilter || 'All'}
                    onChange={(e) => setSelectedCountryFilter(e.target.value === 'All' ? null : e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="All">All Countries</option>
                    {Array.from(new Set(coffees.map(entry => entry.country).filter(Boolean))).sort().map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {selectedCountryFilter && (
                    <button
                      onClick={() => setSelectedCountryFilter(null)}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Overall Performance Summary */}
              {(() => {
                const { overallRating, totalReviews } = getOverallSellerScore();
                return (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="mb-3 text-center">
                      <h4 className="text-lg font-semibold text-green-800">Performance Summary for {sellerProfile.companyName}</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-900">{actualCoffeeCount}</div>
                        <div className="text-sm text-green-700">Coffee Entries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-900">
                          {overallRating > 0 ? overallRating.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-sm text-green-700">Avg. Rating</div>
                        <div className="flex items-center justify-center space-x-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.round(overallRating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-900">{totalReviews}</div>
                        <div className="text-sm text-green-700">Total Reviews</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-900">
                          {totalReviews > 0 ? Math.round((totalReviews / actualCoffeeCount) * 10) / 10 : 0}
                        </div>
                        <div className="text-sm text-green-700">Reviews per Coffee</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Coffee Entries Display - Preview Cards */}
              {(() => {
                const filteredCoffees = selectedCountryFilter 
                  ? coffees.filter(entry => entry.country === selectedCountryFilter)
                  : coffees;
                
                if (filteredCoffees.length === 0) {
                  return (
                    <div className="rounded-xl border border-amber-100 p-8 bg-white shadow-lg text-center">
                      <Coffee className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedCountryFilter 
                          ? `No coffee entries from ${selectedCountryFilter} for ${sellerProfile.companyName}`
                          : `No coffee entries yet for ${sellerProfile.companyName}`
                        }
                      </h3>
                      <p className="text-base text-gray-600 mb-6">
                        {selectedCountryFilter 
                          ? `Try selecting a different country or check back later for new offerings from ${selectedCountryFilter}.`
                          : 'Check back soon for new coffee offerings from this seller.'
                        }
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoffees.map((entry) => (
                      <div key={entry.id} className="bg-white rounded-xl border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        {/* Coffee Header - Simplified with better spacing */}
                        <div className={`p-4 relative overflow-hidden ${
                          // Simplified color mapping based on origin
                          entry.origin?.includes('Ethiopia') ? 'bg-gradient-to-br from-emerald-50 to-teal-100' :
                          entry.origin?.includes('Colombia') ? 'bg-gradient-to-br from-amber-50 to-orange-100' :
                          entry.origin?.includes('Guatemala') ? 'bg-gradient-to-br from-blue-50 to-indigo-100' :
                          entry.origin?.includes('Mexico') ? 'bg-gradient-to-br from-purple-50 to-pink-100' :
                          entry.origin?.includes('Honduras') ? 'bg-gradient-to-br from-red-50 to-rose-100' :
                          entry.origin?.includes('Brazil') ? 'bg-gradient-to-br from-green-50 to-emerald-100' :
                          entry.origin?.includes('Kenya') ? 'bg-gradient-to-br from-yellow-50 to-amber-100' :
                          entry.origin?.includes('Panama') ? 'bg-gradient-to-br from-violet-50 to-purple-100' :
                          entry.origin?.includes('Costa Rica') ? 'bg-gradient-to-br from-lime-50 to-green-100' :
                          entry.origin?.includes('Nariño') ? 'bg-gradient-to-br from-cyan-50 to-blue-100' :
                          'bg-gradient-to-br from-amber-50 to-orange-100'
                        }`}>
                          {/* Subtle pattern overlay for visual interest */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                              <Coffee className={`h-8 w-8 ${
                                entry.origin?.includes('Ethiopia') ? 'text-emerald-600' :
                                entry.origin?.includes('Colombia') ? 'text-amber-600' :
                                entry.origin?.includes('Guatemala') ? 'text-blue-600' :
                                entry.origin?.includes('Mexico') ? 'text-purple-600' :
                                entry.origin?.includes('Honduras') ? 'text-red-600' :
                                entry.origin?.includes('Brazil') ? 'text-green-600' :
                                entry.origin?.includes('Kenya') ? 'text-yellow-600' :
                                entry.origin?.includes('Panama') ? 'text-violet-600' :
                                entry.origin?.includes('Costa Rica') ? 'text-lime-600' :
                                entry.origin?.includes('Nariño') ? 'text-cyan-600' :
                                'text-amber-600'
                              }`} />
                              <span className="inline-flex items-center px-2 py-1 bg-white/80 text-xs font-medium rounded-full text-gray-700 shadow-sm">
                                {entry.country}
                              </span>
                            </div>
                            
                            <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{entry.coffeeName}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-1 text-amber-500" />
                              <span className="line-clamp-1">{entry.origin}</span>
                            </div>
                          </div>
                        </div>

                        {/* Key Details - Streamlined and better organized */}
                        <div className="p-4 space-y-3">
                          {/* Quality Score - Prominent display */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Quality Score</span>
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-amber-500" />
                              <span className="text-lg font-bold text-amber-700">{entry.cuppingScore || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Farm & Process - Simplified */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 block">Farm</span>
                              <span className="font-medium text-gray-900 line-clamp-1">{entry.farm}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Process</span>
                              <span className="font-medium text-gray-900">{entry.process}</span>
                            </div>
                          </div>

                          {/* Action Buttons - Clean and prominent */}
                          <div className="flex space-x-2 pt-3 border-t border-gray-100">
                            <Link
                              href={`/coffees/${entry.slug || entry.id}`}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                            <button
                              onClick={() => alert(`QR Code generated for ${entry.coffeeName}\nCode: ${entry.qrCode || 'DEMO-123'}`)}
                              className="px-4 py-2.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-200 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Generate QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Team Members */}
            {sellerProfile.teamMembers && sellerProfile.teamMembers.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-100 p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-amber-600" />
                  Our Team
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {sellerProfile.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-gray-600">{member.occupation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Specialties & Certifications */}
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties & Certifications</h3>
              <div className="space-y-3">
                {sellerProfile.specialties && sellerProfile.specialties.length > 0 ? (
                  sellerProfile.specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Leaf className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-700">{specialty}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No specialties listed</div>
                )}
                {sellerProfile.certifications && sellerProfile.certifications.length > 0 ? (
                  sellerProfile.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Shield className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No certifications listed</div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {sellerProfile.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-gray-700">{sellerProfile.phone}</span>
                  </div>
                )}
                {sellerProfile.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-gray-700">{sellerProfile.email}</span>
                  </div>
                )}
                {sellerProfile.website && (
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 text-amber-600 mr-2" />
                    <a 
                      href={sellerProfile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            {(sellerProfile.socialMedia?.instagram || sellerProfile.socialMedia?.facebook || sellerProfile.socialMedia?.twitter) && (
              <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="space-y-3">
                  {sellerProfile.socialMedia?.instagram && (
                    <a 
                      href={`https://instagram.com/${sellerProfile.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 hover:from-pink-100 hover:to-purple-100 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm font-bold">📷</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          {sellerProfile.socialMedia.instagram}
                        </span>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-2 h-2 bg-pink-400 rounded-full group-hover:bg-pink-600 transition-colors"></div>
                      </div>
                    </a>
                  )}
                  {sellerProfile.socialMedia?.facebook && (
                    <a 
                      href={`https://facebook.com/${sellerProfile.socialMedia.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm font-bold">f</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          {sellerProfile.socialMedia.facebook}
                        </span>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                      </div>
                    </a>
                  )}
                  {sellerProfile.socialMedia?.twitter && (
                    <a 
                      href={`https://twitter.com/${sellerProfile.socialMedia.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 hover:from-sky-100 hover:to-blue-100 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm font-bold">🐦</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          {sellerProfile.socialMedia.twitter}
                        </span>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-2 h-2 bg-sky-400 rounded-full group-hover:bg-sky-600 transition-colors"></div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Coffee Information */}
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Coffee Information</h3>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Available Coffees:</span>
                  <span className="font-semibold text-gray-900 ml-2">{actualCoffeeCount}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Quality Focus:</span>
                  <span className="font-semibold text-gray-900 ml-2">Premium & Sustainable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Seller Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={editForm.companyName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Denver, Colorado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={editForm.country || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
                <textarea
                  value={editForm.mission || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mission: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={editForm.website || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.specialties?.join(', ') || ''}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Single Origin, Organic, Fair Trade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certifications (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.certifications?.join(', ') || ''}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Organic, Fair Trade, Direct Trade"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={cancelEdit}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Coffee Entry Modal - Removed as it's no longer needed */}
    </div>
  );
}
