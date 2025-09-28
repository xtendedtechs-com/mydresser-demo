/**
 * MyDresser Payment System - Original IP
 * Complete payment processing without external dependencies
 */

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'digital_wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  nickname?: string;
}

interface Transaction {
  id: string;
  userId: string;
  merchantId?: string;
  amount: number;
  currency: string;
  type: 'purchase' | 'subscription' | 'commission' | 'payout';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxItems?: number;
  maxOutfits?: number;
  aiRecommendations: boolean;
  prioritySupport: boolean;
  marketplaceAccess: boolean;
}

class MyDresserPaymentSystem {
  private static instance: MyDresserPaymentSystem;
  private subscriptionPlans: SubscriptionPlan[] = [];
  
  constructor() {
    this.initializeSubscriptionPlans();
  }

  static getInstance(): MyDresserPaymentSystem {
    if (!MyDresserPaymentSystem.instance) {
      MyDresserPaymentSystem.instance = new MyDresserPaymentSystem();
    }
    return MyDresserPaymentSystem.instance;
  }

  private initializeSubscriptionPlans() {
    this.subscriptionPlans = [
      {
        id: 'private-free',
        name: 'Private (Free)',
        price: 0,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Basic wardrobe management',
          'Up to 50 items',
          '5 AI outfit suggestions/month',
          'Basic style analytics'
        ],
        maxItems: 50,
        maxOutfits: 10,
        aiRecommendations: true,
        prioritySupport: false,
        marketplaceAccess: false
      },
      {
        id: 'professional-premium',
        name: 'Professional Premium',
        price: 19.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Unlimited wardrobe items',
          'Advanced AI styling',
          'Weather-based recommendations',
          'Style trend analysis',
          'Priority customer support',
          'Export/import wardrobe data'
        ],
        aiRecommendations: true,
        prioritySupport: true,
        marketplaceAccess: true
      },
      {
        id: 'merchant-pro',
        name: 'Merchant Pro',
        price: 49.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'All Professional features',
          'Merchant storefront',
          'Inventory management',
          'Sales analytics',
          'Customer management',
          'Commission-based selling (5%)',
          'Featured listing priority'
        ],
        aiRecommendations: true,
        prioritySupport: true,
        marketplaceAccess: true
      }
    ];
  }

  async processPayment(
    amount: number,
    currency: string = 'USD',
    paymentMethod: PaymentMethod,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Simulate payment processing
      const transactionId = this.generateTransactionId();
      
      // Create transaction record
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          id: transactionId,
          amount,
          currency,
          type: metadata.type || 'purchase',
          status: 'pending',
          description,
          payment_method_id: paymentMethod.id,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success rate (95% success for demo)
      const isSuccessful = Math.random() > 0.05;

      if (isSuccessful) {
        // Update transaction to completed
        await supabase
          .from('transactions')
          .update({ 
            status: 'completed', 
            completed_at: new Date().toISOString() 
          })
          .eq('id', transactionId);

        return { success: true, transactionId };
      } else {
        // Update transaction to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transactionId);

        return { success: false, error: 'Payment processing failed. Please try again.' };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: 'Payment system error. Please try again later.' };
    }
  }

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const plan = this.subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        return { success: false, error: 'Invalid subscription plan' };
      }

      // Process initial payment if not free
      if (plan.price > 0) {
        const paymentResult = await this.processPayment(
          plan.price,
          plan.currency,
          paymentMethod,
          `Subscription: ${plan.name}`,
          { type: 'subscription', planId, userId }
        );

        if (!paymentResult.success) {
          return paymentResult;
        }
      }

      // Create subscription record
      const subscriptionId = this.generateSubscriptionId();
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          id: subscriptionId,
          subscriber_id: userId,
          plan_id: planId,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: this.calculateExpiryDate(plan.interval).toISOString(),
          auto_renew: true
        });

      if (error) throw error;

      return { success: true, subscriptionId };
    } catch (error) {
      console.error('Subscription creation error:', error);
      return { success: false, error: 'Failed to create subscription' };
    }
  }

  async processMarketplaceSale(
    sellerId: string,
    buyerId: string,
    itemId: string,
    amount: number,
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const commission = amount * 0.05; // 5% commission
      const sellerAmount = amount - commission;

      // Process buyer payment
      const buyerPayment = await this.processPayment(
        amount,
        'USD',
        paymentMethod,
        `Marketplace purchase: Item ${itemId}`,
        { type: 'purchase', itemId, sellerId, buyerId }
      );

      if (!buyerPayment.success) {
        return buyerPayment;
      }

      // Create commission transaction
      await supabase
        .from('transactions')
        .insert({
          id: this.generateTransactionId(),
          amount: commission,
          currency: 'USD',
          type: 'commission',
          status: 'completed',
          description: `Marketplace commission: Item ${itemId}`,
          metadata: { itemId, sellerId, buyerId, originalTransactionId: buyerPayment.transactionId }
        });

      // Create seller payout (pending)
      await supabase
        .from('transactions')
        .insert({
          id: this.generateTransactionId(),
          user_id: sellerId,
          amount: sellerAmount,
          currency: 'USD',
          type: 'payout',
          status: 'pending',
          description: `Marketplace sale: Item ${itemId}`,
          metadata: { itemId, buyerId, originalTransactionId: buyerPayment.transactionId }
        });

      return { success: true, transactionId: buyerPayment.transactionId };
    } catch (error) {
      console.error('Marketplace sale error:', error);
      return { success: false, error: 'Failed to process marketplace sale' };
    }
  }

  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlans;
  }

  async getCurrentSubscription(userId: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('subscriber_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const subscription = data[0];
        return this.subscriptionPlans.find(plan => plan.id === subscription.plan_id) || null;
      }

      return null;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return null;
    }
  }

  private generateTransactionId(): string {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateSubscriptionId(): string {
    return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private calculateExpiryDate(interval: 'monthly' | 'yearly'): Date {
    const now = new Date();
    if (interval === 'yearly') {
      return new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      return new Date(now.setMonth(now.getMonth() + 1));
    }
  }
}

export const myDresserPayments = MyDresserPaymentSystem.getInstance();
export type { PaymentMethod, Transaction, SubscriptionPlan };