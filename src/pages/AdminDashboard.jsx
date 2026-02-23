// AdminDashboard.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

import AddProduct from "./AddProduct";
import Orders from "./Orders";
import UpdateProduct from "./UpdateProduct";

function AdminDashboard() {
  const navigate = useNavigate();

  // orders | approved | products | addProduct | updateProduct
  const [activeTab, setActiveTab] = useState("orders");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ NEW: selected product for update
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ single newProduct state (with quantity)
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    priority: "1",
    quantity: "0",
    image: null,
  });

  const API_BASE = useMemo(
    () => process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com",
    []
  );

  // ✅ Approved selection + cleared ids (frontend-only)
  const [approvedSelected, setApprovedSelected] = useState(() => new Set());
  const [clearedApprovedIds, setClearedApprovedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("clearedApprovedIds") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("clearedApprovedIds", JSON.stringify(clearedApprovedIds));
  }, [clearedApprovedIds]);

 const isUserAdmin = () => {
  const token = localStorage.getItem("adminToken");
  const userData = localStorage.getItem("userData");

  // allow token-only (ProtectedRoute already does)
  if (token && !userData) return true;

  if (!userData) return false;
  try {
    const parsed = JSON.parse(userData);
    return parsed.role === "admin" || parsed.isAdmin === true || !!token;
  } catch {
    return !!token;
  }
};

  const ensureJWTToken = useCallback(async () => {
    const t = localStorage.getItem("adminToken");
    return t || null;
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Orders failed: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => []);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [API_BASE, ensureJWTToken]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/admin-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Products failed: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => []);
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [API_BASE, ensureJWTToken]);

  useEffect(() => {
    if (!isUserAdmin()) {
      alert("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLoading(false);
      setError("Admin token missing. Please login again as admin.");
      navigate("/");
      return;
    }

    const boot = async () => {
      setLoading(true);
      setError("");
      await fetchOrders();
      setLoading(false);
    };

    boot();
  }, [fetchOrders, navigate]);

  // on-demand products
  useEffect(() => {
    if (
      (activeTab === "products" || activeTab === "addProduct" || activeTab === "updateProduct") &&
      products.length === 0 &&
      !loadingProducts
    ) {
      fetchProducts();
    }
  }, [activeTab, fetchProducts, products.length, loadingProducts]);

  // ✅ reset selection when leaving update tab
  useEffect(() => {
    if (activeTab !== "updateProduct") {
      setSelectedProduct(null);
    }
  }, [activeTab]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleImageError = (e) => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = "https://placehold.co/200x150/EEE/31343C?text=No+Image";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/delete-product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Delete failed: ${res.status} ${text}`);
      }

      await fetchProducts();
      localStorage.setItem("productsUpdated", Date.now().toString());
      alert("Product deleted successfully!");
    } catch (e) {
      setError(e?.message || "Failed to delete product");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.image) return setError("Please select an image file");
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      return setError("Please fill all required fields");
    }

    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price.toString());
      formData.append("description", newProduct.description);
      formData.append("priority", newProduct.priority || "1");
      formData.append("quantity", String(newProduct.quantity ?? "0"));
      formData.append("image", newProduct.image);

      const res = await fetch(`${API_BASE}/admin/create-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Create failed: ${res.status} ${text}`);
      }

      setShowAddForm(false);

      setNewProduct({
        name: "",
        price: "",
        description: "",
        priority: "1",
        quantity: "0",
        image: null,
      });

      await fetchProducts();
      localStorage.setItem("productsUpdated", Date.now().toString());
      alert("Product added successfully!");
      setError("");
      setActiveTab("products");
    } catch (e) {
      setError(e?.message || "Failed to add product");
    }
  };

  // ✅ NEW: update product submit (frontend ready; backend can be added later)
  const handleUpdateProduct = useCallback(
    async (payload) => {
      try {
        const token = await ensureJWTToken();
        if (!token) throw new Error("Admin token missing. Please login again as admin.");

        // payload: { id, name, price, description, priority, quantity, imageFile? }
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("price", String(payload.price));
        formData.append("description", payload.description);
        formData.append("priority", String(payload.priority ?? "1"));
        formData.append("quantity", String(payload.quantity ?? "0"));

        // optional image
        if (payload.imageFile) {
          formData.append("image", payload.imageFile);
        }

        // ✅ Decide endpoint: you will implement later in backend
        // Suggested: PUT /admin/update-product/{id}
        const res = await fetch(`${API_BASE}/admin/update-product/${payload.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Update failed: ${res.status} ${text}`);
        }

        await fetchProducts();
        localStorage.setItem("productsUpdated", Date.now().toString());
        alert("✅ Product updated successfully!");
        setError("");
        setActiveTab("products");
      } catch (e) {
        setError(e?.message || "Failed to update product");
      }
    },
    [API_BASE, ensureJWTToken, fetchProducts]
  );

  const approveOrder = useCallback(
    async (orderId) => {
      try {
        const token = await ensureJWTToken();
        if (!token) throw new Error("Admin token missing. Please login again as admin.");

        const res = await fetch(`${API_BASE}/admin/orders/${orderId}/approve`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Approve failed: ${res.status} ${text}`);
        }

        await fetchOrders();
        alert("✅ Order approved and email sent!");
      } catch (e) {
        const msg = e?.message || "Failed to approve order";
        setError(msg);
        alert(msg);
      }
    },
    [API_BASE, ensureJWTToken, fetchOrders]
  );

const pendingOrders = useMemo(
  () => orders.filter((o) => String(o.status || "").toLowerCase() === "pending"),
  [orders]
);

const approvedOrders = useMemo(() => {
  const clearedSet = new Set(clearedApprovedIds);

  return orders.filter((o) => {
    const status = String(o.status || "").toLowerCase();
    const isApproved = status === "confirmed";
    return isApproved && !clearedSet.has(o.id);
  });
}, [orders, clearedApprovedIds]);

  const toggleApprovedSelect = (orderId) => {
    setApprovedSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const clearSelectedApprovedOrders = () => {
    const ids = Array.from(approvedSelected);
    if (ids.length === 0) return;

    setClearedApprovedIds((prev) => {
      const s = new Set(prev);
      ids.forEach((id) => s.add(id));
      return Array.from(s);
    });

    setApprovedSelected(new Set());
  };

  const clearAllApprovedOrders = () => {
    if (approvedOrders.length === 0) return;

    setClearedApprovedIds((prev) => {
      const s = new Set(prev);
      approvedOrders.forEach((o) => s.add(o.id));
      return Array.from(s);
    });

    setApprovedSelected(new Set());
  };

  const restoreApprovedOrders = () => {
    setClearedApprovedIds([]);
    setApprovedSelected(new Set());
  };

  const openUpdate = (product) => {
    setSelectedProduct(product);
    setActiveTab("updateProduct");
  };

  const title =
    activeTab === "orders"
      ? "Pending Orders"
      : activeTab === "approved"
      ? "Approved Orders"
      : activeTab === "products"
      ? "Products"
      : activeTab === "addProduct"
      ? "Add Product"
      : "Update Product";

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardShell}>
      {/* Top bar */}
      <div className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>Admin</div>
          <div className={styles.brandSub}>Orders • Products</div>
        </div>

        <button className={styles.logoutBtn} onClick={logout} type="button">
          Logout
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          ⚠️ {error}
          <button onClick={() => setError("")} className={styles.dismissBtn} type="button">
            ×
          </button>
        </div>
      )}

      <div className={styles.layout}>
        {/* Main */}
        <main className={styles.main}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{title}</h2>

            <div className={styles.sectionMeta}>
              {activeTab === "orders" && <span className={styles.pill}>{pendingOrders.length} pending</span>}

              {activeTab === "approved" && (
                <>
                  <span className={styles.pill}>{approvedOrders.length} approved</span>

                  <div className={styles.approvedActions}>
                    <button
                      type="button"
                      className={styles.clearSelectedBtn}
                      onClick={clearSelectedApprovedOrders}
                      disabled={approvedSelected.size === 0}
                      title={approvedSelected.size === 0 ? "Select orders to enable" : "Clear selected"}
                    >
                      Clear Selected ({approvedSelected.size})
                    </button>

                    <button
                      type="button"
                      className={styles.clearAllBtn}
                      onClick={clearAllApprovedOrders}
                      disabled={approvedOrders.length === 0}
                    >
                      Clear All
                    </button>

                    <button type="button" className={styles.restoreBtn} onClick={restoreApprovedOrders}>
                      Restore
                    </button>
                  </div>
                </>
              )}

              {activeTab === "products" && <span className={styles.pill}>{products.length} items</span>}

              {activeTab === "updateProduct" && selectedProduct && (
                <span className={styles.pill}>Editing: {selectedProduct.name}</span>
              )}
            </div>
          </div>

          {/* Orders */}
          {activeTab === "orders" && (
            <div className={styles.card}>
              {loadingOrders ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>⏳</div>
                  <h3>Loading Orders...</h3>
                  <p>Please wait</p>
                </div>
              ) : (
                <Orders orders={pendingOrders} onApprove={approveOrder} mode="pending" />
              )}
            </div>
          )}

          {/* Approved */}
         
{activeTab === "approved" && (
  <div className={styles.card}>
    {loadingOrders ? (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>⏳</div>
        <h3>Loading Orders...</h3>
        <p>Please wait</p>
      </div>
    ) : (
      <Orders
  orders={approvedOrders}
  mode="approved"
  onApprove={() => {}}  // ✅ required prop satisfied
  selectedIds={approvedSelected}
  onToggleSelect={toggleApprovedSelect}
/>
    )}
  </div>
)}

          {/* Products */}
          {activeTab === "products" && (
            <div className={styles.card}>
              {loadingProducts ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>⏳</div>
                  <h3>Loading Products...</h3>
                  <p>Please wait</p>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📦</div>
                  <h3>No Products Found</h3>
                  <p>Add your first product using “Add Product”.</p>
                </div>
              ) : (
                <div className={styles.productsGrid}>
                  {products.map((p) => {
                    const qty = Number(p.quantity ?? 0);
                    const availableSoon = qty <= 0;

                    return (
                      <div key={p.id} className={styles.productCard}>
                        {availableSoon && <div className={styles.availableSoonBadge}>Available Soon</div>}

                        <div className={styles.productImage}>
                          {p.image_url ? (
                            <img
                              src={p.image_url.startsWith("http") ? p.image_url : `${API_BASE}${p.image_url}`}
                              alt={p.name}
                              onError={handleImageError}
                            />
                          ) : (
                            <div className={styles.noImage}>No Image</div>
                          )}
                        </div>

                        <div className={styles.productContent}>
                          <h3 className={styles.productTitle}>{p.name}</h3>

                          <div className={styles.productRow}>
                            <div className={styles.productPrice}>₹{parseFloat(p.price).toFixed(2)}</div>
                            <div className={styles.qtyPill}>Qty: {qty}</div>
                          </div>

                          <p className={styles.productDescription}>{p.description}</p>

                          <div className={styles.productActions}>
                            <button
                              className={styles.updateBtn}
                              onClick={() => openUpdate(p)}
                              type="button"
                            >
                              Update
                            </button>

                            <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)} type="button">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Add Product */}
          {activeTab === "addProduct" && (
            <div className={styles.card}>
              <button
                className={styles.addProductBtn}
                onClick={() => setShowAddForm((s) => !s)}
                type="button"
              >
                {showAddForm ? "Close Form" : "Add New Product"}
              </button>

              <AddProduct
                showAddForm={showAddForm}
                setShowAddForm={setShowAddForm}
                newProduct={newProduct}
                setNewProduct={setNewProduct}
                handleAddProduct={handleAddProduct}
                setError={setError}
              />
            </div>
          )}

          {/* ✅ Update Product */}
          {activeTab === "updateProduct" && (
            <div className={styles.card}>
              {!selectedProduct ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>✏️</div>
                  <h3>Select a product to update</h3>
                  <p>Go to Products and click Update.</p>
                </div>
              ) : (
                <>
                  <div className={styles.updateTopRow}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={() => setActiveTab("products")}
                    >
                      ← Back to Products
                    </button>
                  </div>

                   <UpdateProduct
  product={selectedProduct}
  onCancel={() => setActiveTab("products")}
  onSubmit={handleUpdateProduct}
  setError={setError}
/>
                </>
              )}
            </div>
          )}
        </main>

        {/* Right tabs */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>Navigation</div>

            <button
              type="button"
              className={`${styles.sideTab} ${activeTab === "orders" ? styles.sideTabActive : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Pending Orders
              <span className={styles.sideCount}>{pendingOrders.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.sideTab} ${activeTab === "approved" ? styles.sideTabActive : ""}`}
              onClick={() => setActiveTab("approved")}
            >
              Approved Orders
              <span className={styles.sideCount}>{approvedOrders.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.sideTab} ${activeTab === "products" ? styles.sideTabActive : ""}`}
              onClick={() => setActiveTab("products")}
            >
              Products
              <span className={styles.sideCount}>{products.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.sideTab} ${activeTab === "addProduct" ? styles.sideTabActive : ""}`}
              onClick={() => setActiveTab("addProduct")}
            >
              Add Product
            </button>

            {activeTab === "updateProduct" && (
              <button
                type="button"
                className={`${styles.sideTab} ${styles.sideTabActive}`}
                onClick={() => setActiveTab("updateProduct")}
              >
                Update Product
                <span className={styles.sideCount}>✏️</span>
              </button>
            )}
          </div>

          <div className={styles.sideHint}>
            Tip: Go to Products → click Update to edit existing items.
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AdminDashboard;
