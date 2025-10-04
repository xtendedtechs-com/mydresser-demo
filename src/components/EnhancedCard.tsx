import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface EnhancedCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
}

export const EnhancedCard = ({
  title,
  description,
  icon,
  children,
  className,
  hover = true,
  gradient = false,
  glass = false,
}: EnhancedCardProps) => {
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        hover && 'hover-lift cursor-pointer',
        gradient && 'bg-gradient-to-br from-card to-card/50',
        glass && 'bg-card/30 backdrop-blur-lg border-white/10',
        className
      )}
    >
      {(title || description || icon) && (
        <CardHeader>
          <div className="flex items-start gap-3">
            {icon && (
              <div className="mt-1 text-primary">
                {icon}
              </div>
            )}
            <div className="flex-1 space-y-1">
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              {description && (
                <CardDescription className="text-sm">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(!title && !description && 'pt-6')}>
        {children}
      </CardContent>
    </Card>
  );
};
