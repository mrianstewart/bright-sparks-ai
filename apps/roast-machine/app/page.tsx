'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface Judge {
  name: string;
  emoji: string;
  title: string;
  score: number;
  observations: string[];
}

interface RoastResult {
  siteTitle: string;
  overallScore: number;
  verdict: string;
  judges: Judge[];
  redemption: string[];
}

const JUDGE_ACCENTS = [
  {
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/5',
    header: 'bg-rose-500/10',
    score: 'text-rose-400',
    bullet: 'bg-rose-500/20 text-rose-400',
  },
  {
    border: 'border-lime-500/40',
    bg: 'bg-lime-500/5',
    header: 'bg-lime-500/10',
    score: 'text-lime-400',
    bullet: 'bg-lime-500/20 text-lime-400',
  },
  {
    border: 'border-violet-500/40',
    bg: 'bg-violet-500/5',
    header: 'bg-violet-500/10',
    score: 'text-violet-400',
    bullet: 'bg-violet-500/20 text-violet-400',
  },
];

function overallScoreColour(score: number) {
  if (score <= 3) return 'text-red-400';
  if (score <= 5) return 'text-orange-400';
  if (score <= 7) return 'text-yellow-400';
  return 'text-emerald-400';
}

const LOADING_MESSAGES = [
  'The judges are reviewing your site…',
  'Valentina is sighing audibly…',
  'Marcus is checking your bounce rate…',
  'Sage is getting a bad feeling about this…',
  'Someone is being paged from the green room…',
  'The judges are arguing about fonts…',
  'Marcus just said "funnel" for the fourth time…',
  'Valentina has requested a moment…',
  'Sage would not hand over her credit card right now…',
  'The judges are sharpening their pencils…',
  'Someone just said "Who approved this?"…',
  'A/B test results are being consulted…',
  'The vibe is being checked…',
];

function randomIndex(exclude: number) {
  let next: number;
  do { next = Math.floor(Math.random() * LOADING_MESSAGES.length); } while (next === exclude);
  return next;
}

const FADE_MS = 200;

function useRotatingMessage(active: boolean, intervalMs = 2750) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      setVisible(true);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setIndex(randomIndex(-1));
    setVisible(true);
    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => randomIndex(i));
        setVisible(true);
      }, FADE_MS);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, intervalMs]);

  return { message: LOADING_MESSAGES[index], visible };
}

const SUBSTACK_URL = 'https://brightsparksai.substack.com';
const KIT_FORM_URL = 'https://app.kit.com/forms/9288290/subscriptions';

function EmailCapture() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');

    try {
      await fetch(KIT_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email_address: email.trim(), fields: '' }).toString(),
        mode: 'no-cors',
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again.');
    }
  }

  return (
    <div className="animate-fade-in-up mb-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 md:p-8 text-center" style={{ animationDelay: '1200ms' }}>
      {submitted ? (
        <div>
          <div className="text-2xl mb-2">📬</div>
          <p className="text-slate-300 font-semibold">You're in. See you in the next build.</p>
          <p className="text-slate-500 text-sm mt-1">Check your inbox to confirm.</p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-bold text-white mb-1">Want to see what I build next?</h3>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            I ship a new AI tool every week and write about how I built it. Free, no spam, unsubscribe anytime.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 rounded-xl border border-slate-600 bg-slate-700/60 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 text-sm transition-all"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-600 hover:bg-slate-500 px-5 py-3 font-semibold text-white text-sm transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              Subscribe →
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </>
      )}
    </div>
  );
}

function buildShareText(result: RoastResult, url: string) {
  const [valentina, marcus, sage] = result.judges;
  return `🔥 The Roast Machine just reviewed ${url} — ${valentina.name} gave it ${valentina.score}/10 for design, ${marcus.name} gave it ${marcus.score}/10 for growth, and ${sage.name} gave it ${sage.score}/10 for vibes. Get your site roasted → brightsparks.ai/roast-machine`;
}

function ShareAndReset({
  result,
  url,
  onReset,
}: {
  result: RoastResult;
  url: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const shareText = buildShareText(result, url);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = shareText;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const handleTweet = useCallback(() => {
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  }, [shareText]);

  return (
    <div className="animate-fade-in-up space-y-3" style={{ animationDelay: '1400ms' }}>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-6 py-3.5 font-bold text-white text-sm transition-all hover:bg-slate-700 hover:scale-105 active:scale-95 min-w-44"
        >
          {copied ? (
            <>
              <span>✅</span> Copied!
            </>
          ) : (
            <>
              <span>📋</span> Share Your Roast
            </>
          )}
        </button>
        <button
          onClick={handleTweet}
          className="flex items-center justify-center gap-2 rounded-xl bg-black border border-slate-700 px-6 py-3.5 font-bold text-white text-sm transition-all hover:bg-slate-900 hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>
      </div>
      <div className="text-center">
        <button
          onClick={onReset}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
        >
          Roast another site 🔥
        </button>
      </div>
    </div>
  );
}

function RoastResults({
  result,
  url,
  onReset,
}: {
  result: RoastResult;
  url: string;
  onReset: () => void;
}) {
  return (
    <div className="w-full max-w-5xl px-4 py-0">
      {/* Site header */}
      <div className="mb-10 text-center">
        <p className="text-xs text-slate-500 mb-1 truncate">{url}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white">{result.siteTitle}</h2>
      </div>

      {/* Judge cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {result.judges.map((judge, i) => {
          const accent = JUDGE_ACCENTS[i % JUDGE_ACCENTS.length];
          return (
            <div
              key={judge.name}
              className={`rounded-2xl border ${accent.border} ${accent.bg} overflow-hidden flex flex-col animate-fade-in-up`}
              style={{ animationDelay: `${i * 250}ms` }}
            >
              {/* Header row */}
              <div className={`${accent.header} px-5 py-4 flex items-center justify-between gap-4`}>
                <div className="min-w-0">
                  <div className="text-xl mb-0.5">{judge.emoji}</div>
                  <div className="font-bold text-white text-sm leading-tight">{judge.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{judge.title}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-5xl font-black tabular-nums leading-none ${accent.score}`}>
                    {judge.score}
                  </span>
                  <div className="text-xs text-slate-500">/10</div>
                </div>
              </div>

              {/* Observations */}
              <ul className="px-5 py-4 space-y-3 flex-1">
                {judge.observations.map((obs, j) => (
                  <li key={j} className="text-sm text-slate-300 flex gap-2.5 leading-relaxed">
                    <span
                      className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${accent.bullet}`}
                    >
                      {j + 1}
                    </span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Overall score + verdict */}
      <div
        className="animate-fade-in-up mb-10 rounded-2xl border border-slate-700 bg-slate-800/50 p-8 text-center"
        style={{ animationDelay: '850ms' }}
      >
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Overall Verdict</p>
        <div className="flex items-baseline justify-center gap-1 mb-5">
          <span
            className={`text-8xl font-black tabular-nums leading-none ${overallScoreColour(result.overallScore)}`}
          >
            {result.overallScore}
          </span>
          <span className="text-2xl text-slate-500 font-light">/10</span>
        </div>
        <p className="text-xl md:text-2xl text-slate-200 italic max-w-2xl mx-auto leading-snug">
          &ldquo;{result.verdict}&rdquo;
        </p>
      </div>

      {/* Redemption Arc */}
      <div
        className="animate-fade-in-up mb-10 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 md:p-8"
        style={{ animationDelay: '1050ms' }}
      >
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <span>🛠️</span> Redemption Arc
        </h3>
        <ol className="space-y-4">
          {result.redemption.map((item, i) => (
            <li key={i} className="flex gap-4 text-sm text-slate-300 leading-relaxed">
              <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold mt-0.5">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Email capture */}
      <EmailCapture />

      {/* Share + Roast another */}
      <ShareAndReset result={result} url={url} onReset={onReset} />
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingKey, setLoadingKey] = useState(0);
  const [error, setError] = useState('');
  const { message: loadingMessage, visible: messageVisible } = useRotatingMessage(loading);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState('');

  function handleReset() {
    setResult(null);
    setUrl('');
    setError('');
    setSubmittedUrl('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Drop a URL in there and we'll get the judges warmed up.");
      return;
    }
    const normalised = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    let parsed: URL;
    try {
      parsed = new URL(normalised);
      if (!parsed.hostname.includes('.')) throw new Error();
    } catch {
      setError("That doesn't look like a real URL. Try something like https://yoursite.com");
      return;
    }
    // update the input to show the normalised version
    setUrl(normalised);

    setError('');
    setResult(null);
    setLoadingKey(k => k + 1);
    setLoading(true);

    try {
      const res = await fetch('/roast-machine/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalised }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
      } else {
        setSubmittedUrl(normalised);
        setResult(data as RoastResult);
      }
    } catch {
      setError("Something's gone sideways on our end. Give it another go.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="flex min-h-screen flex-col items-center bg-transparent">
        <RoastResults result={result} url={submittedUrl} onReset={handleReset} />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center pt-20 pb-4 bg-transparent px-4">
      <div className="w-full max-w-lg text-center">
        <div className="text-5xl mb-4">🔥</div>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-none">
          The Roast Machine
        </h1>
        <p className="text-lg text-slate-400 mb-3 leading-relaxed">
          Paste any website URL. Three AI judges will tear it apart.
        </p>
        <p className="text-sm text-slate-600 mb-10">
          Part of{' '}
          <a href="https://brightsparks.ai" className="text-slate-500 hover:text-slate-400 transition-colors">Bright Sparks AI</a>
          {' '}— new tools every week.{' '}
          <a href="https://brightsparks.ai/#subscribe" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-400 transition-colors underline underline-offset-2">
            Subscribe →
          </a>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="https://yoursite.com"
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-4 text-white placeholder-slate-500 outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 text-base transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-5 py-4 font-bold text-white text-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
            style={loading ? {
              backgroundImage: 'linear-gradient(#ea580c, #ea580c)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
              backgroundColor: '#431407',
              animation: `progress-fill 20s linear forwards`,
              animationDelay: '0ms',
            } : {
              backgroundColor: '#ea580c',
            }}
            key={loadingKey}
          >
            <span
              style={{
                opacity: loading ? (messageVisible ? 1 : 0) : 1,
                transition: `opacity ${FADE_MS}ms ease`,
              }}
            >
              {loading ? loadingMessage : 'Roast This Site 🔥'}
            </span>
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
