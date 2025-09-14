import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import Home from './Home';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useProfile();

  useEffect(() => {
    // If user is authenticated, show the main home experience
    // If not authenticated, they'll see the landing page via App.tsx routing
    if (!loading && !isAuthenticated) {
      // This will be handled by App.tsx - it shows PublicContent which routes to Landing
      return;
    }
  }, [isAuthenticated, loading, navigate]);

  // If loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your fashion dashboard...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the full home experience
  if (isAuthenticated) {
    return <Home />;
  }

  // Fallback - should not reach here due to App.tsx routing
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome to MyDresser</h1>
        <p className="text-muted-foreground">Your personal fashion assistant</p>
      </div>
    </div>
  );
};

export default Index;
