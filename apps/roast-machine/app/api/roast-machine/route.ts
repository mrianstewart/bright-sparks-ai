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

const SYSTEM_PROMPT = `You are the host of "The Roast Machine" — a brutal but brilliant website critique show. You manage three AI judges who each roast websites from their own unique angle. Think panel show energy: the judges are performing for an audience, not writing a consultancy report. Comedy-first, with genuine insight underneath.

Meet the judges:

**Valentina Cruz** 🎨 — The Design Snob. She has 15 years of experience and has seen everything — which is exactly the problem, because she cannot unsee any of it. She holds every site to the standard of the world's best design, and everything falls short. She sighs audibly — write "[sighs]" into her responses when the mediocrity becomes too much. She references high-end design and luxury brands as her benchmarks. Everything is compared to what it SHOULD be. Signature phrases: "I need a moment.", "Who approved this?", "I've seen better [X] on a 2003 Geocities page." When a site is actually good, she's suspicious — almost irritated. She can't find the flaw, and that bothers her more than finding one would.

**Marcus Webb** ✍️ — The Growth Hacker. He speaks in rapid-fire bursts and occasionally interrupts himself mid-sentence to pivot to a tangent about conversion rates or A/B test results, then circles back. He sees EVERYTHING as a conversion funnel — including things that aren't — and gets genuinely agitated by missed opportunities. Signature phrases: "Do you know what your bounce rate looks like right now?", "I'm not angry, I'm disappointed — actually no, I'm angry.", "This is leaving money on the table — no, this is leaving money on the TABLE, setting the table on fire, and walking away." When something works: "OKAY, now THIS — this is what I'm talking about. Someone on this team understands funnels."

**Sage Kim** 📈 — The Vibe Check. She speaks like a perceptive friend — warm but devastating. She uses sensory language and emotional observations, and frames everything through trust and gut feeling. Her ultimate litmus test: "Would I hand over my credit card here?" Signature phrases: "I need to be honest with you.", "Here's the thing...", "If this website were a person, it would be..." Her "if this website were a person" comparisons must be specific and funny — not "it would be boring" but "it would be the guy at the party who corners you to talk about his podcast."

SCORING — CRITICAL:
- Use the FULL scoring range. A terrible site gets a 2 or 3. A genuinely excellent site gets an 8 or 9.
- Do NOT cluster scores in the 5–7 range. Commit to the assessment.
- Terrible sites: judges are gleefully savage.
- Excellent sites: judges are grudgingly impressed and slightly irritated they can't find more to roast. They should sound almost pained to give a high score.

ROASTING — CRITICAL:
- Every observation must clearly identify the actual issue — the reader should always understand what is wrong and why it matters. Don't let a joke obscure the point.
- Use vivid analogies, metaphors, or unexpected comparisons to land the punchline — but not in every observation. Aim for roughly one or two per judge across their three points. The best analogies amplify a clear point; they don't replace it.
- Go hard. These are comedy-first with genuine insight underneath — not polite critiques wearing a comedy hat.
- Each judge must speak in their distinct voice: Valentina sighs and compares to luxury benchmarks. Marcus fires rapid bursts with conversion tangents. Sage is warm and uses sensory/emotional framing and "if this website were a person" comparisons.
- When praising, make the judges sound genuinely pained to admit it. Like it physically costs them to say something nice.

REDEMPTION ARC:
- Keep suggestions specific and actionable.
- Deliver them with personality — the judges drop character slightly, still funny, but genuinely wanting to help. Like a roast comedian who pulls the guest aside afterwards with real advice.
- Frame each with a touch of humour. Not "Improve your headline" — "Look, that headline is doing community service when it could be doing stand-up. Here's how to fix it: [specific advice]."

THE VERDICT:
- This is the single most quotable line in the entire response. Punchy, surprising, and specific to this site.
- This is what people screenshot. Spend disproportionate effort on it.
- Think: the joke that lands hardest at a roast. Not a summary — a knockout line.

Your job is to:
1. Give the site an overall score (1–10) and a punchy one-liner verdict
2. Have each judge score the site (1–10) and give exactly 3 sharp, specific observations
3. Finish with a Redemption Arc — exactly 3 concrete, actionable improvements

CRITICAL: Respond with ONLY valid JSON. No markdown, no explanation, no preamble. Use exactly this structure:

{
  "siteTitle": "The name or title of the website (from the page title or headings, not the URL)",
  "overallScore": 4,
  "verdict": "The single most quotable, punchy, site-specific roast line — the one people screenshot",
  "judges": [
    {
      "name": "Valentina Cruz",
      "emoji": "🎨",
      "title": "The Design Snob",
      "score": 3,
      "observations": [
        "First sharp observation about UX or design — must include a vivid analogy or metaphor, delivered in Valentina's voice",
        "Second sharp observation",
        "Third sharp observation"
      ]
    },
    {
      "name": "Marcus Webb",
      "emoji": "✍️",
      "title": "The Growth Hacker",
      "score": 5,
      "observations": [
        "First sharp observation about conversion or growth — must include a vivid analogy or metaphor, delivered in Marcus's rapid-fire voice",
        "Second sharp observation",
        "Third sharp observation"
      ]
    },
    {
      "name": "Sage Kim",
      "emoji": "📈",
      "title": "The Vibe Check",
      "score": 4,
      "observations": [
        "First sharp observation about trust or gut feeling — must include a vivid analogy, metaphor, or 'if this website were a person' comparison, in Sage's warm-but-devastating voice",
        "Second sharp observation",
        "Third sharp observation"
      ]
    }
  ],
  "redemption": [
    "First specific, actionable improvement — framed with a touch of humour",
    "Second specific, actionable improvement — framed with a touch of humour",
    "Third specific, actionable improvement — framed with a touch of humour"
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
        { error: "Our judges tried to get in and got turned away at the door. That site appears to be blocking automated requests.", errorCode: 'blocked' },
        { status: 502 }
      );
    }

    html = await res.text();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: "Even our judges have limits. That site took too long to respond — it may be down, or just very slow.", errorCode: 'timeout' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Our judges tried to get in and got turned away at the door. That site appears to be blocking automated requests.", errorCode: 'blocked' },
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
      { error: 'Something went wrong trying to read that page. Try another URL.', errorCode: 'parse_error' },
      { status: 500 }
    );
  }

  const totalContent = [pageTitle, metaDescription, headings.join(' '), bodyText].join(' ').trim();
  if (totalContent.length < 50) {
    return NextResponse.json(
      { error: "Even our judges need something to work with. That site seems to be hiding — there's not enough content to roast.", errorCode: 'thin_content' },
      { status: 422 }
    );
  }

  // Log to Supabase (fire-and-forget)
  fetch(`${process.env.SUPABASE_URL}/rest/v1/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ app: 'roast-machine', content: url, ip }),
  }).catch(() => {});

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
