# 🎯 Complete Demo Credentials List - All Available Login Accounts

## 📋 **Overview**
The test tier dashboards page now includes **ALL available demo credentials** organized by user type and subscription tier. Each account has a unique ID and provides different access levels and features.

## 🔐 **Total Available Accounts: 10**

---

## 👑 **Admin Users (1 account)**

| Email | Password | Unique ID | Role | Access Level |
|-------|----------|-----------|------|--------------|
| `admin@coffeebreak.com` | `password` | `admin-001` | Admin | Full system access |

---

## ☕ **Seller Users (7 accounts across 4 tiers)**

### 🏢 **Free Tier (1 account)**
| Email | Password | Unique ID | Company | Features |
|-------|----------|-----------|---------|----------|
| `seller@coffeebreak.com` | `password` | `seller-001` | Free Tier Seller | Basic profile, no custom images |

### 📊 **Basic Tier (4 accounts)**
| Email | Password | Unique ID | Company | Features |
|-------|----------|-----------|---------|----------|
| `seller@premiumcoffee.com` | `password` | `seller-002` | Premium Coffee Co | Full customization, basic analytics |
| `seller@mountainview.com` | `password` | `seller-003` | Mountain View Roasters | Full customization, basic analytics |
| `liquidsoul@coffeebreak.com` | `password` | `seller-004` | Liquid Soul | Basic tier with unique branding |
| `basic@coffeebreak.com` | `password` | `seller-005` | Basic Coffee Co | Basic tier demo account |

### 📈 **Premium Tier (1 account)**
| Email | Password | Unique ID | Company | Features |
|-------|----------|-----------|---------|----------|
| `premium@coffeebreak.com` | `password` | `seller-006` | Premium Coffee Co | Advanced analytics, more uploads |

### 👑 **Enterprise Tier (1 account)**
| Email | Password | Unique ID | Company | Features |
|-------|----------|-----------|---------|----------|
| `enterprise@coffeebreak.com` | `password` | `seller-007` | Enterprise Coffee Co | Unlimited features, enterprise tools |

---

## 👤 **Customer Users (2 accounts)**

| Email | Password | Unique ID | Name | Access Level |
|-------|----------|-----------|------|--------------|
| `customer@example.com` | `password` | `customer-001` | Demo Customer | Regular customer access |
| `customer@coffeebreak.com` | `password` | `customer-002` | Coffee Lover | Regular customer access |

---

## 🧪 **How to Test All Accounts**

### **Step 1: Access the Test Page**
1. Go to `/test-tier-dashboards`
2. You'll see all available accounts organized by category

### **Step 2: Quick Login Section**
- **Organized by tier** with color-coded buttons
- **Click any button** to login as that user
- **Visual feedback** shows which user is currently logged in

### **Step 3: Test User Isolation**
1. **Login as any seller** (e.g., `seller@coffeebreak.com`)
2. **Notice the unique ID** in the "Currently Logged In" section
3. **Switch to another user** (e.g., `seller@premiumcoffee.com`)
4. **Verify the ID changes** and profile data updates
5. **Repeat for different tiers** to see feature differences

### **Step 4: Verify Data Isolation**
- Each user should see **different profile data**
- **Company names change** based on logged-in user
- **Subscription tier information** updates per user
- **No shared data** between users

---

## 🎯 **Testing Scenarios**

### **Scenario 1: Tier Feature Testing**
- **Free Tier**: Limited features, no image uploads
- **Basic Tier**: Full customization, basic analytics
- **Premium Tier**: Advanced analytics, more uploads
- **Enterprise Tier**: Unlimited features, full analytics

### **Scenario 2: User Role Testing**
- **Admin**: Full system access, can view all profiles
- **Seller**: Profile management, coffee uploads, analytics
- **Customer**: View coffees, basic access

### **Scenario 3: Data Isolation Testing**
- Login as different users
- Verify each sees only their own data
- Check that profile information changes
- Confirm unique IDs are displayed

---

## 🔍 **What to Look For**

### **✅ Success Indicators:**
- **Unique IDs change** when switching users
- **Profile data differs** between users
- **No shared information** between accounts
- **Proper role-based access** for each user type

### **❌ Problem Indicators:**
- Same data shown for different users
- Generic or duplicate IDs
- Shared profile information
- Confusion about whose data is displayed

---

## 🚀 **Benefits of This Setup**

1. **Comprehensive Testing**: All available credentials in one place
2. **Organized by Tier**: Easy to test different subscription levels
3. **Visual Feedback**: Clear indication of which user is logged in
4. **User Isolation**: Each account shows different data
5. **Realistic Demo**: Actual working authentication system

---

## 🎉 **Expected Results**

When you test these credentials, you should see:

- **10 different unique IDs** (admin-001, seller-001, seller-002, etc.)
- **Different profile data** for each user
- **Proper subscription tier features** based on user type
- **Complete user isolation** - no shared data
- **Realistic demo experience** with working authentication

---

## 🔧 **Technical Implementation**

- **Real Authentication**: Uses actual auth system, not mock data
- **Unique IDs**: Each user has a completely different identifier
- **API Integration**: Seller profile API requires user-specific parameters
- **Data Isolation**: Each user's profile stored separately
- **Security**: Proper user validation and access control

---

## 📝 **Quick Reference**

**Admin**: `admin@coffeebreak.com` / `password` → `admin-001`
**Free Seller**: `seller@coffeebreak.com` / `password` → `seller-001`
**Basic Sellers**: 4 accounts with IDs `seller-002` through `seller-005`
**Premium Seller**: `premium@coffeebreak.com` / `password` → `seller-006`
**Enterprise Seller**: `enterprise@coffeebreak.com` / `password` → `seller-007`
**Customers**: 2 accounts with IDs `customer-001` and `customer-002`

---

**🎯 Now you can test ALL available credentials from one organized interface! Each login will show completely different data, proving that user isolation and unique identification is working correctly.** 🚀
