import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GeneratingPage } from './GeneratingPage';

export const metadata: Metadata = {
  title: 'Writing Your Speech | Bright Sparks AI',
  robots: { index: false },
};

export default function GeneratingRoute() {
  return (
    <Suspense fallback={null}>
      <GeneratingPage />
    </Suspense>
  );
}
