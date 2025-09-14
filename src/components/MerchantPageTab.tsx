import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Edit3, 
  ExternalLink, 
  Users, 
  ShoppingBag, 
  Star,
  BarChart3,
  Settings
} from 'lucide-react';
import MerchantPageEditor from './MerchantPageEditor';
import SecurityAlert from './SecurityAlert';

const MerchantPageTab = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { profile: merchantProfile, loading } = useMerchantProfile();
  const [activeTab, setActiveTab] = useState('overview');

  const handleViewPage = () => {
    if (profile?.user_id) {
      window.open(`/merchant/${profile.user_id}`, '_blank');
    }
  };

  const handleEditPage = () => {
    setActiveTab('editor');
  };

  const merchantPageUrl = profile?.user_id ? `/merchant/${profile.user_id}` : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading merchant page...</p>
        </div>
      </div>
    );
  }

  if (!merchantProfile) {
    return (
      <div className="space-y-6">
        <SecurityAlert 
          type="warning"
          title="Merchant Profile Required"
          message="You need to create a merchant profile before you can customize your public page."
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Create Your Merchant Page</CardTitle>
            <CardDescription>
              Set up your public merchant page to showcase your business to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              A merchant page allows customers to discover your business, view your products, 
              and learn about your brand story. Complete your merchant profile to get started.
            </p>
            <Button onClick={() => navigate('/merchant-terminal')}>
              Complete Merchant Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="editor">Page Editor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Your Merchant Page
              </CardTitle>
              <CardDescription>
                Manage your public merchant page and track its performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Page Status */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">{merchantProfile.business_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Public merchant page • {merchantPageUrl}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={merchantProfile.verification_status === 'verified' ? 'default' : 'secondary'}>
                      {merchantProfile.verification_status === 'verified' ? 'Verified' : 'Pending Verification'}
                    </Badge>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleViewPage} className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Page
                  </Button>
                  <Button onClick={handleEditPage} className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit Page
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">
                      +12 new followers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8</div>
                    <p className="text-xs text-muted-foreground">
                      Based on 23 reviews
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2 h-auto p-4"
                    onClick={() => window.open(merchantPageUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Share Your Page</div>
                      <div className="text-sm text-muted-foreground">Get your page link</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="justify-start gap-2 h-auto p-4"
                    onClick={handleEditPage}
                  >
                    <Settings className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Page Settings</div>
                      <div className="text-sm text-muted-foreground">Customize appearance</div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Editor Tab */}
        <TabsContent value="editor">
          <MerchantPageEditor 
            onSave={() => {
              // Handle save callback
              setActiveTab('overview');
            }}
            onPreview={handleViewPage}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Page Analytics
              </CardTitle>
              <CardDescription>
                Track your merchant page performance and customer engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
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

export default MerchantPageTab;