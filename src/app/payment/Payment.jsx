import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import paymentData from "../data/payment.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from "../components/Header";
import Navbar from "../components/Navbar";
import Features from "../components/Features";
import Footer from "../components/Footer";

const Payment = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState("paypal");
  const [cardDetails, setCardDetails] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
    saveCard: true,
  });

  const handleCardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const {
    summary: { items, subtotal, shipping, tax, coupon, total },
  } = paymentData;

  return (
    <>
      <Navbar data={furnitureData.navigation} />
      <HeaderFile data={paymentData}/>
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Payment Method Selection */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-10">Select Payment Method</h2>

              <div className="space-y-4">
                {/* Paypal */}
                <label className="payment-method border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "paypal"}
                    onChange={() => setMethod("paypal")}
                    className="accent-green-900 w-5 h-5"
                  />
                  <img src="https://img.icons8.com/color/48/paypal.png" alt="PayPal" className="w-8 h-8" />
                  <span className="font-medium">Paypal</span>
                </label>

                {/* Visa */}
                <label className="payment-method border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "visa"}
                    onChange={() => setMethod("visa")}
                    className="accent-green-900 w-5 h-5"
                  />
                  <span className="font-medium">💳 **** **** **** 8047</span>
                </label>

                {/* Google Pay */}
                <label className="payment-method border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "gpay"}
                    onChange={() => setMethod("gpay")}
                    className="accent-green-900 w-5 h-5"
                  />
                  <img src="https://img.icons8.com/color/48/google-pay-india.png" alt="Google Pay" className="w-8 h-8" />
                  <span className="font-medium">Google Pay</span>
                </label>

                {/* COD */}
                <label className="payment-method border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "cod"}
                    onChange={() => setMethod("cod")}
                    className="accent-green-900 w-5 h-5"
                  />
                  {/* Camera Icon */}
                  <span className="inline-flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect x="4" y="8" width="24" height="16" rx="4" fill="#194124"/>
                      <circle cx="16" cy="16" r="4" fill="white"/>
                      <rect x="8" y="12" width="3" height="2" rx="1" fill="white" />
                      <rect x="21" y="12" width="3" height="1" rx="0.5" fill="white" />
                    </svg>
                  </span>
                  <span className="font-medium">Cash On Delivery</span>
                </label>

                {/* Add New Card */}
                <label className="payment-method border rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  {/* Radio button */}
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "newcard"}
                    onChange={() => setMethod("newcard")}
                    className="accent-green-900 w-5 h-5 mt-1"
                  />
                  <div className="flex-1">
                    {/* Icon and label */}
                    <div className="flex items-center gap-2 mb-6">
                      <span className="inline-flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                          <rect x="6" y="8" width="20" height="8" rx="3" fill="#194124"/>
                          <rect x="6" y="16" width="20" height="8" rx="3" fill="#194124"/>
                          <rect x="9" y="20" width="4" height="2" rx="1" fill="white"/>
                          <rect x="15" y="20" width="6" height="2" rx="1" fill="white"/>
                        </svg>
                      </span>
                      <span className="font-medium text-gray-900 text-base">Add New Credit/Debit Card</span>
                    </div>

                    {/* Card Holder Name */}
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-900">Card Holder Name *</label>
                      <input
                        type="text"
                        name="holder"
                        placeholder="Ex. John Doe"
                        className="w-full border rounded-full px-4 py-3 text-base focus:border-green-900 transition"
                        value={cardDetails.holder}
                        onChange={handleCardChange}
                      />
                    </div>

                    {/* Card Number */}
                    <div className="mb-4">
                      <label className="block mb-1 font-medium text-gray-900">Card Number *</label>
                      <input
                        type="text"
                        name="number"
                        placeholder="4716 9627 1635 8047"
                        className="w-full border rounded-full px-4 py-3 text-base focus:border-green-900 transition"
                        value={cardDetails.number}
                        onChange={handleCardChange}
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block mb-1 font-medium text-gray-900">Expiry Date *</label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="02/30"
                          className="w-full border rounded-full px-4 py-3 text-base focus:border-green-900 transition"
                          value={cardDetails.expiry}
                          onChange={handleCardChange}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium text-gray-900">CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          placeholder="000"
                          className="w-full border rounded-full px-4 py-3 text-base focus:border-green-900 transition"
                          value={cardDetails.cvv}
                          onChange={handleCardChange}
                        />
                      </div>
                    </div>

                    {/* Save Card Checkbox */}
                    <label className="flex items-center gap-2 mb-6">
                      <input
                        type="checkbox"
                        name="saveCard"
                        checked={cardDetails.saveCard}
                        onChange={handleCardChange}
                        className="accent-green-900 w-5 h-5"
                      />
                      <span className="text-gray-900 font-medium">Save card for future payments</span>
                    </label>

                    {/* Add Card Button */}
                    <button
                      type="button"
                      className="bg-green-900 text-white px-8 py-3 rounded-full font-semibold text-base shadow hover:bg-green-800 transition"
                    >
                      Add Card
                    </button>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border rounded-xl p-3 shadow-sm bg-white h-fit">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
              <hr className="my-4" />
              <div className="flex justify-between text-base mb-3">
                <span className="text-gray-400">Items</span>
                <span>{items}</span>
              </div>
              <div className="flex justify-between text-base mb-3">
                <span className="text-gray-400">Sub Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base mb-3">
                <span className="text-gray-400">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base mb-3">
                <span className="text-gray-400">Taxes</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base mb-3">
                <span className="text-gray-400">Coupon Discount</span>
                <span className="text-gray-900">- ${coupon.toFixed(2)}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg mb-6">
                <span className="text-gray-400">Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate("/ordercomplted")}
                className="w-full bg-green-900 text-white py-3 rounded-full text-sm hover:bg-green-800 transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      </div>
      <Features data={furnitureData.features}/>
      <Footer data={furnitureData.footer} />
    </>
  );
};

export default Payment;