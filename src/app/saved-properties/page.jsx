"use client";

export const metadata = {
  title: 'Saved Properties | Your Favorite Properties | Broker Gully',
  description: 'View all your saved properties in one place. Access your favorite real estate listings and continue your property search on Broker Gully.',
};

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import HeaderFile from "../components/Header";
import ContentLoader from "react-content-loader";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const SavedProperties = () => {
  const { user, isAuthenticated } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Get current user ID from token
  const getCurrentUserIdFromToken = (jwtToken) => {
    try {
      if (!jwtToken || typeof window === "undefined") return "";
      const base64Url = jwtToken.split(".")[1];
      if (!base64Url) return "";
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      return (
        payload.brokerId || payload.userId || payload.id || payload.sub || ""
      );
    } catch {
      return "";
    }
  };

  // Fetch saved properties from API
  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!isAuthenticated() || !user?.token) {
        setLoading(false);
        setError("Please login to view saved properties");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token = user.token;
        const userId = getCurrentUserIdFromToken(token);
        
        // Build API URL with userId parameter
        const apiEndpoint = userId 
          ? `${apiUrl}/saved-properties?userId=${encodeURIComponent(userId)}`
          : `${apiUrl}/saved-properties`;
        
        const response = await fetch(apiEndpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch saved properties");
        }

        const data = await response.json();
        const savedProps =
          data?.data?.savedProperties ||
          data?.savedProperties ||
          data?.data ||
          [];

        // Extract property data from saved properties
        const properties = savedProps
          .map((savedProp) => {
            // Property data might be nested in propertyId or property field
            const property =
              savedProp.propertyId || savedProp.property || savedProp;

            if (!property) return null;

            // Map property to consistent format
            return {
              id: property._id || property.id,
              name: property.title || property.name || "Property",
              type: property.propertyType || property.type || property.category || "Property",
              price: property.price || 0,
              currentPrice: property.price
                ? `₹${Number(property.price).toLocaleString("en-IN")}`
                : "Price on request",
              rating: property.rating || 4.7,
              description:
                property.propertyDescription ||
                property.description ||
                "A spacious and well-lit property in a prime location, perfect for families.",
              bedrooms: property.bedrooms || 0,
              bathrooms: property.bathrooms || 0,
              city: property.city || "",
              region: property.region || "",
              amenities: property.amenities || [],
              images: property.images || [property.image] || [],
              image: property.images?.[0] || property.image || "/images/pexels-binyaminmellish-106399.jpg",
            };
          })
          .filter(Boolean);

        setSavedProperties(properties);
        setPagination({
          total: properties.length,
          page: 1,
          limit: itemsPerPage,
          totalPages: Math.ceil(properties.length / itemsPerPage),
          hasNextPage: properties.length > itemsPerPage,
          hasPrevPage: false,
        });
      } catch (err) {
        console.error("Error fetching saved properties:", err);
        setError(err.message || "Failed to load saved properties");
        setSavedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated() && user?.token) {
      fetchSavedProperties();
    }
  }, [isAuthenticated, user?.token, apiUrl, itemsPerPage]);

  // Handle remove from saved properties
  const handleRemoveSaved = async (propertyId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated() || !user?.token) {
      toast.error("Please login to remove saved properties");
      return;
    }

    try {
      const token = user.token;
      const response = await fetch(`${apiUrl}/saved-properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Remove from local state
        setSavedProperties((prev) =>
          prev.filter((p) => p.id !== propertyId)
        );
        toast.success("Property removed from saved list");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to remove property");
      }
    } catch (error) {
      console.error("Error removing saved property:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Pagination calculations
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return savedProperties.slice(startIndex, endIndex);
  }, [savedProperties, currentPage, itemsPerPage]);

  // Update pagination when properties change
  useEffect(() => {
    setPagination({
      total: savedProperties.length,
      page: currentPage,
      limit: itemsPerPage,
      totalPages: Math.ceil(savedProperties.length / itemsPerPage),
      hasNextPage: currentPage < Math.ceil(savedProperties.length / itemsPerPage),
      hasPrevPage: currentPage > 1,
    });
  }, [savedProperties, currentPage, itemsPerPage]);

  // Header data
  const headerData = {
    title: "Saved Properties",
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Saved Properties", href: "/saved-properties" },
    ],
  };

  return (
    <ProtectedRoute>
         <HeaderFile data={headerData} />
      <div className="min-h-screen ">
     
        <Toaster position="top-right" />
        
        <div className="w-full mx-auto  py-8">
          {/* Info message */}
          {!loading && savedProperties.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-600">
                You have {savedProperties.length} saved propert{savedProperties.length === 1 ? "y" : "ies"}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm"
                >
                  <ContentLoader
                    speed={2}
                    width="100%"
                    height={300}
                    viewBox="0 0 1000 300"
                    backgroundColor="#f3f4f6"
                    foregroundColor="#e5e7eb"
                  >
                    <rect x="0" y="0" rx="12" ry="12" width="400" height="300" />
                    <rect x="430" y="20" rx="4" ry="4" width="300" height="24" />
                    <rect x="430" y="60" rx="4" ry="4" width="500" height="16" />
                    <rect x="430" y="90" rx="4" ry="4" width="400" height="16" />
                    <rect x="430" y="120" rx="4" ry="4" width="350" height="16" />
                    <rect x="430" y="160" rx="4" ry="4" width="200" height="20" />
                    <rect x="430" y="200" rx="4" ry="4" width="300" height="20" />
                  </ContentLoader>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
              <svg
                className="w-16 h-16 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Saved Properties
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#0A421E] text-white rounded-lg hover:bg-[#0d5a2a] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : savedProperties.length === 0 ? (
            // Empty State
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <svg
                className="w-24 h-24 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Saved Properties Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start saving properties you like to view them here later.
              </p>
              <Link
                href="/search"
                className="inline-block px-6 py-3 bg-[#0A421E] text-white rounded-lg hover:bg-[#0d5a2a] transition-colors"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <>
              {/* Property Cards */}
              <div className="space-y-6">
                {paginatedProperties.map((property) => {
                  const propertyImage = Array.isArray(property.images) && property.images.length > 0
                    ? property.images[0]
                    : property.image || "/images/pexels-binyaminmellish-106399.jpg";

                  return (
                    <Link
                      key={property.id}
                      href={`/property-details/${property.id}`}
                      className="block"
                    >
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="flex h-[200px]">
                          {/* Image Section - Left */}
                          <div className="relative w-[400px] h-full flex-shrink-0">
                            {/* Property image */}
                            <div className="relative w-full h-full overflow-hidden rounded-l-xl">
                              <img
                                src={propertyImage}
                                alt={property.name}
                                className="block w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "/images/pexels-binyaminmellish-106399.jpg";
                                }}
                              />
                            </div>
                            {/* Tag overlay - top-left */}
                            <div className="absolute top-4 left-4">
                              <span className="bg-[#0A421E] text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                {property.type}
                              </span>
                            </div>
                            {/* Rating - top-right */}
                            <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-sm">
                              <svg
                                className="w-4 h-4 text-yellow-400 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-xs font-medium text-gray-700">
                                {property.rating}
                              </span>
                            </div>
                            {/* Price pill bottom-left */}
                            <div className="absolute bottom-4 left-4 z-10">
                              <span
                                className="px-2 py-0.5 rounded-full text-sm font-semibold"
                                style={{ backgroundColor: "#FDC700" }}
                              >
                                {property.currentPrice}
                              </span>
                            </div>
                            {/* Remove from saved button - bottom-right */}
                            <button
                              onClick={(e) => handleRemoveSaved(property.id, e)}
                              aria-label="Remove from saved"
                              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 z-10 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Details Section - Right */}
                          <div className="flex-1 p-4 flex flex-col">
                            {/* Title - One line */}
                            <h3
                              className="mb-1 flex items-center gap-2 line-clamp-1"
                              style={{
                                fontSize: "16px",
                                lineHeight: "22px",
                                fontWeight: "600",
                                color: "#171A1FFF",
                              }}
                            >
                              <span className="truncate">{property.name}</span>
                              <svg
                                className="w-3.5 h-3.5 text-[#0A421E] flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              >
                                <path d="M7 17l10-10M7 7h10v10" />
                              </svg>
                            </h3>

                            {/* Description - One line, short */}
                            <p
                              className="mb-3 line-clamp-1"
                              style={{
                                fontFamily: "Inter",
                                fontSize: "12px",
                                lineHeight: "16px",
                                fontWeight: "400",
                                color: "#565D6DFF",
                              }}
                            >
                              {property.description?.length > 80 
                                ? `${property.description.substring(0, 80)}...` 
                                : property.description}
                            </p>

                            {/* Features */}
                            {(property.bedrooms || property.bathrooms) && (
                              <div className="mb-2">
                                <div className="text-[12px] font-semibold text-gray-900 mb-1">
                                  Features
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {property.bedrooms > 0 && (
                                    <span
                                      className="inline-flex items-center gap-1 px-2.5 py-1"
                                      style={{
                                        background: "#EDFDF4FF",
                                        borderRadius: "9999px",
                                        borderWidth: "1px",
                                        borderColor: "#00000000",
                                        borderStyle: "solid",
                                      }}
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        style={{ color: "#19191FFF" }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M3 12h18M3 12l-1 8a2 2 0 002 2h16a2 2 0 002-2l-1-8M3 12V9a2 2 0 012-2h5m0 0h6a2 2 0 012 2v3m0 0v3a2 2 0 01-2 2h-6v0M9 21h6"
                                        />
                                      </svg>
                                      <span
                                        style={{
                                          fontFamily: "Inter",
                                          fontSize: "12px",
                                          lineHeight: "16px",
                                          fontWeight: "600",
                                          color: "#19191FFF",
                                        }}
                                      >
                                        {property.bedrooms} bd
                                      </span>
                                    </span>
                                  )}
                                  {property.bathrooms > 0 && (
                                    <span
                                      className="inline-flex items-center gap-1 px-2.5 py-1"
                                      style={{
                                        background: "#EDFDF4FF",
                                        borderRadius: "9999px",
                                        borderWidth: "1px",
                                        borderColor: "#00000000",
                                        borderStyle: "solid",
                                      }}
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        style={{ color: "#19191FFF" }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0h4a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0v4"
                                        />
                                      </svg>
                                      <span
                                        style={{
                                          fontFamily: "Inter",
                                          fontSize: "12px",
                                          lineHeight: "16px",
                                          fontWeight: "600",
                                          color: "#19191FFF",
                                        }}
                                      >
                                        {property.bathrooms} bt
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Amenities - Only 2 then +X more */}
                            {property.amenities &&
                              property.amenities.length > 0 && (
                                <div className="mt-auto">
                                  <div className="text-[12px] font-semibold text-gray-900 mb-1">
                                    Amenities
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-[11px]">
                                    {property.amenities
                                      .slice(0, 2)
                                      .map((amenity, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                                        >
                                          {typeof amenity === "string"
                                            ? amenity
                                            : amenity?.name || amenity}
                                        </span>
                                      ))}
                                    {property.amenities.length > 2 && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                        +{property.amenities.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.total > 0 && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!pagination.hasPrevPage}
                      className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                        !pagination.hasPrevPage
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    {Array.from({ length: pagination.totalPages }).map(
                      (_, idx) => {
                        const pageNum = idx + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          (pageNum >= pagination.page - 1 &&
                            pageNum <= pagination.page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                                pagination.page === pageNum
                                  ? "bg-[#0A421E] text-white border-[#0A421E]"
                                  : "bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === pagination.page - 2 ||
                          pageNum === pagination.page + 2
                        ) {
                          return (
                            <span
                              key={pageNum}
                              className="w-8 h-8 flex items-center justify-center text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(pagination.totalPages, prev + 1)
                        )
                      }
                      disabled={!pagination.hasNextPage}
                      className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                        !pagination.hasNextPage
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SavedProperties;
