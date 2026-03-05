import { useEffect, useMemo, useState } from "react";
import styles from "./Dashboard.module.css";

export default function UpdateProduct({ product, onCancel, onSubmit, setError }) {
  const initial = useMemo(() => ({
    id: product?.id,
    name: product?.name || "",
    price: String(product?.price ?? ""),
    description: product?.description || "",
    priority: String(product?.priority ?? "2"),
    quantity: String(product?.quantity ?? "0"),
    image_url: product?.image_url || "",
  }), [product]);

  const [form, setForm]           = useState(initial);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(product?.image_url || "");
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    setForm(initial);
    setImageFile(null);
    setPreview(product?.image_url || "");
  }, [initial, product]);

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const isFeatured = String(form.priority) === "1";
  const toggleFeatured = () =>
    setForm((p) => ({ ...p, priority: isFeatured ? "2" : "1" }));

  const validate = () => {
    if (!form.name.trim())                                 return "Name is required";
    if (!form.price || isNaN(Number(form.price)))          return "Valid price is required";
    if (!form.description.trim())                          return "Description is required";
    if (form.quantity === "" || isNaN(Number(form.quantity))) return "Valid quantity is required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const msg = validate();
    if (msg) return setError(msg);
    setSaving(true);
    try {
      await onSubmit({
        id: form.id,
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        priority: Number(form.priority),
        quantity: Number(form.quantity),
        imageFile: imageFile || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.updateWrap}>
      <div className={styles.updateGrid}>

        {/* Preview */}
        <div className={styles.updatePreviewCard}>
          <div className={styles.updatePreviewTitle}>Preview</div>
          <div className={styles.updatePreviewImage}>
            {preview
              ? <img src={preview} alt="Preview" />
              : <div className={styles.noImage}>No Image</div>
            }
          </div>
          <label className={styles.fileBtn}>
            Change Image
            <input type="file" accept="image/*" onChange={onPickImage} />
          </label>
          <div className={styles.previewMeta}>
            <div className={styles.previewName}>{form.name || "Product name"}</div>
            <div className={styles.previewSub}>Qty: {Number(form.quantity || 0)}</div>
          </div>
        </div>

        {/* Form */}
        <form className={styles.updateFormCard} onSubmit={submit}>
          <div className={styles.formTitle}>Update Product</div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Name</label>
              <input value={form.name} onChange={onChange("name")} placeholder="Product name" />
            </div>
            <div className={styles.field}>
              <label>Price</label>
              <input value={form.price} onChange={onChange("price")} placeholder="e.g. 199" />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Quantity</label>
              <input value={form.quantity} onChange={onChange("quantity")} placeholder="e.g. 0" />
              <small>Quantity ≤ 0 will show "Available Soon" on Home.</small>
            </div>

            {/* Priority toggle */}
            <div className={styles.field}>
              <label>Featured Product</label>
              <div
                className={styles.toggleRow}
                onClick={toggleFeatured}
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}
              >
                <div style={{
                  width: 44, height: 24, borderRadius: 12, padding: 2,
                  background: isFeatured ? "#F26722" : "#ddd",
                  transition: "background 0.2s", display: "flex",
                  alignItems: "center",
                  justifyContent: isFeatured ? "flex-end" : "flex-start",
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <span style={{ fontSize: 13, color: isFeatured ? "#F26722" : "#888", fontWeight: 600 }}>
                  {isFeatured ? "Yes — shown first (priority 1)" : "No — normal priority"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={onChange("description")}
              rows={6}
              placeholder="Write product description..."
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}