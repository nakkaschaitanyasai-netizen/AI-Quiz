import express from "express";
import protectedRoute from "../middleware/ProtectedRoute.js";
import {
  generateQuiz,
  getQuizzes,
  getQuizById,
  deleteQuiz,
  submitQuiz,
  getQuizAttempts,
  getMyAttempts,
  getAttemptById,previewQuiz, publishQuiz
} from "../controllers/quizControllers.js";

const router = express.Router();

router.post("/quizzes/generate", protectedRoute, generateQuiz);
router.get("/quizzes", protectedRoute, getQuizzes);
router.get("/quizzes/:id", protectedRoute, getQuizById);
router.get("/quizzes/:id/attempts", protectedRoute, getQuizAttempts);
router.delete("/quizzes/:id", protectedRoute, deleteQuiz);
router.post("/quizzes/:id/submit", protectedRoute, submitQuiz);
router.get("/attempts", protectedRoute, getMyAttempts);
router.get("/attempts/:id", protectedRoute, getAttemptById);
router.post("/quizzes/preview", protectedRoute, previewQuiz);
router.post("/quizzes/publish", protectedRoute, publishQuiz);

export default router;
