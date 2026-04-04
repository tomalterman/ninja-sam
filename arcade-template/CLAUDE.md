# Arcade Game Template

A reusable single-file HTML template for arcade-style games.

## Structure

This is a template - the `index.html` contains a working example game ("Block Dodge") that demonstrates the template. To create a new game, copy `index.html` and replace the game-specific sections.

### Sections in index.html
1. **GAME CONFIGURATION** - Edit: game name, colors, Firebase, controls
2. **TEMPLATE ENGINE** - Don't edit: canvas, game loop, input, sound, high scores
3. **GAME SOUNDS** - Edit: sound definitions
4. **GAME LOGIC** - Replace: your game code

## Versioning

Before each push:
1. Increment `version` in the GAME config (v1 -> v2 -> v3...)
2. Start commit message with the version (e.g., `v2: Add new feature`)

## Game Contract

Games must implement:
- `gameInit()` - Setup entities, set Engine.state.health/maxHealth/score
- `gameUpdate(dt)` - Per-frame logic, update Engine.state.score/health
- `gameRender(ctx, w, h)` - Draw the game world

Optional:
- `gameTitleRender(ctx, w, h, time)` - Custom title screen art
- `gameOverRender(ctx, w, h)` - Custom game over art

## Decision Making

- Prefer action over questions
- Keep games age-appropriate and fun for a 6-year-old
- Use procedural graphics (Canvas API) - no image files
- All sounds are procedural (Web Audio API) - no audio files
