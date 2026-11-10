# Pre-Dispatch Hook

## Trigger
Before any alert is dispatched (Level 2+).

## Checks
1. **Confidence check**: Alert confidence must be >= 0.7. If not, refuse and log reason.
2. **Source verification**: At least one verified data source must support the alert.
3. **Rate limit**: No more than 3 alerts per hour for the same threat type.
4. **Human gate**: Level 3-4 alerts require explicit human approval. Default: deny.
5. **Audit log**: Every dispatch decision (send or refuse) must be logged with timestamp, reason, and operator.

## Refusal Conditions
- Confidence < 0.7 → refuse, log "low_confidence"
- No verified source → refuse, log "unverified_source"
- Rate limit exceeded → refuse, log "rate_limited"
- Human denied → refuse, log "human_denied"
- Human timeout (5 min) → escalate to next tier, log "timeout_escalated"

## Audit Trail Format
```json
{
  "timestamp": "2026-11-10T12:00:00Z",
  "action": "dispatch|refuse|escalate",
  "level": 3,
  "confidence": 0.85,
  "source": "weather_api",
  "reason": "approved",
  "operator": "system|human",
  "alert_id": "uuid"
}
```
