import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, MessageSquare, Book, Phone, Mail, 
  FileText, Download, ExternalLink, Search,
  Clock, CheckCircle, AlertCircle, Users
} from 'lucide-react';

const SupportResources = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [tickets, setTickets] = React.useState([
    { id: '001', subject: 'Payment processing issue', status: 'open', priority: 'high', date: '2024-01-15' },
    { id: '002', subject: 'Product catalog sync', status: 'resolved', priority: 'medium', date: '2024-01-10' },
    { id: '003', subject: 'API integration help', status: 'pending', priority: 'low', date: '2024-01-08' },
  ]);

  const faqs = [
    {
      question: "How do I process refunds?",
      answer: "Navigate to Orders > Find the order > Click 'Process Refund' > Select refund amount and reason."
    },
    {
      question: "How to update inventory levels?",
      answer: "Go to Products > Select item > Edit > Update stock quantity > Save changes."
    },
    {
      question: "Setting up payment methods?",
      answer: "Visit Settings > Payment Methods > Connect your preferred payment processor."
    },
    {
      question: "How to generate sales reports?",
      answer: "Go to Analytics > Reports > Select date range > Choose report type > Generate."
    }
  ];

  const resources = [
    { title: "Merchant Setup Guide", type: "PDF", size: "2.4 MB", downloads: 1250 },
    { title: "API Documentation", type: "HTML", size: "N/A", downloads: 890 },
    { title: "Payment Processing Manual", type: "PDF", size: "3.1 MB", downloads: 760 },
    { title: "Video Tutorials", type: "Video", size: "45 min", downloads: 1100 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support & Resources</h1>
        <Button>
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </div>

      <Tabs defaultValue="support" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Create New Ticket
                </Button>
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    placeholder="Search tickets..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'resolved' ? 'default' : 'secondary'}>
                          {ticket.status === 'open' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {ticket.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {ticket.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {ticket.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                        <h3 className="font-medium">{ticket.subject}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'secondary' : 'outline'}>
                          {ticket.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{ticket.date}</span>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input placeholder="Search FAQs..." className="pl-10" />
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="p-4">
                    <h3 className="font-medium mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Resources & Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resource, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {resource.type} • {resource.size} • {resource.downloads} downloads
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-4">
                <h3 className="font-medium mb-2">Quick Links</h3>
                <div className="space-y-2">
                  <Button variant="link" className="p-0 h-auto">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Developer Documentation
                  </Button>
                  <Button variant="link" className="p-0 h-auto">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Community Forum
                  </Button>
                  <Button variant="link" className="p-0 h-auto">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Video Tutorials
                  </Button>
                </div>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@mydresser.com</p>
                    <p className="text-xs text-muted-foreground">24/7 Response within 4 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                    <Button size="sm" className="mt-1">Start Chat</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Describe your issue in detail..."
                    rows={4}
                  />
                </div>

                <Button className="w-full">Send Message</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportResources;