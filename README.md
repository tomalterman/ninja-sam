# Ninja Sam - Robot Runner

A browser-based 2D infinite side-scroller where you control a ninja battling through endless waves of robots. Built by Tom and Leo as a fun father-son project.

## Play the Game

Open `index.html` in any modern browser - no installation required.

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Jump | Space, W, or Up Arrow | Left button |
| Slash | S, D, or Shift | Right button |

## Gameplay

- The ninja runs automatically from left to right
- Jump over robots or slash them with your sword
- You have 3 health points (shown as stars)
- Score points by destroying robots (25 pts) or jumping over them (10 pts)
- Survive as long as you can - difficulty increases over time

## Features

- SNES-style pixel art graphics
- Parallax scrolling city background
- Two robot types: Ground (short) and Tall
- Combo multiplier system (up to 4x)
- Touch controls for mobile/tablet
- 60 FPS gameplay

## Code Overview

The game is built as a single HTML file using vanilla JavaScript and the Canvas API.

### Structure

```
index.html
├── CSS styles (inline)
│   └── Game container, canvas scaling, touch buttons
│
└── JavaScript
    ├── CONFIG - Game constants (speeds, colors, timing)
    ├── Game State - Score, health, difficulty tracking
    ├── Ninja - Player character with jump/slash mechanics
    ├── Robots - Enemy spawning and movement
    ├── Background - Parallax scrolling layers
    ├── Collision Detection - Hit detection and damage
    ├── Input Handling - Keyboard and touch controls
    └── Rendering - Canvas drawing functions
```

### Key Constants

- Base resolution: 384x216 (scaled up with crisp pixels)
- Jump duration: ~0.6 seconds
- Slash duration: ~0.3 seconds
- First robot spawns after 5 seconds
- Invincibility after hit: 1.5 seconds

## Running Locally

Just open the HTML file directly, or use a local server:

```bash
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Future Ideas

- Sound effects and music
- More enemy types
- Power-ups
- High score leaderboard
- Boss battles
