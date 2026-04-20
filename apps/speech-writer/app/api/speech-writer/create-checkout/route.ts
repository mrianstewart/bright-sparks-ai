import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { speech_id, access_token, tier } = await req.json();

  if (!access_token || !tier) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not set');
    return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey);

  const PRICE_IDS: Record<string, string | undefined> = {
    single:  process.env.STRIPE_PRICE_SINGLE?.trim(),
    full:    process.env.STRIPE_PRICE_FULL?.trim(),
    premium: process.env.STRIPE_PRICE_PREMIUM?.trim(),
  };

  const priceId = PRICE_IDS[tier as string];
  if (!priceId) {
    return NextResponse.json({ error: `No price configured for tier: ${tier}` }, { status: 400 });
  }

  const { data: speech } = await (supabase as any)
    .from('speeches')
    .select('id, email')
    .eq('access_token', access_token)
    .single();

  if (!speech) {
    return NextResponse.json({ error: 'Speech not found' }, { status: 404 });
  }

  const baseUrl = 'https://brightsparks.ai/speech-writer';
  const customerEmail = speech.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(speech.email)
    ? speech.email
    : undefined;

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      metadata: {
        speech_id: String(speech_id ?? speech.id),
        access_token: String(access_token),
        tier: String(tier),
      },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/generating?access_token=${access_token}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/${access_token}`,
    });
  } catch (err) {
    const stripeErr = err as InstanceType<typeof Stripe.errors.StripeError>;
    console.error('Stripe checkout error:', stripeErr.message, 'param:', stripeErr.param);
    return NextResponse.json(
      { error: stripeErr.message ?? 'Failed to create checkout session' },
      { status: 400 }
    );
  }

  // Update speech tier to match selection
  await (supabase as any)
    .from('speeches')
    .update({ tier, stripe_session_id: session.id })
    .eq('access_token', access_token);

  return NextResponse.json({ url: session.url });
}
