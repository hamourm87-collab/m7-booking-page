/* ═══════════════════════════════════════
   M7 GSAP Animations
   Scroll-triggered reveals + hero entrance
   ═══════════════════════════════════════ */

(function () {
    gsap.registerPlugin(ScrollTrigger);

    // ─── HERO ENTRANCE ───
    const heroTL = gsap.timeline({ delay: 0.5 });

    heroTL
        .to('.hero-badge', {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out'
        })
        .to('.hero-title .line-1', {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
        }, '-=0.3')
        .to('.hero-title .line-2', {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
        }, '-=0.4')
        .to('.hero-title .line-3', {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
        }, '-=0.4')
        .to('.hero-title .line-4', {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
        }, '-=0.4')
        .to('.hero-sub', {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'
        }, '-=0.3')
        .to('.cta-btn', {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'
        }, '-=0.2')
        .to('.scarcity', {
            opacity: 1, y: 0, duration: 0.5, ease: 'power3.out'
        }, '-=0.2')
        .to('.scroll-indicator', {
            opacity: 0.5, duration: 1, ease: 'power2.out'
        }, '-=0.3');

    // ─── PROOF SECTION ───
    gsap.to('.proof-quote', {
        scrollTrigger: {
            trigger: '.proof',
            start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
    });

    // Proof cards with stagger
    gsap.utils.toArray('.proof-card').forEach((card, i) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power3.out',
            onComplete: () => {
                // Animate numbers
                const numEl = card.querySelector('.proof-number');
                const target = parseInt(numEl.dataset.target);
                animateNumber(numEl, target);
            }
        });
    });

    function animateNumber(el, target) {
        const duration = 1500;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
            const current = Math.round(eased * target);
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ─── FILTER SECTION ───
    gsap.to('.filter-title', {
        scrollTrigger: {
            trigger: '.filter',
            start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
    });

    gsap.utils.toArray('.filter-item').forEach((item, i) => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
            },
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: i * 0.15,
            ease: 'power3.out',
        });
    });

    gsap.to('.filter-cta', {
        scrollTrigger: {
            trigger: '.filter-cta',
            start: 'top 90%',
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
    });

    // ─── BOOKING SECTION ───
    gsap.to('.booking-header', {
        scrollTrigger: {
            trigger: '.booking',
            start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
    });

    // ─── SCROLL INDICATOR FADE ───
    ScrollTrigger.create({
        trigger: '.proof',
        start: 'top 90%',
        onEnter: () => {
            gsap.to('.scroll-indicator', { opacity: 0, duration: 0.3 });
        }
    });

    // ─── NAV SCROLL EFFECT ───
    ScrollTrigger.create({
        start: 100,
        onUpdate: (self) => {
            const nav = document.querySelector('.nav');
            if (self.direction === 1 && self.scroll() > 200) {
                nav.style.transform = 'translateY(-100%)';
                nav.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
        }
    });

})();
