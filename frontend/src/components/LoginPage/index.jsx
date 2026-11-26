import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import "./index.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (Cookies.get("token")) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      };

      const url = `${import.meta.env.VITE_API_URL}auth/login`;
      const response = await fetch(url, requestOptions);
      const data = await response.json();
      if (data.ok) {
        Cookies.set("token", data.token, { expires: 7 });
        return navigate("/", { replace: true });
      } else {
        alert(data.message || data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Unable to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <div className="auth-hero">
          <span className="auth-pill">QuizFlow · Smart Classroom Portal</span>
          <h1 className="auth-headline">
            Smarter Assessments for <span className="auth-accent">Teachers &amp; Students</span>
          </h1>
          <p className="auth-subtext">
            Teachers generate topic-focused quizzes with Gemini AI and monitor every student
            submission in real time. Students take timed tests and review clear explanations
            instantly after submitting.
          </p>

          <div className="auth-highlights">
            <div className="auth-highlight-item">
              <strong>For Teachers</strong>
              <span>Generate quizzes by topic &amp; inspect student attempt scores</span>
            </div>
            <div className="auth-highlight-item">
              <strong>For Students</strong>
              <span>Attempt timed quizzes &amp; review detailed answer explanations</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <h2 className="auth-card-title">Sign in to your account</h2>
          <p className="auth-card-subtitle">
            Continue to your teacher or student dashboard.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email address</label>
              <input
                type="email"
                placeholder="name@college.edu"
                className="auth-input"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="auth-input"
                autoComplete="current-password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button className="auth-submit-btn" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer">
            New to QuizFlow?
            <Link to="/signup" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
