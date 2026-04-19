'use client';

import { useState, useCallback, useRef } from 'react';
import type { SpeechDraft, SpeechSection, Tier } from '@/lib/types';
import { EmailCaptureForm } from '../EmailCaptureForm';

const KIT_FORM_ID = '9278303';

interface Props {
  drafts: SpeechDraft[];
  tier: Tier;
  accessToken: string;
  speechId: string;
  initialSelectedDraft: number;
  initialEditedSections: Record<string, string>;
  expiryDate: string;
}

type ToneOption = 'funnier' | 'more sincere' | 'shorter' | 'longer';

const TONE_LABELS: Record<ToneOption, string> = {
  funnier: 'Make it funnier',
  'more sincere': 'Make it more sincere',
  shorter: 'Make it shorter',
  longer: 'Make it longer',
};

export function SpeechViewer({
  drafts,
  tier,
  accessToken,
  speechId,
  initialSelectedDraft,
  initialEditedSections,
  expiryDate,
}: Props) {
  const [activeDraft, setActiveDraft] = useState(initialSelectedDraft);
  const [editMode, setEditMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [editedSections, setEditedSections] = useState<Record<string, string>>(
    initialEditedSections
  );
  const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
  const [regenError, setRegenError] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const printRef = useRef<HTMLDivElement>(null);

  const draft = drafts[activeDraft] ?? drafts[0];
  const canEdit = tier === 'full' || tier === 'premium';
  const canRehearse = tier === 'premium';

  function getSectionText(section: SpeechSection): string {
    const key = `${activeDraft}:${section.id}`;
    return editedSections[key] ?? section.content;
  }

  async function saveEdits(newEdits: Record<string, string>) {
    setSaveState('saving');
    try {
      await fetch('/speech-writer/api/speech-writer/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          speech_id: speechId,
          edited_sections: newEdits,
          selected_draft: activeDraft,
        }),
      });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('idle');
    }
  }

  function handleSectionChange(section: SpeechSection, value: string) {
    const key = `${activeDraft}:${section.id}`;
    const newEdits = { ...editedSections, [key]: value };
    setEditedSections(newEdits);
    saveEdits(newEdits);
  }

  async function regenerateSection(section: SpeechSection, tone?: ToneOption) {
    const key = `${activeDraft}:${section.id}`;
    setRegenerating(r => ({ ...r, [key]: true }));
    setRegenError(e => ({ ...e, [key]: '' }));
    try {
      const res = await fetch('/speech-writer/api/speech-writer/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          speech_id: speechId,
          draft_index: activeDraft,
          section_id: section.id,
          tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to regenerate');
      const newEdits = { ...editedSections, [key]: data.content as string };
      setEditedSections(newEdits);
      saveEdits(newEdits);
    } catch (err) {
      setRegenError(e => ({
        ...e,
        [key]: err instanceof Error ? err.message : 'Something went wrong',
      }));
    } finally {
      setRegenerating(r => ({ ...r, [key]: false }));
    }
  }

  const fullText = useCallback(() => {
    return draft.sections
      .map(s => {
        const text = getSectionText(s);
        return `${s.title}\n\n${text}`;
      })
      .join('\n\n---\n\n');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, editedSections, activeDraft]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fullText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select all in a textarea
    }
  }

  function exportPDF() {
    window.print();
  }

  if (presentationMode) {
    return (
      <div className="sp-present">
        <div className="sp-present__controls">
          <button
            className="sp-present__exit"
            onClick={() => setPresentationMode(false)}
          >
            Exit presentation
          </button>
        </div>
        <div className="sp-present__content">
          {draft.sections.map(section => (
            <div key={section.id} className="sp-present__section">
              <p className="sp-present__title">{section.title}</p>
              <p className="sp-present__text">{getSectionText(section)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="sp-main">
      {/* ── Draft tabs ─────────────────────────────── */}
      {drafts.length > 1 && (
        <div className="sp-tabs-bar">
          <div className="container sp-tabs-inner">
            {drafts.map((d, i) => (
              <button
                key={d.id}
                className={`sp-tab${activeDraft === i ? ' sp-tab--active' : ''}`}
                onClick={() => setActiveDraft(i)}
              >
                <span className="sp-tab__title">{d.title}</span>
                <span className="sp-tab__emphasis">{d.emphasis}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Speech content ─────────────────────────── */}
      <div className="container sp-container" ref={printRef}>

        {/* Meta bar — delivery time calculated at 140 wpm (wedding pace) */}
        <div className="sp-meta">
          <span className="sp-meta__stat">
            {draft.word_count.toLocaleString()} words
          </span>
          <span className="sp-meta__dot" aria-hidden="true">·</span>
          <span className="sp-meta__stat">
            {(() => {
              const mins = Math.round(draft.word_count / 170);
              return `Delivery time: ~${mins} minute${mins !== 1 ? 's' : ''} at a comfortable pace`;
            })()}
          </span>
          {editMode && (
            <>
              <span className="sp-meta__dot" aria-hidden="true">·</span>
              <span className={`sp-meta__save sp-meta__save--${saveState}`}>
                {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Edit mode'}
              </span>
            </>
          )}
        </div>

        {/* Single-draft title (when no tabs) */}
        {drafts.length === 1 && (
          <div className="sp-draft-header">
            <h1 className="sp-draft-title">{draft.title}</h1>
            <p className="sp-draft-emphasis">{draft.emphasis}</p>
          </div>
        )}

        {/* Sections */}
        <div className="sp-sections">
          {draft.sections.map((section, idx) => {
            const key = `${activeDraft}:${section.id}`;
            const isRegen = regenerating[key];
            const err = regenError[key];
            const text = getSectionText(section);

            return (
              <div key={section.id} className="sp-section">
                {idx > 0 && <div className="sp-section__divider" aria-hidden="true" />}
                <h2 className="sp-section__heading">{section.title}</h2>

                {editMode ? (
                  <div className="sp-section__edit-wrap">
                    <textarea
                      className="sp-section__textarea"
                      value={text}
                      onChange={e => handleSectionChange(section, e.target.value)}
                      rows={Math.max(5, text.split('\n').length + 2)}
                    />
                    <div className="sp-section__edit-actions">
                      <button
                        className="sp-section__regen-btn"
                        onClick={() => regenerateSection(section)}
                        disabled={isRegen}
                      >
                        {isRegen ? 'Rewriting…' : '↺ Regenerate'}
                      </button>
                      <select
                        className="sp-section__tone-select"
                        defaultValue=""
                        onChange={e => {
                          const v = e.target.value as ToneOption;
                          if (v) regenerateSection(section, v);
                          e.target.value = '';
                        }}
                        disabled={isRegen}
                      >
                        <option value="" disabled>Adjust tone…</option>
                        {(Object.keys(TONE_LABELS) as ToneOption[]).map(t => (
                          <option key={t} value={t}>{TONE_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                    {err && <p className="sp-section__regen-error">{err}</p>}
                  </div>
                ) : (
                  <div className="sp-section__body">
                    {text.split('\n\n').map((para, pi) => (
                      <p key={pi}>{para}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <footer className="sp-footer">
          <p className="sp-footer__expiry">
            Your speech will be available at this link until {expiryDate}.
          </p>
          <p className="sp-footer__bookmark">
            Bookmark this page — no login required.
          </p>

          <div className="sp-footer__email">
            <h3 className="sp-footer__email-heading">
              Want speech delivery tips before the big day?
            </h3>
            <p className="sp-footer__email-sub">
              Timing, nerves, how to hold the mic — we&apos;ll send our best advice, free.
            </p>
            <EmailCaptureForm kitFormId={KIT_FORM_ID} />
          </div>
        </footer>
      </div>

      {/* ── Sticky action bar ──────────────────────── */}
      <div className="sp-action-bar">
        <div className="sp-action-bar__inner">
          <button className="sp-action sp-action--secondary" onClick={exportPDF}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 12h10M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export PDF
          </button>

          <button className="sp-action sp-action--secondary" onClick={copyToClipboard}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v7A1.5 1.5 0 003.5 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {copied ? 'Copied!' : 'Copy text'}
          </button>

          <button
            className="sp-action sp-action--secondary"
            onClick={() => setPresentationMode(true)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 12l1 2h2l1-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Present
          </button>

          {canEdit ? (
            <button
              className={`sp-action${editMode ? ' sp-action--active' : ' sp-action--primary'}`}
              onClick={() => setEditMode(e => !e)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M11 2.5a1.5 1.5 0 012.12 2.12L5.5 12.25l-3 .75.75-3L11 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {editMode ? 'Done editing' : 'Edit sections'}
            </button>
          ) : (
            <button className="sp-action sp-action--locked" disabled title="Available on Full Package and above">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M11 2.5a1.5 1.5 0 012.12 2.12L5.5 12.25l-3 .75.75-3L11 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit sections
              <span className="sp-action__lock">🔒</span>
            </button>
          )}

          {canRehearse ? (
            <button className="sp-action sp-action--primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
              </svg>
              Rehearsal mode
            </button>
          ) : (
            <button className="sp-action sp-action--locked" disabled title="Available on Premium">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
              </svg>
              Rehearsal mode
              <span className="sp-action__lock">🔒</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
