# PriorAuthFlow

A **callable, paid prior-authorization automation agent** built for the CROO Agent Hackathon 2026.
When hired (paid in USDC), PriorAuthFlow turns a patient chart + CPT code into a submit-ready PA
packet on the CROO commerce layer. It prevents the most common PA failure mode - missing clinical
data - by flagging gaps BEFORE submit, cutting the 68% info-denial rate that costs clinics thousands.

## What it does
1. Accepts a chart snippet + payer + CPT code through the CROO Agent Protocol.
2. Runs a 5-agent pipeline:
   - **Intake** structures the request.
   - **Chart-Retriever** extracts relevant EMR data.
   - **Criteria-Matcher** checks payer-specific PA rules and flags missing fields.
   - **Evidence-Builder** assembles supporting documentation + clinical rationale.
   - **Escalation** (when needed) flags missing data for clinician review before submission.
3. Returns a typed deliverable through CROO `accept -> deliver`:
   - `submitted` when evidence is complete (mock ePA submit wired).
   - `needs_review` with a human-readable escalation brief when gaps exist.

## Problem / Impact
- 40 PAs per physician per week (AMA 2026)
- 13 hours/week on PA (AMA / Becker's)
- 94% of physicians say PA contributes to burnout
- 71% want AI to automate PA
- 35% say criteria are rarely/never evidence-based
- 68% of denials are from insufficient documentation (KLAS / Optum case study)

PriorAuthFlow attacks the largest share of that waste: missing-data denials.

## Sponsor tech (load-bearing)
- **@croo-network/sdk** + **CROO Agent Protocol (CAP)** — callable agent + USDC settlement on Base (gas sponsored)
- **CROO Agent Store** — discoverable, listed agent for providers to hire
- **A2A/MCP typed handoff** — structured, interoperable agent artifacts

## Demo
Open https://skywalkingzulu1.github.io/triageflow-croo/ (temporary landing; `prior-auth-flow/public/index.html` is the Pages source once renamed).

## Installation
```
cp .env.example .env
npm install
npm test
npm run dev
```

## License
MIT
