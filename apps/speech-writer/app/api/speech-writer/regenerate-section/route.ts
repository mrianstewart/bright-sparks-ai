import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import type { SpeechDraft } from '@/lib/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { access_token, draft_index, section_id, tone } = await req.json();

  if (!access_token || section_id == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: speech } = await (supabase as any)
    .from('speeches')
    .select('*')
    .eq('access_token', access_token)
    .single();

  if (!speech) {
    return NextResponse.json({ error: 'Speech not found' }, { status: 404 });
  }

  const drafts: SpeechDraft[] = speech.drafts ?? [];
  const draft = drafts[draft_index ?? 0];
  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  const section = draft.sections.find((s: { id: string }) => s.id === section_id);
  if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

  const otherSections = draft.sections
    .filter((s: { id: string }) => s.id !== section_id)
    .map((s: { title: string; content: string }) => `## ${s.title}\n${s.content}`)
    .join('\n\n');

  const toneInstruction = tone
    ? `\n\nIMPORTANT: Adjust the tone to make this section ${tone}. Keep the same subject matter and key facts.`
    : '';

  const prompt = `You are rewriting a single section of a wedding speech.

DRAFT STYLE: "${draft.title}" — ${draft.emphasis}

EXISTING SPEECH CONTEXT (do not rewrite these, just use for tone/continuity):
${otherSections}

SECTION TO REWRITE: "${section.title}"
CURRENT TEXT:
${section.content}
${toneInstruction}

Write a new version of this section only. Match the style and tone of the rest of the speech. Return only the section text with no heading, no preamble, no explanation.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

  return NextResponse.json({ content });
}
