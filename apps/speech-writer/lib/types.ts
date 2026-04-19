export interface Speech {
  id: string;
  access_token: string;
  email: string | null;
  stripe_session_id: string | null;
  stripe_payment_status: string | null;
  tier: 'single' | 'full' | 'premium';

  speaker_role: string | null;
  couple_name_1: string | null;
  couple_name_2: string | null;
  relationship_description: string | null;
  stories: StoryInput[] | null;
  tone: string | null;
  target_length_minutes: number | null;
  additional_notes: string | null;

  drafts: SpeechDraft[] | null;
  selected_draft: number | null;
  edited_sections: Record<string, string> | null;

  created_at: string;
  updated_at: string;
  generated_at: string | null;
  payment_completed_at: string | null;
}

export interface StoryInput {
  title: string;
  content: string;
}

export interface SpeechSection {
  id: string;
  title: string;
  content: string;
}

export interface SpeechDraft {
  id: number;
  emphasis: string;
  title: string;
  sections: SpeechSection[];
  word_count: number;
  estimated_minutes: number;
}

export type SpeechEventType =
  | 'created'
  | 'paid'
  | 'generated'
  | 'edited'
  | 'exported'
  | 'rehearsed';

export interface SpeechEvent {
  id: string;
  speech_id: string | null;
  event_type: SpeechEventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type Tier = 'single' | 'full' | 'premium';

export const TIER_PRICES: Record<Tier, number> = {
  single: 1499,
  full: 2499,
  premium: 3999,
};
