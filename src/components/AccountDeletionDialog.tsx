import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';

interface AccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDeletionDialog({ open, onOpenChange }: AccountDeletionDialogProps) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState({
    dataLoss: false,
    noUndo: false,
    marketplaceImpact: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const allAcknowledged = Object.values(acknowledged).every(v => v);
  const confirmationMatch = confirmText === 'DELETE MY ACCOUNT';

  const handleClose = () => {
    setStep(1);
    setConfirmText('');
    setPassword('');
    setAcknowledged({ dataLoss: false, noUndo: false, marketplaceImpact: false });
    onOpenChange(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirmationMatch || !allAcknowledged) {
      toast({
        title: 'Confirmation Required',
        description: 'Please complete all required steps.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password,
      });

      if (signInError) {
        toast({
          title: 'Authentication Failed',
          description: 'Incorrect password. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Call the account deletion edge function
      const { error: deleteError } = await supabase.functions.invoke('delete-user-account', {
        body: { user_id: user.id },
      });

      if (deleteError) {
        throw deleteError;
      }

      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      });

      handleClose();
      navigate('/');
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete account. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Account - Step {step} of 3
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-destructive">What will be deleted:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Your profile and account information</li>
                <li>• All wardrobe items and photos</li>
                <li>• Saved outfits and collections</li>
                <li>• Social posts, comments, and reactions</li>
                <li>• Marketplace listings and transaction history</li>
                <li>• Messages and conversations</li>
                <li>• Style preferences and AI data</li>
                <li>• All settings and customizations</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="dataLoss"
                  checked={acknowledged.dataLoss}
                  onCheckedChange={(checked) =>
                    setAcknowledged(prev => ({ ...prev, dataLoss: checked as boolean }))
                  }
                />
                <Label htmlFor="dataLoss" className="text-sm font-normal cursor-pointer">
                  I understand that all my data will be permanently deleted and cannot be recovered.
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="noUndo"
                  checked={acknowledged.noUndo}
                  onCheckedChange={(checked) =>
                    setAcknowledged(prev => ({ ...prev, noUndo: checked as boolean }))
                  }
                />
                <Label htmlFor="noUndo" className="text-sm font-normal cursor-pointer">
                  I understand this action is permanent and cannot be undone.
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="marketplaceImpact"
                  checked={acknowledged.marketplaceImpact}
                  onCheckedChange={(checked) =>
                    setAcknowledged(prev => ({ ...prev, marketplaceImpact: checked as boolean }))
                  }
                />
                <Label htmlFor="marketplaceImpact" className="text-sm font-normal cursor-pointer">
                  I understand that any pending marketplace transactions will be cancelled.
                </Label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Before proceeding, we recommend exporting your data if you want to keep a copy.
            </p>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.open('/data-export', '_blank');
              }}
            >
              Export My Data (Opens in New Tab)
            </Button>

            <div className="border-t pt-4">
              <Label htmlFor="confirmText" className="text-sm font-semibold">
                Type "DELETE MY ACCOUNT" to confirm:
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="mt-2"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-destructive font-semibold">
              Final step: Enter your password to confirm deletion.
            </p>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">This is your last chance to cancel.</p>
              <p className="text-muted-foreground">
                Once you click "Delete My Account Forever", your account and all associated data 
                will be permanently deleted from our servers within 30 days as per GDPR requirements.
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleClose} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !allAcknowledged || step === 2 && !confirmationMatch}
              variant={step === 2 ? 'destructive' : 'default'}
            >
              Continue to Step {step + 1}
            </Button>
          ) : (
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={loading || !password}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                'Delete My Account Forever'
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
