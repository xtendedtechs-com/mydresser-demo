import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: 'user' | 'post' | 'item' | 'comment';
  reportedId: string;
  reportedUserId?: string;
}

const REPORT_CATEGORIES = {
  user: [
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'spam', label: 'Spam or fake account' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'impersonation', label: 'Impersonation' },
    { value: 'other', label: 'Other' },
  ],
  post: [
    { value: 'spam', label: 'Spam' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'misleading', label: 'Misleading or false information' },
    { value: 'copyright', label: 'Copyright violation' },
    { value: 'other', label: 'Other' },
  ],
  item: [
    { value: 'counterfeit', label: 'Counterfeit item' },
    { value: 'misleading', label: 'Misleading description' },
    { value: 'prohibited', label: 'Prohibited item' },
    { value: 'scam', label: 'Potential scam' },
    { value: 'other', label: 'Other' },
  ],
  comment: [
    { value: 'harassment', label: 'Harassment or hate speech' },
    { value: 'spam', label: 'Spam' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'other', label: 'Other' },
  ],
};

export const ReportSystem = ({
  open,
  onOpenChange,
  reportType,
  reportedId,
  reportedUserId,
}: ReportSystemProps) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!category) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide additional details');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        report_type: reportType,
        reported_id: reportedId,
        category,
        description: description.trim(),
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Report submitted successfully', {
        description: 'Our team will review your report shortly.',
      });
      
      // Reset form
      setCategory('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = REPORT_CATEGORIES[reportType] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Report {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Help us understand what's happening. Your report is anonymous.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>What's the issue?</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              {categories.map((cat) => (
                <div key={cat.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={cat.value} id={cat.value} />
                  <Label htmlFor={cat.value} className="font-normal cursor-pointer">
                    {cat.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              placeholder="Please provide more context about your report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters required
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              False reports may result in penalties. Please only report content that violates 
              our community guidelines.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !category || description.trim().length < 10}
            variant="destructive"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
