import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface PredictionData {
  metric: string;
  current: number;
  predicted: number;
  change: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

interface AdvancedPredictiveAnalyticsProps {
  type: 'user' | 'merchant';
  timeframe?: '7d' | '30d' | '90d';
}

export const AdvancedPredictiveAnalytics = ({ type, timeframe = '30d' }: AdvancedPredictiveAnalyticsProps) => {
  // Mock predictive data - in production, this would come from AI edge function
  const predictions: PredictionData[] = type === 'merchant' ? [
    {
      metric: 'Sales Revenue',
      current: 45250,
      predicted: 52800,
      change: 16.7,
      confidence: 87,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      metric: 'Customer Growth',
      current: 342,
      predicted: 421,
      change: 23.1,
      confidence: 82,
      trend: 'up',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      metric: 'Inventory Turnover',
      current: 4.2,
      predicted: 5.1,
      change: 21.4,
      confidence: 78,
      trend: 'up',
      icon: Package,
      color: 'text-purple-500'
    },
    {
      metric: 'Average Order Value',
      current: 132,
      predicted: 148,
      change: 12.1,
      confidence: 85,
      trend: 'up',
      icon: Target,
      color: 'text-orange-500'
    }
  ] : [
    {
      metric: 'Wardrobe Utilization',
      current: 67,
      predicted: 78,
      change: 16.4,
      confidence: 89,
      trend: 'up',
      icon: Package,
      color: 'text-green-500'
    },
    {
      metric: 'Style Score',
      current: 72,
      predicted: 85,
      change: 18.1,
      confidence: 84,
      trend: 'up',
      icon: Sparkles,
      color: 'text-purple-500'
    },
    {
      metric: 'Cost Per Wear',
      current: 8.5,
      predicted: 6.2,
      change: -27.1,
      confidence: 81,
      trend: 'down',
      icon: DollarSign,
      color: 'text-blue-500'
    },
    {
      metric: 'Sustainability Score',
      current: 65,
      predicted: 82,
      change: 26.2,
      confidence: 76,
      trend: 'up',
      icon: Target,
      color: 'text-green-500'
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <div className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Predictive Analytics
          </h2>
          <p className="text-muted-foreground">
            AI-powered predictions for the next {timeframe === '7d' ? '7 days' : timeframe === '30d' ? '30 days' : '90 days'}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Powered by AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction) => {
          const Icon = prediction.icon;
          const isPositiveChange = prediction.trend === 'up' || (prediction.trend === 'down' && prediction.metric === 'Cost Per Wear');
          
          return (
            <Card key={prediction.metric} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${prediction.color}`} />
                    <CardTitle className="text-base">{prediction.metric}</CardTitle>
                  </div>
                  {getTrendIcon(prediction.trend)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold">
                      {prediction.metric.includes('$') || prediction.metric.includes('Revenue') || prediction.metric.includes('Value') || prediction.metric.includes('Cost') 
                        ? `$${prediction.current.toLocaleString()}` 
                        : prediction.current}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Predicted</p>
                    <p className={`text-2xl font-bold ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                      {prediction.metric.includes('$') || prediction.metric.includes('Revenue') || prediction.metric.includes('Value') || prediction.metric.includes('Cost')
                        ? `$${prediction.predicted.toLocaleString()}` 
                        : prediction.predicted}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Change</span>
                    <span className={`font-medium ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                      {prediction.change > 0 ? '+' : ''}{prediction.change.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">AI Confidence</span>
                      <span className={`font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence}%
                      </span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>
                </div>

                {prediction.confidence >= 85 ? (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                    <CheckCircle className="w-3 h-3" />
                    High confidence prediction
                  </div>
                ) : prediction.confidence < 70 ? (
                  <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Lower confidence - monitor trends
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Key Insights & Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated recommendations based on predictive analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {type === 'merchant' ? (
              <>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Revenue Growth Opportunity</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Peak sales predicted in next 2 weeks. Consider increasing inventory for high-demand items.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <Users className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Customer Retention Strategy</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      23% customer growth expected. Implement loyalty program to maximize retention.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <Package className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Inventory Optimization</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Faster turnover predicted. Reduce slow-moving items and focus on bestsellers.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <Package className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Wardrobe Optimization</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      16% improvement in utilization expected. Focus on versatile pieces to maximize outfit combinations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Cost Efficiency Gains</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      27% reduction in cost-per-wear predicted. Your wardrobe investments are becoming more efficient.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Style Evolution</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      18% style score increase expected. Your fashion choices are aligning well with current trends.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
