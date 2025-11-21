import { useProfile } from "@/hooks/useProfile";
import { Navigate, Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Loader2 } from "lucide-react";
import { useCameraScannerStore } from "@/stores/useCameraScannerStore";

interface LayoutProps {
  requireAuth?: boolean;
  requireRole?: 'private' | 'professional' | 'merchant' | 'admin';
}

export default function Layout({ requireAuth = false, requireRole }: LayoutProps) {
  const { user, profile, loading } = useProfile();
  const { isActive: isScannerActive } = useCameraScannerStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading MyDresser AI...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to auth if role is required but user doesn't have the right role
  if (requireRole && (!profile || profile.role !== requireRole)) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but no specific auth is required, don't show auth page
  if (user && window.location.pathname === '/auth') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {user && !isScannerActive && <Navigation />}
      <main className={user ? "pt-16 pb-16 md:pb-0" : ""}>
        <Outlet />
      </main>
      {user && !isScannerActive && <MobileNavigation />}
    </div>
  );
}