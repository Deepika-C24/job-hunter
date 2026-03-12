import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();

    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are a job market expert. Based on a candidate profile, generate realistic relevant job postings.
Return ONLY a valid JSON array with no markdown, no backticks, no explanation:
[
  {
    "title": "Job Title",
    "company": "Real Company Name",
    "location": "City, State or Remote",
    "match": 85,
    "tags": ["React", "TypeScript"],
    "snippet": "2-sentence description of the role and key requirements.",
    "why_match": "One sentence on why this fits the candidate.",
    "posted": "2 days ago"
  }
]
Generate 5 realistic positions at real companies. Match score 0-100 based on skill overlap.`,
        },
        {
          role: "user",
          content: `Generate job postings for this candidate:
Name: ${profile.name}
Target Title: ${profile.title}
Skills: ${profile.skills?.join(", ")}
Experience: ${profile.experience_years} years
Industries: ${profile.industries?.join(", ")}
Search queries to inspire results: ${profile.search_queries?.join("; ")}`,
        },
      ],
    });

    const raw = message.choices[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const jobs = JSON.parse(clean);

    return NextResponse.json({
      success: true,
      jobs: Array.isArray(jobs) ? jobs : [],
    });
  } catch (err) {
    console.error("❌ Find jobs error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Job search failed" },
      { status: 500 }
    );
  }
}
