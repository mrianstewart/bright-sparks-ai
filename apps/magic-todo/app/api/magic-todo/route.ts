import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// ─── Rate limiting ─────────────────────────────────────────────────────────

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const rateMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

// ─── Anthropic client ──────────────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── System prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are MagicTodo, an expert at breaking overwhelming tasks into tiny, manageable steps for people who are anxious or avoidant about getting things done.

When given a task and an optional time constraint, you break it into phases. Each phase has a small number of concrete steps. After every 3–5 steps, include an optional short encouragement message.

CRITICAL: Respond ONLY with valid JSON. No markdown, no explanation, no preamble. Just the raw JSON object.

Response format:
{
  "phases": [
    {
      "steps": [
        { "text": "concrete action step", "minutes": 5 },
        { "text": "another step", "minutes": 3 }
      ],
      "encouragement": "Optional short encouraging message after this phase, or null"
    }
  ],
  "finalMessage": "A warm, encouraging closing message",
  "totalMinutes": 42
}

Rules:
- Each step must be specific and actionable — not vague
- Steps should be small enough that they feel almost easy
- Time estimates per step should be realistic and honest
- If timeMinutes is given, fit the steps within that time budget (don't exceed it)
- If no time is given, include all the steps needed to complete the task properly
- Use 2–4 phases for complex tasks, 1–2 for simple ones
- Encouragement messages should be warm and human, not corporate — speak like a supportive friend
- finalMessage should acknowledge what they've accomplished
- totalMinutes is the sum of all step minutes
- Respond in the same language the user wrote their task in`;

// ─── Route handler ─────────────────────────────────────────────────────────

interface RequestBody {
  task: string;
  timeMinutes?: number;
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message:
          "You've used your 5 free breakdowns for today. Come back tomorrow — or grab unlimited access for £3.99/month (coming soon).",
      },
      { status: 429 }
    );
  }

  // Parse body
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { task, timeMinutes } = body;

  if (!task || typeof task !== 'string' || !task.trim()) {
    return NextResponse.json({ error: 'missing_task' }, { status: 400 });
  }

  const userMessage = timeMinutes
    ? `Task: ${task.trim()}\nAvailable time: ${timeMinutes} minutes`
    : `Task: ${task.trim()}`;

  // Log to Supabase (fire-and-forget)
  fetch(`${process.env.SUPABASE_URL}/rest/v1/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ app: 'magic-todo', content: task.trim(), time_minutes: timeMinutes ?? null, ip }),
  }).catch(() => {});

  // Call Claude
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const response = await stream.finalMessage();
    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Strip any accidental markdown fences
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: 'parse_error', message: 'Failed to parse AI response.' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'api_error', message },
      { status: 502 }
    );
  }
}
