import { NextRequest, NextResponse } from 'next/server';

const KIT_FORM_ID = '9323553';

export async function POST(req: NextRequest) {
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
    await fetch(
      `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email_address: email }).toString(),
      }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'network_error' }, { status: 502 });
  }
}
