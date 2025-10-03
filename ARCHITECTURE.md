# MyDresser Application Architecture

## Overview
MyDresser is a comprehensive fashion management platform with dual interfaces: a consumer app for wardrobe management and a merchant terminal for retail operations.

## 🎯 Recent Enhancements (Phase 31)

### International Expansion
- **Multi-Language**: 10 languages with real-time switching and persistent preferences
- **Currency Converter**: Real-time conversion for 10 major currencies with quick shortcuts
- **Regional Preferences**: Temperature, date, time formats, and measurement systems
- **International Shipping**: Calculator with cost estimates, delivery times, and multiple options

### Community Features (Phase 30)
- **Style Challenges**: Compete in fashion challenges with prizes, submissions, and leaderboards
- **Fashion Events**: Discover and join virtual/physical fashion events, workshops, and meetups
- **Influencer Program**: Four-tier program with commissions (5-20%), benefits, and analytics
- **Community Hub**: Unified page with tabbed navigation for all community features

### Brand Partnerships & Integrations (Phase 29)
- **Partnership Portal**: Manage suppliers, brands, and distributors with commission tracking
- **Bulk Ordering**: Create large-scale orders with SKU-based tracking
- **Partnership Analytics**: Revenue, commission, and performance metrics
- **Terminal Integration**: Logout button and partnerships navigation

### Multi-Store Management (Phase 28)
- **Store Network Dashboard**: Manage multiple locations (flagship, franchise, outlet)
- **Centralized Inventory**: Cross-location stock visibility and alerts
- **Performance Metrics**: Revenue, inventory, and customer tracking per location
- **Franchise Support**: Multi-location management with role-based access

### Third-Party Integrations & Developer API (Phase 27)
- **Integration Marketplace**: Connect with Shopify, Instagram, Pinterest, Google Calendar
- **Developer API**: Full API access with key management and documentation
- **API Keys**: Secure generation, storage, and permission management
- **Mobile Fixes**: Improved button positioning for mobile browser compatibility

### PWA & Offline Capabilities (Phase 25)
- **PWA Manifest**: Complete manifest with icons, shortcuts, and share target
- **Service Worker**: Offline caching, background sync, and push notifications
- **PWA Components**: Install prompt, offline indicator, settings panel
- **usePWA Hook**: Comprehensive PWA state and functionality management
- **iOS Support**: Full iOS PWA compatibility with meta tags

### Phase 24: Enhanced Search & Discovery
- **EnhancedSearchDiscovery Component**: Multi-tab search interface
- **DiscoveryPage**: Dedicated search and discovery features
- **Quick Filters**: Price, condition, location filters

### Phase 23: AI Camera Scanning
- **CameraScanner Component**: Live camera capture with AI analysis
- **Vision AI Integration**: Gemini 2.5 Flash for clothing item recognition
- **Smart Form Pre-filling**: Automatic detection and form population
- **Edge Function**: ai-clothing-scanner for backend processing

## Application Structure

### Main Entry Point
- **main.tsx**: Root router that splits between MyDresser App and Terminal App based on route (`/terminal/*`)

### Core Applications

#### 1. MyDresser App (Consumer)
- **Purpose**: Personal wardrobe management, style recommendations, marketplace
- **Key Features**:
  - Wardrobe management with AI categorization
  - Daily outfit suggestions with weather integration
  - AI style assistant and recommendations
  - Social features (feed, followers, sharing)
  - 2ndDresser marketplace (buy/sell pre-owned)
  - Analytics dashboard

#### 2. Terminal App (Merchant)
- **Purpose**: Point-of-sale and business management
- **Key Features**:
  - POS terminal for in-store sales
  - Inventory management
  - Merchant analytics
  - Customer relations
  - Financial reports

## Architecture Patterns

### Shared Providers (`AppProviders`)
Centralized provider component containing:
- QueryClient (React Query)
- TooltipProvider
- Toaster notifications
- Security headers

### Component Organization
```
src/
├── components/
│   ├── providers/        # Shared providers
│   ├── shared/          # Reusable components (LoadingSpinner, etc.)
│   ├── settings/        # Settings panels
│   └── ui/              # shadcn/ui components + custom animated components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── services/            # Business logic & API calls
├── ai/                  # AI engines (OutfitAI, ColorHarmony, StyleAnalyzer)
└── integrations/        # External service integrations (Supabase)
```

### State Management
- **React Query**: Server state caching and synchronization
- **React Hooks**: Component-level state
- **Supabase RLS**: Data access control at database level

### Authentication & Authorization
- **Supabase Auth**: User authentication
- **Role-based Access**: `user`, `merchant`, `admin` roles
- **Row Level Security**: Database-level access control

## AI Integration

### Services
1. **myDresserAI**: Core AI functionality using Lovable AI Gateway (Gemini 2.5 Flash)
2. **OutfitAI**: Outfit matching algorithm
3. **ColorHarmonyEngine**: Color compatibility analysis
4. **StyleAnalyzer**: Fashion style identification
5. **WeatherMatcher**: Weather-based outfit recommendations

### Edge Functions
- `ai-style-consultant`: Streaming chat interface
- `ai-outfit-recommendations`: Structured outfit suggestions
- `ai-wardrobe-insights`: Wardrobe analysis and insights

## Database Architecture

### Core Tables
- **profiles**: User profile data
- **wardrobe_items**: User clothing inventory
- **outfits**: Outfit combinations
- **market_items**: Marketplace listings
- **merchant_items**: Merchant inventory
- **orders**: Transaction records
- **social_posts**: Social feed content

### Settings Tables
- **user_settings**: User preferences
- **ai_service_settings**: AI configuration per user
- **payment_settings**: Payment preferences
- **merchant_settings**: Merchant configuration

### Analytics Tables
- **merchant_analytics**: Business metrics
- **user_activity**: User behavior tracking

## Security Implementation

### Multi-layered Security
1. **Database RLS**: Row-level security policies
2. **Edge Function Auth**: JWT verification
3. **Rate Limiting**: API request throttling
4. **Encryption**: Sensitive data encryption (PII, payment info)
5. **Audit Logging**: Security event tracking

### Best Practices
- No environment variables (VITE_*) - hardcoded project URLs
- Secure data handling functions
- Input validation on client and server
- CORS configuration for edge functions

## Payment System

### MyDresser Payments
Internal payment processing supporting:
- Credit/debit cards
- Bank transfers
- Digital wallets (PayPal, Apple Pay, Google Pay)

### Features
- Transaction history
- Payment method management
- Secure checkout flow
- Merchant payouts

## Performance Optimizations

### Code Splitting
- Route-based code splitting
- Lazy loading for heavy components
- Dynamic imports for analytics

### Caching Strategy
- React Query with 5-minute stale time
- Supabase query optimization
- Image optimization (lazy loading, compression)

### Animations
- CSS-based animations (no JS overhead)
- Fade-in effects for page transitions
- Hover effects for interactive elements
- Loading spinners with smooth animations

## Development Guidelines

### Component Creation
1. Use functional components with TypeScript
2. Implement proper loading and error states
3. Add animations for better UX (fade-in, scale, hover effects)
4. Follow semantic HTML structure for SEO

### API Calls
1. Use React Query hooks for data fetching
2. Implement proper error handling
3. Add optimistic updates where appropriate
4. Cache aggressively, invalidate intelligently

### Security First
1. Always validate input on both client and server
2. Never expose sensitive data in logs
3. Use RLS policies for all user data
4. Encrypt PII at rest

### AI Integration
1. Always use edge functions for AI calls
2. Handle rate limiting (429) gracefully
3. Stream responses for better UX
4. Provide fallback content when AI unavailable

## Testing Strategy
- Manual testing for critical user flows
- Console log monitoring for errors
- Network request monitoring
- Supabase linter for security checks

## Deployment
- Automatic deployment via Lovable Cloud
- Edge functions auto-deploy with code changes
- Database migrations require user approval
- Zero-downtime updates

## Recent Enhancements (Phase 19-23)

### Phase 23: AI Camera Scanning & Smart Item Recognition (Current)
- **Camera Scanner**: Live camera interface with AI-powered item detection
- **Vision AI**: Gemini 2.5 Flash for clothing image analysis
- **Smart Pre-filling**: Automatic form population from scanned items
- **Mobile-First**: Works seamlessly on mobile devices with camera
- **High Accuracy**: 70-95% confidence in item detection
- **Edge Function**: Dedicated `ai-clothing-scanner` for vision analysis

### Phase 22: Real-time Features & Enhanced Interactivity
- **Real-time Subscriptions**: Live updates using Supabase real-time
- **Live Notifications**: Instant notification delivery with toast messages
- **Real-time Social Feed**: Automatic feed updates without refresh
- **Live Inventory Tracking**: Real-time merchant inventory updates
- **Live Orders**: Real-time order status tracking with notifications
- **Connection Monitoring**: Visual indicator for real-time connection status
- **Optimized Channels**: Efficient real-time channel management and cleanup

### Phase 21: Advanced Analytics with AI
- **Predictive AI Analytics**: Machine learning-powered forecasting
- **Business Intelligence**: Revenue, customer, and inventory predictions
- **User Insights**: Wardrobe utilization and style evolution tracking
- **Confidence Scoring**: AI accuracy indicators (70-90%)
- **Actionable Recommendations**: Data-driven strategic insights
- **Enhanced Dashboards**: Tabbed analytics (Current/Predictive)

### Phase 20: Mobile Optimization
- **Touch-Optimized UI**: Enhanced touch targets and interactions
- **Responsive Grid Layouts**: Adaptive layouts for all screen sizes
- **Settings Consolidation**: All settings unified (users in Account, merchants in Terminal)
- **Mobile Navigation**: Improved tab navigation for smaller screens
- **Role Separation**: Clean separation between user and merchant interfaces

### Phase 19: UX Polish & Performance
- **Shared Providers**: Centralized provider system with AppProviders
- **Loading States**: Consistent LoadingSpinner across app
- **Animations**: Smooth transitions with animated components
- **Code Organization**: Better separation of concerns and reusability
- **Performance**: React Query optimizations, lazy loading, code splitting

## Future Enhancements
- **Advanced Search**: Full-text search with filters and AI-powered recommendations
- **Advanced ML Models**: More sophisticated forecasting algorithms
- **Trend Forecasting**: Fashion and market trend analysis
- **Progressive Web App (PWA)**: Offline capabilities
- **Enhanced AR Try-On**: WebXR integration
- **Multi-language Support**: i18n implementation
- **Native Mobile Apps**: React Native development
