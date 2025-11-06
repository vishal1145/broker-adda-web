"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
    document.body.appendChild(script);
  });
}

const Plans = () => {
  const [isRzpLoaded, setIsRzpLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;

  useEffect(() => {
    loadRazorpayScript()
      .then(() => setIsRzpLoaded(true))
      .catch((err) => {
        console.error('Razorpay SDK load error:', err);
        setIsRzpLoaded(false);
      });
  }, []);

  const handlePayment = async (plan) => {
    setSelectedPlan(plan.id);

    if (!isRzpLoaded) {
      toast.error('Payment SDK not loaded. Please try again in a moment.');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const orderRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`, { amount: plan.price * 100, planType: plan.name, period: plan.period });
      if (!orderRes.data?.order) throw new Error('Order failed');
      const order = orderRes.data.order;

      const options = {
        key: KEY_ID, // public key
        amount: order.amount,
        currency: order.currency,
        name: 'Broker Gully',
        description: `Payment for ${plan.name} plan`,
        order_id: order.id,
        handler: async function (response) {
          // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature

          const payload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planType: orderRes.data.planType,
            period: orderRes.data.period,
          };

          console.log('payload', payload);

          try {
            const verifyRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify-payment`, payload, {headers}  );

            if (verifyRes.data.success) {
              toast.success('Payment successful and saved!');
              // update UI accordingly
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('verify error', err);
            toast.error('Verification request failed');
          }
        },
        prefill: {
          name: '', email: '', contact: ''
        },
        // theme: { color: '#16BCC0' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('handlePayment error', error?.response?.data || error.message || error);
      toast.error('Payment initiation failed');
    } finally {
      setSelectedPlan(null);
    }
  }

  const subscriptionPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 999,
      period: "month",
      features: [
        "Up to 50 property listings",
        "Basic analytics dashboard",
        "Email support",
        "Mobile app access",
        "5 lead inquiries per month",
      ],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: 1999,
      period: "month",
      features: [
        "Unlimited property listings",
        "Advanced analytics dashboard",
        "Priority email & phone support",
        "Mobile app access",
        "Unlimited lead inquiries",
        "Featured property listings",
        "Social media integration",
      ],
      popular: true,
    },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-center mb-8">Choose Your Subscription Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative border rounded-xl p-6 shadow-sm bg-white transition-all hover:shadow-md ${plan.popular ? "border-green-900 ring-2 ring-green-900" : "border-gray-200"
                    } ${selectedPlan === plan.id ? "ring-2 ring-green-900" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-900 text-white text-xs font-semibold px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-gray-500 ml-1">/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-green-900 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePayment(plan)}
                    className={`w-full py-3 rounded-full text-sm font-medium transition ${selectedPlan === plan.id
                        ? "bg-green-900 text-white hover:bg-green-800"
                        : plan.popular
                          ? "bg-green-900 text-white hover:bg-green-800"
                          : "border-2 border-green-900 text-green-900 hover:bg-green-50"
                      }`}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <Features data={furnitureData.features}/> */}
    </>
  );
};

export default Plans;
