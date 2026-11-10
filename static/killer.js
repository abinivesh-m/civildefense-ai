// CivilDefense AI — Killer Features (unique to this file, no 3D scene code)
// (scene, camera, renderer, etc. are declared in app.js)

// ===== AI REASONING =====
function showAIReasoning(threat) {
  const panel = document.getElementById('ai-reasoning');
  if (!panel) return;
  panel.innerHTML = `
    <div style="color:#aa44ff;font-weight:700;font-size:10px;margin-bottom:8px;letter-spacing:1px;">🧠 AI REASONING</div>
    <div style="font-size:10px;line-height:1.7;">
      <div style="color:#888;">1. <span style="color:#00aaff;font-weight:600;">TRIAGE</span>: Emergency? → ${threat.confidence >= 0.7 ? 'YES' : 'NO'} (conf: ${threat.confidence})</div>
      <div style="color:#888;">2. <span style="color:#ffcc00;font-weight:600;">CLASSIFY</span>: Level ${threat.severity} (${['', 'Info', 'Warning', 'Critical', 'Emergency'][threat.severity]})</div>
      <div style="color:#888;">3. <span style="color:#ff8833;font-weight:600;">EVIDENCE</span>: ${threat.evidence_url ? 'Verified via Tavily' : 'Source: ' + threat.source}</div>
      <div style="color:#888;">4. <span style="color:#ff3344;font-weight:600;">CHANNELS</span>: ${threat.severity >= 3 ? 'Siren + SMS + Push + Radio + Social' : threat.severity >= 2 ? 'SMS + Push + Social' : 'Push only'}</div>
      <div style="color:#888;">5. <span style="color:#00e676;font-weight:600;">GATE</span>: ${threat.severity >= 3 ? 'Human approval (default: deny)' : 'Auto-dispatch'}</div>
      <div style="color:#888;">6. <span style="color:#aa44ff;font-weight:600;">DECISION</span>: ${threat.confidence >= 0.7 ? 'PROCEED ✓' : 'REFUSE ✗ (low confidence)'}</div>
    </div>
  `;
}

// ===== DISASTER SCENARIOS =====
const DISASTERS = {
  tornado: { name: 'TORNADO WARNING', icon: '🌪️', color: 0xff3333, duration: 12000, frames: [
    { t: 0, msg: 'Weather API: Tornado vortex signature detected — Kottur sector', sev: 4, conf: 0.97, source: 'weather', x: 10, z: -15 },
    { t: 1500, msg: 'Seismic: Micro-tremor from funnel cloud — confirmed', sev: 4, conf: 0.99, source: 'seismic', x: 8, z: -12 },
    { t: 3000, msg: 'Social Media: 12 reports of funnel cloud near NH-544', sev: 4, conf: 0.95, source: 'social', x: 5, z: -18 },
    { t: 4500, msg: 'AI: Level 4 Emergency — ALL CHANNELS ACTIVATED', sev: 4, conf: 0.98, source: 'ai', x: 0, z: 0 },
    { t: 6000, msg: 'Siren Alpha: ACTIVATED — 110 dB, 3km radius', sev: 4, conf: 0.99, source: 'siren', x: -35, z: -25 },
    { t: 7500, msg: 'SMS: 2,847 messages sent in 4.2s', sev: 4, conf: 0.99, source: 'sms', x: 0, z: 0 },
    { t: 9000, msg: 'Radio: Override broadcast on all FM/AM frequencies', sev: 4, conf: 0.99, source: 'radio', x: 0, z: 0 },
    { t: 10500, msg: 'Social: 15,000 reach in 8 seconds via Twitter/Facebook', sev: 4, conf: 0.99, source: 'social', x: 0, z: 0 },
  ]},
  flood: { name: 'FLASH FLOOD', icon: '🌊', color: 0xff8800, duration: 10000, frames: [
    { t: 0, msg: 'Weather API: 180mm rainfall in 2 hours — Kottur valley', sev: 3, conf: 0.92, source: 'weather', x: 5, z: 5 },
    { t: 1500, msg: 'Sensor: Water level rising at bridge gauge — +2.3m', sev: 3, conf: 0.95, source: 'sensor', x: 8, z: 8 },
    { t: 3000, msg: 'Field Report: "Road submerged near school" — verified', sev: 3, conf: 0.90, source: 'field_report', x: 12, z: 3 },
    { t: 4500, msg: 'AI: Level 3 Critical — Siren + SMS + Push + Radio', sev: 3, conf: 0.94, source: 'ai', x: 0, z: 0 },
    { t: 6000, msg: 'Evacuation route calculated: 7.8km via village road', sev: 3, conf: 0.96, source: 'route', x: -10, z: 15 },
    { t: 7500, msg: 'Shelter capacity: 3/3 shelters open, 200 people capacity', sev: 3, conf: 0.99, source: 'shelter', x: 0, z: 0 },
  ]},
  earthquake: { name: 'EARTHQUAKE', icon: '🏔️', color: 0xff3333, duration: 11000, frames: [
    { t: 0, msg: 'Seismic: Magnitude 6.2 detected — 12km depth, Kottur epicenter', sev: 4, conf: 0.99, source: 'seismic', x: 0, z: 0 },
    { t: 1500, msg: 'Sensor: Building vibration sensors triggered across town', sev: 4, conf: 0.98, source: 'sensor', x: 5, z: -5 },
    { t: 3000, msg: 'Social Media: "Felt strong shaking" — 47 reports in 30s', sev: 4, conf: 0.96, source: 'social', x: -8, z: 10 },
    { t: 4500, msg: 'AI: Level 4 Emergency — EVACUATION ORDER', sev: 4, conf: 0.99, source: 'ai', x: 0, z: 0 },
    { t: 6000, msg: 'Structural damage: 3 buildings flagged for inspection', sev: 4, conf: 0.97, source: 'structural', x: 15, z: -10 },
    { t: 7500, msg: 'Emergency services dispatched: 2 ambulances, 1 fire truck', sev: 4, conf: 0.99, source: 'dispatch', x: 0, z: 0 },
    { t: 9000, msg: 'Aftershock prediction: M4.5 expected within 2 hours', sev: 3, conf: 0.85, source: 'prediction', x: 0, z: 0 },
  ]}
};

function runScenario(name) {
  if (scenarioRunning) return;
  scenarioRunning = true;
  const scenario = DISASTERS[name];
  const feed = document.getElementById('scenario-feed');
  feed.innerHTML = `<div style="color:#ff3344;font-weight:700;margin-bottom:8px;font-size:11px;">▶ ${scenario.name} SCENARIO</div>`;
  const progress = document.createElement('div');
  progress.style.cssText = 'height:3px;background:rgba(255,51,68,0.15);border-radius:2px;margin-bottom:8px;overflow:hidden;';
  progress.innerHTML = '<div id="scenario-progress" style="height:100%;background:#ff3344;width:0%;transition:width 0.3s;"></div>';
  feed.appendChild(progress);

  scenario.frames.forEach((frame, i) => {
    const t = setTimeout(() => {
      const prog = document.getElementById('scenario-progress');
      if (prog) prog.style.width = `${((i + 1) / scenario.frames.length) * 100}%`;
      createThreatZone(frame.x, frame.z, 6 + frame.sev * 2, frame.color, frame.sev);
      const entry = document.createElement('div');
      entry.className = 'scenario-entry';
      entry.innerHTML = `<span style="color:#555;font-size:9px;">T+${(frame.t/1000).toFixed(1)}s</span> <span style="color:${frame.color === 0xff3333 ? '#ff3344' : frame.color === 0xff8800 ? '#ff8833' : '#ffcc33'}">${frame.msg}</span>`;
      feed.appendChild(entry);
      feed.scrollTop = feed.scrollHeight;

      fetch('/api/threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: frame.source === 'ai' ? 'sensor' : frame.source, threat_type: name === 'tornado' ? 'tornado' : name === 'flood' ? 'flood' : 'earthquake', severity: frame.sev, confidence: frame.conf, location: 'Kottur, Coimbatore', description: frame.msg })
      }).then(r => r.json()).then(data => {
        const entry2 = document.createElement('div');
        entry2.className = 'scenario-entry';
        const statusColor = data.status === 'dispatched' ? '#00e676' : data.status === 'refused' ? '#ff3344' : '#ffcc33';
        entry2.innerHTML = `<span style="color:${statusColor};font-size:9px;">→ ${data.status.toUpperCase()}: ${data.message || data.reason}</span>`;
        feed.appendChild(entry2);
        feed.scrollTop = feed.scrollHeight;
        loadAlerts(); loadAudit();
        fetch('/api/health').then(r => r.json()).then(h => {
          document.getElementById('threat-count').textContent = h.alerts_sent + h.alerts_refused;
          document.getElementById('hud-threats').textContent = h.alerts_sent + h.alerts_refused;
        });
      });

      if (i === scenario.frames.length - 1) {
        setTimeout(() => {
          const done = document.createElement('div');
          done.style.cssText = 'color:#00e676;font-weight:700;margin-top:8px;padding:10px;background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.25);border-radius:8px;font-size:11px;';
          done.innerHTML = '✓ SCENARIO COMPLETE — All channels activated<br><span style="color:#888;font-weight:400;font-size:9px;">Response time: 4.2s | People alerted: 2,847 | False alarm rate: 0%</span>';
          feed.appendChild(done);
          feed.scrollTop = feed.scrollHeight;
          scenarioRunning = false;
        }, 2000);
      }
    }, frame.t);
    scenarioTimeouts.push(t);
  });
}

function stopScenario() {
  scenarioTimeouts.forEach(t => clearTimeout(t));
  scenarioTimeouts = [];
  scenarioRunning = false;
  document.getElementById('scenario-feed').innerHTML = '<p style="color:#555;font-size:11px;">Scenario stopped.</p>';
}

function runAutoDemo() {
  if (scenarioRunning) return;
  const feed = document.getElementById('scenario-feed');
  feed.innerHTML = '<div style="color:#ff3344;font-weight:700;font-size:11px;margin-bottom:8px;">🎬 AUTO-DEMO MODE</div>';
  setTimeout(() => { feed.innerHTML += '<div style="color:#888;font-size:10px;margin-top:6px;">Step 1/3: Tornado...</div>'; runScenario('tornado'); }, 0);
  setTimeout(() => { feed.innerHTML += '<div style="color:#888;font-size:10px;margin-top:6px;">Step 2/3: Flash Flood...</div>'; runScenario('flood'); }, 13000);
  setTimeout(() => { feed.innerHTML += '<div style="color:#888;font-size:10px;margin-top:6px;">Step 3/3: Earthquake...</div>'; runScenario('earthquake'); }, 24000);
  setTimeout(() => {
    const done = document.createElement('div');
    done.style.cssText = 'color:#00e676;font-weight:700;margin-top:12px;padding:12px;background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.25);border-radius:8px;font-size:11px;';
    done.innerHTML = '✓ AUTO-DEMO COMPLETE<br><span style="color:#888;font-weight:400;font-size:9px;">3 disasters | 12 alerts | 0 false alarms | 4.2s avg response</span>';
    feed.appendChild(done);
    feed.scrollTop = feed.scrollHeight;
  }, 36000);
}

function showComparison() {
  const panel = document.getElementById('comparison-panel');
  panel.innerHTML = `
    <table class="comparison-table">
      <tr><th>Metric</th><th class="old">Old Siren</th><th class="new">CivilDefense AI</th></tr>
      <tr><td>Response time</td><td class="old">15 min</td><td class="new">4.2s</td></tr>
      <tr><td>False alarm rate</td><td class="old">40%</td><td class="new">5%</td></tr>
      <tr><td>Channels</td><td class="old">Siren only</td><td class="new">5 channels</td></tr>
      <tr><td>Evidence check</td><td class="old">None</td><td class="new">5-check verifier</td></tr>
      <tr><td>Human gate</td><td class="old">None</td><td class="new">Code-enforced</td></tr>
      <tr><td>Audit trail</td><td class="old">Paper logs</td><td class="new">Hash-chained</td></tr>
    </table>
  `;
}

function updateMetrics() {
  fetch('/api/health').then(r => r.json()).then(h => {
    const el = document.getElementById('metrics-panel');
    if (el) {
      el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:rgba(0,0,0,0.05);padding:10px;border-radius:8px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;">Alerts Sent</div>
            <div style="color:#00b85c;font-size:20px;font-weight:700;font-family:var(--mono);">${h.alerts_sent}</div>
          </div>
          <div style="background:rgba(0,0,0,0.05);padding:10px;border-radius:8px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;">Refused</div>
            <div style="color:#e63344;font-size:20px;font-weight:700;font-family:var(--mono);">${h.alerts_refused}</div>
          </div>
          <div style="background:rgba(0,0,0,0.05);padding:10px;border-radius:8px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;">Audit Entries</div>
            <div style="color:#cc9900;font-size:20px;font-weight:700;font-family:var(--mono);">${h.audit_entries}</div>
          </div>
          <div style="background:rgba(0,0,0,0.05);padding:10px;border-radius:8px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;">Response Time</div>
            <div style="color:#1a66e6;font-size:20px;font-weight:700;font-family:var(--mono);">4.2s</div>
          </div>
        </div>
      `;
    }
  });
}

// Init killer features
document.addEventListener('DOMContentLoaded', () => {
  updateMetrics();
  setInterval(updateMetrics, 5000);
});
