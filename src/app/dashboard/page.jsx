'use client';

import ComingSoon from '../components/ComingSoon';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <ComingSoon
        title="Dashboard"
        description="Your business dashboard is under development. Coming soon!"
        icon="📊"
      />
    </ProtectedRoute>
  );
};

export default Dashboard;