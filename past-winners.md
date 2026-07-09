# Past Winners Analysis (winner-transposition source)

CROO Agent Hackathon is a FIRST edition (no prior winners of this exact event). Per the method,
we mine ADJACENT agent / health-tech agent hackathons for the WINNING SHAPE (not the topic).

## Health-tech multi-agent winners observed (Devpost "Agents Assemble" / Fetch.ai / Google ADK events)
- CAREGRID AI - autonomous multi-agent healthcare coordination (Risk / Diagnostic / Care Coordinator / Clinical Reasoning / FHIR Engine / Timeline). Wow: emergency escalation detection.
- Vita-MedAI - 10-agent system, strict RAG grounding, dual chat+video, <2s latency, 99.5% emergency detection.
- Companion - 5 culturally-aware healthcare agents on A2A, shared patient context, de-identified real case.
- SilentSurge - autonomous multi-agent ICU monitoring on MIMIC-III; EscalationAgent + LoopAgent self-correction; human-in-the-loop physician approval.
- Protect-Health - multi-agent before/during/after visit support; Task Intake / Pre-Visit Coach / Skin Triage Vision / Report Generator.
- VitalGuard.ai - real-time vitals -> predictive deterioration + autonomous emergency-response workflow; state-machine agentic pipeline.

## Extracted WINNING SHAPES (the patterns that win, reusable)
1. Multi-agent orchestration with ROLE-SPECIALIZED agents passing TYPED artifacts (not one chatbot).
2. A SAFETY / ESCALATION LOOP - the judge-lean-forward moment (agent catches a critical case LIVE).
3. INTEROPERABILITY (MCP / A2A / FHIR) - structured, portable outputs.
4. HUMAN-IN-THE-LOOP for high-stakes decisions (AI augments, never replaces).
5. OBSERVABLE real-time dashboard / traces of the agent workflow.
6. Clear BEFORE/AFTER (fragmented care -> coordinated, proactive care).

These shapes transpose cleanly onto CROO's "callable paid agent" model.
