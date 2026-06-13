"use client";

import { useState } from "react";
import { BookOpen, Search, Eye, EyeOff, ArrowLeft, HelpCircle } from "lucide-react";

const FORMULA_DATA = [
  {
    id: 1,
    title: "Buck Converter Duty Cycle",
    category: "Power Electronics",
    formula: "D = V_out / V_in",
    description: "Calculates the required switch duty cycle for a step-down DC-DC buck converter assuming ideal components.",
    variables: ["D = Duty Cycle (Ratio)", "V_out = Output DC Voltage (V)", "V_in = Input DC Voltage (V)"]
  },
  {
    id: 2,
    title: "Boyle's Law Equation",
    category: "Applied Physics",
    formula: "P_1 * V_1 = P_2 * V_2",
    description: "States that the pressure of a given mass of an ideal gas is inversely proportional to its volume at a constant temperature.",
    variables: ["P_1, P_2 = Initial / Final Pressure (Pa)", "V_1, V_2 = Initial / Final Volume (m³)"]
  },
  {
    id: 3,
    title: "Transformer Turn Ratio",
    category: "Electrical Machinery",
    formula: "V_p / V_s = N_p / N_s = I_s / I_p",
    description: "Defines the relationship between primary and secondary voltages, turns, and currents in an ideal transformer.",
    variables: ["V_p, V_s = Primary / Secondary Voltage", "N_p, N_s = Number of Primary / Secondary Turns", "I_p, I_s = Primary / Secondary Current"]
  },
  {
    id: 4,
    title: "DC Generator EMF Equation",
    category: "Electrical Machinery",
    formula: "E = (Φ * Z * N * P) / (60 * A)",
    description: "Calculates the total induced electromotive force in the armature winding of a DC generator engine.",
    variables: ["Φ = Flux per pole (Wb)", "Z = Total number of conductors", "N = Speed in RPM", "P = Number of poles", "A = Number of parallel paths"]
  }
];

export default function FormulasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quizMode, setQuizMode] = useState(false);

  const categories = ["All", "Power Electronics", "Applied Physics", "Electrical Machinery"];

  // Filter formulas based on search inputs and chosen tab category
  const filteredFormulas = FORMULA_DATA.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/profile"}>
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
            T
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            TAKSHA v2.0 • Cheat Sheets
          </span>
        </div>
        <button 
          onClick={() => window.location.href = "/profile"}
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </button>
      </header>

      {/* Main Structural Space */}
      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
        
        {/* Controls Layout: Search bar & Interactive Quiz Mode Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search formulas or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
            />
          </div>

          <button
            onClick={() => setQuizMode(!quizMode)}
            className={`w-full md:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
              quizMode 
                ? "bg-violet-500/10 border-violet-500/30 text-violet-400" 
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {quizMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{quizMode ? "Quiz Mode: ON" : "Turn On Quiz Mode"}</span>
          </button>
        </div>

        {/* Category Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Formula Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFormulas.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              No matching cheat sheets or formulas discovered.
            </div>
          ) : (
            filteredFormulas.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/60 transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-950 border border-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
                </div>

                {/* Mathematical Equation Display Box */}
                <div className="my-6 p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center text-center font-mono font-bold text-lg select-all">
                  {quizMode ? (
                    <span className="text-violet-400/30 tracking-widest select-none bg-violet-500/5 px-4 py-1 rounded border border-dashed border-violet-500/20 text-sm">
                      [ Equation Hidden • Recall Formula ]
                    </span>
                  ) : (
                    <span className="text-indigo-400 tracking-wide">{item.formula}</span>
                  )}
                </div>

                {/* Variable Breakdown Meta fields */}
                <div className="border-t border-slate-800/60 pt-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Variable Legend:</span>
                  {item.variables.map((v, i) => (
                    <p key={i} className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                      <span className="h-1 w-1 bg-indigo-500 rounded-full"></span>
                      {v}
                    </p>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}