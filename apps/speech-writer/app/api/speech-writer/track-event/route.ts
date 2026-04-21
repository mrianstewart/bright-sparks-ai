import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { SpeechEventType } from '@/lib/types';

const ALLOWED_EVENTS: SpeechEventType[] = ['exported', 'rehearsed'];

export async function POST(req: NextRequest) {
  const { access_token, speech_id, event_type, metadata } = await req.json();

  if (!access_token || !event_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!ALLOWED_EVENTS.includes(event_type)) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }

  // Verify access_token is valid before logging
  const { data: speech } = await (supabase as any)
    .from('speeches')
    .select('id')
    .eq('access_token', access_token)
    .single();

  if (!speech) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await (supabase as any).from('speech_events').insert({
    speech_id: speech_id ?? speech.id,
    event_type,
    metadata: metadata ?? null,
  });

  return NextResponse.json({ ok: true });
}
