# Emergency Protocols — Steering Document

## Domain Knowledge

### Threat Level Classification
- **Level 1 (Info)**: Advisory conditions. No immediate danger. Examples: heavy rain, minor flooding in low areas, air quality advisory.
- **Level 2 (Warning)**: Conditions may become dangerous. Examples: flash flood watch, severe thunderstorm watch, heat advisory.
- **Level 3 (Critical)**: Immediate danger. Examples: tornado warning, flash flood warning, earthquake magnitude 5+.
- **Level 4 (Emergency)**: Life-threatening. Examples: radiation leak, major earthquake (7+), hurricane landfall, chemical spill.

### Channel Routing Rules
- Level 1: Push notification only. No siren (prevents alert fatigue).
- Level 2: SMS + Push + Social media. Siren optional (community decision).
- Level 3: All channels including siren. Siren is the primary alert.
- Level 4: All channels + continuous siren + radio override + social media blitz.

### Alert Fatigue Prevention
- Never send Level 1 alerts via siren
- Rate limit: max 3 alerts per hour per threat type
- Deduplicate: don't send the same alert twice within 30 minutes
- Prefer under-alerting to over-alerting for non-critical threats

### Evidence Quality
- Every alert must cite at least one verified data source
- Web-sourced claims must pass 5-check verification (literal quote, fetched, dated, relevant, regional)
- If evidence quality is below threshold, refuse to send and log reason

### Human Gate
- Level 3-4 alerts require human approval
- Default: deny (operator must explicitly approve)
- Timeout: 5 minutes → auto-escalate
- All decisions logged in hash-chained audit trail
- The gate is code, not a prompt asking a model for permission
