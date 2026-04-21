'use client';

import { useEffect, useRef, useState } from 'react';
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

type Phase = 'confirming' | 'generating' | 'error';

export function GeneratingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const accessToken = params.get('access_token') ?? '';
  const sessionId = params.get('session_id');
  const bypass = params.get('bypass') === 'true';

  const [phase, setPhase] = useState<Phase>(sessionId ? 'confirming' : 'generating');
  const [msgIndex, setMsgIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Poll for payment confirmation, then kick off generation
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    async function pollPayment() {
      const MAX_POLLS = 15;
      const INTERVAL = 1000;

      for (let i = 0; i < MAX_POLLS; i++) {
        if (cancelled) return;
        try {
          const sessionParam = sessionId ? `&session_id=${sessionId}` : '';
          const res = await fetch(
            `/speech-writer/api/speech-writer/payment-status?access_token=${accessToken}${sessionParam}`
          );
          const data = await res.json();
          if (data.paid) return true;
        } catch {
          // network blip — keep polling
        }
        await new Promise(r => setTimeout(r, INTERVAL));
      }
      return false; // timed out
    }

    async function run() {
      setErrorMsg('');
      setMsgIndex(0);

      // If we have a session_id the user came from Stripe — wait for webhook
      if (sessionId && !bypass) {
        const paid = await pollPayment();
        if (cancelled) return;
        if (!paid) {
          setPhase('error');
          setErrorMsg(
            "We couldn't confirm your payment. If you were charged, please contact us and we'll sort it immediately."
          );
          return;
        }
      }

      if (cancelled) return;
      setPhase('generating');

      try {
        const res = await fetch('/speech-writer/api/speech-writer/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, bypass }),
        });
        if (cancelled) return;
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
        router.push(`/${accessToken}`);
      } catch (err) {
        if (cancelled) return;
        setPhase('error');
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      }
    }

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Cycle messages every 5s while generating
  useEffect(() => {
    if (phase !== 'generating') return;
    const id = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(id);
  }, [phase]);

  if (phase === 'error') {
    return (
      <main className="sw-gen-main">
        <div className="sw-gen-card">
          <div className="sw-gen-error-icon">✦</div>
          <h1 className="sw-gen-heading">Something went wrong</h1>
          <p className="sw-gen-error-body">
            {errorMsg || "Something went wrong generating your speech. Don't worry — your answers are saved."}
          </p>
          <button
            type="button"
            className="sw-gen-retry"
            onClick={() => {
              setPhase(sessionId && !bypass ? 'confirming' : 'generating');
              setRetryCount(c => c + 1);
            }}
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

  if (phase === 'confirming') {
    return (
      <main className="sw-gen-main">
        <div className="sw-gen-card">
          <h1 className="sw-gen-heading">Confirming your payment…</h1>
          <p className="sw-gen-message">Just a moment while we confirm your payment with Stripe.</p>
          <p className="sw-gen-time">This usually takes a second or two</p>
          <div className="sw-gen-dots" aria-hidden="true">
            <span /><span /><span />
          </div>
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

        <p className="sw-gen-time">This usually takes about two minutes</p>

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
