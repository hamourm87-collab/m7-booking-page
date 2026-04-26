/* ═══════════════════════════════════════════════════════════
   M7 DIGITAL — PHASE 1: THE HERO
   Based on Hermes 987-frame analysis of activetheory.net
   
   Features:
   - M7 Infinity Logo (procedural, iridescent material)
   - Jellyfish (scattered, bioluminescent, procedural)
   - GPU Particle System (7 colors from report)
   - Post-Processing (UnrealBloom)
   - Mouse Parallax (0.1 strength, ±20px, ±5° tilt)
   - Scroll-linked fade (15%→25% = logo fade)
   - Camera dolly forward (0.5% per 30s)
   - Drag to rotate 360°
   ═══════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const mobile = window.innerWidth < 768;

// ─── RENDERER ───
const canvas = document.getElementById('c');
let R;
try {
    R = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
} catch (e) { fallback(); throw e; }

R.setSize(window.innerWidth, window.innerHeight);
R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
R.toneMapping = THREE.ACESFilmicToneMapping;
R.toneMappingExposure = 0.6;
R.setClearColor(0x0a0e14, 1); // exact bg from report

// ─── SCENE + CAMERA ───
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0e14, 0.03);
const cam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
cam.position.set(0, 0, 8);

// ─── POST-PROCESSING ───
const comp = new EffectComposer(R);
comp.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    mobile ? 0.15 : 0.2, 0.2, 1.5
);
comp.addPass(bloom);

// ─── PALETTE (from Hermes report) ───
const P = {
    blue: 0x4a9eff,
    cyan: 0x5fdddd,
    sky: 0x7ab8ff,
    lime: 0xa8e063,
    gold: 0xd4af37,
    metal: 0xc8d0d8,
    pink: 0xec4899,
    white: 0xe8e8e0,
    yellow: 0xf4e8c8,
    green: 0x46f441,
    orange: 0xfdb460,
    cyanUI: 0x00d9ff,
    jellyTop: 0x4a6b8a,
    jellyDark: 0x2a3f5a,
};

// ─── LIGHTS ───
scene.add(new THREE.AmbientLight(0x050810, 0.8));
const keyLight = new THREE.PointLight(P.blue, 1.5, 20);
keyLight.position.set(3, 4, 6);
scene.add(keyLight);
const fillLight = new THREE.PointLight(P.cyan, 0.8, 15);
fillLight.position.set(-3, -2, 5);
scene.add(fillLight);
const rimLight = new THREE.PointLight(P.gold, 0.6, 12);
rimLight.position.set(0, 3, -3);
scene.add(rimLight);
const orbLight = new THREE.PointLight(P.lime, 0.4, 10);
scene.add(orbLight);

// ─── M7 INFINITY LOGO (Procedural) ───
// Infinity shape = figure-8 curve using Lissajous
const logoGroup = new THREE.Group();
scene.add(logoGroup);

// Create infinity tube
const infCurve = new THREE.Curve();
infCurve.getPoint = function(t) {
    const a = t * Math.PI * 2;
    const x = Math.sin(a) * 0.8;
    const y = Math.sin(a * 2) * 1.2; // vertical infinity
    const z = Math.cos(a) * 0.3;
    return new THREE.Vector3(x, y, z);
};

const tubeGeo = new THREE.TubeGeometry(infCurve, 120, 0.06, 12, true);
const tubeMat = new THREE.MeshPhysicalMaterial({
    color: P.metal,
    metalness: 0.92,
    roughness: 0.08,
    clearcoat: 0.8,
    clearcoatRoughness: 0.05,
    emissive: P.blue,
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.9,
    iridescence: 0.7,
    iridescenceIOR: 1.5,
});
const tube = new THREE.Mesh(tubeGeo, tubeMat);
logoGroup.add(tube);

// Center ring (the "a" / M7 emblem)
const ringGeo = new THREE.TorusGeometry(0.35, 0.03, 16, 50);
const ringMat = new THREE.MeshPhysicalMaterial({
    color: P.gold,
    metalness: 0.95,
    roughness: 0.05,
    emissive: P.gold,
    emissiveIntensity: 0.15,
    clearcoat: 1,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
logoGroup.add(ring);

// M7 text plane (transparent sprite-like)
const textCanvas = document.createElement('canvas');
textCanvas.width = 256; textCanvas.height = 256;
const tctx = textCanvas.getContext('2d');
tctx.fillStyle = 'transparent';
tctx.fillRect(0, 0, 256, 256);
tctx.fillStyle = '#ffffff';
tctx.font = 'bold 80px Space Grotesk, sans-serif';
tctx.textAlign = 'center';
tctx.textBaseline = 'middle';
tctx.fillText('M7', 128, 128);
const textTex = new THREE.CanvasTexture(textCanvas);
const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), textMat);
logoGroup.add(textPlane);

// ─── JELLYFISH (Procedural, scattered) ───
const jellyGroup = new THREE.Group();
scene.add(jellyGroup);

function createJellyfish(x, y, z, scale) {
    const jg = new THREE.Group();

    // Dome (half sphere)
    const domeGeo = new THREE.SphereGeometry(0.25 * scale, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhysicalMaterial({
        color: P.jellyTop,
        metalness: 0.1,
        roughness: 0.3,
        transmission: 0.6,
        thickness: 0.5,
        emissive: P.cyan,
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    jg.add(dome);

    // Tentacles (3-5 curves)
    const tentCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < tentCount; i++) {
        const points = [];
        const angle = (i / tentCount) * Math.PI * 2;
        const baseX = Math.cos(angle) * 0.1 * scale;
        const baseZ = Math.sin(angle) * 0.1 * scale;
        for (let j = 0; j < 8; j++) {
            const t = j / 7;
            points.push(new THREE.Vector3(
                baseX + Math.sin(t * 3 + i) * 0.05 * scale,
                -t * 0.6 * scale,
                baseZ + Math.cos(t * 2 + i) * 0.05 * scale
            ));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const tentGeo = new THREE.TubeGeometry(curve, 12, 0.008 * scale, 4, false);
        const tentMat = new THREE.MeshBasicMaterial({
            color: P.cyan,
            transparent: true,
            opacity: 0.08 + Math.random() * 0.06,
        });
        jg.add(new THREE.Mesh(tentGeo, tentMat));
    }

    jg.position.set(x, y, z);
    jg.userData = {
        baseY: y,
        floatSpeed: 0.3 + Math.random() * 0.4,
        floatAmp: 0.08 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.001,
        driftZ: (Math.random() - 0.5) * 0.001,
    };

    return jg;
}

// Scatter jellyfish (report: "scattered everywhere, few")
const jellyPositions = [
    [-3, 1.2, -2, 0.5],
    [3.5, -0.8, -3, 0.35],
];
const jellies = jellyPositions.map(p => {
    const j = createJellyfish(p[0], p[1], p[2], p[3]);
    jellyGroup.add(j);
    return j;
});

// ─── PARTICLES (GPU Shader — 7 colors from report) ───
const PC = mobile ? 1000 : 3500;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PC * 3);
const pSiz = new Float32Array(PC);
const pCol = new Float32Array(PC * 3);
const pVel = new Float32Array(PC * 3);

const particleColors = [
    new THREE.Color(P.white),
    new THREE.Color(P.yellow),
    new THREE.Color(P.cyanUI),
    new THREE.Color(P.green),
    new THREE.Color(P.orange),
    new THREE.Color(P.blue),
    new THREE.Color(P.gold),
];

for (let i = 0; i < PC; i++) {
    const r = 1.5 + Math.random() * 7;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pPos[i * 3 + 2] = r * Math.cos(ph);
    pSiz[i] = Math.random() * 0.5 + 0.15;
    // Upward drift (report: 20-30px/s upward)
    pVel[i * 3] = (Math.random() - 0.5) * 0.002;
    pVel[i * 3 + 1] = Math.random() * 0.002 + 0.0005; // gentle upward
    pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    const c = particleColors[Math.floor(Math.random() * particleColors.length)];
    pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSiz, 1));
pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3));

const pMat = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
        uPR: { value: R.getPixelRatio() },
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
            vec3 p = position;
            p.x += sin(uTime*0.25 + position.y*1.8)*0.06;
            p.y += cos(uTime*0.2 + position.x*1.3)*0.04;
            p.z += sin(uTime*0.18 + position.z*1.5)*0.04;
            vec4 mv = modelViewMatrix * vec4(p,1.0);
            float md = length(vec2(mv.x-uMouse.x*4.0, mv.y-uMouse.y*4.0));
            float rep = smoothstep(3.0,0.0,md)*0.25;
            p.xy += normalize(p.xy - uMouse*4.0 + 0.001) * rep * 0.12;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
            gl_PointSize = aSize * uPR * (140.0 / -mv.z);
            vAlpha = (0.035 + sin(uTime*0.8 + length(p)*0.4)*0.015) * (1.0 - smoothstep(3.5,7.0,length(p)));
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

// ─── MOUSE (report: parallax 0.1 strength, ±20px, lerp 0.1) ───
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
document.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    const c = document.getElementById('cur');
    if (c) c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});
document.addEventListener('touchmove', e => {
    mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
}, { passive: true });
document.addEventListener('mouseover', e => {
    const c = document.getElementById('cur');
    if (c) c.classList.toggle('h', e.target.matches('a,button,select,input,.cd.a,.ts,.cal-a'));
});

// ─── DRAG ROTATE (report: logo rotatable 360°) ───
let isDrag = false, ds = { x: 0, y: 0 }, dr = { x: 0, y: 0 }, er = { x: 0, y: 0 };
canvas.addEventListener('mousedown', e => { isDrag = true; ds.x = e.clientX; ds.y = e.clientY; });
canvas.addEventListener('touchstart', e => { isDrag = true; ds.x = e.touches[0].clientX; ds.y = e.touches[0].clientY; }, { passive: true });
const onDrag = (x, y) => { if (!isDrag) return; dr.y += (x - ds.x) * 0.005; dr.x += (y - ds.y) * 0.005; ds.x = x; ds.y = y; };
canvas.addEventListener('mousemove', e => onDrag(e.clientX, e.clientY));
canvas.addEventListener('touchmove', e => onDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
window.addEventListener('mouseup', () => isDrag = false);
window.addEventListener('touchend', () => isDrag = false);

// ─── 3D CARD TILT (report: ±10° maxTilt, lerp 0.15) ───
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const cx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const cy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        card.style.transform = `translateY(0) rotateY(${cx * 10}deg) rotateX(${-cy * 10}deg) scale(1.05) translateZ(20px)`;
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
    document.getElementById('prog').style.width = (scrollP * 100) + '%';
});

// ─── LOADER ───
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const loaderTxt = document.getElementById('loader-txt');
const loadSteps = ['INITIALIZING', 'LOADING SHADERS', 'BUILDING SCENE', 'CALIBRATING', 'READY'];
let lp = 0;
const loadIv = setInterval(() => {
    lp += Math.random() * 15 + 10;
    if (lp >= 100) {
        lp = 100; clearInterval(loadIv);
        loaderFill.style.width = '100%';
        loaderTxt.textContent = loadSteps[4];
        setTimeout(() => { loader.classList.add('gone'); enterScene(); }, 600);
        return;
    }
    loaderFill.style.width = lp + '%';
    loaderTxt.textContent = loadSteps[Math.min(Math.floor(lp / 25), 3)];
}, 200);

// ─── ENTER SCENE ───
function enterScene() {
    gsap.registerPlugin(ScrollTrigger);

    // Scroll cue
    gsap.to('#scroll-cue', { opacity: 0.6, duration: 1.2, delay: 1.5 });

    // Nav on scroll
    ScrollTrigger.create({ start: 300, onUpdate: s => document.getElementById('nav').classList.toggle('show', s.scroll() > 300) });

    // Hide scroll cue
    ScrollTrigger.create({ trigger: '.s-tag', start: 'top 90%', onEnter: () => gsap.to('#scroll-cue', { opacity: 0, duration: .3 }) });

    // Taglines
    gsap.utils.toArray('.tl').forEach((l, i) => {
        gsap.to(l, { scrollTrigger: { trigger: l, start: 'top 82%' }, opacity: 1, y: 0, duration: 0.9, delay: i * 0.15, ease: 'power3.out' });
    });

    // About desc
    gsap.to('.ab-desc', { scrollTrigger: { trigger: '.ab-desc', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.8 });

    // Stat cards (easeInOutBack from report)
    gsap.utils.toArray('.stat-card').forEach((c, i) => {
        gsap.to(c, {
            scrollTrigger: { trigger: c, start: 'top 85%' },
            opacity: 1, y: 0, rotateY: 0, scale: 1,
            duration: 1.2, delay: i * 0.15,
            ease: 'back.out(1.7)',
            onStart: () => c.classList.add('vis'),
            onComplete: () => { const n = c.querySelector('.ctr'); if (n) animN(n, +n.dataset.t); }
        });
    });

    // Qualify
    gsap.to('.qual-t', { scrollTrigger: { trigger: '.qual-t', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.7 });
    gsap.utils.toArray('.qi').forEach((q, i) => {
        gsap.to(q, { scrollTrigger: { trigger: q, start: 'top 88%' }, opacity: 1, x: 0, duration: 0.5, delay: i * 0.12 });
    });
    gsap.to('.qual-end', { scrollTrigger: { trigger: '.qual-end', start: 'top 90%' }, opacity: 1, y: 0, duration: 0.5 });

    // Nav active
    document.querySelectorAll('.s[id]').forEach(sec => {
        if (!sec.dataset) return;
        ScrollTrigger.create({
            trigger: sec, start: 'top center', end: 'bottom center',
            onEnter: () => setNav(sec.id), onEnterBack: () => setNav(sec.id),
        });
    });
}

function setNav(id) {
    const map = { hero: '0', about: '1', book: '2' };
    document.querySelectorAll('.n-a').forEach(a => a.classList.toggle('active', a.dataset.i === map[id]));
}

function animN(el, target) {
    const dur = 1400, start = performance.now();
    (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
        if (t < 1) requestAnimationFrame(tick);
    })(start);
}

// ─── ANIMATION LOOP ───
const clock = new THREE.Clock();
let baseTime = 0;

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const dt = clock.getDelta();
    baseTime += dt;

    // Smooth mouse (report: lerp factor 0.1)
    mouse.x += (mouse.tx - mouse.x) * 0.1;
    mouse.y += (mouse.ty - mouse.y) * 0.1;

    // Particle uniforms
    pMat.uniforms.uTime.value = t;
    pMat.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Drag smooth
    er.x += (dr.x - er.x) * 0.08;
    er.y += (dr.y - er.y) * 0.08;

    // ─── LOGO (report: 0.15°/frame rotation + mouse parallax ±5° + drag) ───
    const autoRotY = t * 0.15; // report: 0.15°/frame at 60fps ≈ 0.15 rad/s
    logoGroup.rotation.y = autoRotY + mouse.x * (5 * Math.PI / 180) + er.y;
    logoGroup.rotation.x = Math.sin(t * 0.08) * 0.08 + mouse.y * (5 * Math.PI / 180) + er.x;

    // Logo float (report: ±10px oscillation)
    logoGroup.position.y = Math.sin(t * 0.5) * 0.15;

    // Camera dolly forward (report: 0.5% scale/30s)
    const dolly = 1 + baseTime * 0.00017; // very subtle

    // Iridescent color shift (report: blue→cyan→lime→gold cycle)
    const iridT = (t * 0.5) % 4;
    let emColor;
    if (iridT < 1) emColor = new THREE.Color(P.blue).lerp(new THREE.Color(P.cyan), iridT);
    else if (iridT < 2) emColor = new THREE.Color(P.cyan).lerp(new THREE.Color(P.lime), iridT - 1);
    else if (iridT < 3) emColor = new THREE.Color(P.lime).lerp(new THREE.Color(P.gold), iridT - 2);
    else emColor = new THREE.Color(P.gold).lerp(new THREE.Color(P.blue), iridT - 3);
    tubeMat.emissive = emColor;
    tubeMat.emissiveIntensity = 0.12 + Math.sin(t * 1.5) * 0.05;

    // Ring gold pulse
    ringMat.emissiveIntensity = 0.35 + Math.sin(t * 2) * 0.15;

    // ─── JELLYFISH ANIMATION ───
    jellies.forEach(j => {
        const d = j.userData;
        j.position.y = d.baseY + Math.sin(t * d.floatSpeed + d.phase) * d.floatAmp;
        j.position.x += d.driftX;
        j.position.z += d.driftZ;
        j.rotation.y = Math.sin(t * 0.3 + d.phase) * 0.1;
        // Wrap if drifted too far
        if (Math.abs(j.position.x) > 5) d.driftX *= -1;
        if (Math.abs(j.position.z) > 5) d.driftZ *= -1;
    });

    // ─── PARTICLES DRIFT (report: upward bias 20-30px/s) ───
    for (let i = 0; i < PC; i++) {
        pPos[i * 3] += pVel[i * 3];
        pPos[i * 3 + 1] += pVel[i * 3 + 1];
        pPos[i * 3 + 2] += pVel[i * 3 + 2];
        const dist = Math.sqrt(pPos[i * 3] ** 2 + pPos[i * 3 + 1] ** 2 + pPos[i * 3 + 2] ** 2);
        if (dist > 8 || pPos[i * 3 + 1] > 6) {
            const r = 1.5 + Math.random() * 3;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
            pPos[i * 3 + 1] = -3 + Math.random() * -2; // respawn below
            pPos[i * 3 + 2] = r * Math.cos(ph);
        }
    }
    pGeo.attributes.position.needsUpdate = true;

    // ─── ORBITING LIGHT ───
    orbLight.position.set(Math.sin(t * 0.4) * 4, Math.cos(t * 0.3) * 3, Math.cos(t * 0.5) * 4);

    // ─── CAMERA (report: parallax 0.1 strength, ±20px ≈ ±0.4 units) ───
    cam.position.x = mouse.x * 0.4;
    cam.position.y = mouse.y * 0.3;
    cam.position.z = (8 / dolly) + scrollP * 5;
    cam.lookAt(0, 0, 0);

    // ─── SCROLL-LINKED FADE (report: 15%→25% scroll = logo fade) ───
    let logoAlpha = 1;
    if (scrollP > 0.08 && scrollP < 0.2) {
        logoAlpha = 1 - (scrollP - 0.08) / 0.12;
    } else if (scrollP >= 0.2) {
        logoAlpha = 0;
    }
    logoGroup.visible = logoAlpha > 0.01;
    jellyGroup.visible = logoAlpha > 0.01;
    if (logoAlpha > 0) {
        logoGroup.scale.setScalar(0.7 + logoAlpha * 0.3); // 1.0 → 0.7
        logoGroup.position.y += (1 - logoAlpha) * -1.5; // drift up
        tube.material.opacity = 0.9 * logoAlpha;
        textPlane.material.opacity = 0.6 * logoAlpha;
        jellies.forEach(j => {
            j.children.forEach(c => { if (c.material) c.material.opacity *= logoAlpha; });
        });
    }

    // Background color shift (report: #0a0e14 → #1a0a2e purple on scroll)
    const bgR = 10 / 255 + scrollP * (26 - 10) / 255;
    const bgG = 14 / 255 + scrollP * (10 - 14) / 255;
    const bgB = 20 / 255 + scrollP * (46 - 20) / 255;
    R.setClearColor(new THREE.Color(bgR, bgG, bgB), 1);
    scene.fog.color.set(bgR, bgG, bgB);

    // Dynamic bloom (brighter during hero)
    bloom.strength = (mobile ? 0.15 : 0.2) * (1 - scrollP * 0.2);

    comp.render();
}

// ─── RESIZE ───
window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    R.setSize(w, h);
    comp.setSize(w, h);
});

// ─── FALLBACK ───
function fallback() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('gone');
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({ start: 300, onUpdate: s => document.getElementById('nav').classList.toggle('show', s.scroll() > 300) });
        gsap.to('#scroll-cue', { opacity: 0.5, delay: 1 });
        gsap.utils.toArray('.tl').forEach((l, i) => gsap.to(l, { scrollTrigger: { trigger: l, start: 'top 82%' }, opacity: 1, y: 0, duration: 0.8, delay: i * 0.12 }));
        gsap.to('.ab-desc', { scrollTrigger: { trigger: '.ab-desc', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.8 });
    }, 1500);
}

// ─── GO ───
animate();
