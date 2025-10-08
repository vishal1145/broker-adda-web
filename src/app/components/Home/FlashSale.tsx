"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

const FlashSale = ({ data = { title: '', subtitle: '', countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 }, images: [] } }: { data: FlashSaleData }) => {
  const [countdown, setCountdown] = useState(
    data?.countdown || { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );
  const router = useRouter();

  const openPropertiesPage = () => {
    router.push("/properties");
  };
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
              <div className="text-5xl sm:text-6xl ffont-medium text-gray-900">
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

        {/* RIGHT: Three Side-by-Side Rounded Images */}
        <div className="grid grid-cols-3 gap-4">
          {(data.images || []).map((image, index) => (
            <div
              key={index}
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
          ))}
        </div>
      </div>
      </div>
    </section>
  );
};

export default FlashSale;
