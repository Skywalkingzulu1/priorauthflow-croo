import { AgentClient, EventType, DeliverableType } from '@croo-network/sdk'

const client = new AgentClient(
  {
    baseURL: process.env.CROO_API_URL || 'https://api.croo.network',
    wsURL: process.env.CROO_WS_URL || 'wss://api.croo.network/ws',
  },
  process.env.CROO_SDK_KEY || ''
)

async function main() {
  console.log('Starting PriorAuthFlow CROO agent...')
  console.log('SDK Key:', process.env.CROO_SDK_KEY ? '***' + process.env.CROO_SDK_KEY.slice(-4) : 'NOT SET')
  console.log('API URL:', process.env.CROO_API_URL || 'https://api.croo.network')
  console.log('WS URL:', process.env.CROO_WS_URL || 'wss://api.croo.network/ws')

  const stream = await client.connectWebSocket()
  console.log('WebSocket connected')

  stream.on(EventType.NegotiationCreated, async (e) => {
    console.log('Negotiation created:', e.negotiation_id)
    try {
      const result = await client.acceptNegotiation(e.negotiation_id!)
      console.log('Order created:', result.order?.orderId)
    } catch (err) {
      console.error('Failed to accept negotiation:', err)
    }
  })

  stream.on(EventType.OrderPaid, async (e) => {
    console.log('Order paid:', e.order_id)
    try {
      const order = await client.getOrder(e.order_id!)
      const requirements = (order as any).requirements || '{}'
      let req
      try {
        req = typeof requirements === 'string' ? JSON.parse(requirements) : requirements
      } catch {
        req = {}
      }

      const { runPipeline } = await import('../src/agent/orchestrator.js')

      const pipelineInput = {
        chart_text: req.chart_text || req.chart || '',
        payer: req.payer || 'UNKNOWN',
        cpt_code: req.cpt_code || req.cpt || 'J3490',
        patient_id: req.patient_id || 'UNKNOWN',
      }

      const result = runPipeline(pipelineInput)

      const deliverable = {
        status: result.status,
        order_id: result.order_id,
        pa_packet: result.pa_packet,
        escalation: result.escalation || null,
        traces: result.traces,
      }

      await client.deliverOrder(e.order_id!, {
        deliverableType: DeliverableType.Text,
        deliverableText: JSON.stringify(deliverable),
      })
      console.log('Delivered:', e.order_id)
    } catch (err) {
      console.error('Failed to deliver order:', err)
    }
  })

  stream.on(EventType.OrderCompleted, (e) => {
    console.log('Order completed:', e.order_id)
  })

  stream.on(EventType.OrderRejected, (e) => {
    console.log('Order rejected:', e.order_id)
  })

  process.on('SIGINT', () => {
    stream.close()
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('CROO agent failed:', err)
  process.exit(1)
})
