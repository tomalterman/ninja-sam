// ==================== GAME CONFIGURATION ====================
// Edit this file to configure your game.

const GAME = {
    title: 'BLOCK DODGE',
    subtitle: 'HOW LONG CAN YOU SURVIVE?',
    version: 'v1',
    bgColor: '#1a1a2e',

    // Firebase - see README.md for setup instructions
    // Leave as-is to use local-only high scores
    firebase: {
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    },
    firebasePath: 'highscores',
    localStoragePrefix: 'blockDodge',

    // Canvas resolution (384x216 = SNES-style, recommended)
    width: 384,
    height: 216,

    // Touch controls - each becomes a button on mobile
    // id: used as Engine.input[id]
    // label: button text
    // keys: keyboard codes that map to this control
    controls: [
        { id: 'left',  label: 'LEFT',  keys: ['ArrowLeft', 'KeyA'] },
        { id: 'right', label: 'RIGHT', keys: ['ArrowRight', 'KeyD'] }
    ],

    // Desktop instructions (hidden on touch devices)
    instructions: [
        { label: 'MOVE LEFT', keys: 'Arrow Left or A' },
        { label: 'MOVE RIGHT', keys: 'Arrow Right or D' }
    ]
};
