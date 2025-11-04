"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import HeaderFile from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import ViewModeCustomerProfile from "./components/ViewMode";
import EditModeCustomerProfile from "./components/EditMode";
import CreateModeCustomerProfile from "./components/CreateMode";

const CustomerProfilePageInner = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('view');

  useEffect(() => {
    const urlMode = searchParams?.get('mode');
    setMode(urlMode || 'view');
  }, [searchParams]);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // Render create mode
  if (isCreateMode) {
    return (
      <ProtectedRoute requiredRole="customer">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <HeaderFile
          data={{
            title: "Create Customer Profile",
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: "Customer Profile", href: "/customer-profile" },
              { label: "Create", href: "/customer-profile?mode=create" },
            ],
          }}
        />
        <div className="min-h-screen bg-white py-12">
          <CreateModeCustomerProfile />
        </div>
      </ProtectedRoute>
    );
  }

  // Render view mode
  if (isViewMode) {
    return (
      <ProtectedRoute requiredRole="customer">
        <Toaster position="top-right" />
        <HeaderFile
          data={{
            title: "Customer Profile",
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: "Customer Profile", href: "/customer-profile" },
            ],
          }}
        />
        <div className=" bg-white py-12">
          <ViewModeCustomerProfile />
        </div>
      </ProtectedRoute>
    );
  }

  // Render edit mode
  if (isEditMode) {
    return (
      <ProtectedRoute requiredRole="customer">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <HeaderFile
          data={{
            title: "Edit Customer Profile",
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: "Customer Profile", href: "/customer-profile" },
              { label: "Edit", href: "/customer-profile?mode=edit" },
            ],
          }}
        />
        <div className="min-h-screen bg-white py-12">
          <EditModeCustomerProfile />
        </div>
      </ProtectedRoute>
    );
  }

  // Default to view mode
  return null;
};

const CustomerProfilePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerProfilePageInner />
    </Suspense>
  );
};

export default CustomerProfilePage;

