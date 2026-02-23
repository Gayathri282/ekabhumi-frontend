import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./Buy.css";

import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../api/publicAPI";

// Helper for manual shipping calculation
const getShippingCharge = (pincode) => {
  if (!pincode || pincode.length < 2) return 0;

  const prefix = pincode.substring(0, 2);
  const firstDigit = pincode[0];

  // KERALA: Pincodes starting with 67, 68, 69
  if (["67", "68", "69"].includes(prefix)) {
    return 50;
  }

  // SOUTH INDIA: Karnataka (56-59), TN (60-64), AP/Telangana (50-53)
  const southPrefixes = [
    "50", "51", "52", "53", "56", "57", "58", "59", "60", "61", "62", "63", "64"
  ];
  if (southPrefixes.includes(prefix)) {
    return 80;
  }

  // REST OF INDIA
  switch (firstDigit) {
    case "1": case "2": return 120; // North (Delhi, UP, etc.)
    case "3": case "4": return 100; // West/Central (Maharashtra, Gujarat)
    case "7": case "8": return 150; // East/NE (WB, Assam, Bihar)
    default: return 100;
  }
};

const BuyModal = ({ open, onClose, product, quantity, user, onSuccess }) => {
  const [orderLoading, setOrderLoading] = useState(false);

  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  // Calculate delivery fee dynamically as user types
  const deliveryFee = useMemo(() => {
    return getShippingCharge(orderForm.pincode);
  }, [orderForm.pincode]);

  // Grand Total: (Product Price * Qty) + Delivery Fee
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.price || 0) * Number(quantity || 1);
    return base + deliveryFee;
  }, [product, quantity, deliveryFee]);

  useEffect(() => {
    if (!open) return;
    setOrderForm((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName || "",
      email: user?.email || prev.email || "",
    }));
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const safeClose = useCallback(() => {
    if (orderLoading) return;
    onClose?.();
  }, [orderLoading, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !orderLoading) safeClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, orderLoading, safeClose]);

  if (!open) return null;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, phoneNumber, email, address, city, state, pincode } =
      orderForm;

    if (!fullName.trim()) return alert("Please enter your full name"), false;
    if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber))
      return alert("Please enter a valid 10-digit phone number"), false;
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      return alert("Please enter a valid email address"), false;
    if (!address.trim()) return alert("Please enter your delivery address"), false;
    if (!city.trim()) return alert("Please enter your city"), false;
    if (!state.trim()) return alert("Please enter your state"), false;
    if (!pincode.trim() || !/^\d{6}$/.test(pincode))
      return alert("Please enter a valid 6-digit pincode"), false;

    return true;
  };

  const handleSubmit = async () => {
    if (orderLoading) return;
    if (!product) return;
    if (!validateForm()) return;

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page and try again.");
      return;
    }

    setOrderLoading(true);

    try {
      const orderData = {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        total_amount: totalPrice, // ✅ Now includes deliveryFee
        customer_name: orderForm.fullName,
        customer_email: orderForm.email,
        customer_phone: orderForm.phoneNumber,
        shipping_address: `${orderForm.address}, ${orderForm.city}, ${orderForm.state} - ${orderForm.pincode}`,
        notes: orderForm.notes,
        status: "pending",
        payment_status: "pending",
        pincode: orderForm.pincode // ✅ Ensure backend gets this
      };

      // 1) Create DB order
      const created = await createOrder(orderData);
      const dbOrderId = created?.id;

      if (!dbOrderId) {
        throw new Error("Order creation failed on server.");
      }

      // 2) Create Razorpay order
      const rp = await createRazorpayOrder({
        dbOrderId,
        amountInr: orderData.total_amount,
        email: orderForm.email,
        phone: orderForm.phoneNumber,
      });

      // 3) Open checkout
      const options = {
        key: rp.keyId,
        amount: rp.amount,
        currency: rp.currency || "INR",
        name: "ELVORA",
        description: `Order #${dbOrderId}`,
        order_id: rp.razorpayOrderId,
        prefill: {
          name: orderForm.fullName,
          email: orderForm.email,
          contact: orderForm.phoneNumber,
        },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              dbOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert("✅ Payment successful! Order placed.");
            onSuccess?.();
            safeClose();
          } catch (e) {
            alert("Payment done, but verification failed. Please contact support.");
          }
        },
        modal: { ondismiss: () => alert("Payment cancelled.") },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => alert("❌ Payment failed."));
      rzp.open();

    } catch (err) {
      alert(err?.message || "Failed. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="buy-overlay" onMouseDown={safeClose}>
      <div className="buy-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="buy-head">
          <div>
            <h2 className="buy-title">Complete Your Order</h2>
            <p className="buy-sub">Secure Checkout • Doorstep Delivery</p>
          </div>
          <button className="buy-close" onClick={safeClose}>×</button>
        </div>

        <div className="buy-body">
          <div className="buy-summary">
            <h3>Order Summary</h3>
            <div className="buy-row">
              <span>{product?.name} (x{quantity})</span>
              <span>₹{(product?.price * quantity).toFixed(2)}</span>
            </div>
            <div className="buy-row">
              <span>Delivery Charge</span>
              <span className={deliveryFee > 0 ? "buy-fee-active" : ""}>
                {deliveryFee > 0 ? `+ ₹${deliveryFee}` : "Enter Pincode"}
              </span>
            </div>
            <div className="buy-row buy-total">
              <span>Grand Total</span>
              <span>₹{Number(totalPrice).toFixed(2)}</span>
            </div>
          </div>

          <div className="buy-form">
            <h3>Shipping Details</h3>
            <div className="buy-grid2">
              <div className="buy-field">
                <label>Full Name *</label>
                <input name="fullName" value={orderForm.fullName} onChange={handleFormChange} />
              </div>
              <div className="buy-field">
                <label>Phone Number *</label>
                <input name="phoneNumber" value={orderForm.phoneNumber} onChange={handleFormChange} maxLength={10} />
              </div>
            </div>

            <div className="buy-field">
              <label>Email Address *</label>
              <input name="email" type="email" value={orderForm.email} onChange={handleFormChange} />
            </div>

            <div className="buy-field">
              <label>Delivery Address *</label>
              <textarea name="address" value={orderForm.address} onChange={handleFormChange} rows={3} />
            </div>

            <div className="buy-grid3">
              <div className="buy-field">
                <label>City *</label>
                <input name="city" value={orderForm.city} onChange={handleFormChange} />
              </div>
              <div className="buy-field">
                <label>State *</label>
                <input name="state" value={orderForm.state} onChange={handleFormChange} />
              </div>
              <div className="buy-field">
                <label>Pincode *</label>
                <input name="pincode" value={orderForm.pincode} onChange={handleFormChange} maxLength={6} inputMode="numeric" />
              </div>
            </div>

            <div className="buy-field">
              <label>Order Notes (Optional)</label>
              <textarea name="notes" value={orderForm.notes} onChange={handleFormChange} rows={2} />
            </div>
          </div>
        </div>

        <div className="buy-actions">
          <button className="buy-btn buy-outline" onClick={safeClose} disabled={orderLoading}>Cancel</button>
          <button className="buy-btn buy-primary" onClick={handleSubmit} disabled={orderLoading}>
            {orderLoading ? "Processing..." : `Pay ₹${Number(totalPrice).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;