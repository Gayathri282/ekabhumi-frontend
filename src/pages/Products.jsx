// src/pages/Products.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Products.css";
import { fetchProducts } from "../api/publicAPI";

const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function imgSrc(p) {
  if (!p.image_url) return "https://placehold.co/600x450/EEE/31343C?text=Product+Image";
  return p.image_url.startsWith("http") ? p.image_url : `${API_BASE}${p.image_url}`;
}

const imgFallback = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/600x450/EEE/31343C?text=Product+Image";
};

const isSoon = (p) => safeNum(p.quantity, 0) <= 0;

/* ══════════════════════════════════════════════════
   LAYOUT 1 — Cinematic single-product feature card
   ══════════════════════════════════════════════════ */
function FeatureSingle({ product, onGo }) {
  const soon = isSoon(product);
  return (
    <div className="featureSingle">
      <div className="featureSingle__imgPane">
        <img src={imgSrc(product)} alt={product.name} onError={imgFallback} />
        {soon && <div className="featureSingle__soon">Available Soon</div>}
      </div>
      <div className="featureSingle__info">
        <div className="featureSingle__label">Featured Product</div>
        <h2 className="featureSingle__name">{product.name}</h2>
        {product.description && (
          <p className="featureSingle__desc">
            {product.description.slice(0, 160)}{product.description.length > 160 ? "…" : ""}
          </p>
        )}
        <div className="featureSingle__price">
          <span>₹</span>{parseFloat(product.price || 0).toFixed(2)}
        </div>
        <button
          className={`featureSingle__btn${soon ? " featureSingle__btn--soon" : ""}`}
          disabled={soon}
          onClick={() => onGo(product)}
        >
          {soon ? "Coming Soon" : "View Details"}
          {!soon && <span className="featureSingle__arrow">→</span>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   LAYOUT 2–3 — Editorial grid
   ══════════════════════════════════════════════════ */
function FeatureGrid({ products, onGo }) {
  return (
    <div className={`featureGrid featureGrid--${products.length}`}>
      {products.map((p, i) => {
        const soon = isSoon(p);
        return (
          <div
            key={p.id}
            className={`featureCard${soon ? " featureCard--soon" : ""}`}
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => onGo(p)}
          >
            <div className="featureCard__img">
              <img src={imgSrc(p)} alt={p.name} onError={imgFallback} loading="lazy" />
              {soon && <div className="featureCard__soonBadge">Soon</div>}
            </div>
            <div className="featureCard__overlay">
              <div className="featureCard__name">{p.name}</div>
              <button
                className="featureCard__btn"
                disabled={soon}
                onClick={(e) => { e.stopPropagation(); onGo(p); }}
              >
                {soon ? "Coming Soon" : "View Details"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   LAYOUT 4+ — Scrolling carousel
   (reuses existing pCard / pImg / pBtn styles)
   ══════════════════════════════════════════════════ */
function Carousel({ products, onGo }) {
  const trackRef = useRef(null);
  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".carouselCard");
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  return (
    <div className="carouselWrap">
      <button className="carouselArrow carouselArrow--prev" onClick={() => scroll("prev")} aria-label="Previous" type="button">‹</button>
      <div className="carouselTrack" ref={trackRef}>
        {products.map((p) => {
          const soon = isSoon(p);
          return (
            <div
              key={p.id}
              className={`carouselCard pCard${soon ? " pCardSoon" : ""}`}
              onClick={() => onGo(p)}
            >
              {soon && <div className="pBadge">Available Soon</div>}
              <div className="pImgWrap">
                <img src={imgSrc(p)} alt={p.name} className="pImg" onError={imgFallback} loading="lazy" />
              </div>
              <div className="pBody">
                <div className="pName">{p.name}</div>
                <div className="pSub">{soon ? "Out of stock" : `In stock: ${safeNum(p.quantity)}`}</div>
                <button
                  type="button"
                  className={`pBtn${soon ? " pBtnDisabled" : ""}`}
                  disabled={soon}
                  onClick={(e) => { e.stopPropagation(); onGo(p); }}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="carouselArrow carouselArrow--next" onClick={() => scroll("next")} aria-label="Next" type="button">›</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════ */
const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [user, setUser]         = useState(null);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    try {
      const u = localStorage.getItem("userData");
      if (u) setUser(JSON.parse(u));
    } catch {
      localStorage.removeItem("userData");
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Temporary issue loading products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    const onStorage = (e) => { if (e.key === "productsUpdated") loadProducts(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", loadProducts);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", loadProducts);
    };
  }, [loadProducts]);

  const sorted = useMemo(() =>
    [...products].sort((a, b) => safeNum(a.priority, 9999) - safeNum(b.priority, 9999)),
  [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const goDetails = (p) => {
    if (isSoon(p)) return;
    if (!user) { alert("Please login to view details."); return; }
    navigate(`/products/${p.id}`);
  };

  const count = filtered.length;

  return (
    <section className="productsPage">

      {/* Header */}
      <div className="productsHeader">
        <h1 className="productsTitle">Our Products</h1>
        <div className="productsMeta">
          <span className="productsCount">{sorted.length} items</span>
        </div>
      </div>

      {/* Search — only shown for 4+ products */}
      {sorted.length >= 4 && (
        <div className="productsSearchWrap">
          <div className="productsSearchBox">
            <svg className="productsSearchIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="productsSearchInput"
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="productsSearchClear" onClick={() => setSearch("")}>×</button>
            )}
          </div>
        </div>
      )}

      {/* States */}
      {error   && <div className="productsError">⚠️ {error}</div>}
      {loading && <div className="productsLoading">Loading products…</div>}

      {!loading && !error && count === 0 && (
        <div className="productsEmpty">
          <div className="productsEmptyIcon">📦</div>
          <h3>{search ? `No results for "${search}"` : "No products available"}</h3>
          <p>Please check back later.</p>
        </div>
      )}

      {/* ── Adaptive layout ── */}
      {!loading && count === 1 && (
        <FeatureSingle product={filtered[0]} onGo={goDetails} />
      )}

      {!loading && count >= 2 && count <= 3 && (
        <FeatureGrid products={filtered} onGo={goDetails} />
      )}

      {!loading && count >= 4 && (
        <Carousel products={filtered} onGo={goDetails} />
      )}

    </section>
  );
};

export default Products;