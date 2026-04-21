import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { buildConfirmationEmail } from '@/lib/emails/confirmationEmail';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const { data: speech } = await (supabase as any)
    .from('speeches')
    .select('id, access_token, tier, stripe_payment_status, payment_completed_at')
    .eq('email', email.toLowerCase().trim())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!speech) {
    return NextResponse.json({ status: 'not_found' });
  }

  const isPaid = speech.stripe_payment_status === 'paid' && speech.payment_completed_at != null;

  if (!isPaid) {
    return NextResponse.json({
      status: 'not_paid',
      checkoutUrl: `https://brightsparks.ai/speech-writer/checkout/${speech.access_token}`,
    });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!.trim());
    const { subject, html } = buildConfirmationEmail({
      email,
      accessToken: speech.access_token,
      tier: speech.tier ?? 'single',
    });
    await resend.emails.send({
      from: 'Bright Sparks AI <hello@brightsparks.ai>',
      to: email,
      subject,
      html,
    });
  } catch (err) {
    console.error('Resend link email failed:', err);
    return NextResponse.json({ error: 'Failed to send email. Please contact hello@brightsparks.ai' }, { status: 500 });
  }

  return NextResponse.json({ status: 'sent' });
}
