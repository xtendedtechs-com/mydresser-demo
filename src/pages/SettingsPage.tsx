import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  Settings as SettingsIcon,
  ChevronRight,
  Palette,
  Globe,
  ShoppingBag,
  TrendingUp
} from "lucide-react";

// Import individual settings pages
import AccountSettings from './settings/AccountSettings';
import AuthenticationSettings from './settings/AuthenticationSettings';
import PrivacySettings from './settings/PrivacySettings';
import ServiceSettings from './settings/ServiceSettings';
import AppSettings from './settings/AppSettings';

const SettingsPage = () => {
  const { category } = useParams();
  const activeSection = category || 'account';

  const settingsCategories = [
    {
      id: 'account',
      title: 'Account',
      description: 'Manage your profile and personal information',
      icon: User,
      component: AccountSettings
    },
    {
      id: 'authentication',
      title: 'Security',
      description: 'Authentication, MFA, and security settings',
      icon: Shield,
      component: AuthenticationSettings
    },
    {
      id: 'privacy',
      title: 'Privacy',
      description: 'Control your privacy and data sharing preferences',
      icon: Eye,
      component: PrivacySettings
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Configure notifications and service preferences',
      icon: Bell,
      component: ServiceSettings
    },
    {
      id: 'app',
      title: 'App Settings',
      description: 'Customize theme, language, and app behavior',
      icon: SettingsIcon,
      component: AppSettings
    }
  ];

  const currentCategory = settingsCategories.find(cat => cat.id === activeSection);
  const CurrentComponent = currentCategory?.component || AccountSettings;

  // If no category is specified, show the settings overview
  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Customize your MyDresser experience</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-4">
                {settingsCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link key={category.id} to={`/account/settings/${category.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center justify-between p-6">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{category.title}</h3>
                              <p className="text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show specific settings category
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Link to="/account/settings" className="hover:text-foreground">Settings</Link>
                <ChevronRight className="w-4 h-4" />
                <span>{currentCategory?.title}</span>
              </div>
              <h1 className="text-3xl font-bold">{currentCategory?.title}</h1>
              <p className="text-muted-foreground">{currentCategory?.description}</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/account/settings">
                Back to Settings
              </Link>
            </Button>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <CurrentComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;