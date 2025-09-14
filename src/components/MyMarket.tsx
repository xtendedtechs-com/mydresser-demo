import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Crown,
  Star,
  ShoppingCart,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { useMerchantItems, type MerchantItem } from "@/hooks/useMerchantItems";
import MerchantProfileForm from "@/components/MerchantProfileForm";

const MyMarket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useProfile();
  const { profile: merchantProfile, loading: profileLoading } = useMerchantProfile();
  const { items, loading: itemsLoading, refetch } = useMerchantItems();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Filter user's merchant items
  const userItems = items.filter(item => item.merchant_id === user?.id);

  const categories = [
    "all", "tops", "bottoms", "outerwear", "dresses", "shoes", 
    "accessories", "underwear", "activewear", "swimwear", "sleepwear"
  ];

  const getFilteredItems = () => {
    let filtered = userItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  };

  // Calculate stats
  const totalItems = userItems.length;
  const featuredItems = userItems.filter(item => item.is_featured).length;
  const totalRevenue = userItems.reduce((sum, item) => sum + (item.price * (item.stock_quantity || 1)), 0);
  const avgPrice = totalItems > 0 ? totalRevenue / totalItems : 0;

  const handleItemClick = (item: MerchantItem) => {
    navigate(`/market/item/${item.id}`);
  };

  const handleEditItem = (item: MerchantItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Navigate to edit item form
    toast({
      title: "Edit Item",
      description: `Editing ${item.name}...`,
    });
  };

  const handleDeleteItem = (item: MerchantItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement delete functionality
    toast({
      title: "Delete Item",
      description: `Deleting ${item.name}...`,
      variant: "destructive",
    });
  };

  if (profileLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your merchant data...</p>
        </div>
      </div>
    );
  }

  if (showProfileForm || !merchantProfile) {
    return (
      <MerchantProfileForm 
        onComplete={() => {
          setShowProfileForm(false);
          toast({
            title: "Profile Updated",
            description: "Your merchant profile has been saved successfully.",
          });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MyMarket Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your merchant listings and track performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={merchantProfile.verification_status === 'verified' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {merchantProfile.verification_status === 'verified' ? (
              <CheckCircle className="w-3 h-3" />
            ) : merchantProfile.verification_status === 'pending' ? (
              <Clock className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {merchantProfile.verification_status}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowProfileForm(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => navigate('/market/add-item')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{featuredItems}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">${avgPrice.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Recent Items */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {userItems.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No items listed yet</h3>
                    <p className="text-muted-foreground">Start by adding your first product to the marketplace</p>
                  </div>
                  <Button onClick={() => navigate('/market/add-item')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userItems.slice(0, 6).map((item) => (
                    <Card 
                      key={item.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="aspect-square bg-muted overflow-hidden rounded-t-lg relative">
                        {item.photos?.main ? (
                          <img
                            src={item.photos.main}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {item.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-yellow-500">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}

                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7"
                            onClick={(e) => handleEditItem(item, e)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7"
                            onClick={(e) => handleDeleteItem(item, e)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-primary">${item.price}</span>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search your items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredItems().map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => handleItemClick(item)}
              >
                <div className="aspect-square bg-muted overflow-hidden rounded-t-lg relative">
                  {item.photos?.main ? (
                    <img
                      src={item.photos.main}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {item.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}

                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={(e) => handleEditItem(item, e)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={(e) => handleDeleteItem(item, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary">${item.price}</span>
                    <Badge variant="outline">{item.stock_quantity} in stock</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredItems().length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Start by adding your first product"}
                </p>
                <Button onClick={() => navigate('/market/add-item')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Track your sales performance, customer insights, and market trends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">No Orders Yet</h3>
                  <p className="text-muted-foreground">
                    Customer orders will appear here once they start purchasing your items
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyMarket;