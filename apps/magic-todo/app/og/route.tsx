import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#080E1A',
          padding: '64px 80px',
          fontFamily: 'system-ui, -apple-system, "Helvetica Neue", sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Faint bolt watermark */}
        <svg
          viewBox="0 0 200 320"
          fill="none"
          style={{
            position: 'absolute',
            top: -20,
            right: 30,
            width: 280,
            height: 448,
            opacity: 0.05,
          }}
        >
          <path d="M125 0L10 185H95L70 320L190 135H105L125 0Z" fill="#F5A623" />
        </svg>

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '52px' }}>
          <svg width="16" height="26" viewBox="0 0 200 320" fill="none">
            <path d="M125 0L10 185H95L70 320L190 135H105L125 0Z" fill="#F5A623" />
          </svg>
          <span style={{ color: '#F5A623', fontSize: '18px', fontWeight: '700' }}>
            Bright Sparks AI
          </span>
        </div>

        {/* App tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(59,130,246,0.18)',
            border: '1px solid rgba(59,130,246,0.35)',
            borderRadius: '6px',
            padding: '5px 14px',
            marginBottom: '32px',
            alignSelf: 'flex-start',
          }}
        >
          <span style={{ color: '#60A5FA', fontSize: '13px', fontWeight: '600' }}>
            MAGIC TODO
          </span>
        </div>

        {/* Headline line 1 */}
        <div
          style={{
            color: '#F0EAE2',
            fontSize: '68px',
            fontWeight: '800',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '4px',
          }}
        >
          Break any overwhelming
        </div>

        {/* Headline line 2 */}
        <div
          style={{
            color: '#F0EAE2',
            fontSize: '68px',
            fontWeight: '800',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '32px',
          }}
        >
          task into tiny steps
        </div>

        {/* Subtext */}
        <div
          style={{
            color: 'rgba(156,163,175,0.8)',
            fontSize: '24px',
            lineHeight: 1.55,
            maxWidth: '720px',
          }}
        >
          Type the thing you've been avoiding. AI breaks it into steps so small they feel almost easy.
        </div>

        {/* Bottom accent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'absolute',
            bottom: 60,
            left: 80,
          }}
        >
          <div style={{ width: 36, height: 3, backgroundColor: '#F5A623', borderRadius: 2 }} />
          <span style={{ color: 'rgba(156,163,175,0.5)', fontSize: '16px' }}>
            brightsparks.ai/magic-todo
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
