import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { rateLimiter, sanitizeInput } from '@/utils/security';
import { toast } from 'sonner';
import { useState } from 'react';

interface SecureFormProps<T extends z.ZodType> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  children: (form: ReturnType<typeof useForm<z.infer<T>>>) => React.ReactNode;
  rateLimitKey?: string;
  maxAttempts?: number;
  windowMs?: number;
  sanitizeFields?: (keyof z.infer<T>)[];
}

export function SecureForm<T extends z.ZodType>({
  schema,
  onSubmit,
  children,
  rateLimitKey,
  maxAttempts = 10,
  windowMs = 60000,
  sanitizeFields = [],
}: SecureFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  });

  const handleSubmit = async (data: z.infer<T>) => {
    // Rate limiting check
    if (rateLimitKey && !rateLimiter.check(rateLimitKey, maxAttempts, windowMs)) {
      toast.error('Too many attempts. Please try again later.');
      return;
    }

    // Sanitize specified fields
    const sanitizedData = { ...data };
    sanitizeFields.forEach(field => {
      if (typeof sanitizedData[field] === 'string') {
        sanitizedData[field] = sanitizeInput(sanitizedData[field]);
      }
    });

    setIsSubmitting(true);
    try {
      await onSubmit(sanitizedData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {children(form)}
      </form>
    </Form>
  );
}
