"""CivilDefense AI — Resurrecting the Emergency Broadcast System.

Kiroween 2026 — Resurrection Category
"""

from __future__ import annotations

import hashlib
import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

__version__ = "1.0.0"

STATIC = Path(__file__).parent / "static"

app = FastAPI(
    title="CivilDefense AI",
    version=__version__,
    description="AI-powered emergency broadcast system — resurrecting civil defense sirens.",
)

# --------------------------------------------------------------------------- #
# State
# --------------------------------------------------------------------------- #


class AuditEntry(BaseModel):
    timestamp: str
    action: str
    level: int
    confidence: float
    source: str
    reason: str
    operator: str
    alert_id: str


class ThreatInput(BaseModel):
    source: str = Field(..., description="Data source: weather, seismic, social, sensor, field_report")
    threat_type: str = Field(..., description="Type of threat: tornado, flood, earthquake, fire, chemical")
    severity: int = Field(..., ge=1, le=4, description="1=info, 2=warning, 3=critical, 4=emergency")
    confidence: float = Field(..., ge=0.0, le=1.0)
    location: str = Field(..., description="Affected area")
    description: str = Field(..., description="Human-readable description")
    evidence_url: str | None = None


class AlertDecision(BaseModel):
    alert_id: str
    approved: bool
    operator: str = "human"


store = {
    "audit_log": [],
    "alerts": [],
    "channels": {
        "siren": False,
        "sms": False,
        "push": False,
        "radio": False,
        "social": False,
    },
    "threat_history": [],
}


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hash_entry(entry: dict) -> str:
    prev = store["audit_log"][-1]["hash"] if store["audit_log"] else "genesis"
    payload = json.dumps(entry, sort_keys=True) + prev
    return hashlib.sha256(payload.encode()).hexdigest()


def _log_audit(action: str, level: int, confidence: float, source: str, reason: str, operator: str, alert_id: str) -> None:
    entry = {
        "timestamp": _now(),
        "action": action,
        "level": level,
        "confidence": confidence,
        "source": source,
        "reason": reason,
        "operator": operator,
        "alert_id": alert_id,
        "hash": "",
    }
    entry["hash"] = _hash_entry(entry)
    store["audit_log"].append(entry)


def _classify_threat(threat: ThreatInput) -> dict[str, Any]:
    """Classify threat and determine channels. Model proposes, code disposes."""
    level = threat.severity
    confidence = threat.confidence

    # Refusal logic
    if confidence < 0.7:
        return {"refused": True, "reason": "low_confidence", "level": level}

    # Channel routing based on level
    channels = {
        "siren": level >= 3,
        "sms": level >= 2,
        "push": level >= 1,
        "radio": level >= 3,
        "social": level >= 2,
    }

    return {
        "refused": False,
        "level": level,
        "channels": channels,
        "confidence": confidence,
    }


# --------------------------------------------------------------------------- #
# Endpoints
# --------------------------------------------------------------------------- #


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "name": "CivilDefense AI",
        "version": __version__,
        "alerts_sent": len([a for a in store["alerts"] if a.get("dispatched")]),
        "alerts_refused": len([a for a in store["alerts"] if not a.get("dispatched")]),
        "audit_entries": len(store["audit_log"]),
    }


@app.get("/api/threats")
def list_threats() -> dict[str, Any]:
    return {"threats": store["threat_history"][-20:]}


@app.post("/api/threat")
def submit_threat(threat: ThreatInput) -> dict[str, Any]:
    alert_id = str(uuid.uuid4())[:8]
    classification = _classify_threat(threat)

    if classification["refused"]:
        _log_audit("refuse", threat.severity, threat.confidence, threat.source, classification["reason"], "system", alert_id)
        store["alerts"].append({
            "id": alert_id,
            "threat": threat.model_dump(),
            "classification": classification,
            "dispatched": False,
            "reason": classification["reason"],
        })
        return {
            "alert_id": alert_id,
            "status": "refused",
            "reason": classification["reason"],
            "message": f"Alert refused: {classification['reason']}. Evidence insufficient.",
        }

    # Level 3-4 require human approval
    if threat.severity >= 3:
        store["alerts"].append({
            "id": alert_id,
            "threat": threat.model_dump(),
            "classification": classification,
            "dispatched": False,
            "pending_approval": True,
            "channels": classification["channels"],
        })
        _log_audit("pending", threat.severity, threat.confidence, threat.source, "awaiting_approval", "system", alert_id)
        return {
            "alert_id": alert_id,
            "status": "pending_approval",
            "level": threat.severity,
            "channels": classification["channels"],
            "message": "Alert pending human approval. Default: deny.",
        }

    # Level 1-2: auto-dispatch
    store["alerts"].append({
        "id": alert_id,
        "threat": threat.model_dump(),
        "classification": classification,
        "dispatched": True,
        "channels": classification["channels"],
    })
    store["channels"] = classification["channels"]
    _log_audit("dispatch", threat.severity, threat.confidence, threat.source, "auto_approved", "system", alert_id)
    store["threat_history"].append(threat.model_dump())

    return {
        "alert_id": alert_id,
        "status": "dispatched",
        "level": threat.severity,
        "channels": classification["channels"],
        "message": f"Alert dispatched via {', '.join(k for k, v in classification['channels'].items() if v)}.",
    }


@app.post("/api/approve/{alert_id}")
def approve_alert(alert_id: str, decision: AlertDecision) -> dict[str, Any]:
    alert = next((a for a in store["alerts"] if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if decision.approved:
        alert["dispatched"] = True
        alert["pending_approval"] = False
        store["channels"] = alert["channels"]
        _log_audit("dispatch", alert["threat"]["severity"], alert["threat"]["confidence"], alert["threat"]["source"], "human_approved", decision.operator, alert_id)
        store["threat_history"].append(alert["threat"])
        return {"status": "dispatched", "channels": alert["channels"]}
    else:
        alert["dispatched"] = False
        alert["pending_approval"] = False
        _log_audit("refuse", alert["threat"]["severity"], alert["threat"]["confidence"], alert["threat"]["source"], "human_denied", decision.operator, alert_id)
        return {"status": "refused", "reason": "human_denied"}


@app.get("/api/alerts")
def list_alerts() -> dict[str, Any]:
    return {"alerts": store["alerts"][-20:], "channels": store["channels"]}


@app.get("/api/audit")
def get_audit() -> dict[str, Any]:
    return {"entries": store["audit_log"][-50:]}


@app.post("/api/reset")
def reset() -> dict[str, str]:
    store["audit_log"].clear()
    store["alerts"].clear()
    store["threat_history"].clear()
    store["channels"] = {k: False for k in store["channels"]}
    return {"status": "reset"}


# --------------------------------------------------------------------------- #
# Static
# --------------------------------------------------------------------------- #
if STATIC.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(str(STATIC / "index.html"))


@app.get("/favicon.ico", include_in_schema=False)
def favicon() -> FileResponse:
    return FileResponse(str(STATIC / "favicon.svg"))
