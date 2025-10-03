import { useState } from 'react';
import { Send, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  responses?: TicketResponse[];
}

interface TicketResponse {
  id: string;
  message: string;
  from: 'user' | 'support';
  created_at: string;
}

export const SupportTicketSystem = () => {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium' as const,
  });
  const [reply, setReply] = useState('');

  // Mock data
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      subject: 'Cannot upload wardrobe item',
      description: 'Getting an error when trying to upload a photo',
      status: 'in-progress',
      priority: 'high',
      category: 'technical',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      responses: [
        { id: '1', message: 'Getting an error when trying to upload a photo', from: 'user', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '2', message: 'Thank you for contacting us. Can you please tell us what error message you see?', from: 'support', created_at: new Date(Date.now() - 82800000).toISOString() },
      ],
    },
  ]);

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.category) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const ticket: Ticket = {
      id: Date.now().toString(),
      ...newTicket,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      responses: [
        { id: '1', message: newTicket.description, from: 'user', created_at: new Date().toISOString() }
      ],
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({ subject: '', description: '', category: '', priority: 'medium' });
    toast({ title: 'Ticket Created', description: 'Our support team will respond soon' });
  };

  const handleSendReply = () => {
    if (!reply.trim() || !selectedTicket) return;

    const response: TicketResponse = {
      id: Date.now().toString(),
      message: reply,
      from: 'user',
      created_at: new Date().toISOString(),
    };

    setTickets(tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, responses: [...(t.responses || []), response], updated_at: new Date().toISOString() }
        : t
    ));

    setReply('');
    toast({ title: 'Reply Sent', description: 'Your message has been sent' });
  };

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle2 className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'default';
      case 'in-progress': return 'secondary';
      case 'resolved': return 'outline';
      case 'closed': return 'outline';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'low': return 'outline';
      case 'medium': return 'secondary';
      case 'high': return 'default';
      case 'urgent': return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
          <CardDescription>Describe your issue and our team will help you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select value={newTicket.category} onValueChange={(val) => setNewTicket({ ...newTicket, category: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="account">Account & Billing</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={newTicket.priority} onValueChange={(val: any) => setNewTicket({ ...newTicket, priority: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Describe your issue in detail..."
            value={newTicket.description}
            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            rows={4}
          />

          <Button onClick={handleCreateTicket} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Submit Ticket
          </Button>
        </CardContent>
      </Card>

      {/* Ticket List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
          <CardDescription>View and manage your support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No support tickets yet</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <Badge variant={getStatusColor(ticket.status)}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1 capitalize">{ticket.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                      </div>
                      <Badge variant={getPriorityColor(ticket.priority)} className="ml-2 capitalize">
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{ticket.category}</span>
                      <span>{new Date(ticket.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedTicket.subject}</CardTitle>
                <CardDescription>
                  Created {new Date(selectedTicket.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={getStatusColor(selectedTicket.status)}>
                  {getStatusIcon(selectedTicket.status)}
                  <span className="ml-1 capitalize">{selectedTicket.status}</span>
                </Badge>
                <Badge variant={getPriorityColor(selectedTicket.priority)} className="capitalize">
                  {selectedTicket.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conversation */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedTicket.responses?.map((response) => (
                <div
                  key={response.id}
                  className={`p-3 rounded-lg ${
                    response.from === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{response.from === 'user' ? 'You' : 'Support Team'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(response.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{response.message}</p>
                </div>
              ))}
            </div>

            {/* Reply */}
            {selectedTicket.status !== 'closed' && (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <Button onClick={handleSendReply}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button variant="outline" onClick={() => setSelectedTicket(null)} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
