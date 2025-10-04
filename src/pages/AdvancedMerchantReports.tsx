import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Download,
  BarChart3,
  Clock,
  DollarSign,
  ShoppingCart,
  Users,
  Package
} from "lucide-react";
import { ReportBuilder } from "@/components/ReportBuilder";
import { ScheduledReportsManager } from "@/components/ScheduledReportsManager";
import { useMerchantAnalytics } from "@/hooks/useMerchantAnalytics";

const AdvancedMerchantReports = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const { analytics, isLoading } = useMerchantAnalytics();

  const reportTemplates = [
    {
      id: "sales",
      name: "Sales Performance Report",
      description: "Comprehensive sales analytics with trends and forecasts",
      icon: DollarSign,
      metrics: ["revenue", "orders", "average_order_value"],
      color: "green"
    },
    {
      id: "inventory",
      name: "Inventory Analysis Report",
      description: "Stock levels, turnover rates, and reorder recommendations",
      icon: Package,
      metrics: ["stock_levels", "turnover", "low_stock_alerts"],
      color: "blue"
    },
    {
      id: "customers",
      name: "Customer Insights Report",
      description: "Customer behavior, retention, and lifetime value analysis",
      icon: Users,
      metrics: ["customer_count", "retention_rate", "lifetime_value"],
      color: "purple"
    },
    {
      id: "products",
      name: "Product Performance Report",
      description: "Best sellers, trending items, and category analysis",
      icon: ShoppingCart,
      metrics: ["top_products", "category_revenue", "trends"],
      color: "orange"
    }
  ];

  const recentReports = [
    {
      id: "1",
      name: "Monthly Sales Report - November 2025",
      type: "sales",
      generated: "2025-11-01T10:00:00Z",
      size: "2.4 MB",
      format: "PDF"
    },
    {
      id: "2",
      name: "Q3 Inventory Analysis",
      type: "inventory",
      generated: "2025-10-15T14:30:00Z",
      size: "1.8 MB",
      format: "Excel"
    },
    {
      id: "3",
      name: "Customer Retention Report",
      type: "customers",
      generated: "2025-10-10T09:00:00Z",
      size: "1.2 MB",
      format: "PDF"
    }
  ];

  const quickStats = [
    {
      label: "Reports Generated",
      value: "47",
      trend: "+12%",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      label: "Scheduled Reports",
      value: "8",
      trend: "Active",
      icon: Clock,
      color: "text-green-600"
    },
    {
      label: "Data Points",
      value: "12.5K",
      trend: "+8%",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      label: "Avg Generation Time",
      value: "3.2s",
      trend: "-15%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Advanced Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Generate comprehensive reports and schedule automated insights
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics Dashboard</span>
            </Badge>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <Badge variant="outline" className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>

          {/* Generate Report Tab */}
          <TabsContent value="generate" className="space-y-6 mt-6">
            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>
                  Start with pre-configured templates for common reporting needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 bg-${template.color}-500/10 rounded-lg`}>
                              <template.icon className={`w-6 h-6 text-${template.color}-600`} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{template.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1">
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Now
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Report Builder */}
            <ReportBuilder />
          </TabsContent>

          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled" className="mt-6">
            <ScheduledReportsManager />
          </TabsContent>

          {/* Report History Tab */}
          <TabsContent value="history" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  View and download previously generated reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-semibold">{report.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Generated {new Date(report.generated).toLocaleDateString()} • {report.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.format}</Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {recentReports.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No reports generated yet</p>
                    <Button className="mt-4" onClick={() => setActiveTab("generate")}>
                      Generate Your First Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedMerchantReports;
