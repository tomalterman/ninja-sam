# Arcade Game Template

A single-file HTML template for building retro arcade-style games with built-in high scores, touch controls, sound, and responsive layout. No build tools required - just edit one file and deploy.

Extracted from [Ninja Sam](https://github.com/tomalterman/ninja-sam), a game built by Tom and Leo.

## Quick Start

1. Copy `index.html` to a new folder (or repo)
2. Open it in a browser - you'll see the example "Block Dodge" game
3. Edit the `GAME CONFIGURATION` section to change the game name, controls, and colors
4. Replace the `GAME LOGIC` section with your own game
5. Set up Firebase for global high scores (see below)
6. Deploy anywhere that serves static HTML

## What the Template Gives You

| Feature | Details |
|---------|---------|
| **Responsive canvas** | 384x216 pixel art canvas that scales to any screen (mobile, tablet, desktop) |
| **Touch controls** | Configurable buttons, auto-shown on touch devices |
| **Game loop** | 60fps with frame-rate-independent deltaTime |
| **Title screen** | Game title, subtitle, version, "tap to start" - with hook for custom art |
| **Game over screen** | Score display, restart prompt, with hook for custom content |
| **High score system** | Top 10 leaderboard with localStorage + Firebase sync |
| **Name entry** | 3-letter name input with on-screen keyboard for touch devices |
| **Sound engine** | Web Audio API with tone/noise helpers, mute toggle, persisted setting |
| **Particle system** | Spawn particles with position, velocity, color, lifetime |
| **Score popups** | Floating text that fades up and out |
| **Debug overlay** | FPS counter via `?debug=fps` URL parameter |

## File Structure

The template is a single `index.html` organized into clearly marked sections:

```
index.html
├── HTML & CSS          - Canvas, touch buttons, score display, responsive layout
├── GAME CONFIGURATION  - Name, colors, Firebase config, controls (EDIT THIS)
├── TEMPLATE ENGINE     - Canvas, game loop, input, sound, scores (DON'T EDIT)
├── GAME SOUNDS         - Sound definitions using Web Audio API (EDIT THIS)
└── GAME LOGIC          - Your game code (REPLACE THIS)
```

## How to Create a New Game

### Step 1: Configure Your Game

Edit the `GAME` object at the top of the JavaScript:

```js
const GAME = {
    title: 'SPACE BLASTER',           // Title screen text
    subtitle: 'PEW PEW PEW',          // Subtitle text
    version: 'v1',                     // Shown on title screen
    bgColor: '#0a0a2e',               // Page background color

    firebase: { /* ... */ },           // See Firebase Setup below
    firebasePath: 'highscores',        // Firebase DB path (unique per game)
    localStoragePrefix: 'spaceBlaster', // localStorage key prefix

    width: 384,                        // Canvas width (384 recommended)
    height: 216,                       // Canvas height (216 recommended)

    controls: [
        { id: 'left',  label: 'LEFT',  keys: ['ArrowLeft', 'KeyA'] },
        { id: 'right', label: 'RIGHT', keys: ['ArrowRight', 'KeyD'] },
        { id: 'fire',  label: 'FIRE',  keys: ['Space', 'KeyW'] }
    ],

    instructions: [
        { label: 'MOVE', keys: 'Arrow Keys or A/D' },
        { label: 'FIRE', keys: 'Space or W' }
    ]
};
```

### Step 2: Define Your Sounds

Edit the `SOUNDS` object. Each sound is a function that receives the Sound engine:

```js
const SOUNDS = {
    shoot: (S) => S.playTone(800, 1200, 0.08, 'square', 0.2),
    explode: (S) => S.playNoise(0.15, 800, 100),
    hit: (S) => S.playTone(200, 80, 0.2, 'sawtooth', 0.4),
    // 'gameOver' and 'start' are played automatically by the engine
    gameOver: (S) => { /* ... */ },
    start: (S) => { /* ... */ }
};
```

**Sound helpers available:**
- `S.playTone(startFreq, endFreq, duration, waveType, volume)` - Oscillator tone
- `S.playNoise(duration, startFreq, endFreq)` - Filtered noise burst

### Step 3: Write Your Game Logic

Implement these functions:

```js
// Called when a new game starts (and on restart)
function gameInit() {
    // Set up your game entities, reset positions, etc.
    Engine.state.health = 3;       // Set starting health
    Engine.state.maxHealth = 3;    // Max health for UI display
    Engine.state.score = 0;
}

// Called every frame during gameplay
// dt = 1.0 at 60fps, 0.5 at 120fps, 2.0 at 30fps
function gameUpdate(dt) {
    // Read input: Engine.input.left, Engine.input.right, Engine.input.fire
    // Update your entities
    // Update Engine.state.score
    // Set Engine.state.health to 0 to trigger game over

    // Use engine helpers:
    Engine.Sound.play('shoot');
    Engine.spawnParticle(x, y, vx, vy, size, color, life);
    Engine.showScorePopup(x, y, '+100', '#ffd700');
}

// Called every frame to draw your game
// Engine handles: clear, title screen, game over, UI, particles, popups
function gameRender(ctx, w, h) {
    // Draw your background, entities, etc.
    // w = GAME.width (384), h = GAME.height (216)
}

// Optional: draw custom art on the title screen
function gameTitleRender(ctx, w, h, time) {
    // time = seconds since page load (for animations)
}

// Optional: draw behind the game over overlay
function gameOverRender(ctx, w, h) {
    // Draw your game world frozen in place
}
```

### Step 4: Versioning

Before each deploy/push, increment the version:
```js
const GAME = {
    // ...
    version: 'v2',  // was v1
};
```

## Firebase Setup (Global High Scores)

The template uses Firebase Realtime Database for a global leaderboard. Without Firebase, high scores still work locally via localStorage.

### Creating a New Firebase Project

1. **Go to the Firebase Console**
   - Visit `console.firebase.google.com`
   - Sign in with a Google account

2. **Create a new project**
   - Click "Add project"
   - Enter a project name (e.g., `space-blaster-game`)
   - Disable Google Analytics (not needed for a simple game)
   - Click "Create project"

3. **Set up Realtime Database**
   - In the left sidebar, click "Build" > "Realtime Database"
   - Click "Create Database"
   - Choose a location (pick the closest to your players)
   - Start in **test mode** (we'll set proper rules after)
   - Click "Enable"

4. **Set database security rules**
   - Go to "Realtime Database" > "Rules" tab
   - Replace the default rules with:

   ```json
   {
     "rules": {
       "highscores": {
         ".read": true,
         ".write": true,
         ".indexOn": ["score"]
       }
     }
   }
   ```

   - Click "Publish"

   > **Note:** These rules allow anyone to read/write high scores. This is fine for a simple game. For production games with many players, consider adding validation rules to prevent abuse.

5. **Register a web app**
   - Go to "Project settings" (gear icon in the sidebar)
   - Scroll down to "Your apps" and click the web icon (`</>`)
   - Enter an app nickname (e.g., `space-blaster-web`)
   - Don't check "Firebase Hosting" (we deploy elsewhere)
   - Click "Register app"
   - You'll see a config object - copy the values

6. **Paste the config into your game**

   ```js
   const GAME = {
       // ...
       firebase: {
           apiKey: "AIzaSyC...",
           authDomain: "space-blaster-game.firebaseapp.com",
           databaseURL: "https://space-blaster-game-default-rtdb.firebaseio.com",
           projectId: "space-blaster-game",
           storageBucket: "space-blaster-game.firebasestorage.app",
           messagingSenderId: "123456789",
           appId: "1:123456789:web:abc123"
       },
       firebasePath: 'highscores',  // DB path for this game's scores
       // ...
   };
   ```

7. **Test it**
   - Open the game, play, and submit a high score
   - Check the Firebase Console > Realtime Database to see the score appear

### Sharing One Firebase Project Across Multiple Games

You can use a single Firebase project for all your arcade games. Just give each game a unique `firebasePath`:

```js
// Game 1: Space Blaster
firebasePath: 'highscores-space-blaster',

// Game 2: Block Dodge
firebasePath: 'highscores-block-dodge',

// Game 3: Ninja Sam
firebasePath: 'highscores-ninja-sam',
```

Update the database rules to cover all paths:

```json
{
  "rules": {
    "highscores-space-blaster": {
      ".read": true, ".write": true, ".indexOn": ["score"]
    },
    "highscores-block-dodge": {
      ".read": true, ".write": true, ".indexOn": ["score"]
    },
    "highscores-ninja-sam": {
      ".read": true, ".write": true, ".indexOn": ["score"]
    }
  }
}
```

## Deployment

Since the game is a single HTML file with no dependencies (Firebase SDK loaded from CDN), you can deploy it anywhere:

- **GitHub Pages**: Push to a repo, enable Pages in settings
- **Netlify/Vercel**: Drag and drop the file
- **Any web server**: Just serve the HTML file
- **Local**: Open `index.html` directly in a browser (Firebase won't work without a server due to CORS, but local high scores will)

## Controls Reference

### Touch Devices (Mobile/Tablet)
- Touch buttons auto-appear based on your `GAME.controls` config
- Buttons scale larger on tablets in landscape mode
- On-screen keyboard appears for high score name entry

### Desktop
- Keyboard mappings from your `GAME.controls` config
- Instructions shown below the game canvas

## API Reference

### Engine.state
| Property | Type | Description |
|----------|------|-------------|
| `score` | number | Current score (update in gameUpdate) |
| `health` | number | Current health (set to 0 for game over) |
| `maxHealth` | number | Max health (for UI hearts display) |
| `running` | bool | Game loop is running |
| `gameOver` | bool | Game over state |
| `showTitleScreen` | bool | Title screen visible |

### Engine.input
Object with boolean properties matching your control IDs:
```js
// If controls: [{ id: 'left', ... }, { id: 'right', ... }]
Engine.input.left   // true while left is held
Engine.input.right  // true while right is held
```

### Engine.Sound
| Method | Description |
|--------|-------------|
| `play(name)` | Play a sound from the SOUNDS object |
| `playTone(start, end, dur, type, vol)` | Play an oscillator tone |
| `playNoise(dur, startFreq, endFreq)` | Play a noise burst |

### Engine helpers
| Method | Description |
|--------|-------------|
| `Engine.spawnParticle(x, y, vx, vy, size, color, life)` | Spawn a particle |
| `Engine.showScorePopup(x, y, text, color)` | Show floating score text |

## Tips

- **Keep the 384x216 resolution** - it scales perfectly to common screen sizes and gives a retro SNES feel
- **Use procedural graphics** - draw with Canvas API instead of loading images for instant loading and tiny file size
- **Use `dt` for all movement** - multiply speeds by `dt` so the game runs consistently at any frame rate
- **Test on mobile** - touch controls and scaling are the key differentiator of this template
- **Sounds are optional** - if SOUNDS is empty or a sound name is missing, nothing crashes
