# S2 Plan - PriorAuthFlow

## Product Spec
- Name: PriorAuthFlow
- Mission: make prior authorization fast, complete, and submit-ready inside CROO
- User: busy clinician / billing staff member
- Core feature: ONE callable agent job on CROO - chart + code -> PA packet (submit-ready OR escalation brief)

## Callable contract (CROO)
- Provider request: { chart_text: string, payer: string, cpt_code: string, patient_id: string }
- Deliverable: { status: "submitted" | "needs_review", packet: P APacket, escalation?: EscalationBrief }
- Order statuses: OrderPaid -> Agent starts work -> Deliverable returned
- Settlement: USDC on Base, gas sponsored by CROO

## Architecture (text diagram for Excalidraw)
Client -> CROO Agent Protocol (CAP) -> PriorAuthFlow Agent
  -> Intake Agent (structured request)
  -> Chart-Retriever Agent (EMR extraction)
  -> Criteria-Matcher Agent (payer rules + missing-field detection)
  -> Evidence-Builder Agent (doc assembly)
  -> [IF missing/ambiguous] Escalation Agent (human review flag)
  -> [IF complete] Submitter Agent (ePA submit)
  -> typed deliverable back through CAP -> Client

Data flow:
  chart_text -> Intake -> Chart-Retriever -> Criteria-Matcher -> Evidence-Builder -> Submitter/Escalation
  Each handoff is a typed JSON object, not free text.

## Directory tree
prior-auth-flow/
  src/
    agent/
      orchestrator.ts         # Cap orchestrator, typed schema, accept->deliver
      intake.ts               # Intake agent
      chart.ts                # Chart-Retriever agent
      criteria.ts             # Criteria-Matcher agent
      evidence.ts             # Evidence-Builder agent
      escalation.ts           # Escalation Agent (safety loop)
      submitter.ts            # Submitter agent (mock ePA endpoint)
    types/
      schema.ts               # typed artifacts
      payer-rules.ts          # mock payer criteria DB
    lib/
      mock-emr.ts             # mock EMR extractor
      mock-payer.ts           # mock payer ePA endpoint
    tests/
      pipeline.test.ts
      escalation.test.ts
      submitter.test.ts
  public/
    index.html                # GitHub Pages landing/demo page
  package.json
  tsconfig.json
  README.md
  AGENT_STORE_LISTING.md
  SUBMISSION.md

## 5-element demo script
1. PROBLEM: "A clinician orders a GLP-1 for a diabetic patient. The PA requires labs the chart already has, plus one missing HbA1c. Manual submission takes 15-20 min with phone/fax, and 35% get denied from missing info."
2. BEFORE: "Today they open the EHR, hunt labs, open payer portal, fill the form, fax, wait."
3. TRIGGER: "Hire PriorAuthFlow on CROO for 0.01 USDC, paste chart + CPT."
4. AHA: "Pipeline builds a complete packet. Because HbA1c is missing, the Escalation Agent flags it BEFORE submit - preventing the denial."
5. CLOSE: "<60 seconds from chart to submit-ready. Human reviews only when needed. Paid, callable, auditable."

## Definition of Done
- Agent callable on CROO testnet with @croo-network/sdk
- Accept->deliver flow works end-to-end
- 5 agents work, typed artifacts, observable traces/logs
- Escalation loop fires on missing data
- ePA submit mocked but wired
- GitHub Pages site live (public/index.html)
- README + Devpost post + Agent Store listing complete
- Video recorded (your job)

## Feature freeze plan
- T-4h from deadline: stop building, fix bugs, polish UI, rehearse demo, write docs
- Cut list: no real EHR integration, no real payer API, no real USDC on mainnet, no auth

## Role split (agents)
- Architect: orchestrator + typed schema + criteria + escalation
- Frontend: public/index.html demo landing page
- Backend: Chart-Retriever + Evidence-Builder + Submitter (mock)
- QA/Ollama: tests + traces + judge-simulator audit
- Writer: README + Devpost + pitch + shot list
- You: Gate 1 (idea), Gate 2 (code-freeze), video, live demo/Q&A
