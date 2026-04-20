'use client';

import { useReducer, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

// ── Role groups ───────────────────────────────────────────────
// A1=Best Man, A2=Maid of Honour, A3=Sibling, A4=Close Friend
type RoleGroup = 'A1' | 'A2' | 'A3' | 'A4' | 'B' | 'C' | 'D';

function getRoleGroup(role: string): RoleGroup {
  if (role === 'Best Man') return 'A1';
  if (role === 'Maid of Honour') return 'A2';
  if (role === 'Sibling') return 'A3';
  if (role === 'Close Friend') return 'A4';
  if (['Father of the Bride', 'Mother of the Bride', 'Father of the Groom', 'Mother of the Groom'].includes(role)) return 'B';
  if (['Bride', 'Groom'].includes(role)) return 'C';
  return 'D';
}

// ── State ─────────────────────────────────────────────────────
type FormState = {
  step: number;
  // Step 1
  role: string;
  roleOther: string;
  roleGroup: RoleGroup;
  // Step 2
  partner1Name: string;
  partner2Name: string;
  siblingOf: string;   // A3: 'bride' | 'groom' | ''
  friendOf: string;    // A4: 'bride' | 'groom' | ''
  togetherDuration: string;
  howTheyMet: string;
  weddingDate: string;
  // Step 3 — Group A / D
  howYouKnow: string;
  knownDuration: string;
  wordForPartner: string;
  wordForRelationship: string;
  // Step 3 — Group B (parents)
  wordForPartnerAsChild: string;
  wordForPartnerNow: string;
  wordForPartnerWith2: string;
  familyMessage: string;
  // Step 3 — Group C (bride/groom)
  whatNobodySees: string;
  whoToThank: string;
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

// ── Dev presets ───────────────────────────────────────────────
const PRESETS: Record<string, Partial<Omit<FormState, 'step'>>> = {
  'best-man': {
    role: 'Best Man',
    roleGroup: 'A1',
    partner1Name: 'James',
    partner2Name: 'Sophie',
    howTheyMet: "At a mutual friend's house party in Bristol, back in 2019",
    weddingDate: '2026-08-16',
    howYouKnow: "We met at freshers week at Bristol Uni — he spilled a pint on me and somehow that turned into a decade of friendship",
    knownDuration: '12 years',
    wordForPartner: 'Loyal',
    wordForRelationship: 'Unshakeable',
    story1: "The stag do in Edinburgh. James decided he could do a Scottish accent after three whiskies — he could not. He spent twenty minutes ordering \"a wee dram\" in what can only be described as Irish-Australian, before the barman took pity and handed him a Guinness. What made it worse was that James then thanked him in the accent. He committed. That's James all over — once he's decided something, he's in, whether or not it's a good idea.",
    story2: "A few years back, James's mum was in hospital for a week. He drove three hours each way, every single day, without telling anyone. No Instagram post, no mention to any of us until much later. I found out because his sister let it slip. That's who James is when no one's watching — the same person he is when everyone is.",
    story3: "First time I saw them together properly was at my birthday dinner, about two years ago. James is someone who's always slightly distracted — checking his phone, looking around. But that night, he didn't take his eyes off Sophie once. I thought: he's done for. In the best possible way.",
    storyExtra: "The group has a running joke that James cannot, under any circumstances, parallel park. He knows it, we know it, Sophie definitely knows it. There's a WhatsApp thread called \"James Parking Watch\" with 200+ photos.",
    tone: 'warm-humour',
    lengthMinutes: '5',
    mustAvoid: "Don't mention the Prague trip — you know why",
    email: 'test@brightsparks.ai',
  },
  'father-of-bride': {
    role: 'Father of the Bride',
    roleGroup: 'B',
    partner1Name: 'Emma',
    partner2Name: 'Tom',
    togetherDuration: '4 years',
    howTheyMet: 'They met at work — same team at a marketing agency in London',
    weddingDate: '2026-09-05',
    wordForPartnerAsChild: 'Spirited',
    wordForPartnerNow: 'Remarkable',
    wordForPartnerWith2: 'Radiant',
    familyMessage: "Tom, you're joining a loud, loving, and occasionally chaotic family. We couldn't be happier to have you.",
    story1: "Emma at age seven, absolutely insisting she could build a den in the garden that would \"definitely withstand a storm.\" It rained that afternoon. She stood inside, soaking wet, refusing to admit it had collapsed, explaining this was \"just phase one.\" She's been like that ever since — stubborn in the best possible way.",
    story2: "When Emma was about sixteen, her grandmother was ill. Without being asked, Emma started visiting her every weekend. Not dutifully — she'd bring films, paint her nails, stay for hours. It wasn't something she announced. It was just something she did.",
    story3: "Tom came to Sunday lunch about a year into them dating. He arrived early, helped set the table without being asked, then spent twenty minutes asking my wife about her garden. Genuinely interested, with follow-up questions. I knew then.",
    storyExtra: "We have a Christmas morning tradition where everyone says one thing they're grateful for before opening presents. Emma rolls her eyes every year and gives the most thoughtful answer every year. Tom joined in last Christmas — his first with us — without prompting. He just knew.",
    tone: 'heartfelt',
    lengthMinutes: '5',
    mustInclude: "Something about how proud her mum and I are of the person she's become",
    email: 'test@brightsparks.ai',
  },
};

const initial: FormState = {
  step: 1,
  role: '',
  roleOther: '',
  roleGroup: 'D',
  partner1Name: '',
  partner2Name: '',
  siblingOf: '',
  friendOf: '',
  togetherDuration: '',
  howTheyMet: '',
  weddingDate: '',
  howYouKnow: '',
  knownDuration: '',
  wordForPartner: '',
  wordForRelationship: '',
  wordForPartnerAsChild: '',
  wordForPartnerNow: '',
  wordForPartnerWith2: '',
  familyMessage: '',
  whatNobodySees: '',
  whoToThank: '',
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
        roleGroup: getRoleGroup(action.value),
        siblingOf: '',
        friendOf: '',
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
    case 2: {
      const g2 = state.roleGroup;
      const namesOk =
        state.partner1Name.trim().length > 0 &&
        (g2 === 'C' || state.partner2Name.trim().length > 0);
      if (g2 === 'A1' || g2 === 'A2')
        return namesOk && state.howTheyMet.trim().length > 0;
      if (g2 === 'A3')
        return state.siblingOf !== '' && namesOk && state.togetherDuration.trim().length > 0 && state.howTheyMet.trim().length > 0;
      if (g2 === 'A4')
        return state.friendOf !== '' && namesOk && state.togetherDuration.trim().length > 0 && state.howTheyMet.trim().length > 0;
      return namesOk && state.togetherDuration.trim().length > 0 && state.howTheyMet.trim().length > 0;
    }
    case 3: {
      const g3 = state.roleGroup;
      if (g3 === 'B')
        return state.wordForPartnerAsChild.trim().length > 0 && state.wordForPartnerNow.trim().length > 0 && state.wordForPartnerWith2.trim().length > 0;
      if (g3 === 'C')
        return state.wordForPartner.trim().length > 0 && state.whatNobodySees.trim().length > 0;
      if (g3 === 'A1' || g3 === 'A2')
        return state.howYouKnow.trim().length > 0 && state.knownDuration.trim().length > 0 && state.wordForPartner.trim().length > 0 && state.wordForRelationship.trim().length > 0;
      if (g3 === 'A3')
        return state.knownDuration.trim().length > 0 && state.wordForPartner.trim().length > 0 && state.wordForRelationship.trim().length > 0;
      // A4 and D
      return state.howYouKnow.trim().length > 0 && state.knownDuration.trim().length > 0 && state.wordForPartner.trim().length > 0 && state.wordForRelationship.trim().length > 0;
    }
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

function WeddingDateField({ state, dispatch }: { state: FormState; dispatch: React.Dispatch<Action> }) {
  return (
    <Field label="Wedding date" helper="Helps us tailor the timing references">
      <input
        className="sw-q-input sw-q-input--date"
        type="date"
        value={state.weddingDate}
        onChange={set(dispatch, 'weddingDate')}
      />
    </Field>
  );
}

function HowTheyMetField({ state, dispatch, label = 'How did they meet?' }: { state: FormState; dispatch: React.Dispatch<Action>; label?: string }) {
  return (
    <Field label={label}>
      <textarea
        className="sw-q-textarea"
        rows={3}
        placeholder="At uni, through mutual friends, on Hinge…"
        value={state.howTheyMet}
        onChange={(e) => dispatch({ type: 'SET', field: 'howTheyMet', value: e.target.value })}
      />
    </Field>
  );
}

function SidePickerField({
  question,
  value,
  field,
  dispatch,
}: {
  question: string;
  value: string;
  field: 'siblingOf' | 'friendOf';
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="sw-q-field">
      <label className="sw-q-label">{question}</label>
      <div className="sw-role-grid">
        <button
          type="button"
          className={`sw-role-card${value === 'bride' ? ' sw-role-card--selected' : ''}`}
          onClick={() => dispatch({ type: 'SET', field, value: 'bride' })}
        >
          The Bride
        </button>
        <button
          type="button"
          className={`sw-role-card${value === 'groom' ? ' sw-role-card--selected' : ''}`}
          onClick={() => dispatch({ type: 'SET', field, value: 'groom' })}
        >
          The Groom
        </button>
      </div>
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
  const g = state.roleGroup;

  // A1 — Best Man (knows the groom → p1 = groom)
  if (g === 'A1') {
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">Tell us about the happy couple.</h1>
        <div className="sw-q-fields">
          <Field label="What's the groom's name?">
            <input className="sw-q-input" type="text" placeholder="e.g. Jamie"
              value={state.partner1Name} onChange={set(dispatch, 'partner1Name')} />
          </Field>
          <Field label="And the bride's name?">
            <input className="sw-q-input" type="text" placeholder="e.g. Alex"
              value={state.partner2Name} onChange={set(dispatch, 'partner2Name')} />
          </Field>
          <HowTheyMetField state={state} dispatch={dispatch} />
          <WeddingDateField state={state} dispatch={dispatch} />
        </div>
      </div>
    );
  }

  // A2 — Maid of Honour (knows the bride → p1 = bride)
  if (g === 'A2') {
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">Tell us about the happy couple.</h1>
        <div className="sw-q-fields">
          <Field label="What's the bride's name?">
            <input className="sw-q-input" type="text" placeholder="e.g. Alex"
              value={state.partner1Name} onChange={set(dispatch, 'partner1Name')} />
          </Field>
          <Field label="And the groom's name?">
            <input className="sw-q-input" type="text" placeholder="e.g. Jamie"
              value={state.partner2Name} onChange={set(dispatch, 'partner2Name')} />
          </Field>
          <HowTheyMetField state={state} dispatch={dispatch} />
          <WeddingDateField state={state} dispatch={dispatch} />
        </div>
      </div>
    );
  }

  // A3 — Sibling (we don't know which side)
  if (g === 'A3') {
    const chosen = state.siblingOf !== '';
    const isBride = state.siblingOf === 'bride';
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">Tell us about the happy couple.</h1>
        <div className="sw-q-fields">
          <SidePickerField
            question="Are you a sibling of the bride or the groom?"
            value={state.siblingOf}
            field="siblingOf"
            dispatch={dispatch}
          />
          {chosen && (
            <>
              <Field label={isBride ? "What's the bride's name?" : "What's the groom's name?"}>
                <input className="sw-q-input" type="text" placeholder="e.g. Jamie"
                  value={state.partner1Name} onChange={set(dispatch, 'partner1Name')} />
              </Field>
              <Field label={isBride ? "And the groom's name?" : "And the bride's name?"}>
                <input className="sw-q-input" type="text" placeholder="e.g. Alex"
                  value={state.partner2Name} onChange={set(dispatch, 'partner2Name')} />
              </Field>
              <Field label="How long have they been together?">
                <input className="sw-q-input" type="text" placeholder="e.g. 4 years, since 2019"
                  value={state.togetherDuration} onChange={set(dispatch, 'togetherDuration')} />
              </Field>
              <HowTheyMetField state={state} dispatch={dispatch} />
              <WeddingDateField state={state} dispatch={dispatch} />
            </>
          )}
        </div>
      </div>
    );
  }

  // A4 — Close Friend (we don't know which side)
  if (g === 'A4') {
    const chosen = state.friendOf !== '';
    const isBride = state.friendOf === 'bride';
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">Tell us about the happy couple.</h1>
        <div className="sw-q-fields">
          <SidePickerField
            question="Are you mainly a friend of the bride or the groom?"
            value={state.friendOf}
            field="friendOf"
            dispatch={dispatch}
          />
          {chosen && (
            <>
              <Field label={isBride ? "What's the bride's name?" : "What's the groom's name?"}>
                <input className="sw-q-input" type="text" placeholder="e.g. Jamie"
                  value={state.partner1Name} onChange={set(dispatch, 'partner1Name')} />
              </Field>
              <Field label={isBride ? "And the groom's name?" : "And the bride's name?"}>
                <input className="sw-q-input" type="text" placeholder="e.g. Alex"
                  value={state.partner2Name} onChange={set(dispatch, 'partner2Name')} />
              </Field>
              <Field label="How long have they been together?">
                <input className="sw-q-input" type="text" placeholder="e.g. 4 years, since 2019"
                  value={state.togetherDuration} onChange={set(dispatch, 'togetherDuration')} />
              </Field>
              <HowTheyMetField state={state} dispatch={dispatch} />
              <WeddingDateField state={state} dispatch={dispatch} />
            </>
          )}
        </div>
      </div>
    );
  }

  // Groups B, C, D
  const p1Label =
    g === 'B' ? "What's your child's name?" :
    g === 'C' ? "What's your partner's name?" :
    "Partner 1 name";

  const durationLabel = g === 'C' ? 'How long have you been together?' : 'How long have they been together?';
  const metLabel = g === 'C' ? 'How did you meet?' : 'How did they meet?';

  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">Tell us about the lovebirds.</h1>
      <div className="sw-q-fields">
        <Field label={p1Label}>
          <input className="sw-q-input" type="text" placeholder="e.g. Jamie"
            value={state.partner1Name} onChange={set(dispatch, 'partner1Name')} />
        </Field>

        {g !== 'C' && (
          <Field label="And their partner's name?">
            <input className="sw-q-input" type="text" placeholder="e.g. Alex"
              value={state.partner2Name} onChange={set(dispatch, 'partner2Name')} />
          </Field>
        )}

        <Field label={durationLabel}>
          <input className="sw-q-input" type="text" placeholder="e.g. 4 years, since 2019"
            value={state.togetherDuration} onChange={set(dispatch, 'togetherDuration')} />
        </Field>
        <HowTheyMetField state={state} dispatch={dispatch} label={metLabel} />
        <WeddingDateField state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}

function noSpace(
  dispatch: React.Dispatch<Action>,
  field: keyof Omit<FormState, 'step'>
) {
  return (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'SET', field, value: e.target.value.replace(/\s/g, '') });
}

function Step3({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  const g = state.roleGroup;
  const p1 = state.partner1Name.trim() || 'them';
  const p2 = state.partner2Name.trim() || 'their partner';

  if (g === 'B') {
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">Tell us about {p1}.</h1>
        <div className="sw-q-fields">
          <Field
            label={`One word to describe ${p1} as a child`}
            helper="The first word that comes to mind"
          >
            <input
              className="sw-q-input"
              type="text"
              placeholder="e.g. Mischievous"
              value={state.wordForPartnerAsChild}
              onChange={noSpace(dispatch, 'wordForPartnerAsChild')}
            />
          </Field>
          <Field label={`One word to describe who ${p1} has become`}>
            <input
              className="sw-q-input"
              type="text"
              placeholder="e.g. Remarkable"
              value={state.wordForPartnerNow}
              onChange={noSpace(dispatch, 'wordForPartnerNow')}
            />
          </Field>
          <Field label={`One word to describe how ${p2} makes ${p1} feel`}>
            <input
              className="sw-q-input"
              type="text"
              placeholder="e.g. Radiant"
              value={state.wordForPartnerWith2}
              onChange={noSpace(dispatch, 'wordForPartnerWith2')}
            />
          </Field>
          <div className="sw-q-field">
            <label className="sw-q-label">
              What do you want {p2} to know about being part of your family?
              <span className="sw-q-optional"> — optional</span>
            </label>
            <textarea
              className="sw-q-textarea"
              value={state.familyMessage}
              onChange={(e) =>
                dispatch({ type: 'SET', field: 'familyMessage', value: e.target.value })
              }
              rows={4}
              placeholder="What you hope for them, what they're joining, what your family means to you…"
            />
          </div>
        </div>
      </div>
    );
  }

  if (g === 'C') {
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">Let's hear your side of the story.</h1>
        <div className="sw-q-fields">
          <Field
            label={`One word to describe ${p1}`}
            helper="The first word that comes to mind"
          >
            <input
              className="sw-q-input"
              type="text"
              placeholder="e.g. Grounding"
              value={state.wordForPartner}
              onChange={noSpace(dispatch, 'wordForPartner')}
            />
          </Field>
          <div className="sw-q-field">
            <label className="sw-q-label">
              What's the thing about {p1} that nobody else sees?
            </label>
            <textarea
              className="sw-q-textarea"
              value={state.whatNobodySees}
              onChange={(e) =>
                dispatch({ type: 'SET', field: 'whatNobodySees', value: e.target.value })
              }
              rows={4}
              placeholder="The quiet things, the small moments, what you know that nobody else does…"
            />
          </div>
          <div className="sw-q-field">
            <label className="sw-q-label">
              Who do you most want to thank today?
              <span className="sw-q-optional"> — optional</span>
            </label>
            <p className="sw-q-helper">
              Parents, wedding party, specific friends — helps us shape the gratitude section
            </p>
            <textarea
              className="sw-q-textarea"
              value={state.whoToThank}
              onChange={(e) =>
                dispatch({ type: 'SET', field: 'whoToThank', value: e.target.value })
              }
              rows={3}
              placeholder="e.g. My parents for everything, the bridesmaids for keeping me sane…"
            />
          </div>
        </div>
      </div>
    );
  }

  // A1 — Best Man
  if (g === 'A1') {
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">How do you fit into their story?</h1>
        <div className="sw-q-fields">
          <Field label={`How did you and ${p1} meet?`}>
            <textarea className="sw-q-textarea" rows={3} placeholder="School, uni, work, football team..."
              value={state.howYouKnow} onChange={(e) => dispatch({ type: 'SET', field: 'howYouKnow', value: e.target.value })} />
          </Field>
          <Field label="How long have you known him?">
            <input className="sw-q-input" type="text" placeholder="e.g. 10 years, since we were kids"
              value={state.knownDuration} onChange={set(dispatch, 'knownDuration')} />
          </Field>
          <Field label="One word to describe him" helper="The first word that comes to mind">
            <input className="sw-q-input" type="text" placeholder="e.g. Generous"
              value={state.wordForPartner} onChange={noSpace(dispatch, 'wordForPartner')} />
          </Field>
          <Field label="One word to describe their relationship">
            <input className="sw-q-input" type="text" placeholder="e.g. Unbreakable"
              value={state.wordForRelationship} onChange={noSpace(dispatch, 'wordForRelationship')} />
          </Field>
        </div>
      </div>
    );
  }

  // A2 — Maid of Honour
  if (g === 'A2') {
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">How do you fit into their story?</h1>
        <div className="sw-q-fields">
          <Field label={`How did you and ${p1} meet?`}>
            <textarea className="sw-q-textarea" rows={3} placeholder="School, uni, work, lived together..."
              value={state.howYouKnow} onChange={(e) => dispatch({ type: 'SET', field: 'howYouKnow', value: e.target.value })} />
          </Field>
          <Field label="How long have you known her?">
            <input className="sw-q-input" type="text" placeholder="e.g. 10 years, since we were kids"
              value={state.knownDuration} onChange={set(dispatch, 'knownDuration')} />
          </Field>
          <Field label="One word to describe her" helper="The first word that comes to mind">
            <input className="sw-q-input" type="text" placeholder="e.g. Generous"
              value={state.wordForPartner} onChange={noSpace(dispatch, 'wordForPartner')} />
          </Field>
          <Field label="One word to describe their relationship">
            <input className="sw-q-input" type="text" placeholder="e.g. Unbreakable"
              value={state.wordForRelationship} onChange={noSpace(dispatch, 'wordForRelationship')} />
          </Field>
        </div>
      </div>
    );
  }

  // A3 — Sibling: ask how long they've known the partner (p2), not their sibling
  if (g === 'A3') {
    return (
      <div className="sw-q-step">
        <h1 className="sw-q-heading">How do you fit into their story?</h1>
        <div className="sw-q-fields">
          <Field label={`How long have you known ${p2}?`}>
            <input className="sw-q-input" type="text" placeholder="e.g. 3 years, since they met"
              value={state.knownDuration} onChange={set(dispatch, 'knownDuration')} />
          </Field>
          <Field label={`One word to describe ${p1}`} helper="The first word that comes to mind">
            <input className="sw-q-input" type="text" placeholder="e.g. Generous"
              value={state.wordForPartner} onChange={noSpace(dispatch, 'wordForPartner')} />
          </Field>
          <Field label="One word to describe their relationship">
            <input className="sw-q-input" type="text" placeholder="e.g. Unbreakable"
              value={state.wordForRelationship} onChange={noSpace(dispatch, 'wordForRelationship')} />
          </Field>
        </div>
      </div>
    );
  }

  // A4 and D
  const heading = g === 'D' ? 'Tell us about you and the couple.' : 'How do you fit into their story?';
  const knowLabel =
    g === 'D'
      ? "What's your relationship to the couple?"
      : `How do you know ${p1}?`;
  const knowPlaceholder =
    g === 'D'
      ? 'e.g. Old family friend, colleague of the groom…'
      : `e.g. We went to school together, I'm ${p1}'s work colleague`;

  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">{heading}</h1>
      <div className="sw-q-fields">
        <Field label={knowLabel}>
          <input
            className="sw-q-input"
            type="text"
            placeholder={knowPlaceholder}
            value={state.howYouKnow}
            onChange={set(dispatch, 'howYouKnow')}
          />
        </Field>
        <Field label={`How long have you known ${p1}?`}>
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. 10 years, since we were kids"
            value={state.knownDuration}
            onChange={set(dispatch, 'knownDuration')}
          />
        </Field>
        <Field label={`One word to describe ${p1}`} helper="The first word that comes to mind">
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. Generous"
            value={state.wordForPartner}
            onChange={noSpace(dispatch, 'wordForPartner')}
          />
        </Field>
        <Field label="One word to describe their relationship">
          <input
            className="sw-q-input"
            type="text"
            placeholder="e.g. Unbreakable"
            value={state.wordForRelationship}
            onChange={noSpace(dispatch, 'wordForRelationship')}
          />
        </Field>
      </div>
    </div>
  );
}

const A_STORY_PROMPTS = (p1: string, p2: string): [string, string, string, string] => [
  `Tell us about a time ${p1} made everyone laugh. Or a time they properly embarrassed themselves.`,
  `What's a memory that shows what kind of person ${p1} really is?`,
  `When did you first realise ${p1} and ${p2} were going to last?`,
  `Any inside jokes, running gags, or things the audience will get?`,
];

const STORY_PROMPTS: Record<
  RoleGroup,
  (p1: string, p2: string) => [string, string, string, string]
> = {
  A1: A_STORY_PROMPTS,
  A2: A_STORY_PROMPTS,
  A3: A_STORY_PROMPTS,
  A4: A_STORY_PROMPTS,
  B: (p1, p2) => [
    `What's a memory of ${p1} growing up that still makes you smile?`,
    `What moment made you proudest of the person ${p1} has become?`,
    `When did you first meet ${p2}, and what was your honest first impression?`,
    `Is there a family story or tradition that feels right for this moment?`,
  ],
  C: (p1, _p2) => [
    `How did you know ${p1} was the one? Was there a specific moment?`,
    `What's something ${p1} does that you never want them to stop doing?`,
    `What's a moment in your relationship that's just yours — something that means the world to you both?`,
    `Anything you want to say to specific guests? Parents, wedding party, friends?`,
  ],
  D: (p1, p2) => [
    `What's your favourite memory with ${p1} or the couple?`,
    `What do you think makes ${p1} and ${p2} work so well together?`,
    `Is there a moment that captures who they are as a couple?`,
    `Anything else the audience should know about your connection to them?`,
  ],
};

function Step4({
  state,
  dispatch,
}: {
  state: FormState;
  dispatch: React.Dispatch<Action>;
}) {
  const p1 = state.partner1Name.trim() || 'them';
  const p2 = state.partner2Name.trim() || 'their partner';
  const [s1, s2, s3, sExtra] = STORY_PROMPTS[state.roleGroup](p1, p2);

  return (
    <div className="sw-q-step">
      <h1 className="sw-q-heading">This is where the magic happens.</h1>
      <p className="sw-q-subheading">
        The more you give us, the better your speech.
      </p>
      <div className="sw-q-fields">
        <StoryArea label={s1} value={state.story1} field="story1" dispatch={dispatch} required={true} />
        <StoryArea label={s2} value={state.story2} field="story2" dispatch={dispatch} required={true} />
        <StoryArea label={s3} value={state.story3} field="story3" dispatch={dispatch} required={false} />
        <StoryArea label={sExtra} value={state.storyExtra} field="storyExtra" dispatch={dispatch} required={false} />
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
          {state.roleGroup === 'B' ? (
            <>
              <ReviewRow label={`${state.partner1Name || 'Them'} as a child`} value={state.wordForPartnerAsChild} />
              <ReviewRow label="Who they've become" value={state.wordForPartnerNow} />
              <ReviewRow label={`How ${state.partner2Name || 'their partner'} makes them feel`} value={state.wordForPartnerWith2} />
              {state.familyMessage && <ReviewRow label="For the family" value={truncate(state.familyMessage)} />}
            </>
          ) : state.roleGroup === 'C' ? (
            <>
              <ReviewRow label={`One word for ${state.partner1Name || 'them'}`} value={state.wordForPartner} />
              <ReviewRow label="What nobody else sees" value={truncate(state.whatNobodySees)} />
              {state.whoToThank && <ReviewRow label="Who to thank" value={truncate(state.whoToThank)} />}
            </>
          ) : (
            <>
              <ReviewRow label="How you know them" value={state.howYouKnow} />
              <ReviewRow label="Known for" value={state.knownDuration} />
              <ReviewRow label={`One word for ${state.partner1Name || 'them'}`} value={state.wordForPartner} />
              <ReviewRow label="One word for their relationship" value={state.wordForRelationship} />
            </>
          )}
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
  const params = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, params.get('preset'), (presetKey) => {
    const preset = presetKey ? PRESETS[presetKey] : null;
    return preset ? { ...initial, ...preset } : initial;
  });
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const ok = canContinue(state);

  const scrollToTop = () => {
    // Defer until after React has committed the new step to the DOM;
    // without this Chrome cancels the scroll when the layout changes mid-animation.
    setTimeout(() => {
      if (!topRef.current) return;
      const y = topRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 0);
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
      router.push(`/checkout/${data.access_token}`);
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
