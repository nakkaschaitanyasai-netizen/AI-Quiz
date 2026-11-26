import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Cookie from "js-cookie";
import "./index.css";

const TeacherAttempts = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/quizzes/${id}/attempts`,
          {
            headers: {
              Authorization: `Bearer ${Cookie.get("token")}`,
            },
          }
        );
        const data = await response.json();
        if (data.ok) {
          setQuiz(data.quiz);
          setAttempts(data.attempts || []);
        } else {
          setError(data.message || "Could not load student attempts");
        }
      } catch (err) {
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAttempts();
  }, [id]);

  if (loading) {
    return (
      <div className="app-loader-screen">
        <div className="app-loader-card">
          <div className="spinner-ring" />
          <p className="loader-label">Loading student submissions...</p>
        </div>
      </div>
    );
  }

  const avgAccuracy =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length)
      : 0;

  return (
    <div className="attempts-shell">
      <div className="attempts-container">
        <div className="attempts-header">
          <div>
            <Link to="/" className="back-link">
              ← Back to Teacher Dashboard
            </Link>
            <h1 className="attempts-title">
              {quiz ? quiz.quizTitle : "Student Attempts"}
            </h1>
            {quiz && (
              <p className="attempts-subtitle">
                {quiz.topic} · {quiz.difficulty} · {quiz.questionCount} questions
              </p>
            )}
          </div>
        </div>

        {error ? (
          <div className="error-banner">{error}</div>
        ) : (
          <>
            <div className="attempts-kpi-row">
              <div className="kpi-card">
                <span className="kpi-label">Students Attempted</span>
                <strong className="kpi-value">{attempts.length}</strong>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Class Average Accuracy</span>
                <strong className="kpi-value kpi-teal">{avgAccuracy}%</strong>
              </div>
            </div>

            {attempts.length === 0 ? (
              <div className="empty-attempts-box">
                No students have attempted this quiz yet.
              </div>
            ) : (
              <div className="attempts-table-card">
                <table className="attempts-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                      <th>Time Taken</th>
                      <th>Submitted On</th>
                      <th>Answers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={a._id}>
                        <td className="font-semibold text-slate-900">
                          {a.user?.username || "Student"}
                        </td>
                        <td className="text-slate-600">{a.user?.email || "—"}</td>
                        <td>
                          {a.score}/{a.totalQuestions}
                        </td>
                        <td>
                          <span
                            className={`acc-pill ${
                              a.accuracy >= 70 ? "acc-good" : "acc-warn"
                            }`}
                          >
                            {a.accuracy}%
                          </span>
                        </td>
                        <td>{a.timeTaken}s</td>
                        <td>{new Date(a.createdAt).toLocaleString()}</td>
                        <td>
                          <Link to={`/result/${a._id}`} className="inspect-link">
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherAttempts;
