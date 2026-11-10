"""CivilDefense AI test suite."""
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_low_confidence_refused():
    r = client.post("/api/threat", json={
        "source": "weather", "threat_type": "tornado", "severity": 3,
        "confidence": 0.5, "location": "Kottur", "description": "Possible tornado"
    })
    assert r.status_code == 200
    assert r.json()["status"] == "refused"
    assert r.json()["reason"] == "low_confidence"


def test_level1_auto_dispatch():
    r = client.post("/api/threat", json={
        "source": "weather", "threat_type": "flood", "severity": 1,
        "confidence": 0.9, "location": "Kottur", "description": "Heavy rain"
    })
    assert r.status_code == 200
    assert r.json()["status"] == "dispatched"


def test_level3_pending_approval():
    r = client.post("/api/threat", json={
        "source": "seismic", "threat_type": "earthquake", "severity": 3,
        "confidence": 0.9, "location": "Kottur", "description": "Magnitude 6.2"
    })
    assert r.status_code == 200
    assert r.json()["status"] == "pending_approval"


def test_approve_alert():
    r = client.post("/api/threat", json={
        "source": "weather", "threat_type": "tornado", "severity": 3,
        "confidence": 0.95, "location": "Kottur", "description": "Tornado confirmed"
    })
    alert_id = r.json()["alert_id"]
    r2 = client.post(f"/api/approve/{alert_id}", json={"alert_id": alert_id, "approved": True, "operator": "human"})
    assert r2.status_code == 200
    assert r2.json()["status"] == "dispatched"


def test_deny_alert():
    r = client.post("/api/threat", json={
        "source": "weather", "threat_type": "tornado", "severity": 3,
        "confidence": 0.95, "location": "Kottur", "description": "Tornado confirmed"
    })
    alert_id = r.json()["alert_id"]
    r2 = client.post(f"/api/approve/{alert_id}", json={"alert_id": alert_id, "approved": False, "operator": "human"})
    assert r2.status_code == 200
    assert r2.json()["status"] == "refused"


def test_audit_log():
    client.post("/api/reset")
    client.post("/api/threat", json={
        "source": "weather", "threat_type": "flood", "severity": 1,
        "confidence": 0.9, "location": "Kottur", "description": "Heavy rain"
    })
    r = client.get("/api/audit")
    assert r.status_code == 200
    assert len(r.json()["entries"]) >= 1


def test_reset():
    client.post("/api/reset")
    r = client.get("/api/health")
    assert r.json()["alerts_sent"] == 0


def test_channels_level4():
    client.post("/api/reset")
    r = client.post("/api/threat", json={
        "source": "sensor", "threat_type": "chemical", "severity": 4,
        "confidence": 0.99, "location": "Kottur", "description": "Chemical leak"
    })
    # Level 4 requires approval
    assert r.json()["status"] == "pending_approval"
    assert r.json()["channels"]["siren"] is True
    assert r.json()["channels"]["radio"] is True
