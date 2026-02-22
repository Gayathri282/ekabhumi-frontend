import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

export default function ReviewLogin() {
  const [email, setEmail] = useState("razorpaytest@ekabhumi.com");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/auth/reviewer-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.detail || "Login failed");
      return;
    }

    // ✅ store in keys your app already uses
    localStorage.setItem("access_token", data.access_token);

    // ✅ store userData so ProtectedRoute can read role
    localStorage.setItem(
      "userData",
      JSON.stringify({ email: data.email, role: data.role })
    );

    nav("/products"); // or wherever your products page is
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Reviewer Login</h2>
      <form onSubmit={submit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <button style={{ width: "100%", padding: 10 }} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}