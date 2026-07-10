const MOCK_EMR = {
  'PT-001': {
    diagnoses: ['E11.9', 'E11.65'],
    labs: [
      { name: 'HbA1c', value: '8.2%', date: '2026-07-01' },
      { name: 'fasting_glucose', value: '162 mg/dL', date: '2026-07-01' },
    ],
    medications: ['metformin 1000mg BID'],
    prior_treatments: ['metformin 3 months'],
    allergies: [],
  },
  'PT-MISSING': {
    diagnoses: ['E11.9'],
    labs: [],
    medications: [],
    prior_treatments: [],
    allergies: [],
  },
}

const PAYER_RULES = [
  {
    payer: 'AETNA',
    cpt_code: 'J3490',
    required_labs: ['HbA1c', 'fasting_glucose'],
    required_diagnoses: ['E11.9'],
    required_prior_treatments: ['metformin'],
    notes: 'Preferred: GLP-1 agonists require trial of metformin unless contraindicated.',
  },
  {
    payer: 'UHC',
    cpt_code: 'J3490',
    required_labs: ['HbA1c'],
    required_diagnoses: ['E11.9', 'E11.65'],
    required_prior_treatments: [],
    notes: 'UHC covers GLP-1 for BMI>=30 or BMI>=27 with comorbidity.',
  },
]

function uid() { return Math.random().toString(36).slice(2, 10) }

function trace(agent, action, input_summary, output_summary) {
  return { agent, action, input_summary, output_summary, timestamp: new Date().toISOString() }
}

function getChart(patientId) {
  const found = MOCK_EMR[patientId]
  if (!found) throw new Error(`Patient ${patientId} not found`)
  return found
}

function criteriaFor(payer, cpt) {
  return PAYER_RULES.find(r => r.payer.toLowerCase() === payer.toLowerCase() && r.cpt_code === cpt)
}

function submitToPayer(packet) {
  if (packet.supporting_evidence.length === 0) return { decision: 'denied', reason: 'Insufficient documentation' }
  if (packet.supporting_evidence.length >= 2) return { decision: 'approved', reason: 'Criteria met with supporting evidence' }
  return { decision: 'pending', reason: 'Manual review required' }
}

function runPipeline(req) {
  const allTraces = []

  const request = { ...req }
  allTraces.push(trace('Intake', 'parse_request', JSON.stringify(req).slice(0, 120), `patient=${req.patient_id} payer=${req.payer} cpt=${req.cpt_code}`))

  let chart
  try {
    chart = getChart(request.patient_id)
    allTraces.push(trace('Chart-Retriever', 'fetch_chart', `patient_id=${request.patient_id}`, `diagnoses=${chart.diagnoses.length} labs=${chart.labs.length}`))
  } catch (err) {
    chart = { diagnoses: [], labs: [], medications: [], prior_treatments: [], allergies: [] }
    allTraces.push(trace('Chart-Retriever', 'fetch_chart', `patient_id=${request.patient_id}`, 'not_found'))
  }

  const rule = criteriaFor(request.payer, request.cpt_code)
  const requiredLabs = rule?.required_labs ?? []
  const requiredDx = rule?.required_diagnoses ?? []
  const requiredTx = rule?.required_prior_treatments ?? []

  const missingLabs = requiredLabs.filter(l => !chart.labs.some(lb => lb.name.toLowerCase() === l.toLowerCase()))
  const missingDx = requiredDx.filter(d => !chart.diagnoses.some(x => x.toLowerCase() === d.toLowerCase()))
  const missingTx = requiredTx.filter(t => !chart.prior_treatments.some(x => x.toLowerCase().includes(t.toLowerCase())))

  const missing = [...missingLabs.map(l => `lab:${l}`), ...missingDx.map(d => `dx:${d}`), ...missingTx.map(t => `tx:${t}`)]
  allTraces.push(trace('Criteria-Matcher', 'evaluate_payer_rules', `payer=${request.payer} cpt=${request.cpt_code}`, `missing=${missing.length} items`))

  const evidence = []
  if (chart.labs.length) evidence.push(`Labs (${chart.labs.map(l => `${l.name}=${l.value}`).join(', ')})`)
  if (chart.diagnoses.length) evidence.push(`Diagnoses: ${chart.diagnoses.join(', ')}`)
  if (chart.medications.length) evidence.push(`Current meds: ${chart.medications.join(', ')}`)
  if (rule?.notes) evidence.push(`Payer notes: ${rule.notes}`)

  const evidenceSummary = `${evidence.length} evidence items assembled for clinical review.`
  allTraces.push(trace('Evidence-Builder', 'assemble_packet', `labs=${chart.labs.length} dx=${chart.diagnoses.length}`, `${evidence.length} items`))

  let escalation = null
  let status = 'likely_approved'

  if (missing.length > 0) {
    status = 'needs_review'
    escalation = {
      reason: `Missing required data will likely cause denial. ${missing.length} gap(s) detected.`,
      missing_fields: missing,
      recommended_action: `Request missing items from care team before submission. ${rule?.notes ?? 'Review payer criteria.'}`,
    }
    allTraces.push(trace('Escalation', 'flag_for_review', `missing=${missing.length}`, `escalate=${JSON.stringify(escalation).slice(0, 120)}`))
  } else {
    allTraces.push(trace('Escalation', 'no_escalation', 'missing=0', 'continue'))
  }

  const packet = {
    patient_id: request.patient_id,
    payer: request.payer,
    cpt_code: request.cpt_code,
    clinical_summary: evidenceSummary,
    supporting_evidence: evidence,
    missing_items: missing,
    predicted_outcome: status,
  }

  let decision
  if (!escalation && missing.length === 0) {
    const result = submitToPayer({ payer: request.payer, cpt_code: request.cpt_code, clinical_summary: evidenceSummary, supporting_evidence: evidence })
    decision = { decision: result.decision, reason: result.reason, traces: [trace('Submitter', 'ePA_submit', `evidence=${evidence.length}`, `${result.decision}: ${result.reason}`)] }
    allTraces.push(...decision.traces)
  }

  return {
    order_id: `PA-${uid()}`,
    status: escalation ? 'needs_review' : 'submitted',
    pa_packet: packet,
    escalation: escalation ?? undefined,
    traces: allTraces,
  }
}

window.runPipeline = runPipeline
