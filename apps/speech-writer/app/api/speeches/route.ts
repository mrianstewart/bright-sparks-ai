import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const access_token = crypto.randomUUID();

  const stories = [
    { title: 'Story 1', content: body.story1 as string },
    { title: 'Story 2', content: body.story2 as string },
    { title: 'Story 3', content: body.story3 as string },
    { title: 'Extra', content: body.storyExtra as string },
  ].filter((s) => typeof s.content === 'string' && s.content.trim().length > 0);

  const relationshipMeta = JSON.stringify({
    roleGroup: body.roleGroup,
    siblingOf: body.siblingOf,
    friendOf: body.friendOf,
    howTheyMet: body.howTheyMet,
    togetherDuration: body.togetherDuration,
    weddingDate: body.weddingDate,
    // Group A / D
    howYouKnow: body.howYouKnow,
    knownDuration: body.knownDuration,
    wordForPartner: body.wordForPartner,
    wordForRelationship: body.wordForRelationship,
    // Group B (parents)
    wordForPartnerAsChild: body.wordForPartnerAsChild,
    wordForPartnerNow: body.wordForPartnerNow,
    wordForPartnerWith2: body.wordForPartnerWith2,
    familyMessage: body.familyMessage,
    // Group C (bride/groom)
    whatNobodySees: body.whatNobodySees,
    whoToThank: body.whoToThank,
  });

  const additionalNotes = [
    body.mustInclude ? `Include: ${body.mustInclude}` : '',
    body.mustAvoid ? `Avoid: ${body.mustAvoid}` : '',
  ]
    .filter(Boolean)
    .join('\n\n') || null;

  const speakerRole =
    body.role === 'Other'
      ? (body.roleOther as string) || 'Other'
      : (body.role as string);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: speech, error: insertError } = await (supabase as any)
    .from('speeches')
    .insert({
      access_token,
      email,
      tier: 'single',
      speaker_role: speakerRole,
      couple_name_1: (body.partner1Name as string) || null,
      couple_name_2: (body.partner2Name as string) || null,
      relationship_description: relationshipMeta,
      stories,
      tone: (body.tone as string) || null,
      target_length_minutes: parseInt(body.lengthMinutes as string, 10) || 5,
      additional_notes: additionalNotes,
    })
    .select('id')
    .single();

  if (insertError || !speech) {
    console.error('Supabase insert error:', insertError);
    return NextResponse.json(
      { error: 'Failed to save your answers. Please try again.' },
      { status: 500 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: eventError } = await (supabase as any).from('speech_events').insert({
    speech_id: speech.id,
    event_type: 'created',
    metadata: { email, speaker_role: speakerRole },
  });

  if (eventError) {
    console.error('Event insert error (non-fatal):', eventError);
  }

  return NextResponse.json({ access_token }, { status: 201 });
}
