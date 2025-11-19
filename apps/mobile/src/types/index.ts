/**
 * Coffee Digital Passport Mobile App - Type Definitions
 * Centralized type definitions for the mobile application
 */

/**
 * Coffee entry interface matching the API response
 */
export interface CoffeeEntry {
  id: string;
  coffeeName: string;
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
  available?: boolean;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Seller interface matching the API response
 */
export interface Seller {
  id: string;
  name: string;
  location: string;
  description: string;
  featuredCoffee: string;
  region: string;
  certifications: string[];
  rating: number;
  coffeeCount: number;
  memberSince: number;
  image: string;
  sellerPhoto?: string;
  specialties: string[];
  brandColor: string;
  logo?: string;
  coffees?: {
    id: string;
    name: string;
    origin: string;
    cuppingScore: string;
    available: boolean;
  }[];
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Coffee rating interface
 */
export interface CoffeeRating {
  coffeeId: string;
  rating: number;
  count: number;
}
