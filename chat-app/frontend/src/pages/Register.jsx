import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ nom: "", email: "", password: "", role: "client" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError("Erreur lors de la création du compte");
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1>Créer un compte</h1>
          <p>Rejoignez ChatSupport en quelques secondes</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="reg-nom">Nom complet</label>
            <input
              id="reg-nom"
              type="text"
              placeholder="Votre nom"
              className="input-field"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="reg-email">Adresse email</label>
            <input
              id="reg-email"
              type="email"
              placeholder="votre@email.com"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="reg-password">Mot de passe</label>
            <input
              id="reg-password"
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
                Création...
              </>
            ) : (
              <>
                S'inscrire
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="auth-link">
          Déjà un compte ?{" "}
          <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}