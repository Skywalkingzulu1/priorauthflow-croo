# CROO Agent Hackathon - Judging Rubric (derived)

No official rubric published on the DoraHacks listing, so we use the 5-dimension default from
01_WINNING_HACKATHON_TEMPLATE.md, weighted for THIS event's sponsor-tech emphasis:

| Dimension | Weight | What scores high |
|-----------|--------|------------------|
| 1. CROO Integration Depth (CAP) | 25% | Correct AgentClient + WebSocket loop, accept->deliver, OrderPaid handler, DeliverableType match, idempotent re-delivery, USDC settlement |
| 2. Working Callable Agent (Execution) | 25% | Agent is actually callable on CROO and completes its job end-to-end; observable traces |
| 3. Problem Fit / Usefulness | 20% | Solves a real, specific need a buyer would pay for |
| 4. Innovation / Wow | 15% | Memorable moment (live escalation, surprising automation, clear before/after) |
| 5. Presentation | 15% | Demo video + README + Agent Store listing copy complete and clear |

Tie-breakers: depth of CAP integration > demo polish > Agent Store presence.
