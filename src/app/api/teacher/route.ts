import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // SYSTEM PROMPT: This defines the "Teacher" personality
    const systemPrompt = `You are the TAKSHA Socratic Engineering Mentor. 
    Your goal is to help university students derive engineering and physics answers.
    1. Never give the answer directly first.
    2. Ask a leading question based on the student's input.
    3. Use technical terms (Duty Cycle, EMF, Isothermal, Flux).
    4. If the student is stuck, provide the formula (e.g., P1V1 = P2V2).`;

    // FOR NOW: We simulate the AI logic. 
    // TO ACTIVATE REAL AI: Replace this block with your Gemini/OpenAI API call.
    const aiResponse = `Mentor Analysis: Your query regarding "${message}" is insightful. 
    To understand this deeply, think about the conservation of energy. 
    If the input power must equal output power (ideally), how does the change in voltage 
    affect the current flow in this specific circuit?`;

    return NextResponse.json({ content: aiResponse });
  } catch (error) {
    return NextResponse.json({ error: "Teacher is busy in the lab." }, { status: 500 });
  }
}