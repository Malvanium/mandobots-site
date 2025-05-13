// api/chat.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Configuration, OpenAIApi } from "openai";

const cfg = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(cfg);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { systemPrompt, history } = req.body as {
    systemPrompt: string;
    history: { role: string; content: string }[];
  };

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const reply = completion.data.choices[0].message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("OpenAI error:", err.message);
    return res.status(500).json({ error: "OpenAI request failed" });
  }
}
