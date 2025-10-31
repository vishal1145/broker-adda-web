"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
}

const FlashSale = ({ data = { title: '', subtitle: '', countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 }, images: [] } }: { data: FlashSaleData }) => {
  const [countdown, setCountdown] = useState(
    data?.countdown || { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const openPropertiesPage = () => {
    router.push("/search?tab=properties");
  };

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;

        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const response = await fetch(`${apiUrl}/properties`, {
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

          // Map properties and get first 3
          const mappedProperties: Property[] = propertiesList
            .slice(0, 3)
            .map((property: ApiProperty) => ({
              id: property._id || property.id || '',
              title: property.title || property.name || 'Property',
              image: property.images?.[0] || property.image || '/images/pexels-binyaminmellish-106399.jpg',
              price: property.price || 0
            }));

          setProperties(mappedProperties);
        } else {
          console.error('Failed to fetch properties');
          setProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

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
    <section className="bg-white" >
      <div className="w-full mx-auto">
      <div className="  mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* LEFT: Countdown Card */}
        <div className=" relative rounded-2xl p-6 w-full h-auto md:h-[460px] shadow flex flex-col justify-center items-center text-center ">
          <div className="absolute left-20 bottom-0  ">
            <Dots />
          </div>
          {/* Dots - top right */}
          <div className="absolute right-20 top-0 ">
            <Dots />
          </div>
          <h3 className="text-5xl font-medium text-gray-900">
            {(data.title || '').split(" ")[0]}{" "}
            <span className="text-green-900">{(data.title || '').split(" ")[1] || ''}</span>
          </h3>
          <p className="text-gray-600 text-xl mt-2 mb-4">{data.subtitle}</p>

          {/* Countdown */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-sm text-gray-700 font-semibold mb-6">
            <div className="text-center w-20 sm:w-auto">
              <div className="text-5xl sm:text-6xl font-medium text-gray-900">
                {String(countdown.days).padStart(2, "0")}
              </div>
              <div className="font-medium">Days</div>
            </div>

            <div className="text-4xl sm:text-5xl font-medium text-gray-900">
              :
            </div>

            <div className="text-center w-20 sm:w-auto">
              <div className="text-5xl sm:text-6xl font-medium text-gray-900">
                {String(countdown.hours).padStart(2, "0")}
              </div>
              <div className="font-medium">Hours</div>
            </div>

            <div className="text-4xl sm:text-5xl font-medium text-gray-900">
              :
            </div>

            <div className="text-center w-20 sm:w-auto">
              <div className="text-5xl sm:text-6xl font-medium text-gray-900">
                {String(countdown.minutes).padStart(2, "0")}
              </div>
              <div className="font-medium">Minutes</div>
            </div>

            <div className="text-4xl sm:text-5xl font-medium text-gray-900">
              :
            </div>

            <div className="text-center w-20 sm:w-auto">
              <div className="text-5xl sm:text-6xl font-medium text-gray-900">
                {String(countdown.seconds).padStart(2, "0")}
              </div>
              <div className="font-medium">Seconds</div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={openPropertiesPage}
            className="bg-green-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-green-800"
          >
            {/* {data.button} */}
            Properties
          </button>
        </div>

        {/* RIGHT: Three Side-by-Side Property Cards */}
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="relative h-[460px] w-full rounded-2xl overflow-hidden shadow bg-gray-200 animate-pulse"
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
                className="relative h-[460px] w-full rounded-2xl overflow-hidden shadow cursor-pointer group hover:shadow-xl transition-shadow duration-300"
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
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="text-sm font-semibold mb-1 line-clamp-2">{property.title}</h4>
                  {property.price > 0 && (
                    <p className="text-xs font-medium">₹{Math.round(property.price).toLocaleString('en-IN')}</p>
                  )}
                </div>

                {/* White Rounded Inner Border */}
                <div className="absolute inset-0 m-2 border border-white rounded-[22px] pointer-events-none"></div>
              </Link>
            ))
          ) : (
            // Fallback to data.images if no properties from API
            (data.images || []).map((image, index) => (
              <div
                key={`fallback-${index}`}
                className="relative h-[460px] w-full rounded-2xl overflow-hidden shadow"
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
