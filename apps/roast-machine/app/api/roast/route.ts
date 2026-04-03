import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

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

  try {
    const $ = cheerio.load(html);

    const pageTitle = $('title').first().text().trim() || null;
    const metaDescription =
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      null;

    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });

    $('nav, header, footer, script, style, noscript').remove();
    const bodyText = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);

    return NextResponse.json({ pageTitle, metaDescription, headings, bodyText });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Try another URL.' },
      { status: 500 }
    );
  }
}
