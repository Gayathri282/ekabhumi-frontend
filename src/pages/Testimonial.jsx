import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Testimonial.css";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { googleLogin, hasSession } from "../api/authAPI";

const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const STATIC_TESTIMONIALS = [
  { id: "s1", user_name: "Priya Sharma",  role: "Using for 6 months",    text: "After struggling with hair fall for years, Redensyl has been a game-changer.", rating: 5, image: "testimonial1.jpg" },
  { id: "s2", user_name: "Rahul Mehta",   role: "Customer for 1 year",   text: "Natural ingredients and visible results within weeks. Highly recommended!", rating: 5, image: "testimonial2.jpg" },
  { id: "s3", user_name: "Anjali Patel",  role: "Professional Stylist",  text: "I recommend Eka Bhumi products to all my clients.", rating: 4, image: "testimonial3.jpg" },
  { id: "s4", user_name: "Sanjay Kumar",  role: "Using for 8 months",    text: "Finally found a solution for my dandruff problem.", rating: 5, image: "testimonial4.jpg" },
  { id: "s5", user_name: "Meera Nair",    role: "Customer for 2 years",  text: "From hair loss to healthy growth — incredible transformation.", rating: 5, image: "testimonial5.jpg" },
  { id: "s6", user_name: "Vikram Singh",  role: "First-time user",       text: "Impressed with the results in just 3 months.", rating: 4, image: "testimonial6.jpg" },
];

function StarRow({ rating, interactive = false, onRate = (_n) => {} }) {
  return (
    <div className="t-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          fill={n <= rating ? "#f5a623" : "none"}
          stroke={n <= rating ? "#f5a623" : "#ccc"}
          style={interactive ? { cursor: "pointer" } : {}}
          onClick={() => interactive && onRate?.(n)}
        />
      ))}
    </div>
  );
}

const Testimonial = () => {
  const trackRef     = useRef(null);
  const googleBtnRef = useRef(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [apiReviews, setApiReviews] = useState([]);

  // ── auth ────────────────────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn]     = useState(() => hasSession());
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError]     = useState("");

  // ── modal ───────────────────────────────────────────────────────────────────
  const [showModal, setShowModal]         = useState(false);
  const [rating, setRating]               = useState(5);
  const [reviewText, setReviewText]       = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg]         = useState("");

  // ── use a ref for isLoggedIn so handleCredential always has latest value ────
  const isLoggedInRef = useRef(isLoggedIn);
  useEffect(() => { isLoggedInRef.current = isLoggedIn; }, [isLoggedIn]);

  const allTestimonials = useMemo(() => {
    const dynamic = apiReviews.map((r) => ({
      id: `api_${r.id}`,
      user_name: r.user_name,
      role: r.product_name ? `Bought: ${r.product_name}` : "Verified Buyer",
      text: r.text,
      rating: r.rating,
      image: null,
    }));
    return [...dynamic, ...STATIC_TESTIMONIALS];
  }, [apiReviews]);

  // ── fetch approved reviews ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/reviews`)
      .then((r) => r.json())
      .catch(() => [])
      .then((data) => setApiReviews(Array.isArray(data) ? data : []));
  }, []);

  // ── carousel ────────────────────────────────────────────────────────────────
  const updateButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons, allTestimonials]);

  const scrollByOneCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".testimonial-card");
    const gap = 16;
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  // ── Google credential handler (uses ref — no stale closure) ────────────────
  const handleCredential = useCallback(async (googleIdToken) => {
    setLoginLoading(true);
    setLoginError("");
    try {
      await googleLogin(googleIdToken);
      setIsLoggedIn(true);
      isLoggedInRef.current = true;
      window.google?.accounts?.id?.cancel();
      // Modal is already open — just re-render to show review form
    } catch (e) {
      setLoginError(e?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }, []);

  // ── init Google once ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = () => {
      if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp) => handleCredential(resp.credential),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };

    if (window.google?.accounts?.id) { init(); return; }
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true; s.defer = true;
      s.onload = init;
      document.head.appendChild(s);
    } else {
      existing.addEventListener("load", init);
    }
  }, [handleCredential]);

  // ── render Google button whenever modal is open and user not logged in ──────
  useEffect(() => {
    if (!showModal || isLoggedIn) return;
    if (!googleBtnRef.current || !window.google?.accounts?.id) return;
    const t = setTimeout(() => {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline", size: "large", text: "signin_with", width: 240,
      });
    }, 80);
    return () => clearTimeout(t);
  }, [showModal, isLoggedIn]);

  // ── poll for login in case storage event doesn't fire ──────────────────────
  useEffect(() => {
    if (!showModal || isLoggedIn) return;
    const interval = setInterval(() => {
      if (hasSession()) {
        setIsLoggedIn(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [showModal, isLoggedIn]);

  const openReviewModal = () => {
    setSubmitMsg("");
    setLoginError("");
    setRating(5);
    setReviewText("");
    setShowModal(true);

    // Trigger One Tap if not logged in
    if (!hasSession()) {
      setTimeout(() => {
        window.google?.accounts?.id?.prompt((n) => {
          // fallback to button in modal if One Tap not shown
        });
      }, 300);
    }
  };

  const closeModal = () => setShowModal(false);

  const submitReview = async () => {
    if (!reviewText.trim()) { setSubmitMsg("Please write something."); return; }
    if (submitLoading) return;

    setSubmitLoading(true);
    setSubmitMsg("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, text: reviewText.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitMsg(data.detail || "Submission failed.");
        return;
      }

      setSubmitMsg("✅ Review submitted! It will appear after admin approval.");
      setReviewText("");
      setRating(5);
    } catch {
      setSubmitMsg("Network error. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAvatarError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/120x120/EEE/31343C?text=User";
  };

  return (
    <section className="testimonial-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real stories from real people</p>
        </div>

        <div className="testimonial-shell">
          <button
            className="testimonial-arrow prev"
            onClick={() => scrollByOneCard("prev")}
            disabled={!canPrev}
            type="button"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="testimonial-track" ref={trackRef}>
            {allTestimonials.map((t) => (
              <article className="testimonial-card" key={t.id}>
                <div className="testimonial-content">
                  <StarRow rating={t.rating} />
                  <div className="quote-icon">"</div>
                  <p className="testimonial-text">{t.text}</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-image">
                    {t.image ? (
                      <img
                        src={`${process.env.PUBLIC_URL}/images/${t.image}`}
                        alt={t.user_name}
                        onError={handleAvatarError}
                        loading="lazy"
                      />
                    ) : (
                      <div className="author-avatar-placeholder">
                        {(t.user_name?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <h4 className="author-name">{t.user_name}</h4>
                    <p className="author-role">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            className="testimonial-arrow next"
            onClick={() => scrollByOneCard("next")}
            disabled={!canNext}
            type="button"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="testimonial-cta">
          <button className="write-review-btn" onClick={openReviewModal} type="button">
            ✍️ Write a Review
          </button>
        </div>
      </div>

      {/* ── Review modal ── */}
      {showModal && (
        <div className="review-overlay" onMouseDown={closeModal}>
          <div className="review-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="review-close" onClick={closeModal} aria-label="Close">
              <X size={18} />
            </button>

            <h3 className="review-modal-title">Share Your Experience</h3>

            {!isLoggedIn ? (
              /* ── Login gate ── */
              <div className="review-login-gate">
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "#fff3ec", margin: "0 auto 16px",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 26,
                }}>
                  ✍️
                </div>
                <p className="review-login-hint">
                  Sign in with Google to leave a review.
                  <br />
                  <span className="review-login-sub">Only verified buyers can submit reviews.</span>
                </p>
                {loginLoading && <p className="review-login-loading">Signing you in…</p>}
                {loginError  && <p className="review-login-error">{loginError}</p>}
                {/* Google Sign In button renders here */}
                <div ref={googleBtnRef} style={{ marginTop: 16, display: "flex", justifyContent: "center" }} />
              </div>
            ) : (
              /* ── Review form ── */
              <>
                <div className="review-field">
                  <label className="review-label">Your Rating</label>
                  <StarRow rating={rating} interactive onRate={setRating} />
                </div>

                <div className="review-field">
                  <label className="review-label">Your Review</label>
                  <textarea
                    className="review-textarea"
                    rows={4}
                    placeholder="Tell us about your experience…"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    maxLength={1000}
                  />
                  <div className="review-char">{reviewText.length}/1000</div>
                </div>

                {submitMsg && (
                  <p className={`review-msg ${submitMsg.startsWith("✅") ? "review-msg--ok" : "review-msg--err"}`}>
                    {submitMsg}
                  </p>
                )}

                <div className="review-actions">
                  <button className="review-btn review-btn--outline" onClick={closeModal}>Cancel</button>
                  <button className="review-btn review-btn--primary" onClick={submitReview} disabled={submitLoading}>
                    {submitLoading ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonial;