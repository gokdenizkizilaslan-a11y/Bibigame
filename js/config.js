/* ===== BIBIGAME - Config Yükleyici ===== */

let CONFIG = null;

const ConfigManager = {
    async load() {
        try {
            const resp = await fetch('config.json');
            if (!resp.ok) throw new Error('config.json bulunamadı');
            CONFIG = await resp.json();
            console.log('Config yüklendi.');
            return CONFIG;
        } catch (e) {
            console.warn('Config yüklenemedi, varsayılanlar kullanılıyor:', e.message);
            CONFIG = this.defaults();
            return CONFIG;
        }
    },

    defaults() {
        return {
            background: { image: '', opacity: 0.4, blur: 0 },
            timeOfDayBackgrounds: {
                morning: { image: '', opacity: 0.3, blur: 2 },
                noon: { image: '', opacity: 0.35, blur: 2 },
                evening: { image: '', opacity: 0.3, blur: 2 }
            },
            actionIcons: {
                zindan: { icon: '⚔️', image: '' },
                'hizli-zindan': { icon: '🛡️', image: '' },
                kader: { icon: '🌙', image: '' },
                dinlen: { icon: '🏕️', image: '' },
                demirci: { icon: '🔨', image: '' },
                diriltme: { icon: '✨', image: '' },
                pazar: { icon: '🛒', image: '' },
                insaa: { icon: '🏚️', image: '' },
                uyu: { icon: '🌙', image: '' }
            },
            characterPortraits: {
                irem: 'assets/characters/irem.png',
                gokdeniz: 'assets/characters/gokdeniz.png',
                noyan: 'assets/characters/noyan.png',
                begul: 'assets/characters/begul.png',
                bedrican: 'assets/characters/bedrican.png',
                cansin: 'assets/characters/cansin.png',
                gunda: 'assets/characters/gunda.png',
                dominic: 'assets/characters/dominic.png',
                bulent: 'assets/characters/bulent.png'
            },
            cardImages: { enabled: true, path: 'assets/cards/' },
            portraitFrame: { borderColor: '#c8a84e', bgColor: '#0a0705', borderWidth: 2, borderRadius: 8 },
            rarityIcons: { common: '📜', rare: '💎', epic: '✨', legendary: '👑' },
            audio: { musicVolume: 50, sfxVolume: 70 },
            timer: { seconds: 60, autoAdvance: true },
            language: 'tr'
        };
    },

    getBackground() {
        if (!CONFIG) return this.defaults().background;
        return CONFIG.background;
    },

    getPortrait(charId) {
        if (!CONFIG) return this.defaults().characterPortraits[charId] || '';
        return CONFIG.characterPortraits[charId] || '';
    },

    getTimerSeconds() {
        if (!CONFIG) return 60;
        return CONFIG.timer?.seconds || 60;
    },

    getAudio() {
        if (!CONFIG) return { musicVolume: 50, sfxVolume: 70 };
        return CONFIG.audio || { musicVolume: 50, sfxVolume: 70 };
    },

    getCardImagePath(cardId) {
        if (!CONFIG || !CONFIG.cardImages?.enabled) return null;
        return CONFIG.cardImages.path + cardId + '.png';
    },

    getPortraitFrame() {
        if (!CONFIG) return this.defaults().portraitFrame;
        return CONFIG.portraitFrame || this.defaults().portraitFrame;
    },

    getRarityIcon(rarity) {
        if (!CONFIG) return (this.defaults().rarityIcons || {})[rarity] || '📜';
        var icons = CONFIG.rarityIcons || this.defaults().rarityIcons || {};
        return icons[rarity] || '📜';
    },

    getCharacterStats(charId) {
        if (!CONFIG || !CONFIG.characterStats) return null;
        return CONFIG.characterStats[charId] || null;
    }
};
