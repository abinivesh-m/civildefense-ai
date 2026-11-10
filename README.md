# CivilDefense AI — Resurrecting the Emergency Broadcast System

**Kiroween 2026 — Resurrection Category**

> The sirens are dead. The AI is not.

## The Problem

Civil defense sirens have been decommissioned across the US, Europe, and India over the past decade. They were expensive, unreliable, and couldn't distinguish between a tornado and a Tuesday. When the 2026 Kottur landslide hit, 200 people in shelters had no idea what was happening for 45 minutes because the emergency broadcast system was a WhatsApp group.

The siren died. The need didn't.

## What I Built

CivilDefense AI resurrects the emergency broadcast system as an **AI-powered multi-channel alert agent**. It monitors 5 data sources, classifies threats, generates appropriate alerts, and routes them through the right channels — siren, SMS, push notification, radio, and social media — all in under 60 seconds.

The twist: the agent can **refuse** to send an alert if the evidence doesn't support it. False alarms kill trust. The system is built to be argued with.

## How It Works

```
Data Sources → Threat Classifier → Alert Generator → Channel Router → Human Gate → Dispatch
     │              │                    │                │              │            │
  Weather       Nemotron 3         Template + LLM      Priority-based   [y/N]      Siren
  Seismic       (Nano/Super)       severity levels     routing          default:   SMS
  Social media                                                 no         Push
  Sensors                                                          Radio
  Field reports                                                  Social
```

## Kiro Usage

- **Specs**: `.kiro/specs/alert-system.md` — full spec for the alert pipeline
- **Hooks**: `.kiro/hooks/pre-dispatch.md` — automated checks before any alert goes out
- **Steering**: `.kiro/steering/emergency-protocols.md` — domain knowledge for threat classification
- **Kiro Crew**: Used for multi-file refactoring and test generation
- **Kiro CLI**: Used for rapid iteration and debugging

## Tech Stack

- **Backend**: Python 3.11+, FastAPI
- **AI**: NVIDIA Nemotron 3 (Nano for triage, Super for classification, Ultra for alert generation)
- **Evidence**: Tavily for real-time web verification of threats
- **Frontend**: Vanilla JS + CSS (no build step)
- **Tests**: 40+ pytest tests, standard library only

## Run It

```bash
git clone https://github.com/abinivesh-m/civildefense-ai
cd civildefense-ai
python -m pytest -q          # 40+ tests, no network
python app.py                # start the server
```

Open http://localhost:8000

## License

MIT
