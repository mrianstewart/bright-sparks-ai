'use client';

import { useState, useEffect, useRef } from 'react';
import { EmailCapture } from './email-capture';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  id: string;
  text: string;
  minutes: number;
}

interface Phase {
  steps: Step[];
  encouragement: string | null;
}

interface ApiResponse {
  phases: Phase[];
  finalMessage: string;
  totalMinutes: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  'Thinking about this…',
  'Breaking it into tiny pieces…',
  'Making it less scary…',
  'Almost there…',
];

const MINUTE_PRESETS = [10, 20, 30, 60];

// ─── Analytics helper ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const track = (event: string, props?: Record<string, string | boolean | number>) =>
  typeof window !== 'undefined' && (window as any).plausible?.(event, { props });

// ─── Share card (Canvas) ──────────────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      if (lines.length >= maxLines) return lines;
      current = word;
    } else {
      current = test;
    }
  }

  if (current && lines.length < maxLines) {
    if (ctx.measureText(current).width > maxWidth) {
      while (current.length > 3 && ctx.measureText(current + '…').width > maxWidth) {
        current = current.slice(0, -1);
      }
      current += '…';
    }
    lines.push(current);
  }

  return lines;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

async function generateShareCard(
  task: string,
  stepCount: number,
  totalMinutes: number
): Promise<Blob> {
  await document.fonts.ready;

  const W = 1200, H = 630, PAD = 64;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0F1B2D';
  ctx.fillRect(0, 0, W, H);

  // Subtle gradient
  const grad = ctx.createLinearGradient(0, 0, W * 0.6, H);
  grad.addColorStop(0, 'rgba(245, 166, 35, 0.06)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = 'rgba(245, 166, 35, 0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // Bolt watermark (top-right, very faint)
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#F5A623';
  ctx.translate(W - 210, 20);
  ctx.scale(0.85, 0.85);
  const bolt = new Path2D('M125 0L10 185H95L70 320L190 135H105L125 0Z');
  ctx.fill(bolt);
  ctx.restore();

  // App tag pill
  const TAG_X = PAD, TAG_Y = 76;
  drawRoundRect(ctx, TAG_X, TAG_Y - 20, 160, 32, 6);
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.fill();
  ctx.fillStyle = '#60A5FA';
  ctx.font = '600 13px ui-monospace, "Cascadia Code", monospace';
  ctx.fillText('MAGIC TODO', TAG_X + 16, TAG_Y + 2);

  // "I broke this down:" label
  ctx.fillStyle = 'rgba(156, 163, 175, 0.6)';
  ctx.font = '400 20px "DM Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('I just broke this down:', PAD, 158);

  // Task title
  ctx.fillStyle = '#E8E0D4';
  ctx.font = '700 52px "Sora", "Helvetica Neue", Arial, sans-serif';
  const titleLines = wrapText(ctx, `"${task}"`, W - PAD * 2, 2);
  titleLines.forEach((line, i) => ctx.fillText(line, PAD, 228 + i * 68));

  // Stats bar
  const statsY = 228 + titleLines.length * 68 + 56;
  ctx.fillStyle = '#F5A623';
  ctx.font = '600 26px "DM Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText(`${stepCount} steps`, PAD, statsY);

  if (totalMinutes > 0) {
    const dot = { x: PAD + ctx.measureText(`${stepCount} steps`).width + 20, y: statsY };
    ctx.fillStyle = 'rgba(156, 163, 175, 0.5)';
    ctx.beginPath();
    ctx.arc(dot.x, dot.y - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F5A623';
    ctx.fillText(`~${totalMinutes} min`, dot.x + 18, statsY);
  }

  // Watermark
  ctx.fillStyle = 'rgba(156, 163, 175, 0.38)';
  ctx.font = '400 17px "DM Sans", system-ui, -apple-system, sans-serif';
  ctx.fillText('Made with MagicTodo — brightsparks.ai/magic-todo', PAD, H - 52);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

type AppPhase = 'idle' | 'loading' | 'results' | 'error' | 'rate_limited';

export default function MagicTodoPage() {
  const [task,       setTask]       = useState('');
  const [minutes,    setMinutes]    = useState<number | null>(null);
  const [phase,      setPhase]      = useState<AppPhase>('idle');
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [result,     setResult]     = useState<ApiResponse | null>(null);
  const [taskLabel,  setTaskLabel]  = useState('');
  const [checked,    setChecked]    = useState<Set<string>>(new Set());
  const [errorMsg,   setErrorMsg]   = useState('');
  const [copyLabel,  setCopyLabel]  = useState('Copy to clipboard');
  const [shareLabel, setShareLabel] = useState('Share my breakdown');
  const [isSharing,  setIsSharing]  = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore checkboxes from localStorage
  useEffect(() => {
    if (phase === 'results' && taskLabel && result) {
      try {
        const stored = localStorage.getItem(`magic-todo:${taskLabel}`);
        if (stored) setChecked(new Set(JSON.parse(stored)));
      } catch { /* ignore */ }
    }
  }, [phase, taskLabel, result]);

  // Persist checkboxes
  useEffect(() => {
    if (!taskLabel || phase !== 'results') return;
    try {
      localStorage.setItem(`magic-todo:${taskLabel}`, JSON.stringify([...checked]));
    } catch { /* ignore */ }
  }, [checked, taskLabel, phase]);

  // Loading message rotation
  useEffect(() => {
    if (phase !== 'loading') return;
    setLoadingIdx(0);
    intervalRef.current = setInterval(() => {
      setLoadingIdx(i => (i + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  // Fire Plausible event when breakdown results appear
  useEffect(() => {
    if (phase === 'results' && result) {
      track('MagicTodo Breakdown', {
        taskLength: taskLabel.length,
        hasTimeLimit: minutes !== null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = task.trim();
    if (!trimmed) return;

    track('Breakdown Started', { hasTimeLimit: minutes !== null });

    setTaskLabel(trimmed);
    setChecked(new Set());
    setResult(null);
    setErrorMsg('');
    setPhase('loading');

    try {
      const res = await fetch('/magic-todo/api/magic-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: trimmed, timeMinutes: minutes ?? undefined }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setErrorMsg(data.message ?? 'Rate limit reached.');
        setPhase('rate_limited');
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.message ?? 'Something went wrong. Please try again.');
        setPhase('error');
        return;
      }

      const withIds: ApiResponse = {
        ...data,
        phases: (data.phases as Phase[]).map((p, pi) => ({
          ...p,
          steps: p.steps.map((s, si) => ({ ...s, id: `p${pi}s${si}` })),
        })),
      };

      setResult(withIds);
      setPhase('results');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setPhase('error');
    }
  }

  function handleReset() {
    setTask('');
    setMinutes(null);
    setTaskLabel('');
    setChecked(new Set());
    setResult(null);
    setErrorMsg('');
    setShareLabel('Share my breakdown');
    setPhase('idle');
  }

  function toggleStep(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCopy() {
    if (!result) return;
    const lines: string[] = [`Task: ${taskLabel}`, ''];
    result.phases.forEach((ph, pi) => {
      if (result.phases.length > 1) lines.push(`Phase ${pi + 1}`);
      ph.steps.forEach((s, si) => {
        const tick = checked.has(s.id) ? '[x]' : '[ ]';
        lines.push(`${tick} ${si + 1}. ${s.text} (~${s.minutes} min)`);
      });
      if (ph.encouragement) lines.push(`\n✨ ${ph.encouragement}`);
      lines.push('');
    });
    if (result.finalMessage) lines.push(result.finalMessage);

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy to clipboard'), 2000);
    });
  }

  async function handleShare() {
    if (!result || isSharing) return;
    setIsSharing(true);

    try {
      const blob = await generateShareCard(taskLabel, allSteps.length, result.totalMinutes);
      const file = new File([blob], 'magic-todo.png', { type: 'image/png' });

      if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${taskLabel} — ${allSteps.length} steps`,
          text: `I just broke down "${taskLabel}" into ${allSteps.length} tiny steps with MagicTodo!`,
        });
      } else {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setShareLabel('Image copied!');
        setTimeout(() => setShareLabel('Share my breakdown'), 3000);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        // Share cancelled or clipboard failed — silently ignore
      }
    } finally {
      setIsSharing(false);
    }
  }

  const allSteps = result?.phases.flatMap(p => p.steps) ?? [];
  const allDone  = allSteps.length > 0 && checked.size === allSteps.length;

  // Build X/Twitter share URL
  const tweetTask = taskLabel.length > 100 ? taskLabel.slice(0, 97) + '…' : taskLabel;
  const tweetText = encodeURIComponent(
    `I just broke down "${tweetTask}" into ${allSteps.length} tiny steps with @BrightSparksAI's MagicTodo 🧠✨ brightsparks.ai/magic-todo`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <>
      {/* ── IDLE: HERO + FORM ─────────────────────────────────── */}
      {phase === 'idle' && (
        <section className="mt-hero">
          <div className="mt-hero__bg-bolt" aria-hidden="true">
            <svg viewBox="0 0 200 320" fill="none">
              <path d="M125 0L10 185H95L70 320L190 135H105L125 0Z" fill="#F5A623"/>
            </svg>
          </div>

          <div className="mt-hero__inner">
            <span className="tag tag--app mt-hero__tag fade-in">MAGIC TODO</span>
            <h1 className="mt-hero__headline fade-in fade-in--1">
              What&apos;s overwhelming<br />you right now?
            </h1>
            <p className="mt-hero__sub fade-in fade-in--2">
              Type the thing you&apos;ve been avoiding. We&apos;ll break it into steps so small they feel almost easy.
            </p>

            <form onSubmit={handleSubmit} className="mt-form fade-in fade-in--3" aria-label="Task breakdown form">
              <textarea
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="Sort out my finances… Plan my wedding… Finally do my taxes…"
                className="mt-form__textarea"
                rows={3}
                required
                autoFocus
                aria-label="What's overwhelming you?"
              />

              <div className="mt-form__time-block">
                <span className="mt-form__optional">Optional</span>
                <div className="mt-form__time-row">
                  <label className="mt-form__time-label" htmlFor="mt-minutes">
                    I have
                    <input
                      id="mt-minutes"
                      type="number"
                      value={minutes ?? ''}
                      onChange={e => setMinutes(e.target.value ? Number(e.target.value) : null)}
                      placeholder="—"
                      min={1}
                      max={480}
                      className="mt-form__time-input"
                      aria-label="Available minutes"
                    />
                    minutes
                  </label>

                  <div className="mt-form__presets" role="group" aria-label="Quick time presets">
                    {MINUTE_PRESETS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMinutes(prev => prev === m ? null : m)}
                        className={`mt-preset${minutes === m ? ' mt-preset--active' : ''}`}
                        aria-pressed={minutes === m}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn--primary mt-form__submit">
                Break it down ✨
              </button>
            </form>

            <EmailCapture variant="hero" />
          </div>
        </section>
      )}

      {/* ── LOADING ─────────────────────────────────────────────── */}
      {phase === 'loading' && (
        <section className="mt-loading" aria-label="Processing your task">
          <div className="mt-loading__inner">
            <svg className="mt-spinner fade-in" viewBox="0 0 50 50" fill="none" aria-hidden="true">
              <circle className="mt-spinner__track" cx="25" cy="25" r="20" strokeWidth="3" />
              <circle className="mt-spinner__arc"   cx="25" cy="25" r="20" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="mt-loading__message fade-in fade-in--1" aria-live="polite" aria-atomic="true">
              {LOADING_MESSAGES[loadingIdx]}
            </p>
          </div>
        </section>
      )}

      {/* ── ERROR ────────────────────────────────────────────────── */}
      {(phase === 'error' || phase === 'rate_limited') && (
        <section className="mt-error" aria-label="Error">
          <div className="mt-error__inner fade-in">
            <span className="mt-error__icon" aria-hidden="true">
              {phase === 'rate_limited' ? '⏳' : '⚠️'}
            </span>
            <p className="mt-error__message">{errorMsg}</p>
            <button onClick={handleReset} className="btn btn--ghost">
              Try a different task
            </button>
          </div>
        </section>
      )}

      {/* ── RESULTS ─────────────────────────────────────────────── */}
      {phase === 'results' && result && (
        <section className="mt-results" aria-label="Your task breakdown">
          <header className="mt-results__header fade-in">
            <span className="tag tag--app">MAGIC TODO</span>
            <h1 className="mt-results__title">
              Breaking down: <em className="mt-results__task-name">&ldquo;{taskLabel}&rdquo;</em>
            </h1>
            <p className="mt-results__subtitle">
              {minutes
                ? `Here's how to make progress in ${minutes} minutes.`
                : 'Here\u2019s how to make it feel manageable.'}
              {result.totalMinutes > 0 && (
                <span className="mt-results__total-time"> · ~{result.totalMinutes} min total</span>
              )}
            </p>
          </header>

          {result.phases.map((ph, pi) => (
            <div key={pi} className="mt-phase">
              {result.phases.length > 1 && (
                <h2 className="mt-phase__label fade-in">Phase {pi + 1}</h2>
              )}

              <ol className="mt-steps" aria-label={`Phase ${pi + 1} steps`}>
                {ph.steps.map((step, si) => (
                  <li
                    key={step.id}
                    className={`mt-step${checked.has(step.id) ? ' mt-step--done' : ''}`}
                    style={{ animationDelay: `${si * 0.055}s` }}
                  >
                    <label className="mt-step__label">
                      <input
                        type="checkbox"
                        checked={checked.has(step.id)}
                        onChange={() => toggleStep(step.id)}
                        className="mt-step__checkbox"
                        aria-label={`Mark step ${si + 1} as done`}
                      />
                      <span className="mt-step__num" aria-hidden="true">{si + 1}</span>
                      <span className="mt-step__text">{step.text}</span>
                      <span className="mt-step__time" aria-label={`About ${step.minutes} minutes`}>~{step.minutes} min</span>
                    </label>
                  </li>
                ))}
              </ol>

              {ph.encouragement && (
                <div className="mt-encouragement" role="note">
                  <span className="mt-encouragement__spark" aria-hidden="true">✨</span>
                  <span>{ph.encouragement}</span>
                </div>
              )}
            </div>
          ))}

          <footer className="mt-results__footer fade-in">
            {allDone ? (
              <p className="mt-results__done-msg">
                {result.finalMessage || 'You did it. Every single step. That\u2019s not nothing \u2014 that\u2019s everything. \uD83C\uDF89'}
              </p>
            ) : (
              <>
                <p className="mt-results__progress">
                  <strong>{checked.size}</strong> of {allSteps.length} steps done
                </p>
                {result.finalMessage && (
                  <p className="mt-results__final-msg">{result.finalMessage}</p>
                )}
              </>
            )}

            <div className="mt-results__actions">
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="btn btn--ghost"
              >
                {isSharing ? 'Generating…' : shareLabel}
              </button>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--x"
              >
                Post on X
              </a>
              <button onClick={handleCopy} className="btn btn--ghost">
                {copyLabel}
              </button>
              <button onClick={handleReset} className="btn btn--ghost">
                Break down another task
              </button>
            </div>
          </footer>

          <EmailCapture variant="results" />
        </section>
      )}
    </>
  );
}
