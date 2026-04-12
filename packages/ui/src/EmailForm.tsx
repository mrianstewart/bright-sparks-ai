'use client';

import { useState } from 'react';

declare global {
  interface Window {
    plausible?: (event: string, options?: Record<string, unknown>) => void;
  }
}

const KIT_ENDPOINT = (id: string) => `https://app.kit.com/forms/${id}/subscriptions`;

export function EmailForm({ id, successId, errorId, kitFormId, btnLabel, note }: {
  id: string;
  successId: string;
  errorId: string;
  kitFormId: string;
  btnLabel: string;
  note?: string;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.currentTarget.querySelector('[name="email_address"]') as HTMLInputElement).value.trim();
    setState('loading');
    try {
      const res = await fetch(KIT_ENDPOINT(kitFormId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email_address: email }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok || res.status === 200 || res.status === 201) {
        setState('success');
        window.plausible?.('Subscribe Clicked', { props: { source: id } });
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="email-form__success" id={successId}>
        <p>You&apos;re in. Check your inbox. ⚡</p>
      </div>
    );
  }

  return (
    <>
      <form className="email-form" id={id} onSubmit={handleSubmit}>
        <div className="email-form__row">
          <input
            type="email"
            name="email_address"
            placeholder="your@email.com"
            required
            autoComplete="email"
            className="email-form__input"
            aria-label="Email address"
          />
          <button type="submit" className="btn btn--primary email-form__btn" disabled={state === 'loading'}>
            {state === 'loading' ? 'Sending…' : <>{btnLabel} <span aria-hidden="true">→</span></>}
          </button>
        </div>
        {note && <p className="email-form__note">{note}</p>}
      </form>
      {state === 'error' && (
        <div className="email-form__error" id={errorId}>
          <p>Something went wrong. Try again or email <a href="mailto:hello@brightsparks.ai">hello@brightsparks.ai</a> directly.</p>
        </div>
      )}
    </>
  );
}
