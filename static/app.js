// CivilDefense AI — 3D Interactive Emergency Broadcast System v2
// Killer features: Disaster Scenario Player, Before/After comparison, Live metrics

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdce0f0);
scene.fog = new THREE.FogExp2(0xdce0f0, 0.005);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 45, 70);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xaaaacc, 0.8);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xff4444, 0.7);
dirLight.position.set(30, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);
const rimLight = new THREE.DirectionalLight(0x4466ff, 0.4);
rimLight.position.set(-30, 20, -20);
scene.add(rimLight);

// Ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(250, 250), new THREE.MeshStandardMaterial({ color: 0xc8cad8, roughness: 0.8, metalness: 0.05 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const gridHelper = new THREE.GridHelper(250, 50, 0x9999bb, 0xbbbbdd);
gridHelper.material.opacity = 0.6; gridHelper.material.transparent = true;
scene.add(gridHelper);

// Buildings
const buildingPositions = [];
for (let i = 0; i < 80; i++) {
  const x = (Math.random() - 0.5) * 180;
  const z = (Math.random() - 0.5) * 180;
  if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
  buildingPositions.push({ x, z });
}
buildingPositions.forEach((pos) => {
  const h = 4 + Math.random() * 20;
  const w = 2 + Math.random() * 5;
  const d = 2 + Math.random() * 5;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.2, 0.75 + Math.random() * 0.15),
    roughness: 0.7, metalness: 0.15, emissive: new THREE.Color(0xaaaacc), emissiveIntensity: 0.3
  }));
  mesh.position.set(pos.x, h / 2, pos.z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  const rows = Math.floor(h / 2.5), cols = Math.floor(w / 1.2);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (Math.random() > 0.55) continue;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.9), new THREE.MeshBasicMaterial({
      color: Math.random() > 0.3 ? 0xffdd66 : 0x66aaff, transparent: true, opacity: 0.8 + Math.random() * 0.2
    }));
    win.position.set(pos.x - w/2 + 0.8 + c * 1.2, 1.5 + r * 2.5, pos.z + d/2 + 0.01);
    scene.add(win);
  }
});

// Siren towers
const sirenTowers = [];
const sirenPositions = [
  { x: -35, z: -25, name: "Alpha" }, { x: 30, z: -35, name: "Bravo" },
  { x: -25, z: 35, name: "Charlie" }, { x: 40, z: 20, name: "Delta" },
  { x: 0, z: -45, name: "Echo" }, { x: -45, z: 5, name: "Foxtrot" },
  { x: 20, z: 40, name: "Golf" },
];
sirenPositions.forEach((pos) => {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.6, roughness: 0.4 }));
  base.position.set(pos.x, 0.75, pos.z); base.castShadow = true; scene.add(base);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.6, 30, 8), new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.8, roughness: 0.2 }));
  shaft.position.set(pos.x, 16.5, pos.z); shaft.castShadow = true; scene.add(shaft);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.2 }));
  head.position.set(pos.x, 32, pos.z); scene.add(head);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(12, 35, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  beam.position.set(pos.x, 32, pos.z); beam.rotation.x = Math.PI / 2; scene.add(beam);
  const beam2 = new THREE.Mesh(new THREE.ConeGeometry(20, 40, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.03, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  beam2.position.set(pos.x, 32, pos.z); beam2.rotation.x = Math.PI / 2; scene.add(beam2);
  const light = new THREE.PointLight(0xff3333, 1.2, 50);
  light.position.set(pos.x, 32, pos.z); scene.add(light);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending }));
  glow.position.set(pos.x, 32, pos.z); scene.add(glow);
  sirenTowers.push({ pos, head, beam, beam2, light, glow, phase: Math.random() * Math.PI * 2, name: pos.name, active: false });
});

// Threat zones
const threatZones = [];
function createThreatZone(x, z, radius, color, level) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, radius, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.15, z); scene.add(ring);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.4, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  inner.rotation.x = -Math.PI / 2; inner.position.set(x, 0.1, z); scene.add(inner);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
  core.position.set(x, 1, z); scene.add(core);
  threatZones.push({ ring, inner, core, radius, color, level, age: 0 });
}

// Particles
const particleCount = 1000;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 220;
  particlePositions[i * 3 + 1] = Math.random() * 50;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 220;
  const t = Math.random();
  const c = new THREE.Color();
  if (t < 0.3) c.setHSL(0, 0.9, 0.55);
  else if (t < 0.6) c.setHSL(0.08, 0.95, 0.55);
  else c.setHSL(0.6, 0.4, 0.5);
  particleColors[i * 3] = c.r; particleColors[i * 3 + 1] = c.g; particleColors[i * 3 + 2] = c.b;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: 0.6, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
scene.add(particles);

// Rain
const rainCount = 400;
const rainGeo = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 200;
  rainPositions[i * 3 + 1] = Math.random() * 60;
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ size: 0.3, color: 0x4488ff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }));
scene.add(rain);

// Radar
const radar = new THREE.Mesh(new THREE.RingGeometry(20, 22, 64), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
radar.rotation.x = -Math.PI / 2; radar.position.set(0, 0.3, 0); scene.add(radar);
const radarSweep = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.06, side: THREE.DoubleSide }));
radarSweep.rotation.x = -Math.PI / 2; radarSweep.position.set(0, 0.35, 0); scene.add(radarSweep);

// Mouse controls
let isDragging = false, previousMousePosition = { x: 0, y: 0 };
let cameraAngle = { theta: 0.3, phi: 0.55, radius: 80 };
renderer.domElement.addEventListener('mousedown', (e) => { isDragging = true; previousMousePosition = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  cameraAngle.theta += (e.clientX - previousMousePosition.x) * 0.004;
  cameraAngle.phi = Math.max(0.15, Math.min(1.3, cameraAngle.phi + (e.clientY - previousMousePosition.y) * 0.004));
  previousMousePosition = { x: e.clientX, y: e.clientY };
  updateCamera();
});
renderer.domElement.addEventListener('mouseup', () => { isDragging = false; });
renderer.domElement.addEventListener('mouseleave', () => { isDragging = false; });
renderer.domElement.addEventListener('wheel', (e) => { e.preventDefault(); cameraAngle.radius = Math.max(25, Math.min(160, cameraAngle.radius + e.deltaY * 0.08)); updateCamera(); });

function updateCamera() {
  camera.position.x = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
  camera.position.y = cameraAngle.radius * Math.cos(cameraAngle.phi);
  camera.position.z = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
  camera.lookAt(0, 0, 0);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('click', (e) => {
  if (isDragging) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(sirenTowers.map(t => t.head));
  if (intersects.length > 0) {
    const tower = sirenTowers.find(t => t.head === intersects[0].object);
    if (tower) {
      createThreatZone(tower.pos.x, tower.pos.z, 18, 0xff3333, 3);
      tower.head.material.emissiveIntensity = 3;
      setTimeout(() => { tower.head.material.emissiveIntensity = 0.6; }, 2000);
    }
  }
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  sirenTowers.forEach((tower) => {
    tower.beam.rotation.y = elapsed * 1.8 + tower.phase;
    tower.beam2.rotation.y = elapsed * 1.2 + tower.phase + Math.PI;
    tower.light.intensity = 0.4 + 0.6 * Math.sin(elapsed * 3 + tower.phase);
    tower.head.material.emissiveIntensity = 0.4 + 0.4 * Math.sin(elapsed * 4 + tower.phase);
    tower.glow.material.opacity = 0.03 + 0.04 * Math.sin(elapsed * 2 + tower.phase);
    tower.glow.scale.setScalar(1 + 0.2 * Math.sin(elapsed * 2 + tower.phase));
  });
  radarSweep.rotation.z = elapsed * 1.5;
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += 0.015;
    if (positions[i * 3 + 1] > 50) { positions[i * 3 + 1] = 0; positions[i * 3] = (Math.random() - 0.5) * 220; positions[i * 3 + 2] = (Math.random() - 0.5) * 220; }
  }
  particles.geometry.attributes.position.needsUpdate = true;
  const rainPos = rain.geometry.attributes.position.array;
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3 + 1] -= 0.5;
    if (rainPos[i * 3 + 1] < 0) { rainPos[i * 3 + 1] = 60; rainPos[i * 3] = (Math.random() - 0.5) * 200; rainPos[i * 3 + 2] = (Math.random() - 0.5) * 200; }
  }
  rain.geometry.attributes.position.needsUpdate = true;
  for (let i = threatZones.length - 1; i >= 0; i--) {
    const zone = threatZones[i];
    zone.age += 0.015;
    const scale = 1 + Math.sin(zone.age * 4) * 0.08;
    zone.ring.scale.set(scale, scale, 1);
    zone.ring.material.opacity = Math.max(0, 0.4 - zone.age * 0.015);
    zone.inner.material.opacity = Math.max(0, 0.2 - zone.age * 0.008);
    zone.core.material.opacity = Math.max(0, 0.6 - zone.age * 0.03);
    zone.core.scale.setScalar(1 + Math.sin(zone.age * 5) * 0.3);
    if (zone.age > 20) { scene.remove(zone.ring); scene.remove(zone.inner); scene.remove(zone.core); threatZones.splice(i, 1); }
  }
  if (!isDragging) { cameraAngle.theta += 0.0003; updateCamera(); }
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
updateCamera();
animate();

// ===== DISASTER SCENARIO PLAYER =====
const SCENARIOS = {
  tornado: {
    name: "TORNADO WARNING",
    steps: [
      { time: 0, msg: "Weather API: Tornado vortex signature detected — Kottur sector", severity: 4, confidence: 0.97, color: 0xff3333, source: "weather" },
      { time: 1500, msg: "Seismic: Micro-tremor from funnel cloud — confirmed", severity: 4, confidence: 0.99, color: 0xff3333, source: "seismic" },
      { time: 3000, msg: "Social Media: 12 reports of funnel cloud near NH-544", severity: 4, confidence: 0.95, color: 0xff3333, source: "social" },
      { time: 4500, msg: "AI: Level 4 Emergency — ALL CHANNELS ACTIVATED", severity: 4, confidence: 0.98, color: 0xff3333, source: "ai" },
    ]
  },
  flood: {
    name: "FLASH FLOOD",
    steps: [
      { time: 0, msg: "Weather API: 180mm rainfall in 2 hours — Kottur valley", severity: 3, confidence: 0.92, color: 0xff8800, source: "weather" },
      { time: 1500, msg: "Sensor: Water level rising at bridge gauge — +2.3m", severity: 3, confidence: 0.95, color: 0xff8800, source: "sensor" },
      { time: 3000, msg: "Field Report: 'Road submerged near school' — verified", severity: 3, confidence: 0.90, color: 0xff8800, source: "field_report" },
      { time: 4500, msg: "AI: Level 3 Critical — Siren + SMS + Push + Radio", severity: 3, confidence: 0.94, color: 0xff8800, source: "ai" },
    ]
  },
  earthquake: {
    name: "EARTHQUAKE",
    steps: [
      { time: 0, msg: "Seismic: Magnitude 6.2 detected — 12km depth, Kottur epicenter", severity: 4, confidence: 0.99, color: 0xff3333, source: "seismic" },
      { time: 1500, msg: "Sensor: Building vibration sensors triggered across town", severity: 4, confidence: 0.98, color: 0xff3333, source: "sensor" },
      { time: 3000, msg: "Social Media: 'Felt strong shaking' — 47 reports in 30s", severity: 4, confidence: 0.96, color: 0xff3333, source: "social" },
      { time: 4500, msg: "AI: Level 4 Emergency — EVACUATION ORDER", severity: 4, confidence: 0.99, color: 0xff3333, source: "ai" },
    ]
  }
};

let scenarioRunning = false;
let scenarioTimeouts = [];

function runScenario(name) {
  if (scenarioRunning) return;
  scenarioRunning = true;
  const scenario = SCENARIOS[name];
  const feed = document.getElementById('scenario-feed');
  feed.innerHTML = `<div style="color:#ff3333;font-weight:700;margin-bottom:8px;">▶ ${scenario.name} SCENARIO</div>`;

  scenario.steps.forEach((step, i) => {
    const t = setTimeout(() => {
      // Add threat zone
      createThreatZone((Math.random()-0.5)*40, (Math.random()-0.5)*40, 8 + step.severity * 3, step.color, step.severity);
      // Add to feed
      const entry = document.createElement('div');
      entry.className = 'scenario-entry';
      entry.innerHTML = `<span style="color:#555;font-size:9px;">T+${(step.time/1000).toFixed(1)}s</span> <span style="color:${step.color === 0xff3333 ? '#ff3333' : step.color === 0xff8800 ? '#ff8800' : '#ffcc00'}">${step.msg}</span>`;
      feed.appendChild(entry);
      feed.scrollTop = feed.scrollHeight;

      // Auto-submit threat to backend
      fetch('/api/threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: step.source === 'ai' ? 'sensor' : step.source,
          threat_type: name === 'tornado' ? 'tornado' : name === 'flood' ? 'flood' : 'earthquake',
          severity: step.severity,
          confidence: step.confidence,
          location: 'Kottur, Coimbatore',
          description: step.msg
        })
      }).then(r => r.json()).then(data => {
        const entry2 = document.createElement('div');
        entry2.className = 'scenario-entry';
        entry2.innerHTML = `<span style="color:#00ff88;font-size:9px;">→ ${data.status.toUpperCase()}: ${data.message || data.reason}</span>`;
        feed.appendChild(entry2);
        feed.scrollTop = feed.scrollHeight;
        loadAlerts();
        loadAudit();
      });

      if (i === scenario.steps.length - 1) {
        setTimeout(() => {
          const done = document.createElement('div');
          done.style.cssText = 'color:#00ff88;font-weight:700;margin-top:8px;padding:8px;background:rgba(0,255,136,0.1);border-radius:6px;';
          done.textContent = '✓ SCENARIO COMPLETE — All channels activated';
          feed.appendChild(done);
          scenarioRunning = false;
        }, 2000);
      }
    }, step.time);
    scenarioTimeouts.push(t);
  });
}

function stopScenario() {
  scenarioTimeouts.forEach(t => clearTimeout(t));
  scenarioTimeouts = [];
  scenarioRunning = false;
  document.getElementById('scenario-feed').innerHTML = '<p style="color:#555;font-size:11px;">Scenario stopped.</p>';
}

// API helpers
async function api(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const LEVEL_LABELS = { 1: "Info", 2: "Warning", 3: "Critical", 4: "Emergency" };

document.getElementById('severity').addEventListener('input', (e) => {
  document.getElementById('severity-label').textContent = `${e.target.value} — ${LEVEL_LABELS[e.target.value]}`;
});
document.getElementById('confidence').addEventListener('input', (e) => {
  document.getElementById('conf-label').textContent = parseFloat(e.target.value).toFixed(2);
});

async function loadAlerts() {
  try {
    const data = await api('/api/alerts');
    document.getElementById('alert-count').textContent = data.alerts.length;
    document.getElementById('hud-alerts').textContent = data.alerts.length;
    for (const [ch, on] of Object.entries(data.channels)) {
      const el = document.getElementById(`st-${ch}`);
      if (el) { el.textContent = on ? 'ON' : 'OFF'; el.className = 'ch-status' + (on ? ' on' : ''); }
      const chEl = document.getElementById(`ch-${ch}`);
      if (chEl) chEl.classList.toggle('active', on);
    }
    const pending = data.alerts.filter(a => a.pending_approval);
    const pa = document.getElementById('pending-area');
    if (!pending.length) {
      pa.innerHTML = '<p class="empty-state">No pending approvals.</p>';
    } else {
      pa.innerHTML = pending.map(a => `
        <div class="pending-item">
          <h4>⚠ Level ${a.threat.severity} — ${a.threat.threat_type.toUpperCase()}</h4>
          <p>${a.threat.description} · ${a.threat.location} · Conf: ${a.threat.confidence}</p>
          <div class="pending-btns">
            <button class="btn-approve" onclick="approve('${a.id}', true)">APPROVE</button>
            <button class="btn-deny" onclick="approve('${a.id}', false)">DENY</button>
          </div>
        </div>
      `).join('');
    }
  } catch (e) { console.error(e); }
}

async function loadAudit() {
  try {
    const data = await api('/api/audit');
    document.getElementById('hud-audit').textContent = data.entries.length;
    const area = document.getElementById('audit-area');
    if (!data.entries.length) {
      area.innerHTML = '<p style="color:var(--faint);font-size:9px;">No entries yet.</p>';
      return;
    }
    area.innerHTML = data.entries.slice(-8).reverse().map(e => `
      <div class="audit-entry ${e.action}">
        <span class="audit-time">${new Date(e.timestamp).toLocaleTimeString()}</span>
        <span class="audit-action ${e.action}">${e.action.toUpperCase()}</span>
        <span class="audit-detail"> L${e.level} ${e.source}</span>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

async function approve(alertId, approved) {
  try {
    const res = await fetch(`/api/approve/${alertId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId, approved, operator: 'human' }),
    });
    const data = await res.json();
    showResult(data);
    await loadAlerts();
    await loadAudit();
  } catch (e) { console.error(e); }
}

function showResult(data) {
  const area = document.getElementById('result-area');
  let statusClass = 'dispatched';
  let statusText = 'DISPATCHED';
  if (data.status === 'refused') { statusClass = 'refused'; statusText = 'REFUSED'; }
  if (data.status === 'pending_approval') { statusClass = 'pending'; statusText = 'PENDING APPROVAL'; }

  let channelsHtml = '';
  if (data.channels) {
    channelsHtml = `<div class="result-channels">${Object.entries(data.channels).map(([k,v]) => v ? `<span>${k.toUpperCase()}</span>` : '').join('')}</div>`;
  }

  area.innerHTML = `
    <div class="result-card ${statusClass}">
      <div class="result-status ${statusClass}">${statusText}</div>
      <div class="result-detail">${data.message || data.reason || ''}</div>
      ${channelsHtml}
    </div>
  ` + area.innerHTML;
}

document.getElementById('threat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    source: document.getElementById('source').value,
    threat_type: document.getElementById('threat_type').value,
    severity: parseInt(document.getElementById('severity').value),
    confidence: parseFloat(document.getElementById('confidence').value),
    location: document.getElementById('location').value,
    description: document.getElementById('description').value,
  };
  try {
    const res = await fetch('/api/threat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    showResult(data);
    const colors = { 1: 0x00aaff, 2: 0xffcc00, 3: 0xff8800, 4: 0xff3333 };
    createThreatZone((Math.random()-0.5)*60, (Math.random()-0.5)*60, 12 + (data.level||2) * 4, colors[data.level] || 0xff3333, data.level);
    await loadAlerts();
    await loadAudit();
    const h = await (await fetch('/api/health')).json();
    document.getElementById('threat-count').textContent = h.alerts_sent + h.alerts_refused;
    document.getElementById('hud-threats').textContent = h.alerts_sent + h.alerts_refused;
  } catch (err) { console.error(err); }
});

// Init
loadAlerts();
loadAudit();
setInterval(() => { loadAlerts(); loadAudit(); }, 3000);
