'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Plus, QrCode, ArrowLeft, MapPin, Calendar, Award, Leaf, Users, Save, Eye, Download, Edit, Trash2, Droplets, LogOut, User, Star, MessageCircle, ChevronDown, Menu, X, Smartphone, Crown, RefreshCw } from 'lucide-react';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';
import Header from '../../components/Header';

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
  pricePerBag?: string;
  available?: boolean;
  orderLink?: string;
  sellerId?: string;
}

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
  specialties: string[];
  certifications: string[];
  featuredCoffeeId: string;
  description: string;
  website?: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  defaultPricePerBag: string;
  orderLink: string;
  reviews: any[];
  teamMembers: TeamMember[];
  country?: string;
  city?: string;
}

interface TeamMember {
  id: string;
  name: string;
  occupation: string;
  image?: string;
}

export default function AdminPage() {
  const { user, signOut } = useSimpleAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'entries' | 'profile' | 'migration'>('new');
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<CoffeeEntry | null>(null);
  
  // Seller management state - completely restructured
  const [availableSellers, setAvailableSellers] = useState<{id: string, companyName: string}[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [currentSeller, setCurrentSeller] = useState<{id: string, companyName: string} | null>(null);
  
  const [sellerProfile, setSellerProfile] = useState<SellerProfile>({
    id: '',
    companyName: '',
    companySize: '',
    mission: '',
    logo: undefined,
    phone: '',
    email: '',
    location: '',
    rating: 0,
    totalCoffees: 0,
    memberSince: 2024,
    specialties: [],
    certifications: [],
    featuredCoffeeId: '',
    description: '',
    website: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    },
    defaultPricePerBag: '',
    orderLink: '',
    reviews: [],
    teamMembers: [],
    country: '',
    city: ''
  });
  const [entries, setEntries] = useState<CoffeeEntry[]>([]);
  const [commentsData, setCommentsData] = useState<{[key: string]: any[]}>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Step 1: Load available sellers on component mount
  useEffect(() => {
    const loadAvailableSellers = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/sellers');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          console.log('🔍 Raw API response for sellers:', result.data);
          console.log('🔍 First seller object:', result.data[0]);
          
          const sellers = result.data.map((seller: any) => ({
            id: seller.id,
            companyName: seller.companyName || seller.name || seller.company_name || 'Unknown Company'
          }));
          
          console.log('🔍 Processed sellers:', sellers);
          setAvailableSellers(sellers);
          
          // Auto-select the first seller
          const firstSeller = sellers[0];
          setSelectedSellerId(firstSeller.id);
          setCurrentSeller(firstSeller);
          
        } else {
          setAvailableSellers([]);
        }
      } catch (error) {
        setAvailableSellers([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAvailableSellers();
  }, []); // Only run once on mount

  // Step 2: When selectedSellerId changes, update currentSeller and load profile
  useEffect(() => {
    if (selectedSellerId && availableSellers.length > 0) {
      const seller = availableSellers.find(s => s.id === selectedSellerId);
      
      if (seller) {
        setCurrentSeller(seller);
        
        // Load seller profile and coffee entries
        loadSellerData(selectedSellerId);
      } else {
        // Reset to first available seller if current selection is invalid
        if (availableSellers.length > 0) {
          const firstSeller = availableSellers[0];
          setSelectedSellerId(firstSeller.id);
          setCurrentSeller(firstSeller);
        }
      }
    }
  }, [selectedSellerId, availableSellers]);

  // Step 3: Load seller profile and coffee entries
  const loadSellerData = async (sellerId: string) => {
    if (!sellerId) return;
    
    setLoading(true);
    
    try {
      // Load seller profile
      const profileResponse = await fetch(`/api/seller-profile/${sellerId}`);
      const profileResult = await profileResponse.json();
      
      if (profileResult.success) {
        setSellerProfile(profileResult.data);
      } else {
        // Set a basic profile if the API fails
        setSellerProfile({
          ...sellerProfile,
          id: sellerId,
          companyName: currentSeller?.companyName || 'Unknown Company'
        });
      }
      
      // Load coffee entries
      const entriesResponse = await fetch(`/api/coffee-entries/seller/${sellerId}`);
      const entriesResult = await entriesResponse.json();
      
      if (entriesResult.success) {
        setEntries(entriesResult.data);
      } else {
        setEntries([]);
      }
      
    } catch (error) {
      // Set fallback data on error
      setSellerProfile({
        ...sellerProfile,
        id: sellerId,
        companyName: currentSeller?.companyName || 'Unknown Company'
      });
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Handle seller selection
  const handleSellerSelection = (sellerId: string) => {
    if (sellerId !== selectedSellerId) {
      // Validate that the selected seller exists
      const selectedSeller = availableSellers.find(s => s.id === sellerId);
      
      if (selectedSeller) {
        setSelectedSellerId(sellerId);
        setCurrentSeller(selectedSeller);
        
        // Reset editing state when switching sellers
        setEditingEntry(null);
        setActiveTab('new');
      } else {
        // Reset to first available seller if invalid selection
        if (availableSellers.length > 0) {
          const firstSeller = availableSellers[0];
          setSelectedSellerId(firstSeller.id);
          setCurrentSeller(firstSeller);
        }
      }
    }
  };

  const saveSellerProfile = async (profileData: SellerProfile) => {
    try {
      setSellerProfile(profileData);
      setNotification({ type: 'success', message: `${profileData.companyName} profile updated successfully!` });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update profile. Please try again.' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleEditEntry = (entry: CoffeeEntry) => {
    setEditingEntry(entry);
    setActiveTab('new'); // Switch to new entry tab for editing
  };

  const generateQRCode = async (entry: CoffeeEntry) => {
    try {
      // Generate the coffee preview page URL
      const coffeeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/coffees/${entry.slug || entry.id}`;
      
      // Use a QR code generation service to create the image
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(coffeeUrl)}&color=92400E&bgcolor=FFFFFF&margin=10&format=png`;
      
      // Fetch the QR code image
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entry.coffeeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setNotification({ type: 'success', message: 'QR Code downloaded successfully!' });
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setNotification({ type: 'error', message: 'Failed to download QR code. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this coffee entry?')) {
      try {
        const response = await fetch(`/api/coffee-entries/${entryId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          setEntries(entries.filter(entry => entry.id !== entryId));
          setNotification({ type: 'success', message: 'Coffee entry deleted successfully!' });
          setTimeout(() => setNotification(null), 3000);
        } else {
          setNotification({ type: 'error', message: 'Failed to delete coffee entry. Please try again.' });
          setTimeout(() => setNotification(null), 5000);
        }
      } catch (error) {
        console.error('Failed to delete coffee entry:', error);
        setNotification({ type: 'error', message: 'Failed to delete coffee entry. Please try again.' });
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Header 
          showBackButton={true} 
          useSmartBack={true} 
          backText="Back to Home"
          title="Admin Panel"
          subtitle="Manage coffee entries and system settings"
          showNavigation={false}
        />
        
        {/* Notification Banner */}
        {notification && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className={`rounded-lg p-4 shadow-lg border ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {notification.type === 'success' ? (
                    <Award className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 mr-2 text-red-600" />
                  )}
                  <span className="font-medium">{notification.message}</span>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-8">
          {loading || !currentSeller ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {!currentSeller ? 'Loading sellers...' : 'Loading data...'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Seller Selection */}
              <div className="mb-8 p-6 bg-white rounded-2xl border border-amber-100 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-amber-600" />
                  Select Seller to Manage
                </h3>
                
                {availableSellers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-4">
                      <Users className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg font-semibold">No sellers available</p>
                      <p className="text-sm text-gray-600">Please check your API configuration or add sellers to the system.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Current Seller Status */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Currently managing:</p>
                            <p className="text-lg font-bold text-amber-700">
                              {currentSeller?.companyName || 'No seller selected'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total Sellers: {availableSellers.length}</p>
                          </div>
                          <button
                            onClick={() => {
                              setLoading(true);
                              // Reload sellers
                              fetch('/api/sellers')
                                .then(res => res.json())
                                .then(data => {
                                  if (data.success && data.data.length > 0) {
                                    const sellers = data.data.map((seller: any) => ({
                                      id: seller.id,
                                      companyName: seller.companyName || seller.name || seller.company_name || 'Unknown Company'
                                    }));
                                    setAvailableSellers(sellers);
                                    if (sellers.length > 0) {
                                      setSelectedSellerId(sellers[0].id);
                                      setCurrentSeller(sellers[0]);
                                    }
                                  }
                                  setLoading(false);
                                })
                                .catch(() => setLoading(false));
                            }}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Admin Management Link */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Crown className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Admin Management</p>
                            <p className="text-lg font-bold text-purple-700">
                              Manage Sellers, Customers & Subscriptions
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/admin/management"
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Crown className="h-5 w-5 mr-2 inline" />
                          Open Management
                        </Link>
                      </div>
                    </div>

                    {/* Seller Selection Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSellers.map((seller) => (
                        <button
                          key={seller.id}
                          onClick={() => handleSellerSelection(seller.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                            selectedSellerId === seller.id
                              ? 'border-amber-500 bg-amber-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-25'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedSellerId === seller.id
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Users className="h-4 w-4" />
                            </div>
                            <div className="text-left flex-1">
                              <p className={`font-semibold ${
                                selectedSellerId === seller.id
                                  ? 'text-amber-700'
                                  : 'text-gray-900'
                              }`}>
                                {seller.companyName}
                              </p>
                              <p className="text-xs text-gray-500">Click to manage</p>
                            </div>
                            {selectedSellerId === seller.id && (
                              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    

                  </>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'new'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Plus className="h-5 w-5 inline mr-2" />
                  New Coffee Entry
                </button>
                <button
                  onClick={() => setActiveTab('entries')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'entries'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Coffee className="h-5 w-5 inline mr-2" />
                  Coffee Entries
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Users className="h-5 w-5 inline mr-2" />
                  Seller Profile
                </button>
                <button
                  onClick={() => setActiveTab('migration')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'migration'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <RefreshCw className="h-5 w-5 inline mr-2" />
                  Slug Migration
                </button>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'new' && (
                <div className="rounded-2xl border border-amber-100 p-8 bg-white shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {editingEntry ? 'Edit Coffee Entry' : 'Create New Coffee Entry'}
                  </h2>
                  <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>{editingEntry ? 'Editing entry for:' : 'Creating entry for:'}</strong> {sellerProfile.companyName}
                    </p>
                  </div>
                  
                  <form className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Basic Information</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Coffee Name *
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.coffeeName || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, coffeeName: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Ethiopian Single Origin"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Country *
                          </label>
                          <select 
                            value={editingEntry?.country || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, country: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select Country</option>
                            <option value="Ethiopia">Ethiopia</option>
                            <option value="Colombia">Colombia</option>
                            <option value="Brazil">Brazil</option>
                            <option value="Costa Rica">Costa Rica</option>
                            <option value="Guatemala">Guatemala</option>
                            <option value="Honduras">Honduras</option>
                            <option value="Nicaragua">Nicaragua</option>
                            <option value="El Salvador">El Salvador</option>
                            <option value="Panama">Panama</option>
                            <option value="Mexico">Mexico</option>
                            <option value="Peru">Peru</option>
                            <option value="Bolivia">Bolivia</option>
                            <option value="Ecuador">Ecuador</option>
                            <option value="Venezuela">Venezuela</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Uganda">Uganda</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Rwanda">Rwanda</option>
                            <option value="Burundi">Burundi</option>
                            <option value="Democratic Republic of Congo">Democratic Republic of Congo</option>
                            <option value="Cameroon">Cameroon</option>
                            <option value="Ivory Coast">Ivory Coast</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Sierra Leone">Sierra Leone</option>
                            <option value="Liberia">Liberia</option>
                            <option value="Madagascar">Madagascar</option>
                            <option value="Comoros">Comoros</option>
                            <option value="Yemen">Yemen</option>
                            <option value="India">India</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Myanmar">Myanmar</option>
                            <option value="Laos">Laos</option>
                            <option value="Cambodia">Cambodia</option>
                            <option value="Philippines">Philippines</option>
                            <option value="Papua New Guinea">Papua New Guinea</option>
                            <option value="Timor-Leste">Timor-Leste</option>
                            <option value="Hawaii (USA)">Hawaii (USA)</option>
                            <option value="Puerto Rico">Puerto Rico</option>
                            <option value="Dominican Republic">Dominican Republic</option>
                            <option value="Haiti">Haiti</option>
                            <option value="Jamaica">Jamaica</option>
                            <option value="Belize">Belize</option>
                            <option value="Argentina">Argentina</option>
                            <option value="Chile">Chile</option>
                            <option value="Uruguay">Uruguay</option>
                            <option value="Paraguay">Paraguay</option>
                            <option value="Australia">Australia</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="Fiji">Fiji</option>
                            <option value="Vanuatu">Vanuatu</option>
                            <option value="Solomon Islands">Solomon Islands</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Specific Location
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.specificLocation || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, specificLocation: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Yirgacheffe, Sidamo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Origin
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.origin || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, origin: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Yirgacheffe, Ethiopia"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Farm Information */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Farm Information</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Farm Name
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.farm || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, farm: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Finca La Esperanza"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Farmer Name
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.farmer || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, farmer: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Maria Rodriguez"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Altitude
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.altitude || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, altitude: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 1,200-1,500 masl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Farm Size
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.farmSize || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, farmSize: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 15"
                          />
                          <p className="text-xs text-gray-500 mt-1">hectares</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Worker Count
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.workerCount || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, workerCount: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 25"
                          />
                          <p className="text-xs text-gray-500 mt-1">employees</p>
                        </div>
                      </div>
                    </div>

                    {/* Coffee Details */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Coffee Details</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Variety
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.variety || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, variety: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Bourbon, Caturra, Typica"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Process Method
                          </label>
                          <select
                            value={editingEntry?.process || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, process: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">Select Process</option>
                            <option value="Washed">Washed</option>
                            <option value="Natural">Natural</option>
                            <option value="Honey">Honey</option>
                            <option value="Anaerobic">Anaerobic</option>
                            <option value="Carbonic Maceration">Carbonic Maceration</option>
                            <option value="Lactic">Lactic</option>
                            <option value="Mixed">Mixed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Harvest Date
                          </label>
                          <input
                            type="date"
                            value={editingEntry?.harvestDate || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, harvestDate: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Processing Date
                          </label>
                          <input
                            type="date"
                            value={editingEntry?.processingDate || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, processingDate: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cupping Score
                          </label>
                          <input
                            type="number"
                            value={editingEntry?.cuppingScore || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, cuppingScore: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="e.g., 85.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Processing Details */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Processing Details</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fermentation Time
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.fermentationTime || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, fermentationTime: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 48"
                          />
                          <p className="text-xs text-gray-500 mt-1">hours</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Drying Time
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.dryingTime || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, dryingTime: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 7"
                          />
                          <p className="text-xs text-gray-500 mt-1">days</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Moisture Content
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.moistureContent || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, moistureContent: e.target.value} : null)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 10.5"
                          />
                          <p className="text-xs text-gray-500 mt-1">%</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Screen Size
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.screenSize || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, screenSize: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 16-18"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cupping Notes */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Cupping Notes</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Aroma
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.aroma || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, aroma: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Floral, Citrus"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Flavor
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.flavor || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, flavor: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Bright, Sweet"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Acidity
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.acidity || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, acidity: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Medium, Bright"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Body
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.body || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, body: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Medium, Full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Primary Notes
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.primaryNotes || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, primaryNotes: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Jasmine, Bergamot"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Secondary Notes
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.secondaryNotes || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, secondaryNotes: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Honey, Caramel"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Finish
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.finish || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, finish: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Clean, Lingering"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Roast Recommendation
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.roastRecommendation || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, roastRecommendation: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Medium, Light"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Business Information */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Business Information</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Price Per Bag
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.pricePerBag || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, pricePerBag: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 24.99"
                          />
                          <p className="text-xs text-gray-500 mt-1">USD</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Available
                          </label>
                          <select
                            value={editingEntry?.available?.toString() || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, available: e.target.value === 'true'} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">Select Availability</option>
                            <option value="true">Available</option>
                            <option value="false">Out of Stock</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Order Link
                          </label>
                          <input
                            type="url"
                            value={editingEntry?.orderLink || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, orderLink: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="https://company.com/order"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Certifications & Environmental */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Certifications & Environmental</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Certifications
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.certifications?.join(', ') || ''}
                            onChange={(e) => {
                              const certifications = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingEntry(editingEntry ? {...editingEntry, certifications} : null);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Organic, Fair Trade, Direct Trade"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Environmental Practices
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.environmentalPractices?.join(', ') || ''}
                            onChange={(e) => {
                              const practices = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingEntry(editingEntry ? {...editingEntry, environmentalPractices: practices} : null);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Water Conservation, Solar Power"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fair Trade Premium
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.fairTradePremium || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, fairTradePremium: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 15"
                          />
                          <p className="text-xs text-gray-500 mt-1">%</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Women Worker Percentage
                          </label>
                          <input
                            type="text"
                            value={editingEntry?.womenWorkerPercentage || ''}
                            onChange={(e) => setEditingEntry(editingEntry ? {...editingEntry, womenWorkerPercentage: e.target.value} : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., 60"
                          />
                          <p className="text-xs text-gray-500 mt-1">%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      {editingEntry && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(null);
                            setActiveTab('entries');
                          }}
                          className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <ArrowLeft className="h-5 w-5 mr-2" />
                          Cancel Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {editingEntry ? 'Update Coffee Entry' : 'Create Coffee Entry'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'entries' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Coffee Entries</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Showing entries for <span className="font-semibold text-amber-700">{sellerProfile.companyName}</span>
                      </p>
                    </div>
                  </div>

                  {entries.length === 0 ? (
                    <div className="rounded-2xl border border-amber-100 p-8 bg-white shadow-lg text-center">
                      <Coffee className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No coffee entries yet for {sellerProfile.companyName}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Start by creating your first coffee entry for this seller.
                      </p>
                      <button
                        onClick={() => setActiveTab('new')}
                        className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Entry
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-green-800 text-sm">
                          <strong>{entries.length}</strong> coffee {entries.length === 1 ? 'entry' : 'entries'} found for {sellerProfile.companyName}
                        </p>
                      </div>
                      
                      {entries.map((entry) => (
                        <div key={entry.id} className="bg-white rounded-xl p-6 border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-200">
                          {/* Entry Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{entry.coffeeName}</h3>
                              <div className="flex items-center space-x-3 text-sm">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4 text-amber-600" />
                                  <span className="text-amber-700 font-medium">{entry.origin || entry.country}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-600">{entry.harvestDate || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Award className="h-4 w-4 text-yellow-500" />
                                  <span className="text-gray-600">{entry.cuppingScore || 'N/A'}/100</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="inline-flex items-center px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => generateQRCode(entry)}
                                className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                              >
                                <QrCode className="h-4 w-4 mr-1" />
                                Download QR
                              </button>
                              <button
                                onClick={() => deleteEntry(entry.id)}
                                className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          {/* Entry Details Grid */}
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <span className="font-medium text-gray-500">Farm:</span>
                              <p className="text-gray-900">{entry.farm || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Farmer:</span>
                              <p className="text-gray-900">{entry.farmer || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Process:</span>
                              <p className="text-gray-900">{entry.process || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Variety:</span>
                              <p className="text-gray-900">{entry.variety || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Altitude:</span>
                              <p className="text-gray-900">{entry.altitude || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Farm Size:</span>
                              <p className="text-gray-900">{entry.farmSize || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Worker Count:</span>
                              <p className="text-gray-900">{entry.workerCount || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Seller ID:</span>
                              <p className="text-gray-900">{entry.sellerId || 'N/A'}</p>
                            </div>
                          </div>
                          
                          {/* Certifications and Environmental Practices */}
                          {(entry.certifications?.length > 0 || entry.environmentalPractices?.length > 0) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {entry.certifications?.map((cert, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                  {cert}
                                </span>
                              ))}
                              {entry.environmentalPractices?.map((practice, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  {practice}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Cupping Notes */}
                          {(entry.primaryNotes || entry.secondaryNotes) && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-700 mb-2">Cupping Notes</h4>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                {entry.primaryNotes && (
                                  <div>
                                    <span className="font-medium text-gray-500">Primary:</span>
                                    <p className="text-gray-900">{entry.primaryNotes}</p>
                                  </div>
                                )}
                                {entry.secondaryNotes && (
                                  <div>
                                    <span className="font-medium text-gray-500">Secondary:</span>
                                    <p className="text-gray-900">{entry.secondaryNotes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Seller Profile Management Header */}
                  <div className="rounded-2xl border border-amber-100 p-8 bg-white shadow-lg">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Seller Profile Management</h2>
                        <p className="text-sm text-gray-600 mt-2">
                          Admin control center for managing all seller profiles
                        </p>
                      </div>
                    </div>
                    
                    {/* Current Seller Info */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            {sellerProfile.logo ? (
                              <img 
                                src={sellerProfile.logo} 
                                alt={`${sellerProfile.companyName} logo`}
                                className="w-12 h-12 object-contain rounded-lg bg-white p-2"
                              />
                            ) : (
                              <Coffee className="h-8 w-8 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {sellerProfile.companyName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              ID: {selectedSellerId} • {sellerProfile.location}
                            </p>
                            <p className="text-xs text-amber-600 font-medium">
                              Currently editing this seller's profile
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => window.open(`/seller-profile/${selectedSellerId}`, '_blank')}
                            className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Public Profile
                          </button>
                          <button
                            onClick={() => window.open(`/sellers`, '_blank')}
                            className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            View All Sellers
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Profile Editing Form */}
                    <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Edit className="h-5 w-5 mr-2 text-amber-600" />
                        Edit Seller Profile
                      </h3>
                      
                      <form onSubmit={(e) => { e.preventDefault(); saveSellerProfile(sellerProfile); }} className="space-y-6">
                        {/* Basic Company Information */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h4 className="text-md font-semibold text-gray-800 mb-4">Basic Company Information</h4>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Company Name *
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.companyName}
                                onChange={(e) => setSellerProfile({...sellerProfile, companyName: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Company Size
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.companySize}
                                onChange={(e) => setSellerProfile({...sellerProfile, companySize: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="25 employees"
                              />
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mission Statement
                              </label>
                              <textarea
                                value={sellerProfile.mission}
                                onChange={(e) => setSellerProfile({...sellerProfile, mission: e.target.value})}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="Describe your company's mission and values..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Location
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.location}
                                onChange={(e) => setSellerProfile({...sellerProfile, location: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="City, State/Province, Country"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Country
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.country || ''}
                                onChange={(e) => setSellerProfile({...sellerProfile, country: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="e.g., Canada"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.city || ''}
                                onChange={(e) => setSellerProfile({...sellerProfile, city: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="e.g., Toronto"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h4 className="text-md font-semibold text-gray-800 mb-4">Contact Information</h4>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={sellerProfile.phone || ''}
                                onChange={(e) => setSellerProfile({...sellerProfile, phone: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={sellerProfile.email || ''}
                                onChange={(e) => setSellerProfile({...sellerProfile, email: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="orders@company.com"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Website
                              </label>
                              <input
                                type="url"
                                value={sellerProfile.website || ''}
                                onChange={(e) => setSellerProfile({...sellerProfile, website: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="https://company.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Order Link
                              </label>
                              <input
                                type="url"
                                value={sellerProfile.orderLink || ''}
                                onChange={(e) => setSellerProfile({...sellerProfile, orderLink: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="https://company.com/order"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Specialties and Certifications */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h4 className="text-md font-semibold text-gray-800 mb-4">Specialties & Certifications</h4>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Specialties (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.specialties.join(', ')}
                                onChange={(e) => {
                                  const specialties = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  setSellerProfile({...sellerProfile, specialties});
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="Single Origin, Organic, Fair Trade"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Certifications (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.certifications.join(', ')}
                                onChange={(e) => {
                                  const certifications = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  setSellerProfile({...sellerProfile, certifications});
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="Organic, Fair Trade, Direct Trade"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Default Price Per Bag
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.defaultPricePerBag || ''}
                                onChange={(e) => setSellerProfile({...sellerProfile, defaultPricePerBag: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="$24.99"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Member Since
                              </label>
                              <input
                                type="number"
                                value={sellerProfile.memberSince}
                                onChange={(e) => setSellerProfile({...sellerProfile, memberSince: parseInt(e.target.value) || 2024})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                min="1900"
                                max="2030"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h4 className="text-md font-semibold text-gray-800 mb-4">Social Media</h4>
                          
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Instagram
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.socialMedia.instagram || ''}
                                onChange={(e) => setSellerProfile({
                                  ...sellerProfile,
                                  socialMedia: { ...sellerProfile.socialMedia, instagram: e.target.value }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="@yourcompany"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Facebook
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.socialMedia.facebook || ''}
                                onChange={(e) => setSellerProfile({
                                  ...sellerProfile,
                                  socialMedia: { ...sellerProfile.socialMedia, facebook: e.target.value }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="Your Company"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Twitter
                              </label>
                              <input
                                type="text"
                                value={sellerProfile.socialMedia.twitter || ''}
                                onChange={(e) => setSellerProfile({
                                  ...sellerProfile,
                                  socialMedia: { ...sellerProfile.socialMedia, twitter: e.target.value }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="@yourcompany"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Team Members */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h4 className="text-md font-semibold text-gray-800 mb-4">Team Members</h4>
                          
                          <div className="space-y-4">
                            {sellerProfile.teamMembers.map((member, index) => (
                              <div key={member.id} className="grid md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Name
                                  </label>
                                  <input
                                    type="text"
                                    value={member.name}
                                    onChange={(e) => {
                                      const newTeamMembers = [...sellerProfile.teamMembers];
                                      newTeamMembers[index].name = e.target.value;
                                      setSellerProfile({...sellerProfile, teamMembers: newTeamMembers});
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Occupation
                                  </label>
                                  <input
                                    type="text"
                                    value={member.occupation}
                                    onChange={(e) => {
                                      const newTeamMembers = [...sellerProfile.teamMembers];
                                      newTeamMembers[index].occupation = e.target.value;
                                      setSellerProfile({...sellerProfile, teamMembers: newTeamMembers});
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="flex items-end space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTeamMembers = sellerProfile.teamMembers.filter((_, i) => i !== index);
                                      setSellerProfile({...sellerProfile, teamMembers: newTeamMembers});
                                    }}
                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => {
                                const newMember = {
                                  id: Date.now().toString(),
                                  name: '',
                                  occupation: '',
                                  image: undefined
                                };
                                setSellerProfile({
                                  ...sellerProfile,
                                  teamMembers: [...sellerProfile.teamMembers, newMember]
                                });
                              }}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              + Add Team Member
                            </button>
                          </div>
                        </div>
                        
                        {/* Save Button */}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <Save className="h-5 w-5 mr-2" />
                            Save Profile Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Migration Tab */}
              {activeTab === 'migration' && (
                <div className="rounded-2xl border border-amber-100 p-8 bg-white shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Slug Migration Tool</h2>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>About Slug Migration:</strong> This tool migrates existing coffee entries from the old slug format to a new, simplified format that's more user-friendly and SEO-optimized.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Migration Info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-800 mb-2">New Slug Format:</h3>
                      <ul className="space-y-1 text-sm text-amber-700">
                        <li>• <strong>Old:</strong> <code>christopher-salazar/cafe-santuario-monteverde-costa-rica-1755487690831</code></li>
                        <li>• <strong>New:</strong> <code>cafe-santuario-monteverde-costa-rica-COFFEE-0831</code></li>
                      </ul>
                      <p className="text-sm text-amber-600 mt-2">
                        <strong>Benefits:</strong> Shorter URLs, persistent IDs, better SEO, easier sharing
                      </p>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 mb-2">Quick Actions</h3>
                        <div className="space-y-2">
                          <Link 
                            href="/admin/slug-migration" 
                            className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                          >
                            Open Migration Tool
                          </Link>
                          <p className="text-xs text-green-700">
                            Access the full migration interface with validation and detailed results
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">What This Migration Does:</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Converts long, complex slugs to short, readable ones</li>
                      <li>• Preserves unique coffee IDs for persistent identification</li>
                      <li>• Updates QR codes to use new format</li>
                      <li>• Maintains all existing coffee data</li>
                      <li>• Improves URL readability and SEO</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}