import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Send, User, Bot, TrendingUp, Shirt } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RateLimit {
  allowed: boolean;
  current_usage: number;
  limit: number;
  reset_at: string;
}

export default function StyleAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
    checkRateLimit();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_style_sessions' as any)
        .insert({
          user_id: user.id,
          session_type: 'style_advice',
          is_active: true
        })
        .select()
        .single() as any;

      if (error) throw error;
      setSessionId(data.id);

      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm your AI style assistant. I can help you with outfit suggestions, style advice, wardrobe organization, and fashion trends. What would you like to know?",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const checkRateLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('check_ai_rate_limit' as any, {
          p_user_id: user.id,
          p_service_type: 'chat'
        }) as any;

      if (error) throw error;
      setRateLimit(data);
    } catch (error) {
      console.error('Failed to check rate limit:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !sessionId) return;

    if (rateLimit && !rateLimit.allowed) {
      toast({
        title: "Rate Limit Reached",
        description: `You've reached your daily limit of ${rateLimit.limit} messages. Reset at ${new Date(rateLimit.reset_at).toLocaleTimeString()}`,
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call AI style chat edge function
      const { data, error } = await supabase.functions.invoke('ai-style-chat', {
        body: {
          message: input,
          session_id: sessionId,
          conversation_history: messages
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update session
      await supabase
        .from('ai_style_sessions' as any)
        .update({
          conversation_history: [...messages, userMessage, assistantMessage],
          total_messages: messages.length + 2
        })
        .eq('id', sessionId) as any;

      // Check rate limit again
      await checkRateLimit();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Suggest an outfit', icon: Shirt, prompt: 'Can you suggest an outfit for today?' },
    { label: 'Wardrobe analysis', icon: TrendingUp, prompt: 'Analyze my wardrobe and give me insights' },
    { label: 'Color advice', icon: Sparkles, prompt: 'What colors work best for my style?' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              AI Style Assistant
            </h1>
            <p className="text-muted-foreground mt-1">
              Your personal fashion advisor powered by AI
            </p>
          </div>
          {rateLimit && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Daily Messages</p>
              <p className="text-lg font-semibold">
                {rateLimit.current_usage} / {rateLimit.limit}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => {
                setInput(action.prompt);
                sendMessage();
              }}
              disabled={loading}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Chat Messages */}
        <Card className="p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about style, fashion, or your wardrobe..."
            disabled={loading || (rateLimit && !rateLimit.allowed)}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading || (rateLimit && !rateLimit.allowed)}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {rateLimit && !rateLimit.allowed && (
          <p className="text-sm text-muted-foreground text-center">
            Daily message limit reached. Resets at {new Date(rateLimit.reset_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
