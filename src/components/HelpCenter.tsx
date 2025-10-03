import { useState } from 'react';
import { Search, BookOpen, Video, MessageCircle, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpful: number;
  views: number;
}

interface Video {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  views: number;
}

export const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = [
    { name: 'Getting Started', icon: BookOpen, count: 12 },
    { name: 'Wardrobe Management', icon: BookOpen, count: 18 },
    { name: 'AI Features', icon: BookOpen, count: 15 },
    { name: 'Marketplace', icon: BookOpen, count: 10 },
    { name: 'Account & Billing', icon: BookOpen, count: 8 },
  ];

  const popularArticles: Article[] = [
    {
      id: '1',
      title: 'How to add items to your wardrobe',
      category: 'Getting Started',
      content: 'Learn how to quickly add clothing items to your digital wardrobe...',
      helpful: 245,
      views: 1250,
    },
    {
      id: '2',
      title: 'Using the AI outfit generator',
      category: 'AI Features',
      content: 'Discover how our AI creates perfect outfit combinations...',
      helpful: 198,
      views: 980,
    },
    {
      id: '3',
      title: 'Selling items on 2ndDresser marketplace',
      category: 'Marketplace',
      content: 'Step-by-step guide to list and sell your unused items...',
      helpful: 167,
      views: 745,
    },
  ];

  const videos: Video[] = [
    { id: '1', title: 'Getting Started with MyDresser', duration: '5:30', thumbnail: '/placeholder.svg', views: 2500 },
    { id: '2', title: 'AI Style Consultant Tutorial', duration: '8:15', thumbnail: '/placeholder.svg', views: 1800 },
    { id: '3', title: 'Wardrobe Organization Tips', duration: '6:45', thumbnail: '/placeholder.svg', views: 1600 },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to Settings > Account > Security and click "Change Password". You\'ll need to enter your current password and then your new password twice.',
    },
    {
      question: 'Can I use MyDresser offline?',
      answer: 'Yes! MyDresser is a Progressive Web App (PWA) with offline capabilities. Once installed, you can browse your wardrobe and view saved outfits without internet.',
    },
    {
      question: 'How does the AI outfit matching work?',
      answer: 'Our AI analyzes color harmony, style compatibility, weather conditions, and your preferences to suggest cohesive outfits from your wardrobe.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption, multi-factor authentication, and strict privacy controls. Your data is always protected.',
    },
    {
      question: 'How do I become a merchant?',
      answer: 'Click on "Become a Merchant" in your account settings, complete the verification process, and you\'ll get access to the Merchant Terminal.',
    },
  ];

  const filteredArticles = popularArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Category</CardTitle>
          <CardDescription>Find help articles organized by topic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} articles</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles">
            <BookOpen className="mr-2 h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="mr-2 h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="faq">
            <MessageCircle className="mr-2 h-4 w-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Articles</CardTitle>
              <CardDescription>Most helpful articles from our community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{article.title}</h3>
                            <Badge variant="outline">{article.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{article.content}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {article.helpful}
                        </span>
                        <span>{article.views} views</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Watch step-by-step video guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{video.duration}</span>
                        <span>{video.views} views</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Article Detail */}
      {selectedArticle && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedArticle.title}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mt-2">{selectedArticle.category}</Badge>
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{selectedArticle.content}</p>
            <p className="text-muted-foreground">
              This is a placeholder for the full article content. In a real implementation,
              this would contain the complete help article with images, step-by-step instructions,
              and embedded videos.
            </p>
            <div className="flex items-center gap-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Was this helpful?</span>
              <Button variant="outline" size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Yes
              </Button>
              <Button variant="outline" size="sm">
                <ThumbsDown className="mr-2 h-4 w-4" />
                No
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
