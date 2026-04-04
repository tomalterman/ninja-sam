// ==================== TITLE, GAME OVER, NAME ENTRY SCREENS ====================

const touchKeyboard = {
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    btnSize: 20,
    gap: 2,
    cols: 9,
    startX: 0,
    startY: 92
};

function drawTitleScreen(ctx) {
    const w = GAME.width;
    const h = GAME.height;
    const time = Date.now() / 1000;
    const centerX = w / 2;

    // Let game draw custom title art behind text
    if (typeof gameTitleRender === 'function') {
        gameTitleRender(ctx, w, h, time);
    }

    // Title shadow
    ctx.fillStyle = '#000';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(GAME.title, centerX + 2, h / 2 - 20 + 2);

    // Title text
    ctx.fillStyle = '#ff4757';
    ctx.fillText(GAME.title, centerX, h / 2 - 20);

    // Title highlight
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(GAME.title, centerX - 1, h / 2 - 21);

    // Subtitle
    if (GAME.subtitle) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(GAME.subtitle, centerX, h / 2 - 2);
    }

    // Prompt (blinking)
    if (Math.sin(time * 3) > 0) {
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '10px monospace';
        ctx.fillText('Press any key or tap to start', centerX, h / 2 + 25);
    }

    // Version
    ctx.fillStyle = '#555';
    ctx.font = '8px monospace';
    ctx.fillText(GAME.version, centerX, h - 8);

    ctx.textAlign = 'left';
}

function drawUI(ctx) {
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE: ' + String(Engine.state.score).padStart(6, '0'), 10, 20);

    // Health (hearts)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff4757';
    ctx.font = '14px monospace';
    for (let i = 0; i < Engine.state.maxHealth; i++) {
        const x = GAME.width - 16 - i * 18;
        const y = 14;
        if (i < Engine.state.health) {
            // Filled heart
            drawHeart(ctx, x, y, 6, '#ff4757');
        } else {
            // Empty heart
            drawHeart(ctx, x, y, 6, '#333');
        }
    }
    ctx.textAlign = 'left';
}

function drawHeart(ctx, cx, cy, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const x = cx - size;
    const y = cy - size * 0.5;
    ctx.moveTo(cx, y + size * 1.5);
    ctx.bezierCurveTo(cx - size * 2, y - size * 0.5, cx - size * 2, y + size, cx, y + size * 1.5);
    ctx.moveTo(cx, y + size * 1.5);
    ctx.bezierCurveTo(cx + size * 2, y - size * 0.5, cx + size * 2, y + size, cx, y + size * 1.5);
    ctx.fill();
}

function drawGameOverScreen(ctx) {
    const w = GAME.width;
    const h = GAME.height;

    // Let game draw behind overlay
    if (typeof gameOverRender === 'function') {
        gameOverRender(ctx, w, h);
    }

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';

    if (Engine.state.enteringName) {
        // GAME OVER
        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('GAME OVER', w / 2, 22);

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('SCORE: ' + Engine.state.score, w / 2, 40);

        // New high score
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('NEW HIGH SCORE!', w / 2, 56);

        // Name entry boxes
        ctx.font = 'bold 14px monospace';
        const displayName = Engine.state.playerName.padEnd(3, '_');
        const startX = w / 2 - 30;
        for (let i = 0; i < 3; i++) {
            const letterX = startX + i * 20;
            ctx.fillStyle = i < Engine.state.playerName.length ? '#5c6bc0' : '#333';
            ctx.fillRect(letterX, 65, 18, 20);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(displayName[i], letterX + 9, 80);
        }

        drawTouchKeyboard(ctx);

        // Skip hint
        ctx.fillStyle = '#666';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ESC to skip', w / 2, h - 8);
    } else {
        // Standard game over
        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('FINAL SCORE: ' + Engine.state.score, w / 2, h / 2 + 10);

        ctx.font = '10px monospace';
        ctx.fillText('Press SPACE or tap to play again', w / 2, h / 2 + 35);
    }

    ctx.textAlign = 'left';
}

// ==================== TOUCH KEYBOARD ====================

function drawTouchKeyboard(ctx) {
    const btnSize = 20;
    const gap = 2;
    const cols = 9;
    const startX = (GAME.width - (cols * (btnSize + gap))) / 2;
    const startY = 92;

    touchKeyboard.startX = startX;
    touchKeyboard.startY = startY;
    touchKeyboard.btnSize = btnSize;
    touchKeyboard.gap = gap;
    touchKeyboard.cols = cols;

    // Letter buttons (3 rows)
    for (let i = 0; i < 26; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = startX + col * (btnSize + gap);
        const y = startY + row * (btnSize + gap);

        ctx.fillStyle = '#444';
        ctx.fillRect(x, y, btnSize, btnSize);
        ctx.fillStyle = '#666';
        ctx.fillRect(x, y, btnSize, 2);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(touchKeyboard.letters[i], x + btnSize / 2, y + btnSize / 2 + 4);
    }

    // Bottom row: DEL, SKIP, OK
    const bottomY = startY + 3 * (btnSize + gap);

    // DEL
    ctx.fillStyle = '#833';
    ctx.fillRect(startX, bottomY, btnSize * 2, btnSize);
    ctx.fillStyle = '#a55';
    ctx.fillRect(startX, bottomY, btnSize * 2, 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('DEL', startX + btnSize, bottomY + btnSize / 2 + 4);

    // SKIP
    const skipX = startX + 2 * (btnSize + gap) + gap;
    ctx.fillStyle = '#555';
    ctx.fillRect(skipX, bottomY, btnSize * 3, btnSize);
    ctx.fillStyle = '#777';
    ctx.fillRect(skipX, bottomY, btnSize * 3, 2);
    ctx.fillStyle = '#ccc';
    ctx.fillText('SKIP', skipX + (btnSize * 3) / 2, bottomY + btnSize / 2 + 4);

    // OK
    const okX = startX + 6 * (btnSize + gap);
    const okEnabled = Engine.state.playerName.length === 3;
    ctx.fillStyle = okEnabled ? '#383' : '#333';
    ctx.fillRect(okX, bottomY, btnSize * 3, btnSize);
    if (okEnabled) {
        ctx.fillStyle = '#5a5';
        ctx.fillRect(okX, bottomY, btnSize * 3, 2);
    }
    ctx.fillStyle = okEnabled ? '#fff' : '#666';
    ctx.fillText('OK', okX + (btnSize * 3) / 2, bottomY + btnSize / 2 + 4);

    ctx.fillStyle = '#888';
    ctx.font = '8px monospace';
    ctx.fillText('Tap or type letters', GAME.width / 2, bottomY + btnSize + 12);
    ctx.textAlign = 'left';
}

function handleKeyboardTouch(canvasX, canvasY) {
    if (!Engine.state.enteringName) return;

    const kb = touchKeyboard;
    const btnSize = kb.btnSize;
    const gap = kb.gap;
    const cols = kb.cols;
    const startX = kb.startX;
    const startY = kb.startY;

    // Letter buttons
    for (let i = 0; i < 26; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = startX + col * (btnSize + gap);
        const y = startY + row * (btnSize + gap);
        if (canvasX >= x && canvasX < x + btnSize && canvasY >= y && canvasY < y + btnSize) {
            if (Engine.state.playerName.length < 3) {
                Engine.state.playerName += kb.letters[i];
            }
            return;
        }
    }

    const bottomY = startY + 3 * (btnSize + gap);

    // DEL
    if (canvasX >= startX && canvasX < startX + btnSize * 2 &&
        canvasY >= bottomY && canvasY < bottomY + btnSize) {
        if (Engine.state.playerName.length > 0) {
            Engine.state.playerName = Engine.state.playerName.slice(0, -1);
        }
        return;
    }

    // SKIP
    const skipX = startX + 2 * (btnSize + gap) + gap;
    if (canvasX >= skipX && canvasX < skipX + btnSize * 3 &&
        canvasY >= bottomY && canvasY < bottomY + btnSize) {
        Engine.state.enteringName = false;
        return;
    }

    // OK
    const okX = startX + 6 * (btnSize + gap);
    if (canvasX >= okX && canvasX < okX + btnSize * 3 &&
        canvasY >= bottomY && canvasY < bottomY + btnSize) {
        if (Engine.state.playerName.length === 3) {
            HighScores.add(Engine.state.playerName, Engine.state.score, Engine.state.newHighScoreRank);
            Engine.state.enteringName = false;
        }
        return;
    }
}
