/* ═══════════════════════════════════════════════════
   M7 DIGITAL — NEURAL SPINE V4
   Three.js ES Module + Post-Processing (Bloom)
   Spine + Neural Network + GPU Particles
   Scroll-linked phases + Mouse interaction
   ═══════════════════════════════════════════════════ */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const isMobile = window.innerWidth < 768;

// ─── RENDERER ───
const canvas = document.getElementById('webgl');
let renderer, composer, scene, camera;

try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false, powerPreference: 'high-performance' });
} catch (e) {
    fallbackNoWebGL();
    throw e;
}

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.setClearColor(0x000000, 1);

// ─── SCENE + CAMERA ───
scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.035);
camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 7);

// ─── POST-PROCESSING (Bloom) ───
composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.8 : 1.2,   // strength
    0.4,                      // radius
    0.3                       // threshold
);
composer.addPass(bloomPass);

// ─── COLORS ───
const C = {
    cyan: new THREE.Color(0x1aeade),
    purple: new THREE.Color(0x8b5cf6),
    pink: new THREE.Color(0xec4899),
    blue: new THREE.Color(0x79aeff),
    green: new THREE.Color(0x46f441),
    yellow: new THREE.Color(0xffde7b),
    white: new THREE.Color(0xffffff),
};

// ─── MOUSE ───
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
document.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    const c = document.getElementById('cursor');
    if (c) c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});
document.addEventListener('touchmove', e => {
    mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
});
document.addEventListener('mouseover', e => {
    const c = document.getElementById('cursor');
    if (c) c.classList.toggle('hover', e.target.matches('a,button,select,input,.cd.a,.ts,.ca'));
});

// ─── LIGHTS ───
scene.add(new THREE.AmbientLight(0x0a0a1a, 2));

const lights = [
    { color: 0x1aeade, intensity: 4, dist: 20, pos: [3, 4, 5] },
    { color: 0x8b5cf6, intensity: 3, dist: 18, pos: [-3, -2, 4] },
    { color: 0xec4899, intensity: 2.5, dist: 15, pos: [0, 3, 3] },
];
const pointLights = lights.map(l => {
    const pl = new THREE.PointLight(l.color, l.intensity, l.dist);
    pl.position.set(...l.pos);
    scene.add(pl);
    return pl;
});

const movingLight = new THREE.PointLight(0x79aeff, 2, 12);
scene.add(movingLight);

// ─── SPINE (Procedural — 20 vertebrae) ───
const spineGroup = new THREE.Group();
scene.add(spineGroup);
const VERT_COUNT = 20;
const SPINE_H = 5.5;
const verts = [];

for (let i = 0; i < VERT_COUNT; i++) {
    const t = i / (VERT_COUNT - 1);
    const y = (t - 0.5) * SPINE_H;
    const w = 0.12 + Math.sin(t * Math.PI) * 0.18;

    // Vertebra body
    const geo = new THREE.BoxGeometry(w * 2.2, 0.08, w * 1.4);
    const color = new THREE.Color().lerpColors(C.cyan, C.purple, t);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        metalness: 0.85,
        roughness: 0.15,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y;
    mesh.rotation.y = t * 0.4;
    spineGroup.add(mesh);

    // Disc
    if (i < VERT_COUNT - 1) {
        const dGeo = new THREE.CylinderGeometry(w * 0.5, w * 0.5, 0.04, 8);
        const dMat = new THREE.MeshBasicMaterial({ color: C.cyan.getHex(), transparent: true, opacity: 0.15 });
        const disc = new THREE.Mesh(dGeo, dMat);
        disc.position.y = y + SPINE_H / (VERT_COUNT - 1) * 0.5;
        spineGroup.add(disc);
    }

    // Side processes (bone-like extensions)
    for (let side of [-1, 1]) {
        const pGeo = new THREE.CylinderGeometry(0.008, 0.015, w * 1.5, 4);
        const pMat = new THREE.MeshBasicMaterial({ color: color.getHex(), transparent: true, opacity: 0.35 });
        const proc = new THREE.Mesh(pGeo, pMat);
        proc.position.set(side * w * 1.2, y, 0);
        proc.rotation.z = side * 0.5;
        spineGroup.add(proc);
    }

    verts.push({ mesh, t, baseY: y, color });
}

// Spinal cord
const cordGeo = new THREE.CylinderGeometry(0.015, 0.015, SPINE_H * 1.15, 8);
const cordMat = new THREE.MeshBasicMaterial({ color: C.cyan.getHex(), transparent: true, opacity: 0.2 });
spineGroup.add(new THREE.Mesh(cordGeo, cordMat));

// ─── NEURAL NETWORK ───
const neuralGroup = new THREE.Group();
scene.add(neuralGroup);
const NODE_COUNT = isMobile ? 35 : 80;
const nodes = [];
const nodeColors = [C.cyan, C.purple, C.pink, C.blue, C.green, C.yellow];

for (let i = 0; i < NODE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1 + Math.random() * 3;
    const y = (Math.random() - 0.5) * SPINE_H;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const size = 0.02 + Math.random() * 0.06;
    const color = nodeColors[Math.floor(Math.random() * nodeColors.length)];

    const geo = new THREE.SphereGeometry(size, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: color.getHex(), transparent: true, opacity: 0.5 + Math.random() * 0.5 });
    const node = new THREE.Mesh(geo, mat);
    node.position.set(x, y, z);
    neuralGroup.add(node);
    nodes.push({ mesh: node, base: new THREE.Vector3(x, y, z), speed: 0.2 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2 });
}

// Neural connections
const connGeo = new THREE.BufferGeometry();
const connPos = [];
const connCol = [];
const conns = [];
for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
        if (nodes[i].base.distanceTo(nodes[j].base) < 1.8) {
            conns.push([i, j]);
            connPos.push(0, 0, 0, 0, 0, 0);
            connCol.push(C.cyan.r, C.cyan.g, C.cyan.b, C.purple.r, C.purple.g, C.purple.b);
        }
    }
}
connGeo.setAttribute('position', new THREE.Float32BufferAttribute(connPos, 3));
connGeo.setAttribute('color', new THREE.Float32BufferAttribute(connCol, 3));
const connMesh = new THREE.LineSegments(connGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending }));
neuralGroup.add(connMesh);

// ─── PARTICLES (GPU Shader) ───
const P_COUNT = isMobile ? 800 : 3500;
const pGeo = new THREE.BufferGeometry();
const pP = new Float32Array(P_COUNT * 3);
const pS = new Float32Array(P_COUNT);
const pV = new Float32Array(P_COUNT * 3);
const pC = new Float32Array(P_COUNT * 3);

for (let i = 0; i < P_COUNT; i++) {
    const r = 1.5 + Math.random() * 6;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pP[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pP[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pP[i * 3 + 2] = r * Math.cos(ph);
    pS[i] = Math.random() * 2.5 + 0.5;
    pV[i * 3] = (Math.random() - 0.5) * 0.003;
    pV[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
    pV[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    // Random color from palette
    const colors = [C.cyan, C.purple, C.pink, C.blue, C.green, C.yellow, C.white];
    const c = colors[Math.floor(Math.random() * colors.length)];
    pC[i * 3] = c.r; pC[i * 3 + 1] = c.g; pC[i * 3 + 2] = c.b;
}

pGeo.setAttribute('position', new THREE.BufferAttribute(pP, 3));
pGeo.setAttribute('aSize', new THREE.BufferAttribute(pS, 1));
pGeo.setAttribute('aColor', new THREE.BufferAttribute(pC, 3));

const pMat = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
        uPR: { value: renderer.getPixelRatio() },
    },
    vertexShader: `
        attribute float aSize;
        attribute vec3 aColor;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPR;
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
            vec3 pos = position;
            pos.x += sin(uTime*0.3 + position.y*2.0)*0.06;
            pos.y += cos(uTime*0.25 + position.x*1.5)*0.05;
            pos.z += sin(uTime*0.2 + position.z*1.8)*0.04;
            // Mouse repulsion
            vec4 mv = modelViewMatrix * vec4(pos,1.0);
            float md = length(vec2(mv.x - uMouse.x*4.0, mv.y - uMouse.y*4.0));
            float repel = smoothstep(3.0,0.0,md)*0.3;
            pos.xy += normalize(pos.xy - uMouse*4.0) * repel * 0.15;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            gl_PointSize = aSize * uPR * (150.0 / -mv.z);
            vAlpha = (0.3 + sin(uTime + length(pos)*0.5)*0.15) * (1.0 - smoothstep(2.0,7.0,length(pos)));
            vColor = aColor;
        }
    `,
    fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if(d > 0.5) discard;
            float glow = pow(1.0 - smoothstep(0.0,0.5,d), 2.5);
            gl_FragColor = vec4(vColor, vAlpha * glow);
        }
    `,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});
scene.add(new THREE.Points(pGeo, pMat));

// ─── DRAG ROTATE ───
let isDrag = false, ds = { x: 0, y: 0 }, dr = { x: 0, y: 0 }, er = { x: 0, y: 0 };
canvas.addEventListener('mousedown', e => { isDrag = true; ds.x = e.clientX; ds.y = e.clientY; });
canvas.addEventListener('touchstart', e => { isDrag = true; ds.x = e.touches[0].clientX; ds.y = e.touches[0].clientY; }, { passive: true });
const drag = (x, y) => { if (!isDrag) return; dr.y += (x - ds.x) * 0.004; dr.x += (y - ds.y) * 0.004; ds.x = x; ds.y = y; };
canvas.addEventListener('mousemove', e => drag(e.clientX, e.clientY));
canvas.addEventListener('touchmove', e => drag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
window.addEventListener('mouseup', () => isDrag = false);
window.addEventListener('touchend', () => isDrag = false);

// ─── 3D CARD TILT ───
document.querySelectorAll('.card-3d').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        card.style.transform = `translateY(0) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) scale(1.05) translateZ(20px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateY(0) rotateX(0) scale(1) translateZ(0)';
    });
});

// ─── SCROLL ───
let scrollP = 0;
window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = h > 0 ? window.scrollY / h : 0;
    document.getElementById('progress').style.width = (scrollP * 100) + '%';
});

// ─── LOADER ───
const loader = document.getElementById('loader');
const fill = document.getElementById('loader-fill');
const status = document.getElementById('loader-status');
const statuses = ['INITIALIZING SYSTEM', 'LOADING SHADERS', 'BUILDING NEURAL SPINE', 'CALIBRATING PARTICLES', 'READY'];
let lp = 0;

const loadInterval = setInterval(() => {
    lp += Math.random() * 18 + 12;
    if (lp >= 100) {
        lp = 100; clearInterval(loadInterval);
        fill.style.width = '100%';
        status.textContent = statuses[4];
        setTimeout(() => { loader.classList.add('gone'); enterScene(); }, 500);
        return;
    }
    fill.style.width = lp + '%';
    status.textContent = statuses[Math.min(Math.floor(lp / 25), 3)];
}, 180);

// ─── ENTER SCENE ───
function enterScene() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    gsap.to('.hero-center', { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' });
    gsap.to('#scroll-down', { opacity: 0.6, duration: 1, delay: 2 });

    // Nav shows on scroll
    ScrollTrigger.create({
        start: 250,
        onUpdate: s => document.getElementById('nav').classList.toggle('show', s.scroll() > 250)
    });

    // Hide scroll cue
    ScrollTrigger.create({ trigger: '.sec-tagline', start: 'top 90%', onEnter: () => gsap.to('#scroll-down', { opacity: 0, duration: .3 }) });

    // Taglines
    gsap.utils.toArray('.tl').forEach((l, i) => {
        gsap.to(l, { scrollTrigger: { trigger: l, start: 'top 82%' }, opacity: 1, y: 0, duration: 0.9, delay: i * 0.15, ease: 'power3.out' });
    });

    // About desc
    gsap.to('.about-desc', { scrollTrigger: { trigger: '.about-desc', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.8 });

    // Cards with easeInOutBack
    gsap.utils.toArray('.card-3d').forEach((card, i) => {
        gsap.to(card, {
            scrollTrigger: { trigger: card, start: 'top 85%' },
            opacity: 1,
            y: 0,
            rotateY: 0,
            scale: 1,
            duration: 1,
            delay: i * 0.15,
            ease: 'back.out(1.7)',
            onStart: () => card.classList.add('visible'),
            onComplete: () => {
                const c = card.querySelector('.counter');
                if (c) animNum(c, +c.dataset.target);
            }
        });
    });

    // Qualify
    gsap.to('.qualify-title', { scrollTrigger: { trigger: '.qualify-title', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.7 });
    gsap.utils.toArray('.qi').forEach((q, i) => {
        gsap.to(q, { scrollTrigger: { trigger: q, start: 'top 88%' }, opacity: 1, x: 0, duration: 0.5, delay: i * 0.12 });
    });
    gsap.to('.qualify-end', { scrollTrigger: { trigger: '.qualify-end', start: 'top 90%' }, opacity: 1, y: 0, duration: 0.5 });

    // Nav active
    document.querySelectorAll('.sec[data-s]').forEach(sec => {
        ScrollTrigger.create({
            trigger: sec, start: 'top center', end: 'bottom center',
            onEnter: () => setNav(sec.dataset.s), onEnterBack: () => setNav(sec.dataset.s),
        });
    });
}

function setNav(idx) {
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.dataset.s === idx));
}

function animNum(el, target) {
    const dur = 1400, start = performance.now();
    (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
        if (t < 1) requestAnimationFrame(tick);
    })(start);
}

// ─── ANIMATION LOOP ───
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    // Shader uniforms
    pMat.uniforms.uTime.value = t;
    pMat.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Drag
    er.x += (dr.x - er.x) * 0.08;
    er.y += (dr.y - er.y) * 0.08;

    // Spine rotation + mouse + drag
    spineGroup.rotation.y = t * 0.12 + mouse.x * 0.5 + er.y;
    spineGroup.rotation.x = Math.sin(t * 0.08) * 0.1 + mouse.y * 0.25 + er.x;

    // Vertebrae animation
    verts.forEach(v => {
        v.mesh.rotation.y = Math.sin(t * 0.4 + v.t * Math.PI * 2) * 0.25;
        v.mesh.position.y = v.baseY + Math.sin(t * 0.7 + v.t * 5) * 0.025;
        v.mesh.material.emissiveIntensity = 0.4 + Math.sin(t * 1.2 + v.t * 6) * 0.2;
    });

    // Neural follows spine loosely
    neuralGroup.rotation.y = spineGroup.rotation.y * 0.5;
    neuralGroup.rotation.x = spineGroup.rotation.x * 0.35;

    // Node animation
    nodes.forEach(n => {
        n.mesh.position.x = n.base.x + Math.sin(t * n.speed + n.phase) * 0.12;
        n.mesh.position.y = n.base.y + Math.cos(t * n.speed * 0.7 + n.phase) * 0.08;
        n.mesh.position.z = n.base.z + Math.sin(t * n.speed * 0.5 + n.phase * 2) * 0.08;
    });

    // Update connections
    const cp = connMesh.geometry.attributes.position.array;
    for (let i = 0; i < conns.length; i++) {
        const [a, b] = conns[i];
        cp[i * 6] = nodes[a].mesh.position.x; cp[i * 6 + 1] = nodes[a].mesh.position.y; cp[i * 6 + 2] = nodes[a].mesh.position.z;
        cp[i * 6 + 3] = nodes[b].mesh.position.x; cp[i * 6 + 4] = nodes[b].mesh.position.y; cp[i * 6 + 5] = nodes[b].mesh.position.z;
    }
    connMesh.geometry.attributes.position.needsUpdate = true;

    // Particle drift
    for (let i = 0; i < P_COUNT; i++) {
        pP[i * 3] += pV[i * 3]; pP[i * 3 + 1] += pV[i * 3 + 1]; pP[i * 3 + 2] += pV[i * 3 + 2];
        const d = Math.sqrt(pP[i * 3] ** 2 + pP[i * 3 + 1] ** 2 + pP[i * 3 + 2] ** 2);
        if (d > 7) {
            const r = 1.5 + Math.random() * 2, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
            pP[i * 3] = r * Math.sin(ph) * Math.cos(th); pP[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); pP[i * 3 + 2] = r * Math.cos(ph);
        }
    }
    pGeo.attributes.position.needsUpdate = true;

    // Moving light
    movingLight.position.set(Math.sin(t * 0.4) * 4, Math.cos(t * 0.3) * 3, Math.cos(t * 0.5) * 4);

    // Camera — mouse parallax + scroll
    camera.position.x = mouse.x * 0.4;
    camera.position.y = mouse.y * 0.3;
    camera.position.z = 7 + scrollP * 4;
    camera.lookAt(0, 0, 0);

    // Fade 3D with scroll
    const vis = Math.max(0, 1 - scrollP * 2.5);
    spineGroup.visible = vis > 0.01;
    neuralGroup.visible = vis > 0.01;
    if (vis > 0) {
        spineGroup.scale.setScalar(vis);
        neuralGroup.scale.setScalar(vis);
    }

    // Dynamic bloom based on scroll
    bloomPass.strength = (isMobile ? 0.8 : 1.2) * (1 - scrollP * 0.5);

    composer.render();
}

// ─── RESIZE ───
window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
});

// ─── FALLBACK ───
function fallbackNoWebGL() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('gone');
        document.querySelector('.hero-center').style.opacity = '1';
        document.querySelector('.hero-center').style.transform = 'scale(1)';
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({ start: 250, onUpdate: s => document.getElementById('nav').classList.toggle('show', s.scroll() > 250) });
        gsap.utils.toArray('.tl').forEach((l, i) => gsap.to(l, { scrollTrigger: { trigger: l, start: 'top 82%' }, opacity: 1, y: 0, duration: 0.8, delay: i * 0.12 }));
        gsap.to('.about-desc', { scrollTrigger: { trigger: '.about-desc', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.8 });
    }, 1500);
}

// ─── GO ───
animate();
