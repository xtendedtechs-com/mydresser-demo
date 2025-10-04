import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <CheckCircle className="w-5 h-5" />,
      className: 'animate-slide-up',
    });
  },

  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <XCircle className="w-5 h-5" />,
      className: 'animate-slide-up',
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 3500,
      icon: <AlertCircle className="w-5 h-5" />,
      className: 'animate-slide-up',
    });
  },

  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(options?.title || message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <Info className="w-5 h-5" />,
      className: 'animate-slide-up',
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(options?.title || message, {
      description: options?.description,
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      className: 'animate-slide-up',
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      className: 'animate-slide-up',
    });
  },
};
