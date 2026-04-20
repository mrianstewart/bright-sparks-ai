import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckoutClient } from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Complete Your Order | Bright Sparks AI',
  robots: { index: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: speech } = await (supabase as any)
    .from('speeches')
    .select('id, email, speaker_role, couple_name_1, couple_name_2, tier')
    .eq('access_token', token)
    .single();

  if (!speech) notFound();

  return (
    <CheckoutClient
      accessToken={token}
      speechId={speech.id}
      speakerRole={speech.speaker_role}
      coupleName1={speech.couple_name_1}
      coupleName2={speech.couple_name_2}
      initialTier={speech.tier ?? 'full'}
    />
  );
}
