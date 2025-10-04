import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps extends React.ComponentProps<typeof Button> {
  loadingText?: string;
  successText?: string;
  successDuration?: number;
}

export const FeedbackButton = ({
  children,
  loadingText = 'Loading...',
  successText = 'Done!',
  successDuration = 2000,
  onClick,
  disabled,
  className,
  ...props
}: FeedbackButtonProps) => {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state !== 'idle' || !onClick) return;

    setState('loading');
    
    try {
      await onClick(e);
      setState('success');
      setTimeout(() => setState('idle'), successDuration);
    } catch (error) {
      setState('idle');
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      className={cn(
        'transition-all duration-300',
        state === 'success' && 'bg-green-500 hover:bg-green-600',
        className
      )}
    >
      {state === 'loading' && (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      )}
      {state === 'success' && (
        <>
          <Check className="mr-2 h-4 w-4" />
          {successText}
        </>
      )}
      {state === 'idle' && children}
    </Button>
  );
};
