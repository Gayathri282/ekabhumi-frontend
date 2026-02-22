import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails.jsx";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ReviewLogin from "./pages/Review";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/review-login" element={<ReviewLogin />} />

        {/* Protected user routes */}
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;