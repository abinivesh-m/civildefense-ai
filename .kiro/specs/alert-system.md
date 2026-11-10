# CivilDefense AI — Alert System Spec

## Overview
AI-powered emergency broadcast system that monitors multiple data sources, classifies threats, generates alerts, and routes them through appropriate channels.

## Data Sources
1. **Weather API** — severe weather warnings (tornado, flood, hurricane)
2. **Seismic API** — earthquake magnitude and location
3. **Social Media Monitor** — keyword detection for emergencies
4. **Sensor Network** — temperature, air quality, radiation
5. **Field Reports** — citizen-submitted emergency reports

## Threat Classification
- **Level 1 (Info)**: Advisory, no action needed. Example: "Heavy rain expected tonight."
- **Level 2 (Warning)**: Prepare for potential emergency. Example: "Flash flood watch in effect."
- **Level 3 (Critical)**: Immediate action required. Example: "Tornado warning — seek shelter now."
- **Level 4 (Emergency)**: Life-threatening. Example: "Radiation leak detected — evacuate immediately."

## Alert Generation
- Each threat level has a template-based alert with dynamic content
- Nemotron 3 Nano: triage incoming data (is this an emergency?)
- Nemotron 3 Super: classify threat level and generate alert text
- Nemotron 3 Ultra: generate multi-channel alert content for Level 3-4

## Channel Routing
| Level | Siren | SMS | Push | Radio | Social |
|-------|-------|-----|------|-------|--------|
| 1     | No    | No  | Yes  | No    | No     |
| 2     | No    | Yes | Yes  | No    | Yes    |
| 3     | Yes   | Yes | Yes  | Yes   | Yes    |
| 4     | Yes   | Yes | Yes  | Yes   | Yes    |

## Human Gate
- Level 3-4 alerts require human approval before dispatch
- Default: deny (operator must explicitly approve)
- Timeout: 5 minutes → auto-escalate to next tier
- All decisions logged in hash-chained audit trail

## Refusal Logic
- If confidence < 0.7, refuse to send alert
- If source is unverified, refuse to send alert
- If threat level is ambiguous, downgrade and re-classify
- Log all refusals with reason

## Evidence System
- Every alert cites its source data
- Tavily verification for web-sourced claims
- Five-check verifier: literal quote, fetched, dated, relevant, regional
