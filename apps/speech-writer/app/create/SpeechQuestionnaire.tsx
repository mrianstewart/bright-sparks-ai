'use client';

import { useReducer, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ── Constants ─────────────────────────────────────────────────
const TOTAL_STEPS = 7;

const ROLES = [
  'Best Man',
  'Maid of Honour',
  'Father of the Bride',
  'Mother of the Bride',
  'Father of the Groom',
  'Mother of the Groom',
  'Groom',
  'Bride',
  'Close Friend',
  'Sibling',
  'Other',
];

const TONES = [
  {
    value: 'heartfelt',
    emoji: '💛',
    title: 'Heartfelt & Sincere',
    desc: 'Genuine emotion, maybe a tear or two. Perfect for parents or anyone who wants to wear their heart on their sleeve.',
    popular: false,
  },
  {
    value: 'warm-humour',
    emoji: '😂',
    title: 'Warm with Humour',
    desc: 'The classic UK speech. Funny stories, gentle ribbing, but lands on something meaningful. Most popular choice.',
    popular: true,
  },
  {
    value: 'roast',
    emoji: '🔥',
    title: 'Proper Roast',
    desc: "Best man territory. Embarrassing stories, callbacks, crowd work energy. Still ends with heart. (We'll keep it wedding-appropriate.)",
    popular: false,
  },
  {
    value: 'formal',
    emoji: '🎩',
    title: 'Formal & Traditional',
    desc: 'Elegant, structured, quotable. For traditional weddings or speakers who prefer polish over punchlines.',
    popular: false,
  },
];

const LENGTHS = [
  { value: '3', label: '3 minutes', words: '~400 words', note: 'Short and sweet' },
  { value: '5', label: '5 minutes', words: '~650 words', note: 'The sweet spot for most UK speeches' },
  { value: '7', label: '7 minutes', words: '~900 words', note: 'For those who have a lot to say' },
];

// ── State ─────────────────────────────────────────────────────
type FormState = {
  step: number;
  // Step 1
  role: string;
  roleOther: string;
  // Step 2
  partner1Name: string;
  partner2Name: string;
  togetherDuration: string;
  howTheyMet: string;
  weddingDate: string;
  // Step 3
  howYouKnow: string;
  knownDuration: string;
  wordForPartner: string;
  wordForRelationship: string;
  // Step 4
  story1: string;
  story2: string;
  story3: string;
  storyExtra: string;
  // Step 5
  tone: string;
  // Step 6
  lengthMinutes: string;
  // Step 7
  mustInclude: string;
  mustAvoid: string;
  email: string;
};

type Action =
  | { type: 'SET'; field: keyof Omit<FormState, 'step'>; value: string }
  | { type: 'SET_ROLE'; value: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GO_TO'; step: number };

const initial: FormState = {
  step: 1,
  role: '',
  roleOther: '',
  partner1Name: '',
  partner2Name: '',
  togetherDuration: '',
  howTheyMet: '',
  weddingDate: '',
  howYouKnow: '',
  knownDuration: '',
  wordForPartner: '',
  wordForRelationship: '',
  story1: '',
  story2: '',
  story3: '',
  storyExtra: '',
  tone: '',
  lengthMinutes: '5',
  mustInclude: '',
  mustAvoid: '',
  email: '',
};

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_ROLE':
      return {
        ...state,
        role: action.value,
        roleOther: action.value !== 'Other' ? '' : state.roleOther,
      };
    case 'SET':
      return { ...state, [action.field]: action.value };
    case 'NEXT':
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS) };
    case 'BACK':
      return { ...state, step: Math.max(state.step - 1, 1) };
    case 'GO_TO':
      return { ...state, step: action.step };
  }
}

function set(
  dispatch: React.Dispatch<Action>,
  field: keyof Omit<FormState, 'step'>
) {
  return (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'SET', field, value: e.target.value });
}

function canContinue(state: FormState): boolean {
  switch (state.step) {
    case 1:
      return (
        state.role !== '' &&
        (state.role !== 'Other' || state.roleOther.trim().length > 0)
      );
    case 2:
      return (
        state.partner1Name.trim().length > 0 &&
        state.partner2Name.trim().length > 0 &&
        state.togetherDuration.trim().length > 0 &&
        state.howTheyMet.trim().length > 0
      );
    case 3:
      return (
        state.howYouKnow.trim().length > 0 &&
        state.knownDuration.trim().length > 0 &&
        state.wordForPartner.trim().length > 0 &&
        state.wordForRelationship.trim().length > 0
      );
    case 4:
      return (
        state.story1.trim().length >= 50 &&
        state.story2.trim().length >= 50
      );
    case 5:
      return state.tone !== '';
    case 6:
      return true;
    case 7:
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
    default:
      return true;
  }
}

// ── Shared field components ───────────────────────────────────
function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sw-q-field">
      <label className="sw-q-label">{label}</label>
      {children}
      {helper && <p className="sw-q-helper">{helper}</p>}
    </div>
  );
}

function StoryArea({
  label,
  value,
  field,
  dispatch,
  required,
  minChars = 50,
}: {
  label: string;
  value: string;
  field: keyof Omit<FormState, 'step'>;
  dispatch: React.Dispatch<Action>;
  required: boolean;
  minChars?: number;
}) {
  const count = value.length;
  const meetsMin = count >= minChars;
  return (
    <div className="sw-q-field">
      <label className="sw-q-label">
        {label}
        {!required && <span className="sw-q-optional"> — optional</span>}
      </label>
      <div className="sw-story-wrap">
        <textarea
          className="sw-q-textarea"
          value={value}
          onChange={(e) =>
            dispatch({ type: 'SET', field, value: e.target.value })
          }
          rows={5}
        />
        <div className="sw-story-footer">
          <span className="sw-story-hint">
            Aim for at least 2–3 sentences — the more detail, the better your speech.
          </span>
          <span
            className={`sw-story-count${required && !meetsMin && count > 0 ? ' sw-story-count--warn' : ''}${required && meetsMin ? ' sw-story-count--ok' : ''}`}
          >
            {count}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Step components ───────────────────────────────────────────
function Step1({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">Who are you in this story?</h1>
      <div className="sw-role-grid">
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            className={`sw-role-card${state.role === role ? ' sw-role-card--selected' : ''}`}
            onClick={() => dispatch({ type: 'SET_ROLE', value: role })}
          >
            {role}
          </button>
        ))}
      </div>
      {state.role === 'Other' && (
        <div className="sw-role-other">
          <input
            className="sw-q-input"
            type="text"
            placeholder="Describe your role…"
            value={state.roleOther}
            onChange={set(dispatch, 'roleOther')}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

function Step2({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">Tell us about the lovebirds.</h1>
      <div className="sw-q-fields">
        <Field label="Their name (the one you're closest to)">
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. Jamie"
            value={state.partner1Name}
            onChange={set(dispatch, 'partner1Name')}
          />
        </Field>
        <Field label="Their partner's name">
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. Alex"
            value={state.partner2Name}
            onChange={set(dispatch, 'partner2Name')}
          />
        </Field>
        <Field label="How long have they been together?">
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. 4 years, since 2019"
            value={state.togetherDuration}
            onChange={set(dispatch, 'togetherDuration')}
          />
        </Field>
        <Field label="How did they meet?">
          <input
            className="sw-q-input"
            type="text"
            placeholder="At uni, through mutual friends, on Hinge…"
            value={state.howTheyMet}
            onChange={set(dispatch, 'howTheyMet')}
          />
        </Field>
        <Field
          label="Wedding date"
          helper="Helps us tailor the timing references"
        >
          <input
            className="sw-q-input sw-q-input--date"
            type="date"
            value={state.weddingDate}
            onChange={set(dispatch, 'weddingDate')}
          />
        </Field>
      </div>
    </div>
  );
}

function Step3({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  const name = state.partner1Name.trim() || 'them';
  const nameLabel = state.partner1Name.trim() || 'the couple';

  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">How do you fit into their story?</h1>
      <div className="sw-q-fields">
        <Field label={`How do you know ${nameLabel}?`}>
          <input
            className="sw-q-input"
            type="text"
            placeholder={`e.g. We went to school together, I'm ${name}'s work colleague`}
            value={state.howYouKnow}
            onChange={set(dispatch, 'howYouKnow')}
          />
        </Field>
        <Field label={`How long have you known ${name}?`}>
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. 10 years, since we were kids"
            value={state.knownDuration}
            onChange={set(dispatch, 'knownDuration')}
          />
        </Field>
        <Field
          label={`One word to describe ${name}`}
          helper="The first word that comes to mind"
        >
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. Generous"
            value={state.wordForPartner}
            onChange={(e) => {
              const val = e.target.value.replace(/\s/g, '');
              dispatch({ type: 'SET', field: 'wordForPartner', value: val });
            }}
          />
        </Field>
        <Field label="One word to describe their relationship">
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. Unbreakable"
            value={state.wordForRelationship}
            onChange={(e) => {
              const val = e.target.value.replace(/\s/g, '');
              dispatch({ type: 'SET', field: 'wordForRelationship', value: val });
            }}
          />
        </Field>
      </div>
    </div>
  );
}

function Step4({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  const p1 = state.partner1Name.trim() || 'them';
  const p2 = state.partner2Name.trim() || 'their partner';

  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">This is where the magic happens.</h1>
      <p className="sw-q-subheading">
        The more you give us, the better your speech.
      </p>
      <div className="sw-q-fields">
        <StoryArea
          label={`Tell us about a time ${p1} made everyone laugh. Or a time they really embarrassed themselves.`}
          value={state.story1}
          field="story1"
          dispatch={dispatch}
          required={true}
        />
        <StoryArea
          label={`What's a memory that shows what kind of person ${p1} is? Something that makes you proud to know them.`}
          value={state.story2}
          field="story2"
          dispatch={dispatch}
          required={true}
        />
        <StoryArea
          label={`When did you first realise ${p1} and ${p2} were going to last? Was there a moment?`}
          value={state.story3}
          field="story3"
          dispatch={dispatch}
          required={false}
        />
        <StoryArea
          label="Anything else? An inside joke, a running gag, something the audience will get?"
          value={state.storyExtra}
          field="storyExtra"
          dispatch={dispatch}
          required={false}
        />
      </div>
    </div>
  );
}

function Step5({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">What vibe are you going for?</h1>
      <div className="sw-tone-grid">
        {TONES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`sw-tone-card${state.tone === t.value ? ' sw-tone-card--selected' : ''}`}
            onClick={() => dispatch({ type: 'SET', field: 'tone', value: t.value })}
          >
            {t.popular && <span className="sw-tone-badge">Most popular</span>}
            <span className="sw-tone-emoji">{t.emoji}</span>
            <span className="sw-tone-title">{t.title}</span>
            <span className="sw-tone-desc">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step6({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">How long do you want to talk?</h1>
      <div className="sw-length-grid">
        {LENGTHS.map((l) => (
          <button
            key={l.value}
            type="button"
            className={`sw-length-card${state.lengthMinutes === l.value ? ' sw-length-card--selected' : ''}`}
            onClick={() =>
              dispatch({ type: 'SET', field: 'lengthMinutes', value: l.value })
            }
          >
            <span className="sw-length-label">{l.label}</span>
            <span className="sw-length-words">{l.words}</span>
            <span className="sw-length-note">{l.note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step7({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">Almost there. Anything else we should know?</h1>
      <div className="sw-q-fields">
        <div className="sw-q-field">
          <label className="sw-q-label">
            Anything you definitely want included?
            <span className="sw-q-optional"> — optional</span>
          </label>
          <textarea
            className="sw-q-textarea"
            value={state.mustInclude}
            onChange={(e) =>
              dispatch({ type: 'SET', field: 'mustInclude', value: e.target.value })
            }
            rows={3}
            placeholder="A particular toast, a quote, a line you've always wanted to say…"
          />
        </div>
        <div className="sw-q-field">
          <label className="sw-q-label">
            Anything you definitely want us to avoid?
            <span className="sw-q-optional"> — optional</span>
          </label>
          <textarea
            className="sw-q-textarea"
            value={state.mustAvoid}
            onChange={(e) =>
              dispatch({ type: 'SET', field: 'mustAvoid', value: e.target.value })
            }
            rows={3}
            placeholder="Don't mention the ex, Dad's health isn't great — keep it upbeat…"
          />
        </div>
        <Field
          label="Your email"
          helper="We'll send you a link to access your speech anytime"
        >
          <input
            className="sw-q-input"
            type="email"
            placeholder="you@example.com"
            value={state.email}
            onChange={set(dispatch, 'email')}
            inputMode="email"
            autoComplete="email"
          />
        </Field>
      </div>
    </div>
  );
}

// ── Review screen ─────────────────────────────────────────────
function truncate(s: string, n = 100) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="sw-review-section">
      <div className="sw-review-section__header">
        <h2 className="sw-review-section__title">{title}</h2>
        <button type="button" className="sw-review-edit" onClick={onEdit}>
          Edit
        </button>
      </div>
      <div className="sw-review-section__body">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="sw-review-row">
      <span className="sw-review-row__label">{label}</span>
      <span className="sw-review-row__value">{value}</span>
    </div>
  );
}

function ReviewScreen({
  state,
  onEdit,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  state: FormState;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const displayRole =
    state.role === 'Other' ? state.roleOther : state.role;
  const toneLabel =
    TONES.find((t) => t.value === state.tone)?.title ?? state.tone;
  const lengthOption = LENGTHS.find((l) => l.value === state.lengthMinutes);
  const lengthLabel = lengthOption
    ? `${lengthOption.label} (${lengthOption.words})`
    : `${state.lengthMinutes} minutes`;

  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">Does everything look right?</h1>
      <p className="sw-q-subheading">
        Take a moment to check your answers before we generate your speech.
      </p>

      <div className="sw-review-list">
        <ReviewSection title="Your Role" onEdit={() => onEdit(1)}>
          <ReviewRow label="Role" value={displayRole} />
        </ReviewSection>

        <ReviewSection title="The Happy Couple" onEdit={() => onEdit(2)}>
          <ReviewRow label="Closest to" value={state.partner1Name} />
          <ReviewRow label="Their partner" value={state.partner2Name} />
          <ReviewRow label="Together" value={state.togetherDuration} />
          <ReviewRow label="How they met" value={state.howTheyMet} />
          {state.weddingDate && (
            <ReviewRow label="Wedding date" value={state.weddingDate} />
          )}
        </ReviewSection>

        <ReviewSection title="Your Relationship" onEdit={() => onEdit(3)}>
          <ReviewRow label="How you know them" value={state.howYouKnow} />
          <ReviewRow label="Known for" value={state.knownDuration} />
          <ReviewRow
            label={`One word for ${state.partner1Name || 'them'}`}
            value={state.wordForPartner}
          />
          <ReviewRow
            label="One word for their relationship"
            value={state.wordForRelationship}
          />
        </ReviewSection>

        <ReviewSection title="Your Stories" onEdit={() => onEdit(4)}>
          <ReviewRow label="Story 1" value={truncate(state.story1)} />
          <ReviewRow label="Story 2" value={truncate(state.story2)} />
          {state.story3 && (
            <ReviewRow label="Story 3" value={truncate(state.story3)} />
          )}
          {state.storyExtra && (
            <ReviewRow label="Extra" value={truncate(state.storyExtra)} />
          )}
        </ReviewSection>

        <ReviewSection title="Tone & Length" onEdit={() => onEdit(5)}>
          <ReviewRow label="Tone" value={toneLabel} />
          <ReviewRow label="Length" value={lengthLabel} />
        </ReviewSection>

        {(state.mustInclude || state.mustAvoid) && (
          <ReviewSection title="Final Touches" onEdit={() => onEdit(7)}>
            {state.mustInclude && (
              <ReviewRow
                label="Must include"
                value={truncate(state.mustInclude)}
              />
            )}
            {state.mustAvoid && (
              <ReviewRow
                label="Must avoid"
                value={truncate(state.mustAvoid)}
              />
            )}
          </ReviewSection>
        )}

        <ReviewSection title="Your Email" onEdit={() => onEdit(7)}>
          <ReviewRow label="Email" value={state.email} />
        </ReviewSection>
      </div>

      {submitError && (
        <div className="sw-review-error" role="alert">
          {submitError}
        </div>
      )}

      <button
        type="button"
        className="sw-review-submit"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving your answers…' : 'Generate My Speech →'}
      </button>

      <p className="sw-review-legal">
        By continuing, you agree to our{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step - 1) / (total - 1)) * 100;
  return (
    <div className="sw-progress">
      <div className="sw-progress__label">
        Step {step} of {total}
      </div>
      <div className="sw-progress__track">
        <div className="sw-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function SpeechQuestionnaire() {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initial);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const ok = canContinue(state);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigate = (forward: boolean) => {
    setDirection(forward ? 'forward' : 'back');
    setAnimKey((k) => k + 1);
    scrollToTop();
  };

  const handleNext = () => {
    if (!ok) return;
    if (state.step === TOTAL_STEPS) {
      navigate(true);
      setReviewing(true);
      return;
    }
    navigate(true);
    dispatch({ type: 'NEXT' });
  };

  const handleBack = () => {
    if (reviewing) {
      navigate(false);
      setReviewing(false);
      return;
    }
    navigate(false);
    dispatch({ type: 'BACK' });
  };

  const handleEdit = (step: number) => {
    navigate(false);
    setReviewing(false);
    dispatch({ type: 'GO_TO', step });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/speech-writer/api/speeches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      router.push(`/speech-writer/checkout/${data.access_token}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const displayStep = Math.min(state.step, TOTAL_STEPS);

  const showBack = state.step > 1 || reviewing;

  return (
    <div className="sw-questionnaire">
      <div className="container container--narrow">
        <div ref={topRef} className="sw-q-topnav">
          {showBack && (
            <button
              type="button"
              className="sw-q-btn sw-q-btn--back"
              onClick={handleBack}
            >
              ← Back
            </button>
          )}
        </div>
        <ProgressBar step={displayStep} total={TOTAL_STEPS} />

        <div
          key={animKey}
          className={`sw-q-content sw-q-content--${direction}`}
        >
          {!reviewing && state.step === 1 && (
            <Step1 state={state} dispatch={dispatch} />
          )}
          {!reviewing && state.step === 2 && (
            <Step2 state={state} dispatch={dispatch} />
          )}
          {!reviewing && state.step === 3 && (
            <Step3 state={state} dispatch={dispatch} />
          )}
          {!reviewing && state.step === 4 && (
            <Step4 state={state} dispatch={dispatch} />
          )}
          {!reviewing && state.step === 5 && (
            <Step5 state={state} dispatch={dispatch} />
          )}
          {!reviewing && state.step === 6 && (
            <Step6 state={state} dispatch={dispatch} />
          )}
          {!reviewing && state.step === 7 && (
            <Step7 state={state} dispatch={dispatch} />
          )}
          {reviewing && (
            <ReviewScreen
              state={state}
              onEdit={handleEdit}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </div>

        {!reviewing && (
          <div className="sw-q-nav">
            {state.step > 1 ? (
              <button
                type="button"
                className="sw-q-btn sw-q-btn--back"
                onClick={handleBack}
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="sw-q-btn sw-q-btn--continue"
              onClick={handleNext}
              disabled={!ok}
            >
              {state.step === TOTAL_STEPS ? 'Review Your Answers →' : 'Continue →'}
            </button>
          </div>
        )}

        {reviewing && (
          <div className="sw-q-nav">
            <button
              type="button"
              className="sw-q-btn sw-q-btn--back"
              onClick={handleBack}
            >
              ← Back
            </button>
            <span />
          </div>
        )}
      </div>
    </div>
  );
}
