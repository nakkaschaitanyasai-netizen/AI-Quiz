import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookie from "js-cookie";
import "./index.css";

const formatTime = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const getOptionText = (option) => {
  if (typeof option === "string" || typeof option === "number") return String(option);
  if (option && typeof option === "object") {
    return option.text || option.label || option.value || JSON.stringify(option);
  }
  return "";
};

const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storageKey = `quiz_draft_${id}`;

  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submittedRef = useRef(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/${id}`, {
          headers: {
            Authorization: `Bearer ${Cookie.get("token")}`,
          },
        });
        const data = await response.json();
        if (data.ok && data.quiz) {
          setQuiz(data.quiz);
          const defaultTime = Number(data.quiz.timeLimit) > 0 ? Number(data.quiz.timeLimit) : 300;
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed?.answers && typeof parsed.answers === "object") {
                setAnswers(parsed.answers);
              }
              if (typeof parsed?.timeLeft === "number" && parsed.timeLeft > 0) {
                setTimeLeft(parsed.timeLeft);
                return;
              }
            }
          } catch {
            localStorage.removeItem(storageKey);
          }
          setTimeLeft(defaultTime);
        } else {
          setErrorMsg(data.message || "Could not load quiz.");
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        setErrorMsg("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, storageKey]);

  useEffect(() => {
    if (!quiz || timeLeft === null || submittedRef.current) return;
    localStorage.setItem(storageKey, JSON.stringify({ answers, timeLeft }));
  }, [answers, timeLeft, quiz, storageKey]);

  const submitQuizFunction = useCallback(async () => {
    if (!quiz || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const totalLimit = Number(quiz.timeLimit) > 0 ? Number(quiz.timeLimit) : 300;
    const timeTaken = Math.max(0, totalLimit - (timeLeft ?? 0));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quizzes/${id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookie.get("token")}`,
          },
          body: JSON.stringify({ answers, timeTaken }),
        }
      );
      const data = await response.json();
      if (data.ok && data.attempt?._id) {
        localStorage.removeItem(storageKey);
        navigate(`/result/${data.attempt._id}`, { replace: true });
      } else {
        submittedRef.current = false;
        setSubmitting(false);
        alert(data.message || "Submission failed");
      }
    } catch (error) {
      submittedRef.current = false;
      setSubmitting(false);
      console.error("Error submitting quiz:", error);
    }
  }, [quiz, id, answers, timeLeft, storageKey, navigate]);

  useEffect(() => {
    if (timeLeft === null || loading || submitting) return;
    if (timeLeft <= 0) {
      submitQuizFunction();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, submitting, submitQuizFunction]);

  if (loading) {
    return (
      <div className="app-loader-screen">
        <div className="app-loader-card">
          <div className="spinner-ring" />
          <p className="loader-label">Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const safeIndex = Math.min(currentIndex, Math.max(0, questions.length - 1));
  const currentQuestion = questions[safeIndex];
  const options = Array.isArray(currentQuestion?.options) ? currentQuestion.options : [];

  if (errorMsg || !quiz || !currentQuestion) {
    return (
      <div className="app-loader-screen">
        <div className="app-loader-card">
          <p className="loader-label">{errorMsg || "This quiz has no valid questions."}</p>
          <button className="nav-next-btn" onClick={() => navigate("/")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questionKey = currentQuestion._id || String(safeIndex);

  return (
    <div className="quiz-play-shell">
      <div className="quiz-play-wrapper">
        <div className="quiz-play-header">
          <div>
            <h1 className="quiz-play-title">{quiz.quizTitle || "Untitled Quiz"}</h1>
            <p className="quiz-play-sub">
              {quiz.topic} · {quiz.difficulty}
            </p>
          </div>
          <div className={`timer-badge ${(timeLeft ?? 0) <= 30 ? "timer-low" : ""}`}>
            {formatTime(timeLeft ?? 0)}
          </div>
        </div>

        <div className="question-pills">
          {questions.map((q, idx) => {
            const key = q._id || String(idx);
            return (
              <button
                key={key}
                onClick={() => setCurrentIndex(idx)}
                className={`q-pill ${
                  idx === safeIndex
                    ? "q-pill-current"
                    : answers[key] !== undefined
                    ? "q-pill-answered"
                    : ""
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="question-card">
          <p className="question-counter">
            Question {safeIndex + 1} of {questions.length}
          </p>
          <h2 className="question-prompt">
            {currentQuestion.question || currentQuestion.prompt || "Question text unavailable"}
          </h2>

          <div className="options-list">
            {options.map((option, optIdx) => {
              const isSelected = answers[questionKey] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [questionKey]: optIdx,
                    }))
                  }
                  className={`option-btn ${isSelected ? "option-selected" : ""}`}
                >
                  <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                  <span>{getOptionText(option)}</span>
                </button>
              );
            })}
          </div>

          <div className="quiz-nav-actions">
            <button
              className="nav-prev-btn"
              disabled={safeIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            >
              Previous
            </button>

            {safeIndex < questions.length - 1 ? (
              <button
                className="nav-next-btn"
                onClick={() =>
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                }
              >
                Next Question
              </button>
            ) : (
              <button
                className="nav-submit-btn"
                disabled={submitting}
                onClick={submitQuizFunction}
              >
                {submitting ? "Grading..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlay;