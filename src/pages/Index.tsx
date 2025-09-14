import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import Home from './Home';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, profile } = useProfile();

  useEffect(() => {
    // Check if user needs profile setup
    if (!loading && isAuthenticated && profile) {
      // If profile is incomplete, redirect to setup
      if (!profile.full_name) {
        navigate('/profile-setup');
        return;
      }
    }
  }, [isAuthenticated, loading, profile, navigate]);

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
