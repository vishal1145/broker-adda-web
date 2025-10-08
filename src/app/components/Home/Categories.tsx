import React from 'react';
import Image from 'next/image';

interface CategoryItem {
  name: string;
  items: string;
  description?: string;
  image: string;
  products: string[];
}

const Categories = ({ data = [] }: { data: CategoryItem[] }) => {
  const cat0 = data[0] || { items: 0, name: '', description: '', products: [], image: '' };
  const cat1 = data[1] || { items: 0, name: '', products: [], image: '' };
  const cat2 = data[2] || { items: 0, name: '', products: [], image: '' };
  return (
    <section className="bg-white py-12" >
      <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chairs Card */}
        <div className=" rounded-2xl px-8 bg-gray-50  flex items-center text-left relative overflow-hidden w-full min-h-[400px]">
          <div className="flex-1 flex flex-col mt-5 h-full ">
            <div className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm w-fit text-sm mb-2">
              <span className="text-yellow-500 font-bold">{cat0.items}+</span>&nbsp;
              <span className="text-gray-500">Items</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{cat0.name}</h2>
            <p className="text-gray-500 text-sm mb-2">{cat0.description}</p>
            <ul className="text-gray-700 text-base space-y-1 mb-2">
              {(cat0.products || []).map((product, index) => (
                <li key={index}>{product}</li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center mt-12h-full">
            {cat0.image ? (
              <Image src={cat0.image} alt={cat0.name} width={224} height={340} className="object-contain" />
            ) : null}
          </div>
        </div>

        {/* Right Side: Sofa and Lighting */}
        <div className="flex flex-col gap-6 w-full">
          {/* Sofa Card */}
          <div className="bg-gray-50 rounded-2xl px-8 p-2 flex items-center text-left relative overflow-hidden w-full min-h-[180px]">
            <div className="flex-1 flex flex-col justify-center h-full">
              <div className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm w-fit text-sm mb-2">
                <span className="text-yellow-500 font-bold">{cat1.items}+</span>&nbsp;
                <span className="text-gray-500">Items</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{cat1.name}</h2>
              <ul className="text-gray-700 text-base space-y-1">
                {(cat1.products || []).map((product, index) => (
                  <li key={index}>{product}</li>
                ))}
              </ul>
            </div>

            {/* Image pushed to far right */}
            <div className="flex ml-auto items-end">
              {cat1.image ? (
                <Image
                  src={cat1.image}
                  alt={cat1.name}
                  width={280}
                  height={208}
                  className="object-contain"
                />
              ) : null}
            </div>
          </div>

          {/* Lighting Card */}
          <div className="bg-gray-50 rounded-2xl px-8 p-4 flex items-center text-left relative overflow-hidden w-full min-h-[200px]">
            {/* Text Content */}
            <div className="flex-1 flex flex-col h-full z-10">
              <div className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm w-fit text-sm mb-2">
                <span className="text-yellow-500 font-bold">{cat2.items}+</span>&nbsp;
                <span className="text-gray-500">Items</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{cat2.name}</h2>
              <ul className="text-gray-700 text-base space-y-1">
                {(cat2.products || []).map((product, index) => (
                  <li key={index}>{product}</li>
                ))}
              </ul>
            </div>

            {/* Hanging Lamp Image */}
            <div className="absolute top-0 right-6 h-full flex items-start justify-end z-0">
              {cat2.image ? (
                <Image
                  src={cat2.image}
                  alt={cat2.name}
                  width={288}
                  height={200}
                  className="object-contain"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
