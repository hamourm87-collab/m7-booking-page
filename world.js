/* ═══════════════════════════════════════════════════════
   M7 WORLD — Full 3D Experience
   
   The entire page is a WebGL scene.
   Scroll = camera movement through 3D world.
   
   Structure (camera journey):
   0-15%   : Hero — Logo infinity fills screen, bokeh particles
   15-30%  : Transition — Logo fades, text appears
   30-60%  : Spine — Glass vertebral column with floating cards
   60-80%  : The Lab — Industrial cage with particle ring
   80-100% : Contact — Fade to dark, minimal
   ═══════════════════════════════════════════════════════ */

import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';
import { EffectComposer } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const mob = window.innerWidth < 768;
const W = window.innerWidth, H = window.innerHeight;

// ═══ RENDERER ═══
const canvas = document.getElementById('c');
let R;
try { R = new THREE.WebGLRenderer({ canvas, antialias: !mob, alpha: false }); }
catch(e) { document.getElementById('ov-hero').classList.add('vis'); return; }
R.setSize(W, H);
R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
R.toneMapping = THREE.ACESFilmicToneMapping;
R.toneMappingExposure = 0.7;
R.setClearColor(0x000000);

// ═══ SCENE ═══
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020408, 0.015);

// ═══ CAMERA ═══
const cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
cam.position.set(0, 0, 5);

// ═══ POST-PROCESSING ═══
const comp = new EffectComposer(R);
comp.addPass(new RenderPass(scene, cam));
comp.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), mob ? 0.15 : 0.25, 0.5, 1.2));

// ═══ LIGHTS (underwater, moody) ═══
scene.add(new THREE.AmbientLight(0x050810, 1.5));
const L1 = new THREE.PointLight(0xd4af37, 2, 25); L1.position.set(2, 2, 5); scene.add(L1);
const L2 = new THREE.PointLight(0x4a7bff, 1, 15); L2.position.set(-3, -1, 3); scene.add(L2);
const L3 = new THREE.PointLight(0x8a6aae, 0.6, 12); L3.position.set(0, -5, 2); scene.add(L3);

// ═══ M7 INFINITY LOGO ═══
// Thin glass wire — infinity shape (∞ vertical) with circle at bottom
const logoG = new THREE.Group();
logoG.position.set(0, 0, 0);
scene.add(logoG);

// Infinity curve (figure-8 vertical) — THIN wire, glass material
const infCurve = new THREE.Curve();
infCurve.getPoint = function(t) {
    const a = t * Math.PI * 2;
    return new THREE.Vector3(
        Math.sin(a) * 0.7,
        Math.sin(a * 2) * 1.4,
        Math.cos(a) * 0.25
    );
};

const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x888899,
    metalness: 0.1,
    roughness: 0.05,
    emissive: 0x4a7bff,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.85,
    envMapIntensity: 1.5,
});

// Thin tube (radius 0.015 = very thin wire)
const tubeGeo = new THREE.TubeGeometry(infCurve, 200, 0.018, 12, true);
logoG.add(new THREE.Mesh(tubeGeo, glassMat));

// Circle at bottom with "M7" — small ring
const ringGeo = new THREE.TorusGeometry(0.22, 0.012, 16, 60);
const ringMat = glassMat.clone();
ringMat.iridescence = 1.0;
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.position.y = -1.4;
logoG.add(ring);

// Inner pentagon/icon shape inside ring
const iconGeo = new THREE.TorusGeometry(0.12, 0.008, 6, 5); // pentagonal
const icon = new THREE.Mesh(iconGeo, ringMat);
icon.position.y = -1.4;
logoG.add(icon);

// Small iridescent accent on ring
const accentGeo = new THREE.SphereGeometry(0.025, 8, 8);
const accentMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0.5, roughness: 0,
    iridescence: 1.0, iridescenceIOR: 2.0,
    emissive: 0xd4af37, emissiveIntensity: 0.5,
});
const accent = new THREE.Mesh(accentGeo, accentMat);
accent.position.set(0.22, -1.4, 0);
logoG.add(accent);

// ═══ BOKEH PARTICLES (golden/warm, large, soft) ═══
const BK_COUNT = mob ? 150 : 500;
const bkGeo = new THREE.BufferGeometry();
const bkP = new Float32Array(BK_COUNT * 3);
const bkS = new Float32Array(BK_COUNT);
const bkC = new Float32Array(BK_COUNT * 3);

for (let i = 0; i < BK_COUNT; i++) {
    // Spread around the logo area
    bkP[i*3] = (Math.random() - 0.5) * 8;
    bkP[i*3+1] = (Math.random() - 0.5) * 8;
    bkP[i*3+2] = (Math.random() - 0.5) * 6 - 1;
    bkS[i] = Math.random() * 4 + 1; // LARGE bokeh
    // Warm colors: gold, orange, green-yellow
    const r = Math.random();
    if (r < 0.4) { bkC[i*3]=0.93; bkC[i*3+1]=0.78; bkC[i*3+2]=0.25; } // gold
    else if (r < 0.65) { bkC[i*3]=0.82; bkC[i*3+1]=0.72; bkC[i*3+2]=0.18; } // dark gold
    else if (r < 0.8) { bkC[i*3]=0.55; bkC[i*3+1]=0.68; bkC[i*3+2]=0.22; } // green-gold
    else { bkC[i*3]=0.85; bkC[i*3+1]=0.55; bkC[i*3+2]=0.2; } // orange
}
bkGeo.setAttribute('position', new THREE.BufferAttribute(bkP, 3));
bkGeo.setAttribute('aSize', new THREE.BufferAttribute(bkS, 1));
bkGeo.setAttribute('aColor', new THREE.BufferAttribute(bkC, 3));

const bkMat = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0}, uPR:{value:R.getPixelRatio()} },
    vertexShader: `
        attribute float aSize; attribute vec3 aColor;
        uniform float uTime, uPR;
        varying float vA; varying vec3 vC;
        void main(){
            vec3 p = position;
            p.x += sin(uTime*0.15 + position.y*0.8)*0.15;
            p.y += cos(uTime*0.12 + position.x*0.6)*0.1;
            vec4 mv = modelViewMatrix * vec4(p,1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPR * (80.0 / -mv.z);
            vA = 0.4 * (1.0 - smoothstep(1.0, 6.0, length(p)));
            vC = aColor;
        }`,
    fragmentShader: `
        varying float vA; varying vec3 vC;
        void main(){
            float d = length(gl_PointCoord - vec2(0.5));
            if(d > 0.5) discard;
            // Soft bokeh: bright center, soft edge
            float glow = exp(-d * d * 8.0);
            gl_FragColor = vec4(vC, vA * glow);
        }`,
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
});
scene.add(new THREE.Points(bkGeo, bkMat));

// ═══ MARINE SNOW (tiny white dots drifting) ═══
const MS_COUNT = mob ? 200 : 800;
const msGeo = new THREE.BufferGeometry();
const msP = new Float32Array(MS_COUNT * 3);
for (let i = 0; i < MS_COUNT; i++) {
    msP[i*3] = (Math.random()-0.5) * 20;
    msP[i*3+1] = (Math.random()-0.5) * 60 - 10; // spread along entire scroll journey
    msP[i*3+2] = (Math.random()-0.5) * 10;
}
msGeo.setAttribute('position', new THREE.BufferAttribute(msP, 3));
const msMat = new THREE.PointsMaterial({
    size: 0.02, color: 0xe8e8e0, transparent:true, opacity:0.25,
    blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true
});
scene.add(new THREE.Points(msGeo, msMat));

// ═══ SPINE (glass vertebrae, positioned at Y=-10 to Y=-25) ═══
const spineG = new THREE.Group();
spineG.position.set(0, -12, 0);
scene.add(spineG);

const VERTS = 20;
const spineMat = new THREE.MeshPhysicalMaterial({
    color: 0x667788, metalness: 0.1, roughness: 0.05,
    transmission: 0.7, thickness: 1, ior: 1.8,
    iridescence: 0.6, iridescenceIOR: 1.4,
    clearcoat: 1, transparent: true, opacity: 0.5,
});

for (let i = 0; i < VERTS; i++) {
    const t = i / (VERTS - 1);
    const y = t * 12;
    const w = 0.1 + Math.sin(t * Math.PI) * 0.12;
    
    // Vertebra
    const vGeo = new THREE.BoxGeometry(w * 2, 0.08, w * 1.5);
    const v = new THREE.Mesh(vGeo, spineMat);
    v.position.y = y;
    v.rotation.y = t * 0.5; // twist
    spineG.add(v);
    
    // Disc
    if (i < VERTS - 1) {
        const dGeo = new THREE.CylinderGeometry(w * 0.4, w * 0.4, 0.03, 8);
        const d = new THREE.Mesh(dGeo, spineMat);
        d.position.y = y + 0.3;
        spineG.add(d);
    }
}

// Spinal cord
const cordGeo = new THREE.CylinderGeometry(0.01, 0.01, 12.5, 8);
spineG.add(new THREE.Mesh(cordGeo, spineMat));

// ═══ SERVICE CARDS (3D planes floating near spine) ═══
const cardData = [
    { title: 'BUSINESS\nDEVELOPMENT', color: 0xd4af37, y: -13, x: -1.5, rY: 0.3 },
    { title: 'TRADING\nSYSTEMS', color: 0x4a9eff, y: -16, x: 1.5, rY: -0.25 },
    { title: 'CONTENT\nCREATION', color: 0xec4899, y: -19, x: -1.3, rY: 0.2 },
    { title: 'RESEARCH\nANALYSIS', color: 0xa855f7, y: -22, x: 1.4, rY: -0.3 },
    { title: 'AFFILIATE\nMARKETING', color: 0x10b981, y: -25, x: -1.2, rY: 0.25 },
];

const cards = cardData.map(cd => {
    const g = new THREE.Group();
    
    // Card plane (frosted glass)
    const cardGeo = new THREE.PlaneGeometry(2, 2.8, 1, 1);
    const cardMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0e14, metalness: 0, roughness: 0.3,
        transmission: 0.15, transparent: true, opacity: 0.85,
        side: THREE.DoubleSide, clearcoat: 0.5,
    });
    const plane = new THREE.Mesh(cardGeo, cardMat);
    g.add(plane);
    
    // Card border glow
    const borderGeo = new THREE.EdgesGeometry(cardGeo);
    const borderMat = new THREE.LineBasicMaterial({ color: cd.color, transparent: true, opacity: 0.3 });
    g.add(new THREE.LineSegments(borderGeo, borderMat));
    
    // Title text
    const tc = document.createElement('canvas'); tc.width = 256; tc.height = 360;
    const tx = tc.getContext('2d');
    tx.fillStyle = 'rgba(10,14,20,0.01)'; tx.fillRect(0,0,256,360);
    tx.fillStyle = '#ffffff'; tx.font = '600 22px JetBrains Mono, monospace';
    tx.textAlign = 'center';
    const lines = cd.title.split('\n');
    lines.forEach((l, i) => tx.fillText(l, 128, 140 + i * 28));
    tx.fillStyle = new THREE.Color(cd.color).getStyle();
    tx.font = '300 11px JetBrains Mono'; tx.fillText('M7 AGENT', 128, 220);
    
    const tTex = new THREE.CanvasTexture(tc);
    const tMat = new THREE.MeshBasicMaterial({ map: tTex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    const tPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.8), tMat);
    tPlane.position.z = 0.01;
    g.add(tPlane);
    
    // Card particles (few, orbital)
    for (let i = 0; i < 15; i++) {
        const pGeo = new THREE.SphereGeometry(0.015 + Math.random() * 0.02, 4, 4);
        const pMat = new THREE.MeshBasicMaterial({ color: cd.color, transparent: true, opacity: 0.4 });
        const p = new THREE.Mesh(pGeo, pMat);
        const a = Math.random() * Math.PI * 2;
        const r = 1.2 + Math.random() * 0.8;
        p.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 2, Math.sin(a) * r);
        p.userData = { angle: a, radius: r, speed: 0.2 + Math.random() * 0.3, yOff: p.position.y };
        g.add(p);
    }
    
    g.position.set(cd.x, cd.y, 0);
    g.rotation.y = cd.rY;
    scene.add(g);
    return g;
});

// ═══ SCROLL STATE ═══
let scrollP = 0;
const scrollEl = document.getElementById('scroll-space');

window.addEventListener('scroll', () => {
    const max = scrollEl.scrollHeight - window.innerHeight;
    scrollP = Math.max(0, Math.min(1, window.scrollY / max));
});

// ═══ MOUSE ═══
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
document.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / W) * 2 - 1;
    mouse.ty = -(e.clientY / H) * 2 + 1;
});

// ═══ OVERLAY VISIBILITY ═══
function updateOverlays(sp) {
    const hero = document.getElementById('ov-hero');
    const about = document.getElementById('ov-about');
    const srv = document.getElementById('ov-srv');
    const contact = document.getElementById('ov-contact');
    
    hero.classList.toggle('vis', sp < 0.12);
    about.classList.toggle('vis', sp > 0.15 && sp < 0.30);
    srv.classList.toggle('vis', sp > 0.30 && sp < 0.70);
    contact.classList.toggle('vis', sp > 0.80);
}

// ═══ ANIMATION LOOP ═══
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    
    // Smooth mouse
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    
    // Shader time
    bkMat.uniforms.uTime.value = t;
    
    // ═══ CAMERA JOURNEY (scroll-linked) ═══
    // 0-0.15: Looking at logo from front
    // 0.15-0.30: Pull back and down
    // 0.30-0.70: Traveling down the spine
    // 0.70-0.85: Enter the lab area
    // 0.85-1.0: Settle into contact
    
    const sp = scrollP;
    
    let camX = mouse.x * 0.3;
    let camY = 0;
    let camZ = 5;
    let lookY = 0;
    
    if (sp < 0.15) {
        // Hero: close to logo
        camZ = 5 - sp * 5; // 5 → 4.25
        camY = 0;
        lookY = 0;
    } else if (sp < 0.30) {
        // Transition: pull back, start going down
        const t2 = (sp - 0.15) / 0.15;
        camZ = 4.25 + t2 * 2; // pull back
        camY = -t2 * 8; // start descending
        lookY = camY - 2;
    } else if (sp < 0.70) {
        // Spine journey: travel down
        const t2 = (sp - 0.30) / 0.40;
        camZ = 6.25;
        camY = -8 - t2 * 20; // -8 → -28
        lookY = camY - 1;
    } else if (sp < 0.85) {
        // Lab area
        const t2 = (sp - 0.70) / 0.15;
        camZ = 6.25 - t2 * 1;
        camY = -28 - t2 * 5;
        lookY = camY - 1;
    } else {
        // Contact
        const t2 = (sp - 0.85) / 0.15;
        camZ = 5.25;
        camY = -33 - t2 * 3;
        lookY = camY;
    }
    
    cam.position.set(camX, camY + mouse.y * 0.2, camZ);
    cam.lookAt(0, lookY, 0);
    
    // ═══ LOGO ANIMATION ═══
    // Rotate slowly + mouse parallax
    logoG.rotation.y = t * 0.08 + mouse.x * 0.15;
    logoG.rotation.x = Math.sin(t * 0.05) * 0.05 + mouse.y * 0.08;
    
    // Iridescent color shift on accent
    const hue = (t * 0.1) % 1;
    accent.material.emissive.setHSL(hue, 0.7, 0.3);
    
    // Fade logo based on scroll
    const logoAlpha = sp < 0.1 ? 1 : sp < 0.2 ? 1 - (sp - 0.1) / 0.1 : 0;
    logoG.visible = logoAlpha > 0.01;
    if (logoG.visible) {
        logoG.scale.setScalar(1 - (1 - logoAlpha) * 0.3);
        glassMat.opacity = 0.7 * logoAlpha;
    }
    
    // ═══ BOKEH PARTICLES — gentle drift ═══
    const bp = bkGeo.attributes.position.array;
    for (let i = 0; i < BK_COUNT; i++) {
        bp[i*3+1] += 0.003; // slow upward
        bp[i*3] += Math.sin(t * 0.1 + i) * 0.0005;
        if (bp[i*3+1] > 5) bp[i*3+1] = -5;
    }
    bkGeo.attributes.position.needsUpdate = true;
    
    // ═══ CARD PARTICLES — orbit ═══
    cards.forEach(g => {
        g.children.forEach(child => {
            if (child.userData && child.userData.angle !== undefined) {
                child.userData.angle += child.userData.speed * 0.01;
                child.position.x = Math.cos(child.userData.angle) * child.userData.radius;
                child.position.z = Math.sin(child.userData.angle) * child.userData.radius;
                child.position.y = child.userData.yOff + Math.sin(t * child.userData.speed + child.userData.angle) * 0.2;
            }
        });
    });
    
    // ═══ ORBITING LIGHT ═══
    L1.position.x = Math.sin(t * 0.3) * 3;
    L1.position.y = camY + 2 + Math.cos(t * 0.2) * 2;
    L1.position.z = 4 + Math.cos(t * 0.4) * 2;
    
    // ═══ OVERLAYS ═══
    updateOverlays(sp);
    
    // ═══ RENDER ═══
    comp.render();
}

// ═══ RESIZE ═══
window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    R.setSize(w, h);
    comp.setSize(w, h);
});

// ═══ START ═══
// Show hero immediately
document.getElementById('ov-hero').classList.add('vis');
animate();
