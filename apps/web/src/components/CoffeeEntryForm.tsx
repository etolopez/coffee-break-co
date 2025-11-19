'use client';

import React, { useState } from 'react';
import { Coffee, X, Save, Loader2 } from 'lucide-react';

interface CoffeeEntryFormProps {
  sellerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CoffeeEntryFormData {
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
  farmSize: string;
  workerCount: string;
  certifications: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  producerName: string;
  producerBio: string;
  roastedBy: string;
  fermentationTime: string;
  dryingTime: string;
  moistureContent: string;
  screenSize: string;
  beanDensity: string;
  aroma: string;
  flavor: string;
  acidity: string;
  body: string;
  primaryNotes: string;
  secondaryNotes: string;
  finish: string;
  roastRecommendation: string;
  environmentalPractices: string[];
  fairTradePremium: string;
  communityProjects: string;
  womenWorkerPercentage: string;
  pricePerBag: string;
  description: string;
  farmPhotos: File | null;
  roastingCurveImage: File | null;
}

export default function CoffeeEntryForm({ sellerId, onSuccess, onCancel }: CoffeeEntryFormProps) {
  const [formData, setFormData] = useState<CoffeeEntryFormData>({
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
    producerName: '',
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
    environmentalPractices: [],
    fairTradePremium: '',
    communityProjects: '',
    womenWorkerPercentage: '',
    pricePerBag: '',
    description: '',
    farmPhotos: null,
    roastingCurveImage: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CoffeeEntryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: keyof CoffeeEntryFormData, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: arrayValue }));
  };

  const handleFileInputChange = (field: keyof CoffeeEntryFormData, files: FileList | null) => {
    if (files && files.length > 0) {
      if (field === 'farmPhotos') {
        // For farm photos, only take the first file
        setFormData(prev => ({ ...prev, [field]: files[0] }));
      } else {
        // For other file fields, keep existing logic
        const fileArray = Array.from(files).map(file => file);
        setFormData(prev => ({ ...prev, [field]: fileArray }));
      }
    } else {
      if (field === 'farmPhotos') {
        setFormData(prev => ({ ...prev, [field]: null }));
      } else {
        setFormData(prev => ({ ...prev, [field]: [] }));
      }
    }
  };

  const removeFile = (field: keyof CoffeeEntryFormData, index: number | null) => {
    if (field === 'farmPhotos') {
      setFormData(prev => ({
        ...prev,
        farmPhotos: null
      }));
    } else if (field === 'roastingCurveImage') {
      setFormData(prev => ({
        ...prev,
        roastingCurveImage: null
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'farmPhotos' && value instanceof File) {
          // Handle single farm photo
          formDataToSend.append('farmPhotos[0]', value);
        } else if (key === 'roastingCurveImage' && value instanceof File) {
          // Handle roasting curve image
          formDataToSend.append('roastingCurveImage', value);
        } else if (key === 'certifications' && Array.isArray(value)) {
          // Handle certifications array
          formDataToSend.append('certifications', JSON.stringify(value));
        } else if (key === 'environmentalPractices' && Array.isArray(value)) {
          // Handle environmental practices array
          formDataToSend.append('environmentalPractices', JSON.stringify(value));
        } else if (key === 'coordinates' && typeof value === 'object') {
          // Handle coordinates object
          formDataToSend.append('coordinates', JSON.stringify(value));
        } else if (value !== null && value !== undefined && value !== '') {
          // Handle regular text fields
          formDataToSend.append(key, String(value));
        }
      });

      // Add sellerId and subscription tier
      formDataToSend.append('sellerId', sellerId);
      formDataToSend.append('subscriptionTier', 'basic');

      const response = await fetch('/api/coffee-entries', {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header for FormData
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to create coffee entry');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Coffee entry creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coffee Name *
          </label>
          <input
            type="text"
            required
            value={formData.coffeeName}
            onChange={(e) => handleInputChange('coffeeName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Ethiopian Single Origin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roasted By *
          </label>
          <input
            type="text"
            required
            value={formData.roastedBy}
            onChange={(e) => handleInputChange('roastedBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Blue Mountain Coffee Co."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Ethiopia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Location
          </label>
          <input
            type="text"
            value={formData.specificLocation}
            onChange={(e) => handleInputChange('specificLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Yirgacheffe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origin
          </label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => handleInputChange('origin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Yirgacheffe, Ethiopia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farm
          </label>
          <input
            type="text"
            value={formData.farm}
            onChange={(e) => handleInputChange('farm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Konga Cooperative"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farmer
          </label>
          <input
            type="text"
            value={formData.farmer}
            onChange={(e) => handleInputChange('farmer', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Tadesse Meskela"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Altitude
          </label>
          <input
            type="text"
            value={formData.altitude}
            onChange={(e) => handleInputChange('altitude', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., 1950-2100m"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variety
          </label>
          <input
            type="text"
            value={formData.variety}
            onChange={(e) => handleInputChange('variety', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Heirloom Ethiopian"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Process
          </label>
          <input
            type="text"
            value={formData.process}
            onChange={(e) => handleInputChange('process', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Washed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harvest Date
          </label>
          <input
            type="date"
            value={formData.harvestDate}
            onChange={(e) => handleInputChange('harvestDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Date
          </label>
          <input
            type="date"
            value={formData.processingDate}
            onChange={(e) => handleInputChange('processingDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cupping Score
          </label>
          <input
            type="text"
            value={formData.cuppingScore}
            onChange={(e) => handleInputChange('cuppingScore', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., 87.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Per Bag
          </label>
          <input
            type="text"
            value={formData.pricePerBag}
            onChange={(e) => handleInputChange('pricePerBag', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., $24.99"
          />
        </div>
      </div>

      {/* Farm Details */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Size
            </label>
            <input
              type="text"
              value={formData.farmSize}
              onChange={(e) => handleInputChange('farmSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 12 hectares"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worker Count
            </label>
            <input
              type="text"
              value={formData.workerCount}
              onChange={(e) => handleInputChange('workerCount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 8 full-time, 20 seasonal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications (comma-separated)
            </label>
            <input
              type="text"
              value={formData.certifications.join(', ')}
              onChange={(e) => handleArrayInputChange('certifications', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Organic, Fair Trade, Direct Trade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producer Name
            </label>
            <input
              type="text"
              value={formData.producerName}
              onChange={(e) => handleInputChange('producerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Maria Elena Santos"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Producer Bio
          </label>
          <textarea
            value={formData.producerBio}
            onChange={(e) => handleInputChange('producerBio', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Brief description of the producer..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farm Photos
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileInputChange('farmPhotos', e.target.files)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select a farm photo (JPG, PNG, GIF)
          </p>
          {/* Display selected file */}
          {formData.farmPhotos && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Selected file:</p>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-sm text-gray-700">{formData.farmPhotos.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile('farmPhotos', null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roasting Curve Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileInputChange('roastingCurveImage', e.target.files)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select roasting curve chart or image (JPG, PNG, GIF)
          </p>
          {/* Display selected file */}
          {formData.roastingCurveImage && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Selected file:</p>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-sm text-gray-700">{formData.roastingCurveImage.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile('roastingCurveImage', null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing Details */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fermentation Time
            </label>
            <input
              type="text"
              value={formData.fermentationTime}
              onChange={(e) => handleInputChange('fermentationTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 42 hours"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drying Time
            </label>
            <input
              type="text"
              value={formData.dryingTime}
              onChange={(e) => handleInputChange('dryingTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 12 days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moisture Content
            </label>
            <input
              type="text"
              value={formData.moistureContent}
              onChange={(e) => handleInputChange('moistureContent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 11.2%"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screen Size
            </label>
            <input
              type="text"
              value={formData.screenSize}
              onChange={(e) => handleInputChange('screenSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 15-18"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bean Density
            </label>
            <input
              type="text"
              value={formData.beanDensity}
              onChange={(e) => handleInputChange('beanDensity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 1.35 g/cm³"
            />
          </div>
        </div>
      </div>

      {/* Quality Details */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aroma (1-10)
            </label>
            <input
              type="text"
              value={formData.aroma}
              onChange={(e) => handleInputChange('aroma', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 8.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flavor (1-10)
            </label>
            <input
              type="text"
              value={formData.flavor}
              onChange={(e) => handleInputChange('flavor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 9.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acidity (1-10)
            </label>
            <input
              type="text"
              value={formData.acidity}
              onChange={(e) => handleInputChange('acidity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 8.8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body (1-10)
            </label>
            <input
              type="text"
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 8.2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Notes
            </label>
            <input
              type="text"
              value={formData.primaryNotes}
              onChange={(e) => handleInputChange('primaryNotes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Bright citrus, floral jasmine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Notes
            </label>
            <input
              type="text"
              value={formData.secondaryNotes}
              onChange={(e) => handleInputChange('secondaryNotes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Dark chocolate, wine-like"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Finish
            </label>
            <input
              type="text"
              value={formData.finish}
              onChange={(e) => handleInputChange('finish', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Long, clean, tea-like"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roast Recommendation
            </label>
            <input
              type="text"
              value={formData.roastRecommendation}
              onChange={(e) => handleInputChange('roastRecommendation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Light to Medium"
            />
          </div>
        </div>
      </div>

      {/* Sustainability */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sustainability & Community</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environmental Practices (comma-separated)
            </label>
            <input
              type="text"
              value={formData.environmentalPractices.join(', ')}
              onChange={(e) => handleArrayInputChange('environmentalPractices', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Shade-grown, Water recycling, Organic composting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fair Trade Premium
            </label>
            <input
              type="text"
              value={formData.fairTradePremium}
              onChange={(e) => handleInputChange('fairTradePremium', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., $0.65/lb"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Projects
            </label>
            <input
              type="text"
              value={formData.communityProjects}
              onChange={(e) => handleInputChange('communityProjects', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., School funding, Healthcare clinic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Women Worker Percentage
            </label>
            <input
              type="text"
              value={formData.womenWorkerPercentage}
              onChange={(e) => handleInputChange('womenWorkerPercentage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 40%"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-t pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coffee Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Detailed description of the coffee, its characteristics, and what makes it special..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tasting Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Detailed tasting notes and flavor profile..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="border-t pt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Create Coffee Entry
            </>
          )}
        </button>
      </div>
    </form>
  );
}
