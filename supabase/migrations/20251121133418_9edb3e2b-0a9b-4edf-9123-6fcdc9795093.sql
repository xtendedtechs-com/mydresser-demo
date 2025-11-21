-- Update previous version to not be current
UPDATE app_versions SET is_current = false WHERE is_current = true;

-- Insert new version 1.0.4-beta
INSERT INTO app_versions (version, release_date, is_current, changelog)
VALUES (
  '1.0.4-beta',
  '2025-11-19',
  true,
  '[
    {
      "category": "🎨 Polish & UX Improvements",
      "items": [
        "Enhanced Loading & Error States with new UI components",
        "Integrated ErrorState component with retry functionality",
        "Added Skeleton loading states for smoother performance",
        "ItemCardSkeletonGrid for consistent grid loading patterns",
        "EmptyStateCard with contextual actions for empty views",
        "PageTransition component for smooth page changes"
      ]
    },
    {
      "category": "📚 First-Time User Experience",
      "items": [
        "Interactive onboarding tour for new users",
        "6-step guided walkthrough introducing key features",
        "Progress indicator with step navigation",
        "Skip option for returning users",
        "Direct navigation to featured sections",
        "Automatic display on first login"
      ]
    },
    {
      "category": "📖 Documentation",
      "items": [
        "Created comprehensive USER_GUIDE.md (50+ pages)",
        "Complete guides for all features and settings",
        "Keyboard shortcuts reference",
        "Troubleshooting guide",
        "Tips & Best Practices",
        "Support & Feedback channels"
      ]
    },
    {
      "category": "✅ Quality Assurance",
      "items": [
        "All new components integrated across major pages",
        "Consistent animations across the entire application",
        "iOS design system with glass morphism",
        "PWA optimizations in place",
        "Code quality verified (no console errors)",
        "Production-ready for beta launch"
      ]
    }
  ]'::jsonb
);