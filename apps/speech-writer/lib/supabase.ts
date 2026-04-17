import { createClient } from '@supabase/supabase-js';
import type { Speech, SpeechEvent } from './types';

interface Database {
  public: {
    Tables: {
      speeches: {
        Row: Speech;
        Insert: Partial<Speech> & { tier: Speech['tier']; access_token: string };
        Update: Partial<Speech>;
      };
      speech_events: {
        Row: SpeechEvent;
        Insert: Omit<SpeechEvent, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient<Database>(url, key);
}

export const supabase = getClient();
