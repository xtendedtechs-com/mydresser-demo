import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingBag, 
  DollarSign,
  BarChart3,
  Activity,
  Calendar,
  Download
} from "lucide-react";

interface MetricComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  unit: string;
}

interface ComparisonPeriod {
  label: string;
  value: string;
}

const COMPARISON_PERIODS: ComparisonPeriod[] = [
  { label: "Last 7 days vs Previous 7 days", value: "7d" },
  { label: "Last 30 days vs Previous 30 days", value: "30d" },
  { label: "This month vs Last month", value: "month" },
  { label: "This quarter vs Last quarter", value: "quarter" },
  { label: "This year vs Last year", value: "year" },
];

const ComparativeAnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [comparisonType, setComparisonType] = useState<"overview" | "detailed">("overview");

  // Mock data - in production, fetch from API based on selectedPeriod
  const overviewMetrics: MetricComparison[] = [
    {
      metric: "Total Revenue",
      current: 12450,
      previous: 9800,
      change: 2650,
      changePercent: 27.04,
      unit: "$"
    },
    {
      metric: "Total Orders",
      current: 145,
      previous: 128,
      change: 17,
      changePercent: 13.28,
      unit: ""
    },
    {
      metric: "New Customers",
      current: 23,
      previous: 18,
      change: 5,
      changePercent: 27.78,
      unit: ""
    },
    {
      metric: "Average Order Value",
      current: 85.86,
      previous: 76.56,
      change: 9.30,
      changePercent: 12.15,
      unit: "$"
    },
    {
      metric: "Items Sold",
      current: 289,
      previous: 245,
      change: 44,
      changePercent: 17.96,
      unit: ""
    },
    {
      metric: "Conversion Rate",
      current: 3.2,
      previous: 2.8,
      change: 0.4,
      changePercent: 14.29,
      unit: "%"
    }
  ];

  const wardrobeMetrics: MetricComparison[] = [
    {
      metric: "Items Added",
      current: 24,
      previous: 18,
      change: 6,
      changePercent: 33.33,
      unit: ""
    },
    {
      metric: "Outfits Created",
      current: 35,
      previous: 28,
      change: 7,
      changePercent: 25.0,
      unit: ""
    },
    {
      metric: "AI Suggestions Used",
      current: 67,
      previous: 52,
      change: 15,
      changePercent: 28.85,
      unit: ""
    },
    {
      metric: "Wardrobe Value",
      current: 2450,
      previous: 2180,
      change: 270,
      changePercent: 12.39,
      unit: "$"
    }
  ];

  const renderMetricCard = (metric: MetricComparison) => {
    const isPositive = metric.change > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <Card key={metric.metric}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                {metric.metric}
              </h4>
              <Badge 
                variant={isPositive ? "default" : "destructive"}
                className="text-xs"
              >
                <TrendIcon className="w-3 h-3 mr-1" />
                {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {metric.unit === "$" && "$"}
                {metric.current.toLocaleString()}
                {metric.unit === "%" && "%"}
              </div>
              <div className="text-xs text-muted-foreground">
                Previous: {metric.unit === "$" && "$"}
                {metric.previous.toLocaleString()}
                {metric.unit === "%" && "%"}
              </div>
            </div>
            
            <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {metric.unit === "$" && "$"}
              {Math.abs(metric.change).toLocaleString()}
              {metric.unit === "%" && "%"}
              {" "}from previous period
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const exportReport = () => {
    // Create CSV data
    const csvData = [
      ["Metric", "Current", "Previous", "Change", "Change %"],
      ...overviewMetrics.map(m => [
        m.metric,
        `${m.unit === "$" ? "$" : ""}${m.current}${m.unit === "%" ? "%" : ""}`,
        `${m.unit === "$" ? "$" : ""}${m.previous}${m.unit === "%" ? "%" : ""}`,
        `${m.change > 0 ? "+" : ""}${m.unit === "$" ? "$" : ""}${m.change}${m.unit === "%" ? "%" : ""}`,
        `${m.changePercent > 0 ? "+" : ""}${m.changePercent.toFixed(2)}%`
      ])
    ];
    
    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comparative-analytics-${selectedPeriod}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle>Comparative Analytics</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Compare performance metrics across different time periods
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Compare:</span>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPARISON_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="business">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Business Metrics
              </TabsTrigger>
              <TabsTrigger value="wardrobe">
                <Activity className="w-4 h-4 mr-2" />
                Wardrobe Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overviewMetrics.map(renderMetricCard)}
              </div>
            </TabsContent>

            <TabsContent value="wardrobe" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {wardrobeMetrics.map(renderMetricCard)}
              </div>
            </TabsContent>
          </Tabs>

          {/* Summary Insight */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Overall Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Your metrics show a positive trend compared to the previous period. 
                    Revenue increased by 27%, with strong growth in new customers (+28%) 
                    and conversion rate (+14%).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparativeAnalyticsDashboard;
