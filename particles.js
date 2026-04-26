/* ═══════════════════════════════════════
   M7 Particle System
   Lightweight canvas particles with
   gold/white palette + mouse interaction
   Falls back to static on weak devices
   ═══════════════════════════════════════ */

(function () {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, particles, mouse, animId;
    let isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isMobile = window.innerWidth < 768;

    const CONFIG = {
        count: isMobile ? 40 : 120,
        maxSize: isMobile ? 1.5 : 2,
        speed: 0.3,
        connectDist: isMobile ? 80 : 150,
        mouseRadius: 200,
        colors: [
            'rgba(201, 169, 110, ',  // gold
            'rgba(255, 255, 255, ',  // white
            'rgba(232, 200, 126, ',  // light gold
        ]
    };

    mouse = { x: -1000, y: -1000 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < CONFIG.count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * CONFIG.speed,
                vy: (Math.random() - 0.5) * CONFIG.speed,
                size: Math.random() * CONFIG.maxSize + 0.5,
                color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
                alpha: Math.random() * 0.5 + 0.1,
                pulseOffset: Math.random() * Math.PI * 2,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        const time = Date.now() * 0.001;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Wrap edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Mouse repulsion
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.mouseRadius) {
                const force = (1 - dist / CONFIG.mouseRadius) * 0.02;
                p.vx += dx * force;
                p.vy += dy * force;
            }

            // Dampen velocity
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Pulsing alpha
            const pulse = Math.sin(time + p.pulseOffset) * 0.15 + 0.85;
            const alpha = p.alpha * pulse;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color + alpha + ')';
            ctx.fill();

            // Connect nearby particles (skip on mobile for perf)
            if (!isMobile) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const ddx = p.x - p2.x;
                    const ddy = p.y - p2.y;
                    const d = Math.sqrt(ddx * ddx + ddy * ddy);
                    if (d < CONFIG.connectDist) {
                        const lineAlpha = (1 - d / CONFIG.connectDist) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(201, 169, 110, ' + lineAlpha + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        animId = requestAnimationFrame(draw);
    }

    function init() {
        resize();
        createParticles();

        if (isReduced) {
            // Static render for reduced motion
            draw();
            cancelAnimationFrame(animId);
            return;
        }

        draw();
    }

    // Events
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth < 768;
        CONFIG.count = isMobile ? 40 : 120;
        CONFIG.connectDist = isMobile ? 80 : 150;
        resize();
        createParticles();
    });

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Touch
    document.addEventListener('touchmove', (e) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    });

    document.addEventListener('touchend', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    init();
})();
