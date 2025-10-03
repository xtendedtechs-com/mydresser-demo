import { Suspense } from 'react';
import UserAnalyticsDashboard from '@/components/UserAnalyticsDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const UserAnalyticsPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading analytics..." />}>
      <div className="animate-fade-in">
        <UserAnalyticsDashboard />
      </div>
    </Suspense>
  );
};

export default UserAnalyticsPage;
