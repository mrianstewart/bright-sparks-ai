import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { access_token, edited_sections, selected_draft } = await req.json();

  if (!access_token) {
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });
  }

  const { error } = await (supabase as any)
    .from('speeches')
    .update({ edited_sections, selected_draft, updated_at: new Date().toISOString() })
    .eq('access_token', access_token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
