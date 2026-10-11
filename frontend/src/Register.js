
import React, { useState } from "react";

function Register({ onRegistered, onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage("Registration successful! You can now log in.");
      setName("");
      setEmail("");
      setPassword("");

      if (onRegistered) {
        onRegistered();
      }
    } catch (error) {
      setMessage(
        "Cannot connect to the backend. Check whether Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.heading}>Create Account</h1>
        <p style={styles.subtitle}>
          Join the Smart Placement Platform
        </p>

        <label style={styles.label}>Full Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your name"
          required
          maxLength={100}
          style={styles.input}
        />

        <label style={styles.label}>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          required
          maxLength={150}
          style={styles.input}
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
          style={styles.input}
        />

        {message && (
          <p
            role="status"
            style={{
              color: message.startsWith("Registration successful")
                ? "green"
                : "#c62828",
            }}
          >
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p style={styles.footer}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onShowLogin}
            style={styles.link}
          >
            Login here
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

export default Register;
