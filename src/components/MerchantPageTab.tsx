import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { MerchantPageEditor } from '@/components/MerchantPageEditor';
import { 
  Eye, Share2, Edit3, BarChart3, 
  Globe, Users, Star, TrendingUp,
  ExternalLink
} from 'lucide-react';

export const MerchantPageTab: React.FC = () => {
  const { merchantProfile, loading } = useMerchantProfile();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!merchantProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Please create your merchant profile first to access page management.
          </p>
          <Button>Create Merchant Profile</Button>
        </CardContent>
      </Card>
    );
  }

  const handleViewPage = () => {
    const url = `/merchant/${merchantProfile.user_id}`;
    window.open(url, '_blank');
  };

  const handleEditPage = () => {
    setActiveTab('editor');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Merchant Page</h2>
          <p className="text-muted-foreground">
            Manage your public storefront and brand presence
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleViewPage}>
            <Eye className="h-4 w-4 mr-2" />
            View Page
          </Button>
          <Button onClick={handleEditPage}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Page
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="editor">Page Editor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Page Status</h3>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Published
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Page Views</h3>
                </div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Followers</h3>
                </div>
                <p className="text-2xl font-bold">567</p>
                <p className="text-sm text-green-500">+12 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Rating</h3>
                </div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-muted-foreground">Based on 89 reviews</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <MerchantPageEditor />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Page Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and insights for your merchant page will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};