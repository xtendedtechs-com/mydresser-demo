import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface AddOptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isNew?: boolean;
  isComingSoon?: boolean;
  isPremium?: boolean;
}

const AddOption = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  isNew = false, 
  isComingSoon = false,
  isPremium = false 
}: AddOptionProps) => {
  return (
    <Card 
      className={`
        p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-accent/50
        ${isComingSoon ? 'opacity-60' : ''}
      `}
      onClick={!isComingSoon ? onClick : undefined}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 p-3 bg-primary/10 rounded-full text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            {isNew && <Badge variant="secondary" className="text-xs">New</Badge>}
            {isPremium && <Badge variant="outline" className="text-xs border-primary text-primary">Premium</Badge>}
            {isComingSoon && <Badge variant="outline" className="text-xs">Coming Soon</Badge>}
          </div>
          <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis">{description}</p>
        </div>
        <ChevronRight className={`w-5 h-5 text-muted-foreground ${isComingSoon ? 'opacity-50' : ''}`} />
      </div>
    </Card>
  );
};

export default AddOption;