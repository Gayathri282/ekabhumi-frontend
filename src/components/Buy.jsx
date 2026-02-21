// src/components/Buy.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./Buy.css";
import { loadRazorpay } from "../utils/loadRazorpay";
import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../api/publicAPI";

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

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price || 0) * Number(quantity || 1);
  }, [product, quantity]);

  // Prefill from logged user
  useEffect(() => {
    if (!open) return;
    setOrderForm((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName || "",
      email: user?.email || prev.email || "",
    }));
  }, [open, user]);

  // Lock page scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Prevent closing while processing
  const safeClose = useCallback(() => {
    if (orderLoading) return;
    onClose?.();
  }, [orderLoading, onClose]);

  // ESC to close (disable during loading)
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
    if (!product) return;
    if (!validateForm()) return;

    setOrderLoading(true);
    try {
      // 1) Create DB order first (pending)
      const orderData = {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        total_amount: Number(product.price) * Number(quantity),
        customer_name: orderForm.fullName,
        customer_email: orderForm.email,
        customer_phone: orderForm.phoneNumber,
        shipping_address: `${orderForm.address}, ${orderForm.city}, ${orderForm.state} - ${orderForm.pincode}`,
        notes: orderForm.notes,
        status: "pending",
        payment_status: "pending",
      };

      const created = await createOrder(orderData);
      console.log("Created DB order:", created);

      const dbOrderId = created?.id;
      if (!dbOrderId) {
        throw new Error(
          "Order created but missing 'id' in backend response. Ensure /orders POST returns {id: ...}."
        );
      }

      // 2) Load Razorpay SDK
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Razorpay SDK failed to load");

      // 3) Create Razorpay order
      const rp = await createRazorpayOrder({
        dbOrderId,
        amountInr: orderData.total_amount,
        email: orderForm.email,
        phone: orderForm.phoneNumber,
      });

      console.log("Razorpay create-order response:", rp);

      // 4) Open checkout
      const options = {
        key: rp.keyId,
        amount: rp.amount, // paise
        currency: rp.currency || "INR",
        name: "ELVORA",
        description: `Order #${dbOrderId}`,
        order_id: rp.razorpayOrderId, // must match backend response name
        prefill: rp.prefill || {
          name: orderForm.fullName,
          email: orderForm.email,
          contact: orderForm.phoneNumber,
        },
        handler: async (response) => {
          try {
            // 5) Verify payment
            await verifyRazorpayPayment({
              dbOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert("✅ Payment successful! Order placed.");
            onSuccess?.();
          } catch (e) {
            console.error("Verify failed:", e);
            alert("Payment done, but verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            alert("Payment cancelled.");
          },
        },
      };

      // NOTE: requires window.Razorpay typing fix (razorpay.d.ts)
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (resp) {
        console.error("Payment failed:", resp?.error);
        alert("❌ Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
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
            <p className="buy-sub">
              Premium checkout • Clean details • Fast confirmation
            </p>
          </div>

          <button
            className="buy-close"
            onClick={safeClose}
            disabled={orderLoading}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="buy-body">
          {/* Summary */}
          <div className="buy-summary">
            <h3>Order Summary</h3>
            <div className="buy-row">
              <span>Product</span>
              <span className="buy-strong">{product?.name}</span>
            </div>
            <div className="buy-row">
              <span>Price</span>
              <span>
                ₹{product?.price} × {quantity}
              </span>
            </div>
            <div className="buy-row buy-total">
              <span>Total</span>
              <span>₹{Number(totalPrice).toFixed(2)}</span>
            </div>
          </div>

          {/* Form */}
          <div className="buy-form">
            <h3>Shipping Details</h3>

            <div className="buy-grid2">
              <div className="buy-field">
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={orderForm.fullName}
                  onChange={handleFormChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="buy-field">
                <label>Phone Number *</label>
                <input
                  name="phoneNumber"
                  value={orderForm.phoneNumber}
                  onChange={handleFormChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="buy-field">
              <label>Email Address *</label>
              <input
                name="email"
                type="email"
                value={orderForm.email}
                onChange={handleFormChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="buy-field">
              <label>Delivery Address *</label>
              <textarea
                name="address"
                value={orderForm.address}
                onChange={handleFormChange}
                placeholder="Full address with landmark"
                rows={3}
              />
            </div>

            <div className="buy-grid3">
              <div className="buy-field">
                <label>City *</label>
                <input
                  name="city"
                  value={orderForm.city}
                  onChange={handleFormChange}
                  placeholder="City"
                />
              </div>

              <div className="buy-field">
                <label>State *</label>
                <input
                  name="state"
                  value={orderForm.state}
                  onChange={handleFormChange}
                  placeholder="State"
                />
              </div>

              <div className="buy-field">
                <label>Pincode *</label>
                <input
                  name="pincode"
                  value={orderForm.pincode}
                  onChange={handleFormChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="buy-field">
              <label>Order Notes (Optional)</label>
              <textarea
                name="notes"
                value={orderForm.notes}
                onChange={handleFormChange}
                placeholder="Any special instructions"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="buy-actions">
          <button
            className="buy-btn buy-outline"
            onClick={safeClose}
            disabled={orderLoading}
            type="button"
          >
            Cancel
          </button>

          <button
            className="buy-btn buy-primary"
            onClick={handleSubmit}
            disabled={orderLoading}
            type="button"
          >
            {orderLoading ? (
              <>
                <span className="buy-miniSpin" />
                Processing...
              </>
            ) : (
              `Pay ₹${Number(totalPrice).toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;