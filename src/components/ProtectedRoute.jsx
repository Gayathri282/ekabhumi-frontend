// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const userToken =
    localStorage.getItem("userToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const adminToken = localStorage.getItem("adminToken");
  const userData = localStorage.getItem("userData"); // ✅ ADD BACK

  // No tokens at all
  if (!userToken && !adminToken) {
    return <Navigate to="/" replace />;
  }

  // Try to parse user data
  try {
    let user = null;
    if (userData) user = JSON.parse(userData);

    // If admin access required
    if (requireAdmin) {
      const isAdmin =
        (user && (user.role === "admin" || user.isAdmin === true)) || !!adminToken;

      if (!isAdmin) return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    // Clear invalid data
    localStorage.removeItem("userToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminToken");
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;