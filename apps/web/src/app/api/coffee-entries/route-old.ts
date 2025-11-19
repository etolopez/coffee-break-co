import { NextRequest, NextResponse } from 'next/server';
import { generateCoffeeSlug, generateQRCode } from '../shared/slug-utils';
import { 
  createErrorResponse, 
  createValidationError, 
  createNotFoundError, 
  createSuccessResponse,
  validateRequiredFields,
  logError 
} from '../shared/error-handler';
import { 
  validateCoffeeUpload, 
  createMockUserContext, 
  UserSubscriptionContext,
  CoffeeUploadValidation 
} from '../shared/subscription-middleware';
import { promises as fs } from 'fs';
import path from 'path';

// Coffee entries data file path
const COFFEE_ENTRIES_FILE = path.join(process.cwd(), 'data', 'coffee-entries-persistent.json');

// Function to read coffee entries from file
async function getCoffeeEntriesData(): Promise<any[]> {
  try {
    const data = await fs.readFile(COFFEE_ENTRIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.entries || [];
  } catch (error) {
    console.log('📝 No existing coffee entries file found, starting with empty array');
    return [];
  }
}

// Function to save coffee entries to file
async function saveCoffeeEntriesData(entries: any[]): Promise<void> {
  try {
    await fs.writeFile(COFFEE_ENTRIES_FILE, JSON.stringify({ entries }, null, 2), 'utf-8');
    console.log('📝 Coffee entries saved to persistent storage');
  } catch (error) {
    console.error('❌ Error saving coffee entries to file:', error);
    throw error;
  }
}

// In-memory storage for demo purposes (will be loaded from file)
let coffeeEntries: any[] = [
  {
    id: '1',
    coffeeName: 'Ethiopian Single Origin',
    origin: 'Yirgacheffe, Ethiopia',
    farm: 'Konga Cooperative',
    farmer: 'Tadesse Meskela',
    altitude: '1950-2100m',
    variety: 'Heirloom Ethiopian',
    process: 'Washed',
    harvestDate: '2024-11-15',
    processingDate: '2024-11-16',
    cuppingScore: '87.5',
    notes: 'Bright citrus, floral jasmine, dark chocolate finish',
    qrCode: 'PRE-ETH-YRG-2024-001',
    slug: 'ethiopian-yirgacheffe',
    farmSize: '12 hectares',
    workerCount: '8 full-time, 20 seasonal',
    certifications: ['Organic', 'Fair Trade'],
    coordinates: { lat: 6.1587, lng: 38.2016 },
    farmImage: undefined,
    farmerImage: undefined,
    // Producer/Roaster information
    producerName: 'Maria Elena Santos',
    producerPortrait: undefined,
    producerBio: 'Third-generation coffee farmer dedicated to sustainable practices and exceptional quality. Maria leads the Konga Cooperative with a focus on empowering women farmers and environmental conservation.',
    roastedBy: 'Blue Mountain Coffee Co.',
    fermentationTime: '42 hours',
    dryingTime: '12 days',
    moistureContent: '11.2%',
    screenSize: '15-18',
    beanDensity: '1.35 g/cm³',
    aroma: '8.5',
    flavor: '9.0',
    acidity: '8.8',
    body: '8.2',
    primaryNotes: 'Bright citrus, floral jasmine',
    secondaryNotes: 'Dark chocolate, wine-like',
    finish: 'Long, clean, tea-like',
    roastRecommendation: 'Light to Medium',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['Shade-grown under native trees', 'Water recycling in processing', 'Organic composting program', 'Biodiversity conservation'],
    fairTradePremium: '$0.65/lb',
    communityProjects: 'School funding',
    womenWorkerPercentage: '40%',
    // Client page settings
    available: true,
    sellerId: '1', // Belongs to Premium Coffee Co.
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    coffeeName: 'Colombian Reserve',
    origin: 'Huila, Colombia',
    farm: 'Finca La Esperanza',
    farmer: 'Maria Rodriguez',
    altitude: '1500-1900m',
    variety: 'Caturra',
    process: 'Natural',
    harvestDate: '2024-10-20',
    processingDate: '2024-10-22',
    cuppingScore: '86',
    notes: 'Berry, caramel, honey, medium body',
    qrCode: 'PRE-COL-HUI-2024-002',
    slug: 'colombian-reserve-huila',
    farmSize: '8 hectares',
    workerCount: '6 full-time, 15 seasonal',
    certifications: ['Organic', 'Rainforest Alliance'],
    coordinates: { lat: 1.8697, lng: -76.0275 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Carlos Rodriguez',
    producerPortrait: undefined,
    producerBio: 'Fourth-generation coffee farmer from Huila, specializing in natural processing methods that enhance fruit flavors.',
    roastedBy: 'Premium Coffee Co.',
    fermentationTime: '48 hours',
    dryingTime: '15 days',
    moistureContent: '11.5%',
    screenSize: '16-18',
    beanDensity: '1.32 g/cm³',
    aroma: '8.2',
    flavor: '8.7',
    acidity: '8.0',
    body: '8.5',
    primaryNotes: 'Berry, caramel sweetness',
    secondaryNotes: 'Honey, medium body',
    finish: 'Sweet, lingering',
    roastRecommendation: 'Medium',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['Natural processing', 'Solar drying', 'Composting', 'Bird habitat preservation'],
    fairTradePremium: '$0.70/lb',
    communityProjects: 'Healthcare clinic',
    womenWorkerPercentage: '35%',
    available: true,
    sellerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    coffeeName: 'High Altitude Blend',
    origin: 'Guatemala',
    farm: 'Antigua Estates',
    farmer: 'Roberto Morales',
    altitude: '1800-2200m',
    variety: 'Bourbon',
    process: 'Washed',
    harvestDate: '2024-09-15',
    processingDate: '2024-09-17',
    cuppingScore: '85',
    notes: 'Clean, bright, chocolate undertones',
    qrCode: 'MTN-GUA-ANT-2024-003',
    slug: 'high-altitude-blend-guatemala',
    farmSize: '15 hectares',
    workerCount: '12 full-time, 25 seasonal',
    certifications: ['Organic'],
    coordinates: { lat: 14.5610, lng: -90.7320 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Elena Morales',
    producerPortrait: undefined,
    producerBio: 'High-altitude specialist focusing on clean, bright profiles that showcase terroir.',
    roastedBy: 'Mountain View Roasters',
    fermentationTime: '36 hours',
    dryingTime: '10 days',
    moistureContent: '11.0%',
    screenSize: '15-17',
    beanDensity: '1.38 g/cm³',
    aroma: '8.0',
    flavor: '8.5',
    acidity: '8.7',
    body: '7.8',
    primaryNotes: 'Clean, bright acidity',
    secondaryNotes: 'Chocolate undertones',
    finish: 'Crisp, clean',
    roastRecommendation: 'Medium-Light',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['High-altitude cultivation', 'Water conservation', 'Organic fertilizers'],
    fairTradePremium: '$0.60/lb',
    communityProjects: 'Education programs',
    womenWorkerPercentage: '45%',
    available: true,
    sellerId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    coffeeName: 'Pacific Coast Single Origin',
    origin: 'Chiapas, Mexico',
    farm: 'Finca El Mar',
    farmer: 'Carlos Hernandez',
    altitude: '1400-1600m',
    variety: 'Typica',
    process: 'Washed',
    harvestDate: '2024-08-10',
    processingDate: '2024-08-12',
    cuppingScore: '87',
    notes: 'Citrus, sea salt, bright acidity',
    qrCode: 'COA-CHI-PAC-2024-004',
    slug: 'pacific-coast-chiapas',
    farmSize: '10 hectares',
    workerCount: '4 full-time, 8 seasonal',
    certifications: ['Ocean Positive', 'Organic'],
    coordinates: { lat: 15.0794, lng: -92.4426 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Ana Hernandez',
    producerPortrait: undefined,
    producerBio: 'Coastal coffee specialist committed to ocean conservation and unique mineral-forward profiles.',
    roastedBy: 'Coastal Coffee Collective',
    fermentationTime: '40 hours',
    dryingTime: '12 days',
    moistureContent: '10.8%',
    screenSize: '16-18',
    beanDensity: '1.34 g/cm³',
    aroma: '8.3',
    flavor: '8.8',
    acidity: '9.0',
    body: '7.5',
    primaryNotes: 'Citrus brightness',
    secondaryNotes: 'Mineral, sea salt',
    finish: 'Clean, lingering citrus',
    roastRecommendation: 'Light',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['Ocean conservation', 'Minimal water usage', 'Coastal ecosystem protection'],
    fairTradePremium: '$0.75/lb',
    communityProjects: 'Marine conservation',
    womenWorkerPercentage: '50%',
    available: true,
    sellerId: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    coffeeName: 'Heritage Blend',
    origin: 'Honduras',
    farm: 'Traditional Cooperative',
    farmer: 'Local Farmers',
    altitude: '1200-1800m',
    variety: 'Traditional Varieties',
    process: 'Traditional',
    harvestDate: '2024-07-05',
    processingDate: '2024-07-07',
    cuppingScore: '84',
    notes: 'Rich, full body, chocolate, nuts',
    qrCode: 'HER-HON-HER-2024-005',
    slug: 'heritage-blend-honduras',
    farmSize: '20 hectares',
    workerCount: '20 full-time, 40 seasonal',
    certifications: ['Fair Trade'],
    coordinates: { lat: 14.0723, lng: -87.1921 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Luis Martinez',
    producerPortrait: undefined,
    producerBio: 'Traditional methods specialist preserving heritage coffee farming techniques.',
    roastedBy: 'Heritage Bean Company',
    fermentationTime: '30 hours',
    dryingTime: '14 days',
    moistureContent: '11.8%',
    screenSize: '14-16',
    beanDensity: '1.30 g/cm³',
    aroma: '7.8',
    flavor: '8.2',
    acidity: '7.5',
    body: '8.8',
    primaryNotes: 'Rich chocolate',
    secondaryNotes: 'Nutty, full body',
    finish: 'Long, satisfying',
    roastRecommendation: 'Medium-Dark',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['Traditional farming', 'Community support', 'Heritage preservation'],
    fairTradePremium: '$0.55/lb',
    communityProjects: 'Traditional skills training',
    womenWorkerPercentage: '30%',
    available: true,
    sellerId: '4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    coffeeName: 'Urban Roast',
    origin: 'Brazil',
    farm: 'Fazenda Urbana',
    farmer: 'Paulo Silva',
    altitude: '1000-1500m',
    variety: 'Catuai',
    process: 'Semi-washed',
    harvestDate: '2024-06-20',
    processingDate: '2024-06-22',
    cuppingScore: '83',
    notes: 'Balanced, smooth, caramel sweetness',
    qrCode: 'URB-BRA-URB-2024-006',
    slug: 'urban-roast-brazil',
    farmSize: '8 hectares',
    workerCount: '8 full-time, 12 seasonal',
    certifications: ['Organic'],
    coordinates: { lat: -20.7596, lng: -42.8740 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Sandra Silva',
    producerPortrait: undefined,
    producerBio: 'Urban-focused producer creating approachable, balanced profiles for city coffee lovers.',
    roastedBy: 'Urban Harvest Coffee',
    fermentationTime: '24 hours',
    dryingTime: '8 days',
    moistureContent: '12.0%',
    screenSize: '15-16',
    beanDensity: '1.28 g/cm³',
    aroma: '7.5',
    flavor: '8.0',
    acidity: '7.8',
    body: '8.0',
    primaryNotes: 'Balanced sweetness',
    secondaryNotes: 'Smooth caramel',
    finish: 'Clean, approachable',
    roastRecommendation: 'Medium',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['Urban agriculture techniques', 'Efficient processing', 'Community gardens'],
    fairTradePremium: '$0.50/lb',
    communityProjects: 'Urban farming education',
    womenWorkerPercentage: '40%',
    available: true,
    sellerId: '5',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    coffeeName: 'Andean Peak',
    origin: 'Nariño, Colombia',
    farm: 'Finca Las Montañas',
    farmer: 'Pablo Guerrero',
    altitude: '2000-2200m',
    variety: 'Castillo',
    process: 'Washed',
    harvestDate: '2024-05-15',
    processingDate: '2024-05-17',
    cuppingScore: '88',
    notes: 'Floral, citrus, wine-like acidity',
    qrCode: 'COL-NAR-AND-2024-007',
    slug: 'andean-peak-narino',
    farmSize: '18 hectares',
    workerCount: '3 full-time, 6 seasonal',
    certifications: ['Rainforest Alliance', 'Organic'],
    coordinates: { lat: 1.1944, lng: -77.2781 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Isabella Guerrero',
    producerPortrait: undefined,
    producerBio: 'High-altitude specialist producing exceptional floral profiles from Nariño peaks.',
    roastedBy: 'Colombian Mountain Coffee',
    fermentationTime: '50 hours',
    dryingTime: '16 days',
    moistureContent: '10.5%',
    screenSize: '17-19',
    beanDensity: '1.42 g/cm³',
    aroma: '9.0',
    flavor: '9.2',
    acidity: '9.5',
    body: '8.0',
    primaryNotes: 'Floral, wine-like',
    secondaryNotes: 'Citrus brightness',
    finish: 'Complex, lingering',
    roastRecommendation: 'Light',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['Peak altitude cultivation', 'Cloud forest preservation', 'Minimal intervention'],
    fairTradePremium: '$0.80/lb',
    communityProjects: 'Mountain community support',
    womenWorkerPercentage: '55%',
    available: true,
    sellerId: '6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Additional coffees for Premium Coffee Co. (sellerId: '1') to test with more than 5 coffees
  {
    id: '8',
    coffeeName: 'Kenyan AA',
    origin: 'Nyeri, Kenya',
    farm: 'Thunguri Estate',
    farmer: 'James Kamau',
    altitude: '1600-2000m',
    variety: 'SL-28, SL-34',
    process: 'Washed',
    harvestDate: '2024-12-01',
    processingDate: '2024-12-03',
    cuppingScore: '89',
    notes: 'Bright acidity, black currant, tomato, complex body',
    qrCode: 'PRE-KEN-NYE-2024-008',
    slug: 'kenyan-aa-nyeri',
    farmSize: '14 hectares',
    workerCount: '15 full-time, 30 seasonal',
    certifications: ['Organic', 'Fair Trade'],
    coordinates: { lat: -0.4201, lng: 36.9476 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Grace Kamau',
    producerPortrait: undefined,
    producerBio: 'Fifth-generation coffee farmer specializing in high-altitude Kenyan AA grades with exceptional complexity.',
    roastedBy: 'Premium Coffee Co.',
    fermentationTime: '44 hours',
    dryingTime: '13 days',
    moistureContent: '10.9%',
    screenSize: '17-19',
    beanDensity: '1.40 g/cm³',
    aroma: '9.2',
    flavor: '9.4',
    acidity: '9.6',
    body: '8.8',
    primaryNotes: 'Black currant, tomato',
    secondaryNotes: 'Bright acidity, complex body',
    finish: 'Long, complex, wine-like',
    roastRecommendation: 'Medium-Light',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['High-altitude cultivation', 'Water conservation', 'Organic composting', 'Bird habitat'],
    fairTradePremium: '$0.85/lb',
    communityProjects: 'Education and healthcare',
    womenWorkerPercentage: '60%',
    available: true,
    sellerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '9',
    coffeeName: 'Panama Geisha',
    origin: 'Boquete, Panama',
    farm: 'Finca Esmeralda',
    farmer: 'Daniel Peterson',
    altitude: '1600-1800m',
    variety: 'Geisha',
    process: 'Honey',
    harvestDate: '2024-11-20',
    processingDate: '2024-11-22',
    cuppingScore: '92',
    notes: 'Jasmine, bergamot, white tea, incredibly clean',
    qrCode: 'PRE-PAN-BOQ-2024-009',
    slug: 'panama-geisha-boquete',
    farmSize: '6 hectares',
    workerCount: '10 full-time, 18 seasonal',
    certifications: ['Organic', 'Bird Friendly'],
    coordinates: { lat: 8.7833, lng: -82.4333 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Rachel Peterson',
    producerPortrait: undefined,
    producerBio: 'Geisha specialist producing some of the world\'s most sought-after coffee with exceptional clarity and complexity.',
    roastedBy: 'Premium Coffee Co.',
    fermentationTime: '52 hours',
    dryingTime: '18 days',
    moistureContent: '10.2%',
    screenSize: '18-20',
    beanDensity: '1.45 g/cm³',
    aroma: '9.8',
    flavor: '9.9',
    acidity: '9.7',
    body: '8.5',
    primaryNotes: 'Jasmine, bergamot',
    secondaryNotes: 'White tea, clean finish',
    finish: 'Incredibly clean, lingering',
    roastRecommendation: 'Light',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['Shade-grown under native trees', 'Bird habitat preservation', 'Minimal intervention', 'Natural processing'],
    fairTradePremium: '$1.20/lb',
    communityProjects: 'Environmental education',
    womenWorkerPercentage: '45%',
    available: true,
    sellerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '10',
    coffeeName: 'Brazilian Natural',
    origin: 'Minas Gerais, Brazil',
    farm: 'Fazenda São João',
    farmer: 'Antonio Silva',
    altitude: '1100-1400m',
    variety: 'Bourbon, Mundo Novo',
    process: 'Natural',
    harvestDate: '2024-10-15',
    processingDate: '2024-10-17',
    cuppingScore: '85',
    notes: 'Chocolate, nuts, low acidity, full body',
    qrCode: 'PRE-BRA-MIN-2024-010',
    slug: 'brazilian-natural-minas-gerais',
    farmSize: '25 hectares',
    workerCount: '25 full-time, 35 seasonal',
    certifications: ['Organic', 'Rainforest Alliance'],
    coordinates: { lat: -20.1433, lng: -44.8900 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Maria Silva',
    producerPortrait: undefined,
    producerBio: 'Traditional Brazilian coffee farmer specializing in natural processing methods that enhance body and chocolate notes.',
    roastedBy: 'Premium Coffee Co.',
    fermentationTime: '36 hours',
    dryingTime: '20 days',
    moistureContent: '11.5%',
    screenSize: '15-17',
    beanDensity: '1.32 g/cm³',
    aroma: '8.0',
    flavor: '8.5',
    acidity: '7.0',
    body: '9.0',
    primaryNotes: 'Chocolate, nuts',
    secondaryNotes: 'Low acidity, full body',
    finish: 'Smooth, satisfying',
    roastRecommendation: 'Medium-Dark',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['Natural processing', 'Solar drying', 'Organic farming', 'Water conservation'],
    fairTradePremium: '$0.60/lb',
    communityProjects: 'Sustainable farming education',
    womenWorkerPercentage: '35%',
    available: true,
    sellerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '11',
    coffeeName: 'Costa Rican Tarrazú',
    origin: 'Tarrazú, Costa Rica',
    farm: 'Finca La Candelaria',
    farmer: 'Roberto Vargas',
    altitude: '1500-1900m',
    variety: 'Caturra, Catuai',
    process: 'Washed',
    harvestDate: '2024-09-10',
    processingDate: '2024-09-12',
    cuppingScore: '86',
    notes: 'Bright, clean, citrus, honey sweetness',
    qrCode: 'PRE-COS-TAR-2024-011',
    slug: 'costa-rican-tarrazu',
    farmSize: '12 hectares',
    workerCount: '12 full-time, 22 seasonal',
    certifications: ['Organic', 'Fair Trade'],
    coordinates: { lat: 9.9281, lng: -84.0907 },
    farmImage: undefined,
    farmerImage: undefined,
    producerName: 'Ana Vargas',
    producerPortrait: undefined,
    producerBio: 'High-altitude specialist producing clean, bright profiles that showcase the unique terroir of Tarrazú.',
    roastedBy: 'Premium Coffee Co.',
    fermentationTime: '38 hours',
    dryingTime: '11 days',
    moistureContent: '11.1%',
    screenSize: '16-18',
    beanDensity: '1.36 g/cm³',
    aroma: '8.3',
    flavor: '8.6',
    acidity: '8.8',
    body: '8.0',
    primaryNotes: 'Bright citrus',
    secondaryNotes: 'Honey sweetness',
    finish: 'Clean, lingering',
    roastRecommendation: 'Medium',
    roastDevelopmentCurve: undefined,
    environmentalPractices: ['High-altitude cultivation', 'Water conservation', 'Organic fertilizers', 'Biodiversity protection'],
    fairTradePremium: '$0.70/lb',
    communityProjects: 'Environmental conservation',
    womenWorkerPercentage: '50%',
    available: true,
    sellerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    console.log('GET request - Total entries in memory:', coffeeEntries.length); // Debug log
    
    // Get seller ID from query parameters
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    
    // Validate data integrity
    if (!Array.isArray(coffeeEntries)) {
      logError('Data Integrity Error', new Error('Coffee entries is not an array'), { 
        type: typeof coffeeEntries,
        value: coffeeEntries 
      });
      return createErrorResponse('Data integrity error', 500);
    }
    
    // Filter entries by seller ID if provided
    let filteredEntries = coffeeEntries;
    if (sellerId) {
      filteredEntries = coffeeEntries.filter(entry => entry.sellerId === sellerId);
      console.log(`Filtered entries for seller ${sellerId}:`, filteredEntries.length);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredEntries,
      count: filteredEntries.length,
      totalCount: coffeeEntries.length,
      sellerId: sellerId || 'all',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('GET Error', error);
    return createErrorResponse('Failed to fetch coffee entries', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request
    if (!request.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const body = await request.json();
    console.log('Received coffee entry data:', body); // Debug log
    
    // Validate required fields
    if (!body.coffeeName || !body.roastedBy) {
      return createErrorResponse('Coffee name and roasted by are required fields', 400, { 
        received: Object.keys(body),
        required: ['coffeeName', 'roastedBy']
      });
    }

    // TODO: In production, get user context from authentication system
    // For now, we'll use a mock user context - replace with real user data
    const userContext: UserSubscriptionContext = createMockUserContext(body.subscriptionTier || 'basic');
    
    // Validate coffee upload limits based on subscription tier
    const uploadValidation: CoffeeUploadValidation = validateCoffeeUpload(userContext);
    
    if (!uploadValidation.canUpload) {
      return createErrorResponse(
        `Coffee upload limit reached for ${uploadValidation.tier} tier`, 
        403, 
        {
          currentCount: uploadValidation.currentCount,
          limit: uploadValidation.limit,
          tier: uploadValidation.tier,
          upgradeMessage: `Upgrade to a higher tier to upload more coffees. Current limit: ${uploadValidation.limit}`
        }
      );
    }
    
    // Generate unique ID and timestamp
    const uniqueId = Date.now().toString();
    const harvestYear = new Date().getFullYear().toString();
    
    // Generate QR code using the new utility function
    const qrCode = generateQRCode(uniqueId);
    
    // Generate unique slug for the coffee entry
    const slug = generateCoffeeSlug(
      body.coffeeName || 'Coffee',
      uniqueId
    );
    
    const newEntry = {
      ...body,
      id: uniqueId,
      qrCode,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    coffeeEntries.unshift(newEntry);
    console.log('Coffee entry saved. Total entries:', coffeeEntries.length); // Debug log
    console.log('Generated slug:', slug); // Debug log
    console.log('Generated QR code:', qrCode); // Debug log
    console.log('All entries:', coffeeEntries.map(e => ({ id: e.id, name: e.coffeeName, slug: e.slug }))); // Debug log

    return createSuccessResponse({
      data: newEntry,
      message: 'Coffee entry created successfully'
    });
  } catch (error) {
    logError('POST Error', error, { requestUrl: request.url });
    return createErrorResponse('Failed to create coffee entry', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate request
    if (!request.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const body = await request.json();
    console.log('Received coffee entry update data:', body); // Debug log
    
    // Validate required fields
    if (!body.id) {
      return createErrorResponse('Entry ID is required for updates', 400, {
        received: Object.keys(body),
        required: ['id']
      });
    }
    
    const entryIndex = coffeeEntries.findIndex(entry => entry.id === body.id);
    
    if (entryIndex === -1) {
      return createErrorResponse('Coffee entry not found', 404, { 
        requestedId: body.id,
        availableIds: coffeeEntries.map(e => e.id)
      });
    }

    // Update the entry while preserving the original ID and creation date
    const updatedEntry = {
      ...coffeeEntries[entryIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    coffeeEntries[entryIndex] = updatedEntry;
    console.log('Coffee entry updated. Entry ID:', body.id); // Debug log

    return createSuccessResponse({
      data: updatedEntry,
      message: 'Coffee entry updated successfully'
    });
  } catch (error) {
    logError('PUT Error', error, { requestUrl: request.url });
    return createErrorResponse('Failed to update coffee entry', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createErrorResponse('Entry ID is required', 400, {
        receivedParams: Array.from(searchParams.entries()),
        required: ['id']
      });
    }

    const entryIndex = coffeeEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
      return createErrorResponse('Coffee entry not found', 404, {
        requestedId: id,
        availableIds: coffeeEntries.map(e => e.id)
      });
    }

    const deletedEntry = coffeeEntries.splice(entryIndex, 1)[0];
    console.log('Coffee entry deleted. Entry ID:', id); // Debug log

    return createSuccessResponse({
      data: deletedEntry,
      message: 'Coffee entry deleted successfully'
    });
  } catch (error) {
    logError('DELETE Error', error, { requestUrl: request.url });
    return createErrorResponse('Failed to delete coffee entry', 500);
  }
}
