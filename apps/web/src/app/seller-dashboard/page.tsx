'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Plus, QrCode, ArrowLeft, MapPin, Calendar, Award, Leaf, Users, Save, Eye, Download, Edit, Trash2, Droplets, LogOut, User, Star, MessageCircle, ChevronDown, Menu, X, Smartphone, ShoppingBag, BarChart3 } from 'lucide-react';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';
import Header from '../../components/Header';
import SellerAnalytics from '../../components/SellerAnalytics';

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
  farmPhotos?: string[];
  roastingCurveImage?: string;
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

// Comprehensive country list
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
].sort();

const DESCRIPTION_TEMPLATES = {
  'premium-sourcing': 'Connecting coffee lovers with exceptional farmers worldwide through transparent, sustainable sourcing.',
  'family-tradition': 'Premium coffee from our family estate, maintaining tradition for over 50 years.',
  'high-altitude': 'High-altitude coffee from the region, known for its bright acidity and complex flavor profile.',
  'sustainable-focus': 'Committed to sustainable farming and community development initiatives.',
  'single-origin': 'Specializing in single-origin coffees that showcase unique terroir and processing methods.',
  'artisan-roasted': 'Small-batch artisan roasted coffees with meticulous attention to flavor development.',
  'direct-trade': 'Building direct relationships with farmers to ensure quality and fair compensation.'
};

const SPECIALTY_OPTIONS = [
  'Single Origin', 'Organic', 'Fair Trade', 'Direct Trade', 'Rainforest Alliance', 
  'Bird Friendly', 'Estate Grown', 'Blue Mountain', 'Limited Edition', 
  'High Altitude', 'Washed Process', 'Natural Process', 'Honey Process',
  'Estate Reserve', 'Micro Lot', 'Competition Grade', 'Ceremonial Grade'
];

const COFFEE_COUNTRIES = [
  'Ethiopia', 'Colombia', 'Brazil', 'Vietnam', 'Indonesia', 'Honduras', 'India', 'Peru', 'Guatemala', 'Mexico',
  'Nicaragua', 'Costa Rica', 'El Salvador', 'Ecuador', 'Venezuela', 'Bolivia', 'Paraguay', 'Argentina', 'Chile',
  'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'Democratic Republic of Congo', 'Cameroon', 'Ivory Coast',
  'Ghana', 'Sierra Leone', 'Liberia', 'Madagascar', 'Comoros', 'Yemen', 'Thailand', 'Myanmar', 'Laos',
  'Cambodia', 'Philippines', 'Papua New Guinea', 'Timor-Leste', 'Hawaii (USA)', 'Puerto Rico', 'Dominican Republic',
  'Haiti', 'Jamaica', 'Panama', 'Belize', 'Uruguay', 'Australia', 'New Zealand', 'Fiji', 'Vanuatu', 'Solomon Islands'
].sort();

export default function SellerDashboardPage() {
  const { user, signOut } = useSimpleAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'entries' | 'profile' | 'analytics'>('new');
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<CoffeeEntry | null>(null);
  const [entries, setEntries] = useState<CoffeeEntry[]>([]);
  const [commentsData, setCommentsData] = useState<{[key: string]: any[]}>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const [sellerProfile, setSellerProfile] = useState<SellerProfile>({
    id: user?.id || '1',
    companyName: user?.name || 'Your Company',
    companySize: '25 employees',
    mission: 'Connecting coffee lovers with exceptional farmers worldwide through transparent, sustainable sourcing.',
    logo: undefined,
    phone: '+1 (555) 123-4567',
    email: user?.email || 'orders@yourcompany.com',
    location: 'Your Location',
    rating: 0,
    totalCoffees: 0,
    memberSince: 2024,
    specialties: ['Single Origin', 'Organic', 'Fair Trade'],
    featuredCoffeeId: '',
    description: 'premium-sourcing',
    website: 'https://yourcompany.com',
    socialMedia: {
      instagram: '@yourcompany',
      facebook: 'Your Company',
      twitter: '@yourcompany'
    },
    defaultPricePerBag: '$24.99',
    orderLink: 'https://yourcompany.com/order',
    reviews: [],
    teamMembers: [
      {
        id: '1',
        name: 'Your Name',
        occupation: 'Head of Sourcing',
        image: undefined
      }
    ]
  });

  const [formData, setFormData] = useState<Omit<CoffeeEntry, 'id' | 'qrCode'>>({
    coffeeName: '',
    country: '',
    specificLocation: '',
    origin: '',
    farm: '',
    farmer: '',
    altitude: '',
    variety: '',
    process: '',
    harvestDate: '',
    processingDate: '',
    cuppingScore: '',
    notes: '',
    farmSize: '',
    workerCount: '',
    certifications: [],
    coordinates: { lat: 0, lng: 0 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: '',
    producerPortrait: undefined,
    producerBio: '',
    roastedBy: '',
    fermentationTime: '',
    dryingTime: '',
    moistureContent: '',
    screenSize: '',
    beanDensity: '',
    aroma: '',
    flavor: '',
    acidity: '',
    body: '',
    primaryNotes: '',
    secondaryNotes: '',
    finish: '',
    roastRecommendation: '',
    roastDevelopmentCurve: undefined,
    environmentalPractices: [],
    fairTradePremium: '',
    communityProjects: '',
    womenWorkerPercentage: '',
    pricePerBag: '',
    available: true,
    orderLink: '',
    sellerId: user?.id
  });

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load coffee entries for the current seller
  const loadCoffeeEntries = async () => {
    if (!user?.id) {
      console.error('No user ID available for loading coffee entries');
      return;
    }
    
    try {
      const response = await fetch(`/api/coffee-entries?sellerId=${user.id}&t=${Date.now()}`);
      const result = await response.json();
      
      if (result.success) {
        // Filter entries for the current seller
        const sellerEntries = result.data.filter((entry: CoffeeEntry) => entry.sellerId === user.id);
        setEntries(sellerEntries);
        
        // Update seller profile with coffee count
        setSellerProfile(prev => ({
          ...prev,
          totalCoffees: sellerEntries.length,
          featuredCoffeeId: prev.featuredCoffeeId || (sellerEntries.length > 0 ? sellerEntries[sellerEntries.length - 1].id : '')
        }));
        
        // Load comments for all coffee entries
        await loadCommentsForEntries(sellerEntries);
      }
    } catch (error) {
      console.error('Failed to load coffee entries:', error);
    }
  };

  // Load comments for coffee entries
  const loadCommentsForEntries = async (coffeeEntries: CoffeeEntry[]) => {
    try {
      const commentsPromises = coffeeEntries.map(async (entry) => {
        const response = await fetch(`/api/comments?coffeeId=${entry.id}&t=${Date.now()}`);
        const result = await response.json();
        return { coffeeId: entry.id, comments: result.success ? result.data : [] };
      });
      
      const commentsResults = await Promise.all(commentsPromises);
      const commentsMap: {[key: string]: any[]} = {};
      commentsResults.forEach(({ coffeeId, comments }) => {
        commentsMap[coffeeId] = comments;
      });
      
      setCommentsData(commentsMap);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  // Get overall seller score
  const getOverallSellerScore = () => {
    let totalRating = 0;
    let totalReviews = 0;
    
    Object.values(commentsData).forEach(comments => {
      comments.forEach(comment => {
        if (comment.rating) {
          totalRating += comment.rating;
          totalReviews++;
        }
      });
    });
    
    const overallRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    return { overallRating, totalReviews };
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle coordinate changes
  const handleCoordinateChange = (coord: 'lat' | 'lng', value: string) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [coord]: parseFloat(value) || 0
      }
    }));
  };

  // Handle certifications
  const [certificationsText, setCertificationsText] = useState('');
  const handleCertificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCertificationsText(e.target.value);
  };
  const handleCertificationsBlur = () => {
    const certs = certificationsText.split(',').map(c => c.trim()).filter(c => c);
    setFormData(prev => ({ ...prev, certifications: certs }));
  };

  // Handle environmental practices
  const [environmentalPracticesText, setEnvironmentalPracticesText] = useState('');
  const handleEnvironmentalPracticesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEnvironmentalPracticesText(e.target.value);
  };
  const handleEnvironmentalPracticesBlur = () => {
    const practices = environmentalPracticesText.split(',').map(p => p.trim()).filter(p => p);
    setFormData(prev => ({ ...prev, environmentalPractices: practices }));
  };

  // Handle image uploads
  const handleImageUpload = (field: 'farmImage' | 'farmerImage', file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Construct origin field
  const constructOrigin = (country: string, specificLocation: string) => {
    if (specificLocation && country) {
      return `${specificLocation}, ${country}`;
    }
    return country || specificLocation;
  };

  // Save new coffee entry
  const saveCoffeeEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/coffee-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sellerId: user?.id,
          origin: constructOrigin(formData.country, formData.specificLocation)
        }),
      });
      
      if (response.ok) {
        // Reset form
        setFormData({
          coffeeName: '',
          country: '',
          specificLocation: '',
          origin: '',
          farm: '',
          farmer: '',
          altitude: '',
          variety: '',
          process: '',
          harvestDate: '',
          processingDate: '',
          cuppingScore: '',
          notes: '',
          farmSize: '',
          workerCount: '',
          certifications: [],
          coordinates: { lat: 0, lng: 0 },
          farmImage: undefined,
          farmerImage: undefined,
          producerName: '',
          producerPortrait: undefined,
          producerBio: '',
          roastedBy: '',
          fermentationTime: '',
          dryingTime: '',
          moistureContent: '',
          screenSize: '',
          beanDensity: '',
          aroma: '',
          flavor: '',
          acidity: '',
          body: '',
          primaryNotes: '',
          secondaryNotes: '',
          finish: '',
          roastRecommendation: '',
          roastDevelopmentCurve: undefined,
          environmentalPractices: [],
          fairTradePremium: '',
          communityProjects: '',
          womenWorkerPercentage: '',
          pricePerBag: '',
          available: true,
          orderLink: '',
          sellerId: user?.id
        });
        
        // Reset text inputs
        setCertificationsText('');
        setEnvironmentalPracticesText('');
        
        // Reset all form fields to initial state
        setFormData({
          coffeeName: '',
          country: '',
          specificLocation: '',
          origin: '',
          farm: '',
          farmer: '',
          altitude: '',
          variety: '',
          process: '',
          harvestDate: '',
          processingDate: '',
          cuppingScore: '',
          notes: '',
          farmSize: '',
          workerCount: '',
          certifications: [],
          coordinates: { lat: 0, lng: 0 },
          farmImage: undefined,
          farmerImage: undefined,
          producerName: '',
          producerPortrait: undefined,
          producerBio: '',
          roastedBy: '',
          fermentationTime: '',
          dryingTime: '',
          moistureContent: '',
          screenSize: '',
          beanDensity: '',
          aroma: '',
          flavor: '',
          acidity: '',
          body: '',
          primaryNotes: '',
          secondaryNotes: '',
          finish: '',
          roastRecommendation: '',
          roastDevelopmentCurve: undefined,
          environmentalPractices: [],
          fairTradePremium: '',
          communityProjects: '',
          womenWorkerPercentage: '',
          pricePerBag: '',
          available: true,
          orderLink: '',
          sellerId: user?.id
        });
        
        // Reload entries
        await loadCoffeeEntries();
        
        // Switch to entries tab
        setActiveTab('entries');
        
        alert('Coffee entry saved successfully!');
      }
    } catch (error) {
      alert('Failed to save coffee entry. Please try again.');
    }
  };

  // Delete coffee entry
  const deleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this coffee entry? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/coffee-entries?id=${entryId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadCoffeeEntries();
      }
    } catch (error) {
      console.error('Failed to delete coffee entry:', error);
    }
  };

  // Download QR code as image
  const downloadQRCode = async (entry: CoffeeEntry) => {
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
      
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  // Handle edit input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingEntry) {
      setEditingEntry(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  // Handle edit file changes
  const handleEditFileChange = async (field: string, files: FileList | null) => {
    if (!editingEntry || !files || files.length === 0) return;

    try {
      if (field === 'farmPhotos') {
        // Handle single farm photo (limit to 1 as requested)
        const file = files[0]; // Only take the first file
        const tempUrl = URL.createObjectURL(file);
        
        setEditingEntry(prev => prev ? { ...prev, farmPhotos: [tempUrl] } : null);
      } else if (field === 'roastingCurveImage') {
        // Handle single roasting curve image
        const file = files[0];
        const tempUrl = URL.createObjectURL(file);
        setEditingEntry(prev => prev ? { ...prev, roastingCurveImage: tempUrl } : null);
      }
    } catch (error) {
      console.error('Error handling file change:', error);
      alert('Error processing file. Please try again.');
    }
  };

  // Remove farm photo from edit form
  const removeEditPhoto = (index: number) => {
    if (editingEntry && editingEntry.farmPhotos) {
      // Since we only allow 1 photo now, just clear the array
      setEditingEntry(prev => prev ? { ...prev, farmPhotos: [] } : null);
    }
  };

  // Remove roasting curve from edit form
  const removeEditRoastingCurve = () => {
    if (editingEntry) {
      setEditingEntry(prev => prev ? { ...prev, roastingCurveImage: undefined } : null);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all text fields
      Object.entries(editingEntry).forEach(([key, value]) => {
        if (key === 'farmPhotos' && Array.isArray(value)) {
          // Handle farm photos array - check if it's a new file or existing URL
          if (value.length > 0 && value[0].startsWith('blob:')) {
            // This is a new file, we need to handle it properly
            // For now, we'll skip it to avoid storing blob URLs
            console.log('Skipping blob URL for farm photos - needs proper file upload handling');
          } else {
            // This is an existing URL, send it
            formData.append('farmPhotos', JSON.stringify(value));
          }
        } else if (key === 'roastingCurveImage' && value) {
          // Handle roasting curve image - check if it's a new file or existing URL
          if (typeof value === 'string' && value.startsWith('blob:')) {
            // This is a new file, we need to handle it properly
            // For now, we'll skip it to avoid storing blob URLs
            console.log('Skipping blob URL for roasting curve - needs proper file upload handling');
          } else {
            // This is an existing URL, send it
            formData.append('roastingCurveImage', value as string);
          }
        } else if (key === 'certifications' && Array.isArray(value)) {
          // Handle certifications array
          formData.append('certifications', JSON.stringify(value));
        } else if (key === 'environmentalPractices' && Array.isArray(value)) {
          // Handle environmental practices array
          formData.append('environmentalPractices', JSON.stringify(value));
        } else if (key === 'coordinates' && typeof value === 'object') {
          // Handle coordinates object
          formData.append('coordinates', JSON.stringify(value));
        } else if (value !== null && value !== undefined && value !== '') {
          // Handle regular text fields
          formData.append(key, String(value));
        }
      });

      const response = await fetch(`/api/coffee-entries?id=${editingEntry.id}`, {
        method: 'PUT',
        body: formData, // Don't set Content-Type header for FormData
      });
      
      if (response.ok) {
        alert('Coffee entry updated successfully! Note: New images need proper file upload handling and were not saved.');
        setEditingEntry(null);
        await loadCoffeeEntries(); // Reload the entries
      } else {
        alert('Failed to update coffee entry. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update coffee entry:', error);
      alert('Failed to update coffee entry. Please try again.');
    }
  };

  // Load seller profile from backend
  const loadSellerProfile = async () => {
    if (!user?.id) {
      console.error('No user ID available for loading seller profile');
      return;
    }
    
    try {
      const response = await fetch(`/api/seller-profile?userId=${user.id}&userRole=seller&t=${Date.now()}`);
      const result = await response.json();
      if (result.success && result.data) {
        // Ensure arrays are always defined to prevent map errors
        const profileData = {
          ...result.data,
          teamMembers: result.data.teamMembers || [],
          specialties: result.data.specialties || [],
          reviews: result.data.reviews || [],
          certifications: result.data.certifications || [],
          environmentalPractices: result.data.environmentalPractices || []
        };
        setSellerProfile(profileData);
      }
    } catch (error) {
      console.error('Failed to load seller profile:', error);
    }
  };

  // Save seller profile
  const saveSellerProfile = async () => {
    if (!user?.id) {
      console.error('No user ID available for saving seller profile');
      alert('User not authenticated. Please sign in again.');
      return;
    }
    
    try {
      const response = await fetch(`/api/seller-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sellerProfile,
          userId: user.id,
          userRole: 'seller'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Profile saved successfully!');
          // Reload the profile to ensure we have the latest data
          await loadSellerProfile();
        } else {
          console.error('API returned error:', result);
          alert(`Failed to save profile: ${result.error || 'Unknown error'}`);
        }
      } else {
        const errorText = await response.text();
        console.error('HTTP error response:', response.status, errorText);
        alert(`Failed to save profile. HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Wait for user to be available
      if (!user?.id) {
        console.log('⏳ Waiting for user authentication...');
        return;
      }
      
      setLoading(true);
      try {
        console.log('🚀 Loading dashboard data for user:', user.id);
        await Promise.all([
          loadCoffeeEntries(),
          loadSellerProfile()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Only load data when user is available
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Mobile-specific viewport and touch optimizations */}
        <div className="sm:hidden">
          <style jsx>{`
            button, input, select, textarea {
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
            }
            input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select {
              font-size: 16px;
            }
            html {
              scroll-behavior: smooth;
            }
          `}</style>
        </div>

        {/* Header */}
        <Header 
          showBackButton={true} 
          useSmartBack={true} 
          backText="Back to Home"
          title="Seller Dashboard"
          subtitle="Manage your coffee entries and profile"
          showNavigation={false}
        />

        {/* Mobile Menu Toggle and Navigation */}
        <div className="sm:hidden bg-white/95 backdrop-blur-xl border-b border-amber-100 shadow-lg">
          <div className="px-3 py-4">
            {/* Mobile Menu Toggle */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="space-y-3">
                <button
                  onClick={() => { setActiveTab('new'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'new' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  New Coffee Entry
                </button>
                <button
                  onClick={() => { setActiveTab('entries'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'entries' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Coffee className="h-4 w-4 inline mr-2" />
                  Coffee Entries ({entries.length})
                </button>
                <button
                  onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Seller Profile
                </button>
                <button
                  onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Analytics
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Desktop Tab Navigation */}
          <div className="hidden sm:flex space-x-4 mb-8">
            {(() => {
              const currentTier = user?.subscriptionTier || 'free';
              const maxCoffees = currentTier === 'free' ? 1 : 
                               currentTier === 'basic' ? 5 : 
                               currentTier === 'premium' ? 20 : -1;
              const canUpload = maxCoffees === -1 || entries.length < maxCoffees;
              
              return (
                <button
                  onClick={() => canUpload ? setActiveTab('new') : null}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === 'new'
                      ? 'bg-amber-600 text-white shadow-lg'
                      : canUpload
                        ? 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                        : 'bg-gray-300 text-gray-500 border border-gray-200 cursor-not-allowed'
                  }`}
                  disabled={!canUpload}
                  title={!canUpload ? `Upload limit reached (${entries.length}/${maxCoffees})` : undefined}
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
                  New Coffee Entry
                  {!canUpload && <span className="ml-2 text-xs">({entries.length}/{maxCoffees})</span>}
                </button>
              );
            })()}
            <button
              onClick={() => setActiveTab('entries')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'entries'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
              Coffee Entries ({entries.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
              Seller Profile
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
              Analytics
            </button>
          </div>

          {/* Mobile Tab Indicator */}
          <div className="sm:hidden mb-6">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Current Tab:</span>
                <span className="text-sm font-semibold text-amber-700 capitalize">
                  {activeTab === 'new' && 'New Coffee Entry'}
                  {activeTab === 'entries' && 'Coffee Entries'}
                  {activeTab === 'profile' && 'Seller Profile'}
                  {activeTab === 'analytics' && 'Analytics'}
                </span>
              </div>
              
              <div className="flex space-x-2">
                {(() => {
                  const currentTier = user?.subscriptionTier || 'free';
                  const maxCoffees = currentTier === 'free' ? 1 : 
                                   currentTier === 'basic' ? 5 : 
                                   currentTier === 'premium' ? 20 : -1;
                  const canUpload = maxCoffees === -1 || entries.length < maxCoffees;
                  
                  return (
                    <button
                      onClick={() => canUpload ? setActiveTab('new') : null}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        activeTab === 'new'
                          ? 'bg-amber-600 text-white'
                          : canUpload
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!canUpload}
                      title={!canUpload ? `Upload limit reached (${entries.length}/${maxCoffees})` : undefined}
                    >
                      New {!canUpload && `(${entries.length}/${maxCoffees})`}
                    </button>
                  );
                })()}
                <button
                  onClick={() => setActiveTab('entries')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'entries'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Entries
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'new' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Coffee Entry</h2>
                <p className="text-gray-600">Add comprehensive coffee information with detailed farm and processing data</p>
              </div>

              <form onSubmit={saveCoffeeEntry} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Coffee Name *
                      </label>
                      <input
                        type="text"
                        name="coffeeName"
                        value={formData.coffeeName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Ethiopian Single Origin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Country</option>
                        {COFFEE_COUNTRIES.map((country, index) => (
                          <option key={`${country}-${index}`} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specific Location
                      </label>
                      <input
                        type="text"
                        name="specificLocation"
                        value={formData.specificLocation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Yirgacheffe, Monteverde, Tarrazú"
                      />
                      {formData.country && formData.specificLocation && (
                        <p className="text-xs text-gray-500 mt-1">
                          Will be displayed as: {constructOrigin(formData.country, formData.specificLocation)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Altitude
                      </label>
                      <input
                        type="text"
                        name="altitude"
                        value={formData.altitude}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="e.g., 1950-2100m"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Coffee Variety
                      </label>
                      <input
                        type="text"
                        name="variety"
                        value={formData.variety}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="e.g., Heirloom Ethiopian"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Farm Size
                      </label>
                      <input
                        type="text"
                        name="farmSize"
                        value={formData.farmSize}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="e.g., 12 hectares"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Worker Count
                      </label>
                      <input
                        type="text"
                        name="workerCount"
                        value={formData.workerCount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="e.g., 8 full-time, 20 seasonal"
                      />
                    </div>
                  </div>
                </div>

                {/* Farm Information */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Farm Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Farm Name *
                      </label>
                      <input
                        type="text"
                        name="farm"
                        value={formData.farm}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Konga Cooperative"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Farmer Name *
                      </label>
                      <input
                        type="text"
                        name="farmer"
                        value={formData.farmer}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Tadesse Meskela"
                      />
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      GPS Coordinates
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.coordinates.lat || ''}
                          onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="e.g., 6.1587"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.coordinates.lng || ''}
                          onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="e.g., 38.2016"
                        />
                      </div>
                    </div>
                    {formData.coordinates.lat !== 0 && formData.coordinates.lng !== 0 && (
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800">
                          📍 Map Preview: 
                          <a 
                            href={`https://maps.google.com/?q=${formData.coordinates.lat},${formData.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-green-700 underline hover:text-green-900"
                          >
                            View on Google Maps
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Certifications
                    </label>
                    <input
                      type="text"
                      value={certificationsText}
                      onChange={handleCertificationsChange}
                      onBlur={handleCertificationsBlur}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="e.g., Organic, Fair Trade, Rainforest Alliance (separate with commas)"
                    />
                  </div>

                  {/* Image Uploads */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Farm Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('farmImage', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      {formData.farmImage && (
                        <div className="mt-2">
                          <img 
                            src={formData.farmImage} 
                            alt="Farm preview" 
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Farmer Portrait
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('farmerImage', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      {formData.farmerImage && (
                        <div className="mt-2">
                          <img 
                            src={formData.farmerImage} 
                            alt="Farmer preview" 
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Producer Information */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Producer Name
                      </label>
                      <input
                        type="text"
                        name="producerName"
                        value={formData.producerName || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., Maria Elena Santos"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Producer Portrait
                      </label>
                      <input
                        type="file"
                        name="producerPortrait"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormData(prev => ({ ...prev, producerPortrait: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      {formData.producerPortrait && (
                        <div className="mt-2">
                          <img src={formData.producerPortrait} alt="Producer" className="max-w-xs rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Producer Bio
                    </label>
                    <textarea
                      name="producerBio"
                      value={formData.producerBio || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Brief story about the producer and their coffee growing practices..."
                    />
                  </div>
                </div>

                {/* Processing Information */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Processing Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Processing Method *
                      </label>
                      <select
                        name="process"
                        value={formData.process}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">Select Process</option>
                        <option value="Washed">Washed</option>
                        <option value="Natural">Natural</option>
                        <option value="Honey">Honey</option>
                        <option value="Semi-Washed">Semi-Washed</option>
                        <option value="Experimental">Experimental</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Produced By (Roaster)
                      </label>
                      <input
                        type="text"
                        name="roastedBy"
                        value={formData.roastedBy || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., Blue Mountain Coffee Co."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Harvest Date
                      </label>
                      <input
                        type="date"
                        name="harvestDate"
                        value={formData.harvestDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Processing Date
                      </label>
                      <input
                        type="date"
                        name="processingDate"
                        value={formData.processingDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fermentation Time
                      </label>
                      <input
                        type="text"
                        name="fermentationTime"
                        value={formData.fermentationTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., 42 hours"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Drying Time
                      </label>
                      <input
                        type="text"
                        name="dryingTime"
                        value={formData.dryingTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., 12 days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Moisture Content
                      </label>
                      <input
                        type="text"
                        name="moistureContent"
                        value={formData.moistureContent}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., 11.2%"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bean Density
                      </label>
                      <input
                        type="text"
                        name="beanDensity"
                        value={formData.beanDensity || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., 1.35 g/cm³"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Screen Size
                      </label>
                      <input
                        type="text"
                        name="screenSize"
                        value={formData.screenSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., 15-18"
                      />
                    </div>
                  </div>
                </div>

                {/* Quality Information */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Quality Assessment
                  </h3>
                  
                  {/* Individual Quality Scores */}
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Aroma (0-10)
                      </label>
                      <input
                        type="number"
                        name="aroma"
                        value={formData.aroma}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="8.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Flavor (0-10)
                      </label>
                      <input
                        type="number"
                        name="flavor"
                        value={formData.flavor}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="9.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Acidity (0-10)
                      </label>
                      <input
                        type="number"
                        name="acidity"
                        value={formData.acidity}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="8.8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Body (0-10)
                      </label>
                      <input
                        type="number"
                        name="body"
                        value={formData.body}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="8.2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Overall Cupping Score (0-100)
                      </label>
                      <input
                        type="number"
                        name="cuppingScore"
                        value={formData.cuppingScore}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., 87.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Roast Recommendation
                      </label>
                      <select
                        name="roastRecommendation"
                        value={formData.roastRecommendation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">Select Roast Level</option>
                        <option value="Light">Light</option>
                        <option value="Light to Medium">Light to Medium</option>
                        <option value="Medium">Medium</option>
                        <option value="Medium to Dark">Medium to Dark</option>
                        <option value="Dark">Dark</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Roast Development Curve
                      </label>
                      <input
                        type="file"
                        name="roastDevelopmentCurve"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormData(prev => ({ ...prev, roastDevelopmentCurve: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      {formData.roastDevelopmentCurve && (
                        <div className="mt-2">
                          <img src={formData.roastDevelopmentCurve} alt="Roast curve" className="max-w-xs rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tasting Notes */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Primary Notes
                      </label>
                      <input
                        type="text"
                        name="primaryNotes"
                        value={formData.primaryNotes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., Bright citrus, floral jasmine"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Secondary Notes
                      </label>
                      <input
                        type="text"
                        name="secondaryNotes"
                        value={formData.secondaryNotes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., Dark chocolate, wine-like"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Finish
                      </label>
                      <input
                        type="text"
                        name="finish"
                        value={formData.finish}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., Long, clean, tea-like"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      General Tasting Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="e.g., Bright citrus, floral jasmine, dark chocolate finish"
                    />
                  </div>
                </div>

                {/* Sustainability Information */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <Leaf className="h-5 w-5 mr-2" />
                    Sustainability & Community Impact
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Environmental Practices
                      </label>
                      <textarea
                        value={environmentalPracticesText}
                        onChange={handleEnvironmentalPracticesChange}
                        onBlur={handleEnvironmentalPracticesBlur}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., Shade-grown under native trees, Water recycling in processing, Organic composting program, Biodiversity conservation (separate with commas)"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fair Trade Premium
                        </label>
                        <input
                          type="text"
                          name="fairTradePremium"
                          value={formData.fairTradePremium}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="e.g., $0.65/lb"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Community Projects
                        </label>
                        <input
                          type="text"
                          name="communityProjects"
                          value={formData.communityProjects}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="e.g., School funding, Healthcare initiatives"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Women Worker Percentage
                        </label>
                        <input
                          type="text"
                          name="womenWorkerPercentage"
                          value={formData.womenWorkerPercentage}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="e.g., 40%"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Page Settings */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Client Page Settings
                  </h3>
                  <p className="text-sm text-blue-700 mb-6">Configure how this coffee appears to customers</p>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price Per Bag
                      </label>
                      <input
                        type="text"
                        name="pricePerBag"
                        value={formData.pricePerBag || sellerProfile.defaultPricePerBag}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="$24.99"
                      />
                      <p className="text-sm text-gray-500 mt-1">Leave empty to use default: {sellerProfile.defaultPricePerBag}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Availability
                      </label>
                      <select
                        name="available"
                        value={formData.available?.toString() || 'true'}
                        onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.value === 'true' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Order Link (Optional)
                      </label>
                      <input
                        type="url"
                        name="orderLink"
                        value={formData.orderLink || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="https://yourstore.com/coffee-name"
                      />
                      <p className="text-sm text-gray-500 mt-1">Leave empty to use default order link</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Create Coffee Entry
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Coffee Entry Form */}
          {editingEntry && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Coffee Entry</h2>
                    <button
                      onClick={() => setEditingEntry(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1">Update information for {editingEntry.coffeeName}</p>
                </div>

                <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-white rounded-xl border border-amber-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Coffee Name *
                        </label>
                        <input
                          type="text"
                          name="coffeeName"
                          value={editingEntry.coffeeName}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Country *
                        </label>
                        <select
                          name="country"
                          value={editingEntry.country}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select Country</option>
                          {COFFEE_COUNTRIES.map((country, index) => (
                            <option key={`${country}-${index}`} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Specific Location
                        </label>
                        <input
                          type="text"
                          name="specificLocation"
                          value={editingEntry.specificLocation || ''}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Farm Name
                        </label>
                        <input
                          type="text"
                          name="farm"
                          value={editingEntry.farm}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Farmer Name
                        </label>
                        <input
                          type="text"
                          name="farmer"
                          value={editingEntry.farmer}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Altitude
                        </label>
                        <input
                          type="text"
                          name="altitude"
                          value={editingEntry.altitude}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Variety
                        </label>
                        <input
                          type="text"
                          name="variety"
                          value={editingEntry.variety}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Process
                        </label>
                        <input
                          type="text"
                          name="process"
                          value={editingEntry.process}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cupping Score
                        </label>
                        <input
                          type="text"
                          name="cuppingScore"
                          value={editingEntry.cuppingScore}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                                         <div className="mt-4">
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         General Tasting Notes
                       </label>
                       <textarea
                         name="notes"
                         value={editingEntry.notes}
                         onChange={handleEditInputChange}
                         rows={3}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                       />
                     </div>
                     
                     <div className="grid md:grid-cols-2 gap-4 mt-4">
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Farm Size
                         </label>
                         <input
                           type="text"
                           name="farmSize"
                           value={editingEntry.farmSize}
                           onChange={handleEditInputChange}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Worker Count
                         </label>
                         <input
                           type="text"
                           name="workerCount"
                           value={editingEntry.workerCount}
                           onChange={handleEditInputChange}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Harvest Date
                         </label>
                         <input
                           type="text"
                           name="harvestDate"
                           value={editingEntry.harvestDate}
                           onChange={handleEditInputChange}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Processing Date
                         </label>
                         <input
                           type="text"
                           name="processingDate"
                           value={editingEntry.processingDate}
                           onChange={handleEditInputChange}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                         />
                       </div>
                     </div>
                   </div>

                  {/* Farm Photos and Roasting Curve Section */}
                  <div className="bg-green-50 rounded-xl border border-green-100 p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Farm Photos & Roasting Curve
                    </h3>
                    
                    {/* Farm Photos */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Farm Photos
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEditFileChange('farmPhotos', e.target.files)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Select a new farm photo to replace the existing one
                      </p>
                      
                      {/* Display current farm photo */}
                      {editingEntry.farmPhotos && Array.isArray(editingEntry.farmPhotos) && editingEntry.farmPhotos.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Current farm photo:</p>
                          <div className="relative group max-w-xs">
                            <img 
                              src={editingEntry.farmPhotos[0]} 
                              alt="Farm photo"
                              className="w-full h-auto rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeEditPhoto(0)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Roasting Curve Image */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Roasting Curve Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEditFileChange('roastingCurveImage', e.target.files)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Select new roasting curve image to replace existing one
                      </p>
                      
                      {/* Display current roasting curve */}
                      {editingEntry.roastingCurveImage && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Current roasting curve:</p>
                          <div className="relative group max-w-xs">
                            <img 
                              src={editingEntry.roastingCurveImage} 
                              alt="Roasting curve"
                              className="w-full h-auto rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeEditRoastingCurve()}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditingEntry(null)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Update Coffee Entry
                    </button>
                  </div>
                </form>
              </div>
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
                <div className="flex items-center space-x-4">
                  <p className="text-gray-600">{entries.length} coffee{entries.length !== 1 ? 's' : ''} logged</p>
                  <button
                    onClick={() => loadCoffeeEntries()}
                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    title="Refresh customer ratings and reviews"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Refresh Reviews
                  </button>
                </div>
              </div>

              {/* Overall Performance Summary */}
              {(() => {
                const { overallRating, totalReviews } = getOverallSellerScore();
                return (
                  <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="mb-3 text-center">
                      <h4 className="text-base sm:text-lg font-semibold text-green-800">Performance Summary for {sellerProfile.companyName}</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-green-900">{entries.length}</div>
                        <div className="text-xs sm:text-sm text-green-700">Coffee Entries</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-green-900">
                          {overallRating > 0 ? overallRating.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-xs sm:text-sm text-green-700">Avg. Rating</div>
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
                        <div className="text-xl sm:text-2xl font-bold text-green-900">{totalReviews}</div>
                        <div className="text-xs sm:text-sm text-green-700">Total Reviews</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-green-900">
                          {totalReviews > 0 ? Math.round((totalReviews / entries.length) * 10) / 10 : 0}
                        </div>
                        <div className="text-xs sm:text-sm text-green-700">Reviews per Coffee</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Subscription Upgrade Section */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-amber-800">Subscription Plan</h4>
                    <p className="text-sm text-amber-700">
                      Current Plan: <span className="font-semibold capitalize">{user?.subscriptionTier || 'free'}</span>
                    </p>
                  </div>
                  <Link
                    href="/subscriptions"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    {user?.subscriptionTier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg font-bold text-amber-700">
                      {user?.subscriptionTier === 'free' ? '1' : 
                       user?.subscriptionTier === 'basic' ? '5' : 
                       user?.subscriptionTier === 'premium' ? '20' : '∞'}
                    </div>
                    <div className="text-xs text-amber-600">Coffee Uploads</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg font-bold text-amber-700">
                      {user?.subscriptionTier === 'free' ? 'None' : 
                       user?.subscriptionTier === 'basic' ? '1 month' : 
                       user?.subscriptionTier === 'premium' ? '3 months' : '1 year'}
                    </div>
                    <div className="text-xs text-amber-600">Analytics</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg font-bold text-amber-700">
                      {user?.subscriptionTier === 'free' ? 'Community' : 
                       user?.subscriptionTier === 'basic' ? 'Email' : 
                       user?.subscriptionTier === 'premium' ? 'Email' : 'Email'}
                    </div>
                    <div className="text-xs text-amber-600">Support</div>
                  </div>
                </div>
                {user?.subscriptionTier === 'free' && (
                  <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800 text-center">
                      <strong>Upgrade your plan</strong> to unlock more coffee uploads, advanced analytics, and premium features!
                    </p>
                  </div>
                )}
              </div>

              {/* Coffee Entries List - Exactly like admin page */}
              {entries.length === 0 ? (
                <div className="rounded-xl sm:rounded-2xl border border-amber-100 p-6 sm:p-8 lg:p-12 bg-white shadow-lg text-center">
                  <Coffee className="h-12 w-12 sm:h-16 sm:w-16 text-amber-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No coffee entries yet for {sellerProfile.companyName}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Start by creating your first coffee entry to generate QR codes and track your coffee journey.
                  </p>
                  {(() => {
                    const currentTier = user?.subscriptionTier || 'free';
                    const maxCoffees = currentTier === 'free' ? 1 : 
                                     currentTier === 'basic' ? 5 : 
                                     currentTier === 'premium' ? 20 : -1;
                    const canUpload = maxCoffees === -1 || entries.length < maxCoffees;
                    
                    if (!canUpload) {
                      return (
                        <div className="space-y-3">
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 text-center">
                              <strong>Upload limit reached!</strong> You've reached your {currentTier} plan limit of {maxCoffees} coffee entries.
                            </p>
                          </div>
                          <Link
                            href="/subscriptions"
                            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-colors text-sm sm:text-base"
                          >
                            <Coffee className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Upgrade Plan
                          </Link>
                        </div>
                      );
                    }
                    
                    return (
                      <button
                        onClick={() => setActiveTab('new')}
                        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors text-sm sm:text-base"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Create New Entry
                      </button>
                    );
                  })()}
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {entries.map((entry) => (
                    <div key={entry.id} className="rounded-xl sm:rounded-2xl border border-amber-100 p-4 sm:p-6 bg-white shadow-lg transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl">
                      {/* Mobile: Stack title and actions vertically, Desktop: Side by side */}
                      <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-start mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{entry.coffeeName}</h3>
                          <div className="flex items-center space-x-2 text-amber-600 font-medium text-sm sm:text-base">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{entry.origin}</span>
                            {entry.country && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                                {entry.country}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile: Grid of action buttons, Desktop: Horizontal row */}
                        <div className="grid grid-cols-2 sm:flex sm:space-x-2 gap-2 sm:gap-0">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-xs sm:text-sm"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Edit
                          </button>
                          <Link
                            href={`/coffees/${entry.slug || entry.id}`}
                            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Preview
                          </Link>
                          <button
                            onClick={() => downloadQRCode(entry)}
                            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs sm:text-sm"
                          >
                            <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Download QR
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Mobile: Stack info vertically, Desktop: Grid layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Farm:</span>
                          <p className="text-gray-900">{entry.farm}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Farmer:</span>
                          <p className="text-gray-900">{entry.farmer}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Process:</span>
                          <p className="text-gray-900">{entry.process}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Score:</span>
                          <p className="text-gray-900">{entry.cuppingScore}/100</p>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                          <span className="font-medium text-gray-500">Seller ID:</span>
                          <p className="text-gray-900">{entry.sellerId || 'N/A'} ({sellerProfile.companyName})</p>
                        </div>
                      </div>
                      
                      {/* Overall Score Display */}
                      <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-amber-600" />
                            <span className="font-medium text-amber-800">Overall Score:</span>
                            <span className="text-2xl font-bold text-amber-900">{entry.cuppingScore || 'N/A'}/100</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-amber-700">Professional Cupping</div>
                            <div className="text-xs text-amber-600">Quality Assessment</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Customer Ratings and Comments */}
                      {(() => {
                        const comments = commentsData[entry.id] || [];
                        const commentCount = comments.length;
                        const averageRating = commentCount > 0 
                          ? comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / commentCount 
                          : 0;
                        
                        return (
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.round(averageRating) 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-2 text-sm font-medium text-gray-700">
                                    {averageRating > 0 ? averageRating.toFixed(1) : 'No'} rating
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-600">
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {commentCount} review{commentCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            {commentCount > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                Based on {commentCount} customer review{commentCount !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      

                      
                      {/* Tasting Notes */}
                      {entry.notes && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                          <span className="font-medium text-amber-800">Tasting Notes:</span>
                          <p className="text-amber-700">{entry.notes}</p>
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
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Seller Profile</h2>
                <p className="text-gray-600">Manage your company information and settings</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); saveSellerProfile(); }} className="space-y-6">
                {/* Basic Company Information */}
                <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Company Information</h3>
                  
                  {/* Company Logo Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      {sellerProfile.logo ? (
                        <div className="relative">
                          <img 
                            src={sellerProfile.logo} 
                            alt={`${sellerProfile.companyName} logo`}
                            className="w-20 h-20 object-contain rounded-lg bg-white p-2 shadow-sm border border-amber-200"
                          />
                          <button
                            type="button"
                            onClick={() => setSellerProfile({...sellerProfile, logo: undefined})}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Coffee className="h-10 w-10 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setSellerProfile({...sellerProfile, logo: e.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="company-logo-upload"
                        />
                        <label
                          htmlFor="company-logo-upload"
                          className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors cursor-pointer"
                        >
                          {sellerProfile.logo ? 'Change Logo' : 'Upload Logo'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: Square image, 200x200px or larger
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
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
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={sellerProfile.companySize ? sellerProfile.companySize.replace(/\D/g, '') : ''}
                          onChange={(e) => {
                            const numValue = e.target.value;
                            setSellerProfile({
                              ...sellerProfile, 
                              companySize: numValue ? `${numValue} employees` : ''
                            });
                          }}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center"
                          placeholder="25"
                          min="1"
                        />
                        <span className="text-gray-500 text-sm">employees</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Country</label>
                          <select
                            value={sellerProfile.country || ''}
                            onChange={(e) => setSellerProfile({...sellerProfile, country: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">Select a country</option>
                            {COUNTRIES.map((country, index) => (
                              <option key={`${country}-${index}`} value={country}>{country}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">City</label>
                          <input
                            type="text"
                            value={sellerProfile.city || ''}
                            onChange={(e) => setSellerProfile({...sellerProfile, city: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="e.g., Portland"
                          />
                        </div>
                      </div>
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

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={sellerProfile.email}
                        onChange={(e) => setSellerProfile({...sellerProfile, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={sellerProfile.phone}
                        onChange={(e) => setSellerProfile({...sellerProfile, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={sellerProfile.website}
                        onChange={(e) => setSellerProfile({...sellerProfile, website: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Order Link
                      </label>
                      <input
                        type="url"
                        value={sellerProfile.orderLink}
                        onChange={(e) => setSellerProfile({...sellerProfile, orderLink: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="https://yourstore.com/order"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Description */}
                <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Description</h3>
                  <div className="space-y-4">
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
                        Description Template
                      </label>
                      <select
                        value={sellerProfile.description}
                        onChange={(e) => setSellerProfile({...sellerProfile, description: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="premium-sourcing">Premium Sourcing</option>
                        <option value="family-tradition">Family Tradition</option>
                        <option value="high-altitude">High Altitude</option>
                        <option value="sustainable-focus">Sustainable Focus</option>
                        <option value="single-origin">Single Origin</option>
                        <option value="artisan-roasted">Artisan Roasted</option>
                        <option value="direct-trade">Direct Trade</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        {DESCRIPTION_TEMPLATES[sellerProfile.description as keyof typeof DESCRIPTION_TEMPLATES]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specialties and Certifications */}
                <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Specialties & Certifications</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specialties
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {SPECIALTY_OPTIONS.map((specialty) => (
                          <label key={specialty} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={(sellerProfile.specialties || []).includes(specialty)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSellerProfile({
                                    ...sellerProfile,
                                    specialties: [...(sellerProfile.specialties || []), specialty]
                                  });
                                } else {
                                  setSellerProfile({
                                    ...sellerProfile,
                                    specialties: (sellerProfile.specialties || []).filter(s => s !== specialty)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm text-gray-700">{specialty}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Media</h3>
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
                <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h3>
                  <div className="space-y-4">
                    {(sellerProfile.teamMembers || []).map((member, index) => (
                      <div key={member.id} className="grid md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
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
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Photo
                          </label>
                          <div className="flex items-center space-x-3">
                            {member.image ? (
                              <div className="relative">
                                <img 
                                  src={member.image} 
                                  alt={member.name} 
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTeamMembers = [...sellerProfile.teamMembers];
                                    newTeamMembers[index].image = undefined;
                                    setSellerProfile({...sellerProfile, teamMembers: newTeamMembers});
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs text-center">No photo</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    const newTeamMembers = [...sellerProfile.teamMembers];
                                    newTeamMembers[index].image = e.target?.result as string;
                                    setSellerProfile({...sellerProfile, teamMembers: newTeamMembers});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id={`team-photo-${member.id}`}
                            />
                            <label
                              htmlFor={`team-photo-${member.id}`}
                              className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors cursor-pointer text-sm"
                            >
                              {member.image ? 'Change' : 'Upload'}
                            </label>
                          </div>
                        </div>
                        <div className="flex items-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newTeamMembers = (sellerProfile.teamMembers || []).filter((_, i) => i !== index);
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

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
                <p className="text-gray-600">View comprehensive analytics and insights for your coffee business</p>
              </div>
              
              {/* Embedded Analytics Dashboard */}
              <SellerAnalytics
                entries={entries}
                commentsData={commentsData}
                subscriptionTier={(user?.subscriptionTier as 'free' | 'basic' | 'premium' | 'enterprise') || 'free'}
                subscriptionStatus="active"
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
