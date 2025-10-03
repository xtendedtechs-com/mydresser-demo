import { AppProviders } from "@/components/providers/AppProviders";
import { AuthWrapper } from "@/components/AuthWrapper";

const MyDresserApp = () => {
  return (
    <AppProviders>
      <AuthWrapper />
    </AppProviders>
  );
};

export default MyDresserApp;
