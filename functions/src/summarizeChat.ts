import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import cors from "cors";
import type { Request, Response } from "express";

// ✅ Define secret properly for v2
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// ✅ Init admin
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ✅ CORS middleware
const corsHandler = cors({
  origin: true,
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

// ✅ Main export
export const summarizeChat = onRequest(
  {
    region: "us-central1",
    secrets: [OPENAI_API_KEY],
  },
  (req: Request, res: Response) => {
    corsHandler(req, res, () => {
      void summarizeLogic(req, res);
    });
  }
);

// ✅ Summarization logic
async function summarizeLogic(req: Request, res: Response): Promise<void> {
  const { messages, userId, botId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Missing or invalid 'messages'." });
    return;
  }

  const openaiKey = OPENAI_API_KEY.value();
  if (!openaiKey) {
    console.error("❌ OPENAI_API_KEY is not set.");
    res.status(500).json({ error: "Missing OpenAI API key." });
    return;
  }

  const prompt = `
You are an assistant summarizing a conversation between a user and a chatbot. Capture:
- What the user was asking or concerned about
- The main insights the bot provided
- Any actions the bot recommended or the user considered
Keep it short but clear.

Chat log:
${messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful summarization assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    const json = await response.json();
    console.log("🧠 OpenAI Response:", JSON.stringify(json, null, 2));

    let summary = "No summary available.";
    try {
      if (
        json &&
        Array.isArray(json.choices) &&
        json.choices[0]?.message?.content
      ) {
        summary = json.choices[0].message.content.trim();
      }
    } catch (parseErr) {
      console.warn("⚠️ Failed to extract summary:", parseErr);
    }

    if (userId && botId) {
      await db.collection("summaries").add({
        userId,
        botId,
        summary,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).json({ summary });
  } catch (err) {
    console.error("❌ Error generating summary:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
