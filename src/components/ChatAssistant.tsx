import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Topic = "outdoor" | "fitness" | "commute" | "air" | "uv" | "clothing" | "travel" | "allergy" | "rain";

const PRIMARY_QUESTIONS = [
  "Is there a good time for outdoor activities today?",
  "What's the best time for a workout today?",
  "What should I wear today?",
];

// Shown after a reply, based on the topic just discussed
const FOLLOW_UPS: Record<Topic, string[]> = {
  outdoor: ["What about tomorrow?", "Any allergy concerns today?", "What should I wear?"],
  fitness: ["What about air quality?", "Best time tomorrow?", "Any UV precautions?"],
  commute: ["Should I leave earlier?", "What about the school run?", "Any rain expected later?"],
  air: ["Is it safe to exercise?", "Any allergy concerns?", "What about tomorrow?"],
  uv: ["What should I wear?", "Best time to be outside?", "Any skin precautions?"],
  clothing: ["Do I need an umbrella?", "What about tomorrow?", "Is it humid today?"],
  travel: ["What should I pack?", "Any weather risk at my destination?", "Best time to leave?"],
  allergy: ["Is air quality bad today?", "Should kids stay indoor?", "What about tomorrow?"],
  rain: ["Should I leave earlier?", "Is it safe for events today?", "What about the weekend?"],
};

const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  outdoor: ["event", "outdoor", "spot", "location", "garden", "plant", "park", "picnic"],
  fitness: ["run", "jog", "workout", "exercise", "fitness", "gym"],
  commute: ["commute", "traffic", "drive", "school", "pickup"],
  air: ["air", "aqi", "pollution", "breath"],
  uv: ["uv", "sun", "skin", "spf"],
  clothing: ["wear", "outfit", "clothes", "clothing", "jacket"],
  travel: ["travel", "trip", "pack", "packing", "destination"],
  allergy: ["allergy", "allergies", "pollen", "sneeze"],
  rain: ["rain", "umbrella", "shower", "monsoon", "wet"],
};

function detectTopic(q: string): Topic | null {
  for (const [topic, words] of Object.entries(TOPIC_KEYWORDS) as [Topic, string[]][]) {
    if (words.some((w) => q.includes(w))) return topic;
  }
  return null;
}

const FOLLOW_UP_HINTS = ["tomorrow", "then", "what about", "and", "also"];

// Persona-specific notes per topic — every persona the user selected that's relevant gets blended in
function personaNotes(topic: Topic, personas: string[], sensitivities: string[], loc: string): string[] {
  const has = (p: string) => personas.includes(p);
  const sensitive = (s: string) => sensitivities.includes(s);
  const notes: string[] = [];

  if (topic === "outdoor") {
    if (has("garden")) notes.push(`soil moisture near ${loc} looks good for planting this week, with no frost risk`);
    if (has("beach")) notes.push(`sea conditions are calm today — low tide around 3 PM, waves under 1m`);
    if (has("events")) notes.push(`open lawns and rooftop venues work well until around 2 PM before wind picks up`);
    if (has("family")) notes.push(`conditions look kid-safe through early afternoon, but I'd head in before evening`);
    if (has("health") && sensitive("sun")) notes.push(`with your sun sensitivity, stick to shaded spots after 11 AM`);
  }

  if (topic === "fitness") {
    if (has("fitness")) notes.push(`6:00–7:30 AM is your calmest window — low wind, low UV`);
    if (sensitive("respiratory")) notes.push(`air quality is mild this morning, good for a respiratory-sensitive workout`);
    if (sensitive("sun")) notes.push(`SPF is still worth it even in that early window`);
  }

  if (topic === "commute") {
    if (has("commute") || has("family")) notes.push(`heavier rain is expected 4–7 PM near ${loc}, right at commute/pickup hours`);
    if (has("family")) notes.push(`leaving 15 minutes earlier should help you beat school pickup traffic`);
  }

  if (topic === "air") {
    if (has("health")) notes.push(`air quality is best before 9 AM, dipping by afternoon`);
    if (sensitive("respiratory")) notes.push(`I'd be cautious outdoors in the afternoon given your respiratory sensitivity`);
    if (sensitive("allergy")) notes.push(`pollen is trending moderate today too`);
  }

  if (topic === "uv") {
    if (has("health") || has("fitness") || has("beach")) notes.push(`UV peaks around 1 PM today — Very High`);
    if (sensitive("sun")) notes.push(`reapply SPF every 2 hours if you're out past 11 AM`);
  }

  if (topic === "clothing") {
    if (has("travel")) notes.push(`layer up — mornings are cooler than midday near ${loc}`);
    if (has("family")) notes.push(`pack a light jacket for kids in case of the afternoon rain`);
    if (has("garden")) notes.push(`waterproof boots are worth it if you're out in the soil later`);
  }

  if (topic === "travel") {
    if (has("travel")) notes.push(`pack for mild mornings and a chance of rain later in the day`);
    if (has("beach")) notes.push(`if your destination is coastal, sea conditions look calm`);
    if (has("health")) notes.push(`bring sun protection regardless of destination`);
  }

  if (topic === "allergy") {
    if (has("health")) notes.push(`pollen is moderate today near ${loc}`);
    if (has("family")) notes.push(`keep kids' outdoor time shorter if they're pollen-sensitive`);
    if (has("garden")) notes.push(`gardening midday will kick up more pollen than early morning`);
  }

  if (topic === "rain") {
    if (has("commute") || has("family")) notes.push(`rain builds in around 4 PM — worth an umbrella if you're out later`);
    if (has("events")) notes.push(`outdoor events should wrap before 4 PM`);
    if (has("garden")) notes.push(`good news for your plants either way`);
  }

  return notes;
}

const TOPIC_FALLBACK: Record<Topic, (loc: string) => string> = {
  outdoor: (loc) => `Mornings look clearest near ${loc} today — conditions get less predictable after 4 PM.`,
  fitness: (loc) => `6:00–7:30 AM is generally the calmest window near ${loc} today.`,
  commute: (loc) => `Rain is likely 4–7 PM near ${loc}, which could affect travel times.`,
  air: (loc) => `Air quality near ${loc} is best in the morning, dipping a bit by afternoon.`,
  uv: (loc) => `UV peaks around 1 PM near ${loc} today — Very High. Limit exposure 11 AM–3 PM.`,
  clothing: (loc) => `Light layers work well near ${loc} today — mild morning, warmer midday.`,
  travel: (loc) => `Check conditions at your destination — near ${loc} itself, expect a mild start with rain later.`,
  allergy: (loc) => `Pollen levels near ${loc} are moderate today.`,
  rain: (loc) => `Rain is expected near ${loc} from around 4 PM onward — worth carrying an umbrella.`,
};

function buildResponse(
  input: string,
  personas: string[],
  healthSensitivities: string[],
  locationName: string,
  lastTopic: Topic | null
): { text: string; topic: Topic | null } {
  const q = input.toLowerCase();
  let topic = detectTopic(q);

  // Follow-up resolution: no topic detected but phrasing implies continuation
  if (!topic && lastTopic && FOLLOW_UP_HINTS.some((h) => q.includes(h))) {
    topic = lastTopic;
  }

  if (!topic) {
    const focusList = personas.length > 0 ? personas.join(", ") : "general weather";
    return {
      text: `I'm still learning that one! Based on your selected focus areas (${focusList}), try asking about outdoor plans, workouts, commute, air quality, UV, clothing, travel, or allergies — I can give you a personalized read for ${locationName}.`,
      topic: null,
    };
  }

  const notes = personaNotes(topic, personas, healthSensitivities, locationName);
  const base = TOPIC_FALLBACK[topic](locationName);
  const text = notes.length > 0 ? `${base} ${notes.map((n) => n.charAt(0).toUpperCase() + n.slice(1) + ".").join(" ")}` : base;

  return { text, topic };
}


export function ChatAssistant() {
  const { location, prefs } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hi! I'm your Mausam assistant. I can help with your plans today — from outdoor activities and fitness to air quality, UV, clothing, travel, allergies, and your commute.`,    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastTopic, setLastTopic] = useState<Topic | null>(null);
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
      const { text: reply, topic } = buildResponse(
        text,
        prefs.personas,
        prefs.healthSensitivities,
        location.name,
        lastTopic
      );
      setMessages((m) => [
      ...m,
      {
        id: `${Date.now()}-a`,
        role: "assistant",
        text: reply,
      },
      ]);
      setLastTopic(topic);
      setTyping(false);
    }, 800);
  }
  const chips = lastTopic ? FOLLOW_UPS[lastTopic] : PRIMARY_QUESTIONS;



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
            {chips.map((q) => (
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