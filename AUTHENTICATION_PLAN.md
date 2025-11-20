# Authentication & User Features Implementation Plan

## Overview
The web app had authentication and user features that weren't ported to the mobile app. This document outlines the implementation plan.

## Features to Implement

### 1. Backend (NestJS API)

#### Database Models ✅
- [x] User model (email, password, role)
- [x] UserProfile model (bio, location, preferences)
- [x] UserFavorite model (liked coffees)

#### Authentication Module
- [ ] Auth module with JWT
- [ ] Login endpoint (`POST /api/auth/login`)
- [ ] Signup endpoint (`POST /api/auth/signup`)
- [ ] Password hashing (bcrypt)
- [ ] JWT token generation
- [ ] Auth guards for protected routes

#### User Profile Module
- [ ] Get user profile (`GET /api/users/profile`)
- [ ] Update user profile (`PUT /api/users/profile`)
- [ ] Get user favorites (`GET /api/users/favorites`)
- [ ] Add favorite (`POST /api/users/favorites`)
- [ ] Remove favorite (`DELETE /api/users/favorites/:coffeeId`)

#### Admin Module
- [ ] Admin guard (role-based access)
- [ ] Get all users (`GET /api/admin/users`)
- [ ] Get all sellers (`GET /api/admin/sellers`)
- [ ] Get all coffees (`GET /api/admin/coffees`)
- [ ] Admin dashboard stats

### 2. Mobile App (Expo)

#### Authentication Screens
- [ ] Login screen
- [ ] Signup screen (with role selection)
- [ ] Forgot password screen
- [ ] Auth context/state management

#### User Profile
- [ ] Profile screen
- [ ] Edit profile screen
- [ ] Settings screen

#### Favorites
- [ ] Favorites tab/screen
- [ ] Add to favorites button on coffee cards
- [ ] Remove from favorites

#### Admin
- [ ] Admin dashboard screen
- [ ] User management screen
- [ ] Coffee management screen
- [ ] Seller management screen

## Implementation Order

1. ✅ Database schema (User, UserProfile, UserFavorite)
2. ⏳ Backend authentication module
3. ⏳ Backend user profile endpoints
4. ⏳ Backend favorites endpoints
5. ⏳ Backend admin endpoints
6. ⏳ Mobile auth screens
7. ⏳ Mobile profile screens
8. ⏳ Mobile favorites functionality
9. ⏳ Mobile admin screens

## Next Steps

1. Create Prisma migration for new models
2. Create authentication module in NestJS
3. Create user module in NestJS
4. Create admin module in NestJS
5. Build mobile authentication UI
6. Build mobile profile UI
7. Build mobile favorites UI
8. Build mobile admin UI

