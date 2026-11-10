// CivilDefense AI — 3D Interactive Emergency Broadcast System
// Three.js r128

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030308);
scene.fog = new THREE.FogExp2(0x030308, 0.012);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 45, 70);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x0a0a1a, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xff2222, 0.6);
dirLight.position.set(30, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0x0044ff, 0.3);
rimLight.position.set(-30, 20, -20);
scene.add(rimLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(250, 250);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x050510, roughness: 0.95, metalness: 0.05 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(250, 50, 0x151530, 0x0a0a1a);
gridHelper.material.opacity = 0.4;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Secondary grid (finer)
const grid2 = new THREE.GridHelper(250, 250, 0x0a0a20, 0x050515);
grid2.material.opacity = 0.15;
grid2.material.transparent = true;
scene.add(grid2);

// Buildings with more detail
const buildings = [];
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
  const geo = new THREE.BoxGeometry(w, h, d);
  const hue = 0.58 + Math.random() * 0.08;
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hue, 0.08, 0.12 + Math.random() * 0.06),
    roughness: 0.85,
    metalness: 0.15,
    emissive: new THREE.Color(0x0a0a20),
    emissiveIntensity: 0.05
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos.x, h / 2, pos.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  buildings.push(mesh);

  // Windows
  const rows = Math.floor(h / 2.5);
  const cols = Math.floor(w / 1.2);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.55) continue;
      const wGeo = new THREE.PlaneGeometry(0.6, 0.9);
      const warm = Math.random() > 0.3;
      const wMat = new THREE.MeshBasicMaterial({
        color: warm ? 0xffcc66 : 0x4488ff,
        transparent: true,
        opacity: 0.4 + Math.random() * 0.4
      });
      const win = new THREE.Mesh(wGeo, wMat);
      win.position.set(
        pos.x - w/2 + 0.8 + c * 1.2,
        1.5 + r * 2.5,
        pos.z + d/2 + 0.01
      );
      scene.add(win);
    }
  }
});

// Roads
const roadMat = new THREE.MeshStandardMaterial({ color: 0x151525, roughness: 0.9 });
for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const r1 = 30 + Math.random() * 20;
  const r2 = r1 + 40 + Math.random() * 30;
  const roadGeo = new THREE.PlaneGeometry(r2 - r1, 3);
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = angle;
  road.position.set(Math.cos(angle) * (r1 + r2) / 2, 0.02, Math.sin(angle) * (r1 + r2) / 2);
  scene.add(road);
}

// Siren towers with enhanced visuals
const sirenTowers = [];
const sirenPositions = [
  { x: -35, z: -25, name: "Siren Alpha" },
  { x: 30, z: -35, name: "Siren Bravo" },
  { x: -25, z: 35, name: "Siren Charlie" },
  { x: 40, z: 20, name: "Siren Delta" },
  { x: 0, z: -45, name: "Siren Echo" },
  { x: -45, z: 5, name: "Siren Foxtrot" },
  { x: 20, z: 40, name: "Siren Golf" },
];

sirenPositions.forEach((pos, i) => {
  // Base platform
  const baseGeo = new THREE.CylinderGeometry(2.5, 3, 1.5, 8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.6, roughness: 0.4 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(pos.x, 0.75, pos.z);
  base.castShadow = true;
  scene.add(base);

  // Tower shaft (tapered)
  const shaftGeo = new THREE.CylinderGeometry(0.2, 0.6, 30, 8);
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.8, roughness: 0.2 });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.set(pos.x, 16.5, pos.z);
  shaft.castShadow = true;
  scene.add(shaft);

  // Siren head (rotating)
  const headGeo = new THREE.SphereGeometry(1.5, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.2 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(pos.x, 32, pos.z);
  scene.add(head);

  // Rotating light beam (cone)
  const beamGeo = new THREE.ConeGeometry(12, 35, 24, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(pos.x, 32, pos.z);
  beam.rotation.x = Math.PI / 2;
  scene.add(beam);

  // Secondary beam (wider, dimmer)
  const beam2Geo = new THREE.ConeGeometry(20, 40, 24, 1, true);
  const beam2Mat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.03, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const beam2 = new THREE.Mesh(beam2Geo, beam2Mat);
  beam2.position.set(pos.x, 32, pos.z);
  beam2.rotation.x = Math.PI / 2;
  scene.add(beam2);

  // Point light
  const light = new THREE.PointLight(0xff3333, 0.8, 40);
  light.position.set(pos.x, 32, pos.z);
  scene.add(light);

  // Ambient glow sphere
  const glowGeo = new THREE.SphereGeometry(3, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(pos.x, 32, pos.z);
  scene.add(glow);

  sirenTowers.push({ pos, head, beam, beam2, light, glow, phase: Math.random() * Math.PI * 2, name: pos.name });
});

// Threat zones
const threatZones = [];
function createThreatZone(x, z, radius, color, level) {
  const geo = new THREE.RingGeometry(0.5, radius, 48);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.15, z);
  scene.add(ring);

  const innerGeo = new THREE.CircleGeometry(radius * 0.4, 48);
  const innerMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.rotation.x = -Math.PI / 2;
  inner.position.set(x, 0.1, z);
  scene.add(inner);

  // Pulsing core
  const coreGeo = new THREE.SphereGeometry(0.8, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(x, 1, z);
  scene.add(core);

  threatZones.push({ ring, inner, core, radius, color, level, age: 0 });
}

// Particles (ambient dust/embers)
const particleCount = 800;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 220;
  particlePositions[i * 3 + 1] = Math.random() * 50;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 220;
  const t = Math.random();
  const c = new THREE.Color();
  if (t < 0.3) c.setHSL(0, 0.8, 0.5); // red
  else if (t < 0.6) c.setHSL(0.08, 0.9, 0.5); // orange
  else c.setHSL(0.6, 0.3, 0.4); // blue
  particleColors[i * 3] = c.r;
  particleColors[i * 3 + 1] = c.g;
  particleColors[i * 3 + 2] = c.b;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
const particleMat = new THREE.PointsMaterial({ size: 0.6, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, sizeAttenuation: true });
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Rain effect
const rainCount = 300;
const rainGeo = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 200;
  rainPositions[i * 3 + 1] = Math.random() * 60;
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rainMat = new THREE.PointsMaterial({ size: 0.3, color: 0x4488ff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
const rain = new THREE.Points(rainGeo, rainMat);
scene.add(rain);

// Radar display on ground
const radarGeo = new THREE.RingGeometry(20, 22, 64);
const radarMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
const radar = new THREE.Mesh(radarGeo, radarMat);
radar.rotation.x = -Math.PI / 2;
radar.position.set(0, 0.3, 0);
scene.add(radar);

const radarSweepGeo = new THREE.PlaneGeometry(22, 22);
const radarSweepMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
const radarSweep = new THREE.Mesh(radarSweepGeo, radarSweepMat);
radarSweep.rotation.x = -Math.PI / 2;
radarSweep.position.set(0, 0.35, 0);
scene.add(radarSweep);

// Mouse controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngle = { theta: 0.3, phi: 0.55, radius: 80 };

renderer.domElement.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;
  cameraAngle.theta += deltaX * 0.004;
  cameraAngle.phi = Math.max(0.15, Math.min(1.3, cameraAngle.phi + deltaY * 0.004));
  previousMousePosition = { x: e.clientX, y: e.clientY };
  updateCamera();
});

renderer.domElement.addEventListener('mouseup', () => { isDragging = false; });
renderer.domElement.addEventListener('mouseleave', () => { isDragging = false; });

renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  cameraAngle.radius = Math.max(25, Math.min(160, cameraAngle.radius + e.deltaY * 0.08));
  updateCamera();
});

function updateCamera() {
  camera.position.x = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
  camera.position.y = cameraAngle.radius * Math.cos(cameraAngle.phi);
  camera.position.z = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
  camera.lookAt(0, 0, 0);
}

// Click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('click', (e) => {
  if (isDragging) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const sirenMeshes = sirenTowers.map(t => t.head);
  const intersects = raycaster.intersectObjects(sirenMeshes);
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

  // Rotate siren beams
  sirenTowers.forEach((tower) => {
    tower.beam.rotation.y = elapsed * 1.8 + tower.phase;
    tower.beam2.rotation.y = elapsed * 1.2 + tower.phase + Math.PI;
    tower.light.intensity = 0.4 + 0.6 * Math.sin(elapsed * 3 + tower.phase);
    tower.head.material.emissiveIntensity = 0.4 + 0.4 * Math.sin(elapsed * 4 + tower.phase);
    tower.glow.material.opacity = 0.03 + 0.04 * Math.sin(elapsed * 2 + tower.phase);
    tower.glow.scale.setScalar(1 + 0.2 * Math.sin(elapsed * 2 + tower.phase));
  });

  // Radar sweep
  radarSweep.rotation.z = elapsed * 1.5;

  // Particles
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += 0.015;
    if (positions[i * 3 + 1] > 50) {
      positions[i * 3 + 1] = 0;
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;

  // Rain
  const rainPos = rain.geometry.attributes.position.array;
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3 + 1] -= 0.5;
    if (rainPos[i * 3 + 1] < 0) {
      rainPos[i * 3 + 1] = 60;
      rainPos[i * 3] = (Math.random() - 0.5) * 200;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
  }
  rain.geometry.attributes.position.needsUpdate = true;

  // Threat zones
  for (let i = threatZones.length - 1; i >= 0; i--) {
    const zone = threatZones[i];
    zone.age += 0.015;
    const scale = 1 + Math.sin(zone.age * 4) * 0.08;
    zone.ring.scale.set(scale, scale, 1);
    zone.ring.material.opacity = Math.max(0, 0.4 - zone.age * 0.015);
    zone.inner.material.opacity = Math.max(0, 0.2 - zone.age * 0.008);
    zone.core.material.opacity = Math.max(0, 0.6 - zone.age * 0.03);
    zone.core.scale.setScalar(1 + Math.sin(zone.age * 5) * 0.3);
    if (zone.age > 20) {
      scene.remove(zone.ring);
      scene.remove(zone.inner);
      scene.remove(zone.core);
      threatZones.splice(i, 1);
    }
  }

  // Camera auto-rotate when not dragging
  if (!isDragging) {
    cameraAngle.theta += 0.0005;
    updateCamera();
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateCamera();
animate();

// API
async function api(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const LEVEL_LABELS = { 1: "Info", 2: "Warning", 3: "Critical", 4: "Emergency" };
const LEVEL_COLORS = { 1: 0x00aaff, 2: 0xffcc00, 3: 0xff8800, 4: 0xff3333 };

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

loadAlerts();
loadAudit();
setInterval(() => { loadAlerts(); loadAudit(); }, 3000);
