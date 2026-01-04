// Renderer module - Canvas drawing
const Renderer = (function() {
    let canvas;
    let ctx;
    let scale = 1;

    const COLORS = {
        bird: '#E74C3C',
        pig: '#27AE60',
        pigDamaged: '#F39C12',
        wood: '#8B4513',
        stone: '#696969',
        metal: '#2C3E50',
        ground: '#8B4513',
        slingshot: '#5D4037',
        elastic: '#3E2723',
        trajectory: 'rgba(255, 255, 255, 0.5)'
    };

    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');

        resize();

        // Écouter les changements de taille (rotation mobile, resize)
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 100); // Délai pour laisser le navigateur s'adapter
        });

        return { canvas, ctx, scale };
    }

    function resize() {
        const { CANVAS_WIDTH, CANVAS_HEIGHT } = Physics.getConstants();

        // Responsive scaling
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;

        scale = Math.min(maxWidth / CANVAS_WIDTH, maxHeight / CANVAS_HEIGHT);

        canvas.width = CANVAS_WIDTH * scale;
        canvas.height = CANVAS_HEIGHT * scale;

        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        ctx.scale(scale, scale);
    }

    function clear() {
        const { CANVAS_WIDTH, CANVAS_HEIGHT } = Physics.getConstants();

        // Ciel dégradé
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#B0E0E6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    function drawBody(body) {
        const vertices = body.vertices;

        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);

        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }

        ctx.closePath();

        // Couleur selon le type
        if (body.gameType === 'bird') {
            ctx.fillStyle = COLORS.bird;
        } else if (body.gameType === 'pig') {
            ctx.fillStyle = body.health < 2 ? COLORS.pigDamaged : COLORS.pig;
        } else if (body.gameType === 'block') {
            ctx.fillStyle = COLORS[body.blockType] || COLORS.wood;
        } else if (body.label === 'ground') {
            ctx.fillStyle = COLORS.ground;
        } else {
            ctx.fillStyle = '#333';
        }

        ctx.fill();

        // Contour
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawCircle(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawSlingshot(x, y) {
        // Base du lance-pierre
        ctx.fillStyle = COLORS.slingshot;

        // Fourche gauche
        ctx.fillRect(x - 25, y - 60, 8, 70);
        // Fourche droite
        ctx.fillRect(x + 17, y - 60, 8, 70);
        // Base
        ctx.fillRect(x - 15, y + 10, 30, 40);
    }

    function drawElastic(anchorLeft, anchorRight, birdPos) {
        ctx.strokeStyle = COLORS.elastic;
        ctx.lineWidth = 4;

        // Élastique gauche
        ctx.beginPath();
        ctx.moveTo(anchorLeft.x, anchorLeft.y);
        ctx.lineTo(birdPos.x, birdPos.y);
        ctx.stroke();

        // Élastique droit
        ctx.beginPath();
        ctx.moveTo(anchorRight.x, anchorRight.y);
        ctx.lineTo(birdPos.x, birdPos.y);
        ctx.stroke();
    }

    function drawTrajectory(startX, startY, velocityX, velocityY) {
        ctx.fillStyle = COLORS.trajectory;

        const gravity = 1;
        const timeStep = 0.15;
        const numPoints = 15;

        for (let i = 1; i <= numPoints; i++) {
            const t = i * timeStep;
            const x = startX + velocityX * t * 60;
            const y = startY + velocityY * t * 60 + 0.5 * gravity * (t * 60) * (t * 60) * 0.001;

            const radius = 3 - (i * 0.15);
            if (radius > 0) {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function render(bodies) {
        clear();

        for (const body of bodies) {
            if (body.label !== 'wall') {
                drawBody(body);
            }
        }
    }

    function getScale() {
        return scale;
    }

    function getCanvas() {
        return canvas;
    }

    return {
        init,
        clear,
        drawBody,
        drawCircle,
        drawSlingshot,
        drawElastic,
        drawTrajectory,
        render,
        getScale,
        getCanvas,
        COLORS
    };
})();
