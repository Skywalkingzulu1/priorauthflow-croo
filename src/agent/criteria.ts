import { criteriaFor } from "../types/payer-rules.js"
import type { CriteriaRule, ChartData, Trace } from "../types/schema.js"
import { trace } from "./trace.js"

export function matchCriteria(payer: string, cpt: string, chart: ChartData): { rule: CriteriaRule | undefined; missing: string[]; traces: Trace[] } {
  const rule = criteriaFor(payer, cpt)
  const requiredLabs = rule?.required_labs ?? []
  const requiredDx = rule?.required_diagnoses ?? []
  const requiredTx = rule?.required_prior_treatments ?? []

  const missingLabs = requiredLabs.filter(l => !chart.labs.some(lb => lb.name.toLowerCase() === l.toLowerCase()))
  const missingDx = requiredDx.filter(d => !chart.diagnoses.some(x => x.toLowerCase() === d.toLowerCase()))
  const missingTx = requiredTx.filter(t => !chart.prior_treatments.some(x => x.toLowerCase().includes(t.toLowerCase())))

  const missing = [...missingLabs.map(l => `lab:${l}`), ...missingDx.map(d => `dx:${d}`), ...missingTx.map(t => `tx:${t}`)]

  const traces = [
    trace("Criteria-Matcher", "evaluate_payer_rules", `payer=${payer} cpt=${cpt}`, `missing=${missing.length} items`),
  ]
  return { rule, missing, traces }
}
