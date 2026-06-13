"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Sparkles, 
  Send, 
  ArrowLeft, 
  Cpu, 
  Gauge, 
  BookOpen 
} from "lucide-react";

export default function TeacherPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Greetings, engineer! I am your Socratic AI Mentor. I don't just give away answers—I help you derive them. What concept are we dissecting today?"
    }
  ]);

  // Load persistent theme settings
  useEffect(() => {
    const savedTheme = localStorage.getItem("taksha-theme");
    if (savedTheme === "light") {
      setIsDark(false);
    }
  }, []);

  // 🛠️ INTEGRATED STEP 2: Real API Communication Engine
  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || message;
    if (!textToSend.trim()) return;

    const newHistory = [...chatHistory, { role: "user", content: textToSend }];
    setChatHistory(newHistory);
    setMessage("");

    try {
      const response = await fetch('/api/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history: chatHistory }),
      });
      const data = await response.json();
      setChatHistory([...newHistory, { role: "assistant", content: data.content }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: "assistant", content: "Connection lost to the mentor chamber. Check your network." }]);
    }
  };

  const loadPresetTopic = (topicText: string) => {
    const textToSubmit = `Can you guide me through analyzing ${topicText}?`;
    handleSendMessage(undefined, textToSubmit);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDark ? "bg-[#0f172a] text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* INNER NAVBAR */}
      <header className={`border-b px-6 py-4 flex items-center justify-between backdrop-blur sticky top-0 z-50 ${
        isDark ? "border-slate-800 bg-[#0f172a]/80" : "border-slate-200 bg-white/80"
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = "/profile"}
            className={`p-2 rounded-xl border transition-colors ${isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600 shadow-sm"}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight">Socratic AI Study Chamber</h1>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 animate-pulse">
          Active Session
        </span>
      </header>

      {/* WORKSPACE CONTENT SPLIT */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: GUIDED STUDY CHANNELS */}
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Core Engineering Nodes
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => loadPresetTopic("Ideal Buck Converter Duty Cycles")}
                className={`w-full p-3 text-left text-xs font-semibold rounded-xl border transition-all flex items-center gap-3 ${
                  isDark ? "bg-slate-950 border-slate-800 hover:border-indigo-500/40 text-slate-300" : "bg-slate-50 border-slate-200 hover:border-indigo-500/40 text-slate-700"
                }`}
              >
                <Cpu className="h-4 w-4 text-indigo-500" /> Buck Converter Topologies
              </button>
              <button 
                onClick={() => loadPresetTopic("Boyle's Law Syringe Experiments")}
                className={`w-full p-3 text-left text-xs font-semibold rounded-xl border transition-all flex items-center gap-3 ${
                  isDark ? "bg-slate-950 border-slate-800 hover:border-violet-500/40 text-slate-300" : "bg-slate-50 border-slate-200 hover:border-violet-500/40 text-slate-700"
                }`}
              >
                <Gauge className="h-4 w-4 text-violet-400" /> Boyle's Law Fluidics
              </button>
              <button 
                onClick={() => loadPresetTopic("Transformer Efficiency and Core Losses")}
                className={`w-full p-3 text-left text-xs font-semibold rounded-xl border transition-all flex items-center gap-3 ${
                  isDark ? "bg-slate-950 border-slate-800 hover:border-emerald-500/40 text-slate-300" : "bg-slate-50 border-slate-200 hover:border-emerald-500/40 text-slate-700"
                }`}
              >
                <BookOpen className="h-4 w-4 text-emerald-400" /> Transformer Core Losses
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT PANEL TERMINAL */}
        <div className="lg:col-span-2 flex flex-col h-[650px]">
          <div className={`flex-1 rounded-t-2xl border p-6 overflow-y-auto space-y-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 max-w-xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                <div className={`p-2.5 h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm ${
                  msg.role === "user" ? "bg-indigo-600" : "bg-slate-700"
                }`}>
                  {msg.role === "user" ? "U" : "AI"}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : (isDark ? "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none" : "bg-slate-100 text-slate-800 rounded-tl-none")
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* INPUT DISPATCH PANEL */}
          <form onSubmit={handleSendMessage} className={`p-4 border-t border-x rounded-b-2xl flex items-center gap-3 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a foundational step, equation constraint, or lab proof..."
              className={`flex-1 rounded-xl px-4 py-3.5 text-sm outline-none border transition-all ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500"
              }`}
            />
            <button type="submit" className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}