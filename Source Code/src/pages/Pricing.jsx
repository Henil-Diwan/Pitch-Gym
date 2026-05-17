
import React, { useState, useEffect, use } from 'react';
import supabase from '@/db/supabase.js';

import axios from "axios";


const loadScript = async (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const initiateOrderCreate = async (itemDetails) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  return axios.post(
    import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_ORDER_CREATE,
    itemDetails,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );
};


// const verifyPayment = async (paymentPayload) => {
//   // get current session
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();
//   console.log("supabase session access token ", session.access_token);

//   if (!session) {
//     throw new Error("User not authenticated");
//   }

//   const verifyPaymentResponse = await axios.post(
//     import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_PAYMENT_VERIFY,
//     paymentPayload,
//     {
//       headers: {
//         Authorization: `Bearer ${session.access_token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   console.log("Result received", verifyPaymentResponse);
//   return verifyPaymentResponse;
// };



//Pricing Component

const Pricing = () => {
     const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 12000);
    return () => clearTimeout(timer);
  }, []);


  const handlepayment = async (price) => {
   
    setLoading(true);
  
  console.log("Purchase method running");

  const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
  if (!res) {
    alert("RazorPay failed to load!!");
    return;
  }

  var item = {
    price,
    title: "Sample item",
    description: "TEst description",
  };

  const orderCreationResponse = await initiateOrderCreate(item);
  console.log("Order creation Response", orderCreationResponse);
  const orderId = orderCreationResponse.data.order.id;
  console.log("orderid", orderId);

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY,
    // amount: orderCreationResponse.data.order.amount,
    currency: "INR",
    name: item.title,
    description: item.description,
    order_id: orderId,
    handler: async function (response) {
      console.log("response is for testing", response);
      alert("payment processing. Credits will be added shortly if payment is successful.");

      // const paymentPayload = {
      //   razorpayOrderId: response.razorpay_order_id,
      //   razorpayPaymentId: response.razorpay_payment_id,
      //   razorpaySignature: response.razorpay_signature,
      //   credits
      // };

      // const result = await verifyPayment(paymentPayload);
      // console.log("result", result);
     
    },
    notes: {
      address: "Pitch Gym",
    },
    theme: {
      color: "#3399cc",
    },
  };

   setLoading(false);
   
  const paymentObject = new window.Razorpay(options);
  
  paymentObject.on("payment.failed", function (response) {
  
    console.error("Payment failed:", response.error);

  alert(
    response.error.description ||
    "Payment failed. If money was deducted, it will be refunded automatically."
  );

  });


  paymentObject.open();
 
};



  const plans = [
    { id: 'single', name: 'Start', price: 499, desc: 'Intro to clear practice.', credits: 1 },
    { id: 'double', name: 'Journey', price: 899, desc: 'Build lasting confidence.', popular: true, credits: 2 },
    { id: 'triple', name: 'Full', price: 999, desc: 'Ultimate preparation.', credits: 3 },
  ];

 

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 view-fade mt-15">
      
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-4xl md:text-7xl font-brand font-extrabold text-white tracking-tighter leading-tight">Find your <br/> <span className="text-pitch-cyan italic">peace.</span></h2>
        <p className="text-slate-500 text-lg font-light">Every session is a gift to your future self.</p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6 mb-20">
        {plans.map(p => (
          <div key={p.id} className={`p-8 rounded-[2rem] border transition-all duration-300 relative glass-warm border-white/10 hover:bg-white/5'}`}>
          
            <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
            <p className="text-slate-500 text-sm font-light mb-8">{p.desc}</p>
            <div className="mb-8">
              <span className="text-5xl font-brand font-extrabold text-white tracking-tighter">₹{p.price}</span>
            </div>
            <button 
              disabled={loading}
              onClick={() => handlepayment(p.price)}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition shadow-xl btn-human bg-white/5 border border-white/10 text-white`}
            >
              {loading?"processing":"Buy"}
            </button>
          </div>
        ))}
      </div>

     
    </div>
  );
};

export default Pricing;
