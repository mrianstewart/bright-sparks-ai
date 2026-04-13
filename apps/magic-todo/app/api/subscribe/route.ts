import { NextRequest, NextResponse } from 'next/server';

const KIT_FORM_ID = '16d1f4fac6';

export async function POST(req: NextRequest) {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: 'missing_email' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscribers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ email_address: email }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Kit API error:', res.status, text);
      return NextResponse.json({ error: 'subscription_failed' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'network_error' }, { status: 502 });
  }
}
