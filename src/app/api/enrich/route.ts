import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CompanyModel } from "@/lib/models/Company";

export const maxDuration = 60;

const JINA_API_KEY = process.env.JINA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function scrapeUrl(
  url: string,
): Promise<{ content: string; title: string }> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Return-Format": "markdown",
    "X-Timeout": "15",
  };
  if (JINA_API_KEY) headers["Authorization"] = `Bearer ${JINA_API_KEY}`;

  const res = await fetch(jinaUrl, {
    headers,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Scrape failed: ${res.status}`);
  const data = await res.json();
  return {
    content: data.data?.content || data.content || "",
    title: data.data?.title || url,
  };
}

async function extractWithGroq(
  content: string,
  thesis?: string,
): Promise<Record<string, unknown>> {
  const thesisSection = thesis
    ? `\n\nFUND THESIS:\n${thesis}\n\nAlso compute thesisScore (1-100), thesisExplanation, matchedCriteria[], missingCriteria[].`
    : "";

  const prompt = `Analyze the following company website content and extract structured information.

CONTENT:
${content.slice(0, 12000)}
${thesisSection}

Respond ONLY with valid JSON:
{
  "summary": "1-2 sentence company summary",
  "whatTheyDo": ["bullet 1", "bullet 2", "bullet 3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "derivedSignals": [
    { "signal": "signal title", "evidence": "evidence from content", "type": "growth|technical|market|team|other" }
  ]${
    thesis
      ? `,
  "thesisScore": 75,
  "thesisExplanation": "explanation of score",
  "matchedCriteria": ["matched criterion"],
  "missingCriteria": ["missing criterion"]`
      : ""
  }
}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a VC analyst. Respond only with valid JSON. No markdown, no backticks, no preamble.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function extractWithGemini(
  content: string,
  thesis?: string,
): Promise<Record<string, unknown>> {
  const thesisSection = thesis
    ? `\n\nFUND THESIS (for scoring):\n${thesis}\n\nAlso provide a thesisScore (1-100 integer) and thesisExplanation (2-3 sentences). matchedCriteria and missingCriteria arrays.`
    : "";

  const prompt = `You are a VC analyst. Analyze the following company website content and extract structured information.

CONTENT:
${content.slice(0, 12000)}
${thesisSection}

Respond ONLY with valid JSON matching this exact schema:
{
  "summary": "1-2 sentence company summary",
  "whatTheyDo": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7"],
  "derivedSignals": [
    { "signal": "signal title", "evidence": "what in the content suggests this", "type": "growth|technical|market|team|other" }
  ]${
    thesis
      ? `,
  "thesisScore": 75,
  "thesisExplanation": "explanation of score",
  "matchedCriteria": ["criterion that matches"],
  "missingCriteria": ["criterion not evidenced"]`
      : ""
  }
}

Rules:
- whatTheyDo: 3-6 concise bullets describing what the company does
- keywords: 5-10 relevant technology/market keywords
- derivedSignals: 2-4 signals INFERRED from the content (e.g. "Active hiring", "Recent changelog", "Developer-focused messaging")
- Be specific and factual, not generic`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 1500,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(text);
}

async function extractWithOpenAI(
  content: string,
  thesis?: string,
): Promise<Record<string, unknown>> {
  const thesisSection = thesis
    ? `\n\nFUND THESIS:\n${thesis}\n\nAlso compute thesisScore (1-100), thesisExplanation, matchedCriteria[], missingCriteria[].`
    : "";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a VC analyst. Extract structured company data. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: `Analyze:\n${content.slice(0, 12000)}${thesisSection}\n\nJSON schema: { summary, whatTheyDo[], keywords[], derivedSignals[{signal,evidence,type}]${thesis ? ", thesisScore, thesisExplanation, matchedCriteria[], missingCriteria[]" : ""} }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, url, thesis, thesisId, thesisName } = await req.json();
    if (!companyId || !url) {
      return NextResponse.json({ error: "companyId and url required" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await CompanyModel.findById(companyId).lean() as any;

    // Check history cache — match by thesisId (or null for no-thesis enrichments)
    const cachedRecord = existing?.enrichmentHistory?.find((r: any) =>
      thesisId ? r.thesis?.id === thesisId : r.thesis === null
    );

    if (cachedRecord) {
      return NextResponse.json({
        enrichment: cachedRecord.enrichment,
        thesisScore: cachedRecord.score ?? null,
        record: cachedRecord,
        enrichmentHistory: existing.enrichmentHistory,
        cached: true,
      });
    }

    // Scrape
    const { content, title } = await scrapeUrl(url);
    if (!content || content.length < 100) {
      return NextResponse.json({ error: "Could not extract meaningful content from URL" }, { status: 422 });
    }

    // Extract — Groq primary, Gemini secondary, OpenAI fallback
    let extracted: Record<string, unknown>;
    if (GROQ_API_KEY) {
      extracted = await extractWithGroq(content, thesis);
    } else if (GEMINI_API_KEY) {
      extracted = await extractWithGemini(content, thesis);
    } else if (OPENAI_API_KEY) {
      extracted = await extractWithOpenAI(content, thesis);
    } else {
      return NextResponse.json({ error: "No AI API key configured" }, { status: 500 });
    }

    const now = new Date().toISOString();

    const enrichment = {
      summary: extracted.summary || "",
      whatTheyDo: extracted.whatTheyDo || [],
      keywords: extracted.keywords || [],
      derivedSignals: extracted.derivedSignals || [],
      sources: [{ url, title, scrapedAt: now }],
      enrichedAt: now,
    };

    const thesisScore = thesis && extracted.thesisScore != null
      ? {
          score: extracted.thesisScore,
          explanation: extracted.thesisExplanation || "",
          matchedCriteria: extracted.matchedCriteria || [],
          missingCriteria: extracted.missingCriteria || [],
          generatedAt: now,
        }
      : null;

    // Build history record
    const record = {
      id: crypto.randomUUID(),
      thesis: thesisId ? { id: thesisId, name: thesisName } : null,
      score: thesisScore,
      enrichment,
      createdAt: now,
    };

    // FIX: all non-operator fields must be inside $set alongside $push
    const $set: Record<string, unknown> = { enrichment };
    if (thesisScore) $set.thesisScore = thesisScore;

    // FIX: idempotency guard — re-check before writing to prevent Strict Mode double-writes
    const preWrite = await CompanyModel.findById(companyId).lean() as any;
    const alreadyExists = preWrite?.enrichmentHistory?.some((r: any) =>
      thesisId ? r.thesis?.id === thesisId : r.thesis === null
    );

    if (!alreadyExists) {
      await CompanyModel.findByIdAndUpdate(companyId, {
        $set,
        $push: { enrichmentHistory: record },
      });
    }

    // Fetch updated document to return full history
    const updated = await CompanyModel.findById(companyId).lean() as any;

    return NextResponse.json({
      enrichment,
      thesisScore,
      record,
      enrichmentHistory: updated?.enrichmentHistory ?? [],
      cached: false,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Enrich error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}