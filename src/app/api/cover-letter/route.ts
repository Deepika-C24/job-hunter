import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { profile, job } = await req.json();

    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are an expert cover letter writer. Write compelling, personalized cover letters that get interviews.
Rules:
- Professional but warm and human
- DO NOT start with "I am writing to apply for..."
- DO NOT use placeholder brackets — use actual candidate details
- Reference specific achievements from the resume
- 3-4 tight paragraphs, no fluff
- End with the candidate's actual name as signature`,
        },
        {
          role: "user",
          content: `Write a cover letter for this candidate:

CANDIDATE:
Name: ${profile.name}
Title: ${profile.title}
Years of experience: ${profile.experience_years}
Key skills: ${profile.skills?.slice(0, 8).join(", ")}
Highlights: ${profile.highlights?.join("; ")}
Education: ${profile.education}

JOB:
Role: ${job.title} at ${job.company}
Location: ${job.location}
Key requirements: ${job.tags?.join(", ")}
Description: ${job.snippet}
Why they match: ${job.why_match}

Write the complete cover letter now.`,
        },
      ],
    });

    const letter = message.choices[0]?.message?.content || "";
    return NextResponse.json({ success: true, letter });
  } catch (err) {
    console.error("❌ Cover letter error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Cover letter generation failed" },
      { status: 500 }
    );
  }
}
