// Audio module - Sound effects system
const Audio = (function() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let enabled = true;
    let volume = 0.3;

    // Générateur de sons synthétiques (placeholder)
    function playTone(frequency, duration, type = 'sine', volumeMultiplier = 1) {
        if (!enabled) return;

        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(volume * volumeMultiplier, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    function playNoise(duration, volumeMultiplier = 1) {
        if (!enabled) return;

        try {
            const bufferSize = audioContext.sampleRate * duration;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();

            noise.buffer = buffer;
            filter.type = 'lowpass';
            filter.frequency.value = 1000;

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);

            gainNode.gain.setValueAtTime(volume * volumeMultiplier * 0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            noise.start(audioContext.currentTime);
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    // Sons du jeu
    function playLaunch() {
        // Son de lancement: whoosh ascendant
        playTone(150, 0.15, 'sine', 0.8);
        setTimeout(() => playTone(200, 0.1, 'sine', 0.6), 50);
        setTimeout(() => playTone(280, 0.1, 'sine', 0.4), 100);
    }

    function playImpact(intensity = 1) {
        // Son d'impact: bruit sourd
        const freq = 80 + intensity * 40;
        playTone(freq, 0.15, 'triangle', Math.min(1, intensity * 0.5));
        playNoise(0.1, intensity * 0.3);
    }

    function playIceBreak() {
        // Son de glace qui casse: craquement
        playTone(800, 0.05, 'square', 0.3);
        playTone(600, 0.08, 'square', 0.2);
        playNoise(0.15, 0.4);
    }

    function playBoarDeath() {
        // Son de sanglier vaincu: couinement descendant
        playTone(400, 0.1, 'sine', 0.5);
        setTimeout(() => playTone(300, 0.15, 'sine', 0.4), 80);
        setTimeout(() => playTone(200, 0.2, 'sine', 0.3), 180);
    }

    function playWin() {
        // Son de victoire: fanfare simple
        playTone(523, 0.15, 'sine', 0.6); // C
        setTimeout(() => playTone(659, 0.15, 'sine', 0.6), 150); // E
        setTimeout(() => playTone(784, 0.3, 'sine', 0.7), 300); // G
    }

    function playLose() {
        // Son de défaite: notes descendantes tristes
        playTone(400, 0.2, 'sine', 0.5);
        setTimeout(() => playTone(350, 0.2, 'sine', 0.4), 200);
        setTimeout(() => playTone(300, 0.4, 'sine', 0.3), 400);
    }

    function setEnabled(value) {
        enabled = value;
    }

    function setVolume(value) {
        volume = Math.max(0, Math.min(1, value));
    }

    function resume() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    // Reprendre le contexte audio au premier clic
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });

    return {
        playLaunch,
        playImpact,
        playIceBreak,
        playBoarDeath,
        playWin,
        playLose,
        setEnabled,
        setVolume,
        resume
    };
})();
