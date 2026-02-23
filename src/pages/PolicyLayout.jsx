import React from "react";

export default function PolicyLayout({ title, updated, children }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ marginBottom: 6 }}>{title}</h1>
      <p style={{ marginTop: 0, opacity: 0.75 }}>Last updated: {updated}</p>
      <div style={{ lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}