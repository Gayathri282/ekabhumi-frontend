// src/pages/RefundAndCancellation.jsx
import React from "react";
import PolicyLayout from "./PolicyLayout";

export default function RefundAndCancellation() {
  return (
    <PolicyLayout title="Refund & Cancellation Policy" updated="22 Feb 2026">
      <p>
        We sell cosmetic and personal care products. Due to hygiene and safety
        reasons, returns are accepted only under specific conditions mentioned
        below.
      </p>

      <h3>Cancellations</h3>
      <p>
        Orders cannot be cancelled once placed and confirmed. If you made a
        mistake, please contact support immediately after placing the order and
        we will try to help if dispatch has not started.
      </p>

      <h3>Returns (7 days)</h3>
      <p>
        Returns are accepted within <strong>7 days</strong> of delivery only if
        the product is <strong>unused, unopened</strong>, and in its{" "}
        <strong>original packaging</strong>.
      </p>
      <p>
        <strong>Opened/used cosmetic products are not eligible for return</strong>{" "}
        (hygiene policy).
      </p>

      <h3>Damaged / wrong item</h3>
      <p>
        If you receive a damaged, leaked, or incorrect item, contact us as soon
        as possible after delivery with:
      </p>
      <ul>
        <li>Order ID</li>
        <li>Unboxing photos/videos (if available)</li>
        <li>Clear product images showing the issue</li>
      </ul>
      <p>
        We will review the request and arrange a replacement or refund where
        applicable.
      </p>

      <h3>Refunds</h3>
      <p>
        If approved, refunds are processed back to the original payment method.
        Refund processing typically takes <strong>5–7 business days</strong>{" "}
        (actual credit time may depend on the bank/payment provider).
      </p>

      <h3>Non-returnable items</h3>
      <p>
        Products that are opened/used, damaged due to customer handling, or not
        in original condition may not be eligible for return/refund.
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