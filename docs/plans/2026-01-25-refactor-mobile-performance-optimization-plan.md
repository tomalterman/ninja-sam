---
title: Mobile Browser Performance Optimization
type: refactor
date: 2026-01-25
---

# Mobile Browser Performance Optimization

## Overview

Optimize Ninja Sam to run smoothly on mobile web browsers by reducing draw calls, implementing delta-time frame rate independence, caching calculations, and reducing garbage collection pressure.

**Critical constraint: Zero visual regression.** All animations, effects, and visual polish must be preserved exactly.

## Previous Attempt (Reverted)

A previous optimization attempt (commit `2767f61`) was reverted because it sacrificed visual quality for performance:

**What was tried:**
- Removed bandana tail wave animations
- Simplified sword flames (removed `Date.now()` timing)
- Reduced slash trail to single rectangle
- Removed rotation from death/hit animations
- Converted health stars to simple rectangles
- Reduced particle counts

**Why it was reverted:**
The visual polish matters. The game looked noticeably worse, even if it ran faster. Leo (age 6) and Tom built these details together - they're not optional.

**This plan takes a different approach:**
Instead of removing visual features, we optimize *how* they're rendered without changing *what* is rendered. Caching, pre-calculation, and pooling achieve performance gains while preserving every animation frame.

## Reviewer Feedback (2026-01-25)

Three reviewers analyzed this plan. Their consensus:

**DHH:** "Six phases for a 2000-line game is over-engineered. You haven't proven you have a performance problem. Implement delta time only, then ship and see if anyone complains."

**Kieran:** "PASS with concerns. Skip Phase 2 for robots (animation makes caching complex). Phase 3 is pure win. Test delta-time extensively - missing even one `* deltaTime` causes subtle bugs."

**Simplicity:** "75% of this plan should be removed. Measure first. The game has ~100 objects max - modern mobile browsers handle this fine."

**Resolution:** Add Phase 0 (measurement). Implement Phase 1 for correctness. Defer Phases 2-6 until measurements justify them.

## Problem Statement

The game currently runs at 60fps on desktop but may experience stuttering or frame drops on mobile browsers due to:
1. **~50-80 draw calls per frame** from procedural sprite rendering
2. **No frame rate independence** - physics tied to 60fps assumption
3. **Repeated Math.sin/cos calculations** in hot paths (flames, animations)
4. **Object allocations in game loop** creating GC pressure
5. **No dirty rendering** - full redraw every frame

## Proposed Solution

Implement performance optimizations in order of impact, maintaining the procedural art style while reducing CPU/GPU load.

## Technical Approach

### Phase 0: Measure Performance (Required First)

**Problem:** We assume mobile performance issues exist but have no data.

**Solution:** Add frame timing measurement and test on real devices before optimizing.

```javascript
// Add temporarily to game loop for measurement
let slowFrameCount = 0;
function gameLoop(currentTime) {
    const frameStart = performance.now();

    // ... existing game loop code ...

    const frameTime = performance.now() - frameStart;
    if (frameTime > 16.67) {
        slowFrameCount++;
        console.log(`Slow frame #${slowFrameCount}: ${frameTime.toFixed(1)}ms`);
    }
}
```

**Test on real devices:**
- iPhone Safari (not simulator)
- Chrome for Android (mid-range phone)
- Play for 2-3 minutes with active gameplay

**Decision gate:**
- If <5% slow frames → Skip to Phase 1 only (correctness fix)
- If 5-15% slow frames → Implement Phases 1-3
- If >15% slow frames → Implement full plan

---

### Phase 1: Frame Rate Independence (Correctness Fix) ✅ IMPLEMENT

> **Note:** This is a BUG FIX, not an optimization. On 120Hz displays, the game currently runs too fast. This phase is required regardless of Phase 0 measurements.

**Problem:** Game speed is tied to 60fps. On slower devices, physics slow down; on 120Hz screens, they speed up.

**Solution:** Implement delta-time based updates.

```javascript
// index.html:572-586 - Game Loop
let lastTime = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    if (!game.running) return;

    // Calculate delta time (capped to prevent spiral of death)
    const deltaTime = Math.min((currentTime - lastTime) / FRAME_TIME, 3);
    lastTime = currentTime;

    if (!game.gameOver) {
        update(deltaTime);
    }

    render();
}
```

**Files to modify:**
- `index.html:572-586` - gameLoop function
- `index.html:588-624` - update() to accept deltaTime
- `index.html:626-700` - updateNinja() physics
- `index.html:729-748` - updateRobots() movement
- `index.html:776-792` - updateFruit() movement
- `index.html:996-1020` - particle/popup updates

### Phase 2: Off-Screen Canvas Caching (High Impact) ⏸️ DEFERRED

> **Deferred until:** Phase 0 measurements show >5% slow frames

**Problem:** Ninja sprite requires 60+ fillRect/arc calls every frame. The sprite rarely changes.

**Solution:** Pre-render static portions to off-screen canvases.

```javascript
// Cache structure
const spriteCache = {
    ninja: {
        body: null,      // OffscreenCanvas for body/clothes
        dirty: true
    },
    robots: {
        tall: null,      // OffscreenCanvas for tall robot
        small: null      // OffscreenCanvas for small robot
    },
    fruits: {},          // Keyed by fruit type name
    initialized: false
};

function initSpriteCache() {
    // Create off-screen canvases for static sprites
    spriteCache.robots.tall = new OffscreenCanvas(32, 44);
    spriteCache.robots.small = new OffscreenCanvas(28, 32);

    // Pre-render robot sprites (they don't animate much)
    renderRobotToCache('tall');
    renderRobotToCache('small');

    // Pre-render fruit sprites
    for (const fruitType of FRUIT_TYPES) {
        spriteCache.fruits[fruitType.name] = new OffscreenCanvas(24, 24);
        renderFruitToCache(fruitType);
    }

    spriteCache.initialized = true;
}
```

**Benefits:**
- Robot rendering: 15+ calls → 1 drawImage call
- Fruit rendering: 10+ calls → 1 drawImage call
- Estimated 50% reduction in draw calls

**Files to modify:**
- `index.html` - Add sprite cache initialization after line 390
- `index.html:1436-1469` - drawRobot() to use cached sprites
- `index.html:1471-1562` - drawFruit() to use cached sprites

### Phase 3: Reduce Flame/Trail Calculations (Medium Impact) ⏸️ DEFERRED

> **Deferred until:** Phase 0 measurements show >5% slow frames
> **Reviewer note (Kieran):** "This is the cleanest optimization - pure win, no risk."

**Problem:** Flames use `Date.now()` and `Math.sin()` repeatedly in tight loops.

**Solution:** Pre-calculate frame-based animation values once per frame.

```javascript
// Add to game state
const frameAnimations = {
    flameTimer: 0,
    flicker: 0,
    tipFlicker: 0,
    tailWave: 0,
    tailWave2: 0
};

// Calculate once per frame in update()
function updateAnimationTimers() {
    const time = performance.now() / 80;
    frameAnimations.flameTimer = time;
    frameAnimations.flicker = ((time * 1.6) % 4) - 2;
    frameAnimations.tipFlicker = ((time * 2) % 4) - 2;
    frameAnimations.tailWave = Math.sin(time * 1.5) * 2;
    frameAnimations.tailWave2 = Math.sin(time * 1.5 + 1) * 2;
}
```

**Files to modify:**
- `index.html:233-258` - Add frameAnimations to game state
- `index.html:588` - Call updateAnimationTimers() in update()
- `index.html:1118-1434` - drawNinja() use pre-calculated values

### Phase 4: Object Pooling for Particles (Medium Impact) ⏸️ DEFERRED

> **Deferred until:** Phase 0 measurements show >15% slow frames
> **Reviewer note (Simplicity):** "Premature optimization. Max 50 particles is trivial for modern JS engines."

**Problem:** `particles.push()` and `particles.splice()` create garbage collection pressure.

**Solution:** Implement object pooling for particles.

```javascript
// Particle pool
const particlePool = {
    active: [],
    inactive: [],
    maxParticles: 50  // Cap for mobile
};

function getParticle() {
    if (particlePool.inactive.length > 0) {
        const p = particlePool.inactive.pop();
        particlePool.active.push(p);
        return p;
    }
    if (particlePool.active.length < particlePool.maxParticles) {
        const p = { x: 0, y: 0, vx: 0, vy: 0, size: 0, color: '', life: 0 };
        particlePool.active.push(p);
        return p;
    }
    return null; // Pool exhausted, skip particle
}

function recycleParticle(index) {
    const p = particlePool.active.splice(index, 1)[0];
    particlePool.inactive.push(p);
}
```

**Files to modify:**
- `index.html:346-349` - Replace particles array with pool
- `index.html:908-942` - destroyRobot/destroyFruit use pool
- `index.html:996-1007` - updateParticles use pool

### Phase 5: Reduce Background Redraws (Low Impact) ⏸️ DEFERRED

> **Deferred until:** Phase 0 measurements show >15% slow frames
> **Reviewer note (Kieran):** "Consider skipping - stars are ~20 fillRect calls. Parallax elements can't be cached anyway."

**Problem:** Static background elements (stars, moon) redrawn every frame.

**Solution:** Render static background to separate canvas layer once.

```javascript
// Static background layer
let staticBgCanvas = null;
let staticBgCtx = null;

function initStaticBackground() {
    staticBgCanvas = document.createElement('canvas');
    staticBgCanvas.width = CONFIG.BASE_WIDTH;
    staticBgCanvas.height = CONFIG.BASE_HEIGHT;
    staticBgCtx = staticBgCanvas.getContext('2d');

    // Draw static elements once
    staticBgCtx.fillStyle = CONFIG.COLORS.SKY;
    staticBgCtx.fillRect(0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);

    // Stars
    staticBgCtx.fillStyle = '#ffffff';
    for (const star of background.stars) {
        staticBgCtx.fillRect(star.x, star.y, star.size, star.size);
    }

    // Moon
    staticBgCtx.fillStyle = '#f5f5dc';
    staticBgCtx.fillRect(310, 25, 20, 20);
}
```

**Files to modify:**
- `index.html:391-414` - init() call initStaticBackground()
- `index.html:1035-1041` - render() use cached background
- `index.html:1076-1103` - drawBackground() skip static elements

### Phase 6: Mobile-Specific Optimizations (Low Impact) ❌ SKIP UNLESS DESPERATE

> **Only implement if:** All other phases fail to achieve acceptable performance AND explicit approval given
> **Warning:** This is the ONLY phase that changes visuals. Previous attempt to reduce visuals was reverted.

**Reduce particle count on mobile:**
```javascript
const isMobile = 'ontouchstart' in window;
const particleMultiplier = isMobile ? 0.5 : 1;

// In destroyRobot/destroyFruit:
const particleCount = Math.floor(8 * particleMultiplier);
```

**Reduce slash trail segments on mobile:**
```javascript
// Already partially implemented at line 1412
// Reduce from 5 to 3 segments on mobile
const trailSegments = isMobile ? 3 : 5;
```

**Files to modify:**
- `index.html:391-414` - init() detect mobile
- `index.html:908-942` - particle counts
- `index.html:1407-1431` - slash trail

## Acceptance Criteria

### Functional Requirements
- [ ] Game plays identically on 60Hz and 120Hz displays
- [ ] **ZERO visual regression** - all animations preserved exactly:
  - [ ] Bandana tails wave in the wind
  - [ ] Sword flames flicker dynamically
  - [ ] Slash trail shows full arc with multiple segments
  - [ ] Death animation includes rotation
  - [ ] Hit reaction includes shake and tilt
  - [ ] Health displayed as ninja stars (not rectangles)
- [ ] All collision detection works correctly
- [ ] High score system unaffected

### Performance Requirements
- [ ] Consistent 60fps on mid-range mobile devices (2022 or newer)
- [ ] Draw calls reduced by 40%+ (measurable via Chrome DevTools)
- [ ] No frame drops during intense particle effects
- [ ] Memory usage stable (no GC pauses)

### Quality Gates
- [ ] Test on iPhone Safari (iOS 15+)
- [ ] Test on Chrome for Android
- [ ] Test on Firefox mobile
- [ ] Verify touch controls still responsive
- [ ] Leo playtests and approves (age 6 UX test!)

## Implementation Priority

| Phase | Status | Trigger |
|-------|--------|---------|
| 0. Measure Performance | ✅ **DONE** | Always required |
| 1. Frame Rate Independence | ✅ **DONE** | Always required (bug fix) |
| 2. Sprite Caching | ⏸️ Deferred | If >5% slow frames |
| 3. Animation Timer Caching | ⏸️ Deferred | If >5% slow frames |
| 4. Particle Pooling | ⏸️ Deferred | If >15% slow frames |
| 5. Static Background Layer | ⏸️ Deferred | If >15% slow frames |
| 6. Mobile Particle Reduction | ❌ Skip | Last resort only |

**Strategy:**
1. Run Phase 0 measurements on real mobile devices
2. Implement Phase 1 (correctness fix, always needed)
3. Re-measure after Phase 1
4. Only proceed to Phases 2-5 if measurements justify them
5. Never implement Phase 6 unless all else fails

## Dependencies & Prerequisites

- None - single-file game with no external dependencies
- Test device with Chrome DevTools for Performance profiling

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual regression | **Critical** - plan rejected | Compare screenshots before/after each phase |
| OffscreenCanvas not supported | Sprite caching fails | Fallback to direct rendering |
| Delta time causes physics bugs | Gameplay affected | Cap deltaTime, extensive testing |
| Cache invalidation bugs | Visual glitches | Mark dirty when state changes |

**Note on Phase 6:** Mobile particle reduction is the only phase that visibly changes the game. Consider skipping it entirely if Phases 1-5 achieve acceptable performance. Only implement if absolutely necessary, and get explicit approval first.

## References

### Git History
- `2767f61` - Previous optimization attempt (reverted)
- `0ff4035` - Revert commit restoring visual quality
- `6def355` - Original optimization commit

### Internal References
- `index.html:572-586` - Current game loop
- `index.html:1118-1434` - Ninja rendering (most complex)
- `index.html:1407-1431` - Existing mobile optimization comment

### External References
- [MDN OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [Delta Time Game Loop](https://gafferongames.com/post/fix_your_timestep/)
- [Canvas Performance Tips](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
