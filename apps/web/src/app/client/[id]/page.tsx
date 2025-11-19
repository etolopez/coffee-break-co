'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, MapPin, Award, Leaf, Shield, ArrowRight, Star, Users, Calendar, Phone, Mail, ShoppingBag, Heart, Share2, Download, Instagram, Facebook, Twitter } from 'lucide-react';
import { useSellerProfile } from '../../../hooks/useSellerProfile';

// Sample seller profile data - this would come from your database  
const sellerProfile = {
  id: '1',
  companyName: 'Premium Coffee Co.',
  location: 'Toronto, Canada',
  description: 'Connecting coffee lovers with exceptional farmers worldwide through transparent, sustainable sourcing. We believe in building direct relationships with farmers to ensure fair compensation and sustainable practices.',
  phone: '+1 (555) 123-4567',
  email: 'orders@premiumcoffee.com',
  website: 'https://premiumcoffee.com',
  memberSince: '2023',
  rating: 4.9,
  totalCoffees: 12,
  certifications: ['Organic', 'Fair Trade', 'Direct Trade'],
  specialties: ['Single Origin', 'Organic', 'Direct Trade', 'Sustainable Sourcing'],
  socialMedia: {
    instagram: '@premiumcoffee',
    facebook: 'Premium Coffee Co.',
    twitter: '@premiumcoffee'
  },
  image: '/api/placeholder/300/300',
  banner: '/api/placeholder/1200/400'
};

// Sample coffee entries for this seller
const coffeeEntries = [
  {
    id: '1',
    name: 'Ethiopian Yirgacheffe',
    origin: 'Yirgacheffe, Ethiopia',
    farm: 'Kebele Farm',
    farmer: 'Abebe Kebede',
    altitude: '1,800-2,200m',
    process: 'Washed',
    roastLevel: 'Medium',
    cuppingScore: 87,
    tastingNotes: ['Floral', 'Citrus', 'Bergamot', 'Jasmine'],
    price: '$24.99',
    available: true,
    image: '/api/placeholder/400/300',
    description: 'Bright and floral Ethiopian coffee with notes of jasmine and bergamot. Grown at high altitude for optimal flavor development.',
    slug: 'premium-coffee-co/ethiopian-yirgacheffe-yirgacheffe-ethiopia-1'
  },
  {
    id: '2',
    name: 'Guatemala Antigua',
    origin: 'Antigua, Guatemala',
    farm: 'Finca El Bosque',
    farmer: 'Carlos Mendoza',
    altitude: '1,600-1,800m',
    process: 'Washed',
    roastLevel: 'Medium-Dark',
    cuppingScore: 85,
    tastingNotes: ['Chocolate', 'Caramel', 'Nutty', 'Spice'],
    price: '$22.99',
    available: true,
    image: '/api/placeholder/400/300',
    description: 'Rich and full-bodied Guatemalan coffee with chocolate notes and a hint of spice. Perfect for espresso and drip brewing.',
    slug: 'premium-coffee-co/guatemala-antigua-antigua-guatemala-2'
  },
  {
    id: '3',
    name: 'Colombian Huila',
    origin: 'Huila, Colombia',
    farm: 'Finca La Esperanza',
    farmer: 'Maria Rodriguez',
    altitude: '1,500-1,900m',
    process: 'Natural',
    roastLevel: 'Medium',
    cuppingScore: 86,
    tastingNotes: ['Berry', 'Caramel', 'Honey', 'Medium Body'],
    price: '$23.99',
    available: false,
    image: '/api/placeholder/400/300',
    description: 'Naturally processed Colombian coffee with bright berry notes and a smooth, honey-like sweetness. Limited availability.',
    slug: 'premium-coffee-co/colombian-huila-huila-colombia-3'
  }
];

export default function ClientPage({ params }: { params: { id: string } }) {
  const [selectedCoffee, setSelectedCoffee] = useState<string | null>(null);
  const [sellerData, setSellerData] = useState<any>(null);
  const [coffeeEntries, setCoffeeEntries] = useState<any[]>([]);
  const [commentsData, setCommentsData] = useState<{[key: string]: any[]}>({});
  const [loading, setLoading] = useState(true);

  /**
   * Fetches comments for all coffee entries to display ratings
   * @param coffees - Array of coffee entries
   */
  const loadCommentsForCoffees = async (coffees: any[]) => {
    try {
      const commentsPromises = coffees.map(async (coffee) => {
        const response = await fetch(`/api/comments?coffeeId=${coffee.id}`);
        const result = await response.json();
        return { coffeeId: coffee.id, comments: result.success ? result.data : [] };
      });
      
      const commentsResults = await Promise.all(commentsPromises);
      const commentsMap: {[key: string]: any[]} = {};
      
      commentsResults.forEach(({ coffeeId, comments }) => {
        commentsMap[coffeeId] = comments;
      });
      
      setCommentsData(commentsMap);
    } catch (error) {
      console.error('Failed to load comments for coffees:', error);
    }
  };

  /**
   * Calculates average rating and comment count for a coffee entry
   * @param coffeeId - ID of the coffee entry
   * @returns Object with averageRating and commentCount
   */
  const getCoffeeStats = (coffeeId: string) => {
    const comments = commentsData[coffeeId] || [];
    const commentCount = comments.length;
    
    if (commentCount === 0) {
      return { averageRating: 0, commentCount: 0 };
    }
    
    const totalRating = comments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
    const averageRating = totalRating / commentCount;
    
    return { averageRating, commentCount };
  };

  // Fetch seller-specific data
  useEffect(() => {
    const loadSellerData = async () => {
      console.log(`Loading data for seller ID: ${params.id}`);
      
      // Quick load with hardcoded data for all sellers (avoiding slow API calls)
      const mockSellersData: { [key: string]: any } = {
        '1': {
          id: '1',
          companyName: 'Premium Coffee Co.',
          location: 'Toronto, Canada',
          description: 'Connecting coffee lovers with exceptional farmers worldwide through transparent, sustainable sourcing.',
          phone: '+1 (555) 123-4567',
          email: 'orders@premiumcoffee.com',
          website: 'https://premiumcoffee.com',
          memberSince: '2023',
          rating: 4.9,
          totalCoffees: 3,
          specialties: ['Single Origin', 'Organic', 'Fair Trade'],
          socialMedia: {
            instagram: '@premiumcoffee',
            facebook: 'Premium Coffee Co.',
            twitter: '@premiumcoffee'
          },
          defaultPricePerBag: '$24.99',
          orderLink: 'https://premiumcoffee.com/order',
          certifications: ['Organic', 'Fair Trade', 'Direct Trade']
        },
        '2': {
          id: '2',
          companyName: 'Mountain View Roasters',
          location: 'Denver, Colorado',
          description: 'Bringing you the finest beans from high-altitude farms with a focus on sustainability.',
          phone: '+1 (555) 234-5678',
          email: 'hello@mountainviewroasters.com',
          website: 'https://mountainviewroasters.com',
          memberSince: '2022',
          rating: 4.7,
          totalCoffees: 2,
          specialties: ['High Altitude', 'Sustainability', 'Small Batch'],
          socialMedia: {
            instagram: '@mountainviewroasters',
            facebook: 'Mountain View Roasters',
            twitter: '@mvroasters'
          },
          defaultPricePerBag: '$26.99',
          orderLink: 'https://mountainviewroasters.com/shop',
          certifications: ['Organic', 'Rainforest Alliance']
        },
        '3': {
          id: '3',
          companyName: 'Coastal Coffee Collective',
          location: 'San Francisco, California',
          description: 'Sourcing exceptional coffees from coastal regions with a commitment to ocean conservation.',
          phone: '+1 (555) 345-6789',
          email: 'info@coastalcoffee.com',
          website: 'https://coastalcoffee.com',
          memberSince: '2021',
          rating: 4.8,
          totalCoffees: 2,
          specialties: ['Ocean Conservation', 'Light Roasts', 'Direct Trade'],
          socialMedia: {
            instagram: '@coastalcoffeeco',
            facebook: 'Coastal Coffee Collective',
            twitter: '@coastalcoffee'
          },
          defaultPricePerBag: '$28.99',
          orderLink: 'https://coastalcoffee.com/order',
          certifications: ['Ocean Positive', 'Organic']
        },
        '4': {
          id: '4',
          companyName: 'Heritage Bean Company',
          location: 'Austin, Texas',
          description: 'Preserving traditional coffee farming methods while supporting farming communities.',
          phone: '+1 (555) 456-7890',
          email: 'contact@heritagebean.com',
          website: 'https://heritagebean.com',
          memberSince: '2020',
          rating: 4.6,
          totalCoffees: 2,
          specialties: ['Heritage Varieties', 'Community Support', 'Traditional Methods'],
          socialMedia: {
            instagram: '@heritagebean',
            facebook: 'Heritage Bean Company',
            twitter: '@heritagebean'
          },
          defaultPricePerBag: '$23.99',
          orderLink: 'https://heritagebean.com/shop',
          certifications: ['Fair Trade', 'Direct Trade']
        },
        '5': {
          id: '5',
          companyName: 'Urban Harvest Coffee',
          location: 'Brooklyn, New York',
          description: 'Bringing farm-fresh coffee to urban communities through innovative distribution.',
          phone: '+1 (555) 567-8901',
          email: 'orders@urbanharvest.com',
          website: 'https://urbanharvest.com',
          memberSince: '2023',
          rating: 4.5,
          totalCoffees: 3,
          specialties: ['Urban Distribution', 'Fresh Roasting', 'Community Focused'],
          socialMedia: {
            instagram: '@urbanharvest',
            facebook: 'Urban Harvest Coffee',
            twitter: '@urbanharvest'
          },
          defaultPricePerBag: '$25.99',
          orderLink: 'https://urbanharvest.com/order',
          certifications: ['Organic']
        },
        '6': {
          id: '6',
          companyName: 'Colombian Mountain Coffee',
          location: 'Bogotá, Colombia',
          description: 'Premium coffee from the Colombian Andes, featuring bright acidity and floral notes.',
          phone: '+1 (555) 678-9012',
          email: 'info@colombianmountain.com',
          website: 'https://colombianmountain.com',
          memberSince: '2023',
          rating: 4.8,
          totalCoffees: 2,
          specialties: ['Mountain Grown', 'Bright Acidity', 'Floral Notes'],
          socialMedia: {
            instagram: '@colombianmountain',
            facebook: 'Colombian Mountain Coffee',
            twitter: '@colombianmountain'
          },
          defaultPricePerBag: '$27.99',
          orderLink: 'https://colombianmountain.com/shop',
          certifications: ['Rainforest Alliance', 'Organic']
        },
        '7': {
          id: '7',
          companyName: 'New Mountain Roasters',
          location: 'Denver, Colorado',
          description: 'Just getting started with our artisan roasting journey. Stay tuned for amazing coffees!',
          phone: '+1 (555) 789-0123',
          email: 'hello@newmountain.com',
          website: 'https://newmountain.com',
          memberSince: '2024',
          rating: 0,
          totalCoffees: 0,
          specialties: [],
          socialMedia: {
            instagram: '@newmountain',
            facebook: 'New Mountain Roasters',
            twitter: '@newmountain'
          },
          defaultPricePerBag: '$24.99',
          orderLink: 'https://newmountain.com/order',
          certifications: []
        }
      };

      const mockCoffeesData: { [key: string]: any[] } = {
        '1': [
          {
            id: '1',
            coffeeName: 'Ethiopian Single Origin',
            origin: 'Yirgacheffe, Ethiopia',
            farm: 'Konga Cooperative',
            farmer: 'Tadesse Meskela',
            altitude: '1950-2100m',
            process: 'Washed',
            notes: 'Bright citrus, floral jasmine, dark chocolate finish',
            cuppingScore: '87.5',
            pricePerBag: '$24.99',
            available: true,
            description: 'Bright and floral Ethiopian coffee with notes of jasmine and bergamot. Grown at high altitude for optimal flavor development.'
          },
          {
            id: '2',
            coffeeName: 'Colombian Reserve',
            origin: 'Huila, Colombia',
            farm: 'Finca La Esperanza',
            farmer: 'Maria Rodriguez',
            altitude: '1500-1900m',
            process: 'Natural',
            notes: 'Berry, caramel, honey, medium body',
            cuppingScore: '86',
            pricePerBag: '$26.99',
            available: true,
            description: 'Naturally processed Colombian coffee with bright berry notes and a smooth, honey-like sweetness.'
          },
          {
            id: '8',
            coffeeName: 'Kenya AA Nyeri',
            origin: 'Nyeri, Kenya',
            farm: 'Gachatha-ini Factory',
            farmer: 'Local Smallholders',
            altitude: '1700-1900m',
            process: 'Washed',
            notes: 'Black currant, wine-like acidity, full body',
            cuppingScore: '88',
            pricePerBag: '$27.99',
            available: true,
            description: 'Classic Kenyan profile with intense fruit flavors and wine-like acidity from the Nyeri region.'
          }
        ],
        '2': [
          {
            id: '3',
            coffeeName: 'High Altitude Blend',
            origin: 'Guatemala',
            farm: 'Antigua Estates',
            farmer: 'Roberto Morales',
            altitude: '1800-2200m',
            process: 'Washed',
            notes: 'Clean, bright, chocolate undertones',
            cuppingScore: '85',
            pricePerBag: '$26.99',
            available: true,
            description: 'A carefully crafted blend of high-altitude Central American coffees with clean, bright flavors.'
          },
          {
            id: '9',
            coffeeName: 'Peru Mountain Reserve',
            origin: 'Cajamarca, Peru',
            farm: 'Finca Tumbador',
            farmer: 'Carlos Valdez',
            altitude: '1900-2100m',
            process: 'Washed',
            notes: 'Milk chocolate, almond, balanced acidity',
            cuppingScore: '84',
            pricePerBag: '$25.99',
            available: true,
            description: 'Sustainably grown Peruvian coffee with classic mountain characteristics and smooth chocolate notes.'
          }
        ],
        '3': [
          {
            id: '4',
            coffeeName: 'Pacific Coast Single Origin',
            origin: 'Chiapas, Mexico',
            farm: 'Finca El Mar',
            farmer: 'Carlos Hernandez',
            altitude: '1400-1600m',
            process: 'Washed',
            notes: 'Citrus, sea salt, bright acidity',
            cuppingScore: '87',
            pricePerBag: '$28.99',
            available: true,
            description: 'Unique coastal-grown coffee with distinctive mineral notes and bright citrus flavors.'
          },
          {
            id: '10',
            coffeeName: 'Ocean Breeze Blend',
            origin: 'El Salvador & Nicaragua',
            farm: 'Coastal Farms',
            farmer: 'Various Coastal Farmers',
            altitude: '1200-1500m',
            process: 'Honey',
            notes: 'Tropical fruit, sea air minerality',
            cuppingScore: '85',
            pricePerBag: '$26.99',
            available: true,
            description: 'A unique blend of coastal coffees with tropical fruit notes and ocean-influenced mineral character.'
          }
        ],
        '4': [
          {
            id: '5',
            coffeeName: 'Heritage Blend',
            origin: 'Honduras',
            farm: 'Traditional Cooperative',
            farmer: 'Local Farmers',
            altitude: '1200-1800m',
            process: 'Traditional',
            notes: 'Rich, full body, chocolate, nuts',
            cuppingScore: '84',
            pricePerBag: '$23.99',
            available: true,
            description: 'A tribute to traditional coffee farming methods with rich, full-bodied flavors.'
          },
          {
            id: '11',
            coffeeName: 'Guatemala Heirloom',
            origin: 'Antigua, Guatemala',
            farm: 'Finca Antigua Heritage',
            farmer: 'Rosa Martinez',
            altitude: '1500-1700m',
            process: 'Washed',
            notes: 'Spice, dark chocolate, smoky finish',
            cuppingScore: '86',
            pricePerBag: '$25.99',
            available: true,
            description: 'Traditional Guatemalan heirloom varieties processed using time-honored methods passed down through generations.'
          }
        ],
        '5': [
          {
            id: '6',
            coffeeName: 'Urban Roast',
            origin: 'Brazil',
            farm: 'Fazenda Urbana',
            farmer: 'Paulo Silva',
            altitude: '1000-1500m',
            process: 'Semi-washed',
            notes: 'Balanced, smooth, caramel sweetness',
            cuppingScore: '83',
            pricePerBag: '$25.99',
            available: true,
            description: 'Perfect for the urban coffee lover - balanced and approachable with subtle complexity.'
          },
          {
            id: '12',
            coffeeName: 'City Blend',
            origin: 'Brazil & Colombia',
            farm: 'Urban Partnership Farms',
            farmer: 'Urban Network Farmers',
            altitude: '1000-1600m',
            process: 'Pulped Natural',
            notes: 'Nutty, chocolate, low acidity',
            cuppingScore: '82',
            pricePerBag: '$22.99',
            available: true,
            description: 'Specially crafted for city dwellers who prefer smooth, approachable coffee with rich body and low acidity.'
          },
          {
            id: '13',
            coffeeName: 'Morning Commute',
            origin: 'Guatemala',
            farm: 'Finca Madrugada',
            farmer: 'Elena Ramirez',
            altitude: '1300-1500m',
            process: 'Washed',
            notes: 'Clean, bright, citrus zest',
            cuppingScore: '84',
            pricePerBag: '$24.99',
            available: false,
            description: 'The perfect wake-up coffee with bright, clean flavors designed to energize your morning routine.'
          }
        ],
        '6': [
          {
            id: '7',
            coffeeName: 'Andean Peak',
            origin: 'Nariño, Colombia',
            farm: 'Finca Las Montañas',
            farmer: 'Pablo Guerrero',
            altitude: '2000-2200m',
            process: 'Washed',
            notes: 'Floral, citrus, wine-like acidity',
            cuppingScore: '88',
            pricePerBag: '$27.99',
            available: true,
            description: 'Premium high-altitude Colombian coffee with exceptional floral notes and bright acidity.'
          },
          {
            id: '14',
            coffeeName: 'Cauca Valley Reserve',
            origin: 'Cauca, Colombia',
            farm: 'Finca El Valle',
            farmer: 'Miguel Santos',
            altitude: '1800-2000m',
            process: 'Natural',
            notes: 'Berry, wine, chocolate finish',
            cuppingScore: '87',
            pricePerBag: '$29.99',
            available: true,
            description: 'Exceptional natural-processed Colombian coffee from the renowned Cauca Valley with complex fruit and wine notes.'
          }
        ],
        '7': [] // New seller with no coffees yet
      };

      const currentSellerData = mockSellersData[params.id];
      const currentCoffeeData = mockCoffeesData[params.id] || [];

      if (currentSellerData) {
        setSellerData(currentSellerData);
        setCoffeeEntries(currentCoffeeData);
        // Load comments for the coffees
        await loadCommentsForCoffees(currentCoffeeData);
        setLoading(false);
        console.log(`Quick loaded mock data for seller ${params.id}: ${currentSellerData.companyName}`);
        return;
      }
      
      try {
        // Fetch seller profile
        console.log('Fetching seller profile...');
        const sellerResponse = await fetch(`/api/seller-profile/${params.id}?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!sellerResponse.ok) {
          throw new Error(`Seller API failed: ${sellerResponse.status} ${sellerResponse.statusText}`);
        }
        
        const sellerResult = await sellerResponse.json();
        console.log('Seller profile result:', sellerResult);
        
        // Fetch seller's coffee entries
        console.log('Fetching coffee entries...');
        const coffeeResponse = await fetch(`/api/coffee-entries/seller/${params.id}?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!coffeeResponse.ok) {
          throw new Error(`Coffee API failed: ${coffeeResponse.status} ${coffeeResponse.statusText}`);
        }
        
        const coffeeResult = await coffeeResponse.json();
        console.log('Coffee entries result:', coffeeResult);

        if (sellerResult.success) {
          setSellerData(sellerResult.data);
          console.log('Set seller data successfully');
        } else {
          console.log('Seller API unsuccessful, using fallback');
          setSellerData(sellerProfile);
        }

        if (coffeeResult.success) {
          setCoffeeEntries(coffeeResult.data);
          console.log(`Set ${coffeeResult.data.length} coffee entries`);
        } else {
          console.log('Coffee API unsuccessful, no coffees loaded');
          setCoffeeEntries([]);
        }
      } catch (error) {
        console.error('Failed to load seller data:', error);
        // Fallback to hardcoded data on error
        setSellerData(sellerProfile);
        setCoffeeEntries([]);
      } finally {
        setLoading(false);
        console.log('Loading complete');
      }
    };

    loadSellerData();
  }, [params.id]);

  // Show loading state while fetching data
  if (loading || !sellerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="relative border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Coffee className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <Link 
                  href={`/seller-profile/${sellerData.id}`}
                  className="block hover:opacity-80 transition-opacity duration-200"
                >
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent">
                    {sellerData.companyName}
                  </h1>
                </Link>
                <p className="text-sm text-amber-600/70 font-medium">Premium Coffee Seller</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-amber-700 hover:text-amber-900 transition-all duration-200 font-semibold relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/sellers" className="text-amber-700 hover:text-amber-900 transition-all duration-200 font-semibold relative group">
                Our Sellers
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Seller Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-white/80 text-amber-700 text-sm font-semibold rounded-full mb-6 border border-amber-200/50">
                  <Award className="h-4 w-4 mr-2 text-amber-500" />
                  Featured Seller
                </div>
                <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
                  <Link 
                    href={`/seller-profile/${sellerData.id}`}
                    className="block text-gray-900 hover:text-amber-700 transition-colors duration-200 cursor-pointer group"
                  >
                    {sellerData.companyName}
                    <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-2xl">
                      →
                    </span>
                  </Link>
                  <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Premium Coffee
                  </span>
                </h1>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">{sellerData.description}</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    {(() => {
                      const allComments = Object.values(commentsData).flat();
                      const totalReviews = allComments.length;
                      
                      // Only show rating if there are actual customer reviews
                      if (totalReviews > 0) {
                        const overallRating = allComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / totalReviews;
                        return (
                          <>
                            <div className="text-2xl font-bold text-amber-600">{overallRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">Rating</div>
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
                            <div className="text-xs text-amber-500">({totalReviews} reviews)</div>
                          </>
                        );
                      } else {
                        // Show "New" instead of rating when no reviews exist
                        return (
                          <>
                            <div className="text-2xl font-bold text-gray-500">New</div>
                            <div className="text-sm text-gray-600">Seller</div>
                            <div className="text-xs text-gray-400 mt-1">No reviews yet</div>
                          </>
                        );
                      }
                    })()}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{sellerData.totalCoffees}</div>
                    <div className="text-sm text-gray-600">Coffees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{sellerData.memberSince}</div>
                    <div className="text-sm text-gray-600">Member Since</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4">
                  <a href={`tel:${sellerData.phone}`} className="inline-flex items-center px-4 py-2 bg-white text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                    <Phone className="h-4 w-4 mr-2" />
                    {sellerData.phone}
                  </a>
                  <a href={`mailto:${sellerData.email}`} className="inline-flex items-center px-4 py-2 bg-white text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                    <Mail className="h-4 w-4 mr-2" />
                    {sellerData.email}
                  </a>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-amber-200 to-orange-300 rounded-2xl flex items-center justify-center">
                  <Coffee className="h-24 w-24 text-amber-600" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Details */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Seller Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h3>
                
                {/* Location */}
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-amber-500 mr-3" />
                  <span className="text-gray-700">{sellerData.location}</span>
                </div>

                {/* Certifications */}
                {sellerData.certifications && sellerData.certifications.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {sellerData.certifications.map((cert, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                          {cert === 'Organic' && <Leaf className="h-3 w-3 mr-1" />}
                          {cert === 'Fair Trade' && <Award className="h-3 w-3 mr-1" />}
                          {cert === 'Direct Trade' && <Shield className="h-3 w-3 mr-1" />}
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties */}
                {sellerData.specialties && sellerData.specialties.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {sellerData.specialties.map((specialty, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                {sellerData.socialMedia && (sellerData.socialMedia.instagram || sellerData.socialMedia.facebook || sellerData.socialMedia.twitter) && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Follow Us</h4>
                    <div className="flex space-x-3">
                      {sellerData.socialMedia.instagram && (
                        <a 
                          href={`https://instagram.com/${sellerData.socialMedia.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-200"
                        >
                          <Instagram className="h-6 w-6 text-white" />
                        </a>
                      )}
                      
                      {sellerData.socialMedia.facebook && (
                        <a 
                          href={`https://facebook.com/${sellerData.socialMedia.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-200"
                        >
                          <Facebook className="h-6 w-6 text-white" />
                        </a>
                      )}
                      
                      {sellerData.socialMedia.twitter && (
                        <a 
                          href={`https://twitter.com/${sellerData.socialMedia.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-200"
                        >
                          <Twitter className="h-6 w-6 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Learn About Us Button */}
                <Link 
                  href={`/seller-profile/${sellerData.id}`}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-4"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Learn About Us
                </Link>

                {/* Contact Button */}
                <button className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Get a Bag
                </button>
              </div>
            </div>

            {/* Coffee Listings */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Coffees</h2>
                <p className="text-gray-600">Discover our carefully curated selection of premium coffee beans</p>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading coffees...</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {coffeeEntries.map((coffee) => (
                  <div key={coffee.id} className="bg-white rounded-3xl shadow-lg border border-amber-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Coffee Image */}
                      <div className="relative">
                        <div className="w-full h-48 md:h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                          <Coffee className="h-16 w-16 text-amber-600" />
                        </div>
                        {!coffee.available && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Coffee Details */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{coffee.coffeeName}</h3>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 mr-1 text-amber-500" />
                              {coffee.origin}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{coffee.description}</p>

                        {/* Coffee Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Farm:</span>
                            <div className="font-medium text-gray-900">{coffee.farm}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Farmer:</span>
                            <div className="font-medium text-gray-900">{coffee.farmer}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Altitude:</span>
                            <div className="font-medium text-gray-900">{coffee.altitude}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Process:</span>
                            <div className="font-medium text-gray-900">{coffee.process}</div>
                          </div>
                        </div>

                        {/* Tasting Notes */}
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Tasting Notes:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                              {coffee.notes || coffee.primaryNotes || 'Exceptional Quality'}
                            </span>
                          </div>
                        </div>

                        {/* Customer Ratings */}
                        {(() => {
                          const { averageRating, commentCount } = getCoffeeStats(coffee.id);
                          return (
                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
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
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {averageRating > 0 ? averageRating.toFixed(1) : 'No'} rating
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-blue-600">
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

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <Heart className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                              <Share2 className="h-5 w-5" />
                            </button>
                            <Link 
                              href={`/coffees/${coffee.slug || coffee.id}`}
                              className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                            >
                              <Download className="h-5 w-5" />
                            </Link>
                          </div>
                          
                          {coffee.available ? (
                            <Link 
                              href={`/coffees/${coffee.slug || coffee.id}`}
                              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200"
                            >
                              <Coffee className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          ) : (
                            <button className="inline-flex items-center px-6 py-2 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed">
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Out of Stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}
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
            <Link href="/sellers" className="text-gray-300 hover:text-amber-200 transition-colors">Our Sellers</Link>
            <Link href="/admin" className="text-gray-300 hover:text-amber-200 transition-colors">Seller Login</Link>
          </div>
          <p className="text-gray-400">&copy; 2024 Coffee Break Co. Built with ❤️ for coffee excellence.</p>
        </div>
      </footer>
    </div>
  );
}
