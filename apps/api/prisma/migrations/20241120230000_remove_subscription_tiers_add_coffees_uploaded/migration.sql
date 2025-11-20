-- Remove subscription tiers and add coffeesUploaded tracking
-- Migration: remove_subscription_tiers_add_coffees_uploaded

-- Remove subscriptionTier and subscriptionStatus from sellers table
ALTER TABLE "sellers" 
  DROP COLUMN IF EXISTS "subscriptionTier",
  DROP COLUMN IF EXISTS "subscriptionStatus";

-- Add coffeesUploaded column to sellers table
ALTER TABLE "sellers" 
  ADD COLUMN IF NOT EXISTS "coffeesUploaded" INTEGER NOT NULL DEFAULT 0;

-- Remove subscriptionTier from coffees table
ALTER TABLE "coffees" 
  DROP COLUMN IF EXISTS "subscriptionTier";

