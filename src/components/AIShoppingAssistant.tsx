import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Send, Sparkles, User, Bot, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: ShoppingRecommendation[];
}

interface ShoppingRecommendation {
  item: string;
  reason: string;
  estimatedPrice: string;
  priority: 'high' | 'medium' | 'low';
  budget: string;
}

export function AIShoppingAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI Shopping Assistant. I can help you:\n\n• Find items that match your style\n• Stay within your budget\n• Fill wardrobe gaps\n• Make smart purchase decisions\n• Suggest sustainable alternatives\n\nWhat are you looking to buy today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = (query: string): ShoppingRecommendation[] => {
    // Simulate AI recommendations based on query
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('work') || lowerQuery.includes('office') || lowerQuery.includes('professional')) {
      return [
        {
          item: "Navy Blazer",
          reason: "Essential for professional settings, versatile for multiple occasions",
          estimatedPrice: "$150-250",
          priority: 'high',
          budget: "Investment piece - high ROI"
        },
        {
          item: "White Button-Down Shirt",
          reason: "Classic staple that pairs with everything in your wardrobe",
          estimatedPrice: "$60-100",
          priority: 'high',
          budget: "Essential - worth the investment"
        },
        {
          item: "Black Trousers",
          reason: "Versatile bottom that works for both formal and smart-casual",
          estimatedPrice: "$80-120",
          priority: 'medium',
          budget: "Good value for versatility"
        }
      ];
    } else if (lowerQuery.includes('casual') || lowerQuery.includes('weekend')) {
      return [
        {
          item: "Quality Jeans",
          reason: "Foundation piece for casual wardrobe, high wear frequency",
          estimatedPrice: "$80-150",
          priority: 'high',
          budget: "Investment in comfort"
        },
        {
          item: "Neutral T-Shirts (3 pack)",
          reason: "Basic essentials with high versatility across outfits",
          estimatedPrice: "$50-80",
          priority: 'medium',
          budget: "Cost-effective multiples"
        }
      ];
    } else if (lowerQuery.includes('budget') || lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
      return [
        {
          item: "Basic T-Shirt Bundle",
          reason: "Essential basics at affordable price point",
          estimatedPrice: "$30-50",
          priority: 'high',
          budget: "Budget-friendly essential"
        },
        {
          item: "Versatile Cardigan",
          reason: "Layering piece that extends other items, good cost-per-wear",
          estimatedPrice: "$40-70",
          priority: 'medium',
          budget: "Smart budget choice"
        }
      ];
    } else {
      return [
        {
          item: "Statement Piece (Blazer/Coat)",
          reason: "Based on your style, this will elevate multiple outfits",
          estimatedPrice: "$120-200",
          priority: 'high',
          budget: "Quality investment"
        },
        {
          item: "Accessories Set",
          reason: "Small additions that refresh your existing wardrobe",
          estimatedPrice: "$50-80",
          priority: 'medium',
          budget: "High impact, lower cost"
        }
      ];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const recommendations = generateRecommendations(input);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: `Based on your needs, I've analyzed your style profile and current wardrobe. Here are my personalized recommendations:`,
        recommendations
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add follow-up suggestions
      setTimeout(() => {
        const followUp: Message = {
          role: 'assistant',
          content: "💡 Shopping Tips:\n\n• Check for items in your saved collections first\n• Consider cost-per-wear when investing\n• Look for sustainable brands when possible\n• Wait for quality pieces rather than fast fashion\n\nWould you like more specific recommendations for any category?"
        };
        setMessages(prev => [...prev, followUp]);
      }, 1000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              AI Shopping Assistant
            </CardTitle>
            <CardDescription>Get personalized shopping advice and recommendations</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.recommendations && (
                    <div className="w-full space-y-2 mt-2">
                      {message.recommendations.map((rec, idx) => (
                        <Card key={idx} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">{rec.item}</CardTitle>
                              <Badge variant={
                                rec.priority === 'high' ? 'default' :
                                rec.priority === 'medium' ? 'secondary' : 'outline'
                              }>
                                {rec.priority} priority
                              </Badge>
                            </div>
                            <CardDescription className="text-xs">{rec.reason}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                Price Range
                              </span>
                              <span className="font-medium">{rec.estimatedPrice}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <TrendingUp className="h-3 w-3" />
                              {rec.budget}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask for shopping advice... (e.g., 'I need work clothes under $200')"
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
