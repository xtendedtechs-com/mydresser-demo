import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler, TrendingUp, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BodyMeasurements {
  height: string;
  weight: string;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
}

interface FitPrediction {
  itemName: string;
  overallFit: "perfect" | "good" | "loose" | "tight";
  confidence: number;
  measurements: {
    area: string;
    fit: string;
    recommendation: string;
  }[];
  sizeRecommendation: string;
  alternativeSizes: string[];
}

export const FitPredictionEngine = () => {
  const { toast } = useToast();
  const [measurements, setMeasurements] = useState<BodyMeasurements>({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    hips: "",
    inseam: "",
  });
  const [prediction, setPrediction] = useState<FitPrediction | null>(null);

  const handleMeasurementChange = (field: keyof BodyMeasurements, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredictFit = () => {
    // Simulate AI fit prediction
    setPrediction({
      itemName: "Classic Navy Blazer",
      overallFit: "good",
      confidence: 87,
      measurements: [
        {
          area: "Chest",
          fit: "Perfect",
          recommendation: "Comfortable fit with room for movement",
        },
        {
          area: "Shoulders",
          fit: "Good",
          recommendation: "Slightly relaxed, consider going down one size for a slimmer fit",
        },
        {
          area: "Length",
          fit: "Perfect",
          recommendation: "Ideal length for your height",
        },
        {
          area: "Sleeve",
          fit: "Good",
          recommendation: "May need minor tailoring for perfect sleeve length",
        },
      ],
      sizeRecommendation: "Medium",
      alternativeSizes: ["Small (Slimmer fit)", "Large (Relaxed fit)"],
    });

    toast({
      title: "Fit Prediction Complete",
      description: "AI has analyzed the fit for your measurements",
    });
  };

  const getFitColor = (fit: string) => {
    if (fit === "perfect") return "text-green-600 bg-green-500/10";
    if (fit === "good") return "text-blue-600 bg-blue-500/10";
    if (fit === "loose") return "text-yellow-600 bg-yellow-500/10";
    return "text-red-600 bg-red-500/10";
  };

  const getFitIcon = (fit: string) => {
    if (fit === "perfect" || fit === "good") return CheckCircle2;
    if (fit === "loose") return Info;
    return AlertCircle;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Measurements Input */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            <CardTitle>Body Measurements</CardTitle>
          </div>
          <CardDescription>
            Enter your measurements for accurate fit predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={measurements.height}
                  onChange={(e) => handleMeasurementChange("height", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={measurements.weight}
                  onChange={(e) => handleMeasurementChange("weight", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest">Chest (cm)</Label>
                <Input
                  id="chest"
                  type="number"
                  placeholder="95"
                  value={measurements.chest}
                  onChange={(e) => handleMeasurementChange("chest", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waist">Waist (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  placeholder="80"
                  value={measurements.waist}
                  onChange={(e) => handleMeasurementChange("waist", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hips">Hips (cm)</Label>
                <Input
                  id="hips"
                  type="number"
                  placeholder="95"
                  value={measurements.hips}
                  onChange={(e) => handleMeasurementChange("hips", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inseam">Inseam (cm)</Label>
                <Input
                  id="inseam"
                  type="number"
                  placeholder="80"
                  value={measurements.inseam}
                  onChange={(e) => handleMeasurementChange("inseam", e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full" onClick={handlePredictFit}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Predict Fit
            </Button>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <Info className="h-3 w-3 inline mr-1" />
                Tip: For best results, use a measuring tape and follow our measurement guide
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fit Prediction Results */}
      <Card>
        <CardHeader>
          <CardTitle>Fit Prediction</CardTitle>
          <CardDescription>
            AI-powered analysis of how this item will fit you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prediction ? (
            <div className="space-y-6">
              {/* Overall Fit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Fit</span>
                  <Badge className={getFitColor(prediction.overallFit)}>
                    {prediction.overallFit}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{prediction.confidence}%</span>
                  </div>
                  <Progress value={prediction.confidence} className="h-2" />
                </div>
              </div>

              {/* Size Recommendation */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Recommended Size</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {prediction.sizeRecommendation}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your measurements and item specifications
                </p>
              </div>

              {/* Detailed Measurements */}
              <div className="space-y-3">
                <span className="text-sm font-medium">Fit Details</span>
                {prediction.measurements.map((measurement, index) => {
                  const Icon = getFitIcon(measurement.fit.toLowerCase());
                  return (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{measurement.area}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {measurement.fit}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {measurement.recommendation}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Alternative Sizes */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Alternative Sizes</span>
                <div className="flex flex-col gap-2">
                  {prediction.alternativeSizes.map((size, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded text-sm text-muted-foreground"
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Ruler className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Enter your measurements to see fit predictions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
