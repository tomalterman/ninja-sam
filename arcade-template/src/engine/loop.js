// ==================== GAME LOOP ====================

let _lastTime = 0;
const _TARGET_FPS = 60;
const _FRAME_TIME = 1000 / _TARGET_FPS;

// Debug
const DEBUG = {
    showFps: new URLSearchParams(window.location.search).get('debug') === 'fps',
    fps: 0, fpsFrames: 0, fpsLastTime: 0, frameTime: 0
};

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    if (!Engine.state.running) return;

    const frameStart = performance.now();
    const deltaTime = _lastTime ? Math.min((currentTime - _lastTime) / _FRAME_TIME, 3) : 1;
    _lastTime = currentTime;

    const ctx = Engine.ctx;
    const w = GAME.width;
    const h = GAME.height;

    // Clear canvas
    ctx.fillStyle = GAME.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Title screen
    if (Engine.state.showTitleScreen) {
        drawTitleScreen(ctx);
        return;
    }

    // Update game logic
    if (!Engine.state.gameOver) {
        if (typeof gameUpdate === 'function') {
            gameUpdate(deltaTime);
        }
        updateParticles(deltaTime);
        updateScorePopups(deltaTime);

        // Check for game over
        if (Engine.state.health <= 0) {
            Engine.state.health = 0;
            Engine.state.gameOver = true;
            Sound.play('gameOver');
            Engine.state.newHighScoreRank = HighScores.check(Engine.state.score);
            if (Engine.state.newHighScoreRank >= 0) {
                Engine.state.enteringName = true;
                Engine.state.playerName = HighScores.lastPlayerName;
            }
        }
    }

    // Render game
    if (typeof gameRender === 'function') {
        gameRender(ctx, w, h);
    }

    // Draw engine overlays
    drawParticles(ctx);
    drawScorePopups(ctx);

    if (!Engine.state.gameOver) {
        drawUI(ctx);
    }

    if (Engine.state.gameOver) {
        drawGameOverScreen(ctx);
    }

    // Debug FPS
    if (DEBUG.showFps) {
        DEBUG.frameTime = performance.now() - frameStart;
        DEBUG.fpsFrames++;
        if (currentTime - DEBUG.fpsLastTime >= 1000) {
            DEBUG.fps = DEBUG.fpsFrames;
            DEBUG.fpsFrames = 0;
            DEBUG.fpsLastTime = currentTime;
        }
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(5, h - 25, 55, 20);
        ctx.fillStyle = DEBUG.fps >= 55 ? '#44ff44' : (DEBUG.fps >= 40 ? '#ffff44' : '#ff4444');
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('FPS: ' + DEBUG.fps, 10, h - 10);
    }
}
