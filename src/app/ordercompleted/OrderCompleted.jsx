"use client";
import React from 'react';
import orderCompletedData from "../data/ordercompleted.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";

const OrderCompleted = () => {
  const {
    products,
    shipping,
    taxes,
    discount
  } = orderCompletedData;

  const subtotal = products.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + taxes + shipping - discount;

  return (
    <>
      <HeaderFile data={orderCompletedData} />
      <div className="py-16 px-4 sm:px-12 lg:px-32 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Checkmark Icon */}
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
            </svg>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Your order is completed!</h2>
          <p className="text-base text-gray-500 mb-8 text-center">Thank you. Your Order has been received.</p>

          {/* Info Summary Bar */}
         <div className="bg-yellow-400 border border-yellow-500  rounded-xl p-8  mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
    <div>
      <p className="text-sm  text-gray-600 font-mediu mb-2 m">Order ID</p>
      <p className="font-medium text-base text-gray-900">#SDGT1254FD</p>
    </div>
    <div>
      <p className="text-sm text-gray-600 font-medium mb-2 ">Payment Method</p>
      <p className="font-medium text-base text-gray-900">Paypal</p>
    </div>
    <div>
      <p className="text-sm text-gray-600 font-medium mb-2 ">Transaction ID</p>
      <p className="font-medium text-base text-gray-900">TR542SSFE</p>
    </div>
    <div>
      <p className="text-sm text-gray-600 font-medium mb-2 ">Estimated Delivery Date</p>
      <p className=" text-base  font-medium text-gray-900">24 April 2024</p>
    </div>
  </div>

  <div className="sm:ml-4 sm:mt-0 w-full sm:w-auto">
<button className="bg-green-900 text-white text-xs px-6 py-3 rounded-full shadow hover:bg-green-700 transition-all w-full sm:w-auto whitespace-nowrap">
  Download Invoice
</button>

  </div>
</div>

          {/* Order Details Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
               <div className="border-t border-gray-200"></div>
            
            <div className="space-y-4">
              {/* Products Section */}
              <div className="space-y-12 mt-4">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-900">Products</span>
                  <span className="text-sm font-medium text-gray-900">Sub Total</span>
                </div>
                
                {products.map((product, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex items-center space-x-8">
                      <div className="w-20 h-20 rounded bg-gray-50 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">Color : {product.color}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200 mt-5"></div>
              
              {/* Summary Section */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-900">Shipping</span>
                  <span className="text-sm text-gray-900">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-900">Taxes</span>
                  <span className="text-sm text-gray-900">${taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-900">Coupon Discount</span>
                  <span className="text-sm font-medium text-gray-900">-${discount.toFixed(2)}</span>
                </div>
                   <div className="border-t border-gray-200"></div>
                <div className="flex justify-between pt-2">
                  <span className="text-sm text-gray-900">Total</span>
                  <span className="text-sm font-medium text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Features data={furnitureData.features}/>
    </>
  );
};

export default OrderCompleted;


