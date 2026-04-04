// ==================== HIGH SCORE SYSTEM ====================

const HighScores = {
    scores: [],
    lastPlayerName: '',
    database: null,

    init() {
        // Initialize 10 empty slots
        this.scores = Array.from({ length: 10 }, () => ({ name: '---', score: 0 }));
        this.lastPlayerName = sessionStorage.getItem(GAME.localStoragePrefix + 'LastName') || '';

        // Initialize Firebase if configured
        if (GAME.firebase.apiKey && GAME.firebase.databaseURL) {
            try {
                firebase.initializeApp(GAME.firebase);
                this.database = firebase.database();
            } catch (e) {
                // Firebase may already be initialized or config invalid
                console.warn('Firebase init:', e.message);
            }
        }

        this.load();
    },

    load() {
        const saved = localStorage.getItem(GAME.localStoragePrefix + 'HighScores');
        if (saved) {
            this.scores = JSON.parse(saved);
        }
        this.updateDisplay();

        if (this.database) {
            this.syncWithFirebase();
        }
    },

    syncWithFirebase() {
        const localScores = this.scores.filter(s => s.score > 0);

        this.database.ref(GAME.firebasePath)
            .orderByChild('score')
            .limitToLast(50)
            .once('value', (snapshot) => {
                const globalScores = [];
                snapshot.forEach((child) => globalScores.push(child.val()));

                localScores.forEach(local => {
                    const exists = globalScores.some(g =>
                        g.name === local.name && g.score === local.score
                    );
                    if (!exists && local.name !== '---') {
                        this.saveToFirebase(local.name, local.score);
                    }
                });

                this.loadGlobalHighScores();
            });
    },

    loadGlobalHighScores() {
        this.database.ref(GAME.firebasePath)
            .orderByChild('score')
            .limitToLast(10)
            .on('value', (snapshot) => {
                const globalScores = [];
                snapshot.forEach((child) => globalScores.push(child.val()));
                globalScores.sort((a, b) => b.score - a.score);

                if (globalScores.length > 0) {
                    while (globalScores.length < 10) {
                        globalScores.push({ name: '---', score: 0 });
                    }
                    this.scores = globalScores;
                    this.save();
                    this.updateDisplay();
                }
            });
    },

    save() {
        localStorage.setItem(GAME.localStoragePrefix + 'HighScores', JSON.stringify(this.scores));
    },

    saveToFirebase(name, score) {
        if (!this.database) return;
        const scoreId = name + '_' + score + '_' + Date.now();
        const scoreData = { name: name, score: score, timestamp: Date.now() };

        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                scoreData.ip = data.ip;
                scoreData.city = data.city;
                scoreData.country = data.country_name;
                this.database.ref(GAME.firebasePath + '/' + scoreId).set(scoreData);
            })
            .catch(() => {
                this.database.ref(GAME.firebasePath + '/' + scoreId).set(scoreData);
            });
    },

    updateDisplay() {
        const entries = document.querySelectorAll('.scoreEntry');
        entries.forEach((entry, i) => {
            if (this.scores[i]) {
                entry.querySelector('.name').textContent = this.scores[i].name;
                entry.querySelector('.score').textContent = String(this.scores[i].score).padStart(6, '0');
            }
        });
    },

    check(score) {
        for (let i = 0; i < 10; i++) {
            if (score > this.scores[i].score) return i;
        }
        return -1;
    },

    add(name, score, rank) {
        this.lastPlayerName = name.toUpperCase();
        sessionStorage.setItem(GAME.localStoragePrefix + 'LastName', this.lastPlayerName);

        this.scores.splice(rank, 0, { name: name.toUpperCase(), score: score });
        this.scores = this.scores.slice(0, 10);
        this.save();
        this.saveToFirebase(name.toUpperCase(), score);

        this.updateDisplay();
        const entries = document.querySelectorAll('.scoreEntry');
        if (entries[rank]) {
            entries[rank].classList.add('new');
            setTimeout(() => entries[rank].classList.remove('new'), 1000);
        }
    }
};
