// ==================== PARTICLES & SCORE POPUPS ====================

function updateParticles(dt) {
    for (let i = Engine.particles.length - 1; i >= 0; i--) {
        const p = Engine.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) Engine.particles.splice(i, 1);
    }
}

function drawParticles(ctx) {
    for (const p of Engine.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
}

function updateScorePopups(dt) {
    for (let i = Engine.scorePopups.length - 1; i >= 0; i--) {
        const popup = Engine.scorePopups[i];
        popup.y -= 0.5 * dt;
        popup.life -= dt;
        if (popup.life <= 0) Engine.scorePopups.splice(i, 1);
    }
}

function drawScorePopups(ctx) {
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    for (const popup of Engine.scorePopups) {
        ctx.fillStyle = popup.color || '#ffd700';
        ctx.globalAlpha = Math.max(0, popup.life / popup.maxLife);
        ctx.fillText(popup.text, popup.x, popup.y);
    }
    ctx.globalAlpha = 1;
}
