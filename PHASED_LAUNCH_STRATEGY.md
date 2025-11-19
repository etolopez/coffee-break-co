# Phased Launch Strategy: Free Tier First

## 🚀 **Launch Strategy Overview**

**Phase 1 (Months 1-3)**: Free Tier Only
**Phase 2 (Months 4-6)**: Introduce Basic Tier  
**Phase 3 (Months 7-9)**: Introduce Premium Tier
**Phase 4 (Months 10+):** Introduce Enterprise Tier

---

## 📊 **Phase 1: Foundation Launch (Months 1-3)**

### **Available Tiers:**
- ✅ **Free Tier**: 1 coffee total, basic features
- ❌ **Basic Tier**: Hidden/disabled
- ❌ **Premium Tier**: Hidden/disabled
- ❌ **Enterprise Tier**: Hidden/disabled

### **Goals:**
- Build initial user base with free offering
- Collect coffee data organically
- Validate core functionality
- Establish user engagement patterns
- Keep costs minimal

### **Expected Outcomes:**
- **Users**: 100-500 sellers
- **Coffees**: 100-500 entries
- **Monthly Costs**: $10-30
- **Data Points**: 1,000-5,000/month

---

## 🔧 **Implementation for Phase 1**

### **1. Modify Subscription Middleware**
```typescript:apps/web/src/app/api/shared/subscription-middleware.ts
// ... existing code ...

// PHASE 1: Only Free tier available
export const AVAILABLE_TIERS = ['free'] as const;
export type AvailableTier = typeof AVAILABLE_TIERS[number];

// Temporarily disable basic, premium and enterprise features
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    coffeeUploads: 1,
    analyticsAccess: 'none',
    exportFormats: [],
    dataRetention: 0,
    supportLevel: 'community',
    price: 0,
    available: true // ✅ Available in Phase 1
  },
  basic: {
    name: 'Basic',
    coffeeUploads: 5,
    analyticsAccess: 'basic',
    exportFormats: ['json'],
    dataRetention: 3,
    supportLevel: 'email',
    price: 30,
    available: false // ❌ Hidden in Phase 1
  },
  premium: {
    name: 'Premium',
    coffeeUploads: 15,
    analyticsAccess: 'advanced',
    exportFormats: ['json', 'csv'],
    dataRetention: 12,
    supportLevel: 'priority',
    price: 80,
    available: false // ❌ Hidden in Phase 1
  },
  enterprise: {
    name: 'Enterprise',
    coffeeUploads: -1, // unlimited
    analyticsAccess: 'full',
    exportFormats: ['json', 'csv', 'excel', 'pdf'],
    dataRetention: -1, // unlimited
    supportLevel: 'dedicated',
    price: 200,
    available: false // ❌ Hidden in Phase 1
  }
} as const;

// Add phase detection
export const getCurrentPhase = (): number => {
  const now = new Date();
  const launchDate = new Date('2024-01-01'); // Set your actual launch date
  const monthsSinceLaunch = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (monthsSinceLaunch < 3) return 1;
  if (monthsSinceLaunch < 6) return 2;
  if (monthsSinceLaunch < 9) return 3;
  return 4;
};

// Validate tier availability based on current phase
export const isTierAvailable = (tier: string): boolean => {
  const currentPhase = getCurrentPhase();
  
  switch (currentPhase) {
    case 1: return tier === 'free';
    case 2: return ['free', 'basic'].includes(tier);
    case 3: return ['free', 'basic', 'premium'].includes(tier);
    default: return true;
  }
};

// ... existing code ...
```

### **2. Update Tier-Based Analytics Component**
```typescript:apps/web/src/components/TierBasedAnalytics.tsx
// ... existing code ...

// Tier configurations with phase-based availability
const tierConfig = {
  free: {
    name: 'Free',
    color: 'gray',
    coffeeLimit: 1, // Limited to 1 coffee for free tier
    analyticsAccess: 'none', // No analytics access for free tier
    features: ['1 coffee upload', 'Basic profile', 'Community support', 'QR code generation'],
    price: 'Free',
    available: true, // Free tier is always available
    comingSoon: false
  },
  basic: {
    name: 'Basic',
    color: 'blue',
    coffeeLimit: 5,
    analyticsAccess: 'basic',
    features: ['5 coffee uploads', 'Basic analytics', 'Email support', 'JSON export'],
    price: '$30/month',
    available: false, // Coming in Phase 2
    comingSoon: true
  },
  premium: {
    name: 'Premium',
    color: 'purple',
    coffeeLimit: 15,
    analyticsAccess: 'advanced',
    features: ['15 coffee uploads', 'Advanced analytics', 'Priority support', 'CSV export'],
    price: '$80/month',
    available: false, // Coming in Phase 3
    comingSoon: true
  },
  enterprise: {
    name: 'Enterprise',
    color: 'amber',
    coffeeLimit: -1, // Unlimited for enterprise tier
    analyticsAccess: 'full',
    features: ['Unlimited uploads', 'Full analytics suite', 'Dedicated support', 'All export formats'],
    price: 'Contact Us',
    available: false, // Coming in Phase 4
    comingSoon: true
  }
};

// ... existing code ...
```

---

## 📈 **Phase 2: Basic Tier Introduction (Months 4-6)**

### **New Available Tiers:**
- ✅ **Free Tier**: 1 coffee total, basic features
- ✅ **Basic Tier**: 5 coffees total, basic analytics
- ❌ **Premium Tier**: Hidden/disabled
- ❌ **Enterprise Tier**: Hidden/disabled

### **Goals:**
- Introduce paid tier with enhanced features
- Upsell Free users to Basic
- Expand data collection capabilities
- Increase monthly revenue

### **Expected Outcomes:**
- **Users**: 500-1,500 sellers
- **Coffees**: 1,000-5,000 entries
- **Monthly Costs**: $30-100
- **Data Points**: 25,000-100,000/month

### **Implementation:**
```typescript:apps/web/src/app/api/shared/subscription-middleware.ts
// ... existing code ...

// Phase 2: Enable Basic tier
export const SUBSCRIPTION_TIERS = {
  // ... existing free tier ...
  basic: {
    name: 'Basic',
    coffeeUploads: 5,
    analyticsAccess: 'basic',
    exportFormats: ['json'],
    dataRetention: 3,
    supportLevel: 'email',
    price: 30,
    available: true // ✅ Now available in Phase 2
  },
  premium: {
    // ... still hidden ...
    available: false
  },
  enterprise: {
    // ... still hidden ...
    available: false
  }
};

// Update available tiers
export const AVAILABLE_TIERS = ['free', 'basic'] as const;
```

---

## 🏢 **Phase 3: Premium Tier Introduction (Months 7-9)**

### **New Available Tiers:**
- ✅ **Free Tier**: 1 coffee total, basic features
- ✅ **Basic Tier**: 5 coffees total, basic analytics
- ✅ **Premium Tier**: 15 coffees total, advanced analytics
- ❌ **Enterprise Tier**: Hidden/disabled

### **Goals:**
- Introduce advanced analytics features
- Upsell Basic users to Premium
- Expand data collection capabilities
- Increase monthly revenue

### **Expected Outcomes:**
- **Users**: 1,500-3,000 sellers
- **Coffees**: 5,000-15,000 entries
- **Monthly Costs**: $100-300
- **Data Points**: 100,000-500,000/month

---

## 🎯 **Phase 4: Enterprise Tier Introduction (Months 10+)**

### **All Tiers Available:**
- ✅ **Free Tier**: 1 coffee total, basic features
- ✅ **Basic Tier**: 5 coffees total, basic analytics
- ✅ **Premium Tier**: 15 coffees total, advanced analytics
- ✅ **Enterprise Tier**: Unlimited coffees, full analytics suite

### **Goals:**
- Target larger coffee businesses
- Introduce unlimited features
- Maximize revenue potential
- Establish market leadership

---

## 📋 **Implementation Checklist**

### **Phase 1 Setup (Do This First):**
- [ ] Modify subscription middleware to hide Basic/Premium/Enterprise
- [ ] Update analytics component to show phase information
- [ ] Add phase validation to API endpoints
- [ ] Update UI to only show available tiers
- [ ] Set up basic cost monitoring
- [ ] Launch with Free only

### **Phase 2 Preparation (Month 3):**
- [ ] Build Basic tier features
- [ ] Create upgrade flow from Free to Basic
- [ ] Prepare marketing materials for Basic launch
- [ ] Set up basic analytics infrastructure
- [ ] Test Basic features internally

### **Phase 3 Preparation (Month 6):**
- [ ] Build Premium tier features
- [ ] Create upgrade flow from Basic to Premium
- [ ] Prepare marketing materials for Premium launch
- [ ] Set up advanced analytics infrastructure
- [ ] Test Premium features internally

### **Phase 4 Preparation (Month 9):**
- [ ] Build Enterprise tier features
- [ ] Create enterprise sales process
- [ ] Prepare enterprise marketing materials
- [ ] Set up enterprise support infrastructure
- [ ] Test enterprise features internally

---

## 💰 **Cost Management During Phases**

### **Phase 1 Costs:**
- **Database**: $5-15/month (minimal data)
- **API**: $5-10/month (basic usage)
- **Analytics**: $0-10/month (no analytics)
- **Total**: $10-30/month

### **Phase 2 Costs:**
- **Database**: $15-40/month (moderate data)
- **API**: $10-25/month (increased usage)
- **Analytics**: $10-25/month (basic processing)
- **Total**: $30-100/month

### **Phase 3 Costs:**
- **Database**: $40-120/month (significant data)
- **API**: $25-60/month (high usage)
- **Analytics**: $25-60/month (advanced processing)
- **Total**: $100-300/month

### **Phase 4 Costs:**
- **Database**: $120-400/month (large data)
- **API**: $60-150/month (very high usage)
- **Analytics**: $60-150/month (complex processing)
- **Total**: $300-700/month

---

## 🚀 **Launch Timeline**

### **Week 1-2: Phase 1 Setup**
- Implement tier restrictions
- Test with internal team
- Prepare launch materials

### **Week 3-4: Soft Launch**
- Launch to small group of beta users
- Collect feedback and fix issues
- Monitor costs and performance

### **Month 2-3: Phase 1 Growth**
- Expand user base organically
- Gather usage data and feedback
- Prepare Phase 2 features

### **Month 4: Phase 2 Launch**
- Introduce Basic tier
- Market to existing Free users
- Monitor upgrade conversions

### **Month 7: Phase 3 Launch**
- Introduce Premium tier
- Market to existing Basic users
- Monitor upgrade conversions

### **Month 10: Phase 4 Launch**
- Introduce Enterprise tier
- Target larger businesses
- Maximize revenue potential

---

## 🔒 **Email Validation & Profile Creation**

### **Prevent Duplicate Profiles:**
- No same seller can create more profiles with the same email
- No customers can create more profiles with the same email
- Implement email uniqueness validation in all signup flows
- Add validation in admin user/seller creation

### **Implementation:**
```typescript
// In signup and admin creation endpoints
const existingUser = await findUserByEmail(email);
if (existingUser) {
  return NextResponse.json(
    { success: false, error: 'User with this email already exists' },
    { status: 409 }
  );
}
```

---

## 🎨 **UI/UX Updates**

### **Disable Unavailable Tiers:**
- No hover effects for tiers not active in current phase
- No clickable buttons for unavailable tiers
- Show "Coming Soon" badges
- Use disabled styling (grayed out, reduced opacity)
- Remove interactive elements for unavailable tiers

### **Implementation:**
```typescript
// In subscription page and analytics components
{tier.comingSoon ? (
  <div className="opacity-60 cursor-not-allowed">
    <span className="bg-gray-500 text-white px-2 py-1 rounded-full">
      Coming Soon
    </span>
  </div>
) : (
  <button className="hover:shadow-lg hover:-translate-y-1">
    Upgrade to {tier.name}
  </button>
)}
```

---

**Remember**: Start with the Free tier only to validate your product-market fit before introducing paid tiers. Monitor costs weekly and adjust strategies based on actual usage patterns.
