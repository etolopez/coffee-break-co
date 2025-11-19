/**
 * Coffee Service
 * Handles coffee data operations
 * Reads from persistent JSON file for MVP implementation
 */

import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Coffee entry interface matching the data structure
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

@Injectable()
export class CoffeeService {
  private readonly logger = new Logger(CoffeeService.name);
  private readonly coffeeEntriesFile = process.env['DATA_DIR']
    ? path.join(process.env['DATA_DIR'], 'coffee-entries-persistent.json')
    : path.join(process.cwd(), '..', '..', 'data', 'coffee-entries-persistent.json');

  /**
   * Read coffee entries from persistent storage
   */
  private async readCoffeeEntries(): Promise<CoffeeEntry[]> {
    try {
      const data = await fs.readFile(this.coffeeEntriesFile, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.entries || [];
    } catch (error) {
      this.logger.warn('No coffee entries file found, returning empty array');
      return [];
    }
  }

  /**
   * Get all coffee entries
   */
  async getAllCoffees(sellerId?: string): Promise<CoffeeEntry[]> {
    const entries = await this.readCoffeeEntries();
    
    if (sellerId) {
      return entries.filter(entry => entry.sellerId === sellerId);
    }
    
    return entries;
  }

  /**
   * Get coffee by ID
   */
  async getCoffeeById(id: string): Promise<CoffeeEntry | null> {
    const entries = await this.readCoffeeEntries();
    return entries.find(entry => entry.id === id) || null;
  }

  /**
   * Get coffee by slug
   */
  async getCoffeeBySlug(slug: string): Promise<CoffeeEntry | null> {
    const entries = await this.readCoffeeEntries();
    return entries.find(entry => entry.slug === slug) || null;
  }
}
