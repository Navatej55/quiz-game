import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Background from "./Background";
import { API_BASE_URL } from "../config";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("userId", data.user.id);
        navigate("/");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Background />

      <div className="animate-fadeInUp" style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="animate-bounce-in" style={{
            fontSize: 56,
            marginBottom: 12,
            filter: "drop-shadow(0 0 20px rgba(167,139,250,0.6))"
          }}>
            🎮
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
            <span className="text-gradient">Quiz Battle</span>
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 15 }}>
            Sign in to continue your journey
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: "36px 40px" }}>
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 24,
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
            <span>🔐</span> Welcome Back
          </h2>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                id="login-username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                id="login-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: 8 }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Signing in...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "var(--primary-light)",
                fontWeight: 700,
                borderBottom: "1px solid rgba(168,85,247,0.4)",
                paddingBottom: 1,
                transition: "var(--transition)"
              }}
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Footer hint */}
        <p style={{
          textAlign: "center",
          marginTop: 24,
          fontSize: 12,
          color: "var(--text-muted)"
        }}>
          Challenge friends • Compete live • Rise to the top 🏆
        </p>
      </div>
    </div>
  );
};

export default Login;
