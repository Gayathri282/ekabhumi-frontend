// src/pages/TermsAndConditions.jsx
import React from "react";
import PolicyLayout from "./PolicyLayout";

export default function TermsAndConditions() {
  return (
    <PolicyLayout title="Terms & Conditions" updated="22 Feb 2026">
      <p>
        These Terms & Conditions govern your use of the Ekabhumih website and
        purchases made through it. By accessing or using the website, you agree
        to these terms.
      </p>

      <h3>About Ekabhumih</h3>
      <p>
        Ekabhumih sells skin and hair care products (including cosmetic
        products such as Redensyl Hair Oil). We operate from Kaloor, Kochi,
        Kerala, India.
      </p>

      <h3>Orders & payments</h3>
      <ul>
        <li>Orders are confirmed only after successful payment (unless stated otherwise).</li>
        <li>
          Payments are processed securely via Razorpay (UPI/Card/Netbanking/Wallet).
        </li>
        <li>
          We may cancel/refund an order in rare cases such as stock unavailability,
          technical issues, or pricing errors.
        </li>
      </ul>

      <h3>Pricing & taxes</h3>
      <p>
        Prices are displayed in INR and may change without notice. Shipping
        charges vary based on pincode and are shown at checkout. GST is applied
        as per Indian regulations (GSTIN available if required).
      </p>

      <h3>Shipping & delivery</h3>
      <p>
        We dispatch typically within 24 hours after successful payment, and
        delivery is usually completed within 2 business days after dispatch
        depending on location and courier availability.
      </p>

      <h3>Returns & refunds</h3>
      <p>
        Returns/refunds are governed by our Refund & Cancellation Policy. Due
        to hygiene reasons, opened/used cosmetic products are not eligible for
        return.
      </p>

      <h3>User responsibilities</h3>
      <ul>
        <li>Provide accurate contact and shipping information.</li>
        <li>Do not misuse the website or attempt fraudulent transactions.</li>
      </ul>

      <h3>Limitation of liability</h3>
      <p>
        We are not liable for indirect or consequential damages. Our liability
        is limited to the order value paid by the customer.
      </p>

      <h3>Governing law</h3>
      <p>
        These terms are governed by the laws of India. Any disputes shall be
        subject to jurisdiction in Kerala, India.
      </p>

      <h3>Contact</h3>
      <ul>
        <li>Email: <strong>bhumihlifestyle@gmail.com</strong></li>
        <li>Phone: <strong>+91 78290 33319</strong></li>
        <li>Location: Kaloor, Kochi, Kerala, India</li>
      </ul>
    </PolicyLayout>
  );
}