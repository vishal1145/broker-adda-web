"use client";
import React from "react";
import ComingSoon from "../components/ComingSoon";
import ProtectedRoute from "../components/ProtectedRoute";

const PropertiesManagement = () => {
  return (
    <ProtectedRoute>
      <ComingSoon
        title="Property Management"
        description="Property management system is under development. Coming soon!"
        icon="🏠"
      />
    </ProtectedRoute>
  );
};

export default PropertiesManagement;
