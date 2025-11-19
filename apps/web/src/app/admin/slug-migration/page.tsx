'use client';

import React, { useState } from 'react';
import { Coffee, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MigrationResult {
  success: boolean;
  message: string;
  migrated?: number;
  errors?: string[];
  valid?: number;
  invalid?: number;
  details?: any[];
}

export default function SlugMigrationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [validationResult, setValidationResult] = useState<MigrationResult | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  const runValidation = async () => {
    try {
      setIsRunning(true);
      const response = await fetch('/api/admin/migrate-slugs');
      const result = await response.json();
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        success: false,
        message: 'Validation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runMigration = async () => {
    try {
      setIsRunning(true);
      const response = await fetch('/api/admin/migrate-slugs', { method: 'POST' });
      const result = await response.json();
      setMigrationResult(result);
      
      // Refresh validation after migration
      if (result.success) {
        setTimeout(runValidation, 1000);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: 'Migration failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin" 
              className="inline-flex items-center text-amber-600 hover:text-amber-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Admin
            </Link>
            <div className="flex items-center space-x-3">
              <Coffee className="h-8 w-8 text-amber-600" />
              <h1 className="text-3xl font-bold text-gray-900">Slug Migration</h1>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About Slug Migration</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              This tool migrates existing coffee entries from the old slug format to a new, 
              simplified format that's more user-friendly and SEO-optimized.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-2">New Slug Format:</h3>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>• <strong>Old:</strong> <code>christopher-salazar/cafe-santuario-monteverde-costa-rica-1755487690831</code></li>
                <li>• <strong>New:</strong> <code>cafe-santuario-monteverde-costa-rica-COFFEE-0831</code></li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Benefits:</strong> Shorter URLs, persistent IDs, better SEO, easier sharing
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Validation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Validate Current Slugs
            </h3>
            <p className="text-gray-600 mb-4">
              Check the current state of all coffee entry slugs to see what needs migration.
            </p>
            <button
              onClick={runValidation}
              disabled={isRunning}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Validation
                </>
              )}
            </button>
          </div>

          {/* Migration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <RefreshCw className="h-5 w-5 text-blue-600 mr-2" />
              Run Migration
            </h3>
            <p className="text-gray-600 mb-4">
              Migrate all coffee entries to the new slug format. This will update existing entries.
            </p>
            <button
              onClick={runMigration}
              disabled={isRunning}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Migration
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {validationResult && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Validation Results
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className="text-green-600 font-semibold">
                  Valid: {validationResult.valid || 0}
                </span>
                <span className="text-red-600 font-semibold">
                  Invalid: {validationResult.invalid || 0}
                </span>
              </div>
              {validationResult.details && validationResult.details.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Issues Found:</h4>
                  <div className="space-y-2">
                    {validationResult.details.map((detail, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <strong>{detail.name}</strong> (ID: {detail.id}): {detail.issues.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {migrationResult && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {migrationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              Migration Results
            </h3>
            <div className="space-y-3">
              <p className={`font-semibold ${migrationResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {migrationResult.message}
              </p>
              {migrationResult.migrated !== undefined && (
                <p className="text-gray-700">
                  Entries migrated: <strong>{migrationResult.migrated}</strong>
                </p>
              )}
              {migrationResult.errors && migrationResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                  <div className="space-y-1">
                    {migrationResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
