// ==================== CANVAS & SCALING ====================

function setupCanvas() {
    Engine.canvas = document.getElementById('gameCanvas');
    Engine.ctx = Engine.canvas.getContext('2d');
    Engine.canvas.width = GAME.width;
    Engine.canvas.height = GAME.height;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Set page background and title
    document.body.style.background = GAME.bgColor;
    document.title = GAME.title;
}

function resizeCanvas() {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isLandscapeTablet = isTouchDevice && window.innerWidth >= 700 && window.innerWidth > window.innerHeight;

    let maxWidth, maxHeight;

    if (isLandscapeTablet) {
        maxWidth = window.innerWidth;
        maxHeight = window.innerHeight;
    } else {
        maxWidth = window.innerWidth - 20;
        const reservedHeight = isTouchDevice ? 120 : 180;
        maxHeight = window.innerHeight - reservedHeight;
    }

    let scale = Math.min(
        maxWidth / GAME.width,
        maxHeight / GAME.height
    );

    if (isLandscapeTablet) {
        scale = Math.max(1, scale);
    } else {
        scale = Math.max(1, Math.floor(scale));
    }

    Engine.canvas.style.width = (GAME.width * scale) + 'px';
    Engine.canvas.style.height = (GAME.height * scale) + 'px';
}
