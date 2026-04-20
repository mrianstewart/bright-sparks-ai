import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const access_token = req.nextUrl.searchParams.get('access_token');
  const session_id = req.nextUrl.searchParams.get('session_id');

  if (!access_token) {
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });
  }

  const { data: speech } = await (supabase as any)
    .from('speeches')
    .select('id, stripe_payment_status, payment_completed_at, tier')
    .eq('access_token', access_token)
    .single();

  if (!speech) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Already confirmed via webhook
  if (speech.stripe_payment_status === 'paid' && speech.payment_completed_at != null) {
    return NextResponse.json({ paid: true, tier: speech.tier });
  }

  // Webhook hasn't arrived yet — check Stripe directly using session_id
  if (session_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY?.trim()!);
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === 'paid') {
        // Update the record ourselves so generation can proceed
        await (supabase as any)
          .from('speeches')
          .update({
            stripe_session_id: session.id,
            stripe_payment_status: 'paid',
            tier: session.metadata?.tier ?? speech.tier,
            payment_completed_at: new Date().toISOString(),
          })
          .eq('access_token', access_token);

        await (supabase as any).from('speech_events').insert({
          speech_id: speech.id,
          event_type: 'paid',
          metadata: {
            stripe_session_id: session.id,
            tier: session.metadata?.tier,
            amount_total: session.amount_total,
            currency: session.currency,
            source: 'polling_fallback',
          },
        });

        return NextResponse.json({ paid: true, tier: session.metadata?.tier ?? speech.tier });
      }
    } catch (err) {
      console.error('Stripe session check failed:', err);
      // Fall through and return not paid
    }
  }

  return NextResponse.json({ paid: false, tier: speech.tier });
}
