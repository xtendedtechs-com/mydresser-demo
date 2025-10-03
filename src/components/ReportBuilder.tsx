import { useState } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ReportConfig {
  name: string;
  type: 'wardrobe' | 'marketplace' | 'financial' | 'analytics' | 'sustainability';
  dateRange: { from: Date; to: Date };
  metrics: string[];
  format: 'pdf' | 'csv' | 'json' | 'excel';
  filters: Record<string, any>;
}

export const ReportBuilder = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    type: 'wardrobe',
    dateRange: { from: new Date(), to: new Date() },
    metrics: [],
    format: 'pdf',
    filters: {},
  });

  const reportTypes = [
    { value: 'wardrobe', label: 'Wardrobe Analytics', icon: BarChart3 },
    { value: 'marketplace', label: 'Marketplace Performance', icon: TrendingUp },
    { value: 'financial', label: 'Financial Report', icon: FileText },
    { value: 'analytics', label: 'User Analytics', icon: BarChart3 },
    { value: 'sustainability', label: 'Sustainability Impact', icon: TrendingUp },
  ];

  const availableMetrics = {
    wardrobe: [
      'Total Items',
      'Items by Category',
      'Cost per Wear',
      'Utilization Rate',
      'Items Added/Removed',
      'Most Worn Items',
    ],
    marketplace: [
      'Total Sales',
      'Revenue',
      'Active Listings',
      'Sold Items',
      'Average Price',
      'Top Selling Categories',
    ],
    financial: [
      'Total Revenue',
      'Total Expenses',
      'Net Profit',
      'Transaction Volume',
      'Payment Methods',
      'Refunds',
    ],
    analytics: [
      'Active Users',
      'User Growth',
      'Engagement Rate',
      'Session Duration',
      'Popular Features',
      'Retention Rate',
    ],
    sustainability: [
      'CO2 Savings',
      'Water Conservation',
      'Textile Waste Reduced',
      'Items Reused',
      'Sustainability Score',
      'Environmental Impact',
    ],
  };

  const handleMetricToggle = (metric: string) => {
    setConfig({
      ...config,
      metrics: config.metrics.includes(metric)
        ? config.metrics.filter(m => m !== metric)
        : [...config.metrics, metric],
    });
  };

  const handleGenerateReport = () => {
    if (!config.name || config.metrics.length === 0) {
      toast({
        title: 'Incomplete Configuration',
        description: 'Please provide a report name and select at least one metric',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Report Generated',
      description: `Your ${config.type} report "${config.name}" is being generated`,
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: 'Report Ready',
        description: `Your report is ready for download in ${config.format.toUpperCase()} format`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Configure and generate custom reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              placeholder="Enter report name..."
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
            />
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map((type) => (
                <Card
                  key={type.value}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    config.type === type.value && 'border-primary bg-primary/5'
                  )}
                  onClick={() => setConfig({ ...config, type: type.value as any, metrics: [] })}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <type.icon className="h-5 w-5" />
                    <span className="font-medium">{type.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(config.dateRange.from, 'PP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={config.dateRange.from}
                    onSelect={(date) => date && setConfig({ ...config, dateRange: { ...config.dateRange, from: date } })}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>

              <span className="flex items-center">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(config.dateRange.to, 'PP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={config.dateRange.to}
                    onSelect={(date) => date && setConfig({ ...config, dateRange: { ...config.dateRange, to: date } })}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Metrics Selection */}
          <div className="space-y-2">
            <Label>Metrics to Include</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableMetrics[config.type]?.map((metric) => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric}
                    checked={config.metrics.includes(metric)}
                    onCheckedChange={() => handleMetricToggle(metric)}
                  />
                  <Label htmlFor={metric} className="cursor-pointer">
                    {metric}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={config.format} onValueChange={(val: any) => setConfig({ ...config, format: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
                <SelectItem value="excel">Excel Workbook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button onClick={handleGenerateReport} className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
          <CardDescription>Pre-configured reports for common needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'Monthly Wardrobe Summary', type: 'wardrobe', badge: 'Popular' },
              { name: 'Sales Performance', type: 'marketplace', badge: 'Trending' },
              { name: 'Financial Overview', type: 'financial', badge: null },
              { name: 'Sustainability Report', type: 'sustainability', badge: 'New' },
            ].map((report) => (
              <Card key={report.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{report.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{report.type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {report.badge && <Badge variant="secondary">{report.badge}</Badge>}
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
