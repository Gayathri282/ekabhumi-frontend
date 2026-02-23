import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  if (!requireAdmin) return children;

  const adminToken = localStorage.getItem("adminToken");
  const userDataRaw = localStorage.getItem("userData");

  let user = null;
  try {
    user = userDataRaw ? JSON.parse(userDataRaw) : null;
  } catch {
    localStorage.removeItem("userData");
  }

  // ✅ must be admin user (NOT just token)
  const isAdminUser = !!user && (user.role === "admin" || user.isAdmin === true);

  // ✅ require BOTH: token + admin user
  if (!adminToken || !isAdminUser) {
    // clean up (prevents non-admin gmail sticking around)
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userData");
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;