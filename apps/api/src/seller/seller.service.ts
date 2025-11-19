/**
 * Seller Service
 * Handles seller data operations
 * Reads from persistent JSON file for MVP implementation
 */

import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { CoffeeService } from '../coffee/coffee.service';

/**
 * Seller interface matching the data structure
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

@Injectable()
export class SellerService {
  private readonly logger = new Logger(SellerService.name);
  private readonly sellersFile = process.env.DATA_DIR
    ? path.join(process.env.DATA_DIR, 'sellers-persistent.json')
    : path.join(process.cwd(), '..', '..', 'data', 'sellers-persistent.json');

  constructor(private readonly coffeeService: CoffeeService) {}

  /**
   * Read sellers data from persistent storage
   */
  private async readSellersData(): Promise<Record<string, any>> {
    try {
      const data = await fs.readFile(this.sellersFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      this.logger.warn('No sellers file found, returning empty object');
      return {};
    }
  }

  /**
   * Get brand color for seller
   */
  private getBrandColor(sellerId: string): string {
    const colors = [
      'from-amber-400 to-orange-500',
      'from-emerald-400 to-teal-500',
      'from-blue-400 to-cyan-500',
      'from-purple-400 to-indigo-500',
      'from-pink-400 to-rose-500',
    ] as const;
    const numId = parseInt(sellerId.replace(/\D/g, '')) || 0;
    const index = numId % colors.length;
    const color = colors[index];
    if (color) {
      return color;
    }
    return colors[0];
  }

  /**
   * Get all sellers with coffee data
   */
  async getAllSellers(): Promise<Seller[]> {
    const sellersData = await this.readSellersData();
    const allCoffees = await this.coffeeService.getAllCoffees();

    // Convert sellers object to array and enrich with coffee data
    const sellersArray = await Promise.all(
      Object.values(sellersData).map(async (seller: any) => {
        const sellerCoffees = allCoffees.filter(
          (coffee) => coffee.sellerId === seller.id || coffee.sellerId === String(seller.id)
        );

        const coffeeCount = sellerCoffees.length;
        const featuredCoffee = sellerCoffees.length > 0 && sellerCoffees[0]?.coffeeName ? sellerCoffees[0].coffeeName : '';

        // Get region from coffee origins
        const regionParts = sellerCoffees
          .map((c) => c.origin?.split(',')[1]?.trim())
          .filter(Boolean);
        const region = regionParts.length > 0 ? regionParts[0] : seller.location || '';

        // Determine location display - prioritize city/country
        let displayLocation = seller.location || 'Location not specified';
        if (seller.city && seller.country) {
          displayLocation = `${seller.city}, ${seller.country}`;
        } else if (seller.city) {
          displayLocation = seller.city;
        } else if (seller.country) {
          displayLocation = seller.country;
        }

        // Get logo if available
        const sellerLogo =
          seller.logo && seller.logo !== 'undefined' && seller.logo !== 'null'
            ? seller.logo
            : undefined;

        return {
          id: seller.id,
          name: seller.companyName || seller.name || 'Unknown Seller',
          location: displayLocation,
          description: seller.mission || seller.description || '',
          featuredCoffee,
          region: region || '',
          certifications: seller.certifications || [],
          rating: seller.rating || 0,
          coffeeCount,
          memberSince: seller.memberSince || 2024,
          image: sellerLogo || '',
          sellerPhoto: sellerLogo,
          specialties: seller.specialties || [],
          brandColor: this.getBrandColor(seller.id),
          logo: sellerLogo,
          coffees: sellerCoffees.map((coffee) => ({
            id: coffee.id,
            name: coffee.coffeeName,
            origin: coffee.origin || '',
            cuppingScore: coffee.cuppingScore || '0',
            available: coffee.available !== false,
          })),
        };
      })
    );

    return sellersArray;
  }

  /**
   * Get seller by ID
   */
  async getSellerById(id: string): Promise<Seller | null> {
    const sellers = await this.getAllSellers();
    return sellers.find((seller) => seller.id === id) || null;
  }
}
