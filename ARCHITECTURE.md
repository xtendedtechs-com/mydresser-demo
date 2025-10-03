# MyDresser Application Architecture

## Overview
MyDresser is a comprehensive fashion management platform with dual interfaces: a consumer app for wardrobe management and a merchant terminal for retail operations.

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

## Recent Enhancements (Phase 19-21)

### Phase 21: Advanced Analytics with AI (Current)
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
- **Real-time AI Predictions**: Live edge function integration
- **Advanced ML Models**: More sophisticated forecasting algorithms
- **Trend Forecasting**: Fashion and market trend analysis
- **Progressive Web App (PWA)**: Offline capabilities
- **Enhanced AR Try-On**: WebXR integration
- **Multi-language Support**: i18n implementation
- **Native Mobile Apps**: React Native development
