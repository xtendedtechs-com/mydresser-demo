import { StreamingAIChat } from "@/components/StreamingAIChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, MessageSquare, Zap, Shield } from "lucide-react";

export default function AIStyleAssistantPage() {
  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Style Assistant
        </h1>
        <p className="text-muted-foreground">
          Chat with your personal AI fashion consultant in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <MessageSquare className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Conversational AI</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Real-time streaming responses that understand your wardrobe and style preferences
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Zap className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Instant Advice</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get immediate styling suggestions, outfit ideas, and fashion guidance as you type
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Shield className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Context Aware</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              AI analyzes your wardrobe items to provide personalized recommendations
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <StreamingAIChat />
    </div>
  );
}
