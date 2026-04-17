import type { Metadata } from 'next';
import { SpeechQuestionnaire } from './SpeechQuestionnaire';

export const metadata: Metadata = {
  title: 'Write Your Speech | Bright Sparks AI',
  robots: { index: false },
};

export default function CreateSpeechPage() {
  return (
    <main>
      <SpeechQuestionnaire />
    </main>
  );
}
