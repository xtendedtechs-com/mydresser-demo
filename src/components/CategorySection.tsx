import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  onViewAll?: () => void;
}

const CategorySection = ({ 
  title, 
  subtitle, 
  icon, 
  children, 
  onViewAll 
}: CategorySectionProps) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {onViewAll && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewAll}
            className="text-primary"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Section Content */}
      {children}
    </div>
  );
};

export default CategorySection;