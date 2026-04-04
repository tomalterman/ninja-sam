// ==================== ENGINE (ties everything together) ====================

const Engine = {
    canvas: null,
    ctx: null,

    state: {
        running: false,
        showTitleScreen: true,
        gameOver: false,
        score: 0,
        health: 3,
        maxHealth: 3,
        enteringName: false,
        playerName: '',
        newHighScoreRank: -1
    },

    input: {},

    particles: [],
    scorePopups: [],

    // Public API
    Sound: Sound,
    HighScores: HighScores,

    spawnParticle(x, y, vx, vy, size, color, life) {
        this.particles.push({ x, y, vx, vy, size, color, life, maxLife: life });
    },

    showScorePopup(x, y, text, color) {
        this.scorePopups.push({ x, y, text, color: color || '#ffd700', life: 40, maxLife: 40 });
    },

    init() {
        // Initialize input state for all controls
        GAME.controls.forEach(ctrl => { this.input[ctrl.id] = false; });

        setupCanvas();
        Sound.init();
        HighScores.init();
        setupInput();

        this.state.running = true;
        this.state.showTitleScreen = true;
        requestAnimationFrame(gameLoop);
    }
};

// Boot
window.addEventListener('load', () => Engine.init());
