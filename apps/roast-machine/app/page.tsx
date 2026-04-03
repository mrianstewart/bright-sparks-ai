'use client';

import { useState } from 'react';

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }
    if (!isValidUrl(url.trim())) {
      setError('That doesn\'t look like a valid URL.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
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
