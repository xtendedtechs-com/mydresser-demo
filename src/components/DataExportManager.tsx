import { useState } from 'react';
import { Download, FileText, Database, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ExportHistory {
  id: string;
  name: string;
  type: string;
  format: string;
  status: 'completed' | 'processing' | 'failed';
  size: string;
  created_at: string;
}

export const DataExportManager = () => {
  const { toast } = useToast();
  const [exportType, setExportType] = useState('all');
  const [format, setFormat] = useState('json');
  const [includeImages, setIncludeImages] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportHistory: ExportHistory[] = [
    {
      id: '1',
      name: 'Wardrobe Data Export',
      type: 'wardrobe',
      format: 'json',
      status: 'completed',
      size: '2.4 MB',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      name: 'Transaction History',
      type: 'marketplace',
      format: 'csv',
      status: 'completed',
      size: '1.1 MB',
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const exportOptions = [
    { value: 'all', label: 'All Data', description: 'Complete data export including all features' },
    { value: 'wardrobe', label: 'Wardrobe Data', description: 'All clothing items and outfit history' },
    { value: 'marketplace', label: 'Marketplace Data', description: 'Listings, transactions, and reviews' },
    { value: 'social', label: 'Social Data', description: 'Posts, followers, and interactions' },
    { value: 'profile', label: 'Profile Data', description: 'Personal information and preferences' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          toast({
            title: 'Export Complete',
            description: `Your ${exportType} data has been exported successfully`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const getStatusIcon = (status: ExportHistory['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ExportHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download your data in various formats for backup or portability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-2">
            <Label>What to Export</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'json', label: 'JSON', icon: FileText },
                { value: 'csv', label: 'CSV', icon: FileText },
                { value: 'xml', label: 'XML', icon: FileText },
                { value: 'zip', label: 'ZIP Archive', icon: Database },
              ].map((fmt) => (
                <Card
                  key={fmt.value}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    format === fmt.value && 'border-primary bg-primary/5'
                  )}
                  onClick={() => setFormat(fmt.value)}
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <fmt.icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{fmt.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label>Additional Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-images"
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
              />
              <Label htmlFor="include-images" className="cursor-pointer">
                Include images and media files
              </Label>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exporting data...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Your data will be prepared and downloaded to your device. Large exports may take a few minutes.
          </p>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>View and download your previous exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportHistory.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Database className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{item.name}</h3>
                          <Badge variant={getStatusColor(item.status)}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1 capitalize">{item.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="capitalize">{item.type}</span>
                          <span>•</span>
                          <span className="uppercase">{item.format}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {item.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {exportHistory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No export history yet</p>
                <p className="text-sm">Your exports will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GDPR Notice */}
      <Card className="border-primary/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Data Privacy Rights</p>
              <p className="text-muted-foreground">
                You have the right to access, export, and delete your personal data at any time.
                Exports include all data associated with your account in compliance with GDPR and CCPA regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
