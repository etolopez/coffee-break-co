/**
 * Tier-Based Seller Dashboard Component
 * Shows different dashboard features based on user's subscription tier
 * Free users see limited features, paid users see full customization options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  BarChart3, 
  Users, 
  Image, 
  Settings, 
  Upload, 
  Lock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Star,
  TrendingUp,
  QrCode,
  Building,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

interface TierBasedSellerDashboardProps {
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  coffeeCount: number;
  sellerProfile: any;
}

export default function TierBasedSellerDashboard({ 
  subscriptionTier = 'free', 
  subscriptionStatus = 'active',
  coffeeCount = 0,
  sellerProfile = {}
}: TierBasedSellerDashboardProps) {

  // Tier configurations with feature availability
  const tierConfig = {
    free: {
      name: 'Free',
      color: 'gray',
      coffeeLimit: 1,
      canUploadImages: false,
      canCustomizeProfile: false,
      analyticsAccess: 'none',
      features: ['Basic profile (no custom images)', '1 coffee upload', 'Community support', 'QR code generation'],
      upgradeMessage: 'Upgrade to Basic to unlock image uploads and profile customization',
      upgradeTier: 'basic'
    },
    basic: {
      name: 'Basic',
      color: 'blue',
      coffeeLimit: 5,
      canUploadImages: true,
      canCustomizeProfile: true,
      analyticsAccess: 'basic',
      features: ['5 coffee uploads', 'Basic analytics', 'Full profile customization', 'Custom logo & images', 'Email support'],
      upgradeMessage: 'Upgrade to Premium for advanced analytics and more uploads',
      upgradeTier: 'premium'
    },
    premium: {
      name: 'Premium',
      color: 'purple',
      coffeeLimit: 15,
      canUploadImages: true,
      canCustomizeProfile: true,
      analyticsAccess: 'advanced',
      features: ['15 coffee uploads', 'Advanced analytics', 'Full profile customization', 'Custom logo & images', 'Priority support'],
      upgradeMessage: 'Upgrade to Enterprise for unlimited uploads and enterprise features',
      upgradeTier: 'enterprise'
    },
    enterprise: {
      name: 'Enterprise',
      color: 'amber',
      coffeeLimit: -1,
      canUploadImages: true,
      canCustomizeProfile: true,
      analyticsAccess: 'full',
      features: ['Unlimited uploads', 'Full analytics suite', 'Full profile customization', 'Custom logo & images', 'Dedicated support'],
      upgradeMessage: 'You have access to all features!',
      upgradeTier: null
    }
  };

  const currentTier = tierConfig[subscriptionTier];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              subscriptionTier === 'free' ? 'bg-gray-100 text-gray-600' :
              subscriptionTier === 'basic' ? 'bg-blue-100 text-blue-600' :
              subscriptionTier === 'premium' ? 'bg-purple-100 text-purple-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              {subscriptionTier === 'free' && <Building className="h-6 w-6" />}
              {subscriptionTier === 'basic' && <BarChart3 className="h-6 w-6" />}
              {subscriptionTier === 'premium' && <TrendingUp className="h-6 w-6" />}
              {subscriptionTier === 'enterprise' && <Crown className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sellerProfile.companyName || 'Your Coffee Business'} Dashboard
              </h1>
              <p className="text-gray-600">
                {currentTier.name} Plan • {subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          
          {subscriptionTier !== 'enterprise' && (
            <div className="text-right">
              <p className="text-sm text-gray-600">{currentTier.upgradeMessage}</p>
              <button className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                Upgrade to {currentTier.upgradeTier?.charAt(0).toUpperCase() + currentTier.upgradeTier?.slice(1)}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Coffee Upload Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Coffee Upload Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{coffeeCount}</div>
              <div className="text-sm text-gray-600">Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {currentTier.coffeeLimit === -1 ? '∞' : currentTier.coffeeLimit}
              </div>
              <div className="text-sm text-gray-600">Limit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {currentTier.coffeeLimit === -1 ? '∞' : Math.max(0, currentTier.coffeeLimit - coffeeCount)}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>
          
          {currentTier.coffeeLimit !== -1 && coffeeCount >= currentTier.coffeeLimit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Upload limit reached. Upgrade to upload more coffees.</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile Customization Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Customization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {currentTier.canUploadImages ? (
                <div>
                  <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Company Logo</h3>
                  <p className="text-gray-600 mb-4">Upload your company logo to personalize your profile</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Upload Logo
                  </button>
                </div>
              ) : (
                <div className="opacity-60">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Company Logo</h3>
                  <p className="text-gray-600 mb-4">Upgrade to Basic to upload custom images</p>
                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    <Lock className="h-4 w-4 mr-1" />
                    Free Plan
                  </div>
                </div>
              )}
            </div>

            {/* Profile Settings */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {currentTier.canCustomizeProfile ? (
                <div>
                  <Settings className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Profile Settings</h3>
                  <p className="text-gray-600 mb-4">Customize your business profile and branding</p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Customize Profile
                  </button>
                </div>
              ) : (
                <div className="opacity-60">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Profile Settings</h3>
                  <p className="text-gray-600 mb-4">Upgrade to Basic to customize your profile</p>
                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    <Lock className="h-4 w-4 mr-1" />
                    Free Plan
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics & Insights</h2>
          
          {currentTier.analyticsAccess === 'none' ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Access</h3>
              <p className="text-gray-600 mb-4">Upgrade to Basic to view analytics and insights</p>
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-full">
                <Lock className="h-4 w-4 mr-2" />
                Free Plan
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">1,250</div>
                <div className="text-sm text-blue-700">Total Views</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">4.2</div>
                <div className="text-sm text-green-700">Avg Rating</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-sm text-purple-700">Reviews</div>
              </div>
            </div>
          )}
        </div>

        {/* Current Plan Features */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your {currentTier.name} Plan Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTier.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
