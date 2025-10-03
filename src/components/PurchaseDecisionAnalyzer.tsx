import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, CheckCircle2, XCircle, AlertTriangle, Sparkles } from "lucide-react";

interface AnalysisResult {
  score: number;
  recommendation: 'buy' | 'reconsider' | 'skip';
  factors: {
    name: string;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
    details: string;
  }[];
  summary: string;
}

export function PurchaseDecisionAnalyzer() {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quality, setQuality] = useState("");
  const [versatility, setVersatility] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    if (!itemName || !price || !category || !quality || !versatility) return;

    const priceValue = parseFloat(price);
    const qualityScore = quality === 'high' ? 30 : quality === 'medium' ? 20 : 10;
    const versatilityScore = versatility === 'high' ? 25 : versatility === 'medium' ? 15 : 5;
    
    // Analyze wardrobe need (simulated)
    const needScore = 20; // Would be based on wardrobe analysis
    
    // Price-to-value ratio
    const priceScore = priceValue < 50 ? 15 : priceValue < 100 ? 10 : priceValue < 200 ? 5 : 0;
    
    // Sustainability bonus
    const sustainabilityScore = 10; // Would check brand sustainability

    const totalScore = qualityScore + versatilityScore + needScore + priceScore + sustainabilityScore;

    const factors = [
      {
        name: "Quality Assessment",
        score: qualityScore,
        impact: qualityScore >= 20 ? 'positive' as const : 'neutral' as const,
        details: `${quality} quality materials and construction`
      },
      {
        name: "Versatility",
        score: versatilityScore,
        impact: versatilityScore >= 20 ? 'positive' as const : 'negative' as const,
        details: `Can be worn in ${versatility === 'high' ? 'many' : versatility === 'medium' ? 'some' : 'few'} different ways`
      },
      {
        name: "Wardrobe Gap Fill",
        score: needScore,
        impact: 'positive' as const,
        details: "Fills a need in your current wardrobe"
      },
      {
        name: "Price-to-Value",
        score: priceScore,
        impact: priceValue < 100 ? 'positive' as const : priceValue < 200 ? 'neutral' as const : 'negative' as const,
        details: `${priceValue < 100 ? 'Good' : priceValue < 200 ? 'Moderate' : 'High'} price point for category`
      },
      {
        name: "Sustainability",
        score: sustainabilityScore,
        impact: 'positive' as const,
        details: "Aligns with sustainable fashion practices"
      }
    ];

    let recommendation: 'buy' | 'reconsider' | 'skip';
    let summary: string;

    if (totalScore >= 80) {
      recommendation = 'buy';
      summary = "Excellent purchase! This item scores high across all factors and is a smart addition to your wardrobe.";
    } else if (totalScore >= 60) {
      recommendation = 'reconsider';
      summary = "Consider carefully. This item has some strengths but may not be the best value for money right now.";
    } else {
      recommendation = 'skip';
      summary = "Not recommended. This purchase doesn't align well with your wardrobe needs or budget goals.";
    }

    setAnalysis({
      score: totalScore,
      recommendation,
      factors,
      summary
    });
  };

  const handleReset = () => {
    setItemName("");
    setPrice("");
    setCategory("");
    setQuality("");
    setVersatility("");
    setAnalysis(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Purchase Decision Analyzer
              </CardTitle>
              <CardDescription>Get AI-powered insights before you buy</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Smart Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                placeholder="e.g., Navy Blazer"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tops">Tops</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                  <SelectItem value="outerwear">Outerwear</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Quality Level</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger id="quality">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (Premium)</SelectItem>
                  <SelectItem value="medium">Medium (Standard)</SelectItem>
                  <SelectItem value="low">Low (Budget)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="versatility">Versatility</Label>
              <Select value={versatility} onValueChange={setVersatility}>
                <SelectTrigger id="versatility">
                  <SelectValue placeholder="How versatile?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (10+ outfits)</SelectItem>
                  <SelectItem value="medium">Medium (5-10 outfits)</SelectItem>
                  <SelectItem value="low">Low (&lt;5 outfits)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} className="flex-1">
              Analyze Purchase
            </Button>
            {analysis && (
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card className={
            analysis.recommendation === 'buy' ? 'border-green-500/50 bg-green-500/5' :
            analysis.recommendation === 'reconsider' ? 'border-amber-500/50 bg-amber-500/5' :
            'border-red-500/50 bg-red-500/5'
          }>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {analysis.recommendation === 'buy' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                  {analysis.recommendation === 'reconsider' && <AlertTriangle className="h-6 w-6 text-amber-500" />}
                  {analysis.recommendation === 'skip' && <XCircle className="h-6 w-6 text-red-500" />}
                  {analysis.recommendation === 'buy' && 'Recommended Purchase'}
                  {analysis.recommendation === 'reconsider' && 'Reconsider This Purchase'}
                  {analysis.recommendation === 'skip' && 'Not Recommended'}
                </CardTitle>
                <div className="text-right">
                  <div className="text-3xl font-bold">{analysis.score}</div>
                  <div className="text-xs text-muted-foreground">out of 100</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Progress value={analysis.score} className="h-3" />
              </div>
              
              <p className="text-sm">{analysis.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>Factor-by-factor breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.factors.map((factor, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{factor.name}</span>
                      {factor.impact === 'positive' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {factor.impact === 'negative' && <XCircle className="h-4 w-4 text-red-500" />}
                      {factor.impact === 'neutral' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    </div>
                    <span className="text-sm font-medium">{factor.score}/30</span>
                  </div>
                  <Progress value={(factor.score / 30) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">{factor.details}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
