import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'The Roast Machine — Get your website brutally critiqued by AI judges';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#020617', // slate-950
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(234,88,12,0.12) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(139,92,246,0.08) 0%, transparent 50%)',
          }}
        />

        {/* Bright Sparks wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '48px',
            opacity: 0.6,
          }}
        >
          {/* Bolt icon — inline SVG path rendered as a div shape */}
          <svg width="14" height="22" viewBox="0 0 20 32" fill="none">
            <path d="M12.5 0L1 18.5H9.5L7 32L19 13H10.5L12.5 0Z" fill="#F5A623" />
          </svg>
          <span style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Bright Sparks AI
          </span>
        </div>

        {/* Flame */}
        <div style={{ fontSize: '72px', marginBottom: '24px', lineHeight: 1 }}>🔥</div>

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          The Roast Machine
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#94a3b8', // slate-400
            lineHeight: 1.4,
            maxWidth: '750px',
          }}
        >
          Paste any website URL. Three AI judges will tear it apart.
        </div>

        {/* Judge tags */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '48px' }}>
          {[
            { emoji: '🎨', label: 'Design', color: '#fb7185' },
            { emoji: '✍️', label: 'Copy', color: '#a3e635' },
            { emoji: '📈', label: 'Vibes', color: '#a78bfa' },
          ].map(({ emoji, label, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px',
                padding: '8px 20px',
                fontSize: '20px',
                color,
                fontWeight: 600,
              }}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
