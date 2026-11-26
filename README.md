# QuizFlow — AI-Quiz-Automation (MERN + Gemini AI)

Full-stack MERN classroom assessment platform with **Teacher & Student Role-Based Views**, automatic **Gemini AI model fallback**, **MongoDB** persistence, server-side grading, and a clean light-theme **React + Vite + Tailwind CSS + DaisyUI** UI.

## Key Features

- **Role-Based Views (Teacher vs. Student)**:
  - **Teachers** generate quizzes by topic and difficulty with Gemini AI, manage published quizzes, view live attempt counts, see **which students attempted each quiz** (name, email, score, accuracy, time), and inspect any student's exact answers.
  - **Students** browse all quizzes published by teachers, take timed assessments with refresh persistence, and review instant scores and question explanations.
- **Resilient Gemini Model Fallback**: `backend/src/services/geminiService.js` loops through candidate Gemini models (`gemini-3.8-flash`, `gemini-3.8-flash-lite`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`) and caches the available model to handle `503` high-demand spikes gracefully.
- **Server-Side Grading**: Correct answers and explanations are stripped from `GET /api/quizzes/:id` and evaluated exclusively in `POST /api/quizzes/:id/submit`.

## Quick Start

### 1. Backend
```powershell
cd backend
copy .env.example .env
# Set MONGO_URI, JWT_SECRET, and GEMINI_API_KEY in backend\.env
npm install
npm run dev
```

### 2. Frontend
```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```
