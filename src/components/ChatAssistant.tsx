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

function buildResponse(
  input: string,
  personas: string[],
  healthSensitivities: string[],
  locationName: string
): string {
  const q = input.toLowerCase();
  const has = (p: string) => personas.includes(p);
  const sensitive = (s: string) => healthSensitivities.includes(s);

  // Outdoor events / travel / general location
  if (q.includes("event") || q.includes("outdoor") || q.includes("spot") || q.includes("location") || q.includes("garden") || q.includes("plant")) {
    if (has("garden")) {
      return `Soil moisture looks good for planting near ${locationName} this week — light rain expected Thursday should help. No frost risk in the forecast right now.`;
    }
    if (has("beach")) {
      return `Sea conditions near ${locationName} look calm today — low tide around 3 PM, wave height under 1m. Good window for beach plans before evening clouds roll in.`;
    }
    if (has("events") || has("travel")) {
      return `Based on today's forecast near ${locationName}, open lawns and rooftop venues look good — clear skies until around 2 PM with low wind. I'd wrap up before 4 PM since there's a strong chance of rain after that.`;
    }
    return `For outdoor plans near ${locationName}, mornings look clearest today — conditions get less predictable after 4 PM. Want me to check a specific activity?`;
  }

  // Fitness / running
  if (q.includes("run") || q.includes("jog") || q.includes("workout") || q.includes("exercise") || q.includes("fitness")) {
    if (has("fitness")) {
      let extra = "";
      if (sensitive("respiratory")) extra = " Air quality is also mild this morning, so it's a good window if you're managing respiratory sensitivity.";
      if (sensitive("sun")) extra = " Since you've flagged sun sensitivity, I'd still go with SPF even in that early window.";
      return `Your best running window today is 6:00–7:30 AM — wind is calm and UV is still low.${extra} After 9 AM the UV index climbs to Very High, so I'd avoid outdoor cardio past that.`;
    }
    return `You haven't set Fitness as a focus area, but generally 6:00–7:30 AM is the calmest window today near ${locationName} if you're heading out.`;
  }

  // Commute / family / school
  if (q.includes("commute") || q.includes("traffic") || q.includes("drive") || q.includes("school")) {
    if (has("family") || has("commute")) {
      return `Heads up — heavier rain is expected between 4–7 PM, right around typical commute and school-pickup hours near ${locationName}. Leaving about 15 minutes earlier should help you beat the worst of it.`;
    }
    return `Rain is likely between 4–7 PM near ${locationName} today, which could affect travel times if you're heading out during that window.`;
  }

  // Air quality / health
  if (q.includes("air") || q.includes("aqi") || q.includes("pollution") || q.includes("breath")) {
    let note = "";
    if (sensitive("respiratory")) note = " Since you've noted respiratory sensitivity, I'd be extra cautious in the afternoon.";
    if (sensitive("allergy")) note += " Pollen levels are also trending moderate today.";
    if (has("health")) {
      return `Air quality is best before 9 AM today near ${locationName}.${note} I'd keep outdoor time light in the afternoon when levels tend to rise.`;
    }
    return `Air quality near ${locationName} is best in the morning today, dipping a bit by afternoon.`;
  }

  // Sun/UV/skin
  if (q.includes("uv") || q.includes("sun") || q.includes("skin") || q.includes("spf")) {
    const note = sensitive("sun") ? " Given your sun sensitivity, I'd reapply SPF every 2 hours if you're out past 11 AM." : "";
    return `UV index peaks around 1 PM today near ${locationName} — Very High.${note} Best to limit direct exposure between 11 AM and 3 PM.`;
  }

  // fallback — mention their actual selected focuses to feel personalized even when unmatched
  const focusList = personas.length > 0 ? personas.join(", ") : "general weather";
  return `I'm still learning that one! Based on your selected focus areas (${focusList}), try asking about outdoor plans, workouts, commute timing, or air quality — I can give you a personalized read for ${locationName}.`;
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
      const reply = buildResponse(text, prefs.personas, prefs.healthSensitivities, location.name);
      setMessages((m) => [...m, { id: `${Date.now()}-a`, role: "assistant", text: reply }]);
      setTyping(false);
    }, 800);
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-40 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 lg:bottom-6 ${
          open ? "hidden" : "flex"
        }`}
        aria-label="Open Mausam Assistant"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-400 opacity-40" />
        <MessageCircle size={24} className="relative" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[480px] w-[340px] max-w-[90vw] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
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