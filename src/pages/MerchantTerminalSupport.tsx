import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  HelpCircle, MessageSquare, Book, Phone, Mail, 
  FileText, Download, ExternalLink, Search,
  Clock, CheckCircle, AlertCircle, Users, Send
} from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { format } from 'date-fns';

const MerchantTerminalSupport = () => {
  const { tickets, loading, createTicket, updateTicketStatus } = useSupportTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: ''
  });

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) return;

    await createTicket(
      ticketForm.subject,
      ticketForm.message,
      ticketForm.priority,
      ticketForm.category
    );

    setTicketForm({ subject: '', message: '', priority: 'medium', category: '' });
    setNewTicketOpen(false);
  };

  const faqs = [
    {
      question: "How do I process refunds?",
      answer: "Navigate to Orders > Find the order > Click 'Process Refund' > Select refund amount and reason."
    },
    {
      question: "How to update inventory levels?",
      answer: "Go to Inventory > Select item > Edit > Update stock quantity > Save changes."
    },
    {
      question: "Setting up payment methods?",
      answer: "Visit Settings > Payment tab > Connect your preferred payment processor."
    },
    {
      question: "How to generate sales reports?",
      answer: "Go to Dashboard > Click 'Update Analytics' to refresh your sales data and metrics."
    },
    {
      question: "Managing store locations?",
      answer: "Visit Settings > Inventory tab > Enable Multi-Store Management to add and manage multiple locations."
    }
  ];

  const resources = [
    { title: "Merchant Setup Guide", type: "PDF", size: "2.4 MB", url: "#" },
    { title: "POS Terminal Manual", type: "PDF", size: "1.8 MB", url: "#" },
    { title: "Payment Processing Guide", type: "PDF", size: "3.1 MB", url: "#" },
    { title: "Inventory Management Tips", type: "PDF", size: "2.2 MB", url: "#" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support & Resources</h1>
          <p className="text-muted-foreground">Get help and access helpful resources</p>
        </div>
        <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you as soon as possible
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={ticketForm.priority} 
                    onValueChange={(v) => setTicketForm({ ...ticketForm, priority: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={ticketForm.category} 
                    onValueChange={(v) => setTicketForm({ ...ticketForm, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewTicketOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTicket}>
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input 
                  placeholder="Search tickets..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading tickets...</p>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No support tickets found</p>
                  <p className="text-sm">Create a ticket to get help from our support team</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge variant={
                            ticket.status === 'open' ? 'destructive' : 
                            ticket.status === 'resolved' ? 'default' : 
                            'secondary'
                          }>
                            {ticket.status === 'open' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {ticket.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {ticket.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {ticket.status}
                          </Badge>
                          <div className="flex-1">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(ticket.created_at), 'PPp')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            ticket.priority === 'urgent' || ticket.priority === 'high' ? 'destructive' : 
                            ticket.priority === 'medium' ? 'secondary' : 
                            'outline'
                          }>
                            {ticket.priority}
                          </Badge>
                          {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                            >
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
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
                          {resource.type} • {resource.size}
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
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="https://github.com/mydresser" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Developer Documentation
                    </a>
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
                    <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For urgent technical issues affecting your business operations, create a ticket with "Urgent" priority or contact emergency support.
                </p>
                <Button className="w-full" onClick={() => setNewTicketOpen(true)}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Create Urgent Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantTerminalSupport;
