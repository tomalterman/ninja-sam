// ==================== INPUT MANAGER ====================

function setupInput() {
    // Build key-to-action map from GAME.controls
    const keyMap = {};
    GAME.controls.forEach(ctrl => {
        ctrl.keys.forEach(key => { keyMap[key] = ctrl.id; });
    });

    // Generate touch buttons
    const touchControls = document.getElementById('touchControls');
    touchControls.innerHTML = '';
    GAME.controls.forEach(ctrl => {
        const btn = document.createElement('div');
        btn.className = 'touchBtn';
        btn.id = 'touch_' + ctrl.id;
        btn.textContent = ctrl.label;
        touchControls.appendChild(btn);
    });

    // Generate instructions
    const instructions = document.getElementById('instructions');
    instructions.innerHTML = '';
    GAME.instructions.forEach(inst => {
        const p = document.createElement('p');
        p.innerHTML = '<strong>' + inst.label + ':</strong> ' + inst.keys;
        instructions.appendChild(p);
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (Engine.state.showTitleScreen) {
            e.preventDefault();
            startGame();
            return;
        }

        if (Engine.state.gameOver && Engine.state.enteringName) {
            e.preventDefault();
            handleNameEntryKey(e);
            return;
        }

        if (Engine.state.gameOver) {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                restartGame();
            }
            return;
        }

        const action = keyMap[e.code];
        if (action) {
            e.preventDefault();
            Engine.input[action] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        const action = keyMap[e.code];
        if (action) {
            Engine.input[action] = false;
        }
    });

    // Touch buttons
    GAME.controls.forEach(ctrl => {
        const btn = document.getElementById('touch_' + ctrl.id);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (Engine.state.showTitleScreen) { startGame(); return; }
            if (Engine.state.gameOver && !Engine.state.enteringName) { restartGame(); return; }
            Engine.input[ctrl.id] = true;
        });
        btn.addEventListener('touchend', () => { Engine.input[ctrl.id] = false; });
    });

    // Canvas click/touch for title, game over, name entry
    function handleCanvasInteraction(e) {
        e.preventDefault();
        const rect = Engine.canvas.getBoundingClientRect();
        const scaleX = GAME.width / rect.width;
        const scaleY = GAME.height / rect.height;
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const canvasX = (clientX - rect.left) * scaleX;
        const canvasY = (clientY - rect.top) * scaleY;

        if (Engine.state.showTitleScreen) { startGame(); return; }

        if (Engine.state.gameOver) {
            if (Engine.state.enteringName) {
                handleKeyboardTouch(canvasX, canvasY);
            } else {
                restartGame();
            }
        }
    }

    Engine.canvas.addEventListener('click', handleCanvasInteraction);
    Engine.canvas.addEventListener('touchstart', handleCanvasInteraction);
}

function handleNameEntryKey(e) {
    if (e.code === 'Escape') {
        Engine.state.enteringName = false;
    } else if (e.code === 'Enter' && Engine.state.playerName.length === 3) {
        HighScores.add(Engine.state.playerName, Engine.state.score, Engine.state.newHighScoreRank);
        Engine.state.enteringName = false;
    } else if (e.code === 'Backspace' && Engine.state.playerName.length > 0) {
        Engine.state.playerName = Engine.state.playerName.slice(0, -1);
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/) && Engine.state.playerName.length < 3) {
        Engine.state.playerName += e.key.toUpperCase();
    }
}

function startGame() {
    Engine.state.showTitleScreen = false;
    Sound.play('start');
    restartGame();
}

function restartGame() {
    Engine.state.score = 0;
    Engine.state.health = 3;
    Engine.state.maxHealth = 3;
    Engine.state.gameOver = false;
    Engine.state.enteringName = false;
    Engine.state.playerName = '';
    Engine.state.newHighScoreRank = -1;
    Engine.particles = [];
    Engine.scorePopups = [];
    // Reset all inputs
    GAME.controls.forEach(ctrl => { Engine.input[ctrl.id] = false; });
    // Call game-specific init
    if (typeof gameInit === 'function') gameInit();
}
