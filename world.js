/* ═══════════════════════════════════════════════════
   ACTIVE THEORY CLONE — Phase 1 MVP
   Based on Hermes Blueprint (99% accuracy)
   
   Structure:
   0-20%  : Hero (Hourglass logo + particles + jellyfish)
   20-40% : Transition
   40-70% : Projects (sidebar + cards)
   70-85% : The Lab
   85-100%: Return
   ═══════════════════════════════════════════════════ */

(function() {
'use strict';

if (typeof THREE === 'undefined') {
    console.error('THREE not loaded');
    document.getElementById('ov-scroll').classList.add('show');
    return;
}

const mob = window.innerWidth < 768;
const W = window.innerWidth, H = window.innerHeight;

// ─── RENDERER ───
const canvas = document.getElementById('c');
let renderer;
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob, alpha: false });
} catch(e) {
    console.error('WebGL failed:', e);
    document.getElementById('ov-scroll').classList.add('show');
    return;
}
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x000000);

// ─── SCENE ───
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.012);

// ─── CAMERA ───
const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 500);
camera.position.set(0, 0, 8);

// ─── LIGHTS ───
const amb = new THREE.AmbientLight(0x111122, 2);
scene.add(amb);
const key = new THREE.PointLight(0xd4af37, 3, 30);
key.position.set(3, 5, 8);
scene.add(key);
const fill = new THREE.PointLight(0x4a7bff, 1.5, 20);
fill.position.set(-4, -2, 5);
scene.add(fill);
const back = new THREE.PointLight(0x8a6aae, 1, 15);
back.position.set(0, -6, 3);
scene.add(back);
const movL = new THREE.PointLight(0xd4af37, 1.5, 15);
scene.add(movL);

// ─── GOLD SPINE (vertical line through everything) ───
// Blueprint: 1-2px gold line, entire page height
const spineGroup = new THREE.Group();
scene.add(spineGroup);

// Main spine line
const spineGeo = new THREE.CylinderGeometry(0.008, 0.008, 80, 6);
const spineMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.4 });
const spineMesh = new THREE.Mesh(spineGeo, spineMat);
spineGroup.add(spineMesh);

// 3 triple lines at top (blueprint: "3 خطوط رفيعة")
for (let i = -1; i <= 1; i++) {
    const g = new THREE.CylinderGeometry(0.003, 0.003, 5, 4);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.25 }));
    m.position.set(i * 0.04, 38, 0);
    spineGroup.add(m);
}

// ─── HOURGLASS LOGO (Blueprint exact) ───
// Two ovals connected by neck with 3 inner rings
const logoGroup = new THREE.Group();
scene.add(logoGroup);

const copperMat = new THREE.MeshStandardMaterial({
    color: 0xc87d5f,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x442211,
    emissiveIntensity: 0.4,
});

// TOP OVAL — radiusX:1.2, radiusY:0.9 (blueprint scaled)
const topOvalCurve = new THREE.EllipseCurve(0, 0, 1.1, 0.75, 0, Math.PI*2, false, 0);
const topOvalPts = topOvalCurve.getPoints(80);
const topOvalGeo = new THREE.BufferGeometry().setFromPoints(topOvalPts.map(p => new THREE.Vector3(p.x, p.y, 0)));
const topOvalLine = new THREE.Line(topOvalGeo, new THREE.LineBasicMaterial({ color: 0xc87d5f }));
topOvalLine.position.y = 1.8;
logoGroup.add(topOvalLine);

// BOTTOM OVAL — same size
const botOvalGeo = new THREE.BufferGeometry().setFromPoints(topOvalPts.map(p => new THREE.Vector3(p.x, p.y, 0)));
const botOvalLine = new THREE.Line(botOvalGeo, new THREE.LineBasicMaterial({ color: 0xc87d5f }));
botOvalLine.position.y = -1.8;
logoGroup.add(botOvalLine);

// NECK — two lines connecting ovals
const neckL = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.72, 1.1, 0), new THREE.Vector3(-0.55, -1.1, 0)]);
const neckR = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.72, 1.1, 0), new THREE.Vector3(0.55, -1.1, 0)]);
logoGroup.add(new THREE.Line(neckL, new THREE.LineBasicMaterial({ color: 0xc87d5f })));
logoGroup.add(new THREE.Line(neckR, new THREE.LineBasicMaterial({ color: 0xc87d5f })));

// 3 INNER RINGS (horizontal ovals inside the neck area)
[-0.55, 0, 0.55].forEach(y => {
    const w = 0.5 + (1 - Math.abs(y)*0.6) * 0.25;
    const ringCurve = new THREE.EllipseCurve(0, 0, w, 0.12, 0, Math.PI*2, false, 0);
    const ringPts = ringCurve.getPoints(40);
    const rGeo = new THREE.BufferGeometry().setFromPoints(ringPts.map(p => new THREE.Vector3(p.x, p.y, 0)));
    const ring = new THREE.Line(rGeo, new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.6 }));
    ring.position.y = y;
    logoGroup.add(ring);
});

// GOLD ARC (bottom right — blueprint: arc at bottom right)
const arcCurve = new THREE.EllipseCurve(0, 0, 0.28, 0.28, -Math.PI*0.1, Math.PI*1.4, false, 0);
const arcPts = arcCurve.getPoints(40);
const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts.map(p => new THREE.Vector3(p.x, p.y, 0)));
const arc = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0xffde7b }));
arc.position.set(1.1, -2.1, 0);
logoGroup.add(arc);

// Bright dot on arc
const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xffde7b }));
dot.position.set(1.1, -2.05, 0);
logoGroup.add(dot);

// ─── JELLYFISH (above logo, blueprint: 280px above) ───
const jellyGroup = new THREE.Group();
jellyGroup.position.set(-0.4, 3.8, 0);
scene.add(jellyGroup);

// Dome
const domeGeo = new THREE.SphereGeometry(0.4, 20, 10, 0, Math.PI*2, 0, Math.PI/2);
const domeMat = new THREE.MeshStandardMaterial({
    color: 0x4a7bff, metalness: 0, roughness: 0.3,
    transparent: true, opacity: 0.5, side: THREE.DoubleSide,
    emissive: 0x4a7bff, emissiveIntensity: 0.2
});
jellyGroup.add(new THREE.Mesh(domeGeo, domeMat));

// Tentacles (6)
for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const pts = [];
    for (let j = 0; j < 8; j++) {
        const t = j / 7;
        pts.push(new THREE.Vector3(
            Math.cos(a) * 0.18 + Math.sin(t*4+i) * 0.06,
            -t * 0.8,
            Math.sin(a) * 0.18
        ));
    }
    const tGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const tMat = new THREE.LineBasicMaterial({ color: 0x8a6aae, transparent: true, opacity: 0.3 });
    jellyGroup.add(new THREE.Line(tGeo, tMat));
}

// Jellyfish connection lines to logo top
const jLine1Geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.4, 3.8, 0), new THREE.Vector3(-0.5, 2.5, 0)]);
const jLine2Geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.4, 3.8, 0), new THREE.Vector3(0.5, 2.5, 0)]);
const jLineMat = new THREE.LineBasicMaterial({ color: 0xc87d5f, transparent: true, opacity: 0.25 });
scene.add(new THREE.Line(jLine1Geo, jLineMat));
scene.add(new THREE.Line(jLine2Geo, jLineMat));

// ─── PARTICLES (250, exact blueprint colors) ───
const PCOUNT = mob ? 120 : 280; // زيادة العدد ليكون أوضح
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PCOUNT * 3);
const pCol = new Float32Array(PCOUNT * 3);
const pSiz = new Float32Array(PCOUNT);
const pVel = new Float32Array(PCOUNT * 3);

// Exact blueprint color distribution
const pColors = [
    [1.0, 1.0, 1.0],       // #ffffff  60
    [0.91, 0.91, 0.88],    // #e8e8e0  50
    [0.1, 0.92, 0.87],     // #1aeade  35
    [0.47, 0.67, 1.0],     // #79aeff  35
    [1.0, 0.87, 0.48],     // #ffde7b  25
    [0.27, 0.96, 0.25],    // #46f441  20
    [0.16, 0.79, 0.07],    // #28c913  12
    [0.99, 0.71, 0.38],    // #fdb460  13
];
const pDist = [60, 50, 35, 35, 25, 20, 12, 13];
const pTotal = pDist.reduce((a,b)=>a+b, 0);

let pi = 0;
pDist.forEach((cnt, ci) => {
    const n = Math.round(PCOUNT * cnt / pTotal);
    for (let i = 0; i < n && pi < PCOUNT; i++, pi++) {
        pPos[pi*3] = (Math.random()-0.5)*14;
        pPos[pi*3+1] = (Math.random()-0.5)*12;
        pPos[pi*3+2] = (Math.random()-0.5)*8;
        pVel[pi*3] = (Math.random()-0.5)*0.008;
        pVel[pi*3+1] = -(Math.random()*0.015 + 0.003);
        pVel[pi*3+2] = (Math.random()-0.5)*0.005;
        const c = pColors[ci];
        pCol[pi*3] = c[0]; pCol[pi*3+1] = c[1]; pCol[pi*3+2] = c[2];
        // Size: 50%=small, 30%=med, 20%=large (أحجام أكبر)
        const sr = Math.random();
        pSiz[pi] = sr < 0.5 ? (Math.random()*0.8+0.8) : sr < 0.8 ? (Math.random()*1.0+1.5) : (Math.random()*1.5+2.5);
    }
});

pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSiz, 1));

const pMat = new THREE.ShaderMaterial({
    uniforms: { uTime: {value:0}, uPR: {value:renderer.getPixelRatio()} },
    vertexShader: `
        attribute float aSize;
        uniform float uTime, uPR;
        varying vec3 vColor;
        varying float vAlpha;
        attribute vec3 color;
        void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPR * (60.0 / -mv.z);
            vAlpha = 0.85 * (1.0 - smoothstep(2.0, 7.0, length(position))); // شفافية أعلى
        }`,
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if(d > 0.5) discard;
            
            // soft glow effect
            float soft = 1.0 - smoothstep(0.0, 0.5, d);
            float glow = 1.0 - smoothstep(0.2, 0.5, d); // هالة توهج
            
            vec3 finalColor = vColor + vColor * glow * 0.5; // إضافة توهج
            gl_FragColor = vec4(finalColor, vAlpha * soft);
        }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ─── SERVICE CARDS ───
const cardData = [
    { name: 'GOOGLE\nRACER', col: 0x6d5443, border: 0xfdb460, x: -2.5, y: -8, ry: -0.25 },
    { name: 'HARRY POTTER\nHOGWARTS', col: 0x2a1a4a, border: 0x8a6aae, x: 2.5, y: -10, ry: 0.2 },
    { name: 'ADIDAS\nCHILE 22', col: 0x1a3a2e, border: 0x10b981, x: -2.2, y: -13, ry: 0.15 },
    { name: 'XBOX\n20 YEARS', col: 0x0e3a0e, border: 0x46f441, x: 2.3, y: -15.5, ry: -0.2 },
    { name: 'SECRET\nSKY', col: 0x1a2a3a, border: 0x1aeade, x: -2.4, y: -18, ry: 0.18 },
];

const cards3D = cardData.map(cd => {
    const g = new THREE.Group();
    // Card face
    const planeGeo = new THREE.PlaneGeometry(2.8, 2.0);
    const planeMat = new THREE.MeshStandardMaterial({
        color: cd.col, transparent: true, opacity: 0.88,
        metalness: 0.1, roughness: 0.8, side: THREE.DoubleSide
    });
    g.add(new THREE.Mesh(planeGeo, planeMat));
    // Border glow
    const edgeGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.8, 2.0));
    g.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: cd.border, transparent: true, opacity: 0.5 })));
    // Title
    const tc = document.createElement('canvas'); tc.width=512; tc.height=368;
    const tx = tc.getContext('2d');
    tx.fillStyle='rgba(0,0,0,0)'; tx.fillRect(0,0,512,368);
    tx.fillStyle='#ffffff'; tx.font='bold 44px Courier New,monospace';
    tx.textAlign='center';
    cd.name.split('\n').forEach((ln,i) => tx.fillText(ln, 256, 160+i*52));
    const tTex = new THREE.CanvasTexture(tc);
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(2.8,2.0), new THREE.MeshBasicMaterial({map:tTex,transparent:true,side:THREE.DoubleSide,depthWrite:false})));
    // Card particles (30 per card)
    const cpGeo = new THREE.BufferGeometry();
    const cpP = new Float32Array(30*3);
    for(let i=0;i<30;i++){
        const a=Math.random()*Math.PI*2, r=1.5+Math.random()*1;
        cpP[i*3]=Math.cos(a)*r; cpP[i*3+1]=(Math.random()-0.5)*2; cpP[i*3+2]=Math.sin(a)*r;
    }
    cpGeo.setAttribute('position', new THREE.BufferAttribute(cpP, 3));
    g.add(new THREE.Points(cpGeo, new THREE.PointsMaterial({color:cd.border,size:0.05,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending})));
    g.position.set(cd.x, cd.y, 0);
    g.rotation.y = cd.ry;
    g.visible = false;
    scene.add(g);
    return g;
});

// ─── THE LAB ───
const labGroup = new THREE.Group();
labGroup.position.y = -28;
labGroup.visible = false;
scene.add(labGroup);
// Wreath (iridescent torus)
const wreathGeo = new THREE.TorusGeometry(1.8, 0.08, 16, 80);
const wreathMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x4a2c8a, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.2 });
labGroup.add(new THREE.Mesh(wreathGeo, wreathMat));
// Hex grid suggestion (rings)
[2.2, 2.6, 3.0].forEach((r, i) => {
    const g = new THREE.TorusGeometry(r, 0.01, 8, 60);
    const c = [0x46f441, 0x1aeade, 0xa855f7][i];
    labGroup.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.2})));
});
// Crosshair
const chGeo = new THREE.TorusGeometry(0.6, 0.01, 8, 50);
labGroup.add(new THREE.Mesh(chGeo, new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5})));
const vLine = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-0.6,0),new THREE.Vector3(0,0.6,0)]);
const hLine = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.6,0,0),new THREE.Vector3(0.6,0,0)]);
labGroup.add(new THREE.Line(vLine, new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.5})));
labGroup.add(new THREE.Line(hLine, new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.5})));

// ─── MOUSE ───
const mouse = { x:0, y:0, tx:0, ty:0 };
document.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX/W)*2-1;
    mouse.ty = -(e.clientY/H)*2+1;
});
document.addEventListener('touchmove', e => {
    mouse.tx = (e.touches[0].clientX/W)*2-1;
    mouse.ty = -(e.touches[0].clientY/H)*2+1;
}, {passive:true});

// ─── SCROLL ───
let scrollP = 0;
window.addEventListener('scroll', () => {
    const max = document.getElementById('scroll-space').scrollHeight - window.innerHeight;
    scrollP = max > 0 ? Math.min(1, window.scrollY / max) : 0;
});

// ─── SHOW OVERLAYS ───
function updateOverlays(sp) {
    // SCROLL DOWN hint
    document.getElementById('ov-scroll').classList.toggle('show', sp < 0.05);
    // Sidebar (20-70%)
    document.getElementById('ov-nav-sidebar').classList.toggle('show', sp > 0.2 && sp < 0.7);
    // Lab (70-85%)
    document.getElementById('ov-lab').classList.toggle('show', sp > 0.7 && sp < 0.88);
    // Cards visible
    cards3D.forEach((c, i) => {
        const threshold = 0.25 + i * 0.08;
        c.visible = sp > threshold && sp < 0.75;
    });
    // Lab group
    labGroup.visible = sp > 0.65 && sp < 0.92;
}

// ─── MAIN LOOP ───
const clock = new THREE.Clock();
let t = 0;

function animate() {
    requestAnimationFrame(animate);
    t = clock.getElapsedTime();
    const dt = clock.getDelta();

    mouse.x += (mouse.tx - mouse.x) * 0.1;
    mouse.y += (mouse.ty - mouse.y) * 0.1;
    pMat.uniforms.uTime.value = t;

    // ─── LOGO float + rotate ───
    logoGroup.position.y = Math.sin(t * 0.5) * 0.12;
    logoGroup.rotation.y = t * 0.08 + mouse.x * 0.12;
    logoGroup.rotation.x = mouse.y * 0.08;
    // Parallax
    logoGroup.position.x = mouse.x * 0.15;

    // Jellyfish float
    jellyGroup.position.y = 3.8 + Math.sin(t * 0.6) * 0.15;
    jellyGroup.rotation.y = Math.sin(t * 0.2) * 0.1;

    // ─── SCROLL FADE ───
    const logoAlpha = scrollP < 0.1 ? 1 : scrollP < 0.2 ? 1-(scrollP-0.1)/0.1 : 0;
    logoGroup.visible = logoAlpha > 0.01;
    jellyGroup.visible = logoAlpha > 0.01;
    if (logoAlpha > 0) {
        logoGroup.scale.setScalar(1 - (1-logoAlpha)*0.3);
        logoGroup.position.y += (1-logoAlpha) * -2;
    }
    // Spine fades slightly
    spineMat.opacity = 0.4 - scrollP * 0.1;

    // ─── PARTICLES DRIFT ───
    for (let i = 0; i < PCOUNT; i++) {
        pPos[i*3] += pVel[i*3];
        pPos[i*3+1] += pVel[i*3+1];
        pPos[i*3+2] += pVel[i*3+2];
        if (pPos[i*3+1] < -7) {
            pPos[i*3+1] = 7;
            pPos[i*3] = (Math.random()-0.5)*14;
        }
    }
    pGeo.attributes.position.needsUpdate = true;

    // ─── CARDS subtle float ───
    cards3D.forEach((c, i) => {
        if (c.visible) c.position.y = cardData[i].y + Math.sin(t * 0.4 + i) * 0.08;
    });

    // ─── LAB rotation ───
    if (labGroup.visible) {
        labGroup.rotation.y = t * 0.15;
    }

    // ─── MOVING LIGHT follows mouse ───
    movL.position.set(mouse.x * 4, mouse.y * 3 + 2, 6);

    // ─── CAMERA JOURNEY ───
    const sp = scrollP;
    let cy = 0, cz = 8;
    if (sp < 0.2) {
        cy = 0; cz = 8 - sp * 5;
    } else if (sp < 0.4) {
        const p = (sp-0.2)/0.2;
        cy = -p * 8; cz = 7 + p * 2;
    } else if (sp < 0.7) {
        const p = (sp-0.4)/0.3;
        cy = -8 - p * 18; cz = 9;
    } else if (sp < 0.85) {
        const p = (sp-0.7)/0.15;
        cy = -26 - p * 4; cz = 9;
    } else {
        cy = -30; cz = 9;
    }
    camera.position.x = mouse.x * 0.25;
    camera.position.y = cy + mouse.y * 0.15;
    camera.position.z = cz;
    camera.lookAt(0, cy - 0.5, 0);

    // Background: slowly shifts from pure black to very slight purple on scroll
    const bgB = scrollP * 0.04;
    renderer.setClearColor(new THREE.Color(0, 0, bgB));
    scene.fog.color.set(0, 0, bgB);

    updateOverlays(sp);
    renderer.render(scene, camera);
}

// ─── RESIZE ───
window.addEventListener('resize', () => {
    const nw = window.innerWidth, nh = window.innerHeight;
    camera.aspect = nw/nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
});

// ─── START ───
document.getElementById('ov-scroll').classList.add('show');
animate();
console.log('M7 World loaded. THREE:', THREE.REVISION);

})();
