import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/publicAPI";
import BuyModal from "../components/Buy";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [showBuy, setShowBuy] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
        setError("");
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleBuyNow = () => {
    // ✅ No login requirement
    setShowBuy(true);
  };

  // --- Cart helpers (localStorage) ---
  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  };

  const saveCart = (next) => {
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart:updated"));
  };

  const addToCart = () => {
    if (!product) return;

    const cart = getCart();
    const existing = cart.find((x) => String(x.id) === String(product.id));
    let next;

    if (existing) {
      next = cart.map((x) =>
        String(x.id) === String(product.id)
          ? { ...x, qty: Number(x.qty || 1) + Number(quantity || 1) }
          : x
      );
    } else {
      next = [
        ...cart,
       {
  id: product.id,
  name: product.name,
  price: product.price,
  image_url: product.image_url,
  qty: Number(quantity || 1),
},
      ];
    }

    saveCart(next);
    alert("✅ Added to cart!");
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/900x700/EEE/31343C?text=Product+Image";
  };

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price || 0) * Number(quantity || 1);
  }, [product, quantity]);

  const decQty = () => setQuantity((prev) => Math.max(1, prev - 1));
  const incQty = () => setQuantity((prev) => prev + 1);

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-state">
          <div className="pd-spinner" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-state">
          <h2>⚠️ Product Not Found</h2>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <button className="pd-btn pd-btn-outline" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* Header */}
      <div className="pd-header">
        <button className="pd-btn pd-btn-outline" onClick={() => navigate("/")}>
          ← Back to Products
        </button>
        <h1 className="pd-title">Product Details</h1>
      </div>

      {/* Premium Card */}
      <div className="pd-card">
        <div className="pd-grid">
          {/* LEFT: Image */}
          <div className="pd-imageWrap">
            <div className="pd-imageFrame">
              <img
                src={product.image_url}
                alt={product.name}
                className="pd-image"
                onError={handleImageError}
                loading="lazy"
              />
            </div>

            <div className="pd-trustRow">
              <span className="pd-chip">Genuine</span>
              <span className="pd-chip">Fast delivery</span>
              <span className="pd-chip">Easy returns</span>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="pd-content">
            <div className="pd-top">
              <div>
                <h2 className="pd-name">{product.name}</h2>
                <p className="pd-sub">Premium quality • Authentic feel • Fast delivery</p>
              </div>
              <div className="pd-price">₹{product.price}</div>
            </div>

            <div className="pd-section">
              <h3 className="pd-h3">Description</h3>
              <p className="pd-desc">{product.description || "No description available."}</p>
            </div>

            <div className="pd-section">
              <h3 className="pd-h3">Quantity</h3>
              <div className="pd-qtyRow">
                <button
                  className="pd-qtyBtn"
                  onClick={decQty}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="pd-qty">{quantity}</span>
                <button className="pd-qtyBtn" onClick={incQty} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <p className="pd-note">Choose how many units you want.</p>
            </div>

            <div className="pd-summary">
              <div className="pd-srow">
                <span>Price (each)</span>
                <span>₹{product.price}</span>
              </div>
              <div className="pd-srow">
                <span>Quantity</span>
                <span>{quantity}</span>
              </div>
              <div className="pd-srow pd-total">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* ✅ Desktop Sticky Actions */}
            <div className="pd-stickyActions">
              <div className="pd-ctaRow">
                <button className="pd-btn pd-btn-soft pd-cta" onClick={addToCart}>
                  Add to Cart
                </button>

                <button className="pd-btn pd-btn-primary pd-cta" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Bottom Sticky Bar */}
      <div className="pd-bottomBar">
        <div className="pd-bottomInfo">
          <div className="pd-bottomTotal">
            <span className="pd-bottomLabel">Total</span>
            <b>₹{totalPrice.toFixed(2)}</b>
          </div>

          <div className="pd-bottomQty">
            <button className="pd-miniQtyBtn" onClick={decQty} disabled={quantity <= 1} aria-label="Decrease quantity">
              −
            </button>
            <span className="pd-miniQty">{quantity}</span>
            <button className="pd-miniQtyBtn" onClick={incQty} aria-label="Increase quantity">
              +
            </button>
          </div>
        </div>

        <div className="pd-bottomBtns">
          <button className="pd-btn pd-btn-soft pd-bottomBtn" onClick={addToCart}>
            Add to Cart
          </button>

          <button className="pd-btn pd-btn-primary pd-bottomBtn" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>

      {/* Buy Modal (user is null now) */}
      <BuyModal
        open={showBuy}
        onClose={() => setShowBuy(false)}
        product={product}
        quantity={quantity}
        user={null}
        onSuccess={() => {
          setShowBuy(false);
          navigate("/");
        }}
      />
    </div>
  );
};

export default ProductDetails;