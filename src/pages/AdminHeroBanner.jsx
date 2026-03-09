// AdminHeroBanner.jsx
import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

function AdminHeroBanner({ setError }) {
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile,  setMobileFile]  = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview,  setMobilePreview]  = useState(null);
  const [currentDesktop, setCurrentDesktop] = useState(null);
  const [currentMobile,  setCurrentMobile]  = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/hero-banner`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (data.desktop_image) setCurrentDesktop(
          data.desktop_image.startsWith("http") ? data.desktop_image : `${API_BASE}${data.desktop_image}`
        );
        if (data.mobile_image) setCurrentMobile(
          data.mobile_image.startsWith("http") ? data.mobile_image : `${API_BASE}${data.mobile_image}`
        );
      })
      .catch(() => {});
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "desktop") { setDesktopFile(file); setDesktopPreview(url); }
    else                    { setMobileFile(file);  setMobilePreview(url); }
  };

  const handleSave = async () => {
    if (!desktopFile && !mobileFile) {
      setError("Please select at least one image to update.");
      return;
    }
    setSaving(true);
    try {
      const token    = localStorage.getItem("accessToken");
      const formData = new FormData();
      if (desktopFile) formData.append("desktop_image", desktopFile);
      if (mobileFile)  formData.append("mobile_image",  mobileFile);

      const res = await fetch(`${API_BASE}/admin/hero-banner`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();

      if (data.desktop_image) setCurrentDesktop(`${API_BASE}${data.desktop_image}`);
      if (data.mobile_image)  setCurrentMobile(`${API_BASE}${data.mobile_image}`);
      setDesktopFile(null); setDesktopPreview(null);
      setMobileFile(null);  setMobilePreview(null);
      setSuccess("Hero banner updated! Changes are live.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e?.message || "Failed to update hero banner");
    } finally {
      setSaving(false);
    }
  };

  const ImageSlot = ({ label, current, preview, inputId, type }) => (
    <div style={{ flex: 1, minWidth: 240 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: "#333" }}>{label}</div>
      <div style={{
        width: "100%", aspectRatio: type === "desktop" ? "16/5" : "9/16",
        maxHeight: type === "desktop" ? 160 : 280,
        background: "#f5f0ea", borderRadius: 12, overflow: "hidden",
        border: "2px dashed #e0d5c8", display: "flex",
        alignItems: "center", justifyContent: "center", marginBottom: 10,
      }}>
        {(preview || current)
          ? <img src={preview || current} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ color: "#bbb", fontSize: 13 }}>No image set</span>
        }
      </div>
      <label htmlFor={inputId} style={{
        display: "inline-block", padding: "8px 18px", background: "#F26722",
        color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
      }}>
        {preview ? "✓ Change" : "Upload Image"}
      </label>
      <input id={inputId} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => handleFileChange(e, type)} />
      {preview && <span style={{ marginLeft: 10, fontSize: 12, color: "#888" }}>New image selected</span>}
    </div>
  );

  return (
    <div>
      <h3 style={{ marginBottom: 20, color: "#1a1a1a" }}>Hero Banner</h3>
      {success && (
        <div style={{ background: "#e8f5e9", color: "#2e7d32", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
          ✅ {success}
        </div>
      )}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
        <ImageSlot label="🖥️ Desktop Banner" current={currentDesktop} preview={desktopPreview} inputId="desktop-upload" type="desktop" />
        <ImageSlot label="📱 Mobile Banner"  current={currentMobile}  preview={mobilePreview}  inputId="mobile-upload"  type="mobile" />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || (!desktopFile && !mobileFile)}
        style={{
          background: saving ? "#ccc" : "#F26722", color: "#fff",
          border: "none", borderRadius: 10, padding: "12px 32px",
          fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Saving…" : "Save Banner"}
      </button>
    </div>
  );
}

export default AdminHeroBanner;