import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, 
  RefreshCw, ShoppingCart, Target, Award 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MerchantROIDashboard() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ROI Dashboard</h1>
          <p className="text-muted-foreground">Track your profitability improvements with MyDresser</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/merchant/terminal')}>
          Back to Terminal
        </Button>
      </div>

      {/* Key ROI Metric */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated Profit Increase</p>
            <p className="text-5xl font-bold text-primary">+8.3%</p>
          </div>
          <Award className="h-16 w-16 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Through returns reduction and conversion optimization via VTO integration
        </p>
      </Card>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold">32.4%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              +30% vs. industry avg
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">VTO-powered conversion boost</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Return Rate</p>
              <p className="text-3xl font-bold">18.2%</p>
            </div>
            <TrendingDown className="h-8 w-8 text-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              -40% reduction
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">VTO accuracy improvement</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-3xl font-bold">$124</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              +15% increase
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">AI-powered upselling</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Cart Abandonment</p>
              <p className="text-3xl font-bold">42.3%</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-500" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              -25% vs. baseline
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Confidence through VTO</p>
        </Card>
      </div>

      {/* Cost Savings Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Returns Cost Reduction
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Reduction in reverse logistics costs through VTO-powered accurate sizing
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Before MyDresser</p>
                <p className="text-sm text-muted-foreground">Industry average return rate</p>
              </div>
              <p className="text-2xl font-bold text-red-500">30.3%</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium">With MyDresser VTO</p>
                <p className="text-sm text-muted-foreground">VTO-enabled return rate</p>
              </div>
              <p className="text-2xl font-bold text-green-600">18.2%</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Monthly Savings</p>
                <p className="text-2xl font-bold text-primary">$12,450</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on 1,000 monthly orders at $165 AOV
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Rate Lift
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Increased sales through enhanced customer confidence and reduced friction
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Industry Baseline</p>
                <p className="text-sm text-muted-foreground">Standard conversion rate</p>
              </div>
              <p className="text-2xl font-bold text-orange-500">2.5%</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium">With MyDresser VTO</p>
                <p className="text-sm text-muted-foreground">VTO-enhanced conversion</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">3.25%</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Additional Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">$24,750</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on 20,000 monthly visitors
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Strategic Value Proposition */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h2 className="text-xl font-semibold mb-4">MyDresser Strategic Advantages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Integrated PIM/OMS
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Centralized product data</li>
              <li>• Real-time inventory sync</li>
              <li>• Automated vendor onboarding</li>
              <li>• No additional PIM costs</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              AI-Powered Insights
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Demand forecasting</li>
              <li>• Behavioral analytics</li>
              <li>• Pricing optimization</li>
              <li>• Trend prediction</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Network Effects
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Cross-side data loop</li>
              <li>• Quality improvement over time</li>
              <li>• Competitive moat</li>
              <li>• Ecosystem lock-in</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Industry Comparison */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Industry Comparison</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          How MyDresser merchants perform vs. traditional fashion e-commerce
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Metric</th>
                <th className="text-right py-3 px-4">Industry Average</th>
                <th className="text-right py-3 px-4">MyDresser Merchants</th>
                <th className="text-right py-3 px-4">Improvement</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">Conversion Rate</td>
                <td className="text-right py-3 px-4">2.5%</td>
                <td className="text-right py-3 px-4 font-bold">3.25%</td>
                <td className="text-right py-3 px-4 text-green-600 font-bold">+30%</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Return Rate</td>
                <td className="text-right py-3 px-4">30.3%</td>
                <td className="text-right py-3 px-4 font-bold">18.2%</td>
                <td className="text-right py-3 px-4 text-green-600 font-bold">-40%</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Cart Abandonment</td>
                <td className="text-right py-3 px-4">56.4%</td>
                <td className="text-right py-3 px-4 font-bold">42.3%</td>
                <td className="text-right py-3 px-4 text-green-600 font-bold">-25%</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Customer Satisfaction</td>
                <td className="text-right py-3 px-4">78%</td>
                <td className="text-right py-3 px-4 font-bold">91%</td>
                <td className="text-right py-3 px-4 text-green-600 font-bold">+17%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
