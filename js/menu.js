/* ===== BIBIGAME - Menü İşlevleri ===== */

const Menu = {
    init() {
        document.getElementById('btn-singleplayer').addEventListener('click', () => {
            AudioManager.playClick();
            ScreenManager.show('character-select');
        });

        document.getElementById('btn-multiplayer').addEventListener('click', () => {
            AudioManager.playClick();
            ScreenManager.show('multiplayer-lobby');
            Multiplayer.initLobby();
        });

        document.getElementById('btn-continue').addEventListener('click', () => {
            AudioManager.playClick();
            const saved = loadGame();
            if (saved) {
                Game.loadState(saved);
                ScreenManager.show('game-screen');
            }
        });

        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            AudioManager.playClick();
            document.getElementById('how-to-play-modal').style.display = 'flex';
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            AudioManager.playClick();
            document.getElementById('settings-modal').style.display = 'flex';
        });

        // Modal kapatma
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal-overlay').style.display = 'none';
            });
        });

        // Modal dışına tıklayarak kapatma
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.style.display = 'none';
            });
        });

        // Devam Et butonu kontrolü
        if (hasSaveData()) {
            const info = getSaveInfo();
            const btn = document.getElementById('btn-continue');
            btn.style.display = 'flex';
            btn.querySelector('.btn-sub').textContent =
                `Gün ${info.day} - ${info.character} - ${info.date}`;
        }

        // Ses ayarları
        const musicSlider = document.getElementById('music-volume');
        const sfxSlider = document.getElementById('sfx-volume');
        musicSlider.addEventListener('input', () => {
            AudioManager.setMusicVolume(musicSlider.value);
            MusicPlayer.setVolume(musicSlider.value);
        });
        sfxSlider.addEventListener('input', () => AudioManager.setSfxVolume(sfxSlider.value));
    }
};
