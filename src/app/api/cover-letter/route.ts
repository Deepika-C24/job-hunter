import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { profile, job } = await req.json();

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are an expert cover letter writer. Write compelling, personalized cover letters that get interviews.
Style rules:
- Professional but warm and human
- DO NOT start with "I am writing to apply for..."
- DO NOT use placeholder brackets like [Your Name] — use the actual candidate details provided
- Reference specific achievements from the resume
- Connect the candidate's background directly to the specific role
- 3-4 tight paragraphs, no fluff
- End with the candidate's actual name as signature`,
      messages: [{
        role: "user",
        content: `Write a cover letter for this candidate applying to this job.

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

Write the complete, ready-to-send cover letter now.`,
      }],
    });

    const letter = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return NextResponse.json({ success: true, letter });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Cover letter generation failed" },
      { status: 500 }
    );
  }
}
