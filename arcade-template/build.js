#!/usr/bin/env node
// Zero-dependency build script. Concatenates JS source files into a single HTML file.
// Usage: node build.js

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const jsFiles = [
    'src/game-config.js',
    'src/engine/canvas.js',
    'src/engine/sound.js',
    'src/engine/highscores.js',
    'src/engine/input.js',
    'src/engine/particles.js',
    'src/engine/screens.js',
    'src/engine/loop.js',
    'src/engine/engine.js',
    'src/game-sounds.js',
    'src/game.js'
];

const js = jsFiles.map(f => {
    const full = path.join(ROOT, f);
    if (!fs.existsSync(full)) {
        console.error(`Missing: ${f}`);
        process.exit(1);
    }
    return `// ---- ${f} ----\n` + fs.readFileSync(full, 'utf8');
}).join('\n\n');

const htmlPath = path.join(ROOT, 'src/template.html');
const html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('/* BUILD_INSERT_JS */')) {
    console.error('template.html missing /* BUILD_INSERT_JS */ placeholder');
    process.exit(1);
}

const output = html.replace('/* BUILD_INSERT_JS */', js);

const distDir = path.join(ROOT, 'dist');
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'index.html'), output);

const lines = output.split('\n').length;
const size = (Buffer.byteLength(output) / 1024).toFixed(1);
console.log(`Built dist/index.html (${lines} lines, ${size} KB)`);
