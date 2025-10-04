import { useState, useCallback } from 'react';
import { toast } from '@/components/ToastNotification';

interface UseOptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>({
  onUpdate,
  onError,
  successMessage = 'Updated successfully',
  errorMessage = 'Update failed',
}: UseOptimisticUpdateOptions<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const update = useCallback(
    async (newData: T) => {
      // Optimistically update UI
      setOptimisticData(newData);
      setIsUpdating(true);

      try {
        // Perform actual update
        await onUpdate(newData);
        toast.success(successMessage);
      } catch (error) {
        // Revert on error
        setOptimisticData(null);
        toast.error(errorMessage);
        onError?.(error as Error);
      } finally {
        setIsUpdating(false);
        // Clear optimistic data after successful update
        setTimeout(() => setOptimisticData(null), 500);
      }
    },
    [onUpdate, onError, successMessage, errorMessage]
  );

  return {
    update,
    isUpdating,
    optimisticData,
  };
}
