import genAI from "../config/gemini.js";

const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-4-hydrogen",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

let selectedModel = null;

const generateQuizQuestions = async (topic, difficulty = "Medium", count = 5) => {
  const prompt = `You are a technical quiz generator.
Generate ${count} multiple-choice questions on the topic: "${topic}" at "${difficulty}" difficulty.
Return ONLY valid JSON (no markdown, no extra text) in the exact following format:
{
  "quizTitle": "Short clear title for the quiz",
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Short clear explanation of why the answer is correct"
    }
  ]
}
Rules:
- Each question must have exactly 4 options.
- correctAnswer must be a number from 0 to 3 matching the index in options.
- Keep questions practical and interview-relevant.`;

  const candidates = selectedModel
    ? [selectedModel, ...MODELS.filter((m) => m !== selectedModel)]
    : MODELS;

  let i = 0;
  let lastError = null;

  while (i < candidates.length) {
    const currentModel = candidates[i];
    try {
      console.log("Trying Gemini model:", currentModel);
      const response = await genAI.models.generateContent({
        model: currentModel,
        contents: prompt,
      });

      const rawText = response?.text;
      if (!rawText) {
        throw new Error("Empty response.text from Gemini");
      }

      const cleanText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanText);
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("AI did not return a valid questions array");
      }

      selectedModel = currentModel;
      console.log("Success with model:", selectedModel, "| Questions:", parsed.questions.length);
      return parsed;
    } catch (error) {
      console.warn(`Model ${currentModel} failed:`, error.message);
      lastError = error;
      i++;
    }
  }

  throw new Error(
    `Could not generate questions right now. Last error: ${lastError?.message || "Model unavailable"}`
  );
};

export default generateQuizQuestions;