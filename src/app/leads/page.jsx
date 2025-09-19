'use client';

import ComingSoon from '../components/ComingSoon';
import ProtectedRoute from '../components/ProtectedRoute';

const Leads = () => {
  return (
    <ProtectedRoute>
      <ComingSoon
        title="Leads & Visitors"
        description="Lead management system is under development. Coming soon!"
     
      />
    </ProtectedRoute>
  );
};

export default Leads;