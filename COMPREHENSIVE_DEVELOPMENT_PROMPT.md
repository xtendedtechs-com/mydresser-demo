# MyDresser AI: Comprehensive Development Prompt

## Project Overview
MyDresser AI is a sophisticated wardrobe management and fashion recommendation platform built with React, TypeScript, Tailwind CSS, and Supabase. This prompt contains critical lessons learned from production development and debugging.

## Core Architecture Principles

### 1. Security-First Design
- **Zero Trust Model**: Every data access must be verified
- **Tiered Authentication**: Base, Intermediate, Advanced levels
- **Encrypted Sensitive Data**: All PII, financial, and merchant data
- **Comprehensive Audit Logging**: Track all sensitive operations
- **Rate Limiting**: Prevent abuse and bot attacks

### 2. Database Design Patterns

#### Critical Functions Required:
```sql
-- User session validation (CRITICAL)
CREATE OR REPLACE FUNCTION public.validate_user_session_robust()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email_confirmed_at IS NOT NULL
    )
  );
END;
$$;

-- Enhanced rate limiting
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  identifier_key text,
  action_type text,
  max_requests integer DEFAULT 10,
  window_minutes integer DEFAULT 60,
  user_agent_string text DEFAULT NULL
) RETURNS jsonb;

-- MFA setup and verification functions
-- Merchant profile encryption functions
-- Contact info secure access functions
```

#### Table Structure Requirements:
- **profiles**: User profiles with proper RLS
- **user_preferences**: Settings with JSON columns for flexibility
- **merchant_profiles**: Encrypted sensitive merchant data
- **wardrobe_items**: Core wardrobe management
- **security_audit_log**: Complete audit trail
- **user_mfa_settings**: Multi-factor authentication
- **rate_limits**: API rate limiting

### 3. Settings Management Architecture

#### Critical Pattern:
```typescript
// NEVER overwrite existing data - always merge
const updatePreferences = async (updates: Partial<UserPreferences>) => {
  try {
    // Get current preferences first
    const { data: currentData } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    // Merge updates with existing data
    const mergedData = {
      ...currentData,
      ...updates,
      // Handle nested objects carefully
      privacy_settings: {
        ...currentData?.privacy_settings,
        ...updates.privacy_settings
      },
      // Repeat for all nested structures
    };

    // Update with merged data
    const { error } = await supabase
      .from('user_preferences')
      .upsert(mergedData);

    if (error) throw error;
  } catch (error) {
    console.error('Settings update failed:', error);
    // Always provide user feedback
  }
};
```

### 4. Error Handling Patterns

#### Service Layer Pattern:
```typescript
// Weather service with proper error handling
export const weatherService = {
  async getCurrentWeather(lat: number, lon: number) {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Weather service error:', error);
      // Return fallback data
      return {
        temperature: 20,
        condition: 'clear',
        humidity: 50,
        windSpeed: 5
      };
    }
  }
};
```

#### Component Error Boundaries:
```typescript
// Wrap all major components in error boundaries
const SafeComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong. Please refresh.</div>}
      onError={(error) => console.error('Component error:', error)}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### 5. Data Structure Safety

#### Always Provide Defaults:
```typescript
// User preferences with comprehensive defaults
const defaultPreferences: UserPreferences = {
  theme: 'system',
  extended_theme: {
    gradient_backgrounds: true,
    animated_transitions: true,
    card_style: 'default',
    border_radius: 'medium',
    shadow_intensity: 'medium',
    button_style: 'default',
    icon_style: 'outline',
    component_density: 'normal',
    color_scheme_type: 'vibrant',
    custom_css: ''
  },
  privacy_settings: {
    profile_visibility: 'public',
    show_wardrobe: false,
    allow_messages: true,
    show_activity: false,
    location_sharing: false
  },
  // ... all other defaults
};

// Safe data access patterns
const getNestedValue = (obj: any, path: string, defaultValue: any) => {
  return path.split('.').reduce((current, key) => 
    current?.[key] ?? defaultValue, obj
  );
};
```

## Critical Issues Prevention

### 1. Authentication Flow
- **Problem**: Users not properly authenticated during signup
- **Solution**: Implement comprehensive auth checks in all database functions
- **Pattern**: Always verify `auth.uid()` and email confirmation status

### 2. Settings Data Loss
- **Problem**: Settings being overwritten instead of merged
- **Solution**: Always fetch current data before updating, merge carefully
- **Pattern**: Use upsert with proper data merging logic

### 3. Theme System Failures
- **Problem**: Theme data being reset to defaults
- **Solution**: Preserve existing theme data during updates
- **Pattern**: Deep merge theme objects, never replace entirely

### 4. CORS Issues
- **Problem**: External API calls blocked by CORS
- **Solution**: Create Supabase Edge Functions as proxies
- **Pattern**: All external APIs go through Edge Functions

### 5. Database Function Dependencies
- **Problem**: Functions referencing non-existent functions
- **Solution**: Create all required functions in correct order
- **Pattern**: Validate all function dependencies before deployment

## Code Organization Standards

### 1. Component Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── wardrobe/        # Wardrobe management
│   ├── marketplace/     # Market features
│   └── settings/        # Settings components
├── hooks/               # Custom hooks
├── services/            # API services
├── ai/                  # AI analysis engines
├── pages/               # Route components
└── integrations/        # External integrations
```

### 2. Security Implementation Checklist

#### Database Security:
- [ ] All tables have RLS enabled
- [ ] Sensitive data is encrypted at rest
- [ ] All functions use SECURITY DEFINER appropriately
- [ ] Rate limiting implemented on all sensitive operations
- [ ] Comprehensive audit logging for all data access

#### Authentication Security:
- [ ] Multi-factor authentication available
- [ ] Session validation in all protected routes
- [ ] Proper role-based access control
- [ ] Secure password requirements
- [ ] Account lockout after failed attempts

#### Data Protection:
- [ ] PII encrypted with proper key management
- [ ] Data minimization principles applied
- [ ] User consent tracking for data usage
- [ ] GDPR compliance for data deletion
- [ ] Secure backup and recovery procedures

### 3. Performance Patterns

#### Database Optimization:
- Use proper indexes on frequently queried columns
- Implement pagination for large datasets
- Cache frequently accessed data
- Optimize RLS policies for performance

#### Frontend Optimization:
- Lazy load components and routes
- Implement proper loading states
- Use React.memo for expensive components
- Optimize image loading and storage

## Testing Strategy

### 1. Critical Test Scenarios
- User signup and profile creation
- Settings updates without data loss
- Theme switching and persistence
- Authentication flow with MFA
- Merchant profile creation and verification
- Wardrobe item management
- AI outfit generation
- Marketplace transactions

### 2. Security Testing
- Test RLS policies with different user roles
- Verify rate limiting effectiveness
- Test data encryption/decryption
- Validate audit logging completeness
- Test session management and expiration

## Deployment Checklist

### 1. Database Readiness
- [ ] All required functions created
- [ ] RLS policies properly configured
- [ ] Indexes created for performance
- [ ] Audit logging operational
- [ ] Rate limiting active

### 2. Security Configuration
- [ ] All secrets properly configured
- [ ] CORS settings appropriate for production
- [ ] Rate limiting thresholds set
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested

### 3. Application Health
- [ ] All services have proper error handling
- [ ] Settings system preserves user data
- [ ] Theme system works across all components
- [ ] AI services have fallback behavior
- [ ] External API integrations stable

## Key Success Metrics

1. **Zero Data Loss**: Settings updates never overwrite existing preferences
2. **Secure Operations**: All sensitive data access is logged and rate-limited
3. **Graceful Degradation**: System remains functional when external services fail
4. **Fast Performance**: Database queries optimized with proper indexing
5. **User Trust**: Transparent privacy controls and secure data handling

## Final Implementation Notes

This prompt represents lessons learned from extensive debugging and optimization. Following these patterns will create a robust, secure, and maintainable application that avoids common pitfalls in user management, settings persistence, and data security.

The key is to implement security and error handling from the beginning, not as an afterthought. Every component should assume failure scenarios and handle them gracefully while preserving user data and maintaining system integrity.