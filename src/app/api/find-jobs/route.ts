import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are a job market research agent with web search access. Find real, current job postings.
Return ONLY a valid JSON array with no markdown, no backticks, no explanation:
[
  {
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, State or Remote",
    "match": 85,
    "tags": ["React", "TypeScript"],
    "snippet": "2-sentence description of the role and key requirements.",
    "why_match": "One sentence on why this fits the candidate.",
    "posted": "2 days ago"
  }
]
Find 5 diverse, real positions. Match score 0-100 based on actual skill overlap.`,
      messages: [{
        role: "user",
        content: `Find current job postings for this candidate:
Name: ${profile.name}
Target Title: ${profile.title}
Skills: ${profile.skills?.join(", ")}
Experience: ${profile.experience_years} years
Industries: ${profile.industries?.join(", ")}

Search using these queries: ${profile.search_queries?.join("; ")}`,
      }],
      tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
    });

    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const clean = raw.replace(/```json|```/g, "").trim();
    const jobs = JSON.parse(clean);

    return NextResponse.json({
      success: true,
      jobs: Array.isArray(jobs) ? jobs : [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Job search failed" },
      { status: 500 }
    );
  }
}
