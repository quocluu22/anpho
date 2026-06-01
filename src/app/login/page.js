"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/admin" });
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#fdf9f0", fontFamily: "'Be Vietnam Pro', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "48px 40px", width: 380,
        boxShadow: "0 8px 40px rgba(6,27,14,0.1)", textAlign: "center",
        border: "1px solid rgba(6,27,14,0.06)",
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Georgia', serif", fontSize: 36, fontWeight: 700,
          fontStyle: "italic", color: "#815500", marginBottom: 8,
        }}>
          AN PHỞ
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 40, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Restaurant Management
        </div>

        {/* Sign in button */}
        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "14px 24px", borderRadius: 8,
          background: loading ? "#ccc" : "#061b0e",
          color: "#fff", border: "none", fontSize: 15, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "background 0.2s",
        }}>
          {loading ? "Redirecting..." : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.3 9 3.4l6.7-6.7C35.7 2.5 30.2 0 24 0 14.6 0 6.7 5.8 3 14.2l7.8 6C12.8 13.7 17.9 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.8-2.2 5.2-4.7 6.8l7.3 5.7c4.3-4 6.2-9.9 6.2-16.5z"/>
                <path fill="#FBBC05" d="M10.8 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6L2.4 13.4A24 24 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.3-6z"/>
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2.2 1.5-5 2.4-8.6 2.4-6.1 0-11.2-4.1-13.1-9.7l-8 6.2C6.6 42.2 14.6 48 24 48z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <p style={{ marginTop: 24, fontSize: 12, color: "#aaa" }}>
          Only authorized accounts can access this dashboard.
        </p>
      </div>
    </div>
  );
}
