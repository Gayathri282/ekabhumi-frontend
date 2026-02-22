import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

export default function ReviewLogin() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in for review...");

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");

        if (!token) {
          setMessage("Missing review token.");
          return;
        }

        const response = await fetch(
          `${API_URL}/auth/review-login?token=${encodeURIComponent(token)}`
        );

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(text || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data?.access_token) {
          throw new Error("No access token received");
        }

        // Store token under BOTH keys (important)
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token", data.access_token);

        setMessage("Access granted. Redirecting...");
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Review login error:", err);
        setMessage("Review login failed. Please contact support.");
      }
    };

    run();
  }, [navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Review Access</h2>
      <p>{message}</p>
    </div>
  );
}