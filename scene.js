/* ═══════════════════════════════════════════════════════
   M7 HAMOUK OS — BIOMECHANICAL DEEP-SEA AESTHETIC
   Based on Hermes 1800-frame analysis
   
   Teardrop logo with nested ovals, iridescent copper
   Bone/wishbone supports, bioluminescent jellyfish
   Marine snow particles, underwater depth fog
   Climax particle burst at 80% scroll
   ═══════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const mob = window.innerWidth < 768;
const canvas = document.getElementById('c');
let R;
try { R = new THREE.WebGLRenderer({ canvas, antialias: !mob, alpha: false, powerPreference: 'high-performance' }); }
catch(e) { noGL(); throw e; }
R.setSize(window.innerWidth, window.innerHeight);
R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
R.toneMapping = THREE.ACESFilmicToneMapping;
R.toneMappingExposure = 0.7;
R.setClearColor(0x000000, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050810, 0.06);
const cam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
cam.position.set(0, 0, 6);

const comp = new EffectComposer(R);
comp.addPass(new RenderPass(scene, cam));
comp.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), mob ? 0.2 : 0.35, 0.3, 1.2));

// ─── LIGHTS (deep-sea: dim, directional, moody) ───
scene.add(new THREE.AmbientLight(0x050810, 1.2));
const kl = new THREE.PointLight(0xc87d5f, 1.5, 15); kl.position.set(2, 3, 5); scene.add(kl); // copper key
const fl = new THREE.PointLight(0x4a7bff, 0.6, 12); fl.position.set(-3, -1, 4); scene.add(fl); // bio-blue fill
const rl = new THREE.PointLight(0x8a6aae, 0.4, 10); rl.position.set(0, -3, 2); scene.add(rl); // purple under
const ol = new THREE.PointLight(0xd4af37, 0.3, 8); scene.add(ol); // orbiting gold

// ─── LOGO: Teardrop with nested ovals + iridescent copper ───
const logoG = new THREE.Group();
scene.add(logoG);

// Iridescent copper material (report: metalness 0.7, roughness 0.3, iridescence)
const logoMat = new THREE.MeshPhysicalMaterial({
    color: 0xc87d5f, metalness: 0.7, roughness: 0.3,
    iridescence: 0.6, iridescenceIOR: 1.3,
    clearcoat: 0.4, clearcoatRoughness: 0.3,
    emissive: 0xc87d5f, emissiveIntensity: 0.15,
    transparent: true, opacity: 0.92,
});

// Nested oval rings (report: 3-4 concentric ovals = "portal" effect)
[1.0, 0.78, 0.56].forEach((r, i) => {
    const geo = new THREE.TorusGeometry(r, 0.04 + i * 0.008, 24, 80);
    const m = new THREE.Mesh(geo, logoMat);
    m.rotation.x = Math.PI / 2; // face forward
    logoG.add(m);
});

// Core teardrop (elongated sphere)
const coreGeo = new THREE.SphereGeometry(0.35, 32, 32);
const core = new THREE.Mesh(coreGeo, logoMat.clone());
core.scale.set(0.7, 1.1, 0.7);
logoG.add(core);

// M7 text inside core
const tc = document.createElement('canvas'); tc.width = 256; tc.height = 256;
const tx = tc.getContext('2d');
tx.fillStyle = 'transparent'; tx.fillRect(0, 0, 256, 256);
tx.fillStyle = '#ffffff'; tx.font = 'bold 72px Space Grotesk, sans-serif';
tx.textAlign = 'center'; tx.textBaseline = 'middle'; tx.fillText('M7', 128, 128);
const tTex = new THREE.CanvasTexture(tc);
const tMat = new THREE.MeshBasicMaterial({ map: tTex, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
logoG.add(new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), tMat));

// ─── BONE WISHBONE SUPPORTS (report: curved organic arcs) ───
function createBone(pts) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 40, 0.035, 8, false);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x8b7355, metalness: 0.0, roughness: 0.4,
        emissive: 0x6d4428, emissiveIntensity: 0.08,
    });
    return new THREE.Mesh(geo, mat);
}
const bone1 = createBone([
    new THREE.Vector3(-0.4, -2.5, 0), new THREE.Vector3(-0.25, -1.5, 0.1),
    new THREE.Vector3(0.05, -0.8, 0), new THREE.Vector3(0, -1.1, 0)
]);
const bone2 = createBone([
    new THREE.Vector3(0.4, -2.5, 0), new THREE.Vector3(0.25, -1.5, -0.1),
    new THREE.Vector3(-0.05, -0.8, 0), new THREE.Vector3(0, -1.1, 0)
]);
logoG.add(bone1, bone2);

// ─── JELLYFISH (bioluminescent, translucent) ───
function mkJelly(x, y, z, s) {
    const g = new THREE.Group();
    const dGeo = new THREE.SphereGeometry(0.2 * s, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const dMat = new THREE.MeshPhysicalMaterial({
        color: 0x1a1f28, metalness: 0, roughness: 0.1,
        transmission: 0.4, opacity: 0.3, transparent: true,
        emissive: 0x8a6aae, emissiveIntensity: 0.3,
        clearcoat: 1, side: THREE.DoubleSide,
    });
    g.add(new THREE.Mesh(dGeo, dMat));
    // Tentacles
    for (let i = 0; i < 4; i++) {
        const pts = [];
        const a = (i / 4) * Math.PI * 2;
        for (let j = 0; j < 6; j++) {
            const t = j / 5;
            pts.push(new THREE.Vector3(Math.cos(a) * 0.06 * s + Math.sin(t * 3 + i) * 0.03 * s, -t * 0.5 * s, Math.sin(a) * 0.06 * s));
        }
        const tGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.005 * s, 4, false);
        const tMat = new THREE.MeshBasicMaterial({ color: 0x4a7bff, transparent: true, opacity: 0.12 });
        g.add(new THREE.Mesh(tGeo, tMat));
    }
    g.position.set(x, y, z);
    g.userData = { by: y, sp: 0.3 + Math.random() * 0.3, amp: 0.06, ph: Math.random() * 6.28, dx: (Math.random() - 0.5) * 0.0008 };
    return g;
}
const jellies = [[-2.8, 1.2, -2, 0.5], [3, -0.5, -2.5, 0.4], [-1.5, -1.8, -3, 0.3], [2.5, 2, -1.5, 0.35]].map(p => {
    const j = mkJelly(...p); scene.add(j); return j;
});

// ─── MARINE SNOW PARTICLES (report: cream white, upward drift) ───
const PC = mob ? 600 : 2000;
const pGeo = new THREE.BufferGeometry();
const pP = new Float32Array(PC * 3), pS = new Float32Array(PC), pC = new Float32Array(PC * 3), pV = new Float32Array(PC * 3);
for (let i = 0; i < PC; i++) {
    const r = 1.5 + Math.random() * 6;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pP[i*3] = r * Math.sin(ph) * Math.cos(th);
    pP[i*3+1] = r * Math.sin(ph) * Math.sin(th);
    pP[i*3+2] = r * Math.cos(ph);
    pS[i] = Math.random() * 0.6 + 0.15;
    pV[i*3] = (Math.random() - 0.5) * 0.001;
    pV[i*3+1] = Math.random() * 0.0015 + 0.0005; // upward
    pV[i*3+2] = (Math.random() - 0.5) * 0.001;
    // 70% cream white, 30% warm gold
    if (Math.random() > 0.7) { pC[i*3]=0.96; pC[i*3+1]=0.91; pC[i*3+2]=0.78; }
    else { pC[i*3]=0.91; pC[i*3+1]=0.91; pC[i*3+2]=0.88; }
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pP, 3));
pGeo.setAttribute('aSize', new THREE.BufferAttribute(pS, 1));
pGeo.setAttribute('aColor', new THREE.BufferAttribute(pC, 3));

const pMat = new THREE.ShaderMaterial({
    uniforms: { uTime: {value:0}, uMouse: {value:new THREE.Vector2()}, uPR: {value:R.getPixelRatio()} },
    vertexShader: `
        attribute float aSize; attribute vec3 aColor;
        uniform float uTime, uPR; uniform vec2 uMouse;
        varying float vA; varying vec3 vC;
        void main(){
            vec3 p=position;
            p.x+=sin(uTime*.2+position.y*1.5)*.04;
            p.y+=cos(uTime*.15+position.x)*.03;
            vec4 mv=modelViewMatrix*vec4(p,1.);
            float md=length(vec2(mv.x-uMouse.x*3.,mv.y-uMouse.y*3.));
            float rep=smoothstep(2.5,0.,md)*.15;
            p.xy+=normalize(p.xy-uMouse*3.+.001)*rep*.1;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
            gl_PointSize=aSize*uPR*(100./-mv.z);
            vA=(.03+sin(uTime*.6+length(p)*.3)*.01)*(1.-smoothstep(3.,7.,length(p)));
            vC=aColor;
        }`,
    fragmentShader: `
        varying float vA; varying vec3 vC;
        void main(){
            float d=length(gl_PointCoord-vec2(.5));
            if(d>.5)discard;
            float g=pow(1.-smoothstep(0.,.5,d),2.);
            gl_FragColor=vec4(vC,vA*g);
        }`,
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
});
scene.add(new THREE.Points(pGeo, pMat));

// ─── BIOLUMINESCENT PLANKTON (purple/blue, larger, fewer) ───
const BPC = mob ? 30 : 80;
const bGeo = new THREE.BufferGeometry();
const bP = new Float32Array(BPC * 3), bC = new Float32Array(BPC * 3), bS = new Float32Array(BPC);
for (let i = 0; i < BPC; i++) {
    bP[i*3] = (Math.random() - 0.5) * 14;
    bP[i*3+1] = (Math.random() - 0.5) * 14;
    bP[i*3+2] = (Math.random() - 0.5) * 8;
    bS[i] = Math.random() * 1.2 + 0.4;
    const blue = Math.random() > 0.5;
    if (blue) { bC[i*3]=0.29; bC[i*3+1]=0.48; bC[i*3+2]=1.0; }
    else { bC[i*3]=0.54; bC[i*3+1]=0.29; bC[i*3+2]=0.68; }
}
bGeo.setAttribute('position', new THREE.BufferAttribute(bP, 3));
bGeo.setAttribute('color', new THREE.BufferAttribute(bC, 3));
const bMat = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
scene.add(new THREE.Points(bGeo, bMat));

// ─── MOUSE ───
const mouse = { x:0, y:0, tx:0, ty:0 };
document.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    const c = document.getElementById('cur');
    if (c) c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});
document.addEventListener('touchmove', e => { mouse.tx=(e.touches[0].clientX/window.innerWidth)*2-1; mouse.ty=-(e.touches[0].clientY/window.innerHeight)*2+1; }, {passive:true});
document.addEventListener('mouseover', e => { const c=document.getElementById('cur'); if(c)c.classList.toggle('h',e.target.matches('a,button,.nb,.sb-l,.sc-cta,.ct-cta,.ct-a')); });

// ─── DRAG ───
let isDrag=false,ds={x:0,y:0},dr={x:0,y:0},er={x:0,y:0};
canvas.addEventListener('mousedown',e=>{isDrag=true;ds.x=e.clientX;ds.y=e.clientY});
canvas.addEventListener('touchstart',e=>{isDrag=true;ds.x=e.touches[0].clientX;ds.y=e.touches[0].clientY},{passive:true});
const drag=(x,y)=>{if(!isDrag)return;dr.y+=(x-ds.x)*.005;dr.x+=(y-ds.y)*.005;ds.x=x;ds.y=y};
canvas.addEventListener('mousemove',e=>drag(e.clientX,e.clientY));
canvas.addEventListener('touchmove',e=>drag(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
window.addEventListener('mouseup',()=>isDrag=false);
window.addEventListener('touchend',()=>isDrag=false);

// ─── CARD TILT ───
document.querySelectorAll('.scard').forEach(c => {
    const accent = c.dataset.accent;
    c.querySelector('.sc-tag').style.color = accent;
    c.querySelector('.sc-cta').style.color = accent;
    c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const cx = ((e.clientX-r.left)/r.width-.5)*2, cy=((e.clientY-r.top)/r.height-.5)*2;
        c.style.transform = `rotateX(${-cy*10}deg) rotateY(${cx*15}deg) translateZ(40px) scale(1.04)`;
        c.querySelector('.sc-glass').style.background = `radial-gradient(circle at ${(cx+1)*50}% ${(cy+1)*50}%,rgba(255,255,255,.06),rgba(10,14,20,.88) 60%)`;
    });
    c.addEventListener('mouseleave', () => {
        c.style.transform = ''; c.querySelector('.sc-glass').style.background = '';
    });
});

// ─── SCROLL ───
let scrollP = 0;
window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = h > 0 ? window.scrollY / h : 0;
    document.getElementById('prog').style.width = (scrollP * 100) + '%';
});

// ─── CLIMAX STATE ───
let climaxTriggered = false;

// ─── LOADER ───
const loader = document.getElementById('loader');
const ldFill = document.getElementById('ld-fill');
const ldT = document.getElementById('ld-t');
const steps = ['INITIALIZING','LOADING SHADERS','BUILDING SCENE','CALIBRATING','READY'];
let lp = 0;
const ldIv = setInterval(() => {
    lp += Math.random()*15+10;
    if(lp>=100){lp=100;clearInterval(ldIv);ldFill.style.width='100%';ldT.textContent=steps[4];
        setTimeout(()=>{loader.classList.add('gone');enter()},600);return;}
    ldFill.style.width=lp+'%';ldT.textContent=steps[Math.min(Math.floor(lp/25),3)];
}, 200);

function enter() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('#hero-text', { opacity:1, y:0, duration:1.5, delay:0.5, ease:'power3.out' });
    ScrollTrigger.create({ start:300, onUpdate:s=>document.getElementById('nav').classList.toggle('show',s.scroll()>300) });

    // Sidebar
    ScrollTrigger.create({ trigger:'.sec-srv', start:'top 80%', onEnter:()=>document.getElementById('sidebar').classList.add('vis') });

    // Cards
    gsap.utils.toArray('.scard').forEach((c, i) => {
        gsap.to(c, { scrollTrigger:{trigger:c,start:'top 85%'}, opacity:1, y:0, rotateX:-3, rotateY:8, scale:1, duration:1.2, delay:i*.2, ease:'back.out(1.5)', onStart:()=>c.classList.add('vis') });
    });

    // Climax
    ScrollTrigger.create({ trigger:'.sec-climax', start:'top 60%', onEnter:()=>{
        if(!climaxTriggered){climaxTriggered=true; triggerClimax();}
    }});

    // Contact
    gsap.from('.ct-h', { scrollTrigger:{trigger:'.ct-h',start:'top 80%'}, y:40, opacity:0, duration:0.8 });
    gsap.from('.ct-sub', { scrollTrigger:{trigger:'.ct-sub',start:'top 85%'}, y:20, opacity:0, duration:0.6, delay:0.2 });
    gsap.utils.toArray('.ct-a').forEach((a, i) => {
        gsap.from(a, { scrollTrigger:{trigger:a,start:'top 90%'}, x:-30, opacity:0, duration:0.5, delay:i*0.15 });
    });
}

// ─── CLIMAX BURST ───
let burstParticles = [], burstFrame = 0;
function triggerClimax() {
    gsap.to('#climax-text', { opacity:1, duration:1.5, delay:1.5, ease:'power3.out' });
    // Create burst particles
    for (let i = 0; i < (mob ? 200 : 800); i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI;
        const sp = (3 + Math.random() * 10) * 0.015;
        const vel = new THREE.Vector3(Math.sin(ph)*Math.cos(th)*sp, Math.cos(ph)*sp, Math.sin(ph)*Math.sin(th)*sp);
        const colors = [0xFFFFFF, 0x4060FF, 0xF5E6A8, 0xE8D878, 0xB8C848];
        const sz = Math.random() < 0.6 ? 0.015 : Math.random() < 0.9 ? 0.03 : 0.05;
        const geo = new THREE.SphereGeometry(sz, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color:colors[Math.floor(Math.random()*colors.length)], transparent:true, opacity:0.9 });
        const m = new THREE.Mesh(geo, mat);
        m.userData = { vel, born: burstFrame };
        scene.add(m);
        burstParticles.push(m);
    }
}

// ─── ANIMATION LOOP ───
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    mouse.x += (mouse.tx - mouse.x) * 0.1;
    mouse.y += (mouse.ty - mouse.y) * 0.1;
    pMat.uniforms.uTime.value = t;
    pMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
    er.x += (dr.x - er.x) * 0.08;
    er.y += (dr.y - er.y) * 0.08;

    // Logo rotation + parallax (report: 0.003 rad/frame, ±5° tilt, ±20px)
    logoG.rotation.y = t * 0.08 + mouse.x * 0.09 + er.y;
    logoG.rotation.x = Math.sin(t * 0.06) * 0.06 + mouse.y * 0.09 + er.x;
    logoG.position.x = mouse.x * 0.25;
    logoG.position.y = Math.sin(t * 0.4) * 0.1 + mouse.y * 0.2;

    // Iridescent color cycle (copper→pink→purple→copper)
    const it = (t * 0.3) % 3;
    let ec;
    if(it<1) ec=new THREE.Color(0xc87d5f).lerp(new THREE.Color(0xec4899),it);
    else if(it<2) ec=new THREE.Color(0xec4899).lerp(new THREE.Color(0x8a6aae),it-1);
    else ec=new THREE.Color(0x8a6aae).lerp(new THREE.Color(0xc87d5f),it-2);
    logoMat.emissive = ec;
    logoMat.emissiveIntensity = 0.12 + Math.sin(t) * 0.04;

    // Scroll fade (report: 15%→25% = logo fades)
    let la = 1;
    if (scrollP > 0.08 && scrollP < 0.2) la = 1 - (scrollP - 0.08) / 0.12;
    else if (scrollP >= 0.2) la = 0;
    logoG.visible = la > 0.01;
    if (la > 0) {
        logoG.scale.setScalar(0.7 + la * 0.3);
        logoG.position.y += (1 - la) * -1.5;
        logoMat.opacity = 0.92 * la;
    }

    // Jellyfish
    jellies.forEach(j => {
        const d = j.userData;
        j.position.y = d.by + Math.sin(t * d.sp + d.ph) * d.amp;
        j.position.x += d.dx;
        j.rotation.y = Math.sin(t * 0.2 + d.ph) * 0.08;
        if (Math.abs(j.position.x) > 5) d.dx *= -1;
    });

    // Marine snow drift
    for (let i = 0; i < PC; i++) {
        pP[i*3] += pV[i*3]; pP[i*3+1] += pV[i*3+1]; pP[i*3+2] += pV[i*3+2];
        if (pP[i*3+1] > 5 || Math.sqrt(pP[i*3]**2+pP[i*3+1]**2+pP[i*3+2]**2) > 7) {
            const r=1.5+Math.random()*3, th=Math.random()*6.28, ph=Math.acos(2*Math.random()-1);
            pP[i*3]=r*Math.sin(ph)*Math.cos(th); pP[i*3+1]=-3-Math.random()*2; pP[i*3+2]=r*Math.cos(ph);
        }
    }
    pGeo.attributes.position.needsUpdate = true;

    // Orbiting light
    ol.position.set(Math.sin(t*0.3)*3, Math.cos(t*0.2)*2, Math.cos(t*0.4)*3);

    // Camera
    cam.position.x = mouse.x * 0.3;
    cam.position.y = mouse.y * 0.2;
    cam.position.z = 6 + scrollP * 3;
    cam.lookAt(0, 0, 0);

    // Burst update
    if (burstParticles.length > 0) {
        burstFrame++;
        burstParticles.forEach(p => {
            p.position.add(p.userData.vel);
            p.userData.vel.multiplyScalar(0.96);
            if (burstFrame > 90) p.material.opacity = Math.max(0, 0.9 - (burstFrame - 90) / 150);
        });
        if (burstFrame > 240) {
            burstParticles.forEach(p => scene.remove(p));
            burstParticles = [];
        }
    }

    comp.render();
}

window.addEventListener('resize', () => {
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
    R.setSize(window.innerWidth, window.innerHeight);
    comp.setSize(window.innerWidth, window.innerHeight);
});

function noGL() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('gone');
        document.getElementById('hero-text').style.opacity='1';
        document.getElementById('hero-text').style.transform='none';
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({start:300,onUpdate:s=>document.getElementById('nav').classList.toggle('show',s.scroll()>300)});
    }, 1500);
}

animate();
