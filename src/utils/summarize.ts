// src/utils/summarize.ts

/**
 * Sends a chat log to your Cloud Function HTTP endpoint for summarization.
 * Works with the deployed HTTPS function: summarizeChat
 */

export async function getChatSummary(
    messages: { role: string; content: string }[],
    userId: string,
    botId: string
  ): Promise<string> {
    try {
      const res = await fetch("https://us-central1-mandobots-f02d1.cloudfunctions.net/summarizeChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages, userId, botId }),
      });
  
      const json = await res.json();
  
      if (!res.ok) {
        console.error("❌ Server error:", json.error || "Unknown");
        throw new Error(json.error || "Server error");
      }
  
      return json.summary || "No summary returned.";
    } catch (error) {
      console.error("❌ HTTP Summary Fetch Failed:", error);
      return "Unable to summarize the chat at this time.";
    }
  }
  
  /**
   * Fallback wrapper for better error handling from components
   */
  export async function getChatSummaryWithFallback(
    messages: { role: string; content: string }[],
    userId: string,
    botId: string
  ): Promise<string> {
    try {
      return await getChatSummary(messages, userId, botId);
    } catch (error) {
      console.error("⚠️ Fallback Summary Triggered:", error);
      return "No summary available due to error.";
    }
  }
  