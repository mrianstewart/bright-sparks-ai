import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { SpeechDraft } from '@/lib/types';
import { SpeechViewer } from './SpeechViewer';

export const metadata: Metadata = {
  title: 'Your Wedding Speech | Bright Sparks AI',
  robots: { index: false },
};

export default async function SpeechPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: speech } = await (supabase as any)
    .from('speeches')
    .select('*')
    .eq('access_token', token)
    .single();

  if (!speech) notFound();

  const drafts: SpeechDraft[] = speech.drafts ?? [];

  if (drafts.length === 0) {
    return (
      <main className="sp-error-main">
        <div className="sp-error-card">
          <p className="sp-error-icon">✦</p>
          <h1 className="sp-error-heading">Speech not ready yet</h1>
          <p className="sp-error-body">
            Your speech is still being generated. Come back in a moment — or
            check the link that was emailed to you.
          </p>
        </div>
      </main>
    );
  }

  const expiryDate = new Date(speech.created_at);
  expiryDate.setMonth(expiryDate.getMonth() + 6);
  const expiryStr = expiryDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SpeechViewer
      drafts={drafts}
      tier={speech.tier}
      accessToken={token}
      speechId={speech.id}
      initialSelectedDraft={speech.selected_draft ?? 0}
      initialEditedSections={speech.edited_sections ?? {}}
      expiryDate={expiryStr}
    />
  );
}
