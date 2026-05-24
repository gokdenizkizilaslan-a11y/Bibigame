/* ===== BIBIGAME - Ses Sistemi ===== */

const AudioManager = {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    musicEnabled: true,
    sfxEnabled: true,
    audioContext: null,
    ambientGain: null,
    sfxGain: null,
    ambientSource: null,
    ambientBuffer: null,

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.value = this.musicVolume * 0.3;
            this.ambientGain.connect(this.audioContext.destination);

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.audioContext.destination);

            this.loadAmbient();
        } catch (e) {
            console.warn('Web Audio API kullanılamıyor:', e);
        }
    },

    async loadAmbient() {
        // Ambient ses sentezi (hazır dosya yoksa)
        this.playGeneratedAmbient();
    },

    playGeneratedAmbient() {
        if (!this.audioContext || !this.ambientGain) return;
        const ctx = this.audioContext;
        const gain = this.ambientGain;

        // Düşük frekanslı drone + rüzgar efekti
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 55;
        const osc1Gain = ctx.createGain();
        osc1Gain.gain.value = 0.15;
        osc1.connect(osc1Gain);
        osc1Gain.connect(gain);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 82;
        const osc2Gain = ctx.createGain();
        osc2Gain.gain.value = 0.1;
        osc2.connect(osc2Gain);
        osc2Gain.connect(gain);

        // Rüzgar gürültüsü
        const noise = ctx.createOscillator();
        noise.type = 'sawtooth';
        noise.frequency.value = 0.5;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.05;
        noise.connect(noiseGain);
        noiseGain.connect(gain);

        osc1.start();
        osc2.start();
        noise.start();

        this.ambientSource = { osc1, osc2, noise, osc1Gain, osc2Gain, noiseGain };
    },

    playClick() {
        if (!this.sfxEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800;
        g.gain.value = this.sfxVolume * 0.3;
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    },

    playCardDraw() {
        if (!this.sfxEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
        g.gain.value = this.sfxVolume * 0.2;
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    },

    playHeartBreak() {
        if (!this.sfxEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
        g.gain.value = this.sfxVolume * 0.25;
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    },

    playHeartGain() {
        if (!this.sfxEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
        g.gain.value = this.sfxVolume * 0.2;
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
    },

    playEvent() {
        if (!this.sfxEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const notes = [523, 659, 784];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(this.sfxVolume * 0.15, ctx.currentTime + i * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
    },

    setMusicVolume(v) {
        this.musicVolume = v / 100;
        if (this.ambientGain) this.ambientGain.gain.value = this.musicVolume * 0.3;
    },

    setSfxVolume(v) {
        this.sfxVolume = v / 100;
    },

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.ambientGain) this.ambientGain.gain.value = this.musicEnabled ? this.musicVolume * 0.3 : 0;
    },

    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
    },

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
};

/* ===== Muzik Calar (Crossfade + Kategori) ===== */
const MusicPlayer = {
    currentCategory: null,
    currentTrackIndex: -1,
    audioA: null,
    audioB: null,
    activeSlot: 'A',
    volume: 0.3,
    fadeTime: 2000,
    categories: {},
    fadeTimer: null,
    _initDone: false,

    init() {
        if (this._initDone) return;
        this._initDone = true;

        this.audioA = new Audio();
        this.audioB = new Audio();
        this.audioA.volume = 0;
        this.audioB.volume = 0;

        this.volume = (CONFIG && CONFIG.music) ? (CONFIG.music.volume || 30) / 100 : 0.3;
        this.fadeTime = (CONFIG && CONFIG.music && CONFIG.music.fadeTime) || 2000;

        // Kategorileri parse et
        if (CONFIG && CONFIG.music && CONFIG.music.categories) {
            this.categories = CONFIG.music.categories;
        } else {
            // Geriye uyumlu: tek menu kategorisi
            var oldTracks = (CONFIG && CONFIG.music && CONFIG.music.tracks) || [];
            this.categories = {
                menu: { mode: 'sequential', tracks: oldTracks }
            };
        }

        this._populateDropdown();

        // Volume slider'lari bagla
        var self = this;
        var volSliders = document.querySelectorAll('#music-volume');
        volSliders.forEach(function(slider) {
            slider.value = self.volume * 100;
            slider.addEventListener('input', function() {
                self.setVolume(this.value);
            });
        });

        // Track bitince: sequential'de sonrakine gec, random'da loop
        this.audioA.addEventListener('ended', function() {
            if (self.activeSlot !== 'A') return;
            self._onTrackEnded();
        });
        this.audioB.addEventListener('ended', function() {
            if (self.activeSlot !== 'B') return;
            self._onTrackEnded();
        });

        // Menu muzigiyle basla
        this.playCategory('menu');
    },

    // --- Ic metodlar ---

    _active() {
        return this.activeSlot === 'A' ? this.audioA : this.audioB;
    },

    _inactive() {
        return this.activeSlot === 'A' ? this.audioB : this.audioA;
    },

    _onTrackEnded() {
        var cat = this.categories[this.currentCategory];
        if (!cat) return;

        if (cat.mode === 'sequential') {
            this._advanceInCategory();
        } else {
            // Random modda: ayni track'i loop'la
            var audio = this._active();
            audio.currentTime = 0;
            audio.play().catch(function() {});
        }
    },

    _advanceInCategory() {
        var cat = this.categories[this.currentCategory];
        if (!cat || !cat.tracks.length) return;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % cat.tracks.length;
        var track = cat.tracks[this.currentTrackIndex];
        this._crossfadeTo(track.file);
    },

    _crossfadeTo(file) {
        if (this.fadeTimer) { clearInterval(this.fadeTimer); this.fadeTimer = null; }

        var oldAudio = this._active();
        var newAudio = this._inactive();
        var self = this;

        // Eski sesi durdur (eger hicbir sey calmiyorsa direkt baslat)
        if (!oldAudio.src || oldAudio.readyState === 0) {
            oldAudio.volume = 0;
            newAudio.src = file;
            newAudio.volume = this.volume;
            newAudio.play().catch(function() {});
            this.activeSlot = this.activeSlot === 'A' ? 'B' : 'A';
            return;
        }

        newAudio.src = file;
        newAudio.volume = 0;
        newAudio.play().catch(function() {});

        var steps = 40;
        var stepMs = this.fadeTime / steps;
        var volStep = this.volume / steps;
        var step = 0;

        this.fadeTimer = setInterval(function() {
            step++;
            oldAudio.volume = Math.max(0, self.volume - (volStep * step));
            newAudio.volume = Math.min(self.volume, volStep * step);

            if (step >= steps) {
                clearInterval(self.fadeTimer);
                self.fadeTimer = null;
                oldAudio.volume = 0;
                oldAudio.pause();
                oldAudio.src = '';
                newAudio.volume = self.volume;
                self.activeSlot = self.activeSlot === 'A' ? 'B' : 'A';
            }
        }, stepMs);
    },

    _populateDropdown() {
        var sel = document.getElementById('music-select');
        if (!sel) return;

        // Tum kategorilerdeki tum track'leri dropdown'a ekle
        var self = this;
        Object.keys(this.categories).forEach(function(catKey) {
            var cat = self.categories[catKey];
            if (!cat || !cat.tracks) return;
            cat.tracks.forEach(function(t) {
                var opt = document.createElement('option');
                opt.value = JSON.stringify({ cat: catKey, file: t.file });
                opt.textContent = t.name;
                sel.appendChild(opt);
            });
        });
    },

    // --- Dis API ---

    playCategory(category) {
        if (category === this.currentCategory) return;
        this.currentCategory = category;

        var cat = this.categories[category];
        if (!cat || !cat.tracks || !cat.tracks.length) return;

        if (cat.mode === 'random') {
            this.currentTrackIndex = Math.floor(Math.random() * cat.tracks.length);
        } else {
            this.currentTrackIndex = 0;
        }

        var track = cat.tracks[this.currentTrackIndex];
        this._crossfadeTo(track.file);

        // Dropdown'i guncelle
        var sel = document.getElementById('music-select');
        if (sel) {
            var matchVal = JSON.stringify({ cat: category, file: track.file });
            for (var i = 0; i < sel.options.length; i++) {
                if (sel.options[i].value === matchVal) {
                    sel.selectedIndex = i;
                    break;
                }
            }
        }
    },

    /** Manuel parca secimi (dropdown'tan) — kategori modunu override eder */
    play(packed) {
        if (!packed) { this.stop(); return; }
        try {
            var data = JSON.parse(packed);
            if (data.cat && data.file) {
                this.currentCategory = data.cat;
                // Track index'i bul
                var cat = this.categories[data.cat];
                if (cat && cat.tracks) {
                    for (var i = 0; i < cat.tracks.length; i++) {
                        if (cat.tracks[i].file === data.file) {
                            this.currentTrackIndex = i;
                            break;
                        }
                    }
                }
                this._crossfadeTo(data.file);
            }
        } catch (e) {
            // Eski format: direkt dosya yolu
            this.currentCategory = '__manual__';
            this.currentTrackIndex = 0;
            this._crossfadeTo(packed);
        }
    },

    stop() {
        if (this.fadeTimer) { clearInterval(this.fadeTimer); this.fadeTimer = null; }
        if (this.audioA) { this.audioA.pause(); this.audioA.src = ''; this.audioA.volume = 0; }
        if (this.audioB) { this.audioB.pause(); this.audioB.src = ''; this.audioB.volume = 0; }
        this.currentCategory = null;
    },

    setVolume(val) {
        this.volume = val / 100;
        var active = this._active();
        if (active && active.src && active.readyState > 0) {
            active.volume = this.volume;
        }
        if (CONFIG && CONFIG.music) CONFIG.music.volume = parseInt(val);
    }
};
