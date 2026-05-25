/* ===== BIBIGAME - Ana Uygulama ===== */

const ScreenManager = {
    currentScreen: 'main-menu',

    init() {
        this.show('main-menu');
    },

    show(screenId) {
        // Mevcut ekranı gizle
        const current = document.querySelector('.screen.active');
        if (current) {
            current.classList.remove('active');
            current.style.display = 'none';
        }

        // Yeni ekranı göster
        const screen = document.getElementById(screenId);
        if (!screen) return;

        screen.classList.add('active');
        screen.style.display = 'flex';
        this.currentScreen = screenId;

        // Ekran değişince üstü kaydır
        document.getElementById('app-container').scrollTop = 0;

        // Muzik kategorisi gecisi
        if (screenId === 'main-menu') {
            MusicPlayer.playCategory('menu');
        } else if (screenId === 'game-screen') {
            MusicPlayer.playCategory('game');
        }

        // Ekrana özel başlatmalar
        this.initScreen(screenId);
    },

    initScreen(screenId) {
        switch (screenId) {
            case 'main-menu':
                Menu.init();
                break;
            case 'character-select':
                CharacterSelect.init();
                break;
            case 'multiplayer-lobby':
                Multiplayer.initLobby();
                break;
            case 'game-screen':
                // Oyun zaten Game.startNew veya Game.loadState ile başlatıldı
                break;
            case 'game-over-screen':
                break;
        }
    }
};

// Ana başlatma
document.addEventListener('DOMContentLoaded', async () => {
    // Config'i yükle
    await ConfigManager.load();

    // Arka plan resimlerini zamana gore ayarla
    const todConfig = CONFIG.timeOfDayBackgrounds || {};
    const bgLayer = document.getElementById('bg-layer');
    const bgImages = {};

    ['morning', 'noon', 'evening'].forEach(function(tod) {
        var cfg = (todConfig[tod] && todConfig[tod].image) ? todConfig[tod] : CONFIG.background;
        if (!cfg || !cfg.image) return;

        var img = document.createElement('img');
        img.id = 'bg-image-' + tod;
        img.src = cfg.image;
        img.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:' + (cfg.opacity || 0.4) + ';z-index:0;pointer-events:none;transition:opacity 1.2s ease-in-out;';
        if (cfg.blur) img.style.filter = 'blur(' + cfg.blur + 'px)';
        if (tod !== 'morning') img.style.opacity = '0';
        bgLayer.insertBefore(img, bgLayer.firstChild);
        bgImages[tod] = img;
    });

    window.updateTimeOfDayVisuals = function(timeOfDay) {
        var overlay = document.getElementById('tod-overlay');
        if (overlay) {
            overlay.className = 'tod-' + timeOfDay;
        }
        Object.keys(bgImages).forEach(function(tod) {
            bgImages[tod].style.opacity = tod === timeOfDay ? (todConfig[tod] || CONFIG.background || {}).opacity || 0.4 : '0';
        });
    };

    // Portre çerçevesini config'ten ayarla
    const frame = ConfigManager.getPortraitFrame();
    if (frame) {
        const root = document.documentElement;
        root.style.setProperty('--portrait-border', frame.borderColor || '#c8a84e');
        root.style.setProperty('--portrait-bg', frame.bgColor || '#0a0705');
        root.style.setProperty('--portrait-border-width', (frame.borderWidth || 2) + 'px');
        root.style.setProperty('--portrait-radius', (frame.borderRadius || 8) + 'px');
    }

    // Audio başlat (ilk tıklamada)
    document.addEventListener('click', function initAudio() {
        AudioManager.init();
        AudioManager.resume();
    }, { once: true });

    Animations.init();
    MusicPlayer.init();
    Chat.init();

    // Mobil muzik butonu
    (function() {
        var btn = document.getElementById('music-float-btn');
        var popup = document.getElementById('music-float-popup');
        var slider = document.getElementById('music-float-slider');
        if (btn && popup && slider) {
            // Slider degerini esitle
            slider.value = (CONFIG && CONFIG.music && CONFIG.music.volume) || 30;
            MusicPlayer.setVolume(slider.value);
            AudioManager.setMusicVolume(slider.value);

            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (popup.style.display === 'flex') {
                    popup.style.display = 'none';
                } else {
                    popup.style.display = 'flex';
                }
            });

            slider.addEventListener('input', function() {
                MusicPlayer.setVolume(this.value);
                AudioManager.setMusicVolume(this.value);
            });

            // Popup dışına tıkla kapat
            document.addEventListener('click', function(e) {
                if (popup.style.display === 'flex' && !popup.contains(e.target) && e.target !== btn) {
                    popup.style.display = 'none';
                }
            });
        }
    })();
    ScreenManager.show('main-menu');

    // Envanter butonu
    const invBtn = document.getElementById('btn-inventory');
    if (invBtn) {
        invBtn.addEventListener('click', () => {
            Game.showInventory();
            try { AudioManager.playClick(); } catch(e) {}
        });
    }

    // Envanter modal kapatma
    const invClose = document.querySelector('#inventory-modal .modal-close');
    if (invClose) invClose.addEventListener('click', () => Game.hideInventory());
    const invOverlay = document.getElementById('inventory-modal');
    if (invOverlay) invOverlay.addEventListener('click', (e) => { if (e.target === invOverlay) Game.hideInventory(); });

    // Başarım butonu
    const achBtn = document.getElementById('btn-achievements');
    if (achBtn) {
        achBtn.addEventListener('click', () => {
            Game.showAchievements();
            try { AudioManager.playClick(); } catch(e) {}
        });
    }

    // Boss başlatma
    const bossBtn = document.getElementById('btn-start-boss');
    if (bossBtn) bossBtn.addEventListener('click', () => Game.startBossFight());

    // Harita butonu
    const mapBtn = document.getElementById('btn-map');
    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            Game.showMap();
            try { AudioManager.playClick(); } catch(e) {}
        });
    }

    // Yemek Ye butonu
    const eatBtn = document.getElementById('btn-eat-food');
    if (eatBtn) eatBtn.addEventListener('click', () => CombatSystem.eatFood());

    // Sırayı Bitir butonu
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn) {
        endTurnBtn.addEventListener('click', () => {
            if (CombatSystem.isBossFight) CombatSystem.endBossPlayerTurn();
            else if (CombatSystem.isPartyFight) CombatSystem.partyEndTurn();
            else CombatSystem.endPlayerTurn();
        });
    }

    // Kaçış butonu
    const fleeBtn = document.getElementById('btn-flee');
    if (fleeBtn) {
        fleeBtn.addEventListener('click', () => {
            if (CombatSystem.isBossFight) CombatSystem.bossFlee();
            else if (CombatSystem.isPartyFight) CombatSystem.partyFlee();
            else CombatSystem.playerFlee();
        });
    }

    // Game over menüye dönüş
    document.getElementById('btn-back-to-menu-final').addEventListener('click', () => {
        ScreenManager.show('main-menu');
    });

    // Yeni modal'lar için close handler'ları
    document.querySelectorAll('#achievements-modal .modal-close, #map-modal .modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').style.display = 'none';
        });
    });
    document.querySelectorAll('#achievements-modal, #map-modal').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    });
});
