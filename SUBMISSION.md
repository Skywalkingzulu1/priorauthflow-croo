## Track: Open - Any A2A Agents (primary) + Research & Intelligence Agents (secondary)

Among 98 enrolled BUIDLs and 348 hackers on DoraHacks, PriorAuthFlow is one of the few health-tech
A2A agents. Most entries are Web3/DeFi/blockchain-focused. Our differentiator: a real, quantified
physician pain point (40 PAs/week, 13h, 94% burnout) solved with the same A2A/CAP primitives the
hackathon rewards.

## What I Built
PriorAuthFlow is a callable, paid prior-authorization automation agent on the CROO agent commerce layer.
Physicians complete an average of 40 prior authorizations per physician each week, and physicians and
staff spend an average of 13 hours per week managing prior authorization requirements (AMA 2026,
Becker's). PriorAuthFlow attacks the highest-frequency failure mode: insufficient documentation causes
68% of denials (KLAS/Optum). It mines the chart, matches payer criteria, assembles the PA packet, and
either auto-submits or escalates missing items BEFORE submission - giving clinicians back hours.

## How I Built It
- **Agent layer:** 5 specialized agents in a typed, directed-graph flow: Intake -> Chart-Retriever ->
  Criteria-Matcher -> Evidence-Builder -> Submitter/Escalation. Agents pass typed TypeScript objects,
  not free text, so every handoff is auditable.
- **CROO core:** `@croo-network/sdk` AgentClient + WebSocket accept->deliver loop. USDC settlement on
  Base (gas sponsored by CROO). Listed in the CROO Agent Store.
- **Payer rules:** mock criteria DB for Aetna / UHC with required labs, diagnoses, and prior-treatment
  rules; extensible to real payer APIs.
- **Mock ePA:** fake payer endpoint that returns approved/denied/pending based on evidence completeness.
- **Observability:** every agent appends a typed `Trace` (agent, action, input/output summaries,
  timestamp) so the full reason->act->observe trajectory is visible.

## CROO Integration
### Agent Protocol (CAP)
- Implements the required CROO pattern: AgentClient initialization, WebSocket listener, order accepted
  -> deliverable returned, idempotent re-delivery by `order_id`.
- Handles typed error helpers for missing patient ID, unsupported payer, and unsupported CPT codes.

### CROO Agent Store
Copy for the listing:
- Service: "Prior-Auth Automation (submit-ready PA packet)"
- Price: 0.01 USDC per request
- Tags: health-tech, prior-authorization, automation, a2a, ePA

## Challenges
- Scope creep: PA affects dozens of payers and hundreds of codes. We shipped Aetna/UHC + one CPT
  demo, with the payer-rules DB designed to be extended.
- Typed handoff discipline: switching from one LangChain-style chain to typed TS interfaces prevented
  the "agent said X but the next agent interpreted Y" failure mode.
- Balancing automation and clinical safety: we never auto-submit when data is missing. The Escalation
  Agent is the judge-lean-forward moment and the safety boundary.

## Sponsor Integrations
### @croo-network/sdk / CROO Agent Protocol
[SHOW SPECIFIC CAP CODE SNIPPET: AgentClient init, WS accept, OrderPaid handler, typed deliverable]
The entire product is built on CROO's callable-agent model. Without the sdk, this is just a script;
with it, it's a paid, discoverable commerce endpoint.

### CROO Agent Store
[SHOW LISTING COPY] Every clinic on CROO can hire PriorAuthFlow directly.

## What's Next
- Real EHR API integration (FHIR, HL7)
- Real payer ePA endpoints (SureScripts, Availity)
- Multi-payer rules expansion
- Audit log export for compliance

