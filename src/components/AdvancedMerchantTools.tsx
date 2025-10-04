import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Package, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  BarChart3,
  Settings,
  Zap,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdvancedMerchantTools = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const { toast } = useToast();

  const handleBulkImport = () => {
    toast({
      title: "Bulk import started",
      description: "Processing your inventory file...",
    });
  };

  const handleBulkExport = () => {
    toast({
      title: "Export ready",
      description: "Your inventory data has been exported",
    });
  };

  const applyBulkAction = () => {
    if (!bulkAction || selectedItems.length === 0) return;

    toast({
      title: "Bulk action applied",
      description: `${bulkAction} applied to ${selectedItems.length} items`,
    });
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Advanced Merchant Tools
          </h2>
          <p className="text-muted-foreground">Powerful tools to manage your business</p>
        </div>
      </div>

      <Tabs defaultValue="bulk" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Bulk Operations</h3>
            
            <div className="space-y-4">
              {/* Selected Items Counter */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{selectedItems.length} items selected</p>
                  <p className="text-sm text-muted-foreground">
                    Select items to apply bulk actions
                  </p>
                </div>
                {selectedItems.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedItems([])}
                  >
                    Clear Selection
                  </Button>
                )}
              </div>

              {/* Bulk Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => setBulkAction('price_update')}
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Update Prices</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => setBulkAction('stock_update')}
                >
                  <Package className="w-5 h-5" />
                  <span className="text-sm">Update Stock</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => setBulkAction('category_assign')}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">Assign Category</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => setBulkAction('status_change')}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Change Status</span>
                </Button>
              </div>

              {bulkAction && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="space-y-3">
                    <h4 className="font-medium capitalize">
                      {bulkAction.replace('_', ' ')}
                    </h4>
                    <Input placeholder="Enter value..." />
                    <div className="flex gap-2">
                      <Button onClick={applyBulkAction} className="flex-1">
                        Apply to Selected
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setBulkAction("")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Mock Item List */}
              <div className="space-y-2">
                <h4 className="font-medium">Your Items</h4>
                {['item-1', 'item-2', 'item-3'].map((id) => (
                  <div 
                    key={id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      checked={selectedItems.includes(id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(prev => [...prev, id]);
                        } else {
                          setSelectedItems(prev => prev.filter(i => i !== id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Product {id.split('-')[1]}</p>
                      <p className="text-sm text-muted-foreground">SKU: {id}</p>
                    </div>
                    <Badge>In Stock</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Upload className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold mb-2">Bulk Import</h3>
                  <p className="text-sm text-muted-foreground">
                    Import products from CSV or Excel file
                  </p>
                </div>
                <Button onClick={handleBulkImport} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button variant="outline" className="w-full">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center space-y-4">
                <Download className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold mb-2">Bulk Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Export your inventory to CSV or Excel
                  </p>
                </div>
                <Button onClick={handleBulkExport} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    CSV Format
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Excel Format
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Automation Rules</h3>
            <div className="space-y-4">
              {[
                {
                  name: 'Auto-restock low inventory',
                  description: 'Automatically create purchase orders when stock is low',
                  enabled: true
                },
                {
                  name: 'Price optimization',
                  description: 'Automatically adjust prices based on demand',
                  enabled: false
                },
                {
                  name: 'Discount scheduling',
                  description: 'Apply discounts based on time and inventory age',
                  enabled: true
                }
              ].map((rule, idx) => (
                <div 
                  key={idx}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={rule.enabled} />
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMerchantTools;
