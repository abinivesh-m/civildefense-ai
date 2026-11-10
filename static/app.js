const $ = (sel) => document.querySelector(sel);

const LEVEL_LABELS = { 1: "Info", 2: "Warning", 3: "Critical", 4: "Emergency" };

const severitySlider = $("#severity");
const confSlider = $("#confidence");

severitySlider.addEventListener("input", () => {
  $("#severity-label").textContent = `${severitySlider.value} — ${LEVEL_LABELS[severitySlider.value]}`;
});

confSlider.addEventListener("input", () => {
  $("#conf-label").textContent = parseFloat(confSlider.value).toFixed(2);
});

// Load audit log on start
async function loadAudit() {
  try {
    const res = await fetch("/api/audit");
    const data = await res.json();
    const list = $("#audit-list");
    if (!data.entries.length) {
      list.innerHTML = '<p class="empty">No audit entries yet.</p>';
      return;
    }
    list.innerHTML = data.entries.map(e => `
      <div class="audit-entry ${e.action}">
        <span class="ae-time">${new Date(e.timestamp).toLocaleTimeString()}</span>
        <span class="ae-action ${e.action}">${e.action.toUpperCase()}</span>
        <span>Level ${e.level} · ${e.source} · ${e.reason}</span>
      </div>
    `).join("");
  } catch (e) {
    console.error("Failed to load audit:", e);
  }
}

async function loadAlerts() {
  try {
    const res = await fetch("/api/alerts");
    const data = await res.json();
    // Update channel status
    for (const [ch, on] of Object.entries(data.channels)) {
      const el = $(`#st-${ch}`);
      if (el) {
        el.textContent = on ? "ON" : "OFF";
        el.className = "ch-status" + (on ? " on" : "");
      }
      const chEl = $(`#ch-${ch}`);
      if (chEl) chEl.classList.toggle("active", on);
    }
    // Pending approvals
    const pending = data.alerts.filter(a => a.pending_approval);
    const pendingList = $("#pending-list");
    if (!pending.length) {
      pendingList.innerHTML = '<p class="empty">No pending approvals.</p>';
    } else {
      pendingList.innerHTML = pending.map(a => `
        <div class="pending-item">
          <h3>⚠ Level ${a.threat.severity} — ${a.threat.threat_type.toUpperCase()}</h3>
          <p>${a.threat.description} · ${a.threat.location} · Confidence: ${a.threat.confidence}</p>
          <div class="pending-actions">
            <button class="btn-approve" onclick="approve('${a.id}', true)">APPROVE</button>
            <button class="btn-deny" onclick="approve('${a.id}', false)">DENY</button>
          </div>
        </div>
      `).join("");
    }
  } catch (e) {
    console.error("Failed to load alerts:", e);
  }
}

async function approve(alertId, approved) {
  try {
    const res = await fetch(`/api/approve/${alertId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId, approved, operator: "human" }),
    });
    const data = await res.json();
    showResult(data);
    await loadAlerts();
    await loadAudit();
  } catch (e) {
    console.error("Approval failed:", e);
  }
}

function showResult(data) {
  const result = $("#result");
  const card = $("#result-card");
  result.hidden = false;

  let statusClass = "dispatched";
  let statusText = "DISPATCHED";
  if (data.status === "refused") { statusClass = "refused"; statusText = "REFUSED"; }
  if (data.status === "pending_approval") { statusClass = "pending"; statusText = "PENDING APPROVAL"; }

  let channelsHtml = "";
  if (data.channels) {
    channelsHtml = `<div class="result-channels">${Object.entries(data.channels).map(([k, v]) => v ? `<span>${k.toUpperCase()}</span>` : "").join("")}</div>`;
  }

  card.className = `result-card ${statusClass}`;
  card.innerHTML = `
    <div class="result-status ${statusClass}">${statusText}</div>
    <div class="result-detail">${data.message || data.reason || ""}</div>
    ${channelsHtml}
  `;
}

document.getElementById("threat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    source: $("#source").value,
    threat_type: $("#threat_type").value,
    severity: parseInt($("#severity").value),
    confidence: parseFloat($("#confidence").value),
    location: $("#location").value,
    description: $("#description").value,
  };
  try {
    const res = await fetch("/api/threat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    showResult(data);
    await loadAlerts();
    await loadAudit();
  } catch (err) {
    console.error("Submit failed:", err);
  }
});

// Init
loadAudit();
loadAlerts();
setInterval(() => { loadAlerts(); loadAudit(); }, 5000);
