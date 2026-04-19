'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MESSAGES = [
  'Drawing out your best stories...',
  'Calibrating the British humour...',
  'Finding the right opening line...',
  'Making sure the toast lands perfectly...',
  'Weaving in the emotional bits...',
  'Getting the timing of the funny bits right...',
  'Making sure the stories actually land...',
  'Polishing the punchlines...',
  'Checking it sounds like a person, not a robot...',
  'Adding a bit more heart to the middle section...',
  'Reading it back one more time...',
  'Tightening up the ending...',
  'Almost there — putting the finishing touches on...',
];

export function GeneratingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const accessToken = params.get('access_token') ?? '';
  const speechId = params.get('speech_id') ?? '';

  const [msgIndex, setMsgIndex] = useState(0);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // API call — re-runs on retry
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    setStatus('loading');
    setErrorMsg('');
    setMsgIndex(0);

    async function run() {
      try {
        const res = await fetch('/speech-writer/api/speech-writer/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, speech_id: speechId }),
        });
        if (cancelled) return;
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
        router.push(`/${accessToken}`);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      }
    }

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Cycle messages every 7s while loading
  useEffect(() => {
    if (status !== 'loading') return;
    const id = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'error') {
    return (
      <main className="sw-gen-main">
        <div className="sw-gen-card">
          <div className="sw-gen-error-icon">✦</div>
          <h1 className="sw-gen-heading">Something went wrong</h1>
          <p className="sw-gen-error-body">
            Something went wrong generating your speech. Don&apos;t worry — your answers are saved.
          </p>
          {errorMsg && (
            <p className="sw-gen-error-detail">{errorMsg}</p>
          )}
          <button
            type="button"
            className="sw-gen-retry"
            onClick={() => setRetryCount(c => c + 1)}
          >
            Try again
          </button>
          <p className="sw-gen-contact">
            Still having trouble?{' '}
            <a href="mailto:hello@brightsparks.ai">Contact us</a>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="sw-gen-main">
      <div className="sw-gen-card">
        <h1 className="sw-gen-heading">Writing your speech…</h1>

        <p key={msgIndex} className="sw-gen-message">
          {MESSAGES[msgIndex]}
        </p>

        <p className="sw-gen-time">This usually takes about a minute</p>

        <div className="sw-gen-progress" role="progressbar" aria-label="Generating speech">
          <div key={retryCount} className="sw-gen-progress__fill" />
        </div>

        <div className="sw-gen-dots" aria-hidden="true">
          <span /><span /><span />
        </div>
      </div>
    </main>
  );
}
