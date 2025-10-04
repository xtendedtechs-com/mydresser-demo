import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AIStyleInsights } from '@/components/AIStyleInsights';

const AIStyleInsightsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">AI Style Insights</h1>
              <p className="text-muted-foreground">Personalized analysis of your fashion identity</p>
            </div>
          </div>

          <AIStyleInsights />
        </div>
      </div>
    </div>
  );
};

export default AIStyleInsightsPage;
