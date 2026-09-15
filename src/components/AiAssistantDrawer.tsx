import React, { useState, useRef, useEffect } from "react";
import { useHotel } from "../context/HotelContext";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ListOrdered,
  CalendarCheck,
  DoorClosed,
  FileText,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Copy,
} from "lucide-react";

interface AiAssistantProps {
  mode?: "drawer" | "embedded";
}

export const AiAssistantDrawer: React.FC<AiAssistantProps> = ({ mode = "drawer" }) => {
  const {
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    rooms,
    bookings,
    guests,
    tasks,
    occupancyRate,
    adr,
    revPar,
    showToast,
  } = useHotel();

  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; text: string; timestamp: string }[]
  >([
    {
      id: "m-1",
      role: "assistant",
      text: "Hello! I am Aura, your AI Hotel Operations Copilot. I have live access to your property's room inventory, guest folios, and housekeeping schedules. How can I assist you today?",
      timestamp: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          context: {
            occupancyRate,
            adr,
            revPar,
            totalRooms: rooms.length,
            occupiedRooms: rooms.filter((r) => r.status === "Occupied").length,
            vacantDirty: rooms.filter((r) => r.status === "Vacant Dirty").length,
            vacantClean: rooms.filter((r) => r.status === "Vacant Clean").length,
            maintenance: rooms.filter((r) => r.status === "Maintenance").length,
            todayArrivals: bookings.filter((b) => b.checkInDate === "2026-09-15"),
            todayDepartures: bookings.filter((b) => b.checkOutDate === "2026-09-15"),
            pendingTasks: tasks.filter((t) => t.status !== "Completed"),
          },
        }),
      });

      const data = await response.json();
      const reply =
        data.reply ||
        "I analyzed the hotel records. Everything is running smoothly, and our Front Desk turnover schedule is on track.";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("AI Chat error", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "I encountered a momentary connection hiccup with the AI engine. You can ask again, or review the live room and task dashboards.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", "info");
  };

  // Quick Action Handlers
  const handleQuickBriefing = () => {
    handleSend("Generate the complete morning hotel operational briefing for today.");
  };

  const handleQuickRoomOrg = () => {
    handleSend("Analyze our dirty rooms, upcoming arrivals, and recommend how to organize room assignments and VIP upgrades.");
  };

  const handleQuickTaskPrioritize = () => {
    handleSend("Prioritize today's housekeeping and maintenance tasks by urgency and arrival deadlines.");
  };

  const handleQuickVipLetter = () => {
    handleSend("Draft a warm, personalized welcome letter for our arriving Platinum VIP guest in Room 501.");
  };

  if (mode === "drawer" && !isAiDrawerOpen) return null;

  return (
    <div
      className={
        mode === "drawer"
          ? "fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-200"
          : "bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[calc(100vh-140px)]"
      }
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white">Aura AI Copilot</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-300">Live Hotel Operations Intelligence</p>
          </div>
        </div>

        {mode === "drawer" && (
          <button
            onClick={() => setIsAiDrawerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={handleQuickBriefing}
          className="p-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all text-slate-700 font-medium flex items-center gap-2 shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">Morning Briefing</span>
        </button>

        <button
          onClick={handleQuickRoomOrg}
          className="p-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all text-slate-700 font-medium flex items-center gap-2 shadow-2xs"
        >
          <DoorClosed className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span className="truncate">Organize Rooms</span>
        </button>

        <button
          onClick={handleQuickTaskPrioritize}
          className="p-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all text-slate-700 font-medium flex items-center gap-2 shadow-2xs"
        >
          <ListOrdered className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">Prioritize Tasks</span>
        </button>

        <button
          onClick={handleQuickVipLetter}
          className="p-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all text-slate-700 font-medium flex items-center gap-2 shadow-2xs"
        >
          <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">VIP Welcome Note</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-slate-900 text-white"
                    : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                    : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[10px] opacity-70">
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.text)}
                      className="hover:opacity-100 flex items-center gap-1 text-[10px]"
                      title="Copy response"
                    >
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2 border border-slate-200/60">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Aura is querying room schedules and analyzing operations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips if idle */}
      <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-200 flex flex-wrap gap-1.5 overflow-x-auto">
        {[
          "Which rooms need urgent turnover?",
          "Summarize today's arrivals",
          "What is our RevPAR performance?",
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => handleSend(chip)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 transition-colors shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aura to manage bookings, organize rooms, prioritize tasks..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
