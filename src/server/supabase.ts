import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null
let useSupabase = false

export function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (url && key && url !== 'https://your-project.supabase.co') {
    if (!client) client = createClient(url, key)
    useSupabase = true
    return client
  }
  useSupabase = false
  return null
}

export function isSupabaseEnabled() { return useSupabase }

export type PARequestRow = {
  id: string
  patient_id: string
  payer: string
  cpt_code: string
  chart_text: string
  status: 'pending' | 'processing' | 'submitted' | 'needs_review'
  pa_packet: Record<string, unknown>
  escalation: Record<string, unknown> | null
  traces: Record<string, unknown>[]
  created_at: string
}

export async function saveRequest(row: Omit<PARequestRow, 'id' | 'created_at'>): Promise<PARequestRow> {
  const sb = getSupabase()
  if (sb) {
    const { data, error } = await sb.from('pa_requests').insert(row as any).select().single()
    if (error) throw new Error(`Supabase insert failed: ${error.message}`)
    return data as PARequestRow
  }
  return { ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() } as PARequestRow
}

export async function listRequests(limit = 50): Promise<PARequestRow[]> {
  const sb = getSupabase()
  if (sb) {
    const { data, error } = await sb.from('pa_requests').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error) throw new Error(`Supabase select failed: ${error.message}`)
    return (data ?? []) as PARequestRow[]
  }
  return []
}
