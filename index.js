(() => {
    "use strict";

    const SELECTORS = {
        fadeElements: ".fade-in",
        navLinks: ".nav-link",
        heroSection: ".hero-section",
        logoWrapper: ".logo-wrapper",
        glowTitles: ".title-secondary",
        navigation: ".navigation",
        internalAnchors: 'a[href^="#"]',
    };

    const BREAKPOINTS = {
        mobile: 768,
    };

    const PARTICLES = {
        count: 50,
        speed: 0.35,
        minSize: 1,
        maxSize: 3,
        getCount: (width) => {
            if (width >= 1600) return 160;
            if (width >= 1200) return 120;
            if (width >= 900) return 90;
            if (width >= 600) return 60;
            return 40;
        },
    };

    document.addEventListener("DOMContentLoaded", initializeSite);

    function initializeSite() {
        document.documentElement.classList.add("js-enabled");

        initializeRevealAnimations();
        initializeNavigationEffects();
        initializeScrollEffects();
        initializeParticleBackground();
        initializeResponsiveNavigation();
        initializeSmoothScroll();
    }

    function initializeRevealAnimations() {
        const elements = Array.from(document.querySelectorAll(SELECTORS.fadeElements));
        if (!elements.length) {
            return;
        }

        if (prefersReducedMotion()) {
            elements.forEach(makeVisible);
            return;
        }

        if (!("IntersectionObserver" in window)) {
            staggerVisibility(elements);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    makeVisible(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            {
                    threshold: 0,
                    rootMargin: "0px 0px 20% 0px",
                }
        );

        elements.forEach((element) => observer.observe(element));
    }

    function makeVisible(element) {
        element.classList.add("is-visible");
    }

    function staggerVisibility(elements) {
        elements.forEach((element, index) => {
            window.setTimeout(() => {
                makeVisible(element);
            }, index * 60);
        });
    }

    function initializeNavigationEffects() {
        const links = document.querySelectorAll(SELECTORS.navLinks);
        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                link.classList.add("is-pressed");
                window.setTimeout(() => {
                    link.classList.remove("is-pressed");
                }, 140);

                if (event.clientX === 0 && event.clientY === 0) {
                    return;
                }

                createRipple(link, event.clientX, event.clientY);
            });
        });
    }

    function createRipple(link, clickX, clickY) {
        const rect = link.getBoundingClientRect();
        const diameter = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");

        ripple.className = "nav-ripple";
        ripple.style.width = `${diameter}px`;
        ripple.style.height = `${diameter}px`;
        ripple.style.left = `${clickX - rect.left - diameter / 2}px`;
        ripple.style.top = `${clickY - rect.top - diameter / 2}px`;

        link.appendChild(ripple);
        ripple.addEventListener(
            "animationend",
            () => {
                ripple.remove();
            },
            { once: true }
        );
    }

    function initializeScrollEffects() {
        // Scroll-based text motion disabled by design.
    }

    function initializeParticleBackground() {
        if (prefersReducedMotion()) {
            return;
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }

        canvas.className = "particle-canvas";
        canvas.setAttribute("aria-hidden", "true");
        document.body.appendChild(canvas);

        let width = 0;
        let height = 0;
        let particles = [];

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            const desiredCount = typeof PARTICLES.getCount === 'function' ? PARTICLES.getCount(width) : PARTICLES.count;
            particles = createParticles(desiredCount, width, height);
        };

        const animate = () => {
            context.clearRect(0, 0, width, height);

            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x <= 0 || particle.x >= width) {
                    particle.vx *= -1;
                }

                if (particle.y <= 0 || particle.y >= height) {
                    particle.vy *= -1;
                }

                context.beginPath();
                context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                context.fillStyle = `rgba(255, 105, 180, ${particle.opacity})`;
                context.fill();
            });

            window.requestAnimationFrame(animate);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        animate();
    }

    function createParticles(count, width, height) {
        const particles = [];
        for (let index = 0; index < count; index += 1) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * PARTICLES.speed,
                vy: (Math.random() - 0.5) * PARTICLES.speed,
                size: Math.random() * (PARTICLES.maxSize - PARTICLES.minSize) + PARTICLES.minSize,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }

        return particles;
    }

    function initializeResponsiveNavigation() {
        const navigation = document.querySelector(SELECTORS.navigation);
        if (!navigation) {
            return;
        }

        const applyLayoutState = () => {
            const isMobile = window.innerWidth <= BREAKPOINTS.mobile;
            navigation.classList.toggle("mobile", isMobile);
        };

        applyLayoutState();
        window.addEventListener("resize", applyLayoutState);
    }

    function initializeSmoothScroll() {
        const anchors = document.querySelectorAll(SELECTORS.internalAnchors);
        anchors.forEach((anchor) => {
            anchor.addEventListener("click", (event) => {
                const targetSelector = anchor.getAttribute("href");
                if (!targetSelector || targetSelector === "#") {
                    return;
                }

                const target = document.querySelector(targetSelector);
                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        });
    }

    function prefersReducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
})();
