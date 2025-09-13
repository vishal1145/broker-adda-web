"use client";
import React, { useState, useEffect } from "react";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";
import { useRouter } from "next/navigation";

const Cart = () => {
  const router = useRouter();
  
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Dispatch custom event to notify navbar about cart update
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cartItems]);

  const updateQty = (id, delta) => {
    const updated = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCartItems(updated);
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shipping = 0;
  const tax = 0;
  const coupon = 0;
  const total = subtotal + shipping + tax - coupon;

  return (
    <>
      <HeaderFile data={{
        title: "Shopping Cart",
        subtitle: "Your cart items",
        breadcrumb: [
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" }
        ]
      }} />
<div className="px-6 sm:px-12 lg:px-32 py-12">
      <div className=" max-w-7xl mx-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart!</p>
            <a 
              href="/properties" 
              className="bg-green-900 text-white px-6 py-3 rounded-full hover:bg-green-800 transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side: Cart Table */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-4 md:grid-cols-5 text-left font-semibold text-sm mb-4 bg-yellow-500 p-4 rounded-lg">
                <span className="col-span-2">Product</span>
                <span className="hidden md:inline">Price</span>
                <span>Quantity</span>
                <span className="text-right">Subtotal</span>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 md:grid-cols-5 items-center border-b last:border-b-0 gap-4 py-8"
                >
                  {/* Product Info */}
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="bg-gray-50 rounded-xl flex items-center justify-center w-16 h-16">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Type: {item.type}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <span className="hidden md:inline text-gray-900 font-semibold">
                    ${item.price}.00
                  </span>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-right font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Right Side: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalQty} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${coupon.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-green-900 text-white py-3 rounded-full hover:bg-green-800 transition-colors font-medium"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      <Features data={furnitureData.features} />
    </>
  );
};

export default Cart;
