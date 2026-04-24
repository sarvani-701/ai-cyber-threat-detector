import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

// 🔍 PROFILE ANALYSIS
function calculateProfileRisk(profile = {}) {
  let score = 0;
  let reasons = [];

  const followers = profile.followers || 0;
  const following = profile.following || 0;
  const posts = profile.posts || 0;

  if (followers < 50) {
    score += 20;
    reasons.push("Low followers");
  }

  if (following > followers * 2) {
    score += 20;
    reasons.push("High following ratio");
  }

  if (posts < 5) {
    score += 10;
    reasons.push("Low activity");
  }

  return { score, reasons };
}

// 🚨 MAIN API
app.post("/analyze", async (req, res) => {
  const message = req.body.message || "";
  const profile = req.body.profile || {
    followers: 0,
    following: 0,
    posts: 0
  };

  const profileData = calculateProfileRisk(profile);

  let aiScore = 0;
  let aiReason = "No threat detected";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Analyze the message for cyber threat, stalking, or harassment. Return JSON: {score: number (0-50), reason: string}"
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    const parsed = JSON.parse(text);
    aiScore = parsed.score || 0;
    aiReason = parsed.reason || "Analyzed";

  } catch (err) {
    console.log("⚠️ AI failed, using fallback");

    // 🔁 fallback logic
    if (
      message.toLowerCase().includes("kill") ||
      message.toLowerCase().includes("track") ||
      message.toLowerCase().includes("follow you")
    ) {
      aiScore = 40;
      aiReason = "Threatening or stalking language detected";
    } else {
      aiScore = 10;
      aiReason = "Possibly suspicious message";
    }
  }

  let totalScore = profileData.score + aiScore;
  if (totalScore > 100) totalScore = 100;

  let level = "Safe";
  if (totalScore > 70) level = "Dangerous";
  else if (totalScore > 40) level = "Suspicious";

  res.json({
    score: totalScore,
    level,
    explanation: [...profileData.reasons, aiReason].join(", "),
    action:
      level === "Dangerous"
        ? "Block & Report"
        : level === "Suspicious"
        ? "Be Cautious"
        : "Safe"
  });
});

app.listen(5000, () => console.log("🚀 Backend running on port 5000"));