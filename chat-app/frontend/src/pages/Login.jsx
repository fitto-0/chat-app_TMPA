import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", form);
      login(res.data.user, res.data.token);
      if (res.data.user.role === "admin") navigate("/admin");
      else if (res.data.user.role === "agent") navigate("/agent");
      else navigate("/chat");
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1>ChatSupport</h1>
          <p>Connectez-vous à votre espace de support</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="login-email">Adresse email</label>
            <input
              id="login-email"
              type="email"
              placeholder="votre@email.com"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="login-password">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: "0.5rem", padding: "0.85rem" }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Connexion...
              </>
            ) : (
              <>
                Se connecter
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

       
      </div>
    </div>
  );
}
