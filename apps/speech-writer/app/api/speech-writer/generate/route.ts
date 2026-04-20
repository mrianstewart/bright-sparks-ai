import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });


function parseRel(speech: Record<string, unknown>): Record<string, string> {
  try {
    return JSON.parse((speech.relationship_description as string) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

// Returns role-specific instructions appended after the base system prompt.
// Only includes data lines when the relevant field is non-empty.
function buildRoleInstructions(speech: Record<string, unknown>, rel: Record<string, string>): string {
  const role = (speech.speaker_role as string) ?? '';
  const p1 = (speech.couple_name_1 as string) ?? 'your partner';
  const p2 = (speech.couple_name_2 as string) ?? 'their partner';

  // Helper: include a line only if value is truthy
  const L = (text: string, value?: string) =>
    value ? `- ${text.replace('{v}', value)}` : null;

  const join = (...parts: (string | null | undefined)[]) =>
    parts.filter(Boolean).join('\n');

  switch (role) {
    case 'Best Man':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Best Man):',
        rel.howYouKnow && rel.knownDuration
          ? `- You met the groom: ${rel.howYouKnow}. You've known him ${rel.knownDuration}.`
          : rel.howYouKnow
            ? `- How you know the groom: ${rel.howYouKnow}`
            : rel.knownDuration
              ? `- You've known the groom ${rel.knownDuration}.`
              : null,
        L(`The speaker describes the groom as: "{v}"`, rel.wordForPartner),
        '- Open by establishing your friendship — how you met, what the groom was like when you first knew him',
        '- The core of the speech is stories that embarrass him (lovingly) and reveal his character',
        `- Include a moment where you acknowledge the bride — what she's done for him, how he's changed since meeting her`,
        '- Transition from funny to sincere: "But seriously..." or similar natural pivot',
        '- Welcome the bride, wish the couple well, raise a toast',
        '- The audience expects this speech to be funny. Even in "heartfelt" tone, weave in light humour.',
      );

    case 'Maid of Honour':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Maid of Honour):',
        rel.howYouKnow && rel.knownDuration
          ? `- You met the bride: ${rel.howYouKnow}. You've known her ${rel.knownDuration}.`
          : rel.howYouKnow
            ? `- How you know the bride: ${rel.howYouKnow}`
            : rel.knownDuration
              ? `- You've known the bride ${rel.knownDuration}.`
              : null,
        L(`The speaker describes the bride as: "{v}"`, rel.wordForPartner),
        '- Open by establishing your friendship — how you met, what she means to you',
        '- Stories should celebrate who the bride is — funny moments, meaningful moments, your bond',
        `- Acknowledge the groom — what you've seen him bring to her life`,
        '- Maid of honour speeches in UK weddings are increasingly common but less traditional — you can be more creative with structure',
        '- Balance humour with genuine emotion. This speech often makes the bride cry (in a good way).',
        '- Toast to the couple',
      );

    case 'Father of the Bride':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Father of the Bride):',
        '- This is traditionally the first speech at a UK wedding',
        L(`The speaker describes their child as a child: "{v}"`, rel.wordForPartnerAsChild),
        L(`Who they've become: "{v}"`, rel.wordForPartnerNow),
        rel.wordForPartnerWith2 ? `- ${p2} makes them: "${rel.wordForPartnerWith2}"` : null,
        `- Open with a memory of your daughter — something from childhood that captures who she is`,
        '- Reflect on watching her grow into the person she is today',
        rel.familyMessage
          ? `- Welcome ${p2} into the family: ${rel.familyMessage}`
          : `- Welcome ${p2} into the family`,
        '- This speech is expected to be emotional. Even in "warm with humour" tone, the audience expects a father to get choked up at least once.',
        '- Keep it dignified but personal. Avoid clichés about "losing a daughter, gaining a son."',
        '- Toast to the bride and groom',
      );

    case 'Mother of the Bride':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Mother of the Bride):',
        L(`The speaker describes their child as a child: "{v}"`, rel.wordForPartnerAsChild),
        L(`Who they've become: "{v}"`, rel.wordForPartnerNow),
        rel.wordForPartnerWith2 ? `- ${p2} makes them: "${rel.wordForPartnerWith2}"` : null,
        '- Open with a personal mother-daughter moment',
        `- Share what you've observed about your daughter's happiness since meeting ${p2}`,
        rel.familyMessage
          ? `- Welcome ${p2} into the family: ${rel.familyMessage}`
          : `- Welcome ${p2} into the family`,
        '- Mother of the bride speeches are less traditional in UK weddings but increasingly popular — embrace this',
        '- Warmer and more intimate tone than the father\'s speech. More personal detail, more emotion.',
        '- Toast to the couple',
      );

    case 'Father of the Groom':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Father of the Groom):',
        L(`The speaker describes their child as a child: "{v}"`, rel.wordForPartnerAsChild),
        L(`Who they've become: "{v}"`, rel.wordForPartnerNow),
        rel.wordForPartnerWith2 ? `- ${p2} makes them: "${rel.wordForPartnerWith2}"` : null,
        '- Traditionally this speech is shorter and less expected than the father of the bride',
        '- Open with pride in your son',
        '- Share a memory that shows his character',
        rel.familyMessage
          ? `- Welcome ${p2} into the family: ${rel.familyMessage}`
          : `- Welcome ${p2} into the family`,
        '- Toast to the couple',
      );

    case 'Mother of the Groom':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Mother of the Groom):',
        '- Same structure as Father of the Groom but warmer, more personal tone',
        L(`The speaker describes their child as a child: "{v}"`, rel.wordForPartnerAsChild),
        L(`Who they've become: "{v}"`, rel.wordForPartnerNow),
        rel.wordForPartnerWith2 ? `- ${p2} makes them: "${rel.wordForPartnerWith2}"` : null,
        '- Share a personal moment about your son',
        rel.familyMessage
          ? `- Welcome ${p2}: ${rel.familyMessage}`
          : `- Welcome ${p2}`,
        '- Toast to the couple',
      );

    case 'Bride':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Bride):',
        L(`The speaker describes their partner as: "{v}"`, rel.wordForPartner),
        L(`The thing nobody else sees about them: "{v}"`, rel.whatNobodySees),
        L(`People to thank: "{v}"`, rel.whoToThank),
        '- Open with thanks — parents, wedding party, guests. Keep it genuine, not a roll call.',
        `- Tell your love story with ${p1}: how you met, a moment that defined your relationship`,
        `- Share what ${p1} means to you — use the stories provided`,
        '- Bride speeches are modern and increasingly expected in UK weddings. Be confident with it.',
        '- Toast to your partner, or to everyone who made today possible',
      );

    case 'Groom':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Groom):',
        L(`The speaker describes their partner as: "{v}"`, rel.wordForPartner),
        L(`The thing nobody else sees about them: "{v}"`, rel.whatNobodySees),
        L(`People to thank: "{v}"`, rel.whoToThank),
        '- Traditionally the groom thanks: both sets of parents, the bridesmaids, the best man (with a joke), and the guests',
        `- Tell your love story with ${p1} — the stories provided are your material`,
        `- End with what ${p1} means to you`,
        '- The groom\'s speech often includes a gift announcement for bridesmaids/ushers — mention this if appropriate',
        `- Toast to the bridesmaids (traditional) or to ${p1}`,
      );

    case 'Sibling': {
      const side = rel.siblingOf ? `${rel.siblingOf}'s` : 'your sibling\'s';
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Sibling):',
        `- You are the ${side} sibling`,
        '- Stories should come from growing up together — childhood, family life, the sibling dynamic',
        `- Acknowledge the partner and what they've brought to your sibling's life`,
        '- Sibling speeches have natural permission to roast (you\'ve known them their whole life)',
        '- But land on love — what your brother/sister means to you',
        '- Toast to the couple',
      );
    }

    case 'Close Friend':
      return join(
        'ROLE-SPECIFIC INSTRUCTIONS (Close Friend):',
        rel.howYouKnow && rel.knownDuration
          ? `- You met ${p1}: ${rel.howYouKnow}. You've known them ${rel.knownDuration}.`
          : rel.howYouKnow
            ? `- How you know ${p1}: ${rel.howYouKnow}`
            : rel.knownDuration
              ? `- You've known ${p1} ${rel.knownDuration}.`
              : null,
        L(`The speaker describes them as: "{v}"`, rel.wordForPartner),
        '- Similar structure to best man/maid of honour but without the formal title',
        '- Your unique angle is your specific friendship — lean into what makes your perspective different',
        `- Acknowledge the partner`,
        '- Toast to the couple',
      );

    default: {
      // Group D — "Other" / custom role
      const relationship = rel.howYouKnow || role;
      return join(
        `ROLE-SPECIFIC INSTRUCTIONS (Other — ${relationship}):`,
        '- Adapt the speech structure to fit this relationship naturally',
        `- The speaker's connection: ${relationship}`,
        '- Draw on the stories provided to find the emotional core',
        '- Toast to the couple',
      );
    }
  }
}

function wordMinimumForMinutes(minutes: number): number {
  if (minutes <= 3) return 550;
  if (minutes <= 5) return 850;
  return 1200;
}

function buildSystemPrompt(speech: Record<string, unknown>): string {
  const minutes = (speech.target_length_minutes as number) ?? 5;
  const minWords = wordMinimumForMinutes(minutes);
  const p1 = (speech.couple_name_1 as string) ?? 'Partner 1';
  const p2 = (speech.couple_name_2 as string) ?? 'Partner 2';
  const rel = parseRel(speech);
  const roleInstructions = buildRoleInstructions(speech, rel);

  return `You are an expert UK wedding speechwriter with 20 years of experience writing speeches for British weddings. You understand the nuances of British humour, cultural references, and wedding traditions.

SPEECH CONTEXT:
- Speaker role: ${speech.speaker_role}
- Tone requested: ${speech.tone}
- Target length: ${minutes} minutes (MINIMUM ${minWords} words)

INSTRUCTIONS:

1. The speeches you generate are consistently too short. You MUST hit the minimum word count target. A 5-minute wedding speech needs at least 850 words. Speakers pause for laughter, take breaths before emotional moments, make eye contact with the audience, and wait for reactions. But the words on the page still need to be there. Do not pad with filler — add more depth to the stories, more specific details, more callbacks between sections, and a fuller emotional arc. A speech that feels rich and complete is always better than one that feels thin.

3. Follow UK wedding speech conventions throughout:
   - British English spelling and phrasing
   - British cultural references where natural (not forced)
   - Self-deprecating humour where appropriate
   - End with a toast: "Please raise your glasses to ${p1} and ${p2}"

4. Tone calibration for the requested tone:
   - Heartfelt & Sincere: Genuine emotion, vulnerability, specific sensory details. Let the stories breathe.
   - Warm with Humour: 70% funny, 30% sincere. Punchlines that land, then pull at heartstrings.
   - Proper Roast: Embarrassing stories told with love. Every roast line followed by genuine affection. Never cruel, never mean-spirited. The audience should be laughing WITH the speaker.
   - Formal & Traditional: Elegant phrasing, structured rhetoric. Still personal, never generic.

5. Mark each section with XML tags:
   <section id="opening" title="Opening">...</section>
   <section id="story_1" title="[Story Title]">...</section>
   <section id="story_2" title="[Story Title]">...</section>
   <section id="transition" title="The Serious Bit">...</section>
   <section id="closing" title="Closing & Toast">...</section>

6. NEVER include:
   - "Webster's dictionary defines..."
   - "For those who don't know me..." as an opener
   - Generic quotes that could apply to any couple
   - Anything the speaker asked to avoid
   - Offensive or inappropriate content

7. Each draft should be a complete, ready-to-deliver speech. Not an outline, not bullet points — a full speech written exactly as the speaker would say it out loud.

8. Format your response as JSON:
{
  "drafts": [
    {
      "id": 1,
      "emphasis": "emotional",
      "title": "The One That'll Make Them Cry",
      "sections": [
        {"id": "opening", "title": "Opening", "content": "..."},
        {"id": "story_1", "title": "The [Description]", "content": "..."},
        {"id": "story_2", "title": "The [Description]", "content": "..."},
        {"id": "transition", "title": "The Serious Bit", "content": "..."},
        {"id": "closing", "title": "Closing & Toast", "content": "..."}
      ],
      "word_count": 650,
      "estimated_minutes": 5
    }
  ]
}

${roleInstructions}`;
}

function buildUserPrompt(speech: Record<string, unknown>): string {
  const rel = parseRel(speech);

  const p1 = (speech.couple_name_1 as string) ?? 'Partner 1';
  const p2 = (speech.couple_name_2 as string) ?? 'Partner 2';
  const stories = (speech.stories as Array<{ title: string; content: string }>) ?? [];

  const lines: string[] = [];

  lines.push('SPEAKER INFORMATION:');
  lines.push(`- Role: ${speech.speaker_role}`);
  if (rel.roleGroup) lines.push(`- Role group: ${rel.roleGroup}`);
  if (rel.siblingOf) lines.push(`- Sibling of: the ${rel.siblingOf}`);
  if (rel.friendOf) lines.push(`- Close friend of: the ${rel.friendOf}`);

  lines.push('');
  lines.push('THE COUPLE:');
  lines.push(`- ${p1} (who the speaker knows best)`);
  if (speech.couple_name_2) lines.push(`- ${p2} (their partner)`);
  if (rel.togetherDuration) lines.push(`- Together for: ${rel.togetherDuration}`);
  if (rel.howTheyMet) lines.push(`- How they met: ${rel.howTheyMet}`);
  if (rel.weddingDate) lines.push(`- Wedding date: ${rel.weddingDate}`);

  lines.push('');
  lines.push("SPEAKER'S RELATIONSHIP:");
  if (rel.howYouKnow) lines.push(`- How speaker knows ${p1}: ${rel.howYouKnow}`);
  if (rel.knownDuration) lines.push(`- Known for: ${rel.knownDuration}`);
  if (rel.wordForPartner) lines.push(`- One word for ${p1}: "${rel.wordForPartner}"`);
  if (rel.wordForRelationship) lines.push(`- One word for their relationship: "${rel.wordForRelationship}"`);

  // Group B (parents)
  if (rel.wordForPartnerAsChild) lines.push(`- ${p1} as a child: "${rel.wordForPartnerAsChild}"`);
  if (rel.wordForPartnerNow) lines.push(`- Who ${p1} has become: "${rel.wordForPartnerNow}"`);
  if (rel.wordForPartnerWith2) lines.push(`- How ${p2} makes ${p1} feel: "${rel.wordForPartnerWith2}"`);
  if (rel.familyMessage) lines.push(`- What speaker wants ${p2} to know about the family:\n  "${rel.familyMessage}"`);

  // Group C (bride/groom)
  if (rel.whatNobodySees) lines.push(`- What nobody else sees about ${p1}:\n  "${rel.whatNobodySees}"`);
  if (rel.whoToThank) lines.push(`- Who speaker wants to thank:\n  "${rel.whoToThank}"`);

  if (stories.length > 0) {
    lines.push('');
    lines.push('STORIES & ANECDOTES:');
    stories.forEach((story, i) => {
      lines.push(`Story ${i + 1}:`);
      lines.push(`"${story.content}"`);
      lines.push('');
    });
  }

  lines.push('SPEECH PREFERENCES:');
  lines.push(`- Tone: ${speech.tone}`);
  lines.push(`- Target length: ${speech.target_length_minutes} minutes`);

  if (speech.additional_notes) {
    lines.push('');
    lines.push('ADDITIONAL NOTES FROM SPEAKER:');
    lines.push(speech.additional_notes as string);
  }

  lines.push('');
  const draftCount = (speech.tier as string) === 'single' ? 1 : 3;
  if (draftCount === 1) {
    lines.push('Write 1 version. Lead with the strongest emotional moment and weave in humour naturally.');
  } else {
    lines.push('Write 3 different versions. Draft 1: lead with the strongest emotional moment. Draft 2: lead with the funniest story. Draft 3: lead with the speaker\'s personal connection.');
  }

  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { access_token, bypass } = body;
  if (typeof access_token !== 'string' || !access_token) {
    return NextResponse.json({ error: 'access_token is required' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: speech, error: fetchError } = await (supabase as any)
    .from('speeches')
    .select('*')
    .eq('access_token', access_token)
    .single();

  if (fetchError || !speech) {
    return NextResponse.json({ error: 'Speech not found' }, { status: 404 });
  }

  // Payment check — bypass only in development
  const isDev = process.env.NODE_ENV !== 'production';
  const bypassAllowed = isDev && bypass === true;
  const isPaid = speech.stripe_payment_status === 'paid' && speech.payment_completed_at != null;

  if (!isPaid && !bypassAllowed) {
    return NextResponse.json({ error: 'Payment required' }, { status: 403 });
  }

  const systemPrompt = buildSystemPrompt(speech);
  const userPrompt = buildUserPrompt(speech);

  let rawContent: string;
  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const message = await stream.finalMessage();
    rawContent = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');
  } catch (err) {
    console.error('Claude API error:', err);
    return NextResponse.json({ error: 'Speech generation failed. Please try again.' }, { status: 500 });
  }

  let drafts: unknown[];
  try {
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned) as { drafts: unknown[] };
    drafts = parsed.drafts;
    if (!Array.isArray(drafts)) throw new Error('drafts is not an array');
  } catch (err) {
    console.error('Failed to parse Claude response:', err, '\nRaw:', rawContent.slice(0, 500));
    return NextResponse.json({ error: 'Failed to parse generated speech. Please try again.' }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('speeches')
    .update({ drafts, generated_at: new Date().toISOString() })
    .eq('access_token', access_token);

  if (updateError) {
    console.error('Supabase update error:', updateError);
    return NextResponse.json({ error: 'Failed to save generated speech. Please try again.' }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: eventError } = await (supabase as any).from('speech_events').insert({
    speech_id: speech.id,
    event_type: 'generated',
    metadata: { draft_count: drafts.length },
  });

  if (eventError) {
    console.error('Event insert error (non-fatal):', eventError);
  }

  return NextResponse.json({ drafts }, { status: 200 });
}
