// src/pages/ShippingAndDelivery.jsx
import React from "react";
import PolicyLayout from "./PolicyLayout";

export default function ShippingAndDelivery() {
  return (
    <PolicyLayout title="Shipping & Delivery Policy" updated="22 Feb 2026">
      <p>
        We ship <strong>within India only</strong>. Shipping charges (if any)
        vary by pincode and are shown at checkout.
      </p>

      <h3>Dispatch</h3>
      <p>
        Orders are typically dispatched within <strong>24 hours</strong> after
        successful payment (excluding rare cases such as high order volume,
        address verification, or unexpected delays).
      </p>

      <h3>Delivery timeline</h3>
      <p>
        Delivery is usually completed within <strong>2-5 business days</strong>{" "}
        after dispatch depending on location and courier availability.
      </p>
      <p>
        We may use DTDC or other available courier partners based on your
        pincode/serviceability.
      </p>

      <h3>Shipping charges</h3>
      <p>
        Shipping charges are calculated based on delivery pincode and order
        value, and are displayed before you complete payment.
      </p>

      <h3>Delivery issues</h3>
      <p>
        If your order is delayed or marked delivered but not received, contact
        support with your order ID and registered phone/email. We will help
        investigate with the courier partner.
      </p>

      <h3>Incorrect address</h3>
      <p>
        Please ensure your address and pincode are correct. Delivery failures
        due to incorrect/incomplete address may lead to delays or additional
        shipping charges.
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