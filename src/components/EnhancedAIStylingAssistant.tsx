import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  MessageSquare, 
  Wand2, 
  TrendingUp, 
  Palette,
  Loader2,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const EnhancedAIStylingAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI styling assistant. I can help you with outfit suggestions, trend analysis, color coordination, and personal style advice. What would you like to explore today?",
      timestamp: new Date(),
      suggestions: [
        "Suggest an outfit for a date night",
        "What's trending this season?",
        "Help me define my style",
        "Colors that suit me"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-style-chat', {
        body: { 
          message: messageText,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm here to help with your style questions!",
        timestamp: new Date(),
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStyleAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-style-consultant', {
        body: { 
          analysisType: 'comprehensive',
          includeColorAnalysis: true,
          includeTrendForecasting: true
        }
      });

      if (error) throw error;

      const analysisMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.analysis || "Here's your personalized style analysis...",
        timestamp: new Date(),
        suggestions: data.recommendations
      };

      setMessages(prev => [...prev, analysisMessage]);
    } catch (error) {
      console.error('Style analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to generate style analysis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendForecast = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trend-analysis', {
        body: { 
          analysisType: 'forecast',
          timeframe: 'upcoming_season'
        }
      });

      if (error) throw error;

      const trendMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.forecast || "Here are the upcoming trends...",
        timestamp: new Date(),
        suggestions: data.actionable_tips
      };

      setMessages(prev => [...prev, trendMessage]);
    } catch (error) {
      console.error('Trend forecast error:', error);
      toast({
        title: "Error",
        description: "Failed to get trend forecast",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Styling Assistant
          </h2>
          <p className="text-muted-foreground">Your personal AI fashion advisor</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="analysis">Style Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trend Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4 mt-4">
          {/* Chat Messages */}
          <Card className="p-4 h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs opacity-70">Quick actions:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => sendMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Chat Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask me anything about fashion, style, or outfits..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              className="min-h-[60px]"
            />
            <Button 
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <Palette className="w-16 h-16 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Comprehensive Style Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered insights about your personal style, color palette, and wardrobe composition
                </p>
              </div>
              <Button onClick={getStyleAnalysis} disabled={isLoading} size="lg">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Generate Analysis
              </Button>
            </div>
          </Card>

          {/* Show latest analysis in messages */}
          {messages.filter(m => m.role === 'assistant' && m.content.includes('analysis')).length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Latest Analysis</h4>
              <div className="prose prose-sm max-w-none">
                {messages.filter(m => m.role === 'assistant' && m.content.includes('analysis')).slice(-1)[0].content}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <TrendingUp className="w-16 h-16 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Fashion Trend Forecast</h3>
                <p className="text-sm text-muted-foreground">
                  Discover upcoming fashion trends, colors, and styles powered by AI analysis
                </p>
              </div>
              <Button onClick={getTrendForecast} disabled={isLoading} size="lg">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Get Trend Forecast
              </Button>
            </div>
          </Card>

          {/* Show latest forecast */}
          {messages.filter(m => m.role === 'assistant' && m.content.includes('trend')).length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Latest Forecast</h4>
              <div className="prose prose-sm max-w-none">
                {messages.filter(m => m.role === 'assistant' && m.content.includes('trend')).slice(-1)[0].content}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIStylingAssistant;
