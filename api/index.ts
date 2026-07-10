import { runPipeline } from '../src/agent/orchestrator.js'
import { saveRequest, listRequests, isSupabaseEnabled } from '../src/server/supabase.js'

export default async function handler(req: Request, res: Response) {
  const url = new URL(req.url || '/', `http://${req.headers.get('host') || 'localhost'}`)
  const path = url.pathname

  if (path === '/health' && req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, supabase: isSupabaseEnabled(), timestamp: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (path === '/pa/run' && req.method === 'POST') {
    try {
      const body = await req.json()
      const { chart_text, payer, cpt_code, patient_id } = body ?? {}
      if (!chart_text || !payer || !cpt_code || !patient_id) {
        return new Response(JSON.stringify({ error: 'chart_text, payer, cpt_code, patient_id are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      const result = runPipeline({ chart_text, payer, cpt_code, patient_id })
      const row = await saveRequest({
        patient_id,
        payer,
        cpt_code,
        chart_text,
        status: result.status as typeof result.status,
        pa_packet: result.pa_packet as unknown as Record<string, unknown>,
        escalation: result.escalation as unknown as (Record<string, unknown> | null),
        traces: result.traces as unknown as Record<string, unknown>[],
      })
      return new Response(JSON.stringify({ ...result, id: row.id, created_at: row.created_at }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error(err)
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (path === '/pa/requests' && req.method === 'GET') {
    try {
      const rows = await listRequests()
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Not Found', { status: 404 })
}
