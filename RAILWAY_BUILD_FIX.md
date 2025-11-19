# 🔧 Railway Build Fix - Railpack Error

## Problem
Railway was trying to use Railpack (buildpack system) instead of Dockerfile, causing build failures.

## Solution Applied

1. **Added root `railway.toml`** - Railway looks for this at the repo root
2. **Removed conflicting `railway.json`** - Was set to NIXPACKS
3. **Updated Dockerfile CMD** - Fixed path to work from repo root
4. **Specified dockerfilePath** - Points to `apps/api/Dockerfile`

## Railway Dashboard Settings

**Important**: In Railway dashboard, make sure:

1. **Root Directory**: Leave empty (builds from repo root) OR set to `/`
2. **Build Command**: Should be auto-detected from Dockerfile
3. **Start Command**: `node apps/api/dist/main.js`

## If Build Still Fails

If Railway still tries to use Railpack:

1. **Go to Service Settings** in Railway dashboard
2. **Under "Build" section**, manually select "Dockerfile"
3. **Set Dockerfile path**: `apps/api/Dockerfile`
4. **Save and redeploy**

## Alternative: Move Dockerfile to Root

If Railway still has issues, we can move the Dockerfile to the repo root:

```bash
mv apps/api/Dockerfile ./Dockerfile
```

Then update `railway.toml`:
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"
```

## Current Configuration

- ✅ Root `railway.toml` specifies Dockerfile builder
- ✅ Dockerfile at `apps/api/Dockerfile`
- ✅ Dockerfile handles monorepo structure
- ✅ CMD path updated to work from repo root

The changes have been pushed to GitHub. Railway should auto-detect and use Dockerfile now.
