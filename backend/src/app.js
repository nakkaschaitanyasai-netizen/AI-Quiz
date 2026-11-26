
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userAuthRoutes from "./routes/authRoute.js";
import quizRoutes from "./routes/quizRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.VERCEL_URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "AI Quiz API is running"
  });
});

app.use("/auth", userAuthRoutes);
app.use("/api", quizRoutes);

export default app;
