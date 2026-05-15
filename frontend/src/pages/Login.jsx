import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import API from "../api";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setError("");
    setSuccess("");

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!form.login || !form.password) {
      setError("Please enter login and password");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("accounts/login/", {
        login: form.login,
        password: form.password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/chat");
      window.location.reload();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || "Invalid login details");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    setLoading(true);
    setError("");

    try {
      const res = await API.post("accounts/google-login/", {
        credential: credentialResponse.credential,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/chat");
      window.location.reload();
    } catch (err) {
      console.log(err);
      setError("Google login failed. Check Google Client ID origin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      setError("Please enter your registered email");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("accounts/forgot-password/", {
        email: forgotEmail,
      });

      setSuccess(res.data.message || "Password reset request submitted.");
      setForgotEmail("");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || "Forgot password failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <section className="login-shell">
        <div className="login-left">
          <span className="login-badge">REAL AI AGENT</span>

          <h1>
            Welcome to <span>Smart AI Workspace</span>
          </h1>

          <p>
            Login and continue your ChatGPT/Gemini-style AI assistant with chat,
            files, code generation, image generation, history, memory, and tools.
          </p>

          <div className="login-feature-grid">
            <div>💬 AI Chat</div>
            <div>📎 File AI</div>
            <div>🖼 Image AI</div>
            <div>💻 Code Expert</div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-top">
            <div className="login-logo">🤖</div>

            <h1>{forgotMode ? "Reset Password" : "Welcome Back"}</h1>

            <p>
              {forgotMode
                ? "Enter your email to request password reset"
                : "Login with username, email, phone, or Google"}
            </p>
          </div>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          {!forgotMode ? (
            <>
              <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                  <label>Username / Email / Phone</label>

                  <input
                    type="text"
                    name="login"
                    placeholder="Enter username, email, or phone"
                    value={form.login}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Signing In..." : "Login"}
                </button>
              </form>

              <div className="divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <div className="google-login-box">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError("Google login failed")}
                  text="signin_with"
                  theme="outline"
                  size="large"
                  width="320"
                />
              </div>

              <div className="login-bottom">
                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => {
                    setForgotMode(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Forgot Password?
                </button>

                <p>Don't have an account?</p>
                <Link to="/register">Create Account</Link>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleForgotPassword} className="login-form">
                <div className="input-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    name="forgotEmail"
                    placeholder="Enter registered email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    required
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Request"}
                </button>
              </form>

              <div className="login-bottom">
                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => {
                    setForgotMode(false);
                    setError("");
                    setSuccess("");
                  }}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Login;