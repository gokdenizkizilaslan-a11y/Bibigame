/* ===== BIBIGAME - Karakter Seçim Ekranı ===== */

const CharacterSelect = {
    selectedChar: null,
    isMultiplayer: false,
    lobbyType: null,

    init() {
        this.selectedChar = CHARACTERS[0];
        this.renderCharList();
        this.renderCharDetail();

        document.getElementById('btn-back-to-menu').addEventListener('click', () => {
            AudioManager.playClick();
            ScreenManager.show('main-menu');
        });

        document.getElementById('btn-start-game').addEventListener('click', () => {
            AudioManager.playClick();
            const playerName = document.getElementById('player-name-input').value.trim();
            const charName = playerName || this.selectedChar.name;
            Game.startNew(charName, this.selectedChar.id);
        });
    },

    renderCharList() {
        const list = document.getElementById('char-list');
        list.innerHTML = '';

        CHARACTERS.forEach(char => {
            const fullChar = getCharacterById(char.id) || char;
            const item = document.createElement('div');
            item.className = 'char-list-item' +
                (this.selectedChar && this.selectedChar.id === char.id ? ' selected' : '');
            const cs = fullChar.combatStats || {};
            item.innerHTML = `${char.name} <span class="char-role-badge">${char.role} | Can:${cs.hp}</span>`;
            item.addEventListener('click', () => {
                AudioManager.playClick();
                this.selectedChar = char;
                this.renderCharList();
                this.renderCharDetail();
            });
            list.appendChild(item);
        });
    },

    renderCharDetail() {
        // config'ten güncel statları al
        const char = getCharacterById(this.selectedChar.id) || this.selectedChar;
        if (!char) return;

        document.getElementById('char-name').textContent = char.name;
        document.getElementById('char-title-display').textContent = char.title;

        // Kısa hikaye (story alanından)
        const descEl = document.getElementById('char-desc');
        if (char.story) {
            descEl.textContent = char.story;
        } else {
            descEl.textContent = char.description;
        }

        // Portre
        const portrait = document.getElementById('char-portrait');
        portrait.src = char.portrait;
        portrait.onerror = () => { portrait.classList.remove('has-image'); };
        portrait.onload = () => { portrait.classList.add('has-image'); };
        portrait.classList.remove('has-image');

        // Sinerji
        const synergyEl = document.getElementById('char-synergy');
        if (char.synergy) {
            synergyEl.style.display = 'block';
            synergyEl.textContent = `Sinerji: ${char.synergy.characterName} ile — ${char.synergy.effect}`;
        } else {
            synergyEl.style.display = 'none';
        }

        // Combat Stats
        const stats = char.combatStats || {};
        const statsEl = document.getElementById('char-combat-stats');
        if (statsEl) {
            statsEl.textContent = `Can: ${stats.hp} | Atak: ${stats.atk} | Defans: ${stats.def} | Hız: ${stats.spd} | Büyü: ${stats.mag}`;
        }
    },

    populateLobbySelect(gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        grid.innerHTML = '';
        var isCreate = gridId === 'lobby-char-grid-create';
        var selectedClass = isCreate ? '_lobbyCreateChar' : '_lobbyJoinChar';
        // Ilk karakteri default sec
        if (!CharacterSelect[selectedClass]) CharacterSelect[selectedClass] = CHARACTERS[0].id;

        CHARACTERS.forEach(function(char) {
            var fullChar = getCharacterById(char.id) || char;
            var portrait = ConfigManager.getPortrait(char.id);
            var isSelected = CharacterSelect[selectedClass] === char.id;
            var card = document.createElement('div');
            card.className = 'lobby-char-card' + (isSelected ? ' selected' : '');
            card.setAttribute('data-char-id', char.id);
            card.innerHTML =
                '<div class="lobby-char-portrait">' +
                    (portrait ? '<img src="' + portrait + '" onerror="this.style.display=\'none\'">' : '') +
                    '<span class="lobby-char-initial">' + (char.name || '?')[0] + '</span>' +
                '</div>' +
                '<span class="lobby-char-name">' + char.name + '</span>' +
                '<span class="lobby-char-role">' + (char.role || '') + '</span>';
            card.addEventListener('click', function() {
                CharacterSelect[selectedClass] = char.id;
                // Tum kartlardan selected'i kaldir
                grid.querySelectorAll('.lobby-char-card').forEach(function(c) { c.classList.remove('selected'); });
                card.classList.add('selected');
            });
            grid.appendChild(card);
        });
    }
};
