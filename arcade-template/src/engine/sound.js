// ==================== SOUND ENGINE ====================

const Sound = {
    ctx: null,
    enabled: true,

    init() {
        const prefix = GAME.localStoragePrefix;
        this.enabled = localStorage.getItem(prefix + 'Sound') !== 'off';

        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) muteBtn.textContent = this.enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';

        const initAudio = () => {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('touchstart', initAudio);
            document.removeEventListener('keydown', initAudio);
            document.removeEventListener('click', initAudio);
        };
        document.addEventListener('touchstart', initAudio);
        document.addEventListener('keydown', initAudio);
        document.addEventListener('click', initAudio);

        // Mute button
        muteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.enabled = !this.enabled;
            muteBtn.textContent = this.enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
            localStorage.setItem(prefix + 'Sound', this.enabled ? 'on' : 'off');
        });
        muteBtn.addEventListener('touchstart', (e) => e.stopPropagation());
    },

    play(name) {
        if (!this.ctx || !this.enabled) return;
        if (typeof SOUNDS !== 'undefined' && SOUNDS[name]) {
            SOUNDS[name](this);
        }
    },

    playTone(startFreq, endFreq, duration, type, volume) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(volume || 0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playNoise(duration, startFreq, endFreq) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(startFreq || 1000, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(endFreq || 200, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }
};
