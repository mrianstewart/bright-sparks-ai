'use client';

import { useState, useEffect, useCallback } from 'react';

const KIT_FORM_URL = 'https://app.kit.com/forms/9288290/subscriptions';

export function SubscribeFooterLink() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-slate-300 hover:text-white transition-colors underline underline-offset-2 cursor-pointer"
      >
        Follow the builds →
      </button>
      {open && <SubscribeModal onClose={() => setOpen(false)} />}
    </>
  );
}

function SubscribeModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    try {
      await fetch(KIT_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email_address: email.trim() }).toString(),
        mode: 'no-cors',
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">📬</div>
            <p className="text-white font-semibold text-lg mb-1">You're in.</p>
            <p className="text-slate-400 text-sm">Check your inbox to confirm, then see you in the next build.</p>
            <button
              onClick={onClose}
              className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="text-2xl mb-4">⚡️</div>
            <h2 className="text-xl font-bold text-white mb-2">Follow the builds</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              I ship a new AI tool every week and write about how I built it. Free, no spam, unsubscribe anytime.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 text-sm transition-all"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 hover:bg-orange-400 px-5 py-3 font-semibold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Subscribe →
              </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
