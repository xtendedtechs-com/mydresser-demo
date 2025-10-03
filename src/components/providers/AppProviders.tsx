import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import SecurityHeaders from "@/components/SecurityHeaders";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AppProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          <SecurityHeaders />
          {children}
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
