# Tier-Based Subscription System

## Overview

This document describes the implementation of a tier-based subscription system for the Coffee Break platform. The system provides different levels of access to **coffee engagement analytics** and **lead generation insights** based on subscription tiers.

**Business Model**: Sellers display coffee information and use QR codes to generate leads. The platform tracks engagement metrics (scans, views, clicks) and lead generation (contact clicks, order link clicks) to help sellers understand their coffee's performance and customer interest.

## Subscription Tiers

### Free Tier
- **Coffee Uploads**: 1 coffee total (not per month)
- **Analytics Access**: None
- **Export Formats**: None
- **Data Retention**: 0 months
- **Support Level**: Community
- **Price**: Free

### Basic Tier
- **Coffee Uploads**: 5 coffees total
- **Analytics Access**: Basic (coffees, engagement, leads)
- **Export Formats**: JSON only
- **Data Retention**: 3 months
- **Support Level**: Email
- **Price**: $30-50/month

### Premium Tier
- **Coffee Uploads**: 15 coffees total
- **Analytics Access**: Advanced (coffees, engagement, leads, geography, activity, performance)
- **Export Formats**: JSON, CSV
- **Data Retention**: 12 months
- **Support Level**: Priority
- **Price**: $80-120/month

### Enterprise Tier
- **Coffee Uploads**: Unlimited
- **Analytics Access**: Full suite (all metrics + KPIs + trends + insights)
- **Export Formats**: JSON, CSV, Excel, PDF
- **Data Retention**: Unlimited
- **Support Level**: Dedicated
- **Price**: $200-300/month

## Implementation Details

### 1. Subscription Middleware (`apps/web/src/app/api/shared/subscription-middleware.ts`)

The core middleware that handles:
- Tier configuration and limits
- Coffee upload validation
- Analytics access control
- Data filtering based on subscription level
- Export format validation

#### Key Functions:
- `validateCoffeeUpload()`: Checks if user can upload more coffees
- `getAnalyticsAccess()`: Determines analytics access level
- `filterAnalyticsData()`: Filters data based on tier permissions
- `validateExportFormat()`: Validates export format access

### 2. Coffee Upload Validation (`apps/web/src/app/api/coffee-entries/route.ts`)

Updated to include tier-based validation:
- Checks subscription status before allowing uploads
- Validates against coffee upload limits
- Returns helpful error messages with upgrade prompts

### 3. Analytics Endpoint (`apps/web/src/app/api/admin/analytics/route.ts`)

Enhanced with tier-based filtering:
- GET endpoint filters data based on subscription tier
- POST endpoint validates export formats per tier
- Returns tier information in responses
- Applies data retention limits

### 4. Tier-Based Analytics Component (`apps/web/src/components/TierBasedAnalytics.tsx`)

React component that:
- Displays analytics based on user's tier
- Shows upgrade prompts when limits are reached
- Displays coffee upload status
- Provides tier information and features

### 5. Test Page (`apps/web/src/app/test-tier-analytics/page.tsx`)

Demonstration page for testing:
- Switch between different subscription tiers
- Test analytics access restrictions
- View coffee upload limits
- Test API endpoints

## API Usage Examples

### Get Analytics (Tier-Based)
```bash
# Basic tier - limited analytics
GET /api/admin/analytics?tier=basic

# Premium tier - advanced analytics
GET /api/admin/analytics?tier=premium

# Enterprise tier - full analytics
GET /api/admin/analytics?tier=enterprise
```

### Export Analytics (Tier-Based)
```bash
POST /api/admin/analytics
{
  "format": "csv",
  "tier": "premium",
  "period": "monthly",
  "metrics": ["revenue", "users"]
}
```

### Upload Coffee (Tier-Based)
```bash
POST /api/coffee-entries
{
  "coffeeName": "Ethiopian Yirgacheffe",
  "roastedBy": "Premium Coffee Co.",
  "subscriptionTier": "basic"
}
```

## Data Filtering Logic

### Analytics Access by Tier:
- **Free**: No analytics access
- **Basic**: Core metrics (coffees, engagement, leads)
- **Premium**: Extended metrics + geographic + activity + performance data
- **Enterprise**: Full suite + KPIs + unlimited trends + insights

### Key Metrics by Category:

#### Coffee Metrics:
- **Total Coffees**: Number of coffee entries uploaded
- **Average Rating**: Average customer rating across all coffees
- **Total Reviews**: Number of customer reviews received
- **Coffee Views**: How many times coffee pages were viewed
- **Coffee Shares**: How many times coffees were shared

#### Engagement Metrics:
- **Unique Visitors**: Number of unique visitors to coffee pages
- **Page Views**: Total page views across all coffee pages
- **Avg Time on Page**: Average time visitors spend on coffee pages
- **Bounce Rate**: Percentage of visitors who leave after viewing one page
- **Total Saved Coffees**: Number of times coffees were saved by customers

#### Saved Coffee Analytics (Premium & Enterprise only):
- **Saved Coffees by Coffee**: Which specific coffees are saved most often
- **Saved Coffees by User**: User behavior patterns for saving coffees
- **Saved Coffee Trends**: Monthly trends in coffee saves

#### Lead Generation Metrics:
- **Total Leads**: Number of potential customers generated
- **Lead Conversion Rate**: Percentage of visitors who become leads
- **Contact Clicks**: Number of clicks on contact/order buttons
- **Order Link Clicks**: Number of clicks on order links
- **Website Visits**: Number of visits to seller's website

### Data Retention:
- **Free**: 0 months
- **Basic**: 3 months
- **Premium**: 12 months
- **Enterprise**: Unlimited

### Export Formats:
- **Free**: None
- **Basic**: JSON only
- **Premium**: JSON + CSV
- **Enterprise**: All formats (JSON, CSV, Excel, PDF)

## Upgrade Flow

The system includes built-in upgrade prompts:
- Shows when users reach coffee upload limits
- Displays when analytics are locked for their tier
- Provides clear upgrade paths to next tier
- Includes upgrade buttons that can trigger payment flows

## Testing

### Manual Testing:
1. Navigate to `/test-tier-analytics`
2. Select different subscription tiers
3. Observe analytics access changes
4. Test coffee upload limits
5. Verify export format restrictions

### API Testing:
1. Test analytics endpoint with different tier parameters
2. Verify data filtering works correctly
3. Test export format validation
4. Check coffee upload validation

## Production Considerations

### Authentication Integration:
- Replace `createMockUserContext()` with real user authentication
- Integrate with your user management system
- Add subscription status validation

### Database Integration:
- Replace mock analytics data with real database queries
- Implement proper user subscription tracking
- Add coffee count tracking per user

### Payment Integration:
- Connect upgrade buttons to payment processor
- Implement subscription management
- Add billing cycle handling

### Monitoring:
- Log tier-based access attempts
- Track upgrade conversion rates
- Monitor API usage by tier

## Security Notes

- All tier validation happens server-side
- Client-side tier selection is for demonstration only
- Production should validate user permissions on every request
- Implement rate limiting per tier if needed

## Future Enhancements

### Potential Additions:
- Usage-based tier upgrades
- Custom tier configurations
- Advanced analytics features
- White-label options for enterprise
- API rate limiting per tier
- Custom export templates

### Scalability:
- Cache tier configurations
- Implement analytics data aggregation
- Add real-time usage tracking
- Support for dynamic pricing

## Troubleshooting

### Common Issues:
1. **Analytics not loading**: Check subscription status and tier
2. **Export format errors**: Verify tier supports requested format
3. **Coffee upload denied**: Check upload limits and subscription status
4. **Data missing**: Verify tier has access to requested metrics

### Debug Steps:
1. Check user subscription status
2. Verify tier configuration
3. Test API endpoints directly
4. Review server logs for validation errors

## Support

For questions about the tier-based system implementation, refer to:
- Subscription middleware code
- API endpoint documentation
- Test page examples
- This README file

---

**Note**: This system is designed to be easily extensible. Adding new tiers or modifying existing ones requires only updating the `SUBSCRIPTION_TIERS` configuration in the middleware file.
