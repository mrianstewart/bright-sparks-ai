import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SpeechQuestionnaire } from './SpeechQuestionnaire';

export const metadata: Metadata = {
  title: 'Write Your Speech | Bright Sparks AI',
  robots: { index: false },
};

export default function CreateSpeechPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <SpeechQuestionnaire />
      </Suspense>
    </main>
  );
}
