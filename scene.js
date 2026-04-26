/* ═══════════════════════════════════════════════
   M7 DIGITAL — Immersive 3D Scene
   Three.js WebGL: Diamond + Particles + Mouse
   Interactive 360° rotation + scroll transitions
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── DETECT CAPABILITIES ───
    const isMobile = window.innerWidth < 768;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── RENDERER ───
    const canvas = document.getElementById('webgl');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // ─── SCENE ───
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.035);

    // ─── CAMERA ───
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    // ─── MOUSE ───
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const mouseWorld = new THREE.Vector2();

    document.addEventListener('mousemove', (e) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
        // Update custom cursor
        const cursor = document.getElementById('cursor');
        if (cursor) {
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        }
    });

    document.addEventListener('touchmove', (e) => {
        mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    });

    // Cursor hover effects
    document.addEventListener('mouseover', (e) => {
        const cursor = document.getElementById('cursor');
        if (!cursor) return;
        const t = e.target;
        if (t.matches('a, button, select, input, .cta-primary, .cd.avail, .ts, .cal-btn')) {
            cursor.classList.add('hover');
        } else {
            cursor.classList.remove('hover');
        }
    });

    // ─── LIGHTS ───
    const ambientLight = new THREE.AmbientLight(0x222222, 1);
    scene.add(ambientLight);

    // Gold point light
    const goldLight = new THREE.PointLight(0xC9A96E, 3, 20);
    goldLight.position.set(2, 3, 4);
    scene.add(goldLight);

    // White rim light
    const rimLight = new THREE.PointLight(0xffffff, 1.5, 15);
    rimLight.position.set(-3, -2, 3);
    scene.add(rimLight);

    // Moving accent light
    const accentLight = new THREE.PointLight(0xE8C87E, 2, 12);
    scene.add(accentLight);

    // ─── DIAMOND (Central 3D Object) ───
    // Octahedron = diamond shape
    const diamondGeo = new THREE.OctahedronGeometry(1, 0);
    const diamondMat = new THREE.MeshStandardMaterial({
        color: 0xC9A96E,
        metalness: 0.95,
        roughness: 0.05,
        emissive: 0xC9A96E,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.85,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    scene.add(diamond);

    // Diamond wireframe overlay
    const wireGeo = new THREE.OctahedronGeometry(1.02, 0);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xC9A96E,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    // ─── INNER GLOW SPHERE ───
    const glowGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xE8C87E,
        transparent: true,
        opacity: 0.4,
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowSphere);

    // ─── ORBIT RINGS ───
    const rings = [];
    for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.TorusGeometry(1.6 + i * 0.5, 0.005, 8, 100);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xC9A96E,
            transparent: true,
            opacity: 0.12 - i * 0.03,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2 + i * 0.3;
        ring.rotation.y = i * 0.5;
        scene.add(ring);
        rings.push(ring);
    }

    // ─── PARTICLE SYSTEM ───
    const PARTICLE_COUNT = isMobile ? 800 : 3000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const alphas = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Sphere distribution
        const r = 2 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        velocities[i * 3] = (Math.random() - 0.5) * 0.002;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

        sizes[i] = Math.random() * 3 + 0.5;
        alphas[i] = Math.random() * 0.6 + 0.1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    // Custom shader for particles
    const particleMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uColor1: { value: new THREE.Color(0xC9A96E) },
            uColor2: { value: new THREE.Color(0xffffff) },
            uPixelRatio: { value: renderer.getPixelRatio() },
        },
        vertexShader: `
            attribute float aSize;
            attribute float aAlpha;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uPixelRatio;
            varying float vAlpha;

            void main() {
                vec3 pos = position;

                // Gentle float
                pos.x += sin(uTime * 0.3 + position.y * 2.0) * 0.05;
                pos.y += cos(uTime * 0.2 + position.x * 2.0) * 0.05;
                pos.z += sin(uTime * 0.25 + position.z * 1.5) * 0.03;

                // Mouse repulsion
                vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                float distToMouse = length(vec2(mvPos.x - uMouse.x * 3.0, mvPos.y - uMouse.y * 3.0));
                float repel = smoothstep(2.0, 0.0, distToMouse) * 0.5;
                pos.x += (pos.x - uMouse.x * 3.0) * repel * 0.1;
                pos.y += (pos.y - uMouse.y * 3.0) * repel * 0.1;

                vec4 finalPos = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                gl_Position = finalPos;
                gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPos.z);

                vAlpha = aAlpha * (1.0 - smoothstep(3.0, 8.0, length(pos)));
            }
        `,
        fragmentShader: `
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform float uTime;
            varying float vAlpha;

            void main() {
                float d = length(gl_PointCoord - vec2(0.5));
                if (d > 0.5) discard;

                float glow = 1.0 - smoothstep(0.0, 0.5, d);
                glow = pow(glow, 2.0);

                vec3 color = mix(uColor1, uColor2, sin(uTime + gl_PointCoord.x * 3.0) * 0.5 + 0.5);

                gl_FragColor = vec4(color, vAlpha * glow);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ─── FLOATING MINI DIAMONDS ───
    const miniDiamonds = [];
    for (let i = 0; i < 8; i++) {
        const size = 0.05 + Math.random() * 0.08;
        const geo = new THREE.OctahedronGeometry(size, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xC9A96E,
            wireframe: true,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.3,
        });
        const mini = new THREE.Mesh(geo, mat);
        const angle = (i / 8) * Math.PI * 2;
        const radius = 2 + Math.random() * 1.5;
        mini.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 2,
            Math.sin(angle) * radius
        );
        mini.userData = { angle, radius, speed: 0.1 + Math.random() * 0.2, yOffset: Math.random() * Math.PI * 2 };
        scene.add(mini);
        miniDiamonds.push(mini);
    }

    // ─── SCROLL STATE ───
    let scrollProgress = 0;

    window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = h > 0 ? window.scrollY / h : 0;

        // Progress bar
        document.getElementById('progress-bar').style.width = (scrollProgress * 100) + '%';
    });

    // ─── DRAG TO ROTATE ───
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let extraRotation = { x: 0, y: 0 };
    let dragRotation = { x: 0, y: 0 };

    canvas.style.pointerEvents = 'auto';

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
    });
    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        dragStart.x = e.touches[0].clientX;
        dragStart.y = e.touches[0].clientY;
    });

    const onDragMove = (x, y) => {
        if (!isDragging) return;
        dragRotation.y += (x - dragStart.x) * 0.005;
        dragRotation.x += (y - dragStart.y) * 0.005;
        dragStart.x = x;
        dragStart.y = y;
    };

    canvas.addEventListener('mousemove', (e) => onDragMove(e.clientX, e.clientY));
    canvas.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientX, e.touches[0].clientY));

    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('touchend', () => isDragging = false);

    // ─── LOADING ───
    const loader = document.getElementById('loader');
    const loaderProgress = document.getElementById('loader-progress');
    const loaderText = document.getElementById('loader-text');
    let loadProgress = 0;

    function simulateLoading() {
        const steps = ['INITIALIZING', 'LOADING ASSETS', 'BUILDING SCENE', 'READY'];
        const interval = setInterval(() => {
            loadProgress += Math.random() * 25 + 10;
            if (loadProgress >= 100) {
                loadProgress = 100;
                clearInterval(interval);
                loaderText.textContent = steps[3];
                loaderProgress.style.width = '100%';
                setTimeout(() => {
                    loader.classList.add('hidden');
                    document.querySelector('.nav').classList.add('visible');
                    animateHeroEntrance();
                }, 600);
                return;
            }
            const stepIdx = Math.min(Math.floor(loadProgress / 33), 2);
            loaderText.textContent = steps[stepIdx];
            loaderProgress.style.width = loadProgress + '%';
        }, 200);
    }

    // ─── HERO ENTRANCE ANIMATION ───
    function animateHeroEntrance() {
        const heroContent = document.querySelector('.hero-content');
        const scrollHint = document.querySelector('.scroll-hint');

        gsap.to(heroContent, { opacity: 1, duration: 0.8 });

        gsap.from('.hero-badge', { y: 30, opacity: 0, duration: 0.8, delay: 0.3 });

        document.querySelectorAll('.title-line').forEach((line, i) => {
            gsap.from(line, {
                y: 60,
                opacity: 0,
                duration: 0.7,
                delay: 0.5 + i * 0.12,
                ease: 'power3.out'
            });
        });

        gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 0.6, delay: 1.1 });
        gsap.from('.cta-primary', { y: 20, opacity: 0, duration: 0.6, delay: 1.3 });
        gsap.from('.scarcity-banner', { y: 20, opacity: 0, duration: 0.5, delay: 1.5 });
        gsap.to(scrollHint, { opacity: 0.6, duration: 1, delay: 2 });
    }

    // ─── SCROLL ANIMATIONS (GSAP) ───
    function setupScrollAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // Proof section
        gsap.from('.proof-headline', {
            scrollTrigger: { trigger: '.proof', start: 'top 75%' },
            y: 40, opacity: 0, duration: 0.8
        });

        document.querySelectorAll('.proof-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 85%' },
                y: 50, opacity: 0, duration: 0.7, delay: i * 0.1,
                onComplete: () => {
                    const numEl = card.querySelector('.proof-number');
                    if (numEl) animateNum(numEl, parseInt(numEl.dataset.target));
                }
            });
        });

        gsap.from('.filter-title', {
            scrollTrigger: { trigger: '.filter-block', start: 'top 80%' },
            y: 30, opacity: 0, duration: 0.7
        });

        document.querySelectorAll('.filter-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: { trigger: item, start: 'top 88%' },
                x: -30, opacity: 0, duration: 0.5, delay: i * 0.1
            });
        });

        gsap.from('.filter-end', {
            scrollTrigger: { trigger: '.filter-end', start: 'top 90%' },
            y: 20, opacity: 0, duration: 0.5
        });

        // Hide scroll hint
        ScrollTrigger.create({
            trigger: '.proof',
            start: 'top 90%',
            onEnter: () => gsap.to('.scroll-hint', { opacity: 0, duration: 0.3 })
        });

        // Nav active states
        document.querySelectorAll('.section').forEach(sec => {
            ScrollTrigger.create({
                trigger: sec,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => updateNav(sec.dataset.section),
                onEnterBack: () => updateNav(sec.dataset.section),
            });
        });
    }

    function updateNav(idx) {
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.section === idx);
        });
    }

    function animateNum(el, target) {
        const dur = 1200;
        const start = performance.now();
        (function tick(now) {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(eased * target);
            if (t < 1) requestAnimationFrame(tick);
        })(start);
    }

    // ─── ANIMATION LOOP ───
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();
        const dt = clock.getDelta();

        // Smooth mouse
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;

        // Update shader uniforms
        particleMat.uniforms.uTime.value = t;
        particleMat.uniforms.uMouse.value.set(mouse.x, mouse.y);

        // Diamond rotation (auto + mouse + drag)
        const autoRotY = t * 0.3;
        const autoRotX = Math.sin(t * 0.2) * 0.15;

        extraRotation.x += (dragRotation.x - extraRotation.x) * 0.1;
        extraRotation.y += (dragRotation.y - extraRotation.y) * 0.1;

        diamond.rotation.y = autoRotY + mouse.x * 0.5 + extraRotation.y;
        diamond.rotation.x = autoRotX + mouse.y * 0.3 + extraRotation.x;

        wireframe.rotation.copy(diamond.rotation);

        // Diamond scale with scroll
        const diamondScale = 1 - scrollProgress * 0.3;
        diamond.scale.setScalar(diamondScale);
        wireframe.scale.setScalar(diamondScale);

        // Glow sphere
        glowSphere.scale.setScalar(0.9 + Math.sin(t * 2) * 0.1);
        glowSphere.material.opacity = 0.3 + Math.sin(t * 1.5) * 0.1;

        // Rings rotation
        rings.forEach((ring, i) => {
            ring.rotation.z = t * (0.1 + i * 0.05);
            ring.rotation.x = Math.PI / 2 + i * 0.3 + Math.sin(t * 0.3 + i) * 0.1;
        });

        // Mini diamonds orbit
        miniDiamonds.forEach(m => {
            const d = m.userData;
            d.angle += d.speed * 0.01;
            m.position.x = Math.cos(d.angle) * d.radius;
            m.position.z = Math.sin(d.angle) * d.radius;
            m.position.y = Math.sin(t * d.speed + d.yOffset) * 0.8;
            m.rotation.x = t * d.speed;
            m.rotation.y = t * d.speed * 0.7;
        });

        // Accent light orbits
        accentLight.position.x = Math.sin(t * 0.5) * 4;
        accentLight.position.y = Math.cos(t * 0.3) * 2;
        accentLight.position.z = Math.cos(t * 0.5) * 4;

        // Particle drift
        const pos = particleGeo.attributes.position.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            pos[i * 3] += velocities[i * 3];
            pos[i * 3 + 1] += velocities[i * 3 + 1];
            pos[i * 3 + 2] += velocities[i * 3 + 2];

            // Wrap particles
            const dist = Math.sqrt(pos[i*3]**2 + pos[i*3+1]**2 + pos[i*3+2]**2);
            if (dist > 8) {
                const r = 2 + Math.random() * 2;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
                pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
                pos[i * 3 + 2] = r * Math.cos(ph);
            }
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Camera subtle movement
        camera.position.x = mouse.x * 0.3;
        camera.position.y = mouse.y * 0.2;
        camera.lookAt(0, 0, 0);

        // Scroll-based camera Z
        camera.position.z = 6 + scrollProgress * 2;

        renderer.render(scene, camera);
    }

    // ─── RESIZE ───
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // ─── START ───
    simulateLoading();
    setupScrollAnimations();
    animate();

})();
