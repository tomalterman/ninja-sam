// ==================== GAME LOGIC: BLOCK DODGE ====================
// Replace this entire file with your own game.
//
// You must implement:
//   gameInit()              - called on game start and restart
//   gameUpdate(dt)          - called every frame (dt=1.0 at 60fps)
//   gameRender(ctx, w, h)   - called every frame to draw your game
//
// Optional:
//   gameTitleRender(ctx, w, h, time) - custom title screen art
//   gameOverRender(ctx, w, h)       - custom game over art
//
// Engine API:
//   Engine.input[id]                           - boolean, matches GAME.controls ids
//   Engine.state.score                         - set this to update score
//   Engine.state.health                        - set to 0 to trigger game over
//   Engine.state.maxHealth                     - max health (for heart display)
//   Engine.Sound.play('soundName')             - play a sound from SOUNDS
//   Engine.spawnParticle(x,y,vx,vy,sz,col,life) - spawn a particle
//   Engine.showScorePopup(x,y,text,color)      - floating score text

// Game-specific state
let player = {};
let blocks = [];
let survivalTime = 0;
let difficulty = 1;
let nextScoreMilestone = 50;

const GROUND_Y = 190;
const PLAYER_W = 20;
const PLAYER_H = 24;
const PLAYER_SPEED = 4;

function gameInit() {
    Engine.state.health = 3;
    Engine.state.maxHealth = 3;
    Engine.state.score = 0;

    player = {
        x: GAME.width / 2,
        y: GROUND_Y,
        w: PLAYER_W,
        h: PLAYER_H,
        invincible: 60
    };

    blocks = [];
    survivalTime = 0;
    difficulty = 1;
    nextScoreMilestone = 50;
}

function gameUpdate(dt) {
    // Move player
    if (Engine.input.left) {
        player.x -= PLAYER_SPEED * dt;
    }
    if (Engine.input.right) {
        player.x += PLAYER_SPEED * dt;
    }
    // Clamp to screen
    player.x = Math.max(player.w / 2, Math.min(GAME.width - player.w / 2, player.x));

    // Invincibility countdown
    if (player.invincible > 0) player.invincible -= dt;

    // Survival scoring
    survivalTime += dt;
    if (Math.floor(survivalTime / 60) > Math.floor((survivalTime - dt) / 60)) {
        Engine.state.score += 1;
    }

    // Difficulty ramp: increases every 30 seconds
    difficulty = 1 + Math.floor(survivalTime / 1800) * 0.5 + (survivalTime % 1800) / 1800 * 0.3;

    // Score milestones
    if (Engine.state.score >= nextScoreMilestone) {
        Sound.play('milestone');
        Engine.showScorePopup(GAME.width / 2, GAME.height / 2 - 20, nextScoreMilestone + '!', '#ffd700');
        nextScoreMilestone += 50;
    }

    // Spawn blocks
    const spawnRate = Math.max(8, 40 - difficulty * 8);
    if (Math.random() * spawnRate < dt) {
        const bw = 12 + Math.random() * 20;
        blocks.push({
            x: Math.random() * (GAME.width - bw),
            y: -20,
            w: bw,
            h: 12 + Math.random() * 8,
            speed: 1.5 + Math.random() * difficulty,
            color: randomBlockColor()
        });
    }

    // Update blocks
    for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        b.y += b.speed * dt;

        // Off screen
        if (b.y > GAME.height + 20) {
            blocks.splice(i, 1);
            continue;
        }

        // Collision with player
        if (player.invincible <= 0 && boxOverlap(
            player.x - player.w / 2, player.y - player.h,
            player.w, player.h,
            b.x, b.y, b.w, b.h
        )) {
            Engine.state.health--;
            player.invincible = 90;
            Sound.play('hit');

            // Impact particles
            for (let j = 0; j < 8; j++) {
                Engine.spawnParticle(
                    b.x + b.w / 2, b.y + b.h / 2,
                    (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4,
                    3 + Math.random() * 3, b.color, 20 + Math.random() * 15
                );
            }

            blocks.splice(i, 1);
        }
    }
}

function gameRender(ctx, w, h) {
    // Ground
    ctx.fillStyle = '#333355';
    ctx.fillRect(0, GROUND_Y, w, h - GROUND_Y);
    ctx.fillStyle = '#444477';
    ctx.fillRect(0, GROUND_Y, w, 2);

    // Ground pattern
    ctx.fillStyle = '#2a2a44';
    for (let gx = 0; gx < w; gx += 16) {
        ctx.fillRect(gx, GROUND_Y + 6, 8, 4);
        ctx.fillRect(gx + 8, GROUND_Y + 14, 8, 4);
    }

    // Blocks
    for (const b of blocks) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(b.x, b.y, b.w, 2);
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(b.x, b.y + b.h - 2, b.w, 2);
    }

    // Player
    const px = player.x - player.w / 2;
    const py = player.y - player.h;

    // Blink when invincible
    if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 0) {
        return; // Skip drawing player during blink
    }

    // Body
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(px + 2, py + 8, PLAYER_W - 4, PLAYER_H - 8);

    // Head
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(px + 4, py, PLAYER_W - 8, 10);

    // Eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(px + 6, py + 3, 2, 3);
    ctx.fillRect(px + 12, py + 3, 2, 3);

    // Smile
    ctx.fillStyle = '#cc6644';
    ctx.fillRect(px + 7, py + 7, 6, 1);

    // Feet
    ctx.fillStyle = '#335599';
    ctx.fillRect(px + 3, py + PLAYER_H - 4, 5, 4);
    ctx.fillRect(px + PLAYER_W - 8, py + PLAYER_H - 4, 5, 4);
}

function gameTitleRender(ctx, w, h, time) {
    // Falling blocks animation on title screen
    const seed = Math.floor(time * 2);
    for (let i = 0; i < 8; i++) {
        const bx = ((i * 53 + seed * 7) % w);
        const by = ((time * 30 + i * 40) % (h + 20)) - 20;
        const bw = 10 + (i % 3) * 8;
        const bh = 10 + (i % 2) * 6;
        ctx.fillStyle = randomBlockColorFromSeed(i);
        ctx.globalAlpha = 0.3;
        ctx.fillRect(bx, by, bw, bh);
    }
    ctx.globalAlpha = 1;

    // Small player character in the middle
    const px = w / 2 - 10;
    const py = GROUND_Y - PLAYER_H;
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(px + 2, py + 8, PLAYER_W - 4, PLAYER_H - 8);
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(px + 4, py, PLAYER_W - 8, 10);
    ctx.fillStyle = '#222';
    ctx.fillRect(px + 6, py + 3, 2, 3);
    ctx.fillRect(px + 12, py + 3, 2, 3);

    // Ground
    ctx.fillStyle = '#333355';
    ctx.fillRect(0, GROUND_Y, w, h - GROUND_Y);
}

// Helpers
function boxOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function randomBlockColor() {
    const colors = ['#ff4444', '#ff8844', '#ffcc44', '#44cc44', '#4488ff', '#aa44ff', '#ff44aa'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomBlockColorFromSeed(i) {
    const colors = ['#ff4444', '#ff8844', '#ffcc44', '#44cc44', '#4488ff', '#aa44ff', '#ff44aa'];
    return colors[i % colors.length];
}
