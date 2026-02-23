// src/pages/PrivacyPolicy.jsx
import React from "react";
import PolicyLayout from "./PolicyLayout";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" updated="22 Feb 2026">
      <p>
        This Privacy Policy explains how <strong>Ekabhumih</strong> (“we”, “us”,
        “our”) collects, uses, and protects your information when you use our
        website to browse and purchase our skin and hair care products.
      </p>

      <h3>Information we collect</h3>
      <ul>
        <li>Contact details: name, email address, phone number</li>
        <li>Shipping details: delivery address and pincode</li>
        <li>Order details: product, quantity, order amount, order status</li>
        <li>
          Payment details: payments are processed securely by{" "}
          <strong>Razorpay</strong>. We do <strong>not</strong> store your
          card/UPI/bank details.
        </li>
      </ul>

      <h3>How we use information</h3>
      <ul>
        <li>To process orders, payments, dispatch, and delivery</li>
        <li>To provide customer support and resolve issues</li>
        <li>To prevent fraud, abuse, and unauthorized transactions</li>
        <li>To communicate order updates (confirmation, shipping, delivery)</li>
      </ul>

      <h3>Sharing of information</h3>
      <p>
        We share only the minimum required information with trusted service
        providers to complete your order, such as:
      </p>
      <ul>
        <li>Payment gateway: Razorpay</li>
        <li>Courier/logistics partners (e.g., DTDC or other available couriers)</li>
      </ul>
      <p>We do not sell or rent your personal information.</p>

      <h3>Data security</h3>
      <p>
        We use reasonable security measures to protect your information.
        However, no method of transmission over the internet is 100% secure.
      </p>

      <h3>Cookies</h3>
      <p>
        Our website may use cookies or similar technologies to improve user
        experience and understand website usage.
      </p>

      <h3>Contact</h3>
      <p>
        If you have questions about this Privacy Policy, contact us:
      </p>
      <ul>
        <li>
          <strong>Ekabhumih</strong>, Kaloor, Kochi, Kerala, India
        </li>
        <li>Email: <strong>bhumihlifestyle@gmail.com</strong></li>
        <li>Phone: <strong>+91 78290 33319</strong></li>
      </ul>
    </PolicyLayout>
  );
}