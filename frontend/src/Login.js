
import React, { useState } from "react";

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      if (!data.token) {
        setMessage("Login response did not contain a token.");
        return;
      }

      onLogin(data);
    } catch (error) {
      setMessage(
        "Cannot connect to the backend. Check whether Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h1 style={styles.heading}>Welcome Back</h1>
        <p style={styles.subtitle}>
          Sign in to your Smart Placement Platform
        </p>

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          required
          style={styles.input}
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          style={styles.input}
        />

        {message && <p style={styles.error}>{message}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onShowRegister}
            style={styles.link}
          >
            Register here
          </button>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 16px",
    background: "#f3f6fb",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    padding: "32px",
    background: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
  },
  heading: {
    textAlign: "center",
    color: "#183b70",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#667085",
    marginBottom: "28px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "18px",
    border: "1px solid #ccd3df",
    borderRadius: "7px",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "#2457c5",
    color: "white",
    border: "none",
    borderRadius: "7px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "#c62828",
    fontSize: "14px",
  },
  footer: {
    textAlign: "center",
    marginTop: "22px",
    fontSize: "14px",
  },
  link: {
    background: "none",
    border: "none",
    color: "#2457c5",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default Login;
