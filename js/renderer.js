// Renderer module - Canvas drawing with sprite support
const Renderer = (function() {
    let canvas;
    let ctx;
    let scale = 1;

    // Sprites et images
    const images = {};
    let imagesLoaded = false;

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

    // Configuration des couches parallax
    const PARALLAX_LAYERS = [
        { name: 'bg-sky', speed: 0, y: 0 },
        { name: 'bg-mountains-far', speed: 0.3, y: 200 },
        { name: 'bg-mountains-near', speed: 0.6, y: 150 }
    ];

    // Position de la caméra (pour effet parallax)
    let cameraX = 0;

    // Animation
    let animationTime = 0;

    function init(canvasElement) {
        canvas = canvasElement;
        // Canvas opaque (pas de transparence alpha) pour éviter les artefacts
        ctx = canvas.getContext('2d', { alpha: false });

        resize();

        // Écouter les changements de taille (rotation mobile, resize)
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 100); // Délai pour laisser le navigateur s'adapter
        });

        // Charger les images
        loadImages();

        return { canvas, ctx, scale };
    }

    function loadImages() {
        const imageList = [
            'bg-sky',
            'bg-mountains-far',
            'bg-mountains-near',
            'yeti',
            'boar',
            'block-ice',
            'block-ice-dark',
            'block-metal',
            'slingshot',
            'tree-dead'
        ];

        let loadedCount = 0;

        imageList.forEach(name => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === imageList.length) {
                    imagesLoaded = true;
                    console.log('All images loaded');
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${name}`);
                loadedCount++;
            };
            img.src = `assets/images/${name}.png`;
            images[name] = img;
        });
    }

    function getImage(name) {
        return images[name];
    }

    function areImagesLoaded() {
        return imagesLoaded;
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

        // Incrémenter le temps d'animation
        animationTime += 0.016; // ~60fps

        // Si images chargées, dessiner le fond parallax
        if (imagesLoaded && images['bg-sky']) {
            drawParallaxBackground(CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            // Fallback: ciel dégradé simple
            const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#B0E0E6');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }

    function drawParallaxBackground(canvasWidth, canvasHeight) {
        // Fond de base (au cas où les images ont des zones transparentes)
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Couche 1: Ciel (statique, couvre tout le canvas)
        const sky = images['bg-sky'];
        if (sky && sky.complete) {
            ctx.drawImage(sky, 0, 0, canvasWidth, canvasHeight);
        }

        // Couche 2: Montagnes lointaines (parallax lent)
        const mountainsFar = images['bg-mountains-far'];
        if (mountainsFar && mountainsFar.complete) {
            const offsetX = cameraX * 0.3;
            // Dessiner depuis le milieu du canvas jusqu'en bas
            const y = canvasHeight * 0.35;
            const imgHeight = canvasHeight - y;
            ctx.drawImage(mountainsFar, -offsetX, y, canvasWidth + 100, imgHeight);
        }

        // Couche 3: Montagnes proches (parallax rapide)
        const mountainsNear = images['bg-mountains-near'];
        if (mountainsNear && mountainsNear.complete) {
            const offsetX = cameraX * 0.6;
            // Dessiner depuis 45% du canvas jusqu'en bas
            const y = canvasHeight * 0.45;
            const imgHeight = canvasHeight - y;
            ctx.drawImage(mountainsNear, -offsetX, y, canvasWidth + 100, imgHeight);
        }
    }

    function setCameraX(x) {
        cameraX = x;
    }

    // Mapping des types de blocs vers les sprites
    const SPRITE_MAP = {
        bird: 'yeti',
        pig: 'boar',
        wood: 'block-ice',
        stone: 'block-ice-dark',
        metal: 'block-metal'
    };

    function drawBody(body) {
        const pos = body.position;
        const angle = body.angle;
        const vel = body.velocity;
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

        // Dessiner avec sprite si disponible
        if (imagesLoaded) {
            if (body.gameType === 'bird') {
                const sprite = images[SPRITE_MAP.bird];
                if (sprite && sprite.complete) {
                    // Animation: respiration quand immobile, rotation quand en vol
                    const isFlying = speed > 1;
                    const breathe = isFlying ? 0 : Math.sin(animationTime * 3) * 0.05;
                    const size = 50 * (1 + breathe);

                    // Traînée de mouvement si en vol rapide
                    if (speed > 5) {
                        ctx.globalAlpha = 0.3;
                        drawSprite(sprite, pos.x - vel.x * 0.15, pos.y - vel.y * 0.15, size * 0.9, size * 0.9, angle);
                        ctx.globalAlpha = 0.15;
                        drawSprite(sprite, pos.x - vel.x * 0.3, pos.y - vel.y * 0.3, size * 0.8, size * 0.8, angle);
                        ctx.globalAlpha = 1;
                    }

                    drawSprite(sprite, pos.x, pos.y, size, size, angle);
                    return;
                }
            } else if (body.gameType === 'pig') {
                const sprite = images[SPRITE_MAP.pig];
                if (sprite && sprite.complete) {
                    // Animation: tremblement léger
                    const wobble = Math.sin(animationTime * 5 + body.id) * 0.02;
                    const shake = Math.sin(animationTime * 8 + body.id * 2) * 1;

                    // Taille réduite si endommagé
                    const baseSize = body.health < 2 ? 40 : 44;
                    const size = baseSize * (1 + wobble);

                    drawSprite(sprite, pos.x + shake, pos.y, size, size, angle + wobble * 0.5);
                    return;
                }
            } else if (body.gameType === 'block') {
                const spriteName = SPRITE_MAP[body.blockType] || SPRITE_MAP.wood;
                const sprite = images[spriteName];
                if (sprite && sprite.complete) {
                    // Calculer dimensions du bloc
                    const bounds = body.bounds;
                    const width = bounds.max.x - bounds.min.x;
                    const height = bounds.max.y - bounds.min.y;
                    drawSprite(sprite, pos.x, pos.y, width, height, angle);
                    return;
                }
            }
        }

        // Fallback: dessiner avec couleurs (ancien système)
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

    function drawSprite(img, x, y, width, height, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
    }

    function drawCircle(x, y, radius, color, useSprite = true) {
        // Utiliser sprite yéti si disponible
        if (useSprite && imagesLoaded && color === COLORS.bird) {
            const sprite = images['yeti'];
            if (sprite && sprite.complete) {
                // Animation respiration sur le lance-pierre
                const breathe = Math.sin(animationTime * 3) * 0.05;
                const size = 50 * (1 + breathe);
                drawSprite(sprite, x, y, size, size, 0);
                return;
            }
        }

        // Fallback: cercle coloré
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawSlingshot(x, y) {
        // Utiliser sprite si disponible
        if (imagesLoaded) {
            const sprite = images['slingshot'];
            if (sprite && sprite.complete) {
                // Le sprite est centré sur le point d'ancrage
                drawSprite(sprite, x, y - 10, 80, 110, 0);
                return;
            }
        }

        // Fallback: dessin simple
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
        getImage,
        areImagesLoaded,
        setCameraX,
        COLORS
    };
})();
