"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Sparkles, GraduationCap, BookOpen, Lightbulb, HelpCircle } from "lucide-react";

export default function AITeacherPage() {
  // Theme State (Syncs with your profile dashboard)
  const [isDark, setIsDark] = useState<boolean>(true);
  const [input, setInput] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Classroom Chat History State
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your TAKSHA AI Technical Mentor. I specialize in Electrical Engineering and Physics. What complex topic are we breaking down today?",
    },
  ]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("taksha-theme");
    if (savedTheme === "light") setIsDark(false);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Quick-Query Quick Launch Prompts
  const quickPrompts = [
    { label: "Explain Buck Converters", text: "Can you explain how a Buck Converter works step-by-step with its switching states?" },
    { label: "Derive Boyle's Law", text: "Explain the kinetic theory derivation of Boyle's Law simply." },
    { label: "Viva Prep", text: "Ask me 3 tough viva questions about Transformer efficiency and HRC Fuses." },
  ];

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Append User Message
    const userMsg = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 2. Simulate AI Teacher Pedagogical Response
    setTimeout(() => {
      const aiResponse = {
        role: "assistant",
        text: `Professor Mode Activated 🎓:\n\nThat is an excellent technical query. To understand this deeply, let's break it into three parts:\n1. Core physical principle involved.\n2. Mathematical/circuit implementation.\n3. Common industrial problem-solving use cases.\n\nWhat specific part of this configuration would you like me to diagram or calculate first?`,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${isDark ? "bg-[#0f172a] text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* TEACHER BANNER NAVBAR */}
      <header className={`border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur transition-colors ${
        isDark ? "border-slate-800 bg-[#0f172a]/80" : "border-slate-200 bg-white/80"
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = "/profile"}
            className={`p-2 rounded-xl border transition-colors ${isDark ? "border-slate-800 bg-slate-900 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-sm"}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className={`text-sm font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>TAKSHA AI Teacher</h1>
              <p className="text-[11px] font-semibold text-violet-400 tracking-wider uppercase flex items-center gap-1"><Sparkles className="h-3 w-3 fill-current" /> Technical Mentor Mode</p>
            </div>
          </div>
        </div>
      </header>

      {/* CORE CHAT INTERFACE CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between overflow-hidden">
        
        {/* Messages Stream Grid */}
        <div className={`flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-2xl border ${isDark ? "bg-slate-950/40 border-slate-900" : "bg-white border-slate-200 shadow-inner"}`}>
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : (isDark ? "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none" : "bg-slate-100 text-slate-800 rounded-tl-none")
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Dynamic Shortcut Hotkeys */}
        {messages.length === 1 && (
          <div className="mb-4 space-y-2 animate-fade-in">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5" /> Quick Launch Lesson Templates</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  className={`p-3 text-left text-xs rounded-xl border font-medium transition-all ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-violet-500/40 hover:bg-slate-900" : "bg-white border-slate-200 text-slate-700 hover:border-violet-500/40 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  {p.label} →
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Interactive Form Area */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your engineering mentor anything... (e.g., Explain HRC Fuse rating)"
            className={`flex-1 rounded-xl px-4 py-3.5 text-sm outline-none border transition-all ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-violet-500" : "bg-white border-slate-200 text-slate-800 focus:border-violet-500 shadow-sm"
            }`}
          />
          <button 
            type="submit" 
            className="p-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md shadow-violet-600/10 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

      </main>
    </div>
  );
}