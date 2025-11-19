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
   * Helper to remove undefined values from object (for exactOptionalPropertyTypes)
   */
  private removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  /**
   * Map Prisma Coffee model to CoffeeEntry interface
   * Converts database model to API response format
   */
  private mapCoffeeToEntry(coffee: Coffee): CoffeeEntry {
    const baseEntry = {
      id: coffee.id,
      coffeeName: coffee.coffeeName,
      origin: coffee.origin,
      certifications: coffee.certifications,
      coordinates: {
        lat: coffee.coordinatesLat ?? 0,
        lng: coffee.coordinatesLng ?? 0,
      },
      environmentalPractices: coffee.environmentalPractices,
      available: coffee.available,
      createdAt: coffee.createdAt.toISOString(),
      updatedAt: coffee.updatedAt.toISOString(),
      flavorNotes: coffee.flavorNotes,
      farmPhotos: coffee.farmPhotos,
    };

    // Add optional fields only if they have values
    const optionalFields: Partial<CoffeeEntry> = {};
    if (coffee.farm) optionalFields.farm = coffee.farm;
    if (coffee.farmer) optionalFields.farmer = coffee.farmer;
    if (coffee.altitude) optionalFields.altitude = coffee.altitude;
    if (coffee.variety) optionalFields.variety = coffee.variety;
    if (coffee.process) optionalFields.process = coffee.process;
    if (coffee.harvestDate) optionalFields.harvestDate = coffee.harvestDate;
    if (coffee.processingDate) optionalFields.processingDate = coffee.processingDate;
    if (coffee.cuppingScore) optionalFields.cuppingScore = coffee.cuppingScore;
    if (coffee.notes) optionalFields.notes = coffee.notes;
    if (coffee.qrCode) optionalFields.qrCode = coffee.qrCode;
    if (coffee.slug) optionalFields.slug = coffee.slug;
    if (coffee.producerName) optionalFields.producerName = coffee.producerName;
    if (coffee.producerBio) optionalFields.producerBio = coffee.producerBio;
    if (coffee.roastedBy) optionalFields.roastedBy = coffee.roastedBy;
    if (coffee.fermentationTime) optionalFields.fermentationTime = coffee.fermentationTime;
    if (coffee.dryingTime) optionalFields.dryingTime = coffee.dryingTime;
    if (coffee.moistureContent) optionalFields.moistureContent = coffee.moistureContent;
    if (coffee.screenSize) optionalFields.screenSize = coffee.screenSize;
    if (coffee.beanDensity) optionalFields.beanDensity = coffee.beanDensity;
    if (coffee.aroma) optionalFields.aroma = coffee.aroma;
    if (coffee.flavor) optionalFields.flavor = coffee.flavor;
    if (coffee.acidity) optionalFields.acidity = coffee.acidity;
    if (coffee.body) optionalFields.body = coffee.body;
    if (coffee.primaryNotes) optionalFields.primaryNotes = coffee.primaryNotes;
    if (coffee.secondaryNotes) optionalFields.secondaryNotes = coffee.secondaryNotes;
    if (coffee.finish) optionalFields.finish = coffee.finish;
    if (coffee.roastRecommendation) optionalFields.roastRecommendation = coffee.roastRecommendation;
    if (coffee.fairTradePremium) optionalFields.fairTradePremium = coffee.fairTradePremium;
    if (coffee.communityProjects) optionalFields.communityProjects = coffee.communityProjects;
    if (coffee.womenWorkerPercentage) optionalFields.womenWorkerPercentage = coffee.womenWorkerPercentage;
    if (coffee.sellerId) optionalFields.sellerId = coffee.sellerId;
    if (coffee.harvestYear) optionalFields.harvestYear = coffee.harvestYear;
    if (coffee.roastLevel) optionalFields.roastLevel = coffee.roastLevel;
    if (coffee.description) optionalFields.description = coffee.description;
    if (coffee.price) optionalFields.price = coffee.price;
    if (coffee.currency) optionalFields.currency = coffee.currency;
    if (coffee.weight) optionalFields.weight = coffee.weight;
    if (coffee.roastingCurveImage) optionalFields.roastingCurveImage = coffee.roastingCurveImage;
    if (coffee.region) optionalFields.region = coffee.region;
    if (coffee.subscriptionTier) optionalFields.subscriptionTier = coffee.subscriptionTier;

    return { ...baseEntry, ...optionalFields } as CoffeeEntry;
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
