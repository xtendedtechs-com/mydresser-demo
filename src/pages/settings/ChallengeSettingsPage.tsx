import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChallengeSettingsPanel from "@/components/settings/ChallengeSettingsPanel";

const ChallengeSettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/account')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Style Challenge Settings</h1>
              <p className="text-muted-foreground">Manage your style challenge preferences</p>
            </div>
          </div>

          <ChallengeSettingsPanel />
        </div>
      </div>
    </div>
  );
};

export default ChallengeSettingsPage;
