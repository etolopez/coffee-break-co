/**
 * Prisma Seed Script
 * Migrates data from JSON files to PostgreSQL database
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed demo users for testing
 */
async function seedDemoUsers() {
  const demoUsers = [
    // Admin
    {
      email: 'admin@coffeebreak.com',
      password: 'password',
      name: 'Admin User',
      role: 'admin',
    },
    // Sellers
    {
      email: 'seller@coffeebreak.com',
      password: 'password',
      name: 'Free Tier Seller',
      role: 'seller',
    },
    {
      email: 'seller@premiumcoffee.com',
      password: 'password',
      name: 'Premium Coffee Co',
      role: 'seller',
    },
    {
      email: 'seller@mountainview.com',
      password: 'password',
      name: 'Mountain View Roasters',
      role: 'seller',
    },
    {
      email: 'liquidsoul@coffeebreak.com',
      password: 'password',
      name: 'Liquid Soul',
      role: 'seller',
    },
    {
      email: 'basic@coffeebreak.com',
      password: 'password',
      name: 'Basic Coffee Co',
      role: 'seller',
    },
    {
      email: 'premium@coffeebreak.com',
      password: 'password',
      name: 'Premium Coffee Co',
      role: 'seller',
    },
    {
      email: 'enterprise@coffeebreak.com',
      password: 'password',
      name: 'Enterprise Coffee Co',
      role: 'seller',
    },
    // Customers
    {
      email: 'customer@example.com',
      password: 'password',
      name: 'Demo Customer',
      role: 'customer',
    },
    {
      email: 'customer@coffeebreak.com',
      password: 'password',
      name: 'Coffee Lover',
      role: 'customer',
    },
  ];

  for (const userData of demoUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
      },
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        profile: {
          create: {},
        },
      },
    });
    
    console.log(`  ✅ Seeded user: ${userData.email} (${userData.role})`);
  }

  console.log(`✅ Seeded ${demoUsers.length} demo users`);
}

/**
 * Seed function to migrate JSON data to PostgreSQL
 */
async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed demo users first
    console.log('👤 Seeding demo users...');
    await seedDemoUsers();

    // Read JSON data files
    const dataDir = process.env['DATA_DIR'] 
      ? process.env['DATA_DIR']
      : path.join(process.cwd(), '..', '..', 'data');

    const coffeeEntriesFile = path.join(dataDir, 'coffee-entries-persistent.json');
    const sellersFile = path.join(dataDir, 'sellers-persistent.json');

    // Read and parse JSON files
    console.log('📖 Reading JSON data files...');
    const coffeeData = JSON.parse(await fs.readFile(coffeeEntriesFile, 'utf-8'));
    const sellersData = JSON.parse(await fs.readFile(sellersFile, 'utf-8'));

    // Seed Sellers first (coffees depend on sellers)
    console.log('👥 Seeding sellers...');
    const sellersArray = Object.values(sellersData);
    
    for (const seller of sellersArray as any[]) {
      await prisma.seller.upsert({
        where: { id: seller.id },
        update: {
          companyName: seller.companyName || seller.name || 'Unknown Seller',
          companySize: seller.companySize || null,
          mission: seller.mission || null,
          logo: seller.logo && seller.logo !== 'undefined' && seller.logo !== 'null' ? seller.logo : null,
          phone: seller.phone || null,
          email: seller.email || null,
          location: seller.location || null,
          country: seller.country || null,
          city: seller.city || null,
          rating: seller.rating || 0,
          totalCoffees: seller.totalCoffees || 0,
          memberSince: seller.memberSince || 2024,
          specialties: seller.specialties || [],
          featuredCoffeeId: seller.featuredCoffeeId || null,
          description: seller.description || seller.mission || null,
          website: seller.website || null,
          instagram: seller.socialMedia?.instagram || null,
          facebook: seller.socialMedia?.facebook || null,
          twitter: seller.socialMedia?.twitter || null,
          certifications: seller.certifications || [],
          uniqueSlug: seller.uniqueSlug || `seller-${seller.id}`,
          defaultPricePerBag: seller.defaultPricePerBag || null,
          orderLink: seller.orderLink || null,
        },
        create: {
          id: seller.id,
          companyName: seller.companyName || seller.name || 'Unknown Seller',
          companySize: seller.companySize || null,
          mission: seller.mission || null,
          logo: seller.logo && seller.logo !== 'undefined' && seller.logo !== 'null' ? seller.logo : null,
          phone: seller.phone || null,
          email: seller.email || null,
          location: seller.location || null,
          country: seller.country || null,
          city: seller.city || null,
          rating: seller.rating || 0,
          totalCoffees: seller.totalCoffees || 0,
          memberSince: seller.memberSince || 2024,
          specialties: seller.specialties || [],
          featuredCoffeeId: seller.featuredCoffeeId || null,
          description: seller.description || seller.mission || null,
          website: seller.website || null,
          instagram: seller.socialMedia?.instagram || null,
          facebook: seller.socialMedia?.facebook || null,
          twitter: seller.socialMedia?.twitter || null,
          certifications: seller.certifications || [],
          uniqueSlug: seller.uniqueSlug || `seller-${seller.id}`,
          defaultPricePerBag: seller.defaultPricePerBag || null,
          orderLink: seller.orderLink || null,
        },
      });
    }

    console.log(`✅ Seeded ${sellersArray.length} sellers`);

    // Seed Coffees
    console.log('☕ Seeding coffees...');
    const coffeesArray = coffeeData.entries || [];

    for (const coffee of coffeesArray) {
      await prisma.coffee.upsert({
        where: { id: coffee.id },
        update: {
          coffeeName: coffee.coffeeName,
          roastedBy: coffee.roastedBy || null,
          sellerId: coffee.sellerId || null,
          origin: coffee.origin,
          region: coffee.region || null,
          altitude: coffee.altitude || null,
          process: coffee.process || null,
          variety: coffee.variety || null,
          harvestYear: coffee.harvestYear || null,
          roastLevel: coffee.roastLevel || null,
          flavorNotes: coffee.flavorNotes || [],
          description: coffee.description || null,
          price: coffee.price || null,
          currency: coffee.currency || 'USD',
          weight: coffee.weight || null,
          qrCode: coffee.qrCode || null,
          slug: coffee.slug || null,
          farmPhotos: coffee.farmPhotos || [],
          roastingCurveImage: coffee.roastingCurveImage || null,
          coordinatesLat: coffee.coordinates?.lat || null,
          coordinatesLng: coffee.coordinates?.lng || null,
          certifications: coffee.certifications || [],
          environmentalPractices: coffee.environmentalPractices || [],
          farm: coffee.farm || null,
          farmer: coffee.farmer || null,
          cuppingScore: coffee.cuppingScore || null,
          notes: coffee.notes || null,
          harvestDate: coffee.harvestDate || null,
          processingDate: coffee.processingDate || null,
          producerName: coffee.producerName || null,
          producerBio: coffee.producerBio || null,
          aroma: coffee.aroma || null,
          flavor: coffee.flavor || null,
          acidity: coffee.acidity || null,
          body: coffee.body || null,
          primaryNotes: coffee.primaryNotes || null,
          secondaryNotes: coffee.secondaryNotes || null,
          finish: coffee.finish || null,
          fermentationTime: coffee.fermentationTime || null,
          dryingTime: coffee.dryingTime || null,
          moistureContent: coffee.moistureContent || null,
          screenSize: coffee.screenSize || null,
          beanDensity: coffee.beanDensity || null,
          roastRecommendation: coffee.roastRecommendation || null,
          fairTradePremium: coffee.fairTradePremium || null,
          communityProjects: coffee.communityProjects || null,
          womenWorkerPercentage: coffee.womenWorkerPercentage || null,
          available: coffee.available !== false,
        },
        create: {
          id: coffee.id,
          coffeeName: coffee.coffeeName,
          roastedBy: coffee.roastedBy || null,
          sellerId: coffee.sellerId || null,
          origin: coffee.origin,
          region: coffee.region || null,
          altitude: coffee.altitude || null,
          process: coffee.process || null,
          variety: coffee.variety || null,
          harvestYear: coffee.harvestYear || null,
          roastLevel: coffee.roastLevel || null,
          flavorNotes: coffee.flavorNotes || [],
          description: coffee.description || null,
          price: coffee.price || null,
          currency: coffee.currency || 'USD',
          weight: coffee.weight || null,
          qrCode: coffee.qrCode || null,
          slug: coffee.slug || null,
          farmPhotos: coffee.farmPhotos || [],
          roastingCurveImage: coffee.roastingCurveImage || null,
          coordinatesLat: coffee.coordinates?.lat || null,
          coordinatesLng: coffee.coordinates?.lng || null,
          certifications: coffee.certifications || [],
          environmentalPractices: coffee.environmentalPractices || [],
          farm: coffee.farm || null,
          farmer: coffee.farmer || null,
          cuppingScore: coffee.cuppingScore || null,
          notes: coffee.notes || null,
          harvestDate: coffee.harvestDate || null,
          processingDate: coffee.processingDate || null,
          producerName: coffee.producerName || null,
          producerBio: coffee.producerBio || null,
          aroma: coffee.aroma || null,
          flavor: coffee.flavor || null,
          acidity: coffee.acidity || null,
          body: coffee.body || null,
          primaryNotes: coffee.primaryNotes || null,
          secondaryNotes: coffee.secondaryNotes || null,
          finish: coffee.finish || null,
          fermentationTime: coffee.fermentationTime || null,
          dryingTime: coffee.dryingTime || null,
          moistureContent: coffee.moistureContent || null,
          screenSize: coffee.screenSize || null,
          beanDensity: coffee.beanDensity || null,
          roastRecommendation: coffee.roastRecommendation || null,
          fairTradePremium: coffee.fairTradePremium || null,
          communityProjects: coffee.communityProjects || null,
          womenWorkerPercentage: coffee.womenWorkerPercentage || null,
          available: coffee.available !== false,
        },
      });
    }

    console.log(`✅ Seeded ${coffeesArray.length} coffees`);
    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Execute seed and handle cleanup
 */
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

