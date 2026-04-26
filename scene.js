/* ═══════════════════════════════════════════
   M7 DIGITAL — NEURAL SPINE 3D SCENE
   Three.js: Spine + Neural Network + Particles
   Interactive mouse + scroll-linked animations
   ═══════════════════════════════════════════ */
(function () {
    'use strict';

    const isMobile = window.innerWidth < 768;
    const canvas = document.getElementById('webgl');

    // ─── WEBGL CHECK ───
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
        // No WebGL — still show page
        startNoWebGL();
        return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.04);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // ─── MOUSE ───
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
        const cur = document.getElementById('cursor');
        if (cur) cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    });
    document.addEventListener('touchmove', (e) => {
        mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    });
    document.addEventListener('mouseover', (e) => {
        const cur = document.getElementById('cursor');
        if (!cur) return;
        cur.classList.toggle('hover', e.target.matches('a,button,select,input,.cd.a,.ts'));
    });

    // ─── LIGHTS ───
    scene.add(new THREE.AmbientLight(0x111122, 1.5));

    const cyanLight = new THREE.PointLight(0x00f0ff, 3, 20);
    cyanLight.position.set(3, 4, 5);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2.5, 18);
    purpleLight.position.set(-3, -2, 4);
    scene.add(purpleLight);

    const pinkLight = new THREE.PointLight(0xec4899, 2, 15);
    pinkLight.position.set(0, 0, 6);
    scene.add(pinkLight);

    const movingLight = new THREE.PointLight(0x3b82f6, 2, 12);
    scene.add(movingLight);

    // ─── SPINE (Central Column) ───
    const spineGroup = new THREE.Group();
    scene.add(spineGroup);

    const VERTEBRAE = 16;
    const SPINE_HEIGHT = 6;
    const vertebrae = [];

    for (let i = 0; i < VERTEBRAE; i++) {
        const t = i / (VERTEBRAE - 1); // 0 to 1
        const y = (t - 0.5) * SPINE_HEIGHT;
        const scale = 0.15 + Math.sin(t * Math.PI) * 0.15; // larger in middle

        // Vertebra body
        const geo = new THREE.BoxGeometry(scale * 2, 0.12, scale * 1.5, 1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.2,
            emissive: new THREE.Color().lerpColors(
                new THREE.Color(0x00f0ff),
                new THREE.Color(0xa855f7),
                t
            ),
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.85,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = y;
        mesh.rotation.y = t * 0.3; // slight twist
        spineGroup.add(mesh);

        // Disc between vertebrae
        if (i < VERTEBRAE - 1) {
            const discGeo = new THREE.CylinderGeometry(scale * 0.6, scale * 0.6, 0.06, 8);
            const discMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                transparent: true,
                opacity: 0.2,
            });
            const disc = new THREE.Mesh(discGeo, discMat);
            disc.position.y = y + SPINE_HEIGHT / (VERTEBRAE - 1) * 0.5;
            spineGroup.add(disc);
        }

        vertebrae.push({ mesh, t, baseY: y });
    }

    // Spine cord (central line)
    const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, SPINE_HEIGHT * 1.1, 8);
    const cordMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.25 });
    const cord = new THREE.Mesh(cordGeo, cordMat);
    spineGroup.add(cord);

    // ─── NEURAL NETWORK ───
    const neuralGroup = new THREE.Group();
    scene.add(neuralGroup);

    const NODES = isMobile ? 30 : 60;
    const nodes = [];
    const nodePositions = [];

    for (let i = 0; i < NODES; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.2 + Math.random() * 2.5;
        const y = (Math.random() - 0.5) * SPINE_HEIGHT;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Node sphere
        const size = 0.03 + Math.random() * 0.05;
        const colors = [0x00f0ff, 0xa855f7, 0xec4899, 0x3b82f6];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const geo = new THREE.SphereGeometry(size, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.6 + Math.random() * 0.4,
        });
        const node = new THREE.Mesh(geo, mat);
        node.position.set(x, y, z);
        neuralGroup.add(node);

        nodes.push({ mesh: node, basePos: new THREE.Vector3(x, y, z), speed: 0.3 + Math.random() * 0.7, phase: Math.random() * Math.PI * 2 });
        nodePositions.push(new THREE.Vector3(x, y, z));
    }

    // Neural connections (lines between close nodes)
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];
    const connections = [];

    for (let i = 0; i < NODES; i++) {
        for (let j = i + 1; j < NODES; j++) {
            const dist = nodePositions[i].distanceTo(nodePositions[j]);
            if (dist < 1.5) {
                connections.push([i, j]);
                // positions will be updated each frame
                linePositions.push(0, 0, 0, 0, 0, 0);
                // color gradient
                const c1 = new THREE.Color(0x00f0ff);
                const c2 = new THREE.Color(0xa855f7);
                lineColors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
            }
        }
    }

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
    });
    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    neuralGroup.add(linesMesh);

    // ─── PARTICLES ───
    const PCOUNT = isMobile ? 600 : 2500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PCOUNT * 3);
    const pSizes = new Float32Array(PCOUNT);
    const pVel = new Float32Array(PCOUNT * 3);

    for (let i = 0; i < PCOUNT; i++) {
        const r = 1 + Math.random() * 7;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[i * 3 + 2] = r * Math.cos(phi);
        pSizes[i] = Math.random() * 2 + 0.5;
        pVel[i * 3] = (Math.random() - 0.5) * 0.003;
        pVel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
        pVel[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSizes, 1));

    const pMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2() },
            uPixelRatio: { value: renderer.getPixelRatio() },
        },
        vertexShader: `
            attribute float aSize;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uPixelRatio;
            varying float vAlpha;
            varying float vDist;
            void main() {
                vec3 pos = position;
                pos.x += sin(uTime*0.3 + position.y*2.0)*0.08;
                pos.y += cos(uTime*0.25 + position.x*1.5)*0.06;
                vec4 mv = modelViewMatrix * vec4(pos,1.0);
                float d = length(vec2(mv.x-uMouse.x*4.0, mv.y-uMouse.y*4.0));
                float repel = smoothstep(2.5,0.0,d)*0.4;
                pos.x += (pos.x-uMouse.x*4.0)*repel*0.08;
                pos.y += (pos.y-uMouse.y*4.0)*repel*0.08;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
                gl_PointSize = aSize * uPixelRatio * (180.0 / -mv.z);
                vAlpha = 0.4 * (1.0 - smoothstep(2.0,8.0,length(pos)));
                vDist = length(pos);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            varying float vAlpha;
            varying float vDist;
            void main() {
                float d = length(gl_PointCoord - vec2(0.5));
                if(d>0.5) discard;
                float glow = pow(1.0-smoothstep(0.0,0.5,d), 2.0);
                // Color shift based on distance
                vec3 cyan = vec3(0.0, 0.94, 1.0);
                vec3 purple = vec3(0.66, 0.33, 0.97);
                vec3 pink = vec3(0.93, 0.28, 0.6);
                float t = sin(uTime*0.5 + vDist*0.5)*0.5+0.5;
                vec3 col = mix(cyan, mix(purple,pink,t), t);
                gl_FragColor = vec4(col, vAlpha*glow);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(pGeo, pMat);
    scene.add(particlesMesh);

    // ─── DRAG ROTATE ───
    let isDrag = false, dragS = { x: 0, y: 0 }, dragR = { x: 0, y: 0 }, extraR = { x: 0, y: 0 };
    canvas.style.pointerEvents = 'auto';
    canvas.addEventListener('mousedown', e => { isDrag = true; dragS.x = e.clientX; dragS.y = e.clientY; });
    canvas.addEventListener('touchstart', e => { isDrag = true; dragS.x = e.touches[0].clientX; dragS.y = e.touches[0].clientY; });
    const onDrag = (x, y) => { if (!isDrag) return; dragR.y += (x - dragS.x) * 0.004; dragR.x += (y - dragS.y) * 0.004; dragS.x = x; dragS.y = y; };
    canvas.addEventListener('mousemove', e => onDrag(e.clientX, e.clientY));
    canvas.addEventListener('touchmove', e => onDrag(e.touches[0].clientX, e.touches[0].clientY));
    window.addEventListener('mouseup', () => isDrag = false);
    window.addEventListener('touchend', () => isDrag = false);

    // ─── SCROLL ───
    let scrollP = 0;
    window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        scrollP = h > 0 ? window.scrollY / h : 0;
        document.getElementById('scroll-progress').style.width = (scrollP * 100) + '%';
    });

    // ─── LOADING ───
    const loader = document.getElementById('loader');
    const loaderFill = document.getElementById('loader-fill');
    let loadP = 0;

    function runLoader() {
        const iv = setInterval(() => {
            loadP += Math.random() * 20 + 15;
            if (loadP >= 100) {
                loadP = 100;
                clearInterval(iv);
                loaderFill.style.width = '100%';
                setTimeout(() => {
                    loader.classList.add('gone');
                    enterHero();
                }, 500);
                return;
            }
            loaderFill.style.width = loadP + '%';
        }, 200);
    }

    function enterHero() {
        gsap.registerPlugin(ScrollTrigger);

        // Logo entrance
        gsap.to('.logo-wrap', { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' });
        gsap.to('.scroll-cue', { opacity: 0.5, duration: 1, delay: 1.5 });

        // Show nav on scroll
        ScrollTrigger.create({
            start: 200,
            onUpdate: (self) => {
                document.getElementById('nav').classList.toggle('show', self.scroll() > 200);
            }
        });

        // Hide scroll cue
        ScrollTrigger.create({ trigger: '.s-tagline', start: 'top 90%', onEnter: () => gsap.to('.scroll-cue', { opacity: 0, duration: 0.3 }) });

        // Tagline
        gsap.utils.toArray('.tag-line').forEach((line, i) => {
            gsap.to(line, { scrollTrigger: { trigger: line, start: 'top 82%' }, opacity: 1, y: 0, duration: 0.8, delay: i * 0.12, ease: 'power3.out' });
        });

        // About
        gsap.to('.about-text', { scrollTrigger: { trigger: '.about-text', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.8 });
        gsap.utils.toArray('.stat').forEach((s, i) => {
            gsap.to(s, { scrollTrigger: { trigger: s, start: 'top 85%' }, opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, onComplete: () => {
                const n = s.querySelector('.stat-num');
                if (n) animNum(n, +n.dataset.target);
            }});
        });

        // Filter
        gsap.to('.filter-title', { scrollTrigger: { trigger: '.filter-title', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.7 });
        gsap.utils.toArray('.fi').forEach((f, i) => {
            gsap.to(f, { scrollTrigger: { trigger: f, start: 'top 88%' }, opacity: 1, x: 0, duration: 0.5, delay: i * 0.1 });
        });
        gsap.to('.filter-end', { scrollTrigger: { trigger: '.filter-end', start: 'top 90%' }, opacity: 1, y: 0, duration: 0.5 });

        // Nav active
        document.querySelectorAll('.s[data-s]').forEach(sec => {
            ScrollTrigger.create({
                trigger: sec,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => setNav(sec.dataset.s),
                onEnterBack: () => setNav(sec.dataset.s),
            });
        });
    }

    function setNav(idx) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.s === idx));
    }

    function animNum(el, target) {
        const dur = 1200, start = performance.now();
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
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;

        // Particle uniforms
        pMat.uniforms.uTime.value = t;
        pMat.uniforms.uMouse.value.set(mouse.x, mouse.y);

        // Drag rotation
        extraR.x += (dragR.x - extraR.x) * 0.08;
        extraR.y += (dragR.y - extraR.y) * 0.08;

        // Spine rotation
        spineGroup.rotation.y = t * 0.15 + mouse.x * 0.4 + extraR.y;
        spineGroup.rotation.x = Math.sin(t * 0.1) * 0.1 + mouse.y * 0.2 + extraR.x;

        // Vertebrae individual animation
        vertebrae.forEach(v => {
            v.mesh.rotation.y = Math.sin(t * 0.5 + v.t * Math.PI * 2) * 0.2;
            v.mesh.position.y = v.baseY + Math.sin(t * 0.8 + v.t * 4) * 0.03;
            // Pulse emissive
            v.mesh.material.emissiveIntensity = 0.2 + Math.sin(t * 1.5 + v.t * 5) * 0.1;
        });

        // Neural network follows spine
        neuralGroup.rotation.y = spineGroup.rotation.y * 0.6;
        neuralGroup.rotation.x = spineGroup.rotation.x * 0.4;

        // Animate nodes
        nodes.forEach(n => {
            n.mesh.position.x = n.basePos.x + Math.sin(t * n.speed + n.phase) * 0.15;
            n.mesh.position.y = n.basePos.y + Math.cos(t * n.speed * 0.7 + n.phase) * 0.1;
            n.mesh.position.z = n.basePos.z + Math.sin(t * n.speed * 0.5 + n.phase * 2) * 0.1;
        });

        // Update connection lines
        const lp = linesMesh.geometry.attributes.position.array;
        for (let i = 0; i < connections.length; i++) {
            const [a, b] = connections[i];
            lp[i * 6] = nodes[a].mesh.position.x;
            lp[i * 6 + 1] = nodes[a].mesh.position.y;
            lp[i * 6 + 2] = nodes[a].mesh.position.z;
            lp[i * 6 + 3] = nodes[b].mesh.position.x;
            lp[i * 6 + 4] = nodes[b].mesh.position.y;
            lp[i * 6 + 5] = nodes[b].mesh.position.z;
        }
        linesMesh.geometry.attributes.position.needsUpdate = true;

        // Particle drift
        for (let i = 0; i < PCOUNT; i++) {
            pPos[i * 3] += pVel[i * 3];
            pPos[i * 3 + 1] += pVel[i * 3 + 1];
            pPos[i * 3 + 2] += pVel[i * 3 + 2];
            const d = Math.sqrt(pPos[i*3]**2 + pPos[i*3+1]**2 + pPos[i*3+2]**2);
            if (d > 8) {
                const r = 1.5 + Math.random() * 2;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
                pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
                pPos[i * 3 + 2] = r * Math.cos(ph);
            }
        }
        pGeo.attributes.position.needsUpdate = true;

        // Moving light
        movingLight.position.set(Math.sin(t * 0.4) * 4, Math.cos(t * 0.3) * 3, Math.cos(t * 0.5) * 4);

        // Camera
        camera.position.x = mouse.x * 0.4;
        camera.position.y = mouse.y * 0.3;
        camera.position.z = 8 + scrollP * 3;
        camera.lookAt(0, 0, 0);

        // Fade spine based on scroll
        const spineOpacity = 1 - scrollP * 2;
        spineGroup.visible = spineOpacity > 0;
        neuralGroup.visible = spineOpacity > 0;

        renderer.render(scene, camera);
    }

    // ─── RESIZE ───
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ─── NO WEBGL FALLBACK ───
    function startNoWebGL() {
        const loader = document.getElementById('loader');
        setTimeout(() => {
            loader.classList.add('gone');
            gsap.registerPlugin(ScrollTrigger);
            gsap.to('.logo-wrap', { opacity: 1, scale: 1, duration: 1 });
            gsap.to('.scroll-cue', { opacity: 0.5, delay: 1 });
            // Show nav on scroll
            ScrollTrigger.create({ start: 200, onUpdate: s => document.getElementById('nav').classList.toggle('show', s.scroll() > 200) });
            // Taglines
            gsap.utils.toArray('.tag-line').forEach((l, i) => {
                gsap.to(l, { scrollTrigger: { trigger: l, start: 'top 82%' }, opacity: 1, y: 0, duration: 0.8, delay: i * 0.12 });
            });
            gsap.to('.about-text', { scrollTrigger: { trigger: '.about-text', start: 'top 80%' }, opacity: 1, y: 0, duration: 0.8 });
        }, 1500);
    }

    // ─── GO ───
    runLoader();
    animate();

})();
