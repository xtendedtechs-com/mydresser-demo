import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  noPadding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
};

export const ResponsiveContainer = ({ 
  children, 
  className, 
  maxWidth = '7xl',
  noPadding = false
}: ResponsiveContainerProps) => {
  return (
    <div 
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        !noPadding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export const ResponsiveGrid = ({ 
  children, 
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4
}: ResponsiveGridProps) => {
  const gridCols = `grid-cols-${cols.default || 1}`;
  const gridColsSm = cols.sm ? `sm:grid-cols-${cols.sm}` : '';
  const gridColsMd = cols.md ? `md:grid-cols-${cols.md}` : '';
  const gridColsLg = cols.lg ? `lg:grid-cols-${cols.lg}` : '';
  const gridColsXl = cols.xl ? `xl:grid-cols-${cols.xl}` : '';
  const gapClass = `gap-${gap}`;

  return (
    <div 
      className={cn(
        'grid',
        gridCols,
        gridColsSm,
        gridColsMd,
        gridColsLg,
        gridColsXl,
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
  breakpoint?: 'sm' | 'md' | 'lg';
  gap?: number;
}

export const ResponsiveStack = ({
  children,
  className,
  direction = 'vertical',
  breakpoint = 'md',
  gap = 4
}: ResponsiveStackProps) => {
  const isVertical = direction === 'vertical';
  const baseClass = isVertical ? 'flex-col' : 'flex-row';
  const responsiveClass = isVertical 
    ? `${breakpoint}:flex-row` 
    : `${breakpoint}:flex-col`;
  const gapClass = `gap-${gap}`;

  return (
    <div 
      className={cn(
        'flex',
        baseClass,
        responsiveClass,
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
};
