// CivilDefense AI — 3D Interactive Emergency Broadcast System
// Three.js r128

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.FogExp2(0x050510, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, 60);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xff3333, 0.8);
dirLight.position.set(20, 40, 20);
dirLight.castShadow = true;
scene.add(dirLight);

const pointLight = new THREE.PointLight(0xff3333, 1, 100);
pointLight.position.set(0, 30, 0);
scene.add(pointLight);

// Ground plane with grid
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0a15, roughness: 0.9, metalness: 0.1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(200, 40, 0x1a1a3a, 0x0f0f2a);
scene.add(gridHelper);

// Buildings
const buildings = [];
const buildingPositions = [];
for (let i = 0; i < 60; i++) {
  const x = (Math.random() - 0.5) * 160;
  const z = (Math.random() - 0.5) * 160;
  if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
  buildingPositions.push({ x, z });
}

buildingPositions.forEach((pos, i) => {
  const h = 3 + Math.random() * 15;
  const w = 2 + Math.random() * 4;
  const d = 2 + Math.random() * 4;
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.6, 0.1, 0.15 + Math.random() * 0.1),
    roughness: 0.8,
    metalness: 0.2,
    emissive: new THREE.Color(0x050510),
    emissiveIntensity: 0.1
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos.x, h / 2, pos.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  buildings.push(mesh);

  // Window lights
  const windowCount = Math.floor(h / 2);
  for (let w = 0; w < windowCount; w++) {
    if (Math.random() > 0.6) continue;
    const wGeo = new THREE.PlaneGeometry(0.5, 0.8);
    const wMat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xffcc00 : 0x00aaff,
      transparent: true,
      opacity: 0.6
    });
    const windowMesh = new THREE.Mesh(wGeo, wMat);
    windowMesh.position.set(
      pos.x + (Math.random() - 0.5) * w * 0.8,
      1 + w * 2,
      pos.z + d / 2 + 0.01
    );
    scene.add(windowMesh);
  }
});

// Siren towers
const sirenTowers = [];
const sirenPositions = [
  { x: -30, z: -20 }, { x: 25, z: -30 }, { x: -20, z: 30 },
  { x: 35, z: 15 }, { x: 0, z: -40 }, { x: -40, z: 0 }
];

sirenPositions.forEach((pos, i) => {
  // Tower base
  const baseGeo = new THREE.CylinderGeometry(1.5, 2, 2, 8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.7, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(pos.x, 1, pos.z);
  scene.add(base);

  // Tower shaft
  const shaftGeo = new THREE.CylinderGeometry(0.3, 0.5, 25, 8);
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0x444455, metalness: 0.8, roughness: 0.2 });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.set(pos.x, 13.5, pos.z);
  scene.add(shaft);

  // Siren head
  const headGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.5, metalness: 0.3 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(pos.x, 27, pos.z);
  scene.add(head);

  // Rotating light beam
  const beamGeo = new THREE.ConeGeometry(8, 20, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(pos.x, 27, pos.z);
  beam.rotation.x = Math.PI / 2;
  scene.add(beam);

  // Point light
  const light = new THREE.PointLight(0xff3333, 0.5, 30);
  light.position.set(pos.x, 27, pos.z);
  scene.add(light);

  sirenTowers.push({ pos, head, beam, light, phase: Math.random() * Math.PI * 2 });
});

// Threat zones (animated)
const threatZones = [];
function createThreatZone(x, z, radius, color) {
  const geo = new THREE.RingGeometry(0.5, radius, 32);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.1, z);
  scene.add(ring);

  const innerGeo = new THREE.CircleGeometry(radius * 0.3, 32);
  const innerMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.rotation.x = -Math.PI / 2;
  inner.position.set(x, 0.05, z);
  scene.add(inner);

  threatZones.push({ ring, inner, radius, color, age: 0 });
}

// Particles (ambient atmosphere)
const particleCount = 500;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 200;
  particlePositions[i * 3 + 1] = Math.random() * 40;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
  const c = new THREE.Color().setHSL(Math.random() * 0.1 + 0.95, 0.8, 0.5);
  particleColors[i * 3] = c.r;
  particleColors[i * 3 + 1] = c.g;
  particleColors[i * 3 + 2] = c.b;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
const particleMat = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Radar display (2D overlay on ground)
const radarGeo = new THREE.RingGeometry(15, 16, 64);
const radarMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
const radar = new THREE.Mesh(radarGeo, radarMat);
radar.rotation.x = -Math.PI / 2;
radar.position.set(0, 0.2, 0);
scene.add(radar);

const radarSweepGeo = new THREE.PlaneGeometry(16, 16);
const radarSweepMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
const radarSweep = new THREE.Mesh(radarSweepGeo, radarSweepMat);
radarSweep.rotation.x = -Math.PI / 2;
radarSweep.position.set(0, 0.25, 0);
scene.add(radarSweep);

// Mouse controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngle = { theta: 0.5, phi: 0.6, radius: 75 };

renderer.domElement.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;
  cameraAngle.theta += deltaX * 0.005;
  cameraAngle.phi = Math.max(0.1, Math.min(1.4, cameraAngle.phi + deltaY * 0.005));
  previousMousePosition = { x: e.clientX, y: e.clientY };
  updateCamera();
});

renderer.domElement.addEventListener('mouseup', () => { isDragging = false; });
renderer.domElement.addEventListener('mouseleave', () => { isDragging = false; });

renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  cameraAngle.radius = Math.max(20, Math.min(150, cameraAngle.radius + e.deltaY * 0.1));
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
  const intersects = raycaster.intersectObjects(sirenTowers.map(t => t.head));
  if (intersects.length > 0) {
    const tower = sirenTowers.find(t => t.head === intersects[0].object);
    if (tower) {
      createThreatZone(tower.pos.x, tower.pos.z, 15, 0xff3333);
      // Flash the siren
      tower.head.material.emissiveIntensity = 2;
      setTimeout(() => { tower.head.material.emissiveIntensity = 0.5; }, 2000);
    }
  }
});

// Clock
const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Rotate siren beams
  sirenTowers.forEach((tower, i) => {
    tower.beam.rotation.y = elapsed * 1.5 + tower.phase;
    tower.light.intensity = 0.3 + 0.4 * Math.sin(elapsed * 3 + tower.phase);
    tower.head.material.emissiveIntensity = 0.3 + 0.3 * Math.sin(elapsed * 4 + tower.phase);
  });

  // Radar sweep
  radarSweep.rotation.z = elapsed * 2;

  // Particles
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += 0.02;
    if (positions[i * 3 + 1] > 40) {
      positions[i * 3 + 1] = 0;
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;

  // Threat zones pulse
  threatZones.forEach((zone, i) => {
    zone.age += 0.02;
    const scale = 1 + Math.sin(zone.age * 3) * 0.1;
    zone.ring.scale.set(scale, scale, 1);
    zone.ring.material.opacity = Math.max(0, 0.3 - zone.age * 0.02);
    zone.inner.material.opacity = Math.max(0, 0.15 - zone.age * 0.01);
    if (zone.age > 15) {
      scene.remove(zone.ring);
      scene.remove(zone.inner);
      threatZones.splice(i, 1);
    }
  });

  // Ground pulse
  gridHelper.material.opacity = 0.3 + 0.1 * Math.sin(elapsed * 2);

  renderer.render(scene, camera);
}

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Init
updateCamera();
animate();

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
    // Update channels
    for (const [ch, on] of Object.entries(data.channels)) {
      const el = document.getElementById(`st-${ch}`);
      if (el) { el.textContent = on ? 'ON' : 'OFF'; el.className = 'ch-status' + (on ? ' on' : ''); }
      const chEl = document.getElementById(`ch-${ch}`);
      if (chEl) chEl.classList.toggle('active', on);
    }
    // Pending
    const pending = data.alerts.filter(a => a.pending_approval);
    const pa = document.getElementById('pending-area');
    if (!pending.length) {
      pa.innerHTML = '<p style="color:#555;font-size:11px;">No pending approvals.</p>';
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
      area.innerHTML = '<p style="color:#555;font-size:9px;">No entries yet.</p>';
      return;
    }
    area.innerHTML = data.entries.slice(-10).reverse().map(e => `
      <div class="audit-entry ${e.action}">
        <span class="audit-time">${new Date(e.timestamp).toLocaleTimeString()}</span>
        <span class="audit-action ${e.action}"> ${e.action.toUpperCase()}</span>
        <span> L${e.level} · ${e.source}</span>
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
    // Add threat zone to 3D scene
    const colors = { 1: 0x00aaff, 2: 0xffcc00, 3: 0xff8800, 4: 0xff3333 };
    createThreatZone((Math.random()-0.5)*60, (Math.random()-0.5)*60, 10 + data.threat?.severity * 5 || 15, colors[data.level] || 0xff3333);
    await loadAlerts();
    await loadAudit();
    // Update threat count
    const h = await (await fetch('/api/health')).json();
    document.getElementById('threat-count').textContent = h.alerts_sent + h.alerts_refused;
    document.getElementById('hud-threats').textContent = h.alerts_sent + h.alerts_refused;
  } catch (err) { console.error(err); }
});

// Init
loadAlerts();
loadAudit();
setInterval(() => { loadAlerts(); loadAudit(); }, 3000);
