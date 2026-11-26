import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import "./index.css";

const QuizCard = (props) => {
  const { quiz, role, deletedFunction } = props;
  const navigate = useNavigate();
  const isTeacher = role === "teacher";

  const deleteQuiz = () => {
    if (window.confirm("Do you really want to delete this quiz?")) {
      deletedFunction(quiz._id);
    }
  };

  return (
    <div className="quiz-card">
      <div>
        <div className="quiz-card-top">
          <span className={`diff-badge diff-${quiz.difficulty?.toLowerCase()}`}>
            {quiz.difficulty}
          </span>
          {isTeacher && (
            <button className="delete-button" onClick={deleteQuiz} title="Delete quiz">
              <DeleteIcon sx={{ fontSize: 18 }} />
            </button>
          )}
        </div>

        <h3 className="quiz-title">{quiz.quizTitle}</h3>
        <p className="quiz-topic">{quiz.topic}</p>

        <div className="quiz-meta-row">
          <span>{quiz.questionCount} questions</span>
          <span>·</span>
          <span>{Math.round(quiz.timeLimit / 60)} min</span>
          {isTeacher ? (
            <>
              <span>·</span>
              <span className="attempt-count-text">
                {quiz.attemptCount || 0} {quiz.attemptCount === 1 ? "attempt" : "attempts"}
              </span>
            </>
          ) : (
            <>
              <span>·</span>
              <span>By {quiz.teacherName || "Instructor"}</span>
            </>
          )}
        </div>
      </div>

      <div className="quiz-card-actions">
        {isTeacher ? (
          <button
            className="teacher-attempts-btn"
            onClick={() => navigate(`/quiz/${quiz._id}/attempts`)}
          >
            <PeopleOutlineIcon sx={{ fontSize: 18 }} /> View Attempts ({quiz.attemptCount || 0})
          </button>
        ) : (
          <button
            className="start-quiz-btn"
            onClick={() => navigate(`/quiz/${quiz._id}`)}
          >
            <PlayArrowIcon sx={{ fontSize: 18 }} /> Start Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
