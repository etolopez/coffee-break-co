import { useState, useEffect } from 'react';
import { useSimpleAuth } from './useSimpleAuth';

interface TeamMember {
  id: string;
  name: string;
  occupation: string;
  image?: string;
}

interface SellerProfile {
  id: string;
  companyName: string;
  companySize: string;
  mission: string;
  phone?: string;
  email?: string;
  logo?: string;
  // Enhanced seller profile fields
  location: string;
  rating: number; // Average rating (calculated from user reviews)
  totalCoffees: number; // Total coffee offerings
  memberSince: number;
  specialties: string[]; // Specialty tags
  featuredCoffeeId: string; // ID of the featured coffee
  description: string; // Predefined description template key
  // Client page settings
  website?: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  defaultPricePerBag: string;
  orderLink: string;
  // User reviews/ratings (future implementation)
  reviews: any[];
  teamMembers: TeamMember[];
}

/**
 * Hook for managing seller profile data
 * Now integrates with authentication to ensure user-specific data
 * @param sellerId - Optional specific seller ID to fetch
 * @returns Object containing seller profile, loading state, and reload function
 */
export const useSellerProfile = (sellerId?: string) => {
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useSimpleAuth();

  const loadSellerProfile = async () => {
    try {
      setLoading(true);
      
      if (sellerId) {
        // Fetch specific seller profile (for viewing other sellers)
        const endpoint = `/api/seller-profile/${sellerId}`;
        const response = await fetch(`${endpoint}?t=${Date.now()}`);
        const result = await response.json();
        
        if (result.success) {
          setSellerProfile(result.data);
        } else {
          console.error('Failed to load seller profile:', result.error);
          setSellerProfile(null);
        }
      } else if (isAuthenticated && user?.role === 'seller') {
        // Fetch current user's seller profile
        const endpoint = '/api/seller-profile';
        const params = new URLSearchParams({
          userId: user.id || user.sellerId || 'unknown',
          userRole: user.role
        });
        
        const response = await fetch(`${endpoint}?${params}&t=${Date.now()}`);
        const result = await response.json();
        
        if (result.success) {
          setSellerProfile(result.data);
        } else {
          console.error('Failed to load user seller profile:', result.error);
          setSellerProfile(null);
        }
      } else if (isAuthenticated && user?.role === 'admin') {
        // For admins, fetch the first seller as a demo
        const endpoint = '/api/seller-profile';
        const params = new URLSearchParams({
          userId: 'admin-demo',
          userRole: 'admin'
        });
        
        const response = await fetch(`${endpoint}?${params}&t=${Date.now()}`);
        const result = await response.json();
        
        if (result.success) {
          setSellerProfile(result.data);
        } else {
          console.error('Failed to load admin demo profile:', result.error);
          setSellerProfile(null);
        }
      } else {
        // No authenticated user or not a seller
        setSellerProfile(null);
      }
    } catch (error) {
      console.error('❌ Failed to load seller profile:', error);
      setSellerProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Reload profile when user changes
  useEffect(() => {
    loadSellerProfile();
  }, [sellerId, user?.id, user?.role, isAuthenticated]);

  return { 
    sellerProfile, 
    loading, 
    reload: loadSellerProfile,
    isUserSeller: isAuthenticated && user?.role === 'seller',
    currentUserId: user?.id || user?.sellerId
  };
};
