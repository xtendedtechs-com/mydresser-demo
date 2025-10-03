import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "@/components/providers/AppProviders";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import AppContent from "@/components/AppContent";
import PublicContent from "@/components/PublicContent";
import { useProfile } from "@/hooks/useProfile";

const App = () => {
  const { isAuthenticated, loading } = useProfile();

  if (loading) {
    return (
      <AppProviders>
        <LoadingSpinner />
      </AppProviders>
    );
  }

  return (
    <AppProviders>
      <BrowserRouter>
        {isAuthenticated ? <AppContent /> : <PublicContent />}
      </BrowserRouter>
    </AppProviders>
  );
};

export default App;