import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, pdfBase64 } = body;

    const systemPrompt = `You are an expert resume parser. Extract structured information and return ONLY valid JSON with no markdown, no backticks, no explanation.

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
}

search_queries: generate 3 specific job search queries tailored to this person's background.`;

    let message;

    if (pdfBase64) {
      message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            { type: "text", text: "Parse this resume and return the JSON." },
          ],
        }],
      });
    } else {
      message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Parse this resume:\n\n${text}`,
        }],
      });
    }

    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ success: true, profile: parsed });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Parse failed" },
      { status: 500 }
    );
  }
}
