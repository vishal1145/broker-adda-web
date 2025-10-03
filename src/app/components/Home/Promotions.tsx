"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface PromotionItem {
  type: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  color: string;
}

const Promotions = ({ data = [] }: { data: PromotionItem[] }) => {
  const router = useRouter();

  const openProductDetails = (item: PromotionItem) => {
    const type = (item?.type || "furniture").toLowerCase();
    router.push(`/properties/${type}`);
  };
  return (
    <section className="bg-white py-16">
      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(data || []).map((promotion, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg h-auto md:h-[450px] ${
              promotion.color === "gray" ? "bg-gray-50" : "bg-yellow-400"
            }`}
          >
            {/* Text Left */}
            <div className="flex-1 p-6 flex flex-col justify-center text-left min-w-0">
              <p
                className={`text-xl mb-2 ${
                  promotion.color === "gray" ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {promotion.subtitle}
              </p>
              <h2
                className={`text-4xl font-bold mb-2 leading-tight ${
                  promotion.color === "gray" ? "text-gray-900" : "text-gray-900"
                }`}
              >
                {promotion.title}
              </h2>
              <p
                className={`text-sm mt-4 ${
                  promotion.color === "gray" ? "text-gray-500" : "text-gray-700"
                }`}
              >
                {promotion.description}
              </p>
              <button
                onClick={() => openProductDetails(promotion)}
                className="bg-green-900 text-white px-6 py-3 rounded-full text-xl hover:bg-green-800 w-fit mt-8"
              >
                Shop Now →
              </button>
            </div>

            {/* Image Right */}
            <div className="w-full md:w-1/2 h-60 md:h-full flex-shrink-0">
              {promotion.image ? (
                <img
                  src={promotion.image}
                  alt={promotion.title}
                  className="object-cover w-full h-full rounded-b-2xl md:rounded-b-none md:rounded-r-2xl"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
};

export default Promotions;
