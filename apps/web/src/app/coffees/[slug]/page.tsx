'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Thermometer, Leaf, MapPin, Award, Users, Calendar, ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react';
import QRCodeDisplay from '../../../components/QRCodeDisplay';
import Header from '../../../components/Header';
import { useSimpleAuth } from '../../../hooks/useSimpleAuth';
import { useNavigationHistory } from '../../../hooks/useNavigationHistory';
import { extractCoffeeIdFromSlug, generateFallbackSlug } from '../../api/shared/slug-utils';

interface CoffeeEntry {
  id: string;
  coffeeName: string;
  origin: string;
  slug?: string;
  cuppingScore: string;
  process: string;
  variety: string;
  altitude: string;
  notes: string;
  qrCode?: string;
  farm?: string;
  farmer?: string;
  certifications?: string[];
  roastedBy?: string;
  harvestDate?: string;
  processingDate?: string;
  farmSize?: string;
  workerCount?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  primaryNotes?: string;
  secondaryNotes?: string;
  finish?: string;
  fermentationTime?: string;
  dryingTime?: string;
  moistureContent?: string;
  screenSize?: string;
  roastRecommendation?: string;
  environmentalPractices?: string[];
  fairTradePremium?: string;
  communityProjects?: string;
  womenWorkerPercentage?: string;
  aroma?: string;
  flavor?: string;
  acidity?: string;
  body?: string;
  beanDensity?: string;
  producerBio?: string;
  producerName?: string; // Producer/Roaster name
  producerPortrait?: string; // Producer portrait/logo image URL
  sellerId?: string; // This links to the seller's profile page
  farmPhotos?: string[]; // Array of farm photo URLs
  roastingCurveImage?: string; // Roasting curve image URL
}

// This is now a client component
export default function CoffeeSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { user, isAuthenticated } = useSimpleAuth();
  const { addEntry, getPreviousPage } = useNavigationHistory();
  const [coffeeData, setCoffeeData] = useState<CoffeeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingCoffee, setSavingCoffee] = useState(false);

  // Track navigation when component mounts
  useEffect(() => {
    if (params.slug) {
      addEntry(`/coffees/${params.slug}`, `Coffee: ${params.slug}`);
    }
  }, [params.slug, addEntry]);

  // Function to download a specific card as an image
  const downloadCardAsImage = async (cardId: string) => {
    try {
      const cardElement = document.getElementById(cardId);
      if (!cardElement) return;

      // Use html2canvas to capture only the specific card
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        allowTaint: true,
        width: cardElement.offsetWidth,
        height: cardElement.offsetHeight,
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${cardId}-${coffeeData?.coffeeName || 'coffee'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading card:', error);
    }
  };

  // Check if the coffee is already saved by the current user
  const checkIfCoffeeSaved = React.useCallback(async (coffeeId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/saved-coffees?userId=${user.id}`);
      if (response.ok) {
        const result = await response.json();
        const savedCoffees = result.data || [];
        const isAlreadySaved = savedCoffees.some((saved: any) => saved.coffeeId === coffeeId);
        setIsSaved(isAlreadySaved);
      }
    } catch (error) {
      console.error('Error checking if coffee is saved:', error);
    }
  }, [user?.id]);

  React.useEffect(() => {
    const fetchCoffee = async () => {
      try {
        console.log('🔍 Fetching coffee for slug:', params.slug);
        
        // First try to find by exact slug match
        let response = await fetch('/api/coffee-entries');
        if (!response.ok) {
          throw new Error('Failed to fetch coffee entries');
        }

        const result = await response.json();
        console.log('🔍 API Response:', result);

        const coffeeEntries = result.data;
        console.log('🔍 Total coffee entries:', coffeeEntries.length);
        
        // Try exact slug match first
        let foundEntry = coffeeEntries.find((entry: CoffeeEntry) => entry.slug === params.slug);
        console.log('🔍 Exact slug match result:', foundEntry ? 'Found' : 'Not found');

        // If not found by exact slug, try to find by the unique ID from the slug
        if (!foundEntry) {
          console.log('🔍 Exact slug not found, trying to extract coffee ID...');
          
          // Extract the unique coffee ID from the slug
          const extractedId = extractCoffeeIdFromSlug(params.slug);
          console.log('🔍 Extracted coffee ID from slug:', extractedId);
          
          if (extractedId) {
            // Try to find by the extracted ID (this could be a short ID like "0831")
            // First try exact match
            foundEntry = coffeeEntries.find((entry: CoffeeEntry) => entry.id === extractedId);
            console.log('🔍 Exact ID match result:', foundEntry ? 'Found' : 'Not found');
            
            // If not found by exact ID, try to find by short ID in the QR code
            if (!foundEntry) {
              console.log('🔍 Exact ID match failed, trying short ID match...');
              foundEntry = coffeeEntries.find((entry: CoffeeEntry) => {
                if (!entry.qrCode) return false;
                // Check if the QR code contains the short ID
                const shortId = entry.qrCode.replace('COFFEE-', '');
                return shortId === extractedId;
              });
              console.log('🔍 Short ID match result:', foundEntry ? 'Found' : 'Not found');
            }
            
            if (foundEntry) {
              console.log('🔍 Found by ID match, but slug may be outdated');
              console.log('🔍 Current slug:', foundEntry.slug);
              console.log('🔍 Requested slug:', params.slug);
              
              // If the slug is outdated, we can still show the coffee
              // but we might want to redirect to the current slug
              if (foundEntry.slug !== params.slug) {
                console.log('🔍 Slug mismatch detected - coffee exists but with different slug');
                console.log('🔍 This could happen if the coffee name was changed');
              }
            }
          }
          
          // If still not found, try fallback matching
          if (!foundEntry) {
            console.log('🔍 ID match failed, trying fallback matching...');
            
            // Try to find by partial name matching
            foundEntry = coffeeEntries.find((entry: CoffeeEntry) => {
              if (!entry.coffeeName) return false;
              
              // Clean up the requested slug to extract just the coffee name part
              // Remove the COFFEE-XXXX part if it exists
              const requestedName = params.slug.toLowerCase()
                .replace(/-coffee-\d+$/, '') // Remove COFFEE-XXXX suffix
                .replace(/-/g, ' '); // Replace hyphens with spaces
              
              const entryName = entry.coffeeName.toLowerCase();
              
              console.log('🔍 Comparing names:', { requestedName, entryName });
              
              // Check if the requested name contains key parts of the entry name
              // or if the entry name contains key parts of the requested name
              const nameMatch = requestedName.includes(entryName) || 
                               entryName.includes(requestedName) ||
                               // Also check if they share common words
                               requestedName.split(' ').some(word => 
                                 word.length > 2 && entryName.includes(word)
                               ) ||
                               entryName.split(' ').some(word => 
                                 word.length > 2 && requestedName.includes(word)
                               );
              
              if (nameMatch) {
                console.log('🔍 Found by name similarity');
                return true;
              }
              
              return false;
            });
            
            console.log('🔍 Fallback match result:', foundEntry ? 'Found' : 'Not found');
          }
        }

        if (foundEntry) {
          console.log('✅ Coffee found:', foundEntry);
          setCoffeeData(foundEntry);
          // Check if this coffee is already saved by the user
          if (isAuthenticated && user?.id) {
            checkIfCoffeeSaved(foundEntry.id);
          }
        } else {
          console.log('❌ Coffee not found for slug:', params.slug);
          console.log('❌ Available entries:', coffeeEntries.map((e: CoffeeEntry) => ({
            id: e.id,
            name: e.coffeeName,
            slug: e.slug,
            qrCode: e.qrCode
          })));
          
          // Log the specific coffee we're looking for
          const requestedName = params.slug.toLowerCase()
            .replace(/-coffee-\d+$/, '')
            .replace(/-/g, ' ');
          console.log('❌ Requested coffee name (cleaned):', requestedName);
          
          // Show potential matches for debugging
          const potentialMatches = coffeeEntries.filter((e: CoffeeEntry) => {
            if (!e.coffeeName) return false;
            const entryName = e.coffeeName.toLowerCase();
            return requestedName.includes(entryName) || 
                   entryName.includes(requestedName) ||
                   requestedName.split(' ').some(word => 
                     word.length > 2 && entryName.includes(word)
                   ) ||
                   entryName.split(' ').some(word => 
                     word.length > 2 && requestedName.includes(word)
                   );
          });
          console.log('❌ Potential matches found:', potentialMatches.map(e => ({
            id: e.id,
            name: e.coffeeName,
            slug: e.slug
          })));
          
          setError('Coffee not found');
        }
      } catch (err) {
        console.error('❌ Error fetching coffee:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCoffee();
  }, [params.slug, isAuthenticated, user?.id, checkIfCoffeeSaved]);





  // Save coffee function
  const handleSaveCoffee = async () => {
    if (!isAuthenticated || !user?.id) {
      alert('Please sign in to save coffee to your collection');
      return;
    }

    if (!coffeeData) return;

    setSavingCoffee(true);
    try {
      const response = await fetch('/api/saved-coffees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          coffeeId: coffeeData.id,
          coffeeData: {
            coffeeName: coffeeData.coffeeName,
            origin: coffeeData.origin,
            farm: coffeeData.farm || '',
            farmer: coffeeData.farmer || '',
            process: coffeeData.process,
            cuppingScore: coffeeData.cuppingScore,
            notes: coffeeData.notes,
            slug: coffeeData.slug
          }
        })
      });

      if (response.ok) {
        setIsSaved(true);
        alert('Coffee saved to your collection!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save coffee');
      }
    } catch (error) {
      console.error('Error saving coffee:', error);
      alert('Failed to save coffee. Please try again.');
    } finally {
      setSavingCoffee(false);
    }
  };

  // Go to seller function
  const handleGoToSeller = () => {
    if (coffeeData?.sellerId) {
      // Redirect to the seller's profile page
      window.location.href = `/seller-profile/${coffeeData.sellerId}`;
    } else {
      alert('Seller information not available for this coffee');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading coffee details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !coffeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto mb-6">
              <p className="font-bold">Coffee Not Found</p>
              <p className="text-sm">The coffee you're looking for doesn't exist or may have been moved.</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">Requested slug: <code className="bg-gray-100 px-2 py-1 rounded">{params.slug}</code></p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={getPreviousPage()?.path || '/coffees'}
                  className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {getPreviousPage()?.path === '/coffees' ? 'Back to Coffee Collection' : 'Go Back'}
                </Link>
                
                <Link
                  href="/coffees"
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Coffee className="h-5 w-5 mr-2" />
                  View All Coffees
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            {/* Smart back button that uses navigation history */}
            <Link 
              href={getPreviousPage()?.path || '/coffees'} 
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {getPreviousPage()?.path === '/coffees' ? 'Back to Coffee Collection' : 'Back'}
            </Link>
            
            {/* Fallback direct link to coffees page */}
            {getPreviousPage()?.path !== '/coffees' && (
              <Link 
                href="/coffees" 
                className="inline-flex items-center text-gray-500 hover:text-gray-600 text-sm"
              >
                View All Coffees
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Coffee className="h-6 w-6 text-amber-600" />
            <span className="text-xl font-bold text-gray-900">Coffee Digital Passport</span>
          </div>
        </div>

        {/* Coffee Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{coffeeData.coffeeName}</h1>
          <p className="text-xl text-gray-600 mb-2">{coffeeData.origin}</p>
          <p className="text-gray-500">Complete journey from farm to cup</p>
        </div>

        {/* Main Content - Single Column */}
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Farm Origin Card - First Section - Balanced compact design */}
          {coffeeData.farm && (
            <div id="farm-origin-card" className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Farm Origin</h3>
                </div>
                <button 
                  onClick={() => downloadCardAsImage('farm-origin-card')}
                  className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50"
                  title="Download as Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left side - Farm Origin */}
                <div className="space-y-3">
                  {/* Farm name as prominent title */}
                  {coffeeData.farm && (
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{coffeeData.farm}</h4>
                  )}
                  
                  {/* Overall cupping notes */}
                  {coffeeData.notes && (
                    <p className="text-gray-700 text-base leading-relaxed mb-3">{coffeeData.notes}</p>
                  )}
                  
                  {/* Produced by */}
                  {coffeeData.producerName && (
                    <div className="mb-3">
                      <span className="text-gray-700">Produced by: </span>
                      <span className="font-bold text-gray-900">{coffeeData.producerName}</span>
                    </div>
                  )}
                  
                  {/* Farm details - With proper alignment */}
                  <div className="space-y-3">
                    {coffeeData.origin && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700">{coffeeData.origin}</span>
                      </div>
                    )}
                    
                    {coffeeData.altitude && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-gray-700">Altitude: {coffeeData.altitude}</span>
                      </div>
                    )}
                    
                    {coffeeData.variety && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-gray-700">Variety: {coffeeData.variety}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* View on Map - Proper styling */}
                  {coffeeData.coordinates && coffeeData.coordinates.lat && coffeeData.coordinates.lng && (
                    <div className="mt-3">
                      <a
                        href={`https://www.google.com/maps?q=${coffeeData.coordinates.lat},${coffeeData.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-amber-700 hover:text-amber-800 font-medium hover:underline"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                        </svg>
                        View on Map
                      </a>
                    </div>
                  )}
                </div>

                {/* Right side - Farmer Details */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Farmer Details</h4>
                  
                  {coffeeData.farmer && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700"><strong>Farmer:</strong> {coffeeData.farmer}</span>
                    </div>
                  )}
                  
                  {coffeeData.farmSize && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span className="text-gray-700"><strong>Farm Size:</strong> {coffeeData.farmSize}</span>
                    </div>
                  )}
                  
                  {coffeeData.workerCount && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-700"><strong>Workers:</strong> {coffeeData.workerCount}</span>
                    </div>
                  )}
                  
                  {coffeeData.certifications && coffeeData.certifications.length > 0 && (
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <div>
                        <span className="text-gray-700 font-medium">Certifications:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {coffeeData.certifications.map((cert, index) => (
                            <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                              {cert}
                            </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Farm Photo Card - Only show when there's a valid image (not blob URLs) */}
          {coffeeData.farmPhotos && Array.isArray(coffeeData.farmPhotos) && coffeeData.farmPhotos.length > 0 && !coffeeData.farmPhotos[0].startsWith('blob:') && (
            <div id="farm-photo-card" className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Farm Photo</h3>
                </div>
                <button 
                  onClick={() => downloadCardAsImage('farm-photo-card')}
                  className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50"
                  title="Download as Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-center">
                {coffeeData.farmPhotos && Array.isArray(coffeeData.farmPhotos) && coffeeData.farmPhotos.length > 0 && (
                  <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 max-w-md">
                    <img 
                      src={coffeeData.farmPhotos[0]} 
                      alt="Farm photo"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNjAgODkuNTQ0NyA2OC4wMDAxIDgxIDc4IDgxQzg3Ljk5OTkgODEgOTYgODkuNTQ0NyA5NiAxMDBDOTYgMTEwLjQ1NSA4Ny45OTk5IDExOSA3OCAxMTlDNjguMDAwMSAxMTkgNjAgMTEwLjQ1NSA2MCAxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xNDAgMTAwQzE0MCA4OS41NDQ3IDE0OC4wMDEgODEgMTU4IDgxQzE2Ny45OTkgODEgMTc2IDg5LjU0NDcgMTc2IDEwMEMxNzYgMTEwLjQ1NSAxNjcuOTk5IDExOSAxNTggMTE5QzE0OC4wMDEgMTE5IDE0MCAxMTAuNDU1IDE0MCAxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NTUgMTIwIDExOSAxMTEuNDU1IDExOSAxMDFDMTE5IDkwLjU0NDcgMTEwLjQ1NSA4MiAxMDAgODJDODkuNTQ0NyA4MiA4MSA5MC41NDQ3IDgxIDEwMUM4MSAxMTEuNDU1IDg5LjU0NDcgMTIwIDEwMCAxMjBaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Farm photo from {coffeeData.farm || 'the farm'}
                </p>
              </div>
            </div>
          )}

          {/* Coffee Information Card */}
          {coffeeData && (
            <div id="coffee-info-card" className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-md">
                    <Coffee className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Coffee Information</h3>
                </div>
                <button 
                  onClick={() => downloadCardAsImage('coffee-info-card')}
                  className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50"
                  title="Download as Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-amber-600 mr-3" />
                  <span className="text-gray-700"><strong>Cupping Score:</strong> {coffeeData.cuppingScore}/100</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="text-gray-700"><strong>Process:</strong> {coffeeData.process}</span>
                </div>
                {coffeeData.roastedBy && (
                  <div className="flex items-center">
                    <Coffee className="h-5 w-5 text-amber-600 mr-3" />
                    <span className="text-gray-700"><strong>Roasted by:</strong> {coffeeData.roastedBy}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {coffeeData.harvestDate && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-amber-600 mr-3" />
                    <span className="text-gray-700"><strong>Harvest:</strong> {coffeeData.harvestDate}</span>
                  </div>
                )}
                {coffeeData.processingDate && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-amber-600 mr-3" />
                    <span className="text-gray-700"><strong>Processing:</strong> {coffeeData.processingDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Roasting Curve Image Card - Only show when there's a valid image (not blob URLs) */}
          {coffeeData.roastingCurveImage && !coffeeData.roastingCurveImage.startsWith('blob:') && (
            <div id="roasting-curve-card" className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Roasting Curve</h3>
                </div>
                <button 
                  onClick={() => downloadCardAsImage('roasting-curve-card')}
                  className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50"
                  title="Download as Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <div className="max-w-2xl mx-auto">
                  <img 
                    src={coffeeData.roastingCurveImage} 
                    alt="Roasting curve for this coffee"
                    className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0wIDMwMEwxMDAgMjAwTDIwMCAyNTBMMzAwIDE1MEw0MDAgMjAwTDUwMCAxMDBMNjAwIDE1MCIgc3Ryb2tlPSIjRkY2QjM1IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIyMDAiIHI9IjQiIGZpbGw9IiNGRjZCMzUiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjUwIiByPSI0IiBmaWxsPSIjRkY2QjM1Ii8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE1MCIgcj0iNCIgZmlsbD0iI0ZGNkIzNSIvPgo8Y2lyY2xlIGN4PSI0MDAiIGN5PSIyMDAiIHI9IjQiIGZpbGw9IiNGRjZCMzUiLz4KPGNpcmNsZSBjeD0iNTAwIiBjeT0iMTAwIiByPSI0IiBmaWxsPSIjRkY2QjM1Ii8+CjxjaXJjbGUgY3g9IjYwMCIgY3k9IjE1MCIgcj0iNCIgZmlsbD0iI0ZGNkIzNSIvPgo8dGV4dCB4PSIzMDAiIHk9IjM1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjc3NDhCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sb2FzdGluZyBDdXJ2ZTwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Roasting profile and temperature curve for optimal flavor development
                  </p>
                  {coffeeData.roastRecommendation && (
                    <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {coffeeData.roastRecommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Producer Information Card */}
          {(coffeeData.producerName || coffeeData.producerBio) && (
            <div id="producer-info-card" className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-md">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Producer Information</h3>
                </div>
                <button 
                  onClick={() => downloadCardAsImage('producer-info-card')}
                  className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50"
                  title="Download as Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Producer Portrait/Logo */}
                <div className="flex flex-col items-center">
                  {coffeeData.producerPortrait ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-100 shadow-lg mb-4">
                      <img 
                        src={coffeeData.producerPortrait} 
                        alt={`${coffeeData.producerName} portrait`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 border-4 border-amber-100 shadow-lg mb-4 flex items-center justify-center">
                      <Users className="w-16 h-16 text-amber-600" />
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-gray-900 text-center">{coffeeData.producerName}</h4>
                </div>
                
                {/* Producer Bio and Details */}
                <div className="md:col-span-2 space-y-4">
                  {coffeeData.producerBio && (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        About the Producer
                      </h5>
                      <p className="text-gray-700 leading-relaxed">{coffeeData.producerBio}</p>
                    </div>
                  )}
                  
                  {/* Additional Producer Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {coffeeData.roastedBy && (
                      <div className="flex items-center">
                        <Coffee className="h-5 w-5 text-amber-600 mr-3" />
                        <span className="text-gray-700"><strong>Roasted by:</strong> {coffeeData.roastedBy}</span>
                      </div>
                    )}
                    {coffeeData.harvestDate && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-amber-600 mr-3" />
                        <span className="text-gray-700"><strong>Harvest Date:</strong> {coffeeData.harvestDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quality Assessment & Tasting Profile Card */}
          {coffeeData && (coffeeData.aroma || coffeeData.flavor || coffeeData.acidity || coffeeData.body || 
            coffeeData.primaryNotes || coffeeData.secondaryNotes || coffeeData.finish || coffeeData.roastRecommendation) && (
            <div id="quality-assessment-card" className="bg-white rounded-xl shadow-lg p-3">
              {/* Header with Icon and Title */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Quality Assessment</h3>
                </div>
                <button 
                  onClick={() => downloadCardAsImage('quality-assessment-card')}
                  className="text-amber-600 hover:text-amber-700 p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                  title="Download as Image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
              
              {/* Ultra-compact single-column layout */}
              <div className="space-y-2">
                {/* Quality Metrics - Compact inline */}
                <div className="grid grid-cols-2 gap-2">
                  {coffeeData.aroma && (
                    <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700 font-medium text-xs">Aroma</span>
                        <span className="text-gray-900 font-bold text-xs">{coffeeData.aroma}/10</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                          style={{ width: `${(parseFloat(coffeeData.aroma) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {coffeeData.flavor && (
                    <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700 font-medium text-xs">Flavor</span>
                        <span className="text-gray-900 font-bold text-xs">{coffeeData.flavor}/10</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                          style={{ width: `${(parseFloat(coffeeData.flavor) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {coffeeData.acidity && (
                    <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700 font-medium text-xs">Acidity</span>
                        <span className="text-gray-900 font-bold text-xs">{coffeeData.acidity}/10</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                          style={{ width: `${(parseFloat(coffeeData.acidity) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {coffeeData.body && (
                    <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700 font-medium text-xs">Body</span>
                        <span className="text-gray-900 font-bold text-xs">{coffeeData.body}/10</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                          style={{ width: `${(parseFloat(coffeeData.body) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tasting Profile - Two-column layout */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-100">
                  <h4 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Tasting Profile
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {coffeeData.notes && (
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="text-xs">
                          <span className="text-purple-700 font-semibold">Tasting Notes: </span>
                          <span className="text-gray-800">{coffeeData.notes}</span>
                        </div>
                      </div>
                    )}
                    
                    {coffeeData.primaryNotes && (
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="text-xs">
                          <span className="text-purple-700 font-semibold">Primary: </span>
                          <span className="text-gray-800">{coffeeData.primaryNotes}</span>
                        </div>
                      </div>
                    )}
                    
                    {coffeeData.secondaryNotes && (
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="text-xs">
                          <span className="text-purple-700 font-semibold">Secondary: </span>
                          <span className="text-gray-800">{coffeeData.secondaryNotes}</span>
                        </div>
                      </div>
                    )}
                    
                    {coffeeData.finish && (
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="text-xs">
                          <span className="text-purple-700 font-semibold">Finish: </span>
                          <span className="text-gray-800">{coffeeData.finish}</span>
                        </div>
                      </div>
                    )}
                    
                    {coffeeData.roastRecommendation && (
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="text-xs">
                          <span className="text-purple-700 font-semibold">Roast: </span>
                          <span className="text-gray-800">{coffeeData.roastRecommendation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Processing Details Card */}
          {(coffeeData.fermentationTime || coffeeData.dryingTime || coffeeData.moistureContent || coffeeData.screenSize) && (
            <div id="processing-details-card" className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Processing Details</h3>
                </div>
                <button 
                  onClick={() => downloadCardAsImage('processing-details-card')}
                  className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50"
                  title="Download as Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {coffeeData.fermentationTime && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700"><strong>Fermentation:</strong> {coffeeData.fermentationTime}</span>
                    </div>
                  )}
                  {coffeeData.dryingTime && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-gray-700"><strong>Drying Time:</strong> {coffeeData.dryingTime}</span>
                    </div>
                  )}
                  {coffeeData.beanDensity && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-gray-700"><strong>Bean Density:</strong> {coffeeData.beanDensity}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {coffeeData.moistureContent && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span className="text-gray-700"><strong>Moisture:</strong> {coffeeData.moistureContent}</span>
                    </div>
                  )}
                  {coffeeData.screenSize && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span className="text-gray-700"><strong>Screen Size:</strong> {coffeeData.screenSize}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Environmental & Community Card */}
          {(coffeeData.environmentalPractices || coffeeData.fairTradePremium || coffeeData.communityProjects || coffeeData.womenWorkerPercentage) && (
            <div id="sustainability-card" className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Sustainability & Community</h3>
                </div>
                <button 
                  onClick={() => downloadCardAsImage('sustainability-card')}
                  className="text-amber-600 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50"
                  title="Download as Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {coffeeData.environmentalPractices && coffeeData.environmentalPractices.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Leaf className="h-5 w-5 text-green-600 mr-2" />
                      Environmental Practices
                    </h4>
                    <ul className="space-y-2">
                      {coffeeData.environmentalPractices.map((practice, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span className="text-gray-700">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(coffeeData.fairTradePremium || coffeeData.communityProjects || coffeeData.womenWorkerPercentage) && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      Community Impact
                    </h4>
                    <div className="space-y-2">
                      {coffeeData.fairTradePremium && (
                        <p className="text-gray-700"><strong>Fair Trade Premium:</strong> {coffeeData.fairTradePremium}</p>
                      )}
                      {coffeeData.communityProjects && (
                        <p className="text-gray-700"><strong>Community Projects:</strong> {coffeeData.communityProjects}</p>
                      )}
                      {coffeeData.womenWorkerPercentage && (
                        <p className="text-gray-700"><strong>Women Workers:</strong> {coffeeData.womenWorkerPercentage}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR Code & Actions Section */}
          <div id="qr-actions-card" className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Digital Passport</h3>
              </div>
              
              {/* QR Code */}
              <div className="mb-6">
                <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                  <QRCodeDisplay
                    value={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/coffees/${coffeeData.slug}`}
                    size={120}
                    bgColor="#FFFFFF"
                    fgColor="#92400E"
                    level="M"
                    showBorder={false}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">QR Code: {coffeeData.qrCode}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Save Coffee Button - Only for authenticated users */}
                <button 
                  className={`px-6 py-3 font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center ${
                    isSaved 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                  onClick={handleSaveCoffee}
                  disabled={savingCoffee}
                >
                  {savingCoffee ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : isSaved ? (
                    <>
                      <BookmarkCheck className="h-5 w-5 mr-2" />
                      Saved ✓
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-5 w-5 mr-2" />
                      Save Coffee
                    </>
                  )}
                </button>
                
                {/* Go to Seller Button */}
                <button 
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                  onClick={handleGoToSeller}
                >
                  <Users className="h-5 w-5 inline mr-2" />
                  Go to Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
