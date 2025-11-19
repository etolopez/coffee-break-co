/**
 * Coffee Service
 * Handles coffee data operations using PostgreSQL via Prisma
 * Migrated from JSON file storage to database-backed storage
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Coffee, Prisma } from '@prisma/client';

/**
 * Coffee entry interface matching the API response structure
 * Maps Prisma model to API response format
 */
export interface CoffeeEntry {
  id: string;
  coffeeName: string;
  origin: string;
  farm?: string;
  farmer?: string;
  altitude?: string;
  variety?: string;
  process?: string;
  harvestDate?: string;
  processingDate?: string;
  cuppingScore?: string;
  notes?: string;
  qrCode?: string;
  slug?: string;
  certifications: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  producerName?: string;
  producerBio?: string;
  roastedBy?: string;
  fermentationTime?: string;
  dryingTime?: string;
  moistureContent?: string;
  screenSize?: string;
  beanDensity?: string;
  aroma?: string;
  flavor?: string;
  acidity?: string;
  body?: string;
  primaryNotes?: string;
  secondaryNotes?: string;
  finish?: string;
  roastRecommendation?: string;
  environmentalPractices: string[];
  fairTradePremium?: string;
  communityProjects?: string;
  womenWorkerPercentage?: string;
  available?: boolean;
  sellerId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields from JSON structure
  harvestYear?: string;
  roastLevel?: string;
  flavorNotes?: string[];
  description?: string;
  price?: string;
  currency?: string;
  weight?: string;
  farmPhotos?: string[];
  roastingCurveImage?: string;
  region?: string;
  subscriptionTier?: string;
}

@Injectable()
export class CoffeeService {
  private readonly logger = new Logger(CoffeeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Map Prisma Coffee model to CoffeeEntry interface
   * Converts database model to API response format
   */
  private mapCoffeeToEntry(coffee: Coffee): CoffeeEntry {
    return {
      id: coffee.id,
      coffeeName: coffee.coffeeName,
      origin: coffee.origin,
      farm: coffee.farm ?? undefined,
      farmer: coffee.farmer ?? undefined,
      altitude: coffee.altitude ?? undefined,
      variety: coffee.variety ?? undefined,
      process: coffee.process ?? undefined,
      harvestDate: coffee.harvestDate ?? undefined,
      processingDate: coffee.processingDate ?? undefined,
      cuppingScore: coffee.cuppingScore ?? undefined,
      notes: coffee.notes ?? undefined,
      qrCode: coffee.qrCode ?? undefined,
      slug: coffee.slug ?? undefined,
      certifications: coffee.certifications,
      coordinates: {
        lat: coffee.coordinatesLat ?? 0,
        lng: coffee.coordinatesLng ?? 0,
      },
      producerName: coffee.producerName ?? undefined,
      producerBio: coffee.producerBio ?? undefined,
      roastedBy: coffee.roastedBy ?? undefined,
      fermentationTime: coffee.fermentationTime ?? undefined,
      dryingTime: coffee.dryingTime ?? undefined,
      moistureContent: coffee.moistureContent ?? undefined,
      screenSize: coffee.screenSize ?? undefined,
      beanDensity: coffee.beanDensity ?? undefined,
      aroma: coffee.aroma ?? undefined,
      flavor: coffee.flavor ?? undefined,
      acidity: coffee.acidity ?? undefined,
      body: coffee.body ?? undefined,
      primaryNotes: coffee.primaryNotes ?? undefined,
      secondaryNotes: coffee.secondaryNotes ?? undefined,
      finish: coffee.finish ?? undefined,
      roastRecommendation: coffee.roastRecommendation ?? undefined,
      environmentalPractices: coffee.environmentalPractices,
      fairTradePremium: coffee.fairTradePremium ?? undefined,
      communityProjects: coffee.communityProjects ?? undefined,
      womenWorkerPercentage: coffee.womenWorkerPercentage ?? undefined,
      available: coffee.available,
      sellerId: coffee.sellerId ?? undefined,
      createdAt: coffee.createdAt.toISOString(),
      updatedAt: coffee.updatedAt.toISOString(),
      // Map additional fields
      harvestYear: coffee.harvestYear ?? undefined,
      roastLevel: coffee.roastLevel ?? undefined,
      flavorNotes: coffee.flavorNotes,
      description: coffee.description ?? undefined,
      price: coffee.price ?? undefined,
      currency: coffee.currency ?? undefined,
      weight: coffee.weight ?? undefined,
      farmPhotos: coffee.farmPhotos,
      roastingCurveImage: coffee.roastingCurveImage ?? undefined,
      region: coffee.region ?? undefined,
      subscriptionTier: coffee.subscriptionTier ?? undefined,
    };
  }

  /**
   * Get all coffee entries
   * Optionally filter by sellerId
   */
  async getAllCoffees(sellerId?: string): Promise<CoffeeEntry[]> {
    try {
      const where: Prisma.CoffeeWhereInput = {};
      
      if (sellerId) {
        where.sellerId = sellerId;
      }

      const coffees = await this.prisma.coffee.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return coffees.map(coffee => this.mapCoffeeToEntry(coffee));
    } catch (error) {
      this.logger.error('Error fetching coffees from database', error);
      throw error;
    }
  }

  /**
   * Get coffee by ID
   */
  async getCoffeeById(id: string): Promise<CoffeeEntry | null> {
    try {
      const coffee = await this.prisma.coffee.findUnique({
        where: { id },
      });

      if (!coffee) {
        return null;
      }

      return this.mapCoffeeToEntry(coffee);
    } catch (error) {
      this.logger.error(`Error fetching coffee by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Get coffee by slug
   */
  async getCoffeeBySlug(slug: string): Promise<CoffeeEntry | null> {
    try {
      const coffee = await this.prisma.coffee.findUnique({
        where: { slug },
      });

      if (!coffee) {
        return null;
      }

      return this.mapCoffeeToEntry(coffee);
    } catch (error) {
      this.logger.error(`Error fetching coffee by slug: ${slug}`, error);
      throw error;
    }
  }
}
