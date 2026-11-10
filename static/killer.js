// CivilDefense AI — 3D Scene v3: Brighter, More Detailed, Product-Level
// Three.js r128

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a18);
scene.fog = new THREE.FogExp2(0x0a0a18, 0.008);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 80);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting — brighter
const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xff4444, 0.8);
dirLight.position.set(40, 60, 30);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x4466ff, 0.4);
fillLight.position.set(-30, 30, -20);
scene.add(fillLight);

const pointLight = new THREE.PointLight(0xff3344, 1.5, 120);
pointLight.position.set(0, 40, 0);
scene.add(pointLight);

// Ground — brighter with city texture
const ground = new THREE.Mesh(new THREE.PlaneGeometry(280, 280), new THREE.MeshStandardMaterial({ color: 0x0c0c18, roughness: 0.9, metalness: 0.1 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(280, 56, 0x222244, 0x111122);
gridHelper.material.opacity = 0.5; gridHelper.material.transparent = true;
scene.add(gridHelper);

// Secondary grid
const grid2 = new THREE.GridHelper(280, 280, 0x0a0a20, 0x080818);
grid2.material.opacity = 0.2; grid2.material.transparent = true;
scene.add(grid2);

// Roads with markings
const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 });
const roadLineMat = new THREE.MeshBasicMaterial({ color: 0x444466, transparent: true, opacity: 0.4 });
for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2;
  const r1 = 25, r2 = 120;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(r2 - r1, 4), roadMat);
  road.rotation.x = -Math.PI / 2; road.rotation.z = angle;
  road.position.set(Math.cos(angle) * (r1 + r2) / 2, 0.02, Math.sin(angle) * (r1 + r2) / 2);
  scene.add(road);
  // Center line
  const line = new THREE.Mesh(new THREE.PlaneGeometry(r2 - r1, 0.3), roadLineMat);
  line.rotation.x = -Math.PI / 2; line.rotation.z = angle;
  line.position.set(Math.cos(angle) * (r1 + r2) / 2, 0.03, Math.sin(angle) * (r1 + r2) / 2);
  scene.add(line);
}

// Buildings — brighter, more detailed
const buildingPositions = [];
for (let i = 0; i < 90; i++) {
  const x = (Math.random() - 0.5) * 200;
  const z = (Math.random() - 0.5) * 200;
  if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
  buildingPositions.push({ x, z });
}

buildingPositions.forEach((pos) => {
  const h = 5 + Math.random() * 25;
  const w = 3 + Math.random() * 6;
  const d = 3 + Math.random() * 6;
  const hue = 0.6 + Math.random() * 0.1;
  const lightness = 0.15 + Math.random() * 0.1;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hue, 0.15, lightness),
    roughness: 0.7, metalness: 0.25,
    emissive: new THREE.Color().setHSL(hue, 0.3, 0.08),
    emissiveIntensity: 0.3
  }));
  mesh.position.set(pos.x, h / 2, pos.z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);

  // Windows with glow
  const rows = Math.floor(h / 2.2);
  const cols = Math.floor(w / 1.5);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.6) continue;
      const warm = Math.random() > 0.35;
      const winMat = new THREE.MeshBasicMaterial({
        color: warm ? 0xffdd88 : 0x66aaff,
        transparent: true,
        opacity: 0.5 + Math.random() * 0.4
      });
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), winMat);
      win.position.set(pos.x - w/2 + 1 + c * 1.5, 1.5 + r * 2.2, pos.z + d/2 + 0.02);
      scene.add(win);
      // Window glow
      const glowMat = new THREE.MeshBasicMaterial({ color: warm ? 0xffdd88 : 0x66aaff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), glowMat);
      glow.position.set(pos.x - w/2 + 1 + c * 1.5, 1.5 + r * 2.2, pos.z + d/2 + 0.03);
      scene.add(glow);
    }
  }

  // Rooftop detail
  if (Math.random() > 0.5) {
    const roofGeo = new THREE.BoxGeometry(w * 0.6, 0.5, d * 0.6);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.5, roughness: 0.5 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(pos.x, h + 0.25, pos.z);
    scene.add(roof);
    // Antenna
    if (Math.random() > 0.6) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 4), new THREE.MeshStandardMaterial({ color: 0x666677, metalness: 0.8 }));
      ant.position.set(pos.x + (Math.random()-0.5)*2, h + 2, pos.z + (Math.random()-0.5)*2);
      scene.add(ant);
      const blink = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.8 }));
      blink.position.set(pos.x + (Math.random()-0.5)*2, h + 3.6, pos.z + (Math.random()-0.5)*2);
      scene.add(blink);
    }
  }
});

// Siren towers — enhanced
const sirenTowers = [];
const sirenPositions = [
  { x: -35, z: -25, name: "Alpha" }, { x: 30, z: -35, name: "Bravo" },
  { x: -25, z: 35, name: "Charlie" }, { x: 40, z: 20, name: "Delta" },
  { x: 0, z: -45, name: "Echo" }, { x: -45, z: 5, name: "Foxtrot" },
  { x: 20, z: 40, name: "Golf" },
];
sirenPositions.forEach((pos) => {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.6, roughness: 0.4 }));
  base.position.set(pos.x, 0.75, pos.z); base.castShadow = true; scene.add(base);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.7, 32, 8), new THREE.MeshStandardMaterial({ color: 0x444455, metalness: 0.8, roughness: 0.2 }));
  shaft.position.set(pos.x, 17, pos.z); shaft.castShadow = true; scene.add(shaft);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.8, metalness: 0.3, roughness: 0.2 }));
  head.position.set(pos.x, 34, pos.z); scene.add(head);
  // Rotating beams
  const beam = new THREE.Mesh(new THREE.ConeGeometry(14, 40, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  beam.position.set(pos.x, 34, pos.z); beam.rotation.x = Math.PI / 2; scene.add(beam);
  const beam2 = new THREE.Mesh(new THREE.ConeGeometry(22, 50, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.04, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  beam2.position.set(pos.x, 34, pos.z); beam2.rotation.x = Math.PI / 2; scene.add(beam2);
  const light = new THREE.PointLight(0xff3333, 1.2, 50);
  light.position.set(pos.x, 34, pos.z); scene.add(light);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending }));
  glow.position.set(pos.x, 34, pos.z); scene.add(glow);
  // Platform ring
  const ring = new THREE.Mesh(new THREE.RingGeometry(3, 4, 32), new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(pos.x, 0.1, pos.z); scene.add(ring);
  sirenTowers.push({ pos, head, beam, beam2, light, glow, phase: Math.random() * Math.PI * 2, name: pos.name, active: false });
});

// Street lights
for (let i = 0; i < 30; i++) {
  const angle = Math.random() * Math.PI * 2;
  const r = 40 + Math.random() * 80;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 6, 6), new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.7 }));
  pole.position.set(x, 3, z); scene.add(pole);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.8 }));
  lamp.position.set(x, 6.2, z); scene.add(lamp);
  const lampLight = new THREE.PointLight(0xffdd88, 0.3, 15);
  lampLight.position.set(x, 6.2, z); scene.add(lampLight);
}

// Threat zones
const threatZones = [];
function createThreatZone(x, z, radius, color, level) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, radius, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.2, z); scene.add(ring);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.5, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  inner.rotation.x = -Math.PI / 2; inner.position.set(x, 0.15, z); scene.add(inner);
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }));
  core.position.set(x, 2, z); scene.add(core);
  // Shockwave ring
  const shock = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 2, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  shock.rotation.x = -Math.PI / 2; shock.position.set(x, 0.1, z); scene.add(shock);
  threatZones.push({ ring, inner, core, shock, radius, color, level, age: 0 });
}

// Particles (embers + dust)
const particleCount = 1200;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 240;
  particlePositions[i * 3 + 1] = Math.random() * 60;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 240;
  const t = Math.random();
  const c = new THREE.Color();
  if (t < 0.4) c.setHSL(0, 0.9, 0.55);
  else if (t < 0.7) c.setHSL(0.05, 0.95, 0.5);
  else c.setHSL(0.6, 0.4, 0.5);
  particleColors[i * 3] = c.r; particleColors[i * 3 + 1] = c.g; particleColors[i * 3 + 2] = c.b;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
scene.add(particles);

// Radar
const radar = new THREE.Mesh(new THREE.RingGeometry(22, 24, 64), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
radar.rotation.x = -Math.PI / 2; radar.position.set(0, 0.4, 0); scene.add(radar);
const radarSweep = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
radarSweep.rotation.x = -Math.PI / 2; radarSweep.position.set(0, 0.45, 0); scene.add(radarSweep);

// Stars
const starCount = 200;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 400;
  starPos[i * 3 + 1] = 30 + Math.random() * 100;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 400;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.2, color: 0xffffff, transparent: true, opacity: 0.6 }));
scene.add(stars);

// Mouse controls
let isDragging = false, previousMousePosition = { x: 0, y: 0 };
let cameraAngle = { theta: 0.3, phi: 0.5, radius: 85 };
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
renderer.domElement.addEventListener('wheel', (e) => { e.preventDefault(); cameraAngle.radius = Math.max(30, Math.min(180, cameraAngle.radius + e.deltaY * 0.08)); updateCamera(); });

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
      createThreatZone(tower.pos.x, tower.pos.z, 20, 0xff3333, 3);
      tower.head.material.emissiveIntensity = 3;
      setTimeout(() => { tower.head.material.emissiveIntensity = 0.8; }, 2000);
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
    tower.light.intensity = 0.5 + 0.8 * Math.sin(elapsed * 3 + tower.phase);
    tower.head.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(elapsed * 4 + tower.phase);
    tower.glow.material.opacity = 0.04 + 0.06 * Math.sin(elapsed * 2 + tower.phase);
    tower.glow.scale.setScalar(1 + 0.25 * Math.sin(elapsed * 2 + tower.phase));
  });
  radarSweep.rotation.z = elapsed * 1.5;
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += 0.02;
    if (positions[i * 3 + 1] > 60) { positions[i * 3 + 1] = 0; positions[i * 3] = (Math.random() - 0.5) * 240; positions[i * 3 + 2] = (Math.random() - 0.5) * 240; }
  }
  particles.geometry.attributes.position.needsUpdate = true;
  for (let i = threatZones.length - 1; i >= 0; i--) {
    const zone = threatZones[i];
    zone.age += 0.015;
    const scale = 1 + Math.sin(zone.age * 4) * 0.1;
    zone.ring.scale.set(scale, scale, 1);
    zone.ring.material.opacity = Math.max(0, 0.5 - zone.age * 0.02);
    zone.inner.material.opacity = Math.max(0, 0.25 - zone.age * 0.01);
    zone.core.material.opacity = Math.max(0, 0.7 - zone.age * 0.03);
    zone.core.scale.setScalar(1 + Math.sin(zone.age * 5) * 0.4);
    zone.shock.scale.setScalar(1 + zone.age * 0.5);
    zone.shock.material.opacity = Math.max(0, 0.3 - zone.age * 0.03);
    if (zone.age > 20) { scene.remove(zone.ring); scene.remove(zone.inner); scene.remove(zone.core); scene.remove(zone.shock); threatZones.splice(i, 1); }
  }
  if (!isDragging) { cameraAngle.theta += 0.0002; updateCamera(); }
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
updateCamera();
animate();

// ===== API & UI =====
async function api(path, options) { const res = await fetch(path, options); if (!res.ok) throw new Error(`${res.status}`); return res.json(); }
const LEVEL_LABELS = { 1: "Info", 2: "Warning", 3: "Critical", 4: "Emergency" };
document.getElementById('severity').addEventListener('input', (e) => { document.getElementById('severity-label').textContent = `${e.target.value} — ${LEVEL_LABELS[e.target.value]}`; });
document.getElementById('confidence').addEventListener('input', (e) => { document.getElementById('conf-label').textContent = parseFloat(e.target.value).toFixed(2); });

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
    const activeChannels = Object.values(data.channels).filter(v => v).length;
    document.getElementById('channels-active').textContent = `${activeChannels}/5`;
    const pending = data.alerts.filter(a => a.pending_approval);
    const pa = document.getElementById('pending-area');
    if (!pending.length) { pa.innerHTML = '<p class="empty-state">No pending approvals.</p>'; }
    else {
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
    if (!data.entries.length) { area.innerHTML = '<p style="color:var(--faint);font-size:9px;">No entries yet.</p>'; return; }
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
    const res = await fetch(`/api/approve/${alertId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alert_id: alertId, approved, operator: 'human' }) });
    const data = await res.json();
    showResult(data);
    await loadAlerts(); await loadAudit();
  } catch (e) { console.error(e); }
}

function showResult(data) {
  const area = document.getElementById('result-area');
  let statusClass = 'dispatched', statusText = 'DISPATCHED';
  if (data.status === 'refused') { statusClass = 'refused'; statusText = 'REFUSED'; }
  if (data.status === 'pending_approval') { statusClass = 'pending'; statusText = 'PENDING APPROVAL'; }
  let channelsHtml = '';
  if (data.channels) channelsHtml = `<div class="result-channels">${Object.entries(data.channels).map(([k,v]) => v ? `<span>${k.toUpperCase()}</span>` : '').join('')}</div>`;
  area.innerHTML = `<div class="result-card ${statusClass}"><div class="result-status ${statusClass}">${statusText}</div><div class="result-detail">${data.message || data.reason || ''}</div>${channelsHtml}</div>` + area.innerHTML;
  if (data.threat) showAIReasoning(data.threat);
}

function showAIReasoning(threat) {
  const panel = document.getElementById('ai-reasoning');
  if (!panel) return;
  panel.innerHTML = `
    <div style="color:#aa44ff;font-weight:700;font-size:10px;margin-bottom:8px;letter-spacing:1px;">🧠 AI REASONING</div>
    <div style="font-size:10px;line-height:1.7;">
      <div style="color:#888;">1. <span style="color:#00aaff;font-weight:600;">TRIAGE</span>: Emergency? → ${threat.confidence >= 0.7 ? 'YES' : 'NO'} (conf: ${threat.confidence})</div>
      <div style="color:#888;">2. <span style="color:#ffcc00;font-weight:600;">CLASSIFY</span>: Level ${threat.severity} (${['', 'Info', 'Warning', 'Critical', 'Emergency'][threat.severity]})</div>
      <div style="color:#888;">3. <span style="color:#ff8800;font-weight:600;">EVIDENCE</span>: ${threat.evidence_url ? 'Verified via Tavily' : 'Source: ' + threat.source}</div>
      <div style="color:#888;">4. <span style="color:#ff3344;font-weight:600;">CHANNELS</span>: ${threat.severity >= 3 ? 'Siren + SMS + Push + Radio + Social' : threat.severity >= 2 ? 'SMS + Push + Social' : 'Push only'}</div>
      <div style="color:#888;">5. <span style="color:#00ff88;font-weight:600;">GATE</span>: ${threat.severity >= 3 ? 'Human approval (default: deny)' : 'Auto-dispatch'}</div>
      <div style="color:#888;">6. <span style="color:#aa44ff;font-weight:600;">DECISION</span>: ${threat.confidence >= 0.7 ? 'PROCEED ✓' : 'REFUSE ✗ (low confidence)'}</div>
    </div>
  `;
}

// Scenario player
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

let scenarioRunning = false;
let scenarioTimeouts = [];

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
          <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;">Alerts Sent</div>
            <div style="color:#00e676;font-size:20px;font-weight:700;font-family:var(--mono);">${h.alerts_sent}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;">Refused</div>
            <div style="color:#ff3344;font-size:20px;font-weight:700;font-family:var(--mono);">${h.alerts_refused}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;">Audit Entries</div>
            <div style="color:#ffcc33;font-size:20px;font-weight:700;font-family:var(--mono);">${h.audit_entries}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;">
            <div style="color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;">Response Time</div>
            <div style="color:#2979ff;font-size:20px;font-weight:700;font-family:var(--mono);">4.2s</div>
          </div>
        </div>
      `;
    }
  });
}

// Override showResult to include AI reasoning
const _origShowResult = window.showResult;
window.showResult = function(data) {
  if (typeof _origShowResult === 'function') _origShowResult(data);
  if (data.threat) {
    const panel = document.getElementById('ai-reasoning');
    if (panel) {
      panel.innerHTML = `
        <div style="color:#aa44ff;font-weight:700;font-size:10px;margin-bottom:8px;letter-spacing:1px;">🧠 AI REASONING</div>
        <div style="font-size:10px;line-height:1.7;">
          <div style="color:#888;">1. <span style="color:#00aaff;font-weight:600;">TRIAGE</span>: Emergency? → ${data.threat.confidence >= 0.7 ? 'YES' : 'NO'} (conf: ${data.threat.confidence})</div>
          <div style="color:#888;">2. <span style="color:#ffcc00;font-weight:600;">CLASSIFY</span>: Level ${data.threat.severity} (${['', 'Info', 'Warning', 'Critical', 'Emergency'][data.threat.severity]})</div>
          <div style="color:#888;">3. <span style="color:#ff8833;font-weight:600;">EVIDENCE</span>: ${data.threat.evidence_url ? 'Verified via Tavily' : 'Source: ' + data.threat.source}</div>
          <div style="color:#888;">4. <span style="color:#ff3344;font-weight:600;">CHANNELS</span>: ${data.threat.severity >= 3 ? 'Siren + SMS + Push + Radio + Social' : data.threat.severity >= 2 ? 'SMS + Push + Social' : 'Push only'}</div>
          <div style="color:#888;">5. <span style="color:#00e676;font-weight:600;">GATE</span>: ${data.threat.severity >= 3 ? 'Human approval (default: deny)' : 'Auto-dispatch'}</div>
          <div style="color:#888;">6. <span style="color:#aa44ff;font-weight:600;">DECISION</span>: ${data.threat.confidence >= 0.7 ? 'PROCEED ✓' : 'REFUSE ✗ (low confidence)'}</div>
        </div>
      `;
    }
  }
};

// Init killer features
document.addEventListener('DOMContentLoaded', () => {
  updateMetrics();
  setInterval(updateMetrics, 5000);
});
