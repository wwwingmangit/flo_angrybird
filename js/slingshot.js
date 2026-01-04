// Slingshot module - Drag and drop mechanics
const Slingshot = (function () {
    const ANCHOR_X = 150;
    const ANCHOR_Y = 350;
    const MAX_DRAG_DISTANCE = 120;
    const POWER_MULTIPLIER = 0.15;

    let isDragging = false;
    let currentBird = null;
    let dragPosition = { x: ANCHOR_X, y: ANCHOR_Y };
    let onLaunchCallback = null;

    const anchorLeft = { x: ANCHOR_X - 20, y: ANCHOR_Y - 55 };
    const anchorRight = { x: ANCHOR_X + 20, y: ANCHOR_Y - 55 };

    function init(canvas) {
        const scale = Renderer.getScale();

        // Mouse events
        canvas.addEventListener('mousedown', (e) => handleStart(e, scale));
        canvas.addEventListener('mousemove', (e) => handleMove(e, scale));
        canvas.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('mouseleave', handleEnd);

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleStart(e.touches[0], scale);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleMove(e.touches[0], scale);
        });
        canvas.addEventListener('touchend', handleEnd);
        canvas.addEventListener('touchcancel', handleEnd);
    }

    function handleStart(e, scale) {
        if (!currentBird) return;

        const rect = Renderer.getCanvas().getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        // Vérifier si on clique sur l'oiseau
        const birdPos = currentBird.position;
        const distance = Math.sqrt((x - birdPos.x) ** 2 + (y - birdPos.y) ** 2);

        if (distance < 40) {
            isDragging = true;
            dragPosition = { x: birdPos.x, y: birdPos.y };
        }
    }

    function handleMove(e, scale) {
        if (!isDragging || !currentBird) return;

        const rect = Renderer.getCanvas().getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        // Calculer la distance depuis l'ancrage
        const dx = x - ANCHOR_X;
        const dy = y - ANCHOR_Y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Limiter au rayon max
        if (distance > MAX_DRAG_DISTANCE) {
            const angle = Math.atan2(dy, dx);
            dragPosition.x = ANCHOR_X + Math.cos(angle) * MAX_DRAG_DISTANCE;
            dragPosition.y = ANCHOR_Y + Math.sin(angle) * MAX_DRAG_DISTANCE;
        } else {
            dragPosition.x = x;
            dragPosition.y = y;
        }

        // Ne permettre de tirer que vers l'arrière (gauche)
        if (dragPosition.x > ANCHOR_X) {
            dragPosition.x = ANCHOR_X;
        }

        // Mettre à jour la position de l'oiseau (statique pendant le drag)
        Matter.Body.setPosition(currentBird, dragPosition);
        Matter.Body.setVelocity(currentBird, { x: 0, y: 0 });
    }

    function handleEnd() {
        if (!isDragging || !currentBird) return;

        isDragging = false;

        // Calculer la vélocité de lancement
        const velocityX = (ANCHOR_X - dragPosition.x) * POWER_MULTIPLIER;
        const velocityY = (ANCHOR_Y - dragPosition.y) * POWER_MULTIPLIER;

        // Ne lancer que si on a tiré suffisamment
        if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
            Matter.Body.setVelocity(currentBird, { x: velocityX, y: velocityY });

            if (onLaunchCallback) {
                onLaunchCallback(currentBird);
            }

            currentBird = null;
        } else {
            // Remettre l'oiseau à l'ancrage
            Matter.Body.setPosition(currentBird, { x: ANCHOR_X, y: ANCHOR_Y });
        }
    }

    function setBird(bird) {
        currentBird = bird;
        if (bird) {
            Matter.Body.setPosition(bird, { x: ANCHOR_X, y: ANCHOR_Y });
            Matter.Body.setVelocity(bird, { x: 0, y: 0 });
            Matter.Body.setStatic(bird, true);
            dragPosition = { x: ANCHOR_X, y: ANCHOR_Y };
        }
    }

    function onLaunch(callback) {
        onLaunchCallback = callback;
    }

    function draw() {
        // Dessiner le lance-pierre
        Renderer.drawSlingshot(ANCHOR_X, ANCHOR_Y);

        // Dessiner les élastiques si on tire
        if (currentBird) {
            const birdPos = isDragging ? dragPosition : currentBird.position;
            Renderer.drawElastic(anchorLeft, anchorRight, birdPos);

            // Dessiner la trajectoire prédictive pendant le drag
            if (isDragging) {
                const velocityX = (ANCHOR_X - dragPosition.x) * POWER_MULTIPLIER;
                const velocityY = (ANCHOR_Y - dragPosition.y) * POWER_MULTIPLIER;
                Renderer.drawTrajectory(dragPosition.x, dragPosition.y, velocityX, velocityY);
            }
        }
    }

    function getAnchor() {
        return { x: ANCHOR_X, y: ANCHOR_Y };
    }

    function isActive() {
        return isDragging;
    }

    return {
        init,
        setBird,
        onLaunch,
        draw,
        getAnchor,
        isActive
    };
})();
