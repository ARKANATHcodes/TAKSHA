"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Award, CheckCircle2, XCircle, ArrowRight, HelpCircle, LogOut } from "lucide-react";

// Sample Technical Engineering/Physics Question Bank
const QUESTION_BANK = [
  {
    id: 1,
    question: "What is the primary function of a Buck Converter in power electronics?",
    options: [
      "Step up DC voltage",
      "Step down DC voltage",
      "Convert AC to DC",
      "Filter high-frequency noise"
    ],
    correctAnswer: 1 // "Step down DC voltage"
  },
  {
    id: 2,
    question: "According to Boyle's Law, if the volume of a gas container is decreased at a constant temperature, what happens to the internal pressure?",
    options: [
      "The pressure decreases proportionally",
      "The pressure remains completely unchanged",
      "The pressure increases",
      "The pressure drops instantly to zero"
    ],
    correctAnswer: 2 // "The pressure increases"
  },
  {
    id: 3,
    question: "Which component is strictly used to provide high rupturing capacity (HRC) short-circuit protection in power distribution boards?",
    options: [
      "Zener Diode",
      "HRC Fuse",
      "Step-down Transformer",
      "Buck Inductor"
    ],
    correctAnswer: 1 // "HRC Fuse"
  }
];

export default function QuizPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Quiz Engine States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);

  // Auth Protection Lock
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: activeUser } } = await supabase.auth.getUser();
        if (!activeUser) {
          window.location.href = "/login";
        } else {
          setUser(activeUser);
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", activeUser.id)
            .single();
          if (prof) setProfile(prof);
        }
      } catch (err) {
        console.error("Quiz auth error:", err);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return; // Lock inputs once evaluated
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    const currentQuestion = QUESTION_BANK[currentQuestionIndex];
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = async () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIndex + 1 < QUESTION_BANK.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizComplete(true);
      await saveQuizProgress();
    }
  };

  // Sync Quiz Completion reward back to Supabase Profiles Table
  const saveQuizProgress = async () => {
    if (!user) return;
    setSavingLoading(true);
    try {
      // Calculate reward criteria (e.g., if they passed with 2 or more correct)
      const updatedModulesCount = (profile?.completed_modules || 0) + 1;
      const updatedLevel = (profile?.level || 1) + 1; // Level up!

      const { error } = await supabase
        .from("profiles")
        .update({ 
          completed_modules: updatedModulesCount,
          level: updatedLevel
        })
        .eq("id", user.id);

      if (!error) {
        setProfile((prev: any) => ({ 
          ...prev, 
          completed_modules: updatedModulesCount,
          level: updatedLevel
        }));
      }
    } catch (err) {
      console.error("Error updating quiz scores:", err);
    } finally {
      setSavingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const currentQuestion = QUESTION_BANK[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* Header Banner Navigation */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/profile"}>
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
            T
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            TAKSHA v2.0 • Quiz Hub
          </span>
        </div>
        <button 
          onClick={() => window.location.href = "/profile"}
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Return to Dashboard →
        </button>
      </header>

      {/* Main Play Area */}
      <main className="max-w-3xl mx-auto p-6 md:p-12">
        {!quizComplete ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            {/* Progress indicator */}
            <div className="flex justify-between items-center text-sm text-slate-400">
              <span className="font-semibold text-indigo-400">Question {currentQuestionIndex + 1} of {QUESTION_BANK.length}</span>
              <span>Running Score: {score}</span>
            </div>

            {/* Question Text */}
            <div className="flex gap-3 items-start">
              <HelpCircle className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white tracking-tight leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Multiple Choice Selection Grid */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((option, idx) => {
                let optionStyle = "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-950/80";
                
                if (selectedOption === idx) {
                  optionStyle = "border-indigo-500 bg-indigo-500/10 text-indigo-300";
                }
                
                if (isAnswered) {
                  if (idx === currentQuestion.correctAnswer) {
                    optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold";
                  } else if (selectedOption === idx) {
                    optionStyle = "border-red-500 bg-red-500/10 text-red-400";
                  } else {
                    optionStyle = "border-slate-800 opacity-40 text-slate-500";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-150 flex items-center justify-between ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && idx === currentQuestion.correctAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    {isAnswered && selectedOption === idx && idx !== currentQuestion.correctAnswer && <XCircle className="h-4 w-4 text-red-400" />}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons footer */}
            <div className="pt-4 flex justify-end">
              {!isAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-3 bg-indigo-600 disabled:opacity-40 disabled:hover:bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-indigo-600/10 flex items-center gap-2"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all duration-150 flex items-center gap-2"
                >
                  <span>{currentQuestionIndex + 1 === QUESTION_BANK.length ? "Finish Quiz" : "Next Question"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* QUIZ SUMMARY REPORT VIEW */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Award className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Module Completed!</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                You successfully completed the engineering assignment and scored <span className="text-emerald-400 font-bold">{score} / {QUESTION_BANK.length}</span> correct answers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 max-w-xs mx-auto text-xs text-slate-400 space-y-1">
              <div>🏆 Completed Modules Status: <span className="text-slate-200 font-medium">+{savingLoading ? "..." : "1 Task"}</span></div>
              <div>⚡ Profile Student Level Up: <span className="text-indigo-400 font-medium">Level {profile?.level || "Next"}</span></div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  setQuizComplete(false);
                }}
                className="px-5 py-3 border border-slate-800 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all duration-150"
              >
                Retake Revision Quiz
              </button>
              <button
                onClick={() => window.location.href = "/profile"}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-all duration-150 shadow-md shadow-indigo-600/10"
              >
                Go to Profile Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}