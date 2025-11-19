'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, MapPin, Calendar, Star, ArrowLeft, Building2, Users, Award, Leaf, Shield, Phone, Mail, Globe } from 'lucide-react';

// Define interfaces for coffee data structure
interface CoffeeEntry {
  id: string;
  coffeeName: string;
  origin: string;
  farm: string;
  sellerId?: string;
  available?: boolean;
  certifications?: string[];
  cuppingScore?: string;
  variety?: string;
  process?: string;
  altitude?: string;
  harvestDate?: string;
  notes?: string;
  slug?: string;
}

interface SellerInfo {
  id: string;
  name: string;
  location: string;
  memberSince: string;
  rating: number;
  totalReviews: number;
  coffeeCount: number;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  certifications?: string[];
  specialties?: string[];
  logo?: string;
  image?: string;
}

export default function SellerCoffeesPage({ params }: { params: { sellerId: string } }) {
  const [coffees, setCoffees] = useState<CoffeeEntry[]>([]);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [coffeeRatings, setCoffeeRatings] = useState<{[key: string]: {rating: number, count: number}}>({});

  // Fetch seller info and their coffees
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        
        // Fetch seller information
        const sellerResponse = await fetch('/api/sellers');
        const sellerResult = await sellerResponse.json();
        
        if (sellerResult.success && sellerResult.data) {
          const seller = sellerResult.data.find((s: any) => s.id === params.sellerId);
          if (seller) {
            setSellerInfo({
              id: seller.id,
              name: seller.name,
              location: seller.location,
              memberSince: seller.memberSince || '2024',
              rating: seller.rating || 0,
              totalReviews: seller.totalReviews || 0,
              coffeeCount: seller.coffeeCount || 0,
              description: seller.description || `Premium coffee from ${seller.location}`,
              phone: seller.phone || '+1 (555) 123-4567',
              email: seller.email || 'info@example.com',
              website: seller.website || 'https://example.com',
              certifications: seller.certifications || ['Organic', 'Fair Trade'],
              specialties: seller.specialties || ['Single Origin', 'High Altitude'],
              logo: seller.logo, // Assuming 'logo' is part of the seller data
              image: seller.image // Assuming 'image' is part of the seller data
            });
          }
        }

        // Fetch all coffees and filter by seller
        const coffeeResponse = await fetch('/api/coffee-entries');
        
        if (!coffeeResponse.ok) {
          throw new Error(`HTTP error! status: ${coffeeResponse.status}`);
        }
        
        const coffeeResult = await coffeeResponse.json();
        
        // Handle different API response formats
        const data = coffeeResult.success ? coffeeResult.data : coffeeResult;
        
        if (Array.isArray(data)) {
          // Filter coffees by seller ID
          const sellerCoffees = data.filter((coffee: CoffeeEntry) => 
            coffee.sellerId === params.sellerId
          );
          
          setCoffees(sellerCoffees);
          
          // Fetch ratings for all coffees
          if (sellerCoffees.length > 0) {
            const ratingsPromises = sellerCoffees.map(async (coffee) => {
              try {
                const response = await fetch(`/api/comments?coffeeId=${coffee.id}`);
                if (response.ok) {
                  const result = await response.json();
                  if (result.success && result.data && result.data.length > 0) {
                    const totalRating = result.data.reduce((sum: number, r: any) => sum + r.rating, 0);
                    const averageRating = totalRating / result.data.length;
                    return { coffeeId: coffee.id, rating: averageRating, count: result.data.length };
                  }
                }
                return { coffeeId: coffee.id, rating: 0, count: 0 };
              } catch (error) {
                console.error(`Error fetching ratings for coffee ${coffee.id}:`, error);
                return { coffeeId: coffee.id, rating: 0, count: 0 };
              }
            });
            
            const ratings = await Promise.all(ratingsPromises);
            const ratingsMap: {[key: string]: {rating: number, count: number}} = {};
            ratings.forEach(r => {
              ratingsMap[r.coffeeId] = { rating: r.rating, count: r.count };
            });
            setCoffeeRatings(ratingsMap);
          }
        } else {
          console.error('Invalid data format received from API');
          setCoffees([]);
        }
      } catch (error) {
        console.error('Error fetching seller coffees:', error);
        setCoffees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [params.sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading {sellerInfo?.name || 'seller'}'s coffees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-amber-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/sellers" 
                className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sellers
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent">
                  Coffee Break Co
                </h1>
                <p className="text-xs text-amber-600/70 font-medium">Digital Coffee Passport Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Seller Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              {/* Seller Header */}
              <div className="text-center mb-6">
                {/* Make the seller logo/image clickable to navigate to seller profile */}
                <Link href={`/seller-profile/${sellerInfo?.id}`} className="block">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 hover:from-amber-600 hover:to-orange-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl">
                    {sellerInfo?.image ? (
                      <img 
                        src={sellerInfo.image} 
                        alt={sellerInfo.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-white" />
                    )}
                  </div>
                </Link>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{sellerInfo?.name}</h2>
                <div className="flex items-center justify-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-2 text-amber-600" />
                  <span>{sellerInfo?.location}</span>
                </div>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    {sellerInfo?.rating > 0 ? (
                      <>
                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                        <span className="font-semibold text-gray-900 ml-1">{sellerInfo?.rating.toFixed(1)}</span>
                        <span className="text-gray-500 ml-1">/5.0</span>
                        {sellerInfo?.totalReviews > 0 && (
                          <span className="text-xs text-gray-500 ml-2">({sellerInfo.totalReviews} reviews)</span>
                        )}
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 text-gray-300" />
                        <span className="text-gray-500 ml-1">New</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Coffee className="h-4 w-4 mr-1 text-amber-600" />
                    <span>{sellerInfo?.coffeeCount} coffees</span>
                  </div>
                </div>
              </div>

              {/* Seller Details */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 text-sm leading-relaxed">{sellerInfo?.description}</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-amber-600" />
                    <span>{sellerInfo?.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-amber-600" />
                    <span>{sellerInfo?.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-3 text-amber-600" />
                    <span>{sellerInfo?.website}</span>
                  </div>
                </div>

                {/* Certifications */}
                {sellerInfo?.certifications && sellerInfo.certifications.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {sellerInfo.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                        >
                          {cert === 'Organic' && <Leaf className="h-3 w-3 mr-1" />}
                          {cert === 'Fair Trade' && <Award className="h-3 w-3 mr-1" />}
                          {cert === 'Rainforest Alliance' && <Shield className="h-3 w-3 mr-1" />}
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties */}
                {sellerInfo?.specialties && sellerInfo.specialties.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {sellerInfo.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media Links */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Socials</h4>
                  <div className="flex justify-center space-x-3">
                    <a
                      href="#"
                      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400/20"
                      title="Facebook"
                    >
                      <span className="text-sm font-bold">f</span>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl flex items-center justify-center hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg border border-pink-400/20"
                      title="Instagram"
                    >
                      <span className="text-sm font-bold">📷</span>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-xl flex items-center justify-center hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-md hover:shadow-lg border border-sky-400/20"
                      title="Twitter"
                    >
                      <span className="text-sm font-bold">🐦</span>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg border border-red-400/20"
                      title="YouTube"
                    >
                      <span className="text-sm font-bold">▶</span>
                    </a>
                  </div>
                </div>

                {/* More Info */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">More Info</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-2 text-amber-600" />
                      <span>Family-owned business</span>
                    </div>
                    <div className="flex items-center">
                      <Leaf className="h-3 w-3 mr-2 text-amber-600" />
                      <span>Sustainable farming practices</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-3 w-3 mr-2 text-amber-600" />
                      <span>Multiple award winners</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-3 w-3 mr-2 text-amber-600" />
                      <span>International shipping available</span>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="pt-4 border-t border-gray-100 text-center">
                  <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                    <span>Member since {sellerInfo?.memberSince}</span>
                  </div>
                  
                  {/* View Seller Profile Button */}
                  <Link
                    href={`/seller-profile/${sellerInfo?.id}`}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View Seller Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Coffee Cards */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Coffee Collection</h3>
              <p className="text-gray-600">Discover the unique flavors and stories behind each coffee from {sellerInfo?.name}</p>
            </div>

            {coffees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {coffees.map((coffee) => (
                  <div key={coffee.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                    {/* Coffee Image - Fixed height with unique colors */}
                    <div className={`relative h-48 flex items-center justify-center flex-shrink-0 ${
                      // Color mapping based on coffee characteristics for better visual cues
                      coffee.origin?.includes('Ethiopia') ? 'bg-gradient-to-br from-emerald-100 to-teal-200' :
                      coffee.origin?.includes('Colombia') ? 'bg-gradient-to-br from-amber-100 to-orange-200' :
                      coffee.origin?.includes('Guatemala') ? 'bg-gradient-to-br from-blue-100 to-indigo-200' :
                      coffee.origin?.includes('Mexico') ? 'bg-gradient-to-br from-purple-100 to-pink-200' :
                      coffee.origin?.includes('Honduras') ? 'bg-gradient-to-br from-red-100 to-rose-200' :
                      coffee.origin?.includes('Brazil') ? 'bg-gradient-to-br from-green-100 to-emerald-200' :
                      coffee.origin?.includes('Kenya') ? 'bg-gradient-to-br from-yellow-100 to-amber-200' :
                      coffee.origin?.includes('Panama') ? 'bg-gradient-to-br from-violet-100 to-purple-200' :
                      coffee.origin?.includes('Costa Rica') ? 'bg-gradient-to-br from-lime-100 to-green-200' :
                      coffee.origin?.includes('Nariño') ? 'bg-gradient-to-br from-cyan-100 to-blue-200' :
                      // Fallback to ID-based colors if origin doesn't match
                      coffee.id === '1' ? 'bg-gradient-to-br from-emerald-100 to-teal-200' :
                      coffee.id === '2' ? 'bg-gradient-to-br from-amber-100 to-orange-200' :
                      coffee.id === '3' ? 'bg-gradient-to-br from-blue-100 to-indigo-200' :
                      coffee.id === '4' ? 'bg-gradient-to-br from-purple-100 to-pink-200' :
                      coffee.id === '5' ? 'bg-gradient-to-br from-red-100 to-rose-200' :
                      coffee.id === '6' ? 'bg-gradient-to-br from-green-100 to-emerald-200' :
                      coffee.id === '7' ? 'bg-gradient-to-br from-cyan-100 to-blue-200' :
                      coffee.id === '8' ? 'bg-gradient-to-br from-yellow-100 to-amber-200' :
                      coffee.id === '9' ? 'bg-gradient-to-br from-violet-100 to-purple-200' :
                      coffee.id === '10' ? 'bg-gradient-to-br from-lime-100 to-green-200' :
                      coffee.id === '11' ? 'bg-gradient-to-br from-sky-100 to-blue-200' :
                      'bg-gradient-to-br from-amber-100 to-orange-200'
                    }`}>
                      <Coffee className={`h-16 w-16 ${
                        // Matching icon colors for better visual harmony
                        coffee.origin?.includes('Ethiopia') ? 'text-emerald-600' :
                        coffee.origin?.includes('Colombia') ? 'text-amber-600' :
                        coffee.origin?.includes('Guatemala') ? 'text-blue-600' :
                        coffee.origin?.includes('Mexico') ? 'text-purple-600' :
                        coffee.origin?.includes('Honduras') ? 'text-red-600' :
                        coffee.origin?.includes('Brazil') ? 'text-green-600' :
                        coffee.origin?.includes('Kenya') ? 'text-yellow-600' :
                        coffee.origin?.includes('Panama') ? 'text-violet-600' :
                        coffee.origin?.includes('Costa Rica') ? 'text-lime-600' :
                        coffee.origin?.includes('Nariño') ? 'text-cyan-600' :
                        // Fallback to ID-based colors
                        coffee.id === '1' ? 'text-emerald-600' :
                        coffee.id === '2' ? 'text-amber-600' :
                        coffee.id === '3' ? 'text-blue-600' :
                        coffee.id === '4' ? 'text-purple-600' :
                        coffee.id === '5' ? 'text-red-600' :
                        coffee.id === '6' ? 'text-green-600' :
                        coffee.id === '7' ? 'text-cyan-600' :
                        coffee.id === '8' ? 'text-yellow-600' :
                        coffee.id === '9' ? 'text-violet-600' :
                        coffee.id === '10' ? 'text-lime-600' :
                        coffee.id === '11' ? 'text-sky-600' :
                        'text-amber-600'
                      }`} />
                    </div>

                    {/* Coffee Info - Flex container to fill remaining space */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Header Section */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{coffee.coffeeName}</h3>

                        {/* Origin and Farm */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-amber-600" />
                            <span className="text-sm">{coffee.origin}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Building2 className="h-4 w-4 mr-2 text-amber-600" />
                            <span className="text-sm">{coffee.farm}</span>
                          </div>
                        </div>
                      </div>

                      {/* Coffee Details - Fixed height section */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        {coffee.variety && (
                          <div className="text-gray-600">
                            <span className="font-medium">Variety:</span> {coffee.variety}
                          </div>
                        )}
                        {coffee.process && (
                          <div className="text-gray-600">
                            <span className="font-medium">Process:</span> {coffee.process}
                          </div>
                        )}
                        {coffee.altitude && (
                          <div className="text-gray-600">
                            <span className="font-medium">Altitude:</span> {coffee.altitude}
                          </div>
                        )}
                        {coffee.harvestDate && (
                          <div className="text-gray-600">
                            <span className="font-medium">Harvest:</span> {coffee.harvestDate}
                          </div>
                        )}
                      </div>

                      {/* Certifications - Fixed height section */}
                      {coffee.certifications && coffee.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                          {coffee.certifications.slice(0, 3).map((cert, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Cupping Score - Fixed height section */}
                      {coffee.cuppingScore && (
                        <div className="flex items-center justify-between mb-4 min-h-[1.5rem]">
                          <span className="text-sm text-gray-600">Cupping Score</span>
                          <span className="font-semibold text-amber-600">{coffee.cuppingScore}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {coffee.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 italic">"{coffee.notes}"</p>
                        </div>
                      )}

                      {/* Customer Ratings */}
                      {(() => {
                        const rating = coffeeRatings[coffee.id];
                        if (rating && rating.count > 0) {
                          return (
                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < Math.round(rating.rating) 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {rating.rating.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-blue-600">
                                  <span className="text-xs font-medium">
                                    {rating.count} review{rating.count !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-gray-600 text-center">
                                Based on {rating.count} customer review{rating.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Spacer to push button to bottom */}
                      <div className="flex-grow"></div>

                      {/* View Details Button - Fixed to bottom */}
                      <Link
                        href={`/coffees/${coffee.slug || coffee.id}`}
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 mt-4"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Coffees Found</h3>
                <p className="text-gray-500">
                  {sellerInfo?.name} doesn't have any coffees available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-16">
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
