import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStyleLearning } from "@/hooks/useStyleLearning";

interface OutfitRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfitId: string;
  outfitName: string;
}

const OutfitRatingDialog = ({ open, onOpenChange, outfitId, outfitName }: OutfitRatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [worn, setWorn] = useState(false);
  const { toast } = useToast();
  const { rateOutfit } = useStyleLearning();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    try {
      await rateOutfit(outfitId, rating, feedback, worn);
      
      toast({
        title: "Rating Saved",
        description: "Your feedback helps improve future recommendations!"
      });
      
      onOpenChange(false);
      setRating(0);
      setFeedback("");
      setWorn(false);
    } catch (error) {
      toast({
        title: "Failed to Save Rating",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Outfit</DialogTitle>
          <DialogDescription>
            {outfitName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>How do you like this outfit?</Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="What did you like or dislike about this outfit?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="worn"
              checked={worn}
              onChange={(e) => setWorn(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="worn" className="text-sm">
              I wore this outfit
            </Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutfitRatingDialog;
