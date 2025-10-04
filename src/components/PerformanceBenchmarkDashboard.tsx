import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  Award,
  BarChart3,
  Users,
  DollarSign
} from "lucide-react";

interface BenchmarkMetric {
  metric: string;
  yourValue: number;
  industryAverage: number;
  topPerformers: number;
  unit: string;
  isHigherBetter: boolean;
}

const PerformanceBenchmarkDashboard = () => {
  const benchmarks: BenchmarkMetric[] = [
    {
      metric: "Average Order Value",
      yourValue: 85.86,
      industryAverage: 75.00,
      topPerformers: 120.00,
      unit: "$",
      isHigherBetter: true
    },
    {
      metric: "Conversion Rate",
      yourValue: 3.2,
      industryAverage: 2.5,
      topPerformers: 5.0,
      unit: "%",
      isHigherBetter: true
    },
    {
      metric: "Customer Retention",
      yourValue: 68,
      industryAverage: 60,
      topPerformers: 85,
      unit: "%",
      isHigherBetter: true
    },
    {
      metric: "Response Time",
      yourValue: 2.4,
      industryAverage: 4.0,
      topPerformers: 1.5,
      unit: "hours",
      isHigherBetter: false
    },
    {
      metric: "Items per Order",
      yourValue: 2.8,
      industryAverage: 2.3,
      topPerformers: 4.2,
      unit: "",
      isHigherBetter: true
    },
    {
      metric: "Cart Abandonment",
      yourValue: 65,
      industryAverage: 70,
      topPerformers: 45,
      unit: "%",
      isHigherBetter: false
    }
  ];

  const calculatePerformance = (metric: BenchmarkMetric): {
    percentage: number;
    status: "excellent" | "good" | "average" | "below";
    color: string;
  } => {
    const range = metric.topPerformers - metric.industryAverage;
    let percentage: number;
    
    if (metric.isHigherBetter) {
      percentage = ((metric.yourValue - metric.industryAverage) / range) * 100;
    } else {
      percentage = ((metric.industryAverage - metric.yourValue) / (metric.industryAverage - metric.topPerformers)) * 100;
    }
    
    percentage = Math.max(0, Math.min(100, percentage));
    
    let status: "excellent" | "good" | "average" | "below";
    let color: string;
    
    if (percentage >= 75) {
      status = "excellent";
      color = "text-green-600";
    } else if (percentage >= 50) {
      status = "good";
      color = "text-blue-600";
    } else if (percentage >= 25) {
      status = "average";
      color = "text-yellow-600";
    } else {
      status = "below";
      color = "text-red-600";
    }
    
    return { percentage, status, color };
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: { variant: "default" as const, label: "Excellent" },
      good: { variant: "secondary" as const, label: "Good" },
      average: { variant: "outline" as const, label: "Average" },
      below: { variant: "destructive" as const, label: "Below Average" }
    };
    
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Performance Benchmarks</CardTitle>
          </div>
          <CardDescription>
            Compare your performance against industry standards and top performers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {benchmarks.map((benchmark, index) => {
            const performance = calculatePerformance(benchmark);
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{benchmark.metric}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        You: <span className={`font-semibold ${performance.color}`}>
                          {benchmark.unit === "$" && "$"}
                          {benchmark.yourValue.toFixed(1)}
                          {benchmark.unit === "%" && "%"}
                          {benchmark.unit === "hours" && " hrs"}
                        </span>
                      </span>
                      <span>
                        Industry: {benchmark.unit === "$" && "$"}
                        {benchmark.industryAverage.toFixed(1)}
                        {benchmark.unit === "%" && "%"}
                        {benchmark.unit === "hours" && " hrs"}
                      </span>
                      <span>
                        Top: {benchmark.unit === "$" && "$"}
                        {benchmark.topPerformers.toFixed(1)}
                        {benchmark.unit === "%" && "%"}
                        {benchmark.unit === "hours" && " hrs"}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(performance.status)}
                </div>
                
                <div className="space-y-2">
                  <Progress value={performance.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    You're performing at {performance.percentage.toFixed(0)}% towards top performer level
                  </p>
                </div>
              </div>
            );
          })}

          {/* Overall Score */}
          <Card className="bg-primary/5 border-primary/20 mt-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Overall Performance Score</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on your performance across all metrics
                  </p>
                  <div className="flex items-center gap-3">
                    <Progress value={72} className="h-3 flex-1" />
                    <span className="text-2xl font-bold text-primary">72%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You're outperforming 68% of businesses in your category
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

export default PerformanceBenchmarkDashboard;
