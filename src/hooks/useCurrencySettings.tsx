import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CurrencySettings {
  id: string;
  user_id: string;
  base_currency: string;
  display_currency: string;
  auto_convert: boolean;
  preferred_payment_method: string | null;
  tax_region: string | null;
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
];

export const useCurrencySettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch currency settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['currency-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('currency_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Create default settings if none exist
      if (!data) {
        const { data: newSettings, error: createError } = await supabase
          .from('currency_settings')
          .insert({
            user_id: user.id,
            base_currency: 'USD',
            display_currency: 'USD',
            auto_convert: true,
            tax_region: 'US',
            tax_rate: 0.0
          })
          .select()
          .single();

        if (createError) throw createError;
        return newSettings as CurrencySettings;
      }

      return data as CurrencySettings;
    },
  });

  // Update currency settings
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<CurrencySettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('currency_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency-settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Your currency settings have been saved',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Convert amount between currencies
  const convertCurrency = async (
    amount: number,
    from: string,
    to: string
  ): Promise<number> => {
    if (from === to) return amount;

    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('from_currency', from)
        .eq('to_currency', to)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return amount * data.rate;
      }

      // Fallback: use approximate rates if no data
      const fallbackRates: Record<string, number> = {
        'USD-EUR': 0.92,
        'USD-GBP': 0.79,
        'USD-JPY': 149.50,
        'USD-CAD': 1.36,
        'USD-AUD': 1.53,
        'EUR-USD': 1.09,
        'GBP-USD': 1.27,
      };

      const key = `${from}-${to}`;
      if (fallbackRates[key]) {
        return amount * fallbackRates[key];
      }

      // If no rate found, return original amount
      console.warn(`No exchange rate found for ${from} to ${to}`);
      return amount;
    } catch (error) {
      console.error('Currency conversion error:', error);
      return amount;
    }
  };

  // Format amount with currency symbol
  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const currency = currencyCode || settings?.display_currency || 'USD';
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    
    return `${currencyInfo?.symbol || '$'}${amount.toFixed(2)}`;
  };

  // Calculate tax
  const calculateTax = (amount: number): number => {
    if (!settings) return 0;
    return amount * (settings.tax_rate / 100);
  };

  return {
    settings,
    isLoading,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    convertCurrency,
    formatCurrency,
    calculateTax,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
};
