import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/PremiumAuth.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    setError("");
    setMsg("");
  }

  function passwordStrength() {
    if (form.password.length === 0) return "";
    if (form.password.length < 6) return "Weak";
    if (form.password.match(/[A-Z]/) && form.password.match(/[0-9]/)) {
      return "Strong";
    }
    return "Medium";
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (
      !form.full_name ||
      !form.username ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirm_password
    ) {
      setError("Please fill all fields");
      return;
    }

    if (form.phone.length < 10) {
      setError("Please enter valid phone number");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be minimum 6 characters");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (!form.terms) {
      setError("Please accept terms and privacy policy");
      return;
    }

    setLoading(true);

    try {
      await API.post("accounts/register/", {
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      setMsg("Registration successful. Please login now.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-auth-page">
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="premium-auth-wrapper">
        <div className="premium-auth-left">
          <span className="auth-badge">REAL AI AGENT</span>

          <h1>
            Create Your <span>Smart AI Workspace</span>
          </h1>

          <p>
            Register and access ChatGPT/Gemini-style AI chat, file AI, image
            generation, code generator, memory, history, and dashboard.
          </p>

          <div className="auth-feature-list">
            <div>💬 AI Chat Assistant</div>
            <div>📎 File & Image AI</div>
            <div>💻 Code Generator</div>
            <div>🔐 JWT Secure Login</div>
          </div>
        </div>

        <div className="premium-auth-card">
          <div className="auth-icon">🚀</div>

          <h2>Create Account</h2>
          <p>Start using your Smart AI Agent</p>

          {error && <div className="premium-error">{error}</div>}
          {msg && <div className="premium-success">{msg}</div>}

          <form onSubmit={handleRegister}>
            <div className="input-row">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter full name"
                  value={form.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

              <div className="input-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Password</label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {form.password && (
                  <small
                    className={
                      passwordStrength() === "Strong"
                        ? "strength strong"
                        : passwordStrength() === "Medium"
                        ? "strength medium"
                        : "strength weak"
                    }
                  >
                    Password Strength: {passwordStrength()}
                  </small>
                )}
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <label className="terms-box">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
              />
              I agree to Smart AI Agent terms and privacy policy
            </label>

            <button type="submit" className="premium-auth-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="premium-small-text">
            Already have account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;