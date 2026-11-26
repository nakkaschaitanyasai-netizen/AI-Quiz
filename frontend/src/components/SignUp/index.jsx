import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import "./index.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.ok) {
        alert("Account created successfully! Please sign in.");
        navigate("/login");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Unable to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-shell">
      <div className="signup-card">
        <span className="signup-pill">QuizFlow Registration</span>
        <h1 className="signup-title">Create your account</h1>
        <p className="signup-subtitle">
          Choose your role to get the right workspace for creating or taking quizzes.
        </p>

        <div className="role-selector">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, role: "student" }))}
            className={`role-option ${formData.role === "student" ? "role-active" : ""}`}
          >
            <PersonIcon fontSize="small" />
            <div>
              <strong>Student</strong>
              <span>Attempt quizzes &amp; view results</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, role: "teacher" }))}
            className={`role-option ${formData.role === "teacher" ? "role-active" : ""}`}
          >
            <SchoolIcon fontSize="small" />
            <div>
              <strong>Teacher</strong>
              <span>Generate quizzes &amp; track attempts</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="signup-input"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="signup-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="name@college.edu"
              className="signup-input"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="signup-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="signup-input"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="signup-submit-btn" disabled={submitting}>
            {submitting
              ? "Creating account..."
              : `Create ${formData.role === "teacher" ? "Teacher" : "Student"} Account`}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?
          <Link to="/login" className="signup-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
