import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  onClick?: () => void;
  highlighted?: boolean;
}

interface SettingsSectionProps {
  title: string;
  items: SettingItem[];
}

const SettingsSection = ({ title, items }: SettingsSectionProps) => {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`
              p-4 cursor-pointer transition-all duration-200 hover:shadow-md
              ${item.highlighted 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-card hover:bg-accent/50'
              }
            `}
            onClick={item.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${item.highlighted ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {item.label}
                </h3>
                {item.description && (
                  <p className={`text-sm ${item.highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {item.description}
                  </p>
                )}
              </div>
              <ChevronRight className={`w-5 h-5 ${item.highlighted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SettingsSection;