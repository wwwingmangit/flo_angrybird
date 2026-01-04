// Particles module - Visual effects system
const Particles = (function() {
    const particles = [];
    const MAX_PARTICLES = 200;

    // Types de particules
    const PARTICLE_TYPES = {
        ice: { colors: ['#a8d8ff', '#c8e8ff', '#ffffff', '#88c8f8'], size: [3, 8], life: [0.5, 1] },
        snow: { colors: ['#ffffff', '#f0f8ff', '#e8f4ff'], size: [2, 5], life: [0.8, 1.5] },
        star: { colors: ['#ffff00', '#ffcc00', '#ffffff'], size: [3, 6], life: [0.5, 1] },
        dust: { colors: ['#d4c4a8', '#c8b898', '#b8a888'], size: [2, 4], life: [0.3, 0.6] }
    };

    function create(x, y, type, count = 10, options = {}) {
        const config = PARTICLE_TYPES[type] || PARTICLE_TYPES.ice;
        const { velocityScale = 1, spread = Math.PI * 2 } = options;

        for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
            const angle = Math.random() * spread - spread / 2 + (options.angle || -Math.PI / 2);
            const speed = (2 + Math.random() * 4) * velocityScale;
            const size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
            const life = config.life[0] + Math.random() * (config.life[1] - config.life[0]);

            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                maxSize: size,
                life,
                maxLife: life,
                color: config.colors[Math.floor(Math.random() * config.colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                type
            });
        }
    }

    function createExplosion(x, y, type, count = 15) {
        create(x, y, type, count, { velocityScale: 1.5, spread: Math.PI * 2 });
    }

    function createImpact(x, y, count = 8) {
        create(x, y, 'snow', count, { velocityScale: 0.8, spread: Math.PI });
    }

    function update(deltaTime = 0.016) {
        const gravity = 200;

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // Physique
            p.x += p.vx;
            p.y += p.vy;
            p.vy += gravity * deltaTime;
            p.vx *= 0.99;
            p.rotation += p.rotationSpeed;

            // Vie
            p.life -= deltaTime;
            p.size = p.maxSize * (p.life / p.maxLife);

            // Supprimer si mort
            if (p.life <= 0 || p.size < 0.5) {
                particles.splice(i, 1);
            }
        }
    }

    function render(ctx) {
        for (const p of particles) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = Math.min(1, p.life / (p.maxLife * 0.3));
            ctx.fillStyle = p.color;

            if (p.type === 'star') {
                // Dessiner une étoile
                drawStar(ctx, 0, 0, p.size, 5);
            } else {
                // Dessiner un rectangle (éclat)
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            }

            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }

    function drawStar(ctx, x, y, size, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? size : size / 2;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    function clear() {
        particles.length = 0;
    }

    function getCount() {
        return particles.length;
    }

    return {
        create,
        createExplosion,
        createImpact,
        update,
        render,
        clear,
        getCount
    };
})();
