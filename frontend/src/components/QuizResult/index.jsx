import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Cookie from "js-cookie";
import "./index.css";

const QuizResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/attempts/${id}`, {
          headers: {
            Authorization: `Bearer ${Cookie.get("token")}`,
          },
        });
        const data = await response.json();
        if (data.ok) {
          setAttempt(data.attempt);
        }
      } catch (error) {
        console.error("Error loading result:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading || !attempt) {
    return (
      <div className="app-loader-screen">
        <div className="app-loader-card">
          <div className="spinner-ring" />
          <p className="loader-label">Loading result breakdown...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-shell">
      <div className="result-wrapper">
        <div className="result-top-bar">
          <button onClick={() => navigate(-1)} className="result-back-btn">
            ← Back
          </button>
          <Link to="/" className="result-home-link">
            Dashboard
          </Link>
        </div>

        <div className="result-summary-card">
          <span className="result-topic-tag">
            {attempt.topic} · {attempt.difficulty}
          </span>
          <h1 className="result-title">{attempt.quizTitle}</h1>
          {attempt.user?.username && (
            <p className="result-student-line">
              Submitted by <strong>{attempt.user.username}</strong> ({attempt.user.email})
            </p>
          )}

          <div className="result-stats-grid">
            <div className="result-stat">
              <span>Score</span>
              <strong>
                {attempt.score}/{attempt.totalQuestions}
              </strong>
            </div>
            <div className="result-stat">
              <span>Accuracy</span>
              <strong className={attempt.accuracy >= 70 ? "stat-good" : "stat-warn"}>
                {attempt.accuracy}%
              </strong>
            </div>
            <div className="result-stat">
              <span>Time Taken</span>
              <strong>{attempt.timeTaken}s</strong>
            </div>
          </div>
        </div>

        <div className="review-list">
          <h2 className="review-heading">Answer Review</h2>
          {attempt.answers.map((item, idx) => (
            <div key={item.questionId || idx} className="review-card">
              <div className="review-card-head">
                <h3>
                  {idx + 1}. {item.question}
                </h3>
                <span className={`status-pill ${item.isCorrect ? "pill-ok" : "pill-no"}`}>
                  {item.isCorrect ? "Correct" : item.selectedOption === null ? "Skipped" : "Wrong"}
                </span>
              </div>

              <div className="review-options">
                {item.options.map((opt, optIdx) => {
                  const isRight = optIdx === item.correctAnswer;
                  const isWrongPick = optIdx === item.selectedOption && !isRight;
                  return (
                    <div
                      key={optIdx}
                      className={`review-option ${
                        isRight ? "review-correct" : isWrongPick ? "review-wrong" : ""
                      }`}
                    >
                      <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                    </div>
                  );
                })}
              </div>

              {item.explanation && (
                <p className="review-explanation">
                  <strong>Explanation:</strong> {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
