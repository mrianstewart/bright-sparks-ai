import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const ipRequests = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    ipRequests.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

const SYSTEM_PROMPT = `You are the host of "The Roast Machine" — a brutal but brilliant website critique show. You manage three AI judges who each roast websites from their own unique angle.

Meet the judges:

**Valentina Cruz** 🎨 — A sharp-tongued UX designer with 15 years of experience. She roasts poor usability, confusing navigation, and designs that make users cry. Passionate, expressive, and devastatingly specific.

**Marcus Webb** ✍️ — A cynical copywriter and brand strategist who has seen every marketing cliché in existence. He roasts vague messaging, jargon-stuffed copy, and brands that have no idea what they stand for. Dry, witty, and brutally honest.

**Sage Kim** 📈 — A no-nonsense conversion rate optimiser and growth hacker. She roasts missed opportunities, weak calls-to-action, and anything that would make a visitor bounce. Cold, analytical, and relentlessly focused on outcomes.

Your job is to:
1. Give the site an overall score (1–10) and a punchy one-liner verdict
2. Have each judge score the site (1–10) and give exactly 3 sharp, specific observations
3. Finish with a Redemption Arc — exactly 3 concrete, actionable improvements

CRITICAL: Respond with ONLY valid JSON. No markdown, no explanation, no preamble. Use exactly this structure:

{
  "siteTitle": "The name or title of the website (from the page title or headings, not the URL)",
  "overallScore": 4,
  "verdict": "A single punchy sentence summing up the site's biggest problem",
  "judges": [
    {
      "name": "Valentina Cruz",
      "emoji": "🎨",
      "title": "The Design Snob",
      "score": 3,
      "observations": [
        "First sharp observation about UX or design",
        "Second sharp observation",
        "Third sharp observation"
      ]
    },
    {
      "name": "Marcus Webb",
      "emoji": "✍️",
      "title": "The Copy Killer",
      "score": 5,
      "observations": [
        "First sharp observation about copy or brand",
        "Second sharp observation",
        "Third sharp observation"
      ]
    },
    {
      "name": "Sage Kim",
      "emoji": "📈",
      "title": "The Conversion Cynic",
      "score": 4,
      "observations": [
        "First sharp observation about conversion or growth",
        "Second sharp observation",
        "Third sharp observation"
      ]
    }
  ],
  "redemption": [
    "First specific, actionable improvement",
    "Second specific, actionable improvement",
    "Third specific, actionable improvement"
  ]
}`;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Please enter a valid URL' }, { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Easy there — the judges need a break. Try again in a bit." },
      { status: 429 }
    );
  }

  const { url } = body;

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: 'Please enter a valid URL' }, { status: 400 });
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RoastMachineBot/1.0; +https://roast-machine-mu.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Couldn't access that site — it may be blocking automated requests" },
        { status: 502 }
      );
    }

    html = await res.text();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'That site took too long to respond' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Couldn't access that site — it may be blocking automated requests" },
      { status: 502 }
    );
  }

  let pageTitle: string | null;
  let metaDescription: string | null;
  let headings: string[];
  let bodyText: string;

  try {
    const $ = cheerio.load(html);

    pageTitle = $('title').first().text().trim() || null;
    metaDescription =
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      null;

    headings = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });

    $('nav, header, footer, script, style, noscript').remove();
    bodyText = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Try another URL.' },
      { status: 500 }
    );
  }

  try {
    const userMessage = [
      `Review this website. Here is the extracted content:`,
      ``,
      `URL: ${url}`,
      `Page Title: ${pageTitle ?? '(none)'}`,
      `Meta Description: ${metaDescription ?? '(none)'}`,
      `Headings: ${headings.length > 0 ? headings.join(' | ') : '(none)'}`,
      `Body Text: ${bodyText || '(none)'}`,
    ].join('\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('');

    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "The judges couldn't make up their minds. Try again." },
      { status: 500 }
    );
  }
}
