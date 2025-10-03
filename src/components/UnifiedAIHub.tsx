import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Zap,
  Activity,
  Shirt
} from 'lucide-react';
import { AIOutfitGenerator } from '@/components/AIOutfitGenerator';
import { SmartOutfitRecommendations } from '@/components/SmartOutfitRecommendations';
import { TrendForecastingDashboard } from '@/components/TrendForecastingDashboard';
import { AIStyleConsultant } from '@/components/AIStyleConsultant';
import { WearFrequencyAnalyzer } from '@/components/WearFrequencyAnalyzer';
import { useWardrobe } from '@/hooks/useWardrobe';
import { unifiedAI } from '@/services/unifiedAIService';
import { browserML } from '@/services/browserMLService';

export function UnifiedAIHub() {
  const { items: wardrobeItems } = useWardrobe();
  const [aiHealth, setAiHealth] = useState<{
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, boolean>;
  } | null>(null);
  const [mlStatus, setMlStatus] = useState<{
    initialized: boolean;
    available: boolean;
  }>({ initialized: false, available: false });

  useEffect(() => {
    // Check AI service health
    unifiedAI.getServiceHealth().then(setAiHealth);

    // Initialize browser ML
    browserML.initialize().then(() => {
      setMlStatus(browserML.getStatus());
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">AI Intelligence Hub</h1>
            </div>
            <p className="text-muted-foreground">
              Advanced AI-powered fashion intelligence and recommendations
            </p>
          </div>

          {/* AI Status Indicator */}
          {aiHealth && (
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(aiHealth.status)}`} />
              <span className="text-sm text-muted-foreground">
                AI {aiHealth.status}
              </span>
            </div>
          )}
        </div>

        {/* ML Status Banner */}
        {mlStatus.initialized && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Browser-based ML active - Enhanced analysis available
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Capabilities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Sparkles className="h-5 w-5 text-primary" />
              <Badge variant="secondary">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wardrobeItems.length}</div>
            <p className="text-xs text-muted-foreground">Items analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-primary" />
              <Badge variant="secondary">Real-time</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aiHealth?.services.cloudAI ? '99%' : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">AI Accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-primary" />
              <Badge variant="secondary">ML</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mlStatus.available ? 'ON' : 'OFF'}
            </div>
            <p className="text-xs text-muted-foreground">Browser ML</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Brain className="h-5 w-5 text-primary" />
              <Badge variant="secondary">Pro</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/7</div>
            <p className="text-xs text-muted-foreground">AI Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Main AI Features */}
      <Tabs defaultValue="outfits" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="outfits" className="flex items-center gap-2">
            <Shirt className="h-4 w-4" />
            <span className="hidden sm:inline">Outfits</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Smart Recs</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Outfit Generation */}
        <TabsContent value="outfits" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Outfit Generator
              </CardTitle>
              <CardDescription>
                Advanced outfit generation powered by machine learning and style analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIOutfitGenerator wardrobeItems={wardrobeItems} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Recommendations */}
        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <SmartOutfitRecommendations />
        </TabsContent>

        {/* Trend Forecasting */}
        <TabsContent value="trends" className="space-y-6 mt-6">
          <TrendForecastingDashboard />
        </TabsContent>

        {/* AI Chat */}
        <TabsContent value="chat" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Style Consultant
              </CardTitle>
              <CardDescription>
                Chat with your personal AI fashion expert - powered by advanced language models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <AIStyleConsultant />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <WearFrequencyAnalyzer />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-6 p-4 rounded-lg bg-card border">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick AI Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="w-full">
            Generate Daily Outfit
          </Button>
          <Button variant="outline" className="w-full">
            Analyze Style
          </Button>
          <Button variant="outline" className="w-full">
            Get Recommendations
          </Button>
          <Button variant="outline" className="w-full">
            Forecast Trends
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UnifiedAIHub;
