'use client';

import { useState } from 'react';

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
  { border: 'border-pink-500', score: 'text-pink-400', bg: 'bg-pink-500/10' },
  { border: 'border-blue-500', score: 'text-blue-400', bg: 'bg-blue-500/10' },
  { border: 'border-emerald-500', score: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

function ScoreColour({ score }: { score: number }) {
  const colour =
    score <= 3 ? 'text-red-400' : score <= 6 ? 'text-orange-400' : 'text-emerald-400';
  return <span className={`text-7xl font-black tabular-nums ${colour}`}>{score}</span>;
}

function RoastResults({ result, url, onReset }: { result: RoastResult; url: string; onReset: () => void }) {
  return (
    <div className="w-full max-w-4xl py-16 px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-sm text-zinc-500 mb-1 truncate">{url}</p>
        <h2 className="text-2xl font-bold text-white mb-6">{result.siteTitle}</h2>
        <div className="flex flex-col items-center gap-2">
          <ScoreColour score={result.overallScore} />
          <span className="text-zinc-400 text-sm">/ 10</span>
          <p className="mt-3 text-lg text-zinc-300 italic max-w-xl">"{result.verdict}"</p>
        </div>
      </div>

      {/* Judge cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {result.judges.map((judge, i) => {
          const accent = JUDGE_ACCENTS[i % JUDGE_ACCENTS.length];
          return (
            <div
              key={judge.name}
              className={`rounded-xl border ${accent.border} ${accent.bg} p-5 flex flex-col gap-4`}
            >
              <div>
                <div className="text-2xl mb-1">{judge.emoji}</div>
                <div className="font-bold text-white">{judge.name}</div>
                <div className="text-xs text-zinc-400">{judge.title}</div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-black tabular-nums ${accent.score}`}>
                  {judge.score}
                </span>
                <span className="text-zinc-500 text-sm">/ 10</span>
              </div>
              <ul className="space-y-2">
                {judge.observations.map((obs, j) => (
                  <li key={j} className="text-sm text-zinc-300 flex gap-2">
                    <span className="text-zinc-600 shrink-0">—</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Redemption */}
      <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 p-6 mb-10">
        <h3 className="text-base font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <span>🛠️</span> Redemption Arc
        </h3>
        <ol className="space-y-3">
          {result.redemption.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-300">
              <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Reset */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-400"
        >
          Roast Another Site 🔥
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }
    const normalised = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    if (!isValidUrl(normalised)) {
      setError("That doesn't look like a valid URL.");
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/roast', {
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
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="flex min-h-screen flex-col items-center bg-black">
        <RoastResults result={result} url={submittedUrl} onReset={handleReset} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
      <h1 className="text-5xl font-bold text-white">The Roast Machine</h1>
      <p className="mt-4 text-xl text-zinc-400">
        Paste any website URL. Three AI judges will tear it apart.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 w-full max-w-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={e => { setUrl(e.target.value); setError(''); }}
            placeholder="Enter a website URL..."
            disabled={loading}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-zinc-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
          >
            Roast This Site 🔥
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        {loading && (
          <p className="mt-3 text-sm text-zinc-400">The judges are reviewing your site...</p>
        )}
      </form>
    </main>
  );
}
