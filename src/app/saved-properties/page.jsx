"use client";
import React from "react";
import ComingSoon from "../components/ComingSoon";
import ProtectedRoute from "../components/ProtectedRoute";

const SavedProperties = () => {
  return (
    <ProtectedRoute>
      <ComingSoon
        title="Saved Properties"
        description="Your saved properties feature is under development. Coming soon!"
        icon="❤️"
      />
    </ProtectedRoute>
  );
};

export default SavedProperties;
