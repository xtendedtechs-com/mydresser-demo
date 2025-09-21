import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import SettingsContentHandler from '@/components/SettingsContentHandler';

const SettingsPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const getSettingInfo = (category: string) => {
    switch (category) {
      case 'account':
        return {
          title: 'Account Settings',
          description: 'Manage your account information and profile'
        };
      case 'authentication':
        return {
          title: 'Authentication & Security',
          description: 'Manage your authentication methods and security settings'
        };
      case 'theme':
        return {
          title: 'Theme Customization',
          description: 'Personalize your app appearance and theme'
        };
      case 'notifications':
        return {
          title: 'Notification Settings',
          description: 'Control what notifications you receive'
        };
      case 'privacy':
        return {
          title: 'Privacy & Data',
          description: 'Manage your privacy settings and data sharing'
        };
      case 'accessibility':
        return {
          title: 'Accessibility',
          description: 'Configure accessibility features'
        };
      case 'general':
        return {
          title: 'General Settings',
          description: 'General app configuration and preferences'
        };
      case 'permissions':
        return {
          title: 'App Permissions',
          description: 'Manage app permissions and access'
        };
      case 'preferences':
        return {
          title: 'User Preferences',
          description: 'Customize your app experience'
        };
      default:
        return {
          title: 'Settings',
          description: 'Application settings'
        };
    }
  };

  const settingInfo = getSettingInfo(category || 'general');

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/account')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Button>
          <h1 className="text-2xl font-bold">{settingInfo.title}</h1>
          <p className="text-muted-foreground">{settingInfo.description}</p>
        </div>

        <SettingsContentHandler
          settingType={category || 'general'}
          settingTitle={settingInfo.title}
          settingDescription={settingInfo.description}
        />
      </div>
    </div>
  );
};

export default SettingsPage;