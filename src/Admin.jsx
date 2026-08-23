import React, { useState } from "react";
import { Lock, Mail, LogIn } from "lucide-react";
import { supabase } from "./supabase";

export default function Admin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      onLogin(data.user);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-logo">
          <Lock size={26} />
        </div>

        <p className="admin-label">PRIVATE AREA</p>
        <h1>Admin Login</h1>
        <p className="admin-subtitle">
          Sign in to manage your resume website.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <div className="admin-input">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="admin-input">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="admin-error">{error}</div>}

          <button className="admin-login-btn" disabled={loading}>
            <LogIn size={18} />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <a className="back-home" href="/">
          ← Back to website
        </a>
      </div>
    </div>
  );
}
