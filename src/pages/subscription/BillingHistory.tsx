import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePayments, Transaction } from '@/hooks/usePayments';
import { format } from 'date-fns';
import { Download, Receipt } from 'lucide-react';

const BillingHistory = () => {
  const { getUserTransactions } = usePayments();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getUserTransactions(100);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (loading) {
    return <div className="p-8">Loading billing history...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Billing History</h1>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>

        {transactions.length === 0 ? (
          <Card className="p-12 text-center">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground">
              Your billing history will appear here once you make a purchase
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{transaction.description}</h3>
                      <Badge variant={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy • h:mm a')}
                    </p>
                    {(transaction as any).processedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Processed: {format(new Date((transaction as any).processedAt), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      <Receipt className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingHistory;
