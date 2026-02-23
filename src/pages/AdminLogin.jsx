import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID; // set this in Vercel env

function AdminLogin() {
  const navigate = useNavigate();

  // Auto-redirect if already admin
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const userData = localStorage.getItem("userData");
    if (!token || !userData) return;

    try {
      const user = JSON.parse(userData);
      if (user?.role === "admin" || user?.isAdmin === true) {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userData");
    }
  }, [navigate]);

  const onGoogleCredential = useCallback(
    async (credential) => {
      try {
        // Call backend
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credential }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || "Login failed");

        // data: { access_token, role, email }
        if (data.role !== "admin") {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("userData");
          alert("❌ Not authorized. This admin panel is restricted.");
          return;
        }

        localStorage.setItem("adminToken", data.access_token);
        localStorage.setItem("userData", JSON.stringify({ email: data.email, role: data.role }));

        navigate("/admin/dashboard", { replace: true });
      } catch (e) {
        alert(e?.message || "Google login failed");
      }
    },
    [navigate]
  );

  useEffect(() => {
    // You must include Google Identity Services script in index.html:
    // <script src="https://accounts.google.com/gsi/client" async defer></script>

    if (!window.google) return;
    if (!GOOGLE_CLIENT_ID) {
      console.error("Missing REACT_APP_GOOGLE_CLIENT_ID");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => onGoogleCredential(resp.credential),
    });

    // Render button inside #googleBtn
    window.google.accounts.id.renderButton(document.getElementById("googleBtn"), {
      theme: "outline",
      size: "large",
      width: 260,
    });

    // Optional: auto prompt
    // window.google.accounts.id.prompt();
  }, [onGoogleCredential]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Admin Login</h2>
      <p>Only authorized administrators can access this panel.</p>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <div id="googleBtn" />
      </div>
    </div>
  );
}

export default AdminLogin;