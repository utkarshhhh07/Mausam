import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const SUGGESTED_QUESTIONS = [
  "Good spot for an outdoor event today?",
  "Best time to go running?",
  "Is my commute safe today?",
];

function buildResponse(input: string, personas: string[], locationName: string): string {
  const q = input.toLowerCase();

  if (q.includes("event") || q.includes("outdoor") || q.includes("spot") || q.includes("location")) {
    return `Based on today's forecast near ${locationName}, open lawns and rooftop venues look good — clear skies until around 2 PM with low wind. I'd wrap up before 4 PM since there's a strong chance of rain after that. Want me to check a specific time window?`;
  }

  if (q.includes("run") || q.includes("jog") || q.includes("workout") || q.includes("exercise") || q.includes("fitness")) {
    return `Your best window today is 6:00–7:30 AM — wind is calm and UV is still low. After 9 AM the UV index climbs to Very High, so I'd avoid outdoor cardio past that.`;
  }

  if (q.includes("commute") || q.includes("traffic") || q.includes("drive") || q.includes("school")) {
    return `Heads up — heavier rain is expected between 4–7 PM, right around typical commute hours. Leaving about 15 minutes earlier than usual should help you beat the worst of it.`;
  }

  if (q.includes("air") || q.includes("aqi") || q.includes("pollution") || q.includes("breath")) {
    return `Air quality is best before 9 AM today. If you're sensitive to pollution${
      personas.includes("health") ? " — noted from your Health preferences" : ""
    }, I'd keep outdoor time light in the afternoon when levels tend to rise.`;
  }

  return `I'm still learning that one! Try asking about outdoor plans, workout timing, or your commute — I can give you a personalized read on today's conditions in ${locationName}.`;
}

export function ChatAssistant() {
  const { location, prefs } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hi! I'm your Mausam assistant. Ask me about outdoor plans, workouts, or your commute for ${location.name} today.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = buildResponse(text, prefs.personas, location.name);
      setMessages((m) => [...m, { id: `${Date.now()}-a`, role: "assistant", text: reply }]);
      setTyping(false);
    }, 800);
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 lg:bottom-6 ${
          open ? "hidden" : "flex"
        }`}
        aria-label="Open Mausam Assistant"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-400 opacity-40" />
        <MessageCircle size={24} className="relative" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 left-4 z-50 flex h-[480px] w-[340px] max-w-[90vw] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-600" />
              <span className="text-sm font-semibold text-slate-900">Mausam Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${
                    m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl bg-slate-100 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}
          </div>

          {/* Suggested chips */}
          <div className="flex gap-2 overflow-x-auto px-3 pb-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="whitespace-nowrap rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-slate-100 px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about today..."
              className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            />
            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}