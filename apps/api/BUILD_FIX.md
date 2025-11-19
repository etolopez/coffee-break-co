# 🔧 Railway Build Fix

## Problem
Railway was trying to use Nixpacks with incorrect package syntax (`nodejs-20_x`).

## Solution
Switched to Dockerfile build which is more reliable for monorepo setups.

## Changes Made

1. **Created `Dockerfile`** - Handles monorepo structure properly
2. **Updated `railway.toml`** - Changed builder to `DOCKERFILE`
3. **Removed `nixpacks.toml`** - No longer needed

## Railway Configuration

Make sure in Railway dashboard:
- **Root Directory**: Set to `apps/api` (if deploying from repo root)
- **OR** Deploy from `apps/api` directory directly

## Dockerfile Structure

The Dockerfile:
1. Builds the shared package first (`packages/shared`)
2. Installs API dependencies
3. Builds the API
4. Starts with `npm run start:prod`

## Next Steps

1. **Commit and push** these changes
2. **Redeploy** on Railway (it should auto-deploy)
3. **Check build logs** if there are any issues

## If Build Still Fails

If Railway is building from repo root but Dockerfile expects `apps/api` context:

**Option 1**: Set Root Directory in Railway to `apps/api`

**Option 2**: Update Dockerfile to work from repo root:
- Change all paths to include `apps/api/` prefix
- Copy from repo root context

The current Dockerfile assumes Railway will set root directory to `apps/api` or build from that directory.
