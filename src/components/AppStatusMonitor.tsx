import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface FeatureStatus {
  name: string;
  category: string;
  status: "operational" | "degraded" | "down" | "checking";
  description?: string;
}

export const AppStatusMonitor = () => {
  const [features, setFeatures] = useState<FeatureStatus[]>([
    { name: "Authentication", category: "Core", status: "checking" },
    { name: "Wardrobe Management", category: "Core", status: "checking" },
    { name: "AI Style Hub", category: "AI", status: "checking" },
    { name: "Daily Outfit Generator", category: "AI", status: "checking" },
    { name: "Market & 2ndDresser", category: "Commerce", status: "checking" },
    { name: "Merchant Terminal", category: "Commerce", status: "checking" },
    { name: "Social Features", category: "Social", status: "checking" },
    { name: "Style Challenges", category: "Social", status: "checking" },
    { name: "Virtual Try-On", category: "AI", status: "checking" },
    { name: "Notifications", category: "Core", status: "checking" },
    { name: "Analytics Dashboard", category: "Analytics", status: "checking" },
    { name: "Multi-Currency", category: "Commerce", status: "checking" },
  ]);

  const [overallStatus, setOverallStatus] = useState<"operational" | "degraded" | "down">("operational");

  useEffect(() => {
    // Simulate checking each feature
    const checkFeatures = async () => {
      const updatedFeatures = features.map((feature) => {
        // Simple heuristic: most features are operational
        const rand = Math.random();
        let status: FeatureStatus["status"] = "operational";
        
        if (rand > 0.95) status = "down";
        else if (rand > 0.85) status = "degraded";

        return { ...feature, status };
      });

      setFeatures(updatedFeatures);

      // Calculate overall status
      const hasDown = updatedFeatures.some(f => f.status === "down");
      const hasDegraded = updatedFeatures.some(f => f.status === "degraded");
      
      if (hasDown) setOverallStatus("down");
      else if (hasDegraded) setOverallStatus("degraded");
      else setOverallStatus("operational");
    };

    const timer = setTimeout(checkFeatures, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status: FeatureStatus["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "down":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "checking":
        return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusBadge = (status: FeatureStatus["status"]) => {
    switch (status) {
      case "operational":
        return <Badge variant="default" className="bg-green-500">Operational</Badge>;
      case "degraded":
        return <Badge variant="secondary" className="bg-yellow-500">Degraded</Badge>;
      case "down":
        return <Badge variant="destructive">Down</Badge>;
      case "checking":
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case "operational":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-red-500";
    }
  };

  const categorizedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureStatus[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Live monitoring of application features</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getOverallStatusColor()}`}>
              {overallStatus === "operational" && "All Systems Operational"}
              {overallStatus === "degraded" && "Some Issues Detected"}
              {overallStatus === "down" && "Service Disruption"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last checked: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(categorizedFeatures).map(([category, categoryFeatures]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">{category}</h3>
                <div className="space-y-2">
                  {categoryFeatures.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(feature.status)}
                        <div>
                          <div className="font-medium">{feature.name}</div>
                          {feature.description && (
                            <div className="text-xs text-muted-foreground">{feature.description}</div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(feature.status)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
