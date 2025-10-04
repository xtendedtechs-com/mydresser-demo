import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Upload, Download, Filter, Search, 
  TrendingUp, AlertTriangle, CheckCircle, Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MerchantInventoryManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">PIM/OMS Integration & Product Data Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/merchant/terminal')}>
            <Package className="h-4 w-4 mr-2" />
            Back to Terminal
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-500">23</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Needs attention</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold text-green-500">1,189</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Ready to ship</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Sync</p>
              <p className="text-2xl font-bold text-blue-500">35</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Updates queued</p>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="feed-management">Feed Management</TabsTrigger>
          <TabsTrigger value="data-quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by SKU, name, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button>
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products found. Start by adding products or bulk uploading.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-upload" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Bulk Product Upload</h2>
            <p className="text-muted-foreground mb-6">
              Upload products in bulk using CSV, XML, or JSON format. Our system will automatically
              validate, normalize, and standardize your data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 border-2 border-dashed">
                <h3 className="font-medium mb-2">CSV Upload</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload spreadsheet data with product information
                </p>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </Card>

              <Card className="p-4 border-2 border-dashed">
                <h3 className="font-medium mb-2">XML Feed</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your existing product feed URL
                </p>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Connect Feed
                </Button>
              </Card>

              <Card className="p-4 border-2 border-dashed">
                <h3 className="font-medium mb-2">JSON Import</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import structured product data in JSON format
                </p>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload JSON
                </Button>
              </Card>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Upload History</h3>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upload history yet</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="feed-management" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Feed Management</h2>
            <p className="text-muted-foreground mb-6">
              Manage automated product feeds from external sources. Our AI-powered system handles
              data ingestion, validation, and normalization automatically.
            </p>

            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">Automated Feed Processing</h3>
                      <Badge variant="secondary">AI-Powered</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Automatic format detection (CSV, XML, JSON)</li>
                      <li>✓ Data validation and error detection</li>
                      <li>✓ Standardization of product attributes</li>
                      <li>✓ Real-time inventory synchronization</li>
                      <li>✓ Duplicate detection and merging</li>
                    </ul>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <p className="font-medium">Add New Feed Source</p>
                    <p className="text-xs text-muted-foreground">Connect external data source</p>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <p className="font-medium">Download Template</p>
                    <p className="text-xs text-muted-foreground">Get standardized CSV template</p>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data-quality" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Data Quality Score</h2>
            <p className="text-muted-foreground mb-6">
              Track and improve your product data quality. Higher quality data leads to better
              VTO accuracy, lower returns, and higher conversion rates.
            </p>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Data Quality</span>
                <span className="text-2xl font-bold text-green-500">94%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Complete Product Info</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold">1,189</p>
                <p className="text-xs text-muted-foreground">All required fields filled</p>
              </Card>

              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Incomplete Data</span>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold">58</p>
                <p className="text-xs text-muted-foreground">Missing required information</p>
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Image Quality</span>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">97%</p>
                <p className="text-xs text-muted-foreground">High-resolution images</p>
              </Card>

              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">VTO Ready</span>
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">892</p>
                <p className="text-xs text-muted-foreground">Meets VTO requirements</p>
              </Card>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="font-medium mb-4">Required Fields for VTO</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• High-resolution product images (min 1500x1500px)</li>
                <li>• Accurate size measurements (chest, waist, length, etc.)</li>
                <li>• Material composition and stretch information</li>
                <li>• Color variants with accurate names and hex codes</li>
                <li>• Category and subcategory classification</li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
