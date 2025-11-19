/**
 * Seller Analytics Page
 * Displays comprehensive analytics based on seller's subscription tier
 * Shows real business insights that coffee sellers care about
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSimpleAuth } from '../../../hooks/useSimpleAuth';
import TierBasedAnalytics from '../../../components/TierBasedAnalytics';
import { ArrowLeft, BarChart3, TrendingUp, Crown } from 'lucide-react';
import Link from 'next/link';

export default function SellerAnalyticsPage() {
  const { user, signOut } = useSimpleAuth();
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'basic' | 'premium' | 'enterprise'>('basic');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'expired'>('active');
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user's subscription information
   * In a real app, this would come from your subscription service
   */
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        setLoading(true);
        
        // Mock subscription data - replace with real API call
        // For demo purposes, we'll simulate different tiers
        const mockSubscriptions = {
          'seller@coffeebreak.com': { tier: 'free', status: 'active' },
          'basic@coffeebreak.com': { tier: 'basic', status: 'active' },
          'premium@coffeebreak.com': { tier: 'premium', status: 'active' },
          'enterprise@coffeebreak.com': { tier: 'enterprise', status: 'active' }
        };
        
        if (user?.email) {
          const subInfo = mockSubscriptions[user.email as keyof typeof mockSubscriptions];
          if (subInfo) {
            setSubscriptionTier(subInfo.tier as any);
            setSubscriptionStatus(subInfo.status as any);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        // Default to basic tier if there's an error
        setSubscriptionTier('basic');
        setSubscriptionStatus('active');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubscriptionInfo();
    }
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Access Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your analytics dashboard.</p>
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/seller-dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {user.email} • {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                subscriptionTier === 'free' ? 'bg-gray-100 text-gray-600' :
                subscriptionTier === 'basic' ? 'bg-blue-100 text-blue-600' :
                subscriptionTier === 'premium' ? 'bg-purple-100 text-purple-600' :
                'bg-amber-100 text-amber-600'
              }`}>
                {subscriptionTier === 'free' && <BarChart3 className="h-4 w-4 mr-1" />}
                {subscriptionTier === 'basic' && <BarChart3 className="h-4 w-4 mr-1" />}
                {subscriptionTier === 'premium' && <TrendingUp className="h-4 w-4 mr-1" />}
                {subscriptionTier === 'enterprise' && <Crown className="h-4 w-4 mr-1" />}
                {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
              </div>
              
              <button
                onClick={signOut}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <TierBasedAnalytics
        subscriptionTier={subscriptionTier}
        subscriptionStatus={subscriptionStatus}
        sellerId={user.id || user.email}
      />
    </div>
  );
}
