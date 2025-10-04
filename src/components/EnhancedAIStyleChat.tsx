import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Send, Loader2, Paperclip, Image as ImageIcon, Shirt, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useOutfits } from '@/hooks/useOutfits';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Array<{
    type: 'image' | 'items' | 'outfit' | 'wardrobe';
    data: any;
  }>;
}

export const EnhancedAIStyleChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Style Consultant. I can help you create amazing outfits, give fashion advice, and make the most of your wardrobe. You can attach photos, share wardrobe items, or outfits for personalized advice!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { items } = useWardrobe();
  const { outfits } = useOutfits();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildWardrobeContext = () => {
    let context = '';
    
    if (selectedItems.length > 0) {
      const itemDetails = items?.filter(i => selectedItems.includes(i.id))
        .map(i => `${i.name} (${i.category}, ${i.color || 'no color'}, ${i.brand || 'no brand'})`)
        .join(', ');
      context += `Selected items: ${itemDetails}. `;
    }
    
    if (selectedOutfit) {
      const outfit = outfits?.find(o => o.id === selectedOutfit);
      if (outfit) {
        context += `Selected outfit: ${outfit.name}. `;
      }
    }
    
    if (items && items.length > 0) {
      context += `User's full wardrobe has ${items.length} items: ${items.slice(0, 10).map(i => `${i.name} (${i.category})`).join(', ')}${items.length > 10 ? '...' : ''}`;
    } else {
      context += 'User has not added items to their wardrobe yet.';
    }
    
    return context;
  };

  const streamChat = async (userMessage: string, attachments?: any[]) => {
    const wardrobeContext = buildWardrobeContext();

    try {
      const response = await fetch('https://bdfyrtobxkwxobjspxjo.supabase.co/functions/v1/ai-style-consultant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZnlydG9ieGt3eG9ianNweGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjU3NzEsImV4cCI6MjA3MzM0MTc3MX0.Ck8RUCFUdezGr46gj_4caj-kBegzp_O7nzqR0AelCmc',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          wardrobeContext,
          attachments
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI credits depleted. Please add credits to continue.');
        }
        throw new Error('Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantContent
                };
                return newMessages;
              });
            }
          } catch (e) {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage && selectedItems.length === 0 && !selectedOutfit) || isLoading) return;

    const userMessage = input.trim() || 'Help me with this...';
    const attachments: any[] = [];
    
    if (selectedImage) {
      attachments.push({ type: 'image', data: selectedImage.name });
    }
    if (selectedItems.length > 0) {
      attachments.push({ type: 'items', data: selectedItems });
    }
    if (selectedOutfit) {
      attachments.push({ type: 'outfit', data: selectedOutfit });
    }

    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      attachments: attachments.length > 0 ? attachments : undefined
    }]);
    setIsLoading(true);

    // Clear selections
    setSelectedImage(null);
    setSelectedItems([]);
    setSelectedOutfit(null);

    try {
      await streamChat(userMessage, attachments);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      toast({
        title: 'Image attached',
        description: file.name
      });
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <>
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Style Consultant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 p-4">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.attachments && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.attachments.map((att, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {att.type === 'image' && <ImageIcon className="w-3 h-3 mr-1" />}
                            {att.type === 'items' && <Shirt className="w-3 h-3 mr-1" />}
                            {att.type === 'outfit' && <Package className="w-3 h-3 mr-1" />}
                            {att.type === 'wardrobe' && <Package className="w-3 h-3 mr-1" />}
                            {att.type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Attachment Preview */}
          {(selectedImage || selectedItems.length > 0 || selectedOutfit) && (
            <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded">
              {selectedImage && (
                <Badge variant="secondary">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  {selectedImage.name}
                </Badge>
              )}
              {selectedItems.length > 0 && (
                <Badge variant="secondary">
                  <Shirt className="w-3 h-3 mr-1" />
                  {selectedItems.length} item(s)
                </Badge>
              )}
              {selectedOutfit && (
                <Badge variant="secondary">
                  <Package className="w-3 h-3 mr-1" />
                  Outfit
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAttachDialog(true)}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Ask me about style, outfits, or fashion advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attachment Dialog */}
      <Dialog open={showAttachDialog} onOpenChange={setShowAttachDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Attach to Chat</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="photo">Photo</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="outfit">Outfit</TabsTrigger>
              <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload a photo for AI analysis</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>
              <Button onClick={() => setShowAttachDialog(false)} className="w-full">
                Done
              </Button>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 gap-2">
                  {items?.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border rounded cursor-pointer transition ${
                        selectedItems.includes(item.id) ? 'border-primary bg-primary/10' : ''
                      }`}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button onClick={() => setShowAttachDialog(false)} className="w-full">
                Attach {selectedItems.length} item(s)
              </Button>
            </TabsContent>

            <TabsContent value="outfit" className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {outfits?.map((outfit) => (
                    <div
                      key={outfit.id}
                      className={`p-3 border rounded cursor-pointer transition ${
                        selectedOutfit === outfit.id ? 'border-primary bg-primary/10' : ''
                      }`}
                      onClick={() => setSelectedOutfit(outfit.id)}
                    >
                      <div className="font-medium">{outfit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {outfit.occasion} • {outfit.season}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button onClick={() => setShowAttachDialog(false)} className="w-full">
                Attach Outfit
              </Button>
            </TabsContent>

            <TabsContent value="wardrobe" className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Share your entire wardrobe with AI for comprehensive style analysis.
                </p>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Your Wardrobe:</div>
                  <div className="text-sm text-muted-foreground">
                    {items?.length || 0} items
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => {
                  toast({ title: 'Wardrobe attached', description: 'AI will analyze your full wardrobe' });
                  setShowAttachDialog(false);
                }} 
                className="w-full"
              >
                Attach Full Wardrobe
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};