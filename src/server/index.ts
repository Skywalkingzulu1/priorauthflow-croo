import express from 'express'
import cors from 'cors'
import { runPipeline } from '../agent/orchestrator.js'
import { saveRequest, listRequests, isSupabaseEnabled } from './supabase.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(express.static('public'))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, supabase: isSupabaseEnabled(), timestamp: new Date().toISOString() })
})

app.post('/api/pa/run', async (req, res) => {
  try {
    const { chart_text, payer, cpt_code, patient_id } = req.body ?? {}
    if (!chart_text || !payer || !cpt_code || !patient_id) {
      return res.status(400).json({ error: 'chart_text, payer, cpt_code, patient_id are required' })
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
    res.json({ ...result, id: row.id, created_at: row.created_at })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: (err as Error).message })
  }
})

app.get('/api/pa/requests', async (_req, res) => {
  try {
    const rows = await listRequests()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

const port = Number(process.env.PORT ?? 4173)
app.listen(port, () => console.log(`PriorAuthFlow API running on http://localhost:${port}`))
