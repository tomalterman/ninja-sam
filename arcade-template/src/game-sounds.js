// ==================== GAME SOUNDS ====================
// Define sounds as functions that receive the Sound engine (S).
// Use S.playTone(startFreq, endFreq, duration, waveType, volume)
// and S.playNoise(duration, startFreq, endFreq)

const SOUNDS = {
    start: (S) => {
        S.playTone(300, 400, 0.1, 'square', 0.3);
        setTimeout(() => S.playTone(400, 500, 0.1, 'square', 0.3), 100);
        setTimeout(() => S.playTone(600, 700, 0.15, 'square', 0.3), 200);
    },

    gameOver: (S) => {
        S.playTone(400, 200, 0.3, 'square', 0.3);
        setTimeout(() => S.playTone(300, 150, 0.3, 'square', 0.3), 150);
        setTimeout(() => S.playTone(200, 100, 0.4, 'square', 0.3), 300);
    },

    dodge: (S) => {
        S.playTone(400, 600, 0.08, 'sine', 0.2);
    },

    hit: (S) => {
        S.playTone(200, 80, 0.2, 'sawtooth', 0.4);
        S.playNoise(0.1, 400, 100);
    },

    milestone: (S) => {
        S.playTone(600, 800, 0.1, 'sine', 0.3);
        setTimeout(() => S.playTone(800, 1000, 0.1, 'sine', 0.3), 80);
    }
};
