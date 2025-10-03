import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WardrobeComponentBuilder } from "@/components/WardrobeComponentBuilder";
import { useWardrobe } from "@/hooks/useWardrobe";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function WardrobeBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wardrobeId = searchParams.get('id');
  const { wardrobes, loading } = useWardrobe();

  const wardrobe = wardrobes.find(w => w.id === wardrobeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!wardrobe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Wardrobe Not Found</h2>
              <p className="text-muted-foreground mb-4">The wardrobe you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/add')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Add Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dimensions = wardrobe.dimensions as any || { width: 0, height: 0, depth: 0 };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/add')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Wardrobes
      </Button>

      <WardrobeComponentBuilder
        wardrobeId={wardrobe.id}
        wardrobeName={wardrobe.name}
        wardrobeDimensions={dimensions}
      />
    </div>
  );
}