import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import QuizCard from "../QuizCard";
import QuizPreview from "../QuizPreview";
import "./index.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [draftQuiz, setDraftQuiz] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookie.get("token")}`,
      };

      const [meRes, quizRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/quizzes`, { headers }),
      ]);

      const meData = await meRes.json();
      const quizData = await quizRes.json();

      if (!meData.ok) {
        Cookie.remove("token");
        navigate("/login", { replace: true });
        return;
      }

      setUser(meData.user);
      if (quizData.ok) {
        setQuizzes(quizData.Quizzes || []);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Step 1: Generate draft questions for teacher review (not published yet)
  const generateQuizFunction = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Please enter a topic first");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quizzes/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookie.get("token")}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            difficulty,
            count: Number(count),
          }),
        }
      );
      const data = await response.json();

      if (data.ok) {
        setDraftQuiz(data.draft);
        setTopic("");
      } else {
        alert(data.message || "Quiz generation failed");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Something went wrong while generating the quiz");
    } finally {
      setGenerating(false);
    }
  };

  // Step 2: Publish only teacher-selected questions to students
  const publishQuizFunction = async (approvedQuiz) => {
    setPublishing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quizzes/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookie.get("token")}`,
          },
          body: JSON.stringify(approvedQuiz),
        }
      );
      const data = await response.json();

      if (data.ok) {
        setQuizzes((prev) => [data.quiz, ...prev]);
        setDraftQuiz(null);
      } else {
        alert(data.message || "Failed to publish quiz");
      }
    } catch (error) {
      console.error("Publish error:", error);
      alert("Something went wrong while publishing");
    } finally {
      setPublishing(false);
    }
  };

  const deletedFunction = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookie.get("token")}`,
        },
      });
      const data = await response.json();

      if (data.ok) {
        setQuizzes((prev) => prev.filter((quiz) => quiz._id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const logOutFunction = () => {
    Cookie.remove("token");
    navigate("/login", { replace: true });
  };

  if (loading || generating) {
    return (
      <div className="app-loader-screen">
        <div className="app-loader-card">
          <div className="spinner-ring" />
          <p className="loader-label">
            {generating
              ? "Generating draft questions with Gemini AI..."
              : "Loading your workspace..."}
          </p>
        </div>
      </div>
    );
  }

  const isTeacher = user?.role === "teacher";

  return (
    <div className="home-shell">
      <header className="top-nav">
        <div className="top-nav-inner">
          <div className="brand-block">
            <span className="brand-name">QuizFlow</span>
            <span className={`role-chip ${isTeacher ? "role-teacher" : "role-student"}`}>
              {isTeacher ? <SchoolIcon sx={{ fontSize: 15 }} /> : <PersonIcon sx={{ fontSize: 15 }} />}
              {isTeacher ? "Teacher View" : "Student View"}
            </span>
          </div>

          <div className="nav-actions">
            <span className="welcome-user">Hi, {user?.username}</span>
            {!isTeacher && (
              <button className="nav-btn-secondary" onClick={() => navigate("/history")}>
                <HistoryIcon sx={{ fontSize: 17 }} /> My Results
              </button>
            )}
            <button className="nav-btn-outline" onClick={logOutFunction}>
              <LogoutIcon sx={{ fontSize: 17 }} /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        {isTeacher ? (
          <>
            <section className="hero-banner">
              <span className="hero-eyebrow">Instructor Dashboard</span>
              <h1 className="hero-title">
                Create Smart Assessments &amp; <span className="hero-highlight">Track Every Attempt</span>
              </h1>
              <p className="hero-subtitle">
                Enter a topic below to generate draft questions with Gemini AI. Review the right
                answers, remove any unwanted questions, and publish only what you approve.
              </p>
            </section>

            <form className="generator-panel" onSubmit={generateQuizFunction}>
              <input
                type="text"
                placeholder="Enter topic (e.g. DBMS Normalization, React Hooks, OS Deadlocks)"
                className="gen-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <select
                className="gen-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                className="gen-select"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              >
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>

              <button type="submit" className="gen-submit-btn">
                <AutoAwesomeIcon sx={{ fontSize: 18 }} /> Generate Draft
              </button>
            </form>

            {draftQuiz && (
              <QuizPreview
                draft={draftQuiz}
                publishing={publishing}
                onPublish={publishQuizFunction}
                onCancel={() => setDraftQuiz(null)}
              />
            )}
          </>
        ) : (
          <section className="hero-banner">
            <span className="hero-eyebrow">Student Practice Hub</span>
            <h1 className="hero-title">
              Test Your Skills &amp; <span className="hero-highlight">Review Instant Results</span>
            </h1>
            <p className="hero-subtitle">
              Choose any quiz published by your instructors below. Answers are graded securely on
              submission with clear explanations for every question.
            </p>
          </section>
        )}

        <section className="quizzes-section">
          <div className="section-header">
            <h2 className="section-title">
              {isTeacher ? "Your Published Quizzes" : "Available Quizzes"} ({quizzes.length})
            </h2>
          </div>

          {quizzes.length === 0 ? (
            <div className="empty-box">
              <p>
                {isTeacher
                  ? "You haven't published any quizzes yet. Enter a topic above to generate your first draft."
                  : "No quizzes have been published by teachers yet. Check back soon!"}
              </p>
            </div>
          ) : (
            <div className="quizzes-grid">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  role={user?.role}
                  deletedFunction={deletedFunction}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;