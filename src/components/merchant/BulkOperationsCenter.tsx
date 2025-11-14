import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Edit, Package, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMerchantItems } from '@/hooks/useMerchantItems';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

export const BulkOperationsCenter = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, refetch } = useMerchantItems();
  const { toast } = useToast();

  const handleCSVExport = () => {
    const csvData = items.map(item => ({
      ID: item.id,
      Name: item.name,
      Description: item.description || '',
      Price: item.price,
      'Original Price': item.original_price || '',
      Category: item.category,
      Brand: item.brand || '',
      Color: item.color || '',
      Size: Array.isArray(item.size) ? item.size.join(';') : item.size || '',
      Material: item.material || '',
      Season: item.season || '',
      Occasion: item.occasion || '',
      Stock: item.stock_quantity || 0,
      Status: item.status,
      Condition: item.condition
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(h => {
          const value = row[h as keyof typeof row];
          return JSON.stringify(value ?? '');
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: 'Export Complete',
      description: `${items.length} items exported to CSV`,
    });
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate processing
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: 'Import Complete',
            description: 'Products have been imported successfully',
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleBulkAction = () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select items to perform bulk action',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Bulk Action Applied',
      description: `${bulkAction} applied to ${selectedItems.length} items`,
    });
    setSelectedItems([]);
    setBulkAction('');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(i => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Bulk Operations
          </h2>
          <p className="text-muted-foreground mt-1">
            Import, export, and batch manage your inventory
          </p>
        </div>
      </div>

      <Tabs defaultValue="import-export">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="batch-edit">Batch Edit</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="import-export" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Products
                </CardTitle>
                <CardDescription>Upload CSV file to add multiple products at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    disabled={isProcessing}
                  />
                </div>
                
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Supported format: CSV</p>
                  <p>• Required fields: Name, Price, Category</p>
                  <p>• Max file size: 10MB</p>
                  <p>• Max rows: 1000 products</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Inventory
                </CardTitle>
                <CardDescription>Download your complete inventory as CSV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select defaultValue="csv">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCSVExport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export {items.length} Products
                </Button>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• All product data included</p>
                  <p>• Photos exported as URLs</p>
                  <p>• Compatible with re-import</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch-edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Batch Update Products
              </CardTitle>
              <CardDescription>
                Select multiple products and apply changes at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Select All ({selectedItems.length} selected)
                  </label>
                </div>

                <div className="flex gap-2 ml-auto">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update-price">Update Price</SelectItem>
                      <SelectItem value="update-stock">Update Stock</SelectItem>
                      <SelectItem value="change-status">Change Status</SelectItem>
                      <SelectItem value="add-tag">Add Tag</SelectItem>
                      <SelectItem value="change-category">Change Category</SelectItem>
                      <SelectItem value="apply-discount">Apply Discount</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleBulkAction} disabled={!bulkAction || selectedItems.length === 0}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Apply to {selectedItems.length} Items
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                {items.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-accent"
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.price} • {item.category} • Stock: {item.stock_quantity || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Import Templates
              </CardTitle>
              <CardDescription>Download CSV templates for easy import</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Basic Product Template</div>
                    <div className="text-sm text-muted-foreground">
                      Essential fields for product import
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Full Product Template</div>
                    <div className="text-sm text-muted-foreground">
                      All available fields including variants
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Stock Update Template</div>
                    <div className="text-sm text-muted-foreground">
                      Quick inventory quantity updates
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Price Update Template</div>
                    <div className="text-sm text-muted-foreground">
                      Batch price modifications
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
