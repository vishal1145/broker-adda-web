"use client";
import React, { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import ContentLoader from "react-content-loader";
import data from "../data/furnitureData.json";
import HeaderFile from "../components/Header";
import PropertyEnquiryModal from "../components/PropertyEnquiryModal";
import ShareModal from "../components/ShareModal";
import ImageSliderModal from "../components/ImageSliderModal";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const TABS = [{ label: "Description" }, { label: "Review" }];

// Helper function to convert YouTube URL to embed URL
const getEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;

  // If already an embed URL, return as is
  if (trimmedUrl.includes('youtube.com/embed') || trimmedUrl.includes('youtu.be/embed')) {
    return trimmedUrl;
  }

  // Extract video ID from various YouTube URL formats
  let videoId = null;

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // youtube.com/embed/VIDEO_ID
  const embedMatch = trimmedUrl.match(/youtube\.com\/embed\/([^&\n?#]+)/);
  if (embedMatch) {
    videoId = embedMatch[1];
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }

  // If not a YouTube URL, return as is (for other video platforms)
  return trimmedUrl;
};

// Normalize and sanitize image URLs to avoid 404 placeholder loops
const PLACEHOLDER_PATTERNS = [
  "property-placeholder.jpg",
  "/images/property-placeholder.jpg",
  "https://brokergully.com/images/property-placeholder.jpg",
  "http://brokergully.com/images/property-placeholder.jpg",
  "https://www.brokergully.com/images/property-placeholder.jpg"
];

const isPlaceholderImage = (url) => {
  if (!url || typeof url !== "string") return true;
  const normalized = url.trim().toLowerCase();
  if (!normalized) return true;
  return PLACEHOLDER_PATTERNS.some((p) => normalized.includes(p));
};

const sanitizeImages = (images, fallback) => {
  const safeList = (Array.isArray(images) ? images : []).filter((img) => !isPlaceholderImage(img));
  if (safeList.length === 0 && fallback) safeList.push(fallback);
  return safeList;
};

function PropertyDetailsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Helper function to format listed date as relative time
  const formatListedDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // Helper function to format price based on value (thousands, lakhs, crores)
  const formatPrice = (price) => {
    if (!price || price === 0) return "0";
    // Convert to number
    const numPrice = typeof price === "string" ? parseFloat(price.replace(/[₹,]/g, '')) : price;
    if (isNaN(numPrice) || numPrice === 0) return "0";

    // If price is >= 1 crore (1,00,00,000)
    if (numPrice >= 10000000) {
      const crores = numPrice / 10000000;
      return `${crores.toFixed(2)} Cr`;
    }
    // If price is >= 1 lakh (1,00,000)
    else if (numPrice >= 100000) {
      const lakhs = numPrice / 100000;
      return `${lakhs.toFixed(2)} Lakhs`;
    }
    // If price is >= 1 thousand (1,000)
    else if (numPrice >= 1000) {
      const thousands = numPrice / 1000;
      return `${thousands.toFixed(2)} K`;
    }
    // If price is < 1 thousand, show as is
    else {
      return Math.round(numPrice).toLocaleString("en-IN");
    }
  };

  // Also support dynamic route /property-details/[id] by reading path when query is missing
  const [routeId, setRouteId] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const path = window.location.pathname || "";
      const m = path.match(/\/property-details\/(.+)$/);
      if (m && m[1]) setRouteId(m[1]);
    } catch { }
  }, []);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [agent, setAgent] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [similarProperties, setSimilarProperties] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [broker, setBroker] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingReview, setRatingReview] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [propertyRatings, setPropertyRatings] = useState([]);
  const [ratingsStats, setRatingsStats] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [path, setPath] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageSliderModalOpen, setIsImageSliderModalOpen] = useState(false);

  // Fetch property details from API
  useEffect(() => {
    setPath(window.location.pathname);
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError("");

      const idParam = searchParams?.get("id") || routeId;
      if (!idParam) {
        // Wait until an id is available (from dynamic route or query)
        return;
      }

      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || localStorage.getItem("authToken")
            : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(
          `${apiUrl}/properties/${encodeURIComponent(String(idParam))}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to fetch property details");

        const responseData = await res.json();
        const propertyData =
          responseData?.data?.property ||
          responseData?.property ||
          responseData?.data ||
          responseData;

        if (propertyData) {
          const safeImages = sanitizeImages(propertyData.images || [propertyData.image]);

          // Map API response to expected format
          const mappedProperty = {
            id: propertyData._id || propertyData.id || idParam,
            name: propertyData.title || propertyData.name || "Property",
            category:
              propertyData.propertyType ||
              propertyData.type ||
              propertyData.category ||
              "Property",
            price: propertyData.price || 0,
            originalPrice:
              propertyData.originalPrice || propertyData.oldPrice || 0,
            discount: propertyData.discount || "",
            rating: propertyData.rating || 4.7,
            reviewCount: propertyData.reviewCount || 245,
            image: safeImages[0] || "",
            images: safeImages,
            propertyDescription:
              propertyData.propertyDescription ||
              propertyData.description ||
              "",
            description:
              propertyData.description ||
              propertyData.propertyDescription ||
              "Modern property with excellent connectivity and amenities.",
            bedrooms: propertyData.bedrooms || 3,
            bathrooms: propertyData.bathrooms || 2,
            areaSqft:
              propertyData.propertySize ||
              propertyData.areaSqft ||
              propertyData.area ||
              1450,
            city: propertyData.city || "Delhi NCR",
            region: propertyData.region || "Prime Location",
            amenities: propertyData.amenities || [],
            nearbyAmenities: propertyData.nearbyAmenities || [],
            features: propertyData.features || [],
            locationBenefits: propertyData.locationBenefits || [],
            status: propertyData.status || "Available",
            address: propertyData.address || "",
            propertyType:
              propertyData.propertyType || propertyData.type || "Apartment",
            subType: propertyData.subType || "",
            facing: propertyData.facing || "East",
            floor: propertyData.floor || "5th of 12 floors",
            maintenance: propertyData.maintenance || "₹3,000/month",
            propertyTax: propertyData.propertyTax || "₹1,200/month",
            registrationCost:
              propertyData.registrationCost || "₹50,000 (approx)",
            loanAvailable: propertyData.loanAvailable !== false,
            pricePerSqft:
              propertyData.pricePerSqft ||
              (propertyData.price && propertyData.areaSqft
                ? Math.round(propertyData.price / propertyData.areaSqft)
                : 0),
            videos: Array.isArray(propertyData.videos) ? propertyData.videos : [],
            createdAt: propertyData.createdAt || propertyData.createdDate || propertyData.listedDate || null,
            // capture possible agent identifiers for downstream fetch
            _raw: propertyData,
          };
          setProduct(mappedProperty);
          setShowVideo(false); // Reset video state when product changes
          setSelectedImageIndex(0); // Reset selected image index when product changes

          // If broker object is embedded on the property, use it directly
          if (propertyData?.broker && typeof propertyData.broker === "object") {
            const b = propertyData.broker;
            const mappedAgent = {
              id: b._id || b.id || "",
              name: b.name || b.fullName || b.firmName || "Agent",
              phone: b.phone || b.mobile || "",
              email: b.email || "",
              firm: b.firmName || b.company || "",
              image:
                b.brokerImage ||
                b.profileImage ||
                b.avatar ||
                "/images/user-1.webp",
              region: (() => {
                const r = b.region;
                if (Array.isArray(r) && r.length > 0) {
                  const first = r[0];
                  return typeof first === "string"
                    ? first
                    : first?.name || first?.city || first?.state || "";
                }
                if (typeof r === "string") return r;
                if (r && typeof r === "object")
                  return r.name || r.city || r.state || "";
                return b.city || b.state || propertyData.city || propertyData.region || "";
              })(),
              experience: b.experience || b.experienceYears || "",
            };
            setAgent(mappedAgent);
            setBroker(b);
          }

          // Try to resolve an agent/broker id from the property payload
          const candidateId =
            (typeof propertyData?.createdBy === "object" &&
              propertyData.createdBy?._id
              ? propertyData.createdBy._id
              : typeof propertyData?.createdBy === "string"
                ? propertyData.createdBy
                : null) ||
            propertyData?.brokerId ||
            propertyData?.agentId ||
            propertyData?.ownerId ||
            propertyData?.userId;

          if (candidateId) {
            setAgentLoading(true);
            setAgentError("");
            try {
              const brokerRes = await fetch(
                `${apiUrl}/brokers/${encodeURIComponent(String(candidateId))}`,
                { headers }
              );
              if (brokerRes.ok) {
                const brokerJson = await brokerRes.json().catch(() => ({}));
                const brokerData =
                  brokerJson?.data?.broker ||
                  brokerJson?.broker ||
                  brokerJson?.data ||
                  brokerJson;
                if (brokerData) {
                  const mappedAgent = {
                    id: brokerData._id || brokerData.id || candidateId,
                    name:
                      brokerData.name ||
                      brokerData.fullName ||
                      brokerData.firmName ||
                      "Agent",
                    phone:
                      brokerData.phone ||
                      brokerData.mobile ||
                      brokerData.contact ||
                      "",
                    email: brokerData.email || "",
                    firm: brokerData.firmName || brokerData.company || "",
                    image:
                      brokerData.brokerImage ||
                      brokerData.profileImage ||
                      brokerData.avatar ||
                      "/images/user-1.webp",
                    region: (() => {
                      const r = brokerData.region;
                      if (Array.isArray(r) && r.length > 0) {
                        const first = r[0];
                        return typeof first === "string"
                          ? first
                          : first?.name || first?.city || first?.state || "";
                      }
                      if (typeof r === "string") return r;
                      if (r && typeof r === "object")
                        return r.name || r.city || r.state || "";
                      return brokerData.city || brokerData.state || "";
                    })(),
                    experience:
                      brokerData.experience || brokerData.experienceYears || "",
                  };
                  setAgent(mappedAgent);
                  setBroker(brokerData);
                }
              } else {
                setAgentError("Failed to fetch agent details");
              }
            } catch (e) {
              setAgentError("Failed to fetch agent details");
            } finally {
              setAgentLoading(false);
            }
          }
        } else {
          setError("Property not found");
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details");
        // Fallback to static data if API fails
        const items = data?.products?.items || [];
        const idNum = Number(idParam);
        const found = items.find((p) => p.id === idNum);
        if (found) {
          setProduct(found);
          setError("");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [searchParams, routeId]);

  // Fetch property ratings
  useEffect(() => {
    const fetchPropertyRatings = async () => {
      if (!product?.id && !product?._id) return;

      setRatingsLoading(true);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || localStorage.getItem("authToken")
            : null;
        const base =
          process.env.NEXT_PUBLIC_API_URL;
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const propertyId = product?.id || product?._id;
        const ratingsEndpoint = `/property-ratings/property/${encodeURIComponent(
          String(propertyId)
        )}`;

        const res = await fetch(`${base}${ratingsEndpoint}`, { headers });
        if (!res.ok) {
          throw new Error(`Failed to fetch ratings: ${res.status}`);
        }

        const data = await res.json();

        if (data.success && data.data) {
          // Set ratings array
          const ratings = Array.isArray(data.data.ratings)
            ? data.data.ratings
            : [];
          setPropertyRatings(ratings);

          // Set stats (averageRating, totalRatings, distribution)
          if (data.data.stats) {
            setRatingsStats(data.data.stats);
          
          }
        } else {
          // If no ratings found, set empty state
          setPropertyRatings([]);
          setRatingsStats(null);
        }
      } catch (e) {
        console.error("Error fetching property ratings:", e);
        setPropertyRatings([]);
        setRatingsStats(null);
      } finally {
        setRatingsLoading(false);
      }
    };

    fetchPropertyRatings();
  }, [product?.id, product?._id]);

  // Check if property is saved when product loads and user is authenticated
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!product?.id || !isAuthenticated() || !user?.token) {
        setIsSaved(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const token = user.token;
        const response = await fetch(`${apiUrl}/saved-properties`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const savedProperties =
            data?.data?.savedProperties || data?.savedProperties || [];
          const propertyId = product.id || product._id;
          const isPropertySaved = savedProperties.some(
            (sp) =>
              (sp.propertyId?._id || sp.propertyId?.id || sp.propertyId) ===
              propertyId ||
              (sp.property?._id || sp.property?.id || sp.property) ===
              propertyId ||
              sp._id === propertyId
          );
          setIsSaved(isPropertySaved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkSavedStatus();
  }, [product?.id, isAuthenticated, user?.token]);

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    // Check if user is authenticated
    if (!isAuthenticated() || !user?.token) {
      // Save current URL to redirect back after login
      const currentUrl = window.location.href;
      localStorage.setItem("returnUrl", currentUrl);
      router.push("/login");
      return;
    }

    if (!product?.id) {
      toast.error("Property information not available");
      return;
    }

    setSavingProperty(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const token = user.token;
      const propertyId = product.id || product._id;

      if (isSaved) {
        // Remove from saved properties
        const response = await fetch(
          `${apiUrl}/saved-properties/${propertyId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setIsSaved(false);
          toast.success("Property removed from saved list");
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || "Failed to remove property");
        }
      } else {
        // Add to saved properties
        const response = await fetch(`${apiUrl}/saved-properties`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId }),
        });

        if (response.ok) {
          setIsSaved(true);
          toast.success("Property saved successfully");
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || "Failed to save property");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setSavingProperty(false);
    }
  };

  // Fetch similar properties from API
  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!product) {
        return;
      }

      setSimilarLoading(true);
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || localStorage.getItem("authToken")
            : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Get current broker ID to filter out own properties
        let currentBrokerId = '';
        let currentUserId = '';
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserId = payload.brokerId || payload.userId || payload.id || payload.sub || '';

            // Fetch broker details to get the actual broker _id
            if (currentUserId) {
              try {
                const brokerRes = await fetch(`${apiUrl}/brokers/${currentUserId}`, {
                  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                });
                if (brokerRes.ok) {
                  const brokerData = await brokerRes.json();
                  const broker = brokerData?.data?.broker || brokerData?.broker || brokerData?.data || brokerData;
                  currentBrokerId = broker?._id || broker?.id || '';
                }
              } catch (err) {
                console.error('Error fetching broker details:', err);
              }
            }
          } catch (err) {
            console.error('Error parsing token:', err);
          }
        }

        // Get coordinates from the opened property
        let latitude = null;
        let longitude = null;
        const propertyData = product._raw || product;


        // First, check for direct latitude/longitude fields (most common in API response)
        if (propertyData?.latitude !== undefined && propertyData?.longitude !== undefined) {
          latitude = Number(propertyData.latitude);
          longitude = Number(propertyData.longitude);
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          } else {
            latitude = null;
            longitude = null;
          }
        }

        // If not found, check for location coordinates in property data
        if (!latitude || !longitude) {
          if (propertyData?.location?.coordinates && Array.isArray(propertyData.location.coordinates) && propertyData.location.coordinates.length >= 2) {
            // GeoJSON Point format: [longitude, latitude] OR API format: [latitude, longitude]
            // Try both formats
            const coords = propertyData.location.coordinates;
            // Check if it's likely [latitude, longitude] (latitude is usually -90 to 90)
            if (Math.abs(coords[0]) <= 90 && Math.abs(coords[1]) <= 180) {
              latitude = coords[0];
              longitude = coords[1];
            } else {
              // GeoJSON format: [longitude, latitude]
              longitude = coords[0];
              latitude = coords[1];
            }
          } else if (propertyData?.region && Array.isArray(propertyData.region) && propertyData.region.length > 0) {
            // Check if region has centerCoordinates
            const firstRegion = propertyData.region[0];
            if (firstRegion?.centerCoordinates && Array.isArray(firstRegion.centerCoordinates) && firstRegion.centerCoordinates.length >= 2) {
              // API format: [latitude, longitude]
              latitude = firstRegion.centerCoordinates[0];
              longitude = firstRegion.centerCoordinates[1];
            }
          } else if (propertyData?.region && typeof propertyData.region === 'object' && !Array.isArray(propertyData.region)) {
            // Check if region is a single object with centerCoordinates
            if (propertyData.region?.centerCoordinates && Array.isArray(propertyData.region.centerCoordinates) && propertyData.region.centerCoordinates.length >= 2) {
              latitude = propertyData.region.centerCoordinates[0];
              longitude = propertyData.region.centerCoordinates[1];
            }
          }
        }

        if (!latitude || !longitude) {
        }

        // Build API URL with coordinates if available
        const params = new URLSearchParams();
        if (latitude && longitude) {
          params.append("latitude", latitude.toString());
          params.append("longitude", longitude.toString());
          // Removed verificationStatus filter - fetch all properties
        } else {
          params.append("limit", "20");
          // Removed verificationStatus filter - fetch all properties
        }

        const res = await fetch(`${apiUrl}/properties?${params.toString()}`, {
          headers,
        });

        if (res.ok) {
          const responseData = await res.json();

          // Try different possible response structures
          let properties = [];
          if (responseData?.data?.properties) {
            properties = responseData.data.properties;
          } else if (responseData?.data?.items) {
            properties = responseData.data.items;
          } else if (responseData?.properties) {
            properties = responseData.properties;
          } else if (responseData?.data && Array.isArray(responseData.data)) {
            properties = responseData.data;
          } else if (Array.isArray(responseData)) {
            properties = responseData;
          }

          const currentPropertyId = product.id || product._id;

          // Filter out current property and logged-in broker's own properties
          const filteredProperties = properties.filter((p) => {
            const propertyId = p._id || p.id;

            // Exclude the current property
            if (propertyId === currentPropertyId) {
              return false;
            }

            // Filter out properties belonging to the logged-in broker
            if (currentBrokerId || currentUserId) {
              let propertyBrokerId = '';

              // Check broker field first (most common in API response)
              if (p.broker) {
                if (typeof p.broker === 'string') {
                  propertyBrokerId = p.broker;
                } else if (typeof p.broker === 'object' && p.broker !== null) {
                  propertyBrokerId = p.broker._id || p.broker.id || '';
                }
              }

              // If not found, check createdBy, postedBy
              if (!propertyBrokerId) {
                const createdBy = p.createdBy || p.postedBy;

                if (createdBy) {
                  if (typeof createdBy === 'string') {
                    propertyBrokerId = createdBy;
                  } else if (typeof createdBy === 'object' && createdBy !== null) {
                    const obj = createdBy;
                    const userId = obj.userId;

                    if (userId && typeof userId === 'object' && userId !== null) {
                      propertyBrokerId = userId._id || userId.id || '';
                    } else if (userId && typeof userId === 'string') {
                      propertyBrokerId = userId;
                    }

                    if (!propertyBrokerId) {
                      propertyBrokerId = obj._id || obj.id || obj.brokerId || '';
                    }
                  }
                }
              }

              const brokerIdStr = String(currentBrokerId || '').trim();
              const userIdStr = String(currentUserId || '').trim();
              const propertyBrokerIdStr = String(propertyBrokerId).trim();

              const matchesBrokerId = brokerIdStr !== '' && propertyBrokerIdStr === brokerIdStr;
              const matchesUserId = userIdStr !== '' && propertyBrokerIdStr === userIdStr;

              // Exclude if matches logged-in broker
              if (matchesBrokerId || matchesUserId) {
                return false;
              }
            }

            return true;
          });

          // Helper function to extract distance (in km)
          const getDistance = (p) => {
            const distance = p.distanceKm ?? p.distance;
            return Number.isFinite(Number(distance)) ? Number(distance) : Infinity;
          };

          // Sort by distance (closest first)
          const sorted = filteredProperties.sort((a, b) => {
            const distanceA = getDistance(a);
            const distanceB = getDistance(b);
            return distanceA - distanceB; // Ascending order (closest first)
          });

          // Limit to 4-5 properties
          const limited = sorted.slice(0, 5);

          // Map to expected format
          const similar = limited.map((p) => {
            const safeSimilarImages = sanitizeImages(p.images || [p.image]);
            return {
              id: p._id || p.id,
              name: p.title || p.name || "Property",
              category: p.propertyType || p.type || p.category || "Property",
              price: p.price || 0,
              originalPrice: p.originalPrice || p.oldPrice || 0,
              image: safeSimilarImages[0] || "",
              areaSqft: p.propertySize || p.areaSqft || p.area || 0,
              bedrooms: p.bedrooms || 0,
              bathrooms: p.bathrooms || 0,
              city: p.city || "",
              region: p.region || "",
            };
          });

          setSimilarProperties(similar);
        }
      } catch (error) {
        console.error("Error fetching similar properties:", error);
        setSimilarProperties([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [product]);

  // Update scroll button states when similar properties change
  useEffect(() => {
    const carousel = document.getElementById("related-properties-carousel");
    if (carousel) {
      const updateScrollState = () => {
        const { scrollLeft, scrollWidth, clientWidth } = carousel;
        const maxScroll = scrollWidth - clientWidth;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < maxScroll - 10);
      };

      updateScrollState();
      carousel.addEventListener("scroll", updateScrollState);
      return () => carousel.removeEventListener("scroll", updateScrollState);
    }
  }, [similarProperties]);

  const gallery = useMemo(() => {
    if (!product) return [];

    const images = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
    if (images.length === 0) return [];

    // Repeat images to ensure we have up to 6 slots, but keep actual URLs only
    const repeated = [];
    while (repeated.length < Math.min(6, images.length)) {
      repeated.push(images[repeated.length % images.length]);
    }

    return repeated;
  }, [product]);

  const price = product?.price || 0;
  const originalPrice = product?.originalPrice || 0;
  const discount = product?.discount || "";

  const headerData = {
    title: "Property Details",
    description: 'View property information, features, amenities, location details, and pricing.',
    // breadcrumb: [
    //   { label: "Home", href: "/" },
    //   { label: "Property Details", href: "/property-details" },
    // ],
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-10">
          <div className="w-full mx-auto">
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Main Content Skeleton */}
              <section className="md:col-span-8 space-y-12">
                {/* Gallery Skeleton */}
                <div className="space-y-4">
                  {/* Main Large Image */}
                  <div
                    className="bg-gray-50 rounded-2xl overflow-hidden relative"
                    style={{ width: "100%", height: "420px" }}
                  >
                    <ContentLoader
                      speed={2}
                      width={800}
                      height={420}
                      viewBox="0 0 800 420"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                      style={{ width: "100%", height: "100%" }}
                    >
                      {/* Main image */}
                      <rect
                        x="0"
                        y="0"
                        rx="16"
                        ry="16"
                        width="800"
                        height="420"
                      />
                      {/* Featured badge top-left */}
                      <rect
                        x="16"
                        y="16"
                        rx="8"
                        ry="8"
                        width="80"
                        height="32"
                      />
                      {/* Share button top-right */}
                      <circle cx="768" cy="40" r="20" />
                      {/* Heart button top-right */}
                      <circle cx="728" cy="40" r="20" />
                    </ContentLoader>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{
                          borderRadius: "8px",
                          overflow: "hidden",
                          height: "120px",
                        }}
                      >
                        <ContentLoader
                          speed={2}
                          width={150}
                          height={120}
                          viewBox="0 0 150 120"
                          backgroundColor="#f3f3f3"
                          foregroundColor="#ecebeb"
                          style={{ width: "100%", height: "100%" }}
                        >
                          <rect
                            x="0"
                            y="0"
                            rx="8"
                            ry="8"
                            width="150"
                            height="120"
                          />
                        </ContentLoader>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Details Skeleton */}
                <div className="w-full bg-white rounded-[16px] shadow-xs border border-gray-200 p-4 px-8">
                  <ContentLoader
                    speed={2}
                    width={600}
                    height={200}
                    viewBox="0 0 600 200"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="150" height="24" />

                    {/* 4 detail items in 2x2 grid */}
                    {/* Bedrooms */}
                    <circle cx="12" cy="60" r="10" />
                    <rect x="30" y="52" rx="4" ry="4" width="60" height="12" />
                    <rect x="30" y="68" rx="4" ry="4" width="80" height="16" />

                    {/* Property Size */}
                    <circle cx="312" cy="60" r="10" />
                    <rect x="330" y="52" rx="4" ry="4" width="80" height="12" />
                    <rect
                      x="330"
                      y="68"
                      rx="4"
                      ry="4"
                      width="100"
                      height="16"
                    />

                    {/* Listed */}
                    <circle cx="12" cy="120" r="10" />
                    <rect x="30" y="112" rx="4" ry="4" width="50" height="12" />
                    <rect x="30" y="128" rx="4" ry="4" width="90" height="16" />

                    {/* Price */}
                    <circle cx="312" cy="120" r="10" />
                    <rect
                      x="330"
                      y="112"
                      rx="4"
                      ry="4"
                      width="50"
                      height="12"
                    />
                    <rect
                      x="330"
                      y="128"
                      rx="4"
                      ry="4"
                      width="120"
                      height="16"
                    />
                  </ContentLoader>
                </div>

                {/* Nearby Amenities Skeleton */}
                <div className="w-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <ContentLoader
                    speed={2}
                    width={600}
                    height={200}
                    viewBox="0 0 600 200"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="150" height="24" />

                    {/* Amenity items in 2 columns */}
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const row = Math.floor(i / 2);
                      const col = i % 2;
                      const x = col * 280;
                      const y = 40 + row * 30;
                      return (
                        <React.Fragment key={i}>
                          <circle cx={x} cy={y + 6} r="3" />
                          <rect
                            x={x + 10}
                            y={y}
                            rx="4"
                            ry="4"
                            width={120}
                            height="12"
                          />
                        </React.Fragment>
                      );
                    })}
                  </ContentLoader>
                </div>

                {/* Description Tab Section Skeleton */}
                <div className="mt-8 w-full">
                  {/* Tabs */}
                  <div className="inline-flex gap-2 mb-6 bg-gray-100 rounded-md border border-gray-200 p-1">
                    <ContentLoader
                      speed={2}
                      width={200}
                      height={48}
                      viewBox="0 0 200 48"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                    >
                      <rect
                        x="24"
                        y="12"
                        rx="6"
                        ry="6"
                        width="80"
                        height="24"
                      />
                      <rect
                        x="112"
                        y="12"
                        rx="6"
                        ry="6"
                        width="60"
                        height="24"
                      />
                    </ContentLoader>
                  </div>

                  {/* Tab Content */}
                  <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
                    <ContentLoader
                      speed={2}
                      width={600}
                      height={150}
                      viewBox="0 0 600 150"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <rect x="0" y="0" rx="4" ry="4" width="600" height="12" />
                      <rect
                        x="0"
                        y="20"
                        rx="4"
                        ry="4"
                        width="570"
                        height="12"
                      />
                      <rect
                        x="0"
                        y="40"
                        rx="4"
                        ry="4"
                        width="540"
                        height="12"
                      />
                      <rect
                        x="0"
                        y="60"
                        rx="4"
                        ry="4"
                        width="510"
                        height="12"
                      />
                      <rect
                        x="0"
                        y="80"
                        rx="4"
                        ry="4"
                        width="600"
                        height="12"
                      />
                      <rect
                        x="0"
                        y="100"
                        rx="4"
                        ry="4"
                        width="552"
                        height="12"
                      />
                    </ContentLoader>
                  </div>
                </div>

                {/* Key Features and Location Benefits Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <ContentLoader
                      speed={2}
                      width={300}
                      height={180}
                      viewBox="0 0 300 180"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <rect x="0" y="0" rx="4" ry="4" width="120" height="20" />
                      {[0, 1, 2, 3].map((i) => (
                        <React.Fragment key={i}>
                          <circle cx="12" cy={40 + i * 32} r="10" />
                          <rect
                            x="30"
                            y={32 + i * 32}
                            rx="4"
                            ry="4"
                            width="150"
                            height="12"
                          />
                        </React.Fragment>
                      ))}
                    </ContentLoader>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <ContentLoader
                      speed={2}
                      width={300}
                      height={180}
                      viewBox="0 0 300 180"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <rect x="0" y="0" rx="4" ry="4" width="140" height="20" />
                      {[0, 1, 2, 3].map((i) => (
                        <React.Fragment key={i}>
                          <circle cx="12" cy={40 + i * 32} r="10" />
                          <rect
                            x="30"
                            y={32 + i * 32}
                            rx="4"
                            ry="4"
                            width="150"
                            height="12"
                          />
                        </React.Fragment>
                      ))}
                    </ContentLoader>
                  </div>
                </div>
              </section>

              {/* Right Sidebar Skeleton */}
              <aside className="md:col-span-4 space-y-8">
                {/* Property Header Skeleton */}
                <div className="bg-white rounded-[16px] border border-gray-200 shadow-xs p-6">
                  <ContentLoader
                    speed={2}
                    width={400}
                    height={250}
                    viewBox="0 0 400 250"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Header */}
                    <rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
                    <rect
                      x="320"
                      y="4"
                      rx="12"
                      ry="12"
                      width="60"
                      height="20"
                    />

                    {/* Title */}
                    <rect x="0" y="40" rx="4" ry="4" width="200" height="20" />

                    {/* Location lines */}
                    <rect x="0" y="70" rx="4" ry="4" width="180" height="14" />
                    <rect x="0" y="90" rx="4" ry="4" width="150" height="14" />

                    {/* Price */}
                    <rect x="0" y="115" rx="4" ry="4" width="180" height="28" />

                    {/* Buttons */}
                    <rect
                      x="0"
                      y="160"
                      rx="6"
                      ry="6"
                      width="100%"
                      height="40"
                    />
                    <rect
                      x="0"
                      y="210"
                      rx="6"
                      ry="6"
                      width="100%"
                      height="40"
                    />
                  </ContentLoader>
                </div>

                {/* Agent Details Skeleton */}
                <div className="border border-gray-200 p-6 w-full bg-white rounded-[16px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
                  <ContentLoader
                    speed={2}
                    width={400}
                    height={180}
                    viewBox="0 0 400 180"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="120" height="24" />

                    {/* Avatar */}
                    <circle cx="24" cy="50" r="24" />

                    {/* Name and details */}
                    <rect x="60" y="40" rx="4" ry="4" width="140" height="16" />
                    <rect x="60" y="62" rx="4" ry="4" width="100" height="12" />
                    <rect x="60" y="80" rx="4" ry="4" width="180" height="12" />

                    {/* Chat button */}
                    <rect
                      x="0"
                      y="110"
                      rx="10"
                      ry="10"
                      width="100%"
                      height="40"
                    />
                  </ContentLoader>
                </div>

                {/* Property Rating Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <ContentLoader
                    speed={2}
                    width={400}
                    height={150}
                    viewBox="0 0 400 150"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="140" height="24" />

                    {/* Rating number and stars */}
                    <rect x="150" y="40" rx="4" ry="4" width="60" height="36" />
                    {[0, 1, 2, 3, 4].map((i) => (
                      <circle key={i} cx={220 + i * 30} cy="58" r="12" />
                    ))}

                    {/* Review count */}
                    <rect
                      x="130"
                      y="90"
                      rx="4"
                      ry="4"
                      width="140"
                      height="14"
                    />
                  </ContentLoader>
                </div>


                {/* Virtual Tour Skeleton */}
                <div className="w-full h-[232px] bg-[#EDFDF4] rounded-[16px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
                  <ContentLoader
                    speed={2}
                    width={400}
                    height={232}
                    viewBox="0 0 400 232"
                    backgroundColor="#e0f2e9"
                    foregroundColor="#c8e6d5"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Video icon */}
                    <circle cx="200" cy="90" r="24" />
                    {/* Title */}
                    <rect
                      x="140"
                      y="130"
                      rx="4"
                      ry="4"
                      width="120"
                      height="20"
                    />
                    {/* Subtitle */}
                    <rect
                      x="80"
                      y="158"
                      rx="4"
                      ry="4"
                      width="240"
                      height="14"
                    />
                    {/* Button */}
                    <rect
                      x="150"
                      y="185"
                      rx="6"
                      ry="6"
                      width="100"
                      height="40"
                    />
                  </ContentLoader>
                </div>
              </aside>
            </div>

            {/* Related Properties Skeleton */}
            <div className="mt-12 w-full">
              <div className="flex items-center justify-between mb-4">
                <ContentLoader
                  speed={2}
                  width={180}
                  height={32}
                  viewBox="0 0 180 32"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                >
                  <rect x="0" y="4" rx="4" ry="4" width="150" height="24" />
                </ContentLoader>
                <ContentLoader
                  speed={2}
                  width={80}
                  height={32}
                  viewBox="0 0 80 32"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                >
                  <rect x="0" y="0" rx="8" ry="8" width="80" height="32" />
                </ContentLoader>
              </div>

              <div className="flex gap-6 min-w-0 pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-80 bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
                  >
                    <ContentLoader
                      speed={2}
                      width={320}
                      height={280}
                      viewBox="0 0 320 280"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                    >
                      {/* Image */}
                      <rect
                        x="0"
                        y="0"
                        rx="8"
                        ry="8"
                        width="320"
                        height="200"
                      />
                      {/* Category */}
                      <rect
                        x="0"
                        y="220"
                        rx="4"
                        ry="4"
                        width="80"
                        height="12"
                      />
                      {/* Name */}
                      <rect
                        x="0"
                        y="240"
                        rx="4"
                        ry="4"
                        width="200"
                        height="16"
                      />
                      {/* Details */}
                      <rect
                        x="0"
                        y="262"
                        rx="4"
                        ry="4"
                        width="150"
                        height="12"
                      />
                      {/* Price */}
                      <rect
                        x="0"
                        y="278"
                        rx="4"
                        ry="4"
                        width="120"
                        height="14"
                      />
                    </ContentLoader>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-10">
          <div className="w-full mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading Property
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No property found
  if (!product) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-10">
          <div className="w-full mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Property Not Found
                </h3>
                <p className="text-gray-600 mb-4">
                  The property you're looking for doesn't exist or has been
                  removed.
                </p>
                <Link
                  href="/properties"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
      <HeaderFile data={headerData} />
      <div className="py-10">
        <div className="w-full mx-auto">
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Main Content */}
            <section className="md:col-span-8 space-y-12">
              {/* Property Overview Card */}
              <div className=" space-y-6">
                {/* <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                   <h2 className="text-xl font-semibold text-gray-900">Property Overview</h2>
                </div>
                <div className="flex items-center gap-2">
                   <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">Available</span>
                   <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">New Listing</span>
            </div>
          </div> */}

                <div className="space-y-4">
                  {/* Main Large Image */}
                  <div className="bg-gray-50 rounded-2xl overflow-hidden relative group">
                    {gallery.length > 0 ? (
                      <img
                        src={gallery[selectedImageIndex]}
                        alt="Property"
                        className="w-full h-[360px] md:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => setIsImageSliderModalOpen(true)}
                      />
                    ) : (
                      <div className="w-full h-[360px] md:h-[420px] flex items-center justify-center text-gray-500">
                        No images available
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1.5  backdrop-blur-sm text-white text-sm font-medium rounded-lg ">
                        Featured
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="w-[40px] h-[40px] px-[10px] flex items-center justify-center text-[#171A1F] bg-white/80 backdrop-blur-sm opacity-100 border-none rounded-full hover:text-[#171A1F] hover:bg-white/80 active:text-[#171A1F] active:bg-white/80 disabled:opacity-40 transition-colors"
                        title="Share on Facebook"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={handleWishlistToggle}
                        disabled={savingProperty}
                        className={`w-[40px] h-[40px] px-[10px] flex items-center justify-center bg-white/80 backdrop-blur-sm opacity-100 border-none rounded-full hover:text-[#171A1F] hover:bg-white/80 active:text-[#171A1F] active:bg-white/80 disabled:opacity-40 transition-colors ${isSaved ? "text-red-500" : "text-[#171A1F]"
                          }`}
                        title={isSaved ? "Remove from saved" : "Save property"}
                      >
                        {isSaved ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
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
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex gap-3">
                    {gallery.slice(1, 6).map((img, index) => {
                      const thumbnailIndex = index + 1; // +1 because we're slicing from index 1
                      const isSelected = selectedImageIndex === thumbnailIndex;
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedImageIndex(thumbnailIndex)}
                          className={`flex-1 bg-gray-50 overflow-hidden relative group cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-[#0D542B] ring-offset-2' : ''
                            }`}
                          style={{ borderRadius: "8px" }}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className={`w-full h-[120px] object-cover group-hover:scale-105 transition-transform duration-300 ${isSelected ? 'opacity-100' : 'opacity-90'
                              }`}
                            style={{ borderRadius: "8px" }}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#0D542B]/10 pointer-events-none" style={{ borderRadius: "8px" }}></div>
                          )}
                        </div>
                      );
                    })}
                    {/* If we have more than 5 images, show placeholder with count */}
                    {gallery.length > 6 && (
                      <div
                        className="flex-1 bg-gray-50 overflow-hidden relative group cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center"
                        style={{ borderRadius: "8px" }}
                      >
                        <span className="text-sm font-medium text-gray-500">
                          +{gallery.length - 6} More
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Details Grid */}
                <div className="space-y-4 w-full bg-white rounded-[16px] shadow-xs border border-gray-200 p-4 px-8">
                  <div className="flex items-center gap-2 ">
                    {/* <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span> */}
                    <h3 className="text-[18px] leading-[28px] font-semibold text-[#171A1F]">
                      Property Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="mt-3 justify-center">
                        <svg
                          className="w-[20px] h-[20px]  text-[#565D6D]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="10" width="18" height="7" rx="1" />
                          <path d="M7 10V7a2 2 0 012-2h6a2 2 0 012 2v3" />
                        </svg>
                      </span>
                      <div>
                        <div className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">
                          Bedrooms
                        </div>
                        <div className="font-inter text-[14px] leading-[24px] font-medium text-[#171A1F]">
                          {product.bedrooms} BHK
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className=" justify-center mt-3">
                        <svg
                          className="w-[20px] h-[20px]  text-[#565D6D]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="6" width="18" height="12" rx="2" />
                        </svg>
                      </span>
                      <div>
                        <div className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">
                          Built-up Area
                        </div>
                        <div className="font-inter text-[14px] leading-[24px] font-medium text-[#171A1F]">
                          {product.areaSqft?.toLocaleString("en-IN")} sq.ft
                        </div>
                      </div>
                    </div>
                    {/* <div className="flex items-start gap-3">
  <span className="mt-3 flex items-center justify-center">
   
    <img
      src="/images/lucide-SquareStack-Outlined.svg"
      alt="size icon"
      className="w-[20px] h-[20px]"
    />
  </span>
  <div>
    <div className="font-inter text-[14px] leading-[20px] font-normal text-[#565D6D]">Size</div>
    <div className="font-inter text-[16px] leading-[24px] font-medium text-[#171A1F]">
      {product?.createdAt ? new Date(product.createdAt).toLocaleDateString() : '3 days ago'}
    </div>
  </div>
</div> */}
                    <div className="flex items-start gap-3">
                      <span className="mt-3 justify-center">
                        <svg
                          className="w-[20px] h-[20px]  text-[#565D6D]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 3" />
                        </svg>
                      </span>
                      <div>
                        <div className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">
                          Listed
                        </div>
                        <div className="font-inter text-[14px] leading-[24px] font-medium text-[#171A1F]">
                          {formatListedDate(product?.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-3 justify-center">
                        <svg
                          className="w-[20px] h-[20px]  text-[#565D6D]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                      </span>
                      <div>
                        <div className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">
                          Price
                        </div>
                        <div className="font-inter text-[14px] leading-[24px] font-medium text-[#171A1F]">
                          ₹{formatPrice(price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                {/* <div className="border-t border-gray-100"></div> */}
              </div>

              {/* Neighborhood Section - Compact Design */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Nearby Amenities */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  {/* Header */}
                  <h3 className="font-inter text-[18px] leading-[28px] font-semibold text-[#171A1F] mb-4">
                    Nearby Amenities
                  </h3>

                  {/* Amenities */}
                  {product?.nearbyAmenities?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {product.nearbyAmenities.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-inter text-[12px] leading-[20px] font-medium border border-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No nearby amenities listed.
                    </div>
                  )}
                </div>

                {/* Amenities */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  {/* Header */}
                  <h3 className="font-inter text-[18px] leading-[28px] font-semibold text-[#171A1F] mb-4">
                    Amenities
                  </h3>

                  {/* Amenities */}
                  {product?.amenities?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {product.amenities.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-inter text-[12px] leading-[20px] font-medium border border-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No amenities listed.
                    </div>
                  )}
                </div>
              </div>

              {/* Key Features and Location Benefits - Outside the tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h4 className="font-bold text-gray-900 mb-6 text-[18px]">
                    Key Features
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(product?.features && product.features.length > 0
                      ? product.features
                      : ["Corner Unit", "Park Facing"]
                    ).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-inter text-[12px] leading-[20px] font-medium border border-gray-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h4 className="font-bold text-gray-900 mb-6 text-[18px]">
                    Location Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(product?.locationBenefits &&
                      product.locationBenefits.length > 0
                      ? product.locationBenefits
                      : ["Near IT Park", "Easy Highway Access"]
                    ).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-inter text-[12px] leading-[20px] font-medium border border-gray-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Property Details Tabs Section */}
              <div className="mt-8 w-full">
                {/* Tabs */}
                <div className="inline-flex gap-2 mb-6 bg-gray-100 rounded-md border border-gray-200 ">
                  {TABS.map((tab, idx) => (
                    <button
                      key={tab.label}
                      onClick={() => setActiveTab(idx)}
                      className={`px-6 py-3 text-base font-medium focus:outline-none transition-all rounded-md ${activeTab === idx
                        ? "text-[#171A1F] bg-[#E6F7ED]"
                        : "text-[#565D6D] hover:text-[#171A1F]"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
                    {activeTab === 0 && (
                      <div className="prose prose-gray max-w-none">
                        {(product?.propertyDescription ||
                          product?.description) && (
                            <p className="w-full font-inter text-[12px] leading-[24px] font-normal text-[#565D6D]">
                              {product.propertyDescription ||
                                product.description}
                            </p>
                          )}
                      </div>
                    )}

                    {activeTab === 1 && <></>}

                    {activeTab === 1 && (
                      <div className="space-y-8">
                        <div>
                          <div className="flex items-center gap-2 mb-6">
                            <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                            <h3 className="text-[18px] font-bold text-gray-900">
                              Reviews & Ratings
                            </h3>
                          </div>

                          {/* Overall Rating */}
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                              <div className="text-center md:text-left">
                                <div className="text-6xl font-bold text-gray-900 mb-2">
                                  {ratingsStats?.averageRating
                                    ? ratingsStats.averageRating.toFixed(1)
                                    : (product?.rating || 0).toFixed(1)}
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => {
                                    const avgRating =
                                      ratingsStats?.averageRating ||
                                      product?.rating ||
                                      0;
                                    return (
                                      <svg
                                        key={i}
                                        className={`w-6 h-6 ${i < Math.round(avgRating)
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                          }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    );
                                  })}
                                </div>
                                <div className="text-[14px] text-gray-600 mb-1">
                                  {(() => {
                                    const avg =
                                      ratingsStats?.averageRating ||
                                      product?.rating ||
                                      0;
                                    if (avg >= 4.5) return "Excellent";
                                    if (avg >= 3.5) return "Very Good";
                                    if (avg >= 2.5) return "Good";
                                    if (avg >= 1.5) return "Fair";
                                    return "Poor";
                                  })()}
                                </div>
                                <div className="text-[12px] text-gray-500">
                                  Based on{" "}
                                  {ratingsStats?.totalRatings ||
                                    propertyRatings?.length ||
                                    0}{" "}
                                  {ratingsStats?.totalRatings === 1
                                    ? "review"
                                    : "reviews"}
                                </div>
                              </div>
                              <div className="flex-1 w-full">
                                {[5, 4, 3, 2, 1].map((star) => {
                                  const distribution =
                                    ratingsStats?.distribution || {};
                                  const count = distribution[star] || 0;
                                  const total =
                                    ratingsStats?.totalRatings ||
                                    propertyRatings?.length ||
                                    1;
                                  const percentage =
                                    total > 0
                                      ? Math.round((count / total) * 100)
                                      : 0;
                                  return (
                                    <div
                                      key={star}
                                      className="flex items-center gap-3 mb-3"
                                    >
                                      <span className="w-12 text-gray-700 text-[12px] font-medium">
                                        {star} Star
                                      </span>
                                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-[12px] text-gray-600 w-8 text-right">
                                        {percentage}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Individual Reviews */}
                          <div className="space-y-6">
                            <h4 className="text-[18px] font-bold text-gray-900 mb-4">
                              Recent Reviews
                            </h4>
                            {ratingsLoading ? (
                              <div className="text-center py-8">
                                <div className="text-gray-400">
                                  Loading reviews...
                                </div>
                              </div>
                            ) : propertyRatings &&
                              propertyRatings.length > 0 ? (
                              <>
                                {propertyRatings.map((review) => {
                                  const userName =
                                    review.userId?.name || "Anonymous";
                                  const userInitials = userName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);
                                  const reviewDate = review.createdAt
                                    ? new Date(review.createdAt)
                                    : null;
                                  const formatDate = (date) => {
                                    if (!date) return "Recently";
                                    const now = new Date();
                                    const diffTime = Math.abs(now - date);
                                    const diffDays = Math.floor(
                                      diffTime / (1000 * 60 * 60 * 24)
                                    );
                                    if (diffDays === 0) return "Today";
                                    if (diffDays === 1) return "Yesterday";
                                    if (diffDays < 7)
                                      return `${diffDays} days ago`;
                                    if (diffDays < 30)
                                      return `${Math.floor(
                                        diffDays / 7
                                      )} weeks ago`;
                                    if (diffDays < 365)
                                      return `${Math.floor(
                                        diffDays / 30
                                      )} months ago`;
                                    return date.toLocaleDateString();
                                  };

                                  return (
                                    <div
                                      key={review._id}
                                      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
                                    >
                                      <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-[14px]">
                                            {userInitials}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <h5 className="font-semibold text-[14px] text-gray-900">
                                                {userName}
                                              </h5>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                  <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating
                                                      ? "text-yellow-400"
                                                      : "text-gray-300"
                                                      }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                  </svg>
                                                ))}
                                              </div>
                                              <span className="text-[12px] text-gray-500">
                                                {formatDate(reviewDate)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {review.review && (
                                        <p className="text-[12px] text-gray-700 leading-6">
                                          {review.review}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-gray-400 mb-2">
                                  No reviews yet
                                </div>
                                <div className="text-[12px] text-gray-500">
                                  Be the first to review this property!
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </section>

            {/* Right Sidebar - Enhanced Content */}
            <aside className="md:col-span-4 space-y-8">
              {/* Property Header - Lead Detail Style */}
              <div className="bg-white rounded-[16px] border border-gray-200 shadow-xs p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  {/* Left side - label and line */}
                  <div className="flex items-center gap-2">
                    {/* <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span> */}
                    <h3 className=" top-[19px] left-[16px] font-inter text-[18px] leading-[28px] font-semibold text-[#171A1F]">
                      Property Details
                    </h3>
                  </div>

                  {/* Right side - status badge */}
                  {/* <span className="font-inter text-[12px] leading-[20px] font-normal opacity-100">
    {product.status}
  </span> */}
                </div>

                <div className="flex items-start gap-4 mb-6">
                  {/* <div className="relative">
                 <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                   <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                     <polyline points="9,22 9,12 15,12 15,22"/>
                   </svg>
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                   <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                   </svg>
                 </div>
               </div> */}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-[16px] font-semibold text-gray-900">
                        {product?.name || "Property"}
                      </h1>
                      {/* <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                       {product.status}
                     </span> */}
                    </div>
                    <p className="top-[61px] left-[16px] font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">
                      {typeof product.region === "object"
                        ? product.region?.name ||
                        [product.region?.city, product.region?.state]
                          .filter(Boolean)
                          .join(", ")
                        : product.region}
                    </p>
                    <p className="top-[61px] left-[16px] font-inter text-[12px] leading-[20px] font-normal text-[#565D6D] mt-2">
                      • Listed {formatListedDate(product?.createdAt)}
                    </p>
                    <p className="  text-[18px] leading-[32px] font-bold text-[#0D542B] mt-2">
                      ₹{formatPrice(price)}
                    </p>
                  </div>
                </div>

                {/* Actions - Below the content */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsEnquiryModalOpen(true)}
                    className="w-full h-[40px] px-[12px] flex items-center justify-center gap-[16px] font-inter text-[14px] leading-[22px] font-medium text-white bg-[#0D542B] rounded-[6px] border-0 hover:bg-[#0B4624] active:bg-[#08321A] disabled:opacity-40"
                  >
                    Inquiry
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
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Agent Details */}
              <div className="border border-gray-200 p-6 w-full bg-white rounded-[16px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="font-inter text-[18px] leading-[28px] font-semibold text-[#171A1F]">
                    Agent Details
                  </h3>
                </div>

                {agentLoading ? (
                  /* Skeleton */
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ) : agent ? (
                  <>
                    {/* Avatar + text */}
                    <div className="flex items-center gap-3">
                      <img
                        src={agent.image}
                        alt="Agent"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="leading-[20px]">
                        <div className="font-inter font-semibold text-gray-900">
                          {agent.name}
                        </div>
                        {/* Optional phone */}
                        {/* {agent.phone && (
            <div className="text-sm text-gray-500">{agent.phone}</div>
          )} */}
                        {agent.firm && (
                          <div className="text-[12px] text-gray-500">
                            {agent.firm}
                          </div>
                        )}
                        <div className="text-[12px] text-gray-400">
                          {`Expert Broker${agent?.region
                            ? " • " +
                            (typeof agent.region === "object"
                              ? agent.region?.name ||
                              [agent.region?.city, agent.region?.state]
                                .filter(Boolean)
                                .join(", ")
                              : agent.region)
                            : ""
                            }`}
                        </div>
                      </div>
                    </div>

                    {/* Chat button */}
                    {broker && (
                      <button
                        onClick={() => {
                          // Check if user is logged in
                          const token =
                            typeof window !== "undefined"
                              ? localStorage.getItem("token") ||
                              localStorage.getItem("authToken")
                              : null;

                          if (!token) {
                            // User not logged in, redirect to login page
                            router.push(`/login?redirect=${path}`);
                            return;
                          }

                          // User is logged in, open chat
                          if (window.openChatWithBroker) {
                            window.openChatWithBroker({ broker });
                          }
                        }}
                        type="button"
                        className="mt-4 w-full h-10 flex items-center justify-center font-inter text-[14px] leading-[22px] font-medium text-[#323742] bg-[#F3F4F6] rounded-[10px] hover:bg-[#E9EBEF] active:bg-[#D9DEE6] disabled:opacity-40"
                      >
                        Chat Now
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Agent details not available.
                  </div>
                )}
              </div>

              {/* Property Rating */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  {/* <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span> */}
                  <h3 className="font-inter text-[18px] leading-[28px] font-semibold text-[#171A1F]">
                    Property Rating
                  </h3>
                </div>

                {/* Only show rating display if rating exists */}
                {ratingsStats?.averageRating ? (
                  <>
                    <div className="flex items-center justify-center">
                      {/* Stars with partial fill support - only show stars, no rating number */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => {
                          const avgRating = ratingsStats.averageRating;
                          const fillPercentage = Math.max(
                            0,
                            Math.min(100, (avgRating - i) * 100)
                          );

                          return (
                            <div key={i} className="relative w-[24px] h-[24px]">
                              {/* Gray background star */}
                              <svg
                                className="w-[24px] h-[24px] text-gray-300 absolute inset-0"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.164L12 18.896l-7.334 3.864 1.4-8.164L.132 9.21l8.2-1.192z" />
                              </svg>
                              {/* Yellow filled star (with clip path for partial fill) */}
                              {fillPercentage > 0 && (
                                <div className="absolute inset-0 overflow-hidden">
                                  <svg
                                    className="w-[24px] h-[24px] text-yellow-400"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    style={{
                                      clipPath: `inset(0 ${100 - fillPercentage
                                        }% 0 0)`,
                                    }}
                                  >
                                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.164L12 18.896l-7.334 3.864 1.4-8.164L.132 9.21l8.2-1.192z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : null}

                {/* Rating Button - Always show */}
                <button
                  onClick={() => {
                    // Check if user is logged in
                    const token =
                      typeof window !== "undefined"
                        ? localStorage.getItem("token") ||
                        localStorage.getItem("authToken")
                        : null;

                    if (!token) {
                      router.push("/login");
                      return;
                    }
                    setShowRatingModal(true);
                  }}
                  className={`w-full h-[40px] px-3 flex items-center justify-center gap-2 font-inter text-[12px] leading-[22px] font-medium text-[#0D542B] bg-white border border-[#0D542B] hover:bg-[#EDFDF4] hover:active:bg-[#D9F5E8] disabled:opacity-40 rounded-md transition-colors ${ratingsStats?.averageRating ? "mt-4" : "mt-0"
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
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Rate This Property
                </button>
              </div>

              {/* Virtual Tour */}
              {product?.videos && product.videos.length > 0 ? (
                <div className="w-full bg-[#EDFDF4] rounded-[16px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] overflow-hidden">
                  {showVideo ? (
                    <div className="relative w-full bg-black rounded-[16px] overflow-hidden" style={{ minHeight: '232px' }}>
                      {(() => {
                        const videoUrl = product.videos[0];
                        const embedUrl = getEmbedUrl(videoUrl);
                        const isYouTube = embedUrl && embedUrl.includes('youtube.com/embed');

                        return isYouTube ? (
                          <iframe
                            src={embedUrl}
                            className="w-full h-auto max-h-[400px]"
                            style={{ minHeight: '232px', aspectRatio: '16/9' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Property Video"
                          />
                        ) : (
                          <video
                            src={videoUrl}
                            controls
                            className="w-full h-auto max-h-[400px]"
                            style={{ minHeight: '232px' }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        );
                      })()}
                      <button
                        onClick={() => setShowVideo(false)}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-2 hover:bg-black/90 transition z-10"
                        aria-label="Close video"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="h-[232px] flex flex-col items-center justify-center text-center p-4"
                      style={{ cursor: 'default' }}
                    >
                      {/* Video Icon */}
                      <svg
                        className="w-[48px] h-[48px] text-[#0D542B] mb-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>

                      {/* Title */}
                      <h3 className="text-[18px] leading-[28px] font-semibold text-[#19191F]">
                        Property Video
                      </h3>

                      {/* Subtitle */}
                      <p className="mt-1 font-inter text-[12px] leading-[20px] font-normal text-[#19191F]">
                        Take a 360° tour of the property
                      </p>

                      {/* Button */}
                      {(() => {
                        const videoUrl = product?.videos?.[0];
                        const isValidVideo = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() !== '' && getEmbedUrl(videoUrl);
                        const isDisabled = !isValidVideo;
                        
                        return (
                          <button
                            onClick={() => setShowVideo(true)}
                            disabled={isDisabled}
                            className={`mt-4 w-[107.13px] h-[40px] px-[12px] flex items-center justify-center font-inter text-[14px] leading-[22px] font-medium rounded-[6px] border transition-colors ${
                              isDisabled
                                ? 'text-gray-400 bg-gray-100 border-gray-300 opacity-50'
                                : 'text-[#0D542B] bg-white border-[#0D542B] hover:bg-[#EDFDF4] active:bg-[#EDFDF4]'
                            }`}
                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          >
                            View Video
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[232px] bg-[#EDFDF4] rounded-[16px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] flex flex-col items-center justify-center text-center" style={{ cursor: 'default' }}>
                  {/* Video Icon */}
                  <svg
                    className="w-[48px] h-[48px] text-[#0D542B] mb-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>

                  {/* Title */}
                  <h3 className="text-[18px] leading-[28px] font-semibold text-[#19191F]">
                    Property Video
                  </h3>

                  {/* Subtitle */}
                  <p className="mt-1 font-inter text-[12px] leading-[20px] font-normal text-[#19191F]">
                    No video available
                  </p>
                </div>
              )}
            </aside>
          </div>

          {/* Property Details Tabs Section */}
          {/* <div className="mt-8">
      
        <div className="inline-flex gap-2 mb-6 bg-white rounded-full border border-gray-200 p-1">
          {TABS.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-3 text-base font-medium focus:outline-none transition-all rounded-full ${
                activeTab === idx 
                  ? 'text-[#171A1F] bg-[#E6F7ED]' 
                  : 'text-[#565D6D] hover:text-[#171A1F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>


        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="pt-2">
          {activeTab === 0 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                  <h3 className="text-xl font-bold text-gray-900">Property Description</h3>
                </div>
                <div className="prose prose-gray max-w-none">
                  {(product?.propertyDescription || product?.description) && (
                    <p className="text-sm text-gray-700 leading-6 mb-4">{product.propertyDescription || product.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Key Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(product?.features && product.features.length > 0 ? product.features : ['Corner Unit','Park Facing']).map((item) => (
                        <span 
                          key={item} 
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-inter text-[12px] leading-[20px] font-medium border border-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Location Benefits
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(product?.locationBenefits && product.locationBenefits.length > 0 ? product.locationBenefits : ['Near IT Park','Easy Highway Access']).map((item) => (
                        <span 
                          key={item} 
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-inter text-[12px] leading-[20px] font-medium border border-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (<></>)}

          {activeTab === 1 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                  <h3 className="text-xl font-bold text-gray-900">Reviews & Ratings</h3>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="text-center md:text-left">
                      <div className="text-6xl font-bold text-gray-900 mb-2">{(product?.rating || 4.7).toFixed(1)}</div>
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-6 h-6 ${i < Math.round((product?.rating || 4.7)) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                    ))}
                  </div>
                      <div className="text-lg text-gray-600 mb-1">Excellent</div>
                      <div className="text-sm text-gray-500">Based on {product?.reviewCount || 245} reviews</div>
                </div>
                <div className="flex-1 w-full">
                  {[5, 4, 3, 2, 1].map((star, idx) => {
                    const barPercents = [90, 60, 25, 10, 5];
                    return (
                          <div key={star} className="flex items-center gap-3 mb-3">
                            <span className="w-12 text-gray-700 text-sm font-medium">{star} Star</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${barPercents[idx]}%` }}></div>
                        </div>
                            <span className="text-sm text-gray-600 w-8 text-right">{barPercents[idx]}%</span>
                      </div>
                    );
                  })}
                    </div>
                  </div>
                </div>
                
              
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h4>
                  {[
                    {
                      name: 'Rajesh Kumar',
                      rating: 5,
                      date: '2 days ago',
                      comment: 'Excellent property with great amenities. The location is perfect with metro connectivity. Highly recommended!',
                      verified: true
                    },
                    {
                      name: 'Priya Sharma',
                      rating: 4,
                      date: '1 week ago',
                      comment: 'Good property overall. The maintenance is well taken care of. Only minor issue is the parking space.',
                      verified: true
                    },
                    {
                      name: 'Amit Singh',
                      rating: 5,
                      date: '2 weeks ago',
                      comment: 'Amazing property! The view from the balcony is breathtaking. The builder has maintained high quality standards.',
                      verified: false
                    }
                  ].map((review, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                            {review.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900">{review.name}</h5>
                              {review.verified && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Verified</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-6">{review.comment}</p>
                    </div>
                  ))}
                  
                  <button className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                    Load More Reviews
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div> */}
        </div>
      </div>

      {/* Related Properties - Carousel */}
      {similarProperties.length > 0 && (
      <div className="mt-12 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span> */}
            <h3 className="text-[18px] leading-[32px] font-semibold text-[#171A1F]">
              Related Properties
            </h3>
          </div>
          {similarProperties.length > 1 && (
          <div className="flex items-center gap-2">
            <Link
              href="/search?tab=properties"
              className="px-4 py-2 text-gray-900 rounded-lg text-sm font-medium transition-colors"
            >
              View All
            </Link>
          </div>
          )}
        </div>

        {/* Carousel with scrollable cards */}
        <div
          id="related-properties-carousel"
          className="overflow-x-auto scroll-smooth -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={(e) => {
            const carousel = e.currentTarget;
            const { scrollLeft, scrollWidth, clientWidth } = carousel;
            const maxScroll = scrollWidth - clientWidth;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < maxScroll - 10);
          }}
        >
          <div className="flex gap-4 md:gap-6 min-w-0 pb-2">
            {similarLoading ? (
              // Loading state
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)] bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
                >
                  <ContentLoader
                    speed={2}
                    width={320}
                    height={280}
                    viewBox="0 0 320 280"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                  >
                    {/* Image */}
                    <rect x="0" y="0" rx="8" ry="8" width="320" height="200" />
                    {/* Category */}
                    <rect x="0" y="220" rx="4" ry="4" width="80" height="12" />
                    {/* Name */}
                    <rect x="0" y="240" rx="4" ry="4" width="200" height="16" />
                    {/* Details */}
                    <rect x="0" y="262" rx="4" ry="4" width="150" height="12" />
                    {/* Price */}
                    <rect x="0" y="278" rx="4" ry="4" width="120" height="14" />
                  </ContentLoader>
                </div>
              ))
            ) : similarProperties.length > 0 ? (
              // Property cards
              similarProperties.map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-full sm:w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)] bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <Link
                    href={`/property-details/${p.id}`}
                    className="block"
                  >
                    <div className="aspect-[4/3] bg-gray-100 rounded-t-2xl overflow-hidden relative">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${p.image ? 'hidden' : ''}`}>
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                      </div>
                    </div>
                    <div className="px-4 pt-4 pb-4 space-y-3 group-hover:bg-gray-50 transition-colors duration-300">
                      {/* Name with green upward arrow */}
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-base line-clamp-1 group-hover:text-[#0D542B] transition-colors">
                          {p.name}
                        </h3>
                        <svg
                          className="w-5 h-5 text-green-900 mt-2 flex-shrink-0 rotate-60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 10l7-7 7 7M12 3v18"
                          />
                        </svg>
                      </div>

                      {/* Category */}
                      <div className="text-sm text-gray-600 font-medium">
                        {p.category}
                      </div>

                      {/* Location with pin icon */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="line-clamp-1">
                          {p.city || ""}{" "}
                          {typeof p.region === "object"
                            ? p.region?.name ||
                            [p.region?.city, p.region?.state]
                              .filter(Boolean)
                              .join(", ")
                            : p.region
                              ? `• ${p.region}`
                              : ""}
                        </span>
                      </div>

                      {/* Property details with building/area icon */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span>
                          {p.bedrooms || 0} BHK •{" "}
                          {p.areaSqft?.toLocaleString("en-IN") || "0"} sq.ft
                        </span>
                      </div>

                      {/* Price - Different color (green) */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[#0D542B] font-bold text-lg">
                          ₹{formatPrice(p.price)}
                        </span>
                        {/* {p.originalPrice && p.originalPrice > (p.price || 0) && (
                          <span className="text-xs text-gray-500 line-through">₹{formatPrice(p.originalPrice)}</span>
                        )} */}
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : null}
          </div>
        </div>

        {/* Carousel navigation buttons - only show if more than 1 property on mobile, 2 on tablet, 4 on desktop */}
        {similarProperties.length > 1 && (
        <div className="flex gap-2 mt-7 justify-center">
          <button
            type="button"
            onClick={() => {
              const carousel = document.getElementById(
                "related-properties-carousel"
              );
              if (carousel && canScrollLeft) {
                // Responsive scroll amount based on viewport
                const width = carousel.clientWidth;
                let scrollAmount;
                if (width < 640) {
                  // Mobile: 1 card at a time (full width)
                  scrollAmount = width;
                } else if (width < 768) {
                  // Small tablet: 2 cards with 16px gap
                  scrollAmount = (width - 16) / 2 + 16;
                } else if (width < 1024) {
                  // Tablet: 3 cards with 24px gaps
                  scrollAmount = (width - 48) / 3 + 24;
                } else {
                  // Desktop: 4 cards with 24px gaps
                  scrollAmount = (width - 72) / 4 + 24;
                }
                carousel.scrollBy({ left: -scrollAmount, behavior: "smooth" });
              }
            }}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${canScrollLeft
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            title="Previous"
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
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              const carousel = document.getElementById(
                "related-properties-carousel"
              );
              if (carousel && canScrollRight) {
                // Responsive scroll amount based on viewport
                const width = carousel.clientWidth;
                let scrollAmount;
                if (width < 640) {
                  // Mobile: 1 card at a time (full width)
                  scrollAmount = width;
                } else if (width < 768) {
                  // Small tablet: 2 cards with 16px gap
                  scrollAmount = (width - 16) / 2 + 16;
                } else if (width < 1024) {
                  // Tablet: 3 cards with 24px gaps
                  scrollAmount = (width - 48) / 3 + 24;
                } else {
                  // Desktop: 4 cards with 24px gaps
                  scrollAmount = (width - 72) / 4 + 24;
                }
                carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
              }
            }}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${canScrollRight
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            title="Next"
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
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        )}
      </div>
      )}

      {/* CTA Section */}
      <div className="w-full max-w-full bg-[#FFF9E6] rounded-2xl shadow-xs mt-4">
        <div className="px-6 py-8 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 "></div>
          <div className="absolute top-3 right-3 w-12 h-12 bg-yellow-100 rounded-full opacity-20"></div>
          <div className="absolute bottom-3 left-3 w-10 h-10 bg-yellow-200 rounded-full opacity-30"></div>

          <div className="max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center mt-4">
              <img
                src="/images/lucide-Sparkles-Outlined.svg"
                className="w-[32px] h-[32px]"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(99%) sepia(89%) saturate(5066%) hue-rotate(315deg) brightness(99%) contrast(97%)",
                }}
              />
              {/* Trusted by 1000+ Customers */}
            </div>

            <h2 className="text-[18px] leading-[36px] font-bold text-[#19191F] mt-4">
              Ready to Find Your Perfect Home?

            </h2>
            <p className="w-full max-w-2xl mx-auto font-inter text-[12px] leading-[28px] font-normal text-[#19191F] mt-4">
              Join thousands of satisfied customers who found their dream homes
              through our platform. Get started today and let our expert brokers
              help you every step of the way.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <a
                href="/search?tab=properties"
                className="w-[176px] h-[40px] px-3 flex items-center justify-center font-inter text-[14px] leading-[22px] font-medium text-white bg-[#0D542B] rounded-md border-0 transition-colors duration-200 
         hover:bg-[#0B4624] active:bg-[#08321A] disabled:opacity-40"
              >
                Browse All Properties
              </a>
              <a
                href="/search?tab=brokers"
                className="w-[118.078125px] h-[40px] px-3 flex items-center justify-center font-inter text-[14px] leading-[22px] font-medium text-[#0D542B] bg-white rounded-md border border-[#0D542B] transition-colors duration-200 hover:bg-white active:bg-white disabled:opacity-40"
              >
                Find Brokers
              </a>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-yellow-50 transition-colors">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-sm">Verified Properties</span>
                <span className="text-xs text-gray-600">Quality Assured</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-yellow-50 transition-colors">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-sm">Expert Brokers</span>
                <span className="text-xs text-gray-600">Professional Service</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-yellow-50 transition-colors">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-sm">Free Consultation</span>
                <span className="text-xs text-gray-600">No Obligation</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <PropertyEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        propertyId={product?.id || product?._id || null}
        propertyBrokerId={
          broker?._id ||
          broker?.id ||
          (product?._raw &&
            typeof product._raw.createdBy === "object" &&
            product._raw.createdBy?._id) ||
          (product?._raw && typeof product._raw.createdBy === "string"
            ? product._raw.createdBy
            : null) ||
          product?._raw?.brokerId ||
          null
        }
      />

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowRatingModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-gray-900">
                  Rate This Property
                </h3>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setUserRating(0);
                    setRatingReview("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Property Info */}
              {product && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={
                        product.images?.[0] ||
                        product.image ||
                        "/images/pexels-binyaminmellish-106399.jpg"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-semibold text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-[12px] text-gray-500 truncate">
                      {typeof product.region === "object"
                        ? product.region?.name ||
                        [product.region?.city, product.region?.state]
                          .filter(Boolean)
                          .join(", ")
                        : product.region}
                    </p>
                    <p className="text-[12px] font-medium text-[#0D542B] mt-1">
                      ₹{formatPrice(product.price || 0)}
                    </p>
                  </div>
                </div>
              )}

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-[14px] font-medium text-gray-700 mb-3">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= userRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 fill-gray-300"
                          }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <p className="text-[12px] text-gray-600 mt-2">
                    {userRating === 1 && "Poor"}
                    {userRating === 2 && "Fair"}
                    {userRating === 3 && "Good"}
                    {userRating === 4 && "Very Good"}
                    {userRating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-[14px] font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={ratingReview}
                  onChange={(e) => setRatingReview(e.target.value)}
                  placeholder="Share your experience with this property..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setUserRating(0);
                    setRatingReview("");
                  }}
                  className="flex-1 h-[40px] px-4 flex items-center justify-center font-inter text-[13px] leading-[22px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (userRating === 0) {
                      toast.error("Please select a rating");
                      return;
                    }

                    setRatingLoading(true);
                    try {
                      const token =
                        typeof window !== "undefined"
                          ? localStorage.getItem("token") ||
                          localStorage.getItem("authToken")
                          : null;

                      if (!token) {
                        toast.error("Please login to submit a rating");
                        setShowRatingModal(false);
                        router.push("/login");
                        return;
                      }

                      const base =
                        process.env.NEXT_PUBLIC_API_URL ||
                        "https://broker-adda-be.fly.dev/api";
                      const headers = {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      };

                      const propertyId = product?.id || product?._id;

                      // API expects: propertyId, rating, and review (optional)
                      const ratingData = {
                        propertyId: propertyId,
                        rating: userRating,
                        review: ratingReview || "",
                      };

                   

                      const res = await fetch(`${base}/property-ratings`, {
                        method: "POST",
                        headers,
                        body: JSON.stringify(ratingData),
                      });

                      const responseData = await res.json().catch(() => ({}));

                      if (!res.ok) {
                        throw new Error(
                          responseData.message || "Failed to submit rating"
                        );
                      }

                      // Handle success response
                      if (responseData.success && responseData.data) {
                        toast.success(
                          responseData.message || "Thank you for your rating!"
                        );
                      
                      } else {
                        toast.success("Thank you for your rating!");
                      }

                      setShowRatingModal(false);
                      setUserRating(0);
                      setRatingReview("");

                      // Refresh ratings after submitting
                      const refreshRatings = async () => {
                        try {
                          const refreshToken =
                            typeof window !== "undefined"
                              ? localStorage.getItem("token") ||
                              localStorage.getItem("authToken")
                              : null;
                          const refreshBase =
                            process.env.NEXT_PUBLIC_API_URL ||
                            "https://broker-adda-be.fly.dev/api";
                          const refreshHeaders = {
                            "Content-Type": "application/json",
                            ...(refreshToken
                              ? { Authorization: `Bearer ${refreshToken}` }
                              : {}),
                          };

                          const propertyId = product?.id || product?._id;
                          const ratingsEndpoint = `/property-ratings/property/${encodeURIComponent(
                            String(propertyId)
                          )}`;

                          const refreshRes = await fetch(
                            `${refreshBase}${ratingsEndpoint}`,
                            { headers: refreshHeaders }
                          );
                          if (refreshRes.ok) {
                            const refreshData = await refreshRes.json();
                            if (refreshData.success && refreshData.data) {
                              const ratings = Array.isArray(
                                refreshData.data.ratings
                              )
                                ? refreshData.data.ratings
                                : [];
                              setPropertyRatings(ratings);
                              if (refreshData.data.stats) {
                                setRatingsStats(refreshData.data.stats);
                              }
                            }
                          }
                        } catch (e) {
                          console.error("Error refreshing ratings:", e);
                        }
                      };

                      refreshRatings();
                    } catch (error) {
                      console.error("Error submitting rating:", error);
                      toast.error(
                        error.message ||
                        "Failed to submit rating. Please try again."
                      );
                    } finally {
                      setRatingLoading(false);
                    }
                  }}
                  disabled={userRating === 0 || ratingLoading}
                  className="flex-1 h-[40px] px-4 flex items-center justify-center font-inter text-[13px] leading-[22px] font-medium text-white bg-[#0D542B] hover:bg-[#0B4624] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {ratingLoading ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <ImageSliderModal
        isOpen={isImageSliderModalOpen}
        onClose={() => setIsImageSliderModalOpen(false)}
        images={product?.images || []}
        initialIndex={selectedImageIndex}
      />
    </div>
  );
}

export default function PropertyDetailsPage() {
  return (
    <Suspense fallback={<div />}>
      <PropertyDetailsPageInner />
    </Suspense>
  );
}
