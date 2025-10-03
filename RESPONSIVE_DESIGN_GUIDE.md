# MyDresser Responsive Design Guide

This guide explains our responsive design approach and how to use the responsive components throughout the MyDresser application.

## Design Philosophy

MyDresser follows a **mobile-first, progressive enhancement** approach:

1. **Mobile First**: Design for smallest screens first, then enhance for larger displays
2. **Touch Optimized**: All interactive elements meet WCAG 2.1 AA standards (44x44px minimum)
3. **Content Priority**: Most important content visible at all screen sizes
4. **Performance**: CSS-only responsive design, no JavaScript media queries
5. **Accessibility**: Keyboard navigation and screen reader support at all breakpoints

## Breakpoint Strategy

```typescript
// Tailwind Breakpoints
{
  sm: '640px',   // Small tablets and large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops and desktops
  xl: '1280px',  // Large desktops
  '2xl': '1536px' // Extra large desktops and 4K
}
```

### Target Devices

| Breakpoint | Devices | Layout Strategy |
|------------|---------|-----------------|
| < 640px | Mobile phones | Single column, stacked, bottom nav |
| 640-768px | Large phones, small tablets | 2 columns, mixed layouts |
| 768-1024px | Tablets, small laptops | 2-3 columns, sidebar optional |
| 1024-1280px | Desktops, laptops | 3-4 columns, full features |
| 1280-1536px | Large desktops | 4+ columns, spacious layouts |
| > 1536px | 4K displays, ultra-wide | 5-7 columns, maximum density |

## Responsive Components

### ResponsiveContainer

Provides consistent max-width and padding across breakpoints.

```tsx
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

// Standard container
<ResponsiveContainer>
  {/* Content automatically gets responsive padding */}
  <h1>My Content</h1>
</ResponsiveContainer>

// Different max-widths
<ResponsiveContainer maxWidth="sm">  {/* 640px max */}
<ResponsiveContainer maxWidth="md">  {/* 768px max */}
<ResponsiveContainer maxWidth="lg">  {/* 1024px max */}
<ResponsiveContainer maxWidth="xl">  {/* 1280px max */}
<ResponsiveContainer maxWidth="2xl"> {/* 1536px max */}
<ResponsiveContainer maxWidth="7xl"> {/* 1280px max - recommended */}
<ResponsiveContainer maxWidth="full"> {/* No max width */}

// No padding (when you need full control)
<ResponsiveContainer noPadding>
  <div className="px-2">Custom padding</div>
</ResponsiveContainer>
```

### ResponsiveGrid

Adaptive grid that changes column count at breakpoints.

```tsx
import { ResponsiveGrid } from '@/components/ResponsiveContainer';

// Default: 1 col mobile, 2 tablet, 3 desktop, 4 large
<ResponsiveGrid>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</ResponsiveGrid>

// Custom columns per breakpoint
<ResponsiveGrid
  cols={{
    default: 1,  // Mobile
    sm: 2,       // Small tablets
    md: 3,       // Tablets
    lg: 4,       // Desktop
    xl: 5        // Large desktop
  }}
  gap={6} // Gap size (Tailwind scale)
>
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</ResponsiveGrid>

// Product Grid Example
<ResponsiveGrid
  cols={{ default: 2, md: 3, lg: 4, xl: 5 }}
  gap={4}
>
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</ResponsiveGrid>
```

### ResponsiveStack

Switches between vertical and horizontal layout at breakpoints.

```tsx
import { ResponsiveStack } from '@/components/ResponsiveContainer';

// Vertical on mobile, horizontal on desktop
<ResponsiveStack
  direction="vertical"
  breakpoint="md"
  gap={4}
>
  <div>Section 1</div>
  <div>Section 2</div>
</ResponsiveStack>

// Horizontal on mobile, vertical on desktop (less common)
<ResponsiveStack
  direction="horizontal"
  breakpoint="lg"
  gap={6}
>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
</ResponsiveStack>
```

### Dashboard Components

Pre-built responsive layouts for dashboard interfaces.

```tsx
import {
  DashboardCard,
  StatCard,
  DashboardGrid,
  DashboardTwoColumn,
  DashboardThreeColumn,
  DashboardSidebarLayout
} from '@/components/ResponsiveDashboardLayout';

// Stat Cards
<DashboardGrid>
  <StatCard
    icon={<TrendingUp className="h-8 w-8 text-primary" />}
    value="$12,345"
    label="Total Revenue"
    trend={{ value: "+12%", positive: true }}
  />
  <StatCard
    icon={<Users className="h-8 w-8 text-blue-600" />}
    value="1,234"
    label="Active Users"
    trend={{ value: "-3%", positive: false }}
  />
</DashboardGrid>

// Dashboard Cards
<DashboardCard title="Recent Activity" description="Last 7 days">
  {/* Your content */}
</DashboardCard>

// Two Column Layout
<DashboardTwoColumn>
  <DashboardCard title="Sales Chart">
    <RevenueChart />
  </DashboardCard>
  <DashboardCard title="Top Products">
    <ProductList />
  </DashboardCard>
</DashboardTwoColumn>

// Sidebar Layout
<DashboardSidebarLayout
  sidebar={<FilterPanel />}
  main={<ProductGrid />}
  sidebarPosition="left"
  sidebarWidth="medium"
/>
```

## Common Patterns

### Responsive Text Sizing

```tsx
// Headings
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
  Responsive Heading
</h1>

// Body Text
<p className="text-xs sm:text-sm lg:text-base">
  Responsive body text
</p>

// Truncation
<p className="truncate">Very long text that will be cut off...</p>

// Line Clamping
<p className="line-clamp-2 sm:line-clamp-3">
  Multi-line text that will be limited to 2 lines on mobile, 3 on tablet+
</p>
```

### Responsive Spacing

```tsx
// Padding
<div className="p-3 sm:p-4 lg:p-6">Content</div>

// Margin
<div className="mt-4 sm:mt-6 lg:mt-8">Content</div>

// Gap
<div className="flex gap-2 sm:gap-4 lg:gap-6">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

### Conditional Display

```tsx
// Hide on mobile, show on desktop
<span className="hidden md:inline">Desktop Only</span>

// Show on mobile, hide on desktop
<span className="inline md:hidden">Mobile Only</span>

// Screen reader only (accessibility)
<span className="sr-only">For screen readers</span>
<span className="sr-only sm:not-sr-only">Visible on tablet+</span>
```

### Responsive Grids

```tsx
// 2 columns on mobile, 4 on desktop
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>

// Dynamic columns
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>

// Auto-fit (fills available space)
<div className="grid grid-cols-auto-fit-sm gap-4">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

### Flex Layouts

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Section 1</div>
  <div className="flex-1">Section 2</div>
</div>

// Wrap on small screens
<div className="flex flex-wrap gap-2">
  <Badge>Tag 1</Badge>
  <Badge>Tag 2</Badge>
  <Badge>Tag 3</Badge>
</div>

// Prevent overflow in flex items
<div className="flex">
  <div className="flex-1 min-w-0"> {/* min-w-0 allows truncation */}
    <p className="truncate">Long text that can be truncated</p>
  </div>
  <button className="flex-shrink-0">Action</button>
</div>
```

### Responsive Images

```tsx
// Size based on screen
<img 
  src={image} 
  className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-cover rounded"
  alt="Responsive image"
/>

// Full width on mobile, constrained on desktop
<img 
  src={image} 
  className="w-full md:w-auto md:max-w-md"
  alt="Flexible width image"
/>

// Different aspect ratios
<div className="aspect-square sm:aspect-video">
  <img src={image} className="w-full h-full object-cover" alt="Aspect ratio image" />
</div>
```

## Page Layout Templates

### Standard Page Layout

```tsx
const MyPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <ResponsiveContainer>
          <div className="py-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Page Title
            </h1>
          </div>
        </ResponsiveContainer>
      </header>

      {/* Main Content */}
      <main>
        <ResponsiveContainer className="py-6 space-y-6">
          {/* Your content */}
        </ResponsiveContainer>
      </main>
    </div>
  );
};
```

### Dashboard Layout

```tsx
const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      <ResponsiveContainer className="py-6 space-y-6">
        {/* Stats Grid */}
        <DashboardGrid>
          <StatCard icon={/*...*/} value="123" label="Metric 1" />
          <StatCard icon={/*...*/} value="456" label="Metric 2" />
          <StatCard icon={/*...*/} value="789" label="Metric 3" />
          <StatCard icon={/*...*/} value="101" label="Metric 4" />
        </DashboardGrid>

        {/* Two Column Content */}
        <DashboardTwoColumn>
          <DashboardCard title="Chart">
            <Chart />
          </DashboardCard>
          <DashboardCard title="Activity">
            <ActivityFeed />
          </DashboardCard>
        </DashboardTwoColumn>
      </ResponsiveContainer>
    </div>
  );
};
```

### List with Sidebar

```tsx
const ListPage = () => {
  return (
    <ResponsiveContainer className="py-6">
      <DashboardSidebarLayout
        sidebar={
          <div className="space-y-4">
            <FilterPanel />
            <SortOptions />
          </div>
        }
        main={
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }}>
            {items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </ResponsiveGrid>
        }
        sidebarPosition="left"
        sidebarWidth="narrow"
      />
    </ResponsiveContainer>
  );
};
```

## Best Practices

### Do's ✅

1. **Use container max-widths**: Prevent content from becoming too wide on large screens
2. **Test at all breakpoints**: Use browser dev tools to test responsive behavior
3. **Touch-friendly targets**: Ensure buttons/links are at least 44x44px on mobile
4. **Readable text**: Maintain minimum 16px font size on mobile
5. **Flexible layouts**: Use `flex-1`, `min-w-0`, and `flex-wrap` for flexible content
6. **Consistent spacing**: Use Tailwind's spacing scale, not arbitrary values
7. **Mobile navigation**: Use bottom navigation on mobile, top nav on desktop
8. **Progressive disclosure**: Show essential content first, expand on larger screens

### Don'ts ❌

1. **Don't use fixed widths**: Use `flex`, `w-full`, or `max-w-*` instead
2. **Don't overlap content**: Ensure proper spacing at all screen sizes
3. **Don't hide critical actions**: Keep primary actions visible at all breakpoints
4. **Don't use tiny text**: Nothing smaller than 12px on mobile
5. **Don't ignore horizontal scrolling**: Use `overflow-x-hidden` or `flex-wrap`
6. **Don't forget safe areas**: Account for notches and home indicators on mobile
7. **Don't use absolute positioning excessively**: Breaks responsive flow
8. **Don't test only on one device**: Check multiple screen sizes

## Testing Checklist

Before shipping responsive changes, test:

- [ ] iPhone SE (375px) - Smallest modern phone
- [ ] iPhone 14 (390px) - Standard phone size
- [ ] iPad (768px) - Standard tablet
- [ ] iPad Pro (1024px) - Large tablet
- [ ] Laptop (1280px) - Small laptop
- [ ] Desktop (1440px) - Standard desktop
- [ ] 4K (2560px+) - Large displays

Test these interactions:
- [ ] Touch targets are easily tappable (44x44px)
- [ ] Text is readable at all sizes
- [ ] Images don't overflow or distort
- [ ] Navigation works on mobile and desktop
- [ ] Forms are easy to fill out
- [ ] Modals/dialogs fit on screen
- [ ] Tables scroll horizontally if needed
- [ ] Cards stack properly on mobile

## Performance Considerations

1. **CSS-only responsive**: No JavaScript media queries needed
2. **Minimal re-renders**: Use `React.memo` for expensive components
3. **Lazy loading**: Use React.lazy for code-splitting large components
4. **Image optimization**: Use appropriate sizes for each breakpoint
5. **Tailwind JIT**: Automatically purges unused styles
6. **Hardware acceleration**: Use `transform` and `opacity` for animations

## Accessibility

1. **Focus management**: Ensure focus indicators scale with text
2. **Screen readers**: Use `sr-only` for icon-only buttons
3. **Keyboard navigation**: Test all interactive elements with keyboard
4. **Color contrast**: Maintain WCAG AA standards at all sizes
5. **Touch targets**: 44x44px minimum for WCAG 2.1 Level AA
6. **Text scaling**: Support browser text zoom up to 200%

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Responsive Design Patterns](https://web.dev/responsive-web-design-basics/)
- [Mobile First Design](https://www.lukew.com/ff/entry.asp?933)

---

**Remember**: Responsive design is not just about different screen sizes—it's about creating the best experience for users regardless of how they access your application.
