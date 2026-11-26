import Quiz from "../models/Quiz.js";
import Attempt from "../models/Attempt.js";
import generateQuizQuestions from "../services/geminiService.js";

export const previewQuiz = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ ok: false, message: "Only teachers can generate quizzes" });
    }

    const { topic, difficulty = "Medium", count = 5 } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ ok: false, message: "Topic is required" });
    }

    const safeCount = Math.min(Math.max(Number(count) || 5, 3), 15);
    const aiData = await generateQuizQuestions(topic.trim(), difficulty, safeCount);

    res.status(200).json({
      ok: true,
      draft: {
        quizTitle: aiData.quizTitle || `${topic.trim()} (${difficulty}) Quiz`,
        topic: topic.trim(),
        difficulty,
        questions: aiData.questions,
      },
    });
  } catch (error) {
    console.error("Error generating preview:", error.message);
    res.status(500).json({ ok: false, message: error.message || "Failed to generate preview" });
  }
};

export const publishQuiz = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ ok: false, message: "Only teachers can publish quizzes" });
    }

    const { quizTitle, topic, difficulty = "Medium", questions } = req.body;
    if (!quizTitle || !topic || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Select at least one question before publishing",
      });
    }

    const newQuiz = new Quiz({
      user: req.user.id,
      quizTitle: quizTitle.trim(),
      topic: topic.trim(),
      difficulty,
      timeLimit: questions.length * 60,
      questions,
    });

    await newQuiz.save();

    res.status(201).json({
      ok: true,
      message: "Quiz published to students",
      quiz: {
        _id: newQuiz._id,
        quizTitle: newQuiz.quizTitle,
        topic: newQuiz.topic,
        difficulty: newQuiz.difficulty,
        timeLimit: newQuiz.timeLimit,
        questionCount: newQuiz.questions.length,
        attemptCount: 0,
        createdAt: newQuiz.createdAt,
      },
    });
  } catch (error) {
    console.error("Error publishing quiz:", error.message);
    res.status(500).json({ ok: false, message: error.message || "Failed to publish quiz" });
  }
};

export const generateQuiz = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ ok: false, message: "Only teachers can generate quizzes" });
    }

    const { topic, difficulty = "Medium", count = 5 } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ ok: false, message: "Topic is required" });
    }

    const safeCount = Math.min(Math.max(Number(count) || 5, 3), 15);
    const aiData = await generateQuizQuestions(topic.trim(), difficulty, safeCount);

    const newQuiz = new Quiz({
      user: req.user.id,
      quizTitle: aiData.quizTitle || `${topic.trim()} (${difficulty}) Quiz`,
      topic: topic.trim(),
      difficulty,
      timeLimit: safeCount * 60,
      questions: aiData.questions,
    });

    await newQuiz.save();

    res.status(201).json({
      ok: true,
      message: "Quiz generated successfully",
      quiz: {
        _id: newQuiz._id,
        quizTitle: newQuiz.quizTitle,
        topic: newQuiz.topic,
        difficulty: newQuiz.difficulty,
        timeLimit: newQuiz.timeLimit,
        questionCount: newQuiz.questions.length,
        attemptCount: 0,
        createdAt: newQuiz.createdAt,
      },
    });
  } catch (error) {
    console.error("Error generating quiz:", error.message);
    res.status(500).json({ ok: false, message: error.message || "Failed to generate quiz" });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const isTeacher = req.user.role === "teacher";
    const filter = isTeacher ? { user: req.user.id } : {};

    const quizzes = await Quiz.find(filter)
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    const quizIds = quizzes.map((q) => q._id);
    const attemptCounts = await Attempt.aggregate([
      { $match: { quiz: { $in: quizIds } } },
      { $group: { _id: "$quiz", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    attemptCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const formatted = quizzes.map((q) => ({
      _id: q._id,
      quizTitle: q.quizTitle,
      topic: q.topic,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit,
      questionCount: q.questions.length,
      attemptCount: countMap[q._id.toString()] || 0,
      teacherName: q.user?.username || "Instructor",
      createdAt: q.createdAt,
    }));

    res.status(200).json({ ok: true, Quizzes: formatted });
  } catch (error) {
    console.error("Error fetching quizzes:", error.message);
    res.status(500).json({ ok: false, message: "Failed to fetch quizzes" });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ ok: false, message: "Quiz not found" });
    }

    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.status(200).json({
      ok: true,
      quiz: {
        _id: quiz._id,
        quizTitle: quiz.quizTitle,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Failed to load quiz" });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ ok: false, message: "Only teachers can delete quizzes" });
    }

    const deleted = await Quiz.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Quiz not found" });
    }
    res.status(200).json({ ok: true, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Failed to delete quiz" });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ ok: false, message: "Quiz not found" });
    }

    const { answers = {}, timeTaken = 0 } = req.body;
    let score = 0;

    const gradedAnswers = quiz.questions.map((q) => {
      const selected = answers[q._id.toString()];
      const selectedOption =
        typeof selected === "number" && selected >= 0 && selected <= 3 ? selected : null;
      const isCorrect = selectedOption === q.correctAnswer;
      if (isCorrect) score += 1;

      return {
        questionId: q._id,
        question: q.question,
        options: q.options,
        selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = quiz.questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const attempt = new Attempt({
      user: req.user.id,
      quiz: quiz._id,
      quizTitle: quiz.quizTitle,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      score,
      totalQuestions,
      accuracy,
      timeTaken: Number(timeTaken) || 0,
      answers: gradedAnswers,
    });

    await attempt.save();
    res.status(201).json({ ok: true, attempt });
  } catch (error) {
    console.error("Error submitting quiz:", error.message);
    res.status(500).json({ ok: false, message: "Failed to submit quiz" });
  }
};

export const getQuizAttempts = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        ok: false,
        message: "Only teachers can view student attempts for a quiz",
      });
    }

    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id });
    if (!quiz) {
      return res.status(404).json({ ok: false, message: "Quiz not found" });
    }

    const attempts = await Attempt.find({ quiz: quiz._id })
      .populate("user", "username email")
      .select("user quizTitle topic difficulty score totalQuestions accuracy timeTaken createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      ok: true,
      quiz: {
        _id: quiz._id,
        quizTitle: quiz.quizTitle,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questionCount: quiz.questions.length,
      },
      attempts,
    });
  } catch (error) {
    console.error("Error fetching quiz attempts:", error.message);
    res.status(500).json({ ok: false, message: "Failed to fetch student attempts" });
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id })
      .select("quiz quizTitle topic difficulty score totalQuestions accuracy timeTaken createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ ok: true, attempts });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Failed to fetch attempts" });
  }
};

export const getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate("user", "username email");
    if (!attempt) {
      return res.status(404).json({ ok: false, message: "Attempt not found" });
    }

    const isStudentOwner = attempt.user?._id?.toString() === req.user.id;
    let isQuizTeacher = false;
    if (req.user.role === "teacher") {
      const quiz = await Quiz.findOne({ _id: attempt.quiz, user: req.user.id });
      isQuizTeacher = Boolean(quiz);
    }

    if (!isStudentOwner && !isQuizTeacher) {
      return res.status(403).json({ ok: false, message: "Access denied" });
    }

    res.status(200).json({ ok: true, attempt });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Failed to fetch attempt result" });
  }
};