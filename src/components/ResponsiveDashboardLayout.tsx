import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const DashboardCard = ({ 
  title, 
  description, 
  children, 
  className,
  noPadding = false
}: DashboardCardProps) => {
  return (
    <Card className={cn('h-full', className)}>
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-base sm:text-lg">{title}</CardTitle>}
          {description && <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(noPadding && 'p-0')}>
        {children}
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export const StatCard = ({ icon, value, label, trend, className }: StatCardProps) => {
  return (
    <Card className={cn('h-full', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold mb-2">{value}</p>
            {trend && (
              <div className={cn(
                'text-xs sm:text-sm font-medium',
                trend.positive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 ml-4">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export const DashboardGrid = ({ children, className }: DashboardGridProps) => {
  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
      className
    )}>
      {children}
    </div>
  );
};

export const DashboardTwoColumn = ({ children, className }: DashboardGridProps) => {
  return (
    <div className={cn(
      'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6',
      className
    )}>
      {children}
    </div>
  );
};

export const DashboardThreeColumn = ({ children, className }: DashboardGridProps) => {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
      className
    )}>
      {children}
    </div>
  );
};

interface DashboardSidebarLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'narrow' | 'medium' | 'wide';
}

export const DashboardSidebarLayout = ({
  sidebar,
  main,
  sidebarPosition = 'left',
  sidebarWidth = 'medium'
}: DashboardSidebarLayoutProps) => {
  const widthClasses = {
    narrow: 'lg:w-64',
    medium: 'lg:w-80',
    wide: 'lg:w-96'
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
      {sidebarPosition === 'left' && (
        <aside className={cn('w-full', widthClasses[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
      <main className="flex-1 min-w-0">
        {main}
      </main>
      {sidebarPosition === 'right' && (
        <aside className={cn('w-full', widthClasses[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
    </div>
  );
};
