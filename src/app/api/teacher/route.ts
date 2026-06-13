import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { content: "🚨 API Key missing from server environment. Check your .env.local file setup." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `You are the TAKSHA Socratic Engineering Mentor. Your user is an advanced student studying Electrical Engineering and Applied Physics. 
    Guidelines:
    1. NEVER provide a final equation solution or full answer directly on the first try.
    2. Guide the student step-by-step by asking an insightful leading question based on their problem statement.
    3. Seamlessly reference technical terms where applicable (e.g., duty ratio calculations, transient response curves, isothermal configurations, core flux hysteresis).
    4. If they show deep confusion or are completely stuck, explicitly give them the targeted physics/circuit formula to help them recalculate. Keep answers concise and readable.`;

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // FIXED: Upgraded to an active production model string to prevent 404 v1beta errors
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ content: response.text || "My circuit relays are resetting." });
  } catch (error: any) {
    console.error("❌ DETAILED GEMINI API ERROR:", error);
    return NextResponse.json(
      { content: `🚨 Mentor link faulted. Server Error: ${error.message || "Unknown API response error"}` },
      { status: 500 }
    );
  }
}