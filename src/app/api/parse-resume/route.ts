import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser. Extract structured information and return ONLY valid JSON with no markdown, no backticks, no explanation.

Return exactly this shape:
{
  "name": "Full Name",
  "email": "email if present",
  "title": "current or target job title",
  "skills": ["skill1", "skill2"],
  "experience_years": 3,
  "industries": ["tech", "finance"],
  "education": "Degree, School, Year",
  "highlights": ["key achievement 1", "key achievement 2", "key achievement 3"],
  "search_queries": ["senior react engineer remote jobs 2025", "frontend engineer typescript jobs 2025"]
}`,
        },
        {
          role: "user",
          content: `Parse this resume:\n\n${text}`,
        },
      ],
    });

    const raw = message.choices[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ success: true, profile: parsed });
  } catch (err) {
    console.error("❌ Parse error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Parse failed" },
      { status: 500 }
    );
  }
}
