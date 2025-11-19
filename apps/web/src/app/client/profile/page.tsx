'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, User, LogOut, ArrowLeft, Bookmark, Star, MapPin, Calendar, Trash2, ExternalLink } from 'lucide-react';
import { useSimpleAuth } from '../../../hooks/useSimpleAuth';
import Header from '../../../components/Header';
import { Toast } from '../../../components/Toast';

interface SavedCoffee {
  id: string;
  coffeeId: string;
  coffeeName: string;
  origin: string;
  farm: string;
  farmer: string;
  process: string;
  cuppingScore: string;
  notes: string;
  savedAt: string;
  slug?: string;
}

export default function CustomerProfilePage() {
  const { user, isAuthenticated, signOut } = useSimpleAuth();
  const [savedCoffees, setSavedCoffees] = useState<SavedCoffee[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

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

  /**
   * Fetches the user's saved coffees from the API
   */
  const fetchSavedCoffees = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/saved-coffees?userId=${user.id}`);
      if (response.ok) {
        const result = await response.json();
        setSavedCoffees(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching saved coffees:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Removes a coffee from the user's saved list
   */
  const removeSavedCoffee = async (saveId: string) => {
    try {
      const response = await fetch(`/api/saved-coffees?id=${saveId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSavedCoffees(prev => prev.filter(coffee => coffee.id !== saveId));
        setToast({
          message: 'Coffee removed from saved list',
          type: 'success',
          isVisible: true
        });
      } else {
        setToast({
          message: 'Failed to remove coffee',
          type: 'error',
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Error removing saved coffee:', error);
      setToast({
        message: 'Failed to remove coffee',
        type: 'error',
        isVisible: true
      });
    }
  };

  /**
   * Handles password change form submission
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({
        message: 'New passwords do not match',
        type: 'error',
        isVisible: true
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setToast({
        message: 'Password must be at least 8 characters long',
        type: 'error',
        isVisible: true
      });
      return;
    }

    try {
      setChangingPassword(true);
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
          userId: user?.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        setToast({
          message: 'Password updated successfully!',
          type: 'success',
          isVisible: true
        });
        // Clear form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setToast({
          message: result.message || 'Failed to update password',
          type: 'error',
          isVisible: true
        });
      }
    } catch (error) {
      setToast({
        message: 'An error occurred while updating password',
        type: 'error',
        isVisible: true
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Load saved coffees when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSavedCoffees();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <Header showBackButton={true} backHref="/" backText="Back to Home" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="mb-8">
          <div className="rounded-2xl border border-amber-100 p-8 bg-white shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Profile Information</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {user?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {user?.email}
                </div>
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="mb-8">
          <div className="rounded-2xl border border-amber-100 p-8 bg-white shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Saved Coffees Section */}
        <div className="mb-8">
          <div className="rounded-2xl border border-amber-100 p-8 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Saved Coffees</h2>
              <div className="flex items-center space-x-2 text-amber-600">
                <Bookmark className="h-5 w-5" />
                <span className="text-sm font-medium">{savedCoffees.length} coffee{savedCoffees.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your saved coffees...</p>
              </div>
            ) : savedCoffees.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-16 w-16 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved coffees yet</h3>
                <p className="text-gray-500 mb-6">Start exploring and save your favorite coffees to view them here later.</p>
                <Link
                  href="/coffees"
                  className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
                >
                  <Coffee className="h-5 w-5 mr-2" />
                  Explore Coffees
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCoffees.map((savedCoffee) => (
                  <div key={savedCoffee.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{savedCoffee.coffeeName}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-amber-500" />
                            {savedCoffee.origin}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Coffee className="h-4 w-4 mr-2 text-amber-500" />
                            {savedCoffee.farm}
                          </div>
                          {savedCoffee.cuppingScore && (
                            <div className="flex items-center text-gray-600">
                              <Star className="h-4 w-4 mr-2 text-amber-500" />
                              Cupping Score: {savedCoffee.cuppingScore}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeSavedCoffee(savedCoffee.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from saved list"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="pt-4 border-t border-amber-200">
                      <div className="flex items-center justify-between text-xs text-amber-600">
                        <span>Saved {new Date(savedCoffee.savedAt).toLocaleDateString()}</span>
                        <Link
                          href={`/coffees/${savedCoffee.slug || savedCoffee.coffeeId}`}
                          className="inline-flex items-center text-amber-600 hover:text-amber-800 transition-colors"
                        >
                          View Details
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4">
            <Link
              href="/coffees"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              <Coffee className="h-5 w-5 mr-2" />
              Explore Coffees
            </Link>
            <Link
              href="/sellers"
              className="inline-flex items-center px-6 py-3 bg-white text-amber-700 font-semibold rounded-xl border-2 border-amber-200 hover:bg-amber-50 transition-colors"
            >
              <User className="h-5 w-5 mr-2" />
              Meet Our Sellers
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
