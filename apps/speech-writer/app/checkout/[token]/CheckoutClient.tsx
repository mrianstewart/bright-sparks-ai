'use client';

import { useState } from 'react';
import type { Tier } from '@/lib/types';

interface Plan {
  tier: Tier;
  name: string;
  price: string;
  features: string[];
  badge?: string;
}

const PLANS: Plan[] = [
  {
    tier: 'single',
    name: 'Single Draft',
    price: '£14.99',
    features: [
      '1 complete speech draft',
      'PDF export',
      'UK spelling & style',
      'Instant delivery',
    ],
  },
  {
    tier: 'full',
    name: 'Full Package',
    price: '£24.99',
    badge: 'Most popular',
    features: [
      '3 drafts in different styles',
      'Section-by-section editing',
      'Adjust tone per section',
      'PDF export',
      'UK spelling & style',
    ],
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: '£39.99',
    features: [
      'Everything in Full Package',
      'Rehearsal mode with timing',
      'Delivery coaching notes',
      '48-hour revision window',
    ],
  },
];

interface Props {
  accessToken: string;
  speechId: string;
  speakerRole: string | null;
  coupleName1: string | null;
  coupleName2: string | null;
  initialTier: Tier;
}

export function CheckoutClient({
  accessToken,
  speechId,
  speakerRole,
  coupleName1,
  coupleName2,
  initialTier,
}: Props) {
  const [selectedTier, setSelectedTier] = useState<Tier>(initialTier === 'single' ? 'full' : initialTier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const couple = [coupleName1, coupleName2].filter(Boolean).join(' & ');

  async function handlePay() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/speech-writer/api/speech-writer/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speech_id: speechId, access_token: accessToken, tier: selectedTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="co-main">
      <div className="container co-container">

        <div className="co-header">
          <p className="co-header__ornament" aria-hidden="true">✦</p>
          <h1 className="co-header__heading">Choose your package</h1>
          {couple ? (
            <p className="co-header__sub">
              Your {speakerRole ? speakerRole.toLowerCase() : 'wedding'} speech for {couple} is ready to write.
            </p>
          ) : (
            <p className="co-header__sub">
              Your {speakerRole ? speakerRole.toLowerCase() : 'wedding'} speech is ready to write.
            </p>
          )}
        </div>

        <div className="co-plans">
          {PLANS.map((plan) => (
            <button
              key={plan.tier}
              type="button"
              className={`co-plan${plan.tier === 'full' ? ' co-plan--featured' : ''}${selectedTier === plan.tier ? ' co-plan--selected' : ''}`}
              onClick={() => setSelectedTier(plan.tier)}
            >
              {plan.badge && <span className="co-plan__badge">{plan.badge}</span>}
              <p className="co-plan__name">{plan.name}</p>
              <p className="co-plan__price">{plan.price}</p>
              <p className="co-plan__period">one-time payment</p>
              <hr className="co-plan__divider" />
              <ul className="co-plan__features">
                {plan.features.map((f) => (
                  <li key={f} className="co-plan__feature">{f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="co-action">
          <button
            className="co-pay-btn"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? 'Redirecting to payment…' : `Pay ${PLANS.find(p => p.tier === selectedTier)?.price} →`}
          </button>

          {error && <p className="co-error">{error}</p>}

          <div className="co-trust">
            <span className="co-trust__item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L8.9 4.8L13 5.4L10 8.3L10.8 12.5L7 10.5L3.2 12.5L4 8.3L1 5.4L5.1 4.8L7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              14-day money-back guarantee
            </span>
            <span className="co-trust__sep" aria-hidden="true">·</span>
            <span className="co-trust__item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Secure payment via Stripe
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}
