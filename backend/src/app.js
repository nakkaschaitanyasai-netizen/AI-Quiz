import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userAuthRoutes from "./routes/authRoute.js";
import quizRoutes from "./routes/quizRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "AI Quiz API is running" });
});

app.use("/auth", userAuthRoutes);
app.use("/api", quizRoutes);

export default app;
