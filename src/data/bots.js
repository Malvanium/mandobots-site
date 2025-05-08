// src/data/bots.js
export const bots = [
  {
    key: "faq",
    name: "FAQ Bot",
    prompt: "You are the FAQ assistant for MandoBots…",
    endpoint: process.env.REACT_APP_CHAT_ENDPOINT,
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  },
  {
    key: "appointment",
    name: "Appointment Bot",
    prompt: "You are the Appointment assistant…",
    endpoint: process.env.REACT_APP_CHAT_ENDPOINT,
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  },
  // …
];
