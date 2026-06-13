"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, CheckCircle2, XCircle, Zap, Beaker, Radio } from "lucide-react";

const engineeringQuestions = [
  {
    topic: "Transformers",
    question: "Why is a transformer rated in kVA instead of kW?",
    options: ["It depends on load power factor", "Eddy currents are constant", "Copper loss is negligible", "Voltage is always DC"],
    answer: 0,
    explanation: "Transformer losses depend on voltage (Core loss) and current (Copper loss), regardless of the phase angle (Power Factor)."
  },
  {
    topic: "Thermodynamics",
    question: "According to Boyle's Law, if volume is reduced by half at constant temp, pressure will:",
    options: ["Reduce by half", "Stay the same", "Double", "Become zero"],
    answer: 2,
    explanation: "P1V1 = P2V2. Since P is inversely proportional to V, halving volume doubles pressure."
  },
  {
    topic: "Power Electronics",
    question: "What is the duty cycle (D) of a Buck converter if Vin = 24V and Vout = 12V?",
    options: ["0.25", "0.50", "0.75", "1.00"],
    answer: 1,
    explanation: "D = Vout / Vin. Therefore, 12V / 24V = 0.5."
  }
];

export default function QuizPage() {
  const [isDark, setIsDark] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("taksha-theme");
    if (saved === "light") setIsDark(false);
  }, []);

  const handleAnswer = async (idx: number) => {
    setSelectedOpt(idx);
    let newScore = score;
    if (idx === engineeringQuestions[currentIdx].answer) newScore++;
    setScore(newScore);

    setTimeout(async () => {
      if (currentIdx < engineeringQuestions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelectedOpt(null);
      } else {
        setShowResult(true);
        // UPDATE SUPABASE LEVEL
        const { data: { user } } = await supabase.auth.getUser();
        if (user && newScore === engineeringQuestions.length) {
           await supabase.from('profiles').update({ level: 2 }).eq('id', user.id);
        }
      }
    }, 1000);
  };

  return (
    <div className={`min-h-screen p-6 transition-all ${isDark ? "bg-[#0f172a] text-white" : "bg-slate-50 text-slate-900"}`}>
      <header className="max-w-3xl mx-auto flex items-center justify-between mb-10">
        <button onClick={() => window.location.href = "/profile"} className="p-2 border rounded-xl hover:bg-indigo-500 hover:text-white transition-all"><ArrowLeft className="h-5 w-5"/></button>
        <h1 className="text-2xl font-black italic tracking-tighter text-indigo-500">QUIZ HUB v1.0</h1>
        <div className="text-xs font-bold px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">Step {currentIdx + 1} of 3</div>
      </header>

      <main className="max-w-3xl mx-auto">
        {!showResult ? (
          <div className={`p-8 rounded-3xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"}`}>
            <div className="flex items-center gap-2 mb-4">
               {currentIdx === 0 && <Zap className="h-4 w-4 text-amber-400"/>}
               {currentIdx === 1 && <Beaker className="h-4 w-4 text-emerald-400"/>}
               {currentIdx === 2 && <Radio className="h-4 w-4 text-violet-400"/>}
               <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{engineeringQuestions[currentIdx].topic}</span>
            </div>
            <h2 className="text-xl font-bold mb-8 leading-tight">{engineeringQuestions[currentIdx].question}</h2>
            
            <div className="grid gap-3">
              {engineeringQuestions[currentIdx].options.map((opt, i) => (
                <button
                  key={i}
                  disabled={selectedOpt !== null}
                  onClick={() => handleAnswer(i)}
                  className={`w-full p-4 rounded-2xl border text-left font-medium transition-all ${
                    selectedOpt === i 
                      ? (i === engineeringQuestions[currentIdx].answer ? "bg-emerald-500 border-emerald-400 text-white" : "bg-red-500 border-red-400 text-white")
                      : (isDark ? "bg-slate-950 border-slate-800 hover:border-indigo-500" : "bg-slate-50 border-slate-200 hover:border-indigo-500")
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="inline-flex p-6 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            <h2 className="text-4xl font-black">Assessment Complete</h2>
            <p className="text-slate-400">You scored {score} out of {engineeringQuestions.length}. {score === 3 ? "Your profile level has been upgraded!" : "Review your notes and try again."}</p>
            <button onClick={() => window.location.href = "/profile"} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">Return to Dashboard</button>
          </div>
        )}
      </main>
    </div>
  );
}