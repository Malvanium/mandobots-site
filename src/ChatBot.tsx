import React, { useState, useEffect } from 'react';

interface Message { role: 'user'|'assistant'|'system'; content: string; }
interface ChatBotProps { botName: string; prompt: string; endpoint: string; apiKey: string; }

const ChatBot: React.FC<ChatBotProps> = ({ botName, prompt, endpoint, apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I'm ${botName}. Ask me anything!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      { role: 'assistant', content: `Hi! I'm ${botName}. Ask me anything!` },
    ]);
    setInput('');
    setLoading(false);
  }, [botName]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: input },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: prompt },
            ...newMessages.slice(-6),
          ],
          temperature: 0.6,
          max_tokens: 300,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Something went wrong.';
      setMessages([ ...newMessages, { role: 'assistant', content: reply } ] as Message[]);
    } catch (err: any) {
      console.error('Fetch failed:', err);
      setMessages([ ...newMessages, { role: 'assistant', content: 'Error contacting OpenAI.' } ] as Message[]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-offwhite rounded-lg shadow-lg overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[80%] break-words animate-fadeIn ${
            msg.role === 'user'
              ? 'self-end bg-primary text-offwhite'
              : 'self-start bg-white text-primary'
          }`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="italic text-sm text-gray-500">Mando is typing...</div>}
      </div>
      <div className="p-4 bg-white border-t border-gray-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask something..."
            className="flex-1 px-4 py-2 bg-offwhite rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-primary text-offwhite rounded-r-md hover:bg-neon transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;