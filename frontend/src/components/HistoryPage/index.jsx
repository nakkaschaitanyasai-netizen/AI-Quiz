import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookie from "js-cookie";
import "./index.css";

const HistoryPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attempts`, {
          headers: {
            Authorization: `Bearer ${Cookie.get("token")}`,
          },
        });
        const data = await response.json();
        if (data.ok) {
          setAttempts(data.attempts || []);
        }
      } catch (error) {
        console.error("Error fetching attempts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="app-loader-screen">
        <div className="app-loader-card">
          <div className="spinner-ring" />
          <p className="loader-label">Loading your quiz results...</p>
        </div>
      </div>
    );
  }

  const avgAccuracy =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, item) => sum + item.accuracy, 0) / attempts.length
        )
      : 0;

  return (
    <div className="history-shell">
      <div className="history-wrapper">
        <div className="history-header">
          <div>
            <Link to="/" className="history-back-link">
              ← Back to Quizzes
            </Link>
            <h1 className="history-title">My Quiz Results</h1>
          </div>
        </div>

        <div className="history-kpi-row">
          <div className="history-kpi">
            <span>Completed Quizzes</span>
            <strong>{attempts.length}</strong>
          </div>
          <div className="history-kpi">
            <span>Average Accuracy</span>
            <strong className="kpi-accent">{avgAccuracy}%</strong>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="history-empty">
            You haven't completed any quizzes yet. Head back to the dashboard to start one!
          </div>
        ) : (
          <div className="history-table-card">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a._id}>
                    <td className="font-semibold text-slate-900">{a.quizTitle}</td>
                    <td>{a.topic}</td>
                    <td>
                      {a.score}/{a.totalQuestions}
                    </td>
                    <td>
                      <span
                        className={`acc-badge ${
                          a.accuracy >= 70 ? "acc-badge-ok" : "acc-badge-warn"
                        }`}
                      >
                        {a.accuracy}%
                      </span>
                    </td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/result/${a._id}`} className="review-link">
                        View Result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
