import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", form);
      login(res.data.user, res.data.token);
      if (res.data.user.role === "agent") {
        navigate("/agent");
      } else {
        navigate("/chat");
      }
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Se connecter
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Pas de compte?{" "}
          <Link to="/register" className="text-blue-500">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
