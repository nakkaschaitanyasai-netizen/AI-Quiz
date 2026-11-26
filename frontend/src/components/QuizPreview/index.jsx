import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PublishIcon from "@mui/icons-material/Publish";
import "./index.css";

const QuizPreview = ({ draft, publishing, onPublish, onCancel }) => {
  const [quizTitle, setQuizTitle] = useState(draft.quizTitle || "");
  const [items, setItems] = useState(
    (draft.questions || []).map((q, index) => ({
      ...q,
      tempId: index + 1,
      selected: true,
    }))
  );

  const toggleSelect = (tempId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const removeQuestion = (tempId) => {
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const selectedQuestions = items.filter((item) => item.selected);

  const handlePublishClick = () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question to publish.");
      return;
    }

    const cleanQuestions = selectedQuestions.map(
      ({ question, options, correctAnswer, explanation }) => ({
        question,
        options,
        correctAnswer,
        explanation: explanation || "",
      })
    );

    onPublish({
      quizTitle: quizTitle.trim() || `${draft.topic} Quiz`,
      topic: draft.topic,
      difficulty: draft.difficulty,
      questions: cleanQuestions,
    });
  };

  return (
    <section className="preview-panel">
      <div className="preview-header">
        <div>
          <span className="preview-badge">Teacher Review Mode</span>
          <h2 className="preview-heading">Review &amp; Select Questions Before Publishing</h2>
          <p className="preview-sub">
            {draft.topic} · {draft.difficulty} · Check the right answers, uncheck or remove any
            unwanted questions, then publish to students.
          </p>
        </div>
        <button type="button" className="preview-cancel-btn" onClick={onCancel}>
          Discard Draft
        </button>
      </div>

      <div className="preview-title-box">
        <label>Quiz Title</label>
        <input
          type="text"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          className="preview-title-input"
        />
      </div>

      {items.length === 0 ? (
        <div className="preview-empty">
          All questions removed. Click <strong>Discard Draft</strong> to generate a new set.
        </div>
      ) : (
        <div className="preview-list">
          {items.map((item, idx) => (
            <div
              key={item.tempId}
              className={`preview-card ${item.selected ? "preview-card-selected" : "preview-card-muted"}`}
            >
              <div className="preview-card-top">
                <label className="preview-checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelect(item.tempId)}
                  />
                  <span>
                    Q{idx + 1}. {item.question}
                  </span>
                </label>

                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={() => removeQuestion(item.tempId)}
                  title="Remove question"
                >
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} /> Remove
                </button>
              </div>

              <div className="preview-options">
                {(item.options || []).map((opt, optIdx) => {
                  const isCorrect = optIdx === item.correctAnswer;
                  return (
                    <div
                      key={optIdx}
                      className={`preview-option ${isCorrect ? "preview-option-correct" : ""}`}
                    >
                      <span>
                        <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                      </span>
                      {isCorrect && (
                        <span className="correct-tag">
                          <CheckCircleIcon sx={{ fontSize: 15 }} /> Right Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {item.explanation && (
                <p className="preview-explanation">
                  <strong>Explanation:</strong> {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="preview-footer">
        <span className="preview-count">
          Selected <strong>{selectedQuestions.length}</strong> of {items.length} questions
        </span>
        <button
          type="button"
          className="preview-publish-btn"
          disabled={publishing || selectedQuestions.length === 0}
          onClick={handlePublishClick}
        >
          <PublishIcon sx={{ fontSize: 18 }} />
          {publishing ? "Publishing..." : `Publish ${selectedQuestions.length} Questions to Students`}
        </button>
      </div>
    </section>
  );
};

export default QuizPreview;