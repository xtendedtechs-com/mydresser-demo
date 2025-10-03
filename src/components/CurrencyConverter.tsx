import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, TrendingUp } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // Rate relative to USD
}

const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 149.50 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', rate: 7.24 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 83.12 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rate: 1.52 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', rate: 1.36 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭', rate: 0.88 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', rate: 4.97 },
];

export const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<string>('0');

  useEffect(() => {
    const from = currencies.find(c => c.code === fromCurrency);
    const to = currencies.find(c => c.code === toCurrency);
    
    if (from && to && amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        // Convert to USD first, then to target currency
        const usdAmount = numAmount / from.rate;
        const result = usdAmount * to.rate;
        setConvertedAmount(result.toFixed(2));
      }
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const fromCurrencyObj = currencies.find(c => c.code === fromCurrency);
  const toCurrencyObj = currencies.find(c => c.code === toCurrency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Currency Converter
        </CardTitle>
        <CardDescription>Convert prices between different currencies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Currency */}
        <div className="space-y-2">
          <Label>From</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="rounded-full"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <Label>To</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={convertedAmount}
              readOnly
              className="bg-muted"
            />
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result Display */}
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-1">Conversion Result</p>
          <p className="text-2xl font-bold">
            {fromCurrencyObj?.symbol}{amount} = {toCurrencyObj?.symbol}{convertedAmount}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            1 {fromCurrency} = {toCurrencyObj && fromCurrencyObj ? 
              ((toCurrencyObj.rate / fromCurrencyObj.rate).toFixed(4)) : '0'} {toCurrency}
          </p>
        </div>

        {/* Quick Conversions */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick conversions</Label>
          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map((quickAmount) => {
              const from = currencies.find(c => c.code === fromCurrency);
              const to = currencies.find(c => c.code === toCurrency);
              const result = from && to ? ((quickAmount / from.rate) * to.rate).toFixed(2) : '0';
              
              return (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="flex flex-col h-auto py-2"
                >
                  <span className="text-xs">{fromCurrencyObj?.symbol}{quickAmount}</span>
                  <span className="text-xs text-muted-foreground">≈ {toCurrencyObj?.symbol}{result}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Exchange rates are approximate and updated daily
        </p>
      </CardContent>
    </Card>
  );
};
