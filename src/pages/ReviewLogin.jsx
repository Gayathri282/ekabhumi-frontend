import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND = "https://ekb-backend.onrender.com";

export default function ReviewLogin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Signing you in for Razorpay review...");

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");

      if (!token) {
        setStatus("Missing token. Please use the full review link provided.");
        return;
      }

      try {
        const res = await fetch(
          `${BACKEND}/auth/review-login?token=${encodeURIComponent(token)}`,
          { method: "GET" }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!data?.access_token) {
          throw new Error("No access token returned from server");
        }

        // Store token where your app expects it
        localStorage.setItem("access_token", data.access_token);

        setStatus("Access granted. Redirecting to products...");
        navigate("/products", { replace: true }); // change if your products route differs
      } catch (err) {
        console.error(err);
        setStatus("Review login failed. Please contact support.");
      }
    };

    run();
  }, [navigate]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 8 }}>Review Access</h2>
      <p style={{ margin: 0 }}>{status}</p>
    </div>
  );
}