import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import About from "./About";
import Footer from "./Footer";
import { fetchProducts } from "../api/publicAPI";

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  // ✅ CACHE-FIRST PRODUCTS
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem("cachedProducts");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(products.length === 0);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  const trackRef = useRef(null);
  const navigate = useNavigate();

  // ✅ SORTED PRODUCTS (Priority 1 First)
  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return [...products].sort((a, b) => {
      const pA = Number(a.priority);
      const pB = Number(b.priority);
      if (pA === 1 && pB !== 1) return -1;
      if (pB === 1 && pA !== 1) return 1;
      return 0;
    });
  }, [products]);

  const closeMenu = () => setMenuOpen(false);

  // Resize listener
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll on mobile menu
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // ✅ BACKGROUND DATA FETCH (keeps cached UI)
  const loadData = useCallback(async () => {
    try {
      const data = await fetchProducts();
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      localStorage.setItem("cachedProducts", JSON.stringify(list));
      setError("");
    } catch (err) {
      console.error("Failed to load products", err);
      if (products.length === 0) setError("Temporary issue loading products.");
    } finally {
      setLoading(false);
    }
  }, [products.length]);

  useEffect(() => {
    loadData();

    const syncProducts = (e) => {
      if (e.key === "productsUpdated") loadData();
    };
    window.addEventListener("storage", syncProducts);

    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", syncProducts);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadData]);

  // Navbar scroll style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/400x300/EEE/31343C?text=Product+Image";
  };

  const handleLogoError = (e) => {
    e.target.onerror = null;
    e.target.src = "/images/logo-placeholder.png";
  };

  // ✅ Shop Now always navigates (no login required)
  const goToPriorityOneProduct = () => {
    if (!products?.length) {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const priorityOne = products.find((p) => Number(p.priority) === 1);
    const top = priorityOne || sortedProducts[0];

    if (!top?.id) {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate(`/products/${top.id}`);
  };

  const scrollCarousel = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const card = el.querySelector(".product-card");
    const gap = 16;
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.85;

    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  const MobileRightButton = () => (
    <button
      className="hamburger mobile-only"
      type="button"
      onClick={() => setMenuOpen((v) => !v)}
      aria-label="Menu"
      aria-expanded={menuOpen}
    >
      <span />
      <span />
      <span />
    </button>
  );

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          {!scrolled ? (
            <img
              src="/images/logo.png"
              alt="Eka Bhumi"
              className="logo-img"
              onError={handleLogoError}
            />
          ) : (
            <span className="text-logo">EKABHUMI</span>
          )}
        </div>

        <div className="nav-links desktop-only">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
      
        </div>

        {/* ✅ No auth section at all */}
        {isMobile && <MobileRightButton />}
      </nav>

      {/* ✅ Mobile menu no longer depends on user */}
      {menuOpen && (
        <div className="mobileMenuOverlay" onMouseDown={closeMenu}>
          <div className="mobileMenuPanel" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mobileMenuHeader">
              <button type="button" className="mobileMenuBack" onClick={closeMenu} aria-label="Back">
                ←
              </button>
              <div className="mobileMenuTitle">Menu</div>
              <div className="mobileMenuSpacer" />
            </div>

            <div className="mobileMenuSection">
              <a className="mobileMenuItem" href="#home" onClick={closeMenu}>
                Home
              </a>
              <a className="mobileMenuItem" href="#products" onClick={closeMenu}>
                Products
              </a>
              <a className="mobileMenuItem" href="#about" onClick={closeMenu}>
                About
              </a>
              
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section id="home" className="hero" style={{ backgroundImage: "url(/images/hero-mobile.png)" }}>
        <div className="hero-cta desktop-only">
          <button className="primary-btn" onClick={goToPriorityOneProduct}>
            Shop Now
          </button>
        </div>

        <div className="hero-mobile-wrap">
          <img className="hero-mobile-img" src="/images/hero-mobile.png" alt="Eka Bhumi" loading="lazy" />
          <div className="hero-cta mobile-cta">
            <button className="primary-btn" onClick={goToPriorityOneProduct}>
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="product-preview">
        {error && <div className="error-message">⚠️ {error}</div>}
        {loading && <p className="loading-text">Loading products...</p>}

        {!loading && sortedProducts.length === 0 && !error && (
          <p style={{ textAlign: "center", color: "#666" }}>No products available</p>
        )}

        {!loading && sortedProducts.length > 0 && (
          <div className="carousel-container">
            <button
              className="carousel-arrow prev"
              onClick={() => scrollCarousel("prev")}
              type="button"
              aria-label="Previous"
            >
              ‹
            </button>

            <div className="carousel-track" ref={trackRef}>
              {sortedProducts.map((p) => {
                const qty = Number(p.quantity ?? 0);
                const availableSoon = qty <= 0;

                const onView = () => {
                  if (availableSoon) return;
                  navigate(`/products/${p.id}`);
                };

                return (
                  <div className="product-card" key={p.id}>
                    {availableSoon && <div className="available-soon-badge">Available Soon</div>}

                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="product-image"
                      onError={handleImageError}
                      loading="lazy"
                    />

                    <div className="product-info">
                      <span className="product-name">{p.name}</span>

                      <button
                        className={`view-details-btn ${availableSoon ? "isDisabled" : ""}`}
                        onClick={onView}
                        type="button"
                        disabled={availableSoon}
                        title={availableSoon ? "Available soon" : "View details"}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="carousel-arrow next"
              onClick={() => scrollCarousel("next")}
              type="button"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        )}
      </section>

      <section id="about" className="pageSection">
        <About />
      </section>

      <Footer />
    </>
  );
};

export default Home;