// Main module - Game initialization and loop
const Game = (function() {
    // États du jeu
    const STATES = {
        READY: 'ready',
        FLYING: 'flying',
        SETTLE: 'settle',
        WIN: 'win',
        LOSE: 'lose'
    };

    let state = STATES.READY;
    let currentBird = null;
    let settleTimer = 0;
    const SETTLE_TIME = 2000; // 2 secondes pour que tout se stabilise

    // Effets visuels
    let screenShake = { intensity: 0, duration: 0 };

    // Éléments UI
    let birdCountEl;
    let messageEl;
    let restartBtn;
    let muteBtn;
    let isMuted = false;

    function init() {
        // Initialiser le moteur physique
        Physics.init();

        // Initialiser le renderer
        const canvas = document.getElementById('game-canvas');
        Renderer.init(canvas);

        // Initialiser le lance-pierre
        Slingshot.init(canvas);
        Slingshot.onLaunch(onBirdLaunched);

        // Charger le niveau
        Level.load();

        // Éléments UI
        birdCountEl = document.getElementById('bird-count');
        messageEl = document.getElementById('message');
        restartBtn = document.getElementById('restart-btn');
        muteBtn = document.getElementById('mute-btn');

        restartBtn.addEventListener('click', restart);
        muteBtn.addEventListener('click', toggleMute);

        // Gestion des collisions
        Physics.onCollision(handleCollisions);

        // Préparer le premier oiseau
        prepareNextBird();

        // Démarrer le game loop
        gameLoop();
    }

    function prepareNextBird() {
        const birdsRemaining = Level.getBirdsRemaining();

        if (birdsRemaining > 0) {
            currentBird = Entities.createBird(150, 350);
            Physics.addBody(currentBird);
            Slingshot.setBird(currentBird);
            state = STATES.READY;
        }

        updateUI();
    }

    function onBirdLaunched(bird) {
        state = STATES.FLYING;
        Level.useBird();
        Matter.Body.setStatic(bird, false);
        updateUI();

        // Effets sonores et visuels
        Audio.playLaunch();
        Particles.create(bird.position.x, bird.position.y, 'snow', 5);
    }

    function handleCollisions(event) {
        const pairs = event.pairs;

        for (const pair of pairs) {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            // Calculer l'impact
            const relativeVelocity = Math.sqrt(
                (bodyA.velocity.x - bodyB.velocity.x) ** 2 +
                (bodyA.velocity.y - bodyB.velocity.y) ** 2
            );

            const impact = relativeVelocity * Math.min(bodyA.mass, bodyB.mass);

            // Effet d'impact visuel et sonore
            if (impact > 1.5) {
                const contactX = (bodyA.position.x + bodyB.position.x) / 2;
                const contactY = (bodyA.position.y + bodyB.position.y) / 2;

                Audio.playImpact(impact);
                Particles.createImpact(contactX, contactY, Math.min(12, Math.floor(impact * 2)));

                // Screenshake pour impacts forts
                if (impact > 3) {
                    triggerScreenShake(impact * 0.5, 150);
                }
            }

            // Appliquer les dégâts
            applyDamage(bodyA, impact);
            applyDamage(bodyB, impact);
        }
    }

    function triggerScreenShake(intensity, duration) {
        if (intensity > screenShake.intensity) {
            screenShake.intensity = Math.min(15, intensity);
            screenShake.duration = duration;
        }
    }

    function applyDamage(body, impact) {
        const DAMAGE_THRESHOLD = 1.5;

        if (impact < DAMAGE_THRESHOLD) return;

        if (body.gameType === 'pig') {
            body.health -= impact / 2;
            if (body.health <= 0) {
                // Effets de destruction sanglier
                Audio.playBoarDeath();
                Particles.createExplosion(body.position.x, body.position.y, 'star', 12);
                triggerScreenShake(5, 100);
                Level.removePig(body);
            }
        } else if (body.gameType === 'block') {
            body.health -= impact / 1.5;
            if (body.health <= 0) {
                // Effets de destruction bloc
                Audio.playIceBreak();
                Particles.createExplosion(body.position.x, body.position.y, 'ice', 10);
                Level.removeBlock(body);
            }
        }
    }

    function checkBirdStatus() {
        if (!currentBird || state !== STATES.FLYING) return;

        const pos = currentBird.position;
        const vel = currentBird.velocity;
        const { CANVAS_WIDTH, CANVAS_HEIGHT } = Physics.getConstants();

        // Oiseau sorti de l'écran ou presque arrêté
        const isOutOfBounds = pos.x > CANVAS_WIDTH + 50 || pos.y > CANVAS_HEIGHT + 50;
        const isStopped = Math.abs(vel.x) < 0.5 && Math.abs(vel.y) < 0.5 && pos.y > 100;

        if (isOutOfBounds || isStopped) {
            state = STATES.SETTLE;
            settleTimer = Date.now();
        }
    }

    function checkGameEnd() {
        if (state !== STATES.SETTLE) return;

        // Attendre que tout se stabilise
        if (Date.now() - settleTimer < SETTLE_TIME) return;

        const pigs = Level.getPigs();
        const birdsRemaining = Level.getBirdsRemaining();

        // Supprimer l'oiseau actuel
        if (currentBird) {
            Physics.removeBody(currentBird);
            currentBird = null;
        }

        if (pigs.length === 0) {
            // Victoire !
            state = STATES.WIN;
            showMessage('Victoire !', 'win');
            Audio.playWin();
        } else if (birdsRemaining === 0) {
            // Défaite
            state = STATES.LOSE;
            showMessage('Perdu...', 'lose');
            Audio.playLose();
        } else {
            // Continuer avec le prochain oiseau
            prepareNextBird();
        }
    }

    function showMessage(text, type) {
        messageEl.textContent = text;
        messageEl.className = type;
    }

    function updateUI() {
        const birdsRemaining = Level.getBirdsRemaining();
        birdCountEl.textContent = `Yétis: ${birdsRemaining}`;
    }

    function restart() {
        // Supprimer l'oiseau actuel
        if (currentBird) {
            Physics.removeBody(currentBird);
            currentBird = null;
        }

        // Réinitialiser le niveau
        Level.reset();

        // Cacher le message
        messageEl.className = 'hidden';

        // Préparer le premier oiseau
        prepareNextBird();

        // Clear particles
        Particles.clear();
    }

    function toggleMute() {
        isMuted = !isMuted;
        Audio.setEnabled(!isMuted);
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        muteBtn.classList.toggle('muted', isMuted);
    }

    function gameLoop() {
        // Mettre à jour la physique
        Physics.update();

        // Mettre à jour les particules
        Particles.update();

        // Mettre à jour le screenshake
        updateScreenShake();

        // Vérifier l'état de l'oiseau
        checkBirdStatus();
        checkGameEnd();

        // Dessiner
        render();

        // Prochaine frame
        requestAnimationFrame(gameLoop);
    }

    function updateScreenShake() {
        if (screenShake.duration > 0) {
            screenShake.duration -= 16;
            screenShake.intensity *= 0.9;
        } else {
            screenShake.intensity = 0;
        }
    }

    function render() {
        const canvas = Renderer.getCanvas();
        const ctx = canvas.getContext('2d');

        // Appliquer le screenshake
        if (screenShake.intensity > 0.5) {
            const shakeX = (Math.random() - 0.5) * screenShake.intensity;
            const shakeY = (Math.random() - 0.5) * screenShake.intensity;
            ctx.save();
            ctx.translate(shakeX, shakeY);
        }

        // Dessiner tous les corps
        Renderer.render(Physics.getAllBodies());

        // Dessiner les particules
        Particles.render(ctx);

        // Dessiner le lance-pierre et l'élastique
        Slingshot.draw();

        // Dessiner l'oiseau sur le lance-pierre (par-dessus l'élastique)
        if (currentBird && state === STATES.READY) {
            Renderer.drawCircle(
                currentBird.position.x,
                currentBird.position.y,
                20,
                Renderer.COLORS.bird
            );
        }

        // Restaurer le contexte si screenshake
        if (screenShake.intensity > 0.5) {
            ctx.restore();
        }
    }

    // Démarrer le jeu quand le DOM est prêt
    document.addEventListener('DOMContentLoaded', init);

    return {
        restart,
        getState: () => state
    };
})();
