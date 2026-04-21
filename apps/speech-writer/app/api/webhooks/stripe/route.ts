import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { tagKitSubscriber } from '@/lib/kit';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!.trim()
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { speech_id, access_token, tier } = session.metadata ?? {};
    console.log('Webhook: checkout.session.completed', {
      session_id: session.id,
      access_token,
      tier,
      customer_email: session.customer_email,
      customer_details_email: session.customer_details?.email,
    });

    if (access_token) {
      const { error: updateError } = await (supabase as any)
        .from('speeches')
        .update({
          stripe_session_id: session.id,
          stripe_payment_status: 'paid',
          tier: tier ?? undefined,
          payment_completed_at: new Date().toISOString(),
        })
        .eq('access_token', access_token);

      if (updateError) {
        console.error('Supabase update error on payment:', updateError);
      }

      const { error: eventError } = await (supabase as any)
        .from('speech_events')
        .insert({
          speech_id: speech_id ?? null,
          event_type: 'paid',
          metadata: {
            stripe_session_id: session.id,
            tier,
            amount_total: session.amount_total,
            currency: session.currency,
          },
        });

      if (eventError) {
        console.error('Event insert error (non-fatal):', eventError);
      }

      // Tag subscriber in Kit
      const customerEmail = session.customer_details?.email ?? session.customer_email;
      if (customerEmail) {
        const kitTags = ['speech-writer-customer', `tier-${tier ?? 'single'}`];
        try {
          await tagKitSubscriber(customerEmail, kitTags);
          console.log('Kit tagging succeeded for', customerEmail);
        } catch (err) {
          console.error('Kit tagging failed (non-fatal):', err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
