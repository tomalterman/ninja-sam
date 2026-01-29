---
title: "feat: Add Blue Lightning Robots with Lightning Power"
type: feat
date: 2026-01-28
---

# Blue Lightning Robots with Lightning Power

## Overview

Add a new enemy type: Blue Lightning Robots! These electric blue robots are dangerous to touch (they zap you!) but if you stomp on them, you gain a super cool lightning power that replaces your sword. The lightning bolt destroys all enemies instantly - except other blue robots, who bounce it back at you!

## How It Works

### Blue Lightning Robots
- Look like regular robots but electric blue with lightning crackling around them
- **Touch them = ZAP!** You lose a star (like other robots)
- **Stomp on them = LIGHTNING POWER!** You get to shoot lightning bolts!

### Lightning Power
- Replaces your sword attack (same button to shoot)
- Shoots a lightning bolt forward across the screen
- **Cooldown:** Can only shoot once per second
- **Destroys all enemies** it hits... except blue robots!

### Blue Robot Bounce-Back
- If you shoot a blue robot, the lightning bolt **bounces back** at you!
- Getting hit by your own bounced lightning:
  - Lose one star
  - Lose the lightning power (back to sword)
- This makes blue robots extra tricky - you can't just zap them!

## Technical Approach

### 1. Add Blue Robot Type

**File:** `index.html:1068-1080` (spawnRobots function)

Add a new robot type `isLightning` alongside existing `isTall`:

```javascript
// In spawnRobots() around line 1068
const isTall = Math.random() < 0.3 + game.difficulty * 0.1;
const isLightning = !isTall && Math.random() < 0.15 + game.difficulty * 0.05; // Only small robots can be lightning

robots.push({
    x: CONFIG.BASE_WIDTH + 40,
    y: CONFIG.GROUND_Y,
    width: isTall ? 28 : 24,
    height: isTall ? 40 : 28,
    isTall: isTall,
    isLightning: isLightning, // NEW
    animFrame: 0,
    animTimer: 0
});
```

### 2. Add Lightning Power State

**File:** `index.html:734-743` (ninja state in resetGame)

Add lightning power state to ninja:

```javascript
// In resetGame() around line 734
ninja.hasLightningPower = false;      // NEW: does ninja have lightning?
ninja.lightningCooldown = 0;          // NEW: time until next shot (60 = 1 second)
```

Also add to game state:

```javascript
let lightningBolts = [];  // NEW: array of active lightning bolts
```

### 3. Lightning Bolt Shooting

**File:** `index.html:934-945` (handleInput function)

Modify slash input to shoot lightning if powered:

```javascript
// In handleInput() slash section
if (game.keys.slash && !game.keys.slashUsed) {
    if (ninja.hasLightningPower && ninja.lightningCooldown <= 0) {
        // Shoot lightning bolt!
        shootLightningBolt();
        ninja.lightningCooldown = 60; // 1 second cooldown
    } else if (!ninja.hasLightningPower && ninja.slashCooldown <= 0 && !ninja.isSlashing) {
        // Normal sword slash
        ninja.isSlashing = true;
        ninja.slashTimer = CONFIG.SLASH_DURATION;
        ninja.slashCooldown = CONFIG.SLASH_COOLDOWN;
        Sound.play('slash');
    }
    game.keys.slashUsed = true;
}
```

### 4. Lightning Bolt Logic

Add new functions:

```javascript
// Shoot a lightning bolt from ninja
function shootLightningBolt() {
    lightningBolts.push({
        x: ninja.x + 20,
        y: ninja.y - 14,
        vx: 8,           // Fast forward movement
        width: 40,
        height: 10,
        life: 120,       // 2 seconds max
        bouncing: false  // True if reflected by blue robot
    });
    Sound.play('lightning'); // Need new sound
}

// Update lightning bolts each frame
function updateLightningBolts(dt) {
    for (let i = lightningBolts.length - 1; i >= 0; i--) {
        const bolt = lightningBolts[i];
        bolt.x += bolt.vx * dt;
        bolt.life -= dt;

        // Remove if off screen or expired
        if (bolt.x > CONFIG.BASE_WIDTH + 50 || bolt.x < -50 || bolt.life <= 0) {
            lightningBolts.splice(i, 1);
            continue;
        }

        // Check collision with ninja (if bouncing)
        if (bolt.bouncing) {
            const ninjaBox = { x: ninja.x - 8, y: ninja.y - ninja.height, width: 16, height: ninja.height };
            const boltBox = { x: bolt.x, y: bolt.y - bolt.height/2, width: bolt.width, height: bolt.height };
            if (boxCollision(ninjaBox, boltBox)) {
                // Ouch! Bounced bolt hit us!
                takeDamage();
                ninja.hasLightningPower = false; // Lose the power
                lightningBolts.splice(i, 1);
                continue;
            }
        }
    }
}
```

### 5. Robot Collision with Lightning

**File:** `index.html:1186-1259` (checkCollisions function)

Add lightning bolt vs robot collision:

```javascript
// In checkCollisions(), after robot loop setup
for (const bolt of lightningBolts) {
    if (bolt.bouncing) continue; // Already bouncing, don't hit robots again

    const boltBox = { x: bolt.x, y: bolt.y - bolt.height/2, width: bolt.width, height: bolt.height };

    for (let i = robots.length - 1; i >= 0; i--) {
        const robot = robots[i];
        const robotBox = {
            x: robot.x - robot.width / 2,
            y: robot.y - robot.height,
            width: robot.width,
            height: robot.height
        };

        if (boxCollision(boltBox, robotBox)) {
            if (robot.isLightning) {
                // Blue robot reflects the bolt!
                bolt.vx = -bolt.vx;  // Reverse direction
                bolt.bouncing = true;
                Sound.play('bounce');
            } else {
                // Destroy the robot!
                destroyRobot(robot, i);
                addScore(50, robot.x, robot.y - robot.height);
            }
            break; // One hit per bolt
        }
    }
}
```

### 6. Gain Lightning Power on Stomp

**File:** `index.html:1205-1211` (stomp collision section)

Modify stomp to grant power:

```javascript
// In checkCollisions() stomp section around line 1205
if (ninja.isJumping && ninja.velocityY > 0 && boxCollision(feetBox, robotHeadBox)) {
    if (robot.isLightning) {
        // Gain lightning power!
        ninja.hasLightningPower = true;
        ninja.lightningCooldown = 0;
        Sound.play('powerup'); // Need new sound
        // Create power-up effect particles
        for (let j = 0; j < 10; j++) {
            particles.push({
                x: ninja.x,
                y: ninja.y - ninja.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 1) * 6,
                size: 3 + Math.random() * 4,
                color: Math.random() < 0.5 ? '#00ffff' : '#ffffff',
                life: 40
            });
        }
    }
    destroyRobot(robot, i, true);
    addScore(robot.isLightning ? 75 : (robot.isTall ? 50 : 25), robot.x, robot.y - robot.height);
    ninja.velocityY = CONFIG.JUMP_FORCE * 0.6;
    continue;
}
```

### 7. Draw Blue Lightning Robot

**File:** `index.html:2241-2424` (drawRobot function)

Add blue robot variant at start of small robot section:

```javascript
// In drawRobot(), inside the small robot else block around line 2370
} else if (robot.isLightning) {
    // === BLUE LIGHTNING ROBOT ===
    const sparkle = Math.sin(Date.now() / 100) * 0.3 + 0.7;

    // Same base shape as small robot but BLUE
    // Legs
    ctx.fillStyle = '#224466';
    const legOffset = Math.sin(robot.animFrame * Math.PI / 2) * 3;
    ctx.fillRect(x - 7 - legOffset, y - 5, 5, 6);
    ctx.fillRect(x + 2 + legOffset, y - 5, 5, 6);
    // Feet
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x - 9 - legOffset, y, 7, 2);
    ctx.fillRect(x + 2 + legOffset, y, 7, 2);

    // Body - electric blue
    ctx.fillStyle = '#336688';
    ctx.fillRect(x - 10, y - 22 + bobY, 20, 18);
    ctx.fillStyle = '#4488cc';
    ctx.fillRect(x - 8, y - 20 + bobY, 16, 14);
    // Chest panel
    ctx.fillStyle = '#224466';
    ctx.fillRect(x - 5, y - 18 + bobY, 10, 8);
    // Power core - BRIGHT CYAN
    ctx.fillStyle = `rgba(0, 255, 255, ${sparkle})`;
    ctx.fillRect(x - 3, y - 16 + bobY, 6, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 1, y - 14 + bobY, 2, 2);

    // Head - blue tint
    ctx.fillStyle = '#446688';
    ctx.fillRect(x - 8, y - 28 + bobY, 16, 8);
    ctx.fillStyle = '#4488cc';
    ctx.fillRect(x - 6, y - 26 + bobY, 12, 4);
    // Eyes - GLOWING
    ctx.fillStyle = '#112233';
    ctx.fillRect(x - 5, y - 26 + bobY, 10, 3);
    ctx.fillStyle = `rgba(0, 255, 255, ${sparkle})`;
    ctx.fillRect(x - 4, y - 25 + bobY, 3, 2);
    ctx.fillRect(x + 1, y - 25 + bobY, 3, 2);

    // Antenna with lightning effect
    ctx.fillStyle = '#446688';
    ctx.fillRect(x - 1, y - 32 + bobY, 2, 4);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x - 2, y - 34 + bobY, 4, 3);

    // Arms - blue
    ctx.fillStyle = '#336688';
    ctx.fillRect(x - 13, y - 18 + bobY, 4, 10);
    ctx.fillRect(x + 9, y - 18 + bobY, 4, 10);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x - 13, y - 10 + bobY, 4, 3);
    ctx.fillRect(x + 9, y - 10 + bobY, 4, 3);

    // Lightning crackle effect around body
    ctx.strokeStyle = `rgba(0, 255, 255, ${sparkle * 0.8})`;
    ctx.lineWidth = 1;
    const t = Date.now() / 50;
    for (let arc = 0; arc < 3; arc++) {
        const startY = y - 25 + arc * 8 + bobY;
        ctx.beginPath();
        ctx.moveTo(x - 12, startY);
        ctx.lineTo(x - 8 + Math.sin(t + arc) * 3, startY + 2);
        ctx.lineTo(x - 14, startY + 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 12, startY);
        ctx.lineTo(x + 8 + Math.sin(t + arc) * 3, startY + 2);
        ctx.lineTo(x + 14, startY + 4);
        ctx.stroke();
    }
} else {
    // === SMALL SCOUT ROBOT === (existing code)
```

### 8. Draw Lightning Bolt

Add new drawing function:

```javascript
function drawLightningBolt(bolt) {
    const ctx = game.ctx;
    ctx.save();

    const flicker = Math.random() * 0.3 + 0.7;

    // Main bolt body
    ctx.strokeStyle = `rgba(0, 255, 255, ${flicker})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(bolt.x, bolt.y);

    // Jagged lightning path
    const segments = 5;
    const segmentWidth = bolt.width / segments;
    for (let i = 1; i <= segments; i++) {
        const jag = (i % 2 === 0) ? 4 : -4;
        ctx.lineTo(bolt.x + i * segmentWidth, bolt.y + jag);
    }
    ctx.stroke();

    // Bright core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bolt.x, bolt.y);
    for (let i = 1; i <= segments; i++) {
        const jag = (i % 2 === 0) ? 4 : -4;
        ctx.lineTo(bolt.x + i * segmentWidth, bolt.y + jag);
    }
    ctx.stroke();

    // Glow effect
    ctx.strokeStyle = `rgba(0, 255, 255, 0.3)`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(bolt.x, bolt.y);
    for (let i = 1; i <= segments; i++) {
        const jag = (i % 2 === 0) ? 4 : -4;
        ctx.lineTo(bolt.x + i * segmentWidth, bolt.y + jag);
    }
    ctx.stroke();

    ctx.restore();
}
```

### 9. Draw Lightning Power Indicator

Show when ninja has power and cooldown:

```javascript
// In drawUI() around line 2544, after health stars
if (ninja.hasLightningPower) {
    // Draw lightning icon below stars
    const iconX = 20;
    const iconY = 35;
    const ready = ninja.lightningCooldown <= 0;

    ctx.fillStyle = ready ? '#00ffff' : '#446688';
    // Simple lightning bolt shape
    ctx.beginPath();
    ctx.moveTo(iconX, iconY);
    ctx.lineTo(iconX + 6, iconY);
    ctx.lineTo(iconX + 2, iconY + 6);
    ctx.lineTo(iconX + 8, iconY + 6);
    ctx.lineTo(iconX - 2, iconY + 16);
    ctx.lineTo(iconX + 2, iconY + 8);
    ctx.lineTo(iconX - 4, iconY + 8);
    ctx.closePath();
    ctx.fill();

    // "READY" or cooldown number
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px monospace';
    if (ready) {
        ctx.fillText('ZAP!', iconX + 12, iconY + 10);
    } else {
        const seconds = Math.ceil(ninja.lightningCooldown / 60);
        ctx.fillText(seconds + 's', iconX + 12, iconY + 10);
    }
}
```

### 10. Add Sound Effects

**File:** `index.html:330-366` (Sound.play function)

Add new sounds:

```javascript
case 'lightning':
    // Electric zap sound
    this.playTone(800, 1200, 0.15, 'sawtooth', 0.3);
    this.playNoise(0.1, 2000, 500);
    break;
case 'powerup':
    // Ascending power-up jingle
    this.playTone(400, 600, 0.1, 'square', 0.3);
    setTimeout(() => this.playTone(600, 800, 0.1, 'square', 0.3), 80);
    setTimeout(() => this.playTone(800, 1000, 0.15, 'square', 0.3), 160);
    break;
case 'bounce':
    // Deflection sound
    this.playTone(600, 200, 0.1, 'square', 0.4);
    break;
```

### 11. Update Game Loop

**File:** `index.html:952-963` (game loop update section)

Add lightning bolt updates:

```javascript
// In update loop after updateRobots
updateLightningBolts(dt);
ninja.lightningCooldown = Math.max(0, ninja.lightningCooldown - dt);
```

**File:** `index.html:1472-1475` (render section)

Draw lightning bolts:

```javascript
// After drawing robots
for (const bolt of lightningBolts) {
    drawLightningBolt(bolt);
}
```

## Acceptance Criteria

- [x] Blue lightning robots spawn occasionally (rarer than regular robots)
- [x] Blue robots have electric blue color with crackling lightning effect
- [x] Touching a blue robot damages ninja (like other robots)
- [x] Stomping a blue robot grants lightning power with visual/audio feedback
- [x] Lightning power replaces sword attack
- [x] Lightning bolt shoots forward and destroys non-blue robots
- [x] Lightning can only fire once per second (cooldown shown in UI)
- [x] Lightning bounces back from blue robots
- [x] Getting hit by bounced lightning causes damage AND removes power
- [x] UI shows lightning power icon and cooldown state
- [x] All new sounds work (lightning, powerup, bounce)

## Files to Modify

- `index.html:1068-1080` - Robot spawning (add isLightning property)
- `index.html:734-743` - Ninja state (add hasLightningPower, lightningCooldown)
- `index.html:934-945` - Input handling (lightning vs sword)
- `index.html:1186-1259` - Collision detection (lightning bolt collisions)
- `index.html:1205-1211` - Stomp collision (grant power)
- `index.html:2241-2424` - Robot drawing (blue robot variant)
- `index.html:2544` - UI drawing (power indicator)
- `index.html:330-366` - Sound effects (new sounds)
- `index.html:952-963` - Game loop (update lightning bolts)
- `index.html:1472-1475` - Render loop (draw lightning bolts)

## New Code to Add

- `let lightningBolts = [];` - Global array for active bolts
- `shootLightningBolt()` - Create new lightning bolt
- `updateLightningBolts(dt)` - Move bolts, check collisions
- `drawLightningBolt(bolt)` - Render lightning effect
- Lightning power UI drawing section
