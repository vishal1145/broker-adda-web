"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

interface DotsProps {
  className?: string;
  style?: React.CSSProperties;
}

const Dots = ({ className, style }: DotsProps) => (
  <svg
    width="120"
    height="60"
    viewBox="0 0 120 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    {/* Manually placed circles for a scattered look */}
    <circle cx="10" cy="20" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="25" cy="10" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="40" cy="25" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="60" cy="15" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="80" cy="30" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="100" cy="20" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="20" cy="40" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="35" cy="50" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="55" cy="40" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="75" cy="50" r="4" fill="#E5E7EB" opacity="1.5" />
    {/* More dots for a denser scatter */}
    <circle cx="15" cy="30" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="30" cy="20" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="50" cy="10" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="65" cy="35" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="90" cy="40" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="110" cy="30" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="5" cy="50" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="45" cy="55" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="70" cy="45" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="100" cy="55" r="4" fill="#E5E7EB" opacity="1.5" />
  </svg>
);
interface FlashSaleData {
  title: string;
  subtitle: string;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  images: string[];
  button?: string;
}

interface Property {
  id: string;
  title: string;
  image: string;
  price: number;
}

interface ApiProperty {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  images?: string[];
  image?: string;
  price?: number;
  createdBy?: string | { _id?: string };
  brokerId?: string;
  broker?: string | { _id?: string };
  isHotProperty?: boolean;
  distanceKm?: number;
  distance?: number;
}

const FlashSale = ({ data = { title: '', subtitle: '', countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 }, images: [] } }: { data: FlashSaleData }) => {
  const [countdown, setCountdown] = useState(
    data?.countdown || { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { brokerDetails } = useAuth() as {
    user?: { userId?: string; token?: string; role?: string } | null;
    brokerDetails?: unknown;
  };

  const openPropertiesPage = () => {
    router.push("/search?tab=properties");
  };

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('token') || localStorage.getItem('authToken')
            : null;

        let currentBrokerId = '';
        let latitude: number | null = null;
        let longitude: number | null = null;

        // Prefer shared broker details from AuthContext to avoid duplicate API calls
        const sharedBroker = brokerDetails as
          | {
              _id?: string;
              id?: string;
              location?: { coordinates?: number[] };
            }
          | undefined;

        if (sharedBroker) {
          currentBrokerId = sharedBroker._id || sharedBroker.id || '';
          if (
            sharedBroker.location?.coordinates &&
            Array.isArray(sharedBroker.location.coordinates) &&
            sharedBroker.location.coordinates.length >= 2
          ) {
            const coords = sharedBroker.location.coordinates;
            if (Math.abs(coords[0] as number) <= 90 && Math.abs(coords[1] as number) <= 180) {
              latitude = coords[0] as number;
              longitude = coords[1] as number;
            } else {
              longitude = coords[0] as number;
              latitude = coords[1] as number;
            }
          }
        }

        // If no broker coordinates, try to get current location
        if (!latitude || !longitude) {
          if (navigator.geolocation) {
            try {
              await new Promise<void>((resolve) => {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    resolve();
                  },
                  () => {
                    resolve(); // Continue without coordinates
                  },
                  { timeout: 5000 }
                );
              });
            } catch {
            }
          }
        }

        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Build API URL with coordinates if available
        let apiUrlWithParams = `${apiUrl}/properties`;
        if (latitude && longitude) {
          apiUrlWithParams += `?latitude=${latitude}&longitude=${longitude}`;
        } else {
          
        }

        const response = await fetch(apiUrlWithParams, {
          method: 'GET',
          headers
        });

        if (response.ok) {
          const responseData = await response.json();
          
          // Handle different response structures
          let propertiesList = [];
          if (Array.isArray(responseData?.data?.items)) {
            propertiesList = responseData.data.items;
          } else if (Array.isArray(responseData?.data?.properties)) {
            propertiesList = responseData.data.properties;
          } else if (Array.isArray(responseData?.data)) {
            propertiesList = responseData.data;
          } else if (Array.isArray(responseData?.properties)) {
            propertiesList = responseData.properties;
          } else if (Array.isArray(responseData)) {
            propertiesList = responseData;
          }

          // Filter out properties belonging to the logged-in broker
          const filteredProperties = currentBrokerId 
            ? propertiesList.filter((property: ApiProperty) => {
                // Extract broker ID from various possible fields
                let propertyBrokerId = '';
                
                // Check broker field first (most common in API response)
                if (property.broker) {
                  if (typeof property.broker === 'string') {
                    propertyBrokerId = property.broker;
                  } else if (typeof property.broker === 'object' && property.broker !== null) {
                    propertyBrokerId = property.broker._id || '';
                  }
                }
                
                // If not found, check createdBy, brokerId
                if (!propertyBrokerId) {
                  if (property.createdBy) {
                    propertyBrokerId = typeof property.createdBy === 'object' 
                      ? property.createdBy._id || '' 
                      : property.createdBy;
                  } else if (property.brokerId) {
                    propertyBrokerId = property.brokerId;
                  }
                }
                
                // Convert both to strings for comparison
                const brokerIdStr = String(currentBrokerId).trim();
                const propertyBrokerIdStr = String(propertyBrokerId).trim();
                const shouldShow = propertyBrokerIdStr !== brokerIdStr && propertyBrokerIdStr !== '';
                if (!shouldShow) {
                  }
                // Only show properties that don't belong to the logged-in broker
                return shouldShow;
              })
            : propertiesList;

          // Filter for hot properties only (isHotProperty === true)
          const hotProperties = filteredProperties.filter((property: ApiProperty) => property.isHotProperty === true);
          
         // Helper function to extract distance (in km)
          const getDistance = (property: ApiProperty): number => {
            const distance = property.distanceKm ?? property.distance;
            return Number.isFinite(Number(distance)) ? Number(distance) : Infinity;
          };

          // Helper function to get price
          const getPrice = (property: ApiProperty): number => {
            return Number.isFinite(Number(property.price)) ? Number(property.price) : Infinity;
          };

          // Sort hot properties by: 1. Distance (closest first), 2. Price (lowest first)
          const sortedProperties = (latitude && longitude)
            ? [...hotProperties].sort((a, b) => {
                // First: Sort by distance (closest first)
                const distanceA = getDistance(a);
                const distanceB = getDistance(b);
                if (distanceA !== distanceB) {
                  return distanceA - distanceB;
                }
                
                // Second: Sort by price (lowest first)
                const priceA = getPrice(a);
                const priceB = getPrice(b);
                return priceA - priceB;
              })
            : [...hotProperties].sort((a, b) => {
                // If no coordinates, sort by price (lowest first)
                const priceA = getPrice(a);
                const priceB = getPrice(b);
                return priceA - priceB;
              });

          // Map properties and get first 3
          const mappedProperties: Property[] = sortedProperties
            .slice(0, 3)
            .map((property: ApiProperty) => ({
              id: property._id || property.id || '',
              title: property.title || property.name || 'Property',
              image: property.images?.[0] || property.image || '',
              price: property.price || 0
            }));

          setProperties(mappedProperties);
        } else {
          setProperties([]);
        }
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [brokerDetails]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => {
        let { days, hours, minutes, seconds } = prevCountdown;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white py-8 md:py-16 lg:py-20" >
      <div className="w-full mx-auto px-4 ">
      <div className=" mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
        {/* LEFT: Countdown Card */}
        <div className="relative rounded-2xl p-4 md:p-6 w-full h-auto md:h-[460px] shadow flex flex-col justify-center items-center text-center">
          <div className="absolute left-20 bottom-0 hidden md:block">
            <Dots />
          </div>
          {/* Dots - top right */}
          <div className="absolute right-20 top-0 hidden md:block">
            <Dots />
          </div>
          <h3 className="text-3xl md:text-5xl font-medium text-gray-900">
            {(data.title || '').split(" ")[0]}{" "}
            <span className="text-green-900">{(data.title || '').split(" ")[1] || ''}</span>
          </h3>
          <p className="text-gray-600 text-base md:text-xl mt-2 mb-3 md:mb-4">{data.subtitle}</p>

          {/* Countdown */}
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm text-gray-700 font-semibold mb-4 md:mb-6">
            <div className="text-center w-16 md:w-20 lg:w-auto">
              <div className="text-3xl md:text-5xl lg:text-6xl font-medium text-gray-900">
                {String(countdown.days).padStart(2, "0")}
              </div>
              <div className="font-medium text-[10px] md:text-sm">Days</div>
            </div>

            <div className="text-2xl md:text-4xl lg:text-5xl font-medium text-gray-900">
              :
            </div>

            <div className="text-center w-16 md:w-20 lg:w-auto">
              <div className="text-3xl md:text-5xl lg:text-6xl font-medium text-gray-900">
                {String(countdown.hours).padStart(2, "0")}
              </div>
              <div className="font-medium text-[10px] md:text-sm">Hours</div>
            </div>

            <div className="text-2xl md:text-4xl lg:text-5xl font-medium text-gray-900">
              :
            </div>

            <div className="text-center w-16 md:w-20 lg:w-auto">
              <div className="text-3xl md:text-5xl lg:text-6xl font-medium text-gray-900">
                {String(countdown.minutes).padStart(2, "0")}
              </div>
              <div className="font-medium text-[10px] md:text-sm">Minutes</div>
            </div>

            <div className="text-2xl md:text-4xl lg:text-5xl font-medium text-gray-900">
              :
            </div>

            <div className="text-center w-16 md:w-20 lg:w-auto">
              <div className="text-3xl md:text-5xl lg:text-6xl font-medium text-gray-900">
                {String(countdown.seconds).padStart(2, "0")}
              </div>
              <div className="font-medium text-[10px] md:text-sm">Seconds</div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={openPropertiesPage}
            className="bg-green-900 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium hover:bg-green-800"
          >
            {/* {data.button} */}
            Properties
          </button>
        </div>

        {/* RIGHT: Three Side-by-Side Property Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className={`relative h-[200px] md:h-[460px] w-full rounded-2xl overflow-hidden shadow bg-gray-200 animate-pulse ${index > 1 ? 'hidden md:block' : ''}`}
              >
                <div className="absolute inset-0 m-2 border border-white rounded-[22px] pointer-events-none"></div>
              </div>
            ))
          ) : properties.length > 0 ? (
            // Property cards from API
            properties.map((property, index) => (
              <Link
                key={property.id}
                href={`/property-details/${property.id}`}
                className={`relative h-[200px] md:h-[460px] w-full rounded-2xl overflow-hidden shadow cursor-pointer group hover:shadow-xl transition-shadow duration-300 ${index > 1 ? 'hidden md:block' : ''}`}
              >
                {/* Image */}
                <img
                  src={property.image}
                  alt={property.title || `Property ${index + 1}`}
                  className="h-full w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/pexels-binyaminmellish-106399.jpg';
                  }}
                />

                {/* Overlay with property info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-2xl"></div>

                {/* Property Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                  <h4 className="text-xs md:text-sm font-semibold mb-1 line-clamp-2">{property.title}</h4>
                  {property.price > 0 && (
                    <p className="text-[10px] md:text-xs font-medium">₹{Math.round(property.price).toLocaleString('en-IN')}</p>
                  )}
                </div>

                {/* White Rounded Inner Border */}
                <div className="absolute inset-0 m-2 border border-white rounded-[12px] pointer-events-none"></div>
              </Link>
            ))
          ) : (
            // Fallback to data.images if no properties from API
            (data.images || []).map((image, index) => (
              <div
                key={`fallback-${index}`}
                className={`relative h-[200px] md:h-[460px] w-full rounded-2xl overflow-hidden shadow ${index > 1 ? 'hidden md:block' : ''}`}
              >
                {/* Image */}
                <img
                  src={image}
                  alt={`Flash Sale ${index + 1}`}
                  className="h-full w-full object-cover rounded-2xl"
                />

                {/* White Rounded Inner Border */}
                <div className="absolute inset-0 m-2 border border-white rounded-[22px] pointer-events-none"></div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </section>
  );
};

export default FlashSale;
