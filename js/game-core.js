/* ===== BIBIGAME - Oyun Çekirdeği ===== */

const TIMES_OF_DAY = ['morning', 'noon', 'evening'];
const TIME_LABELS = { morning: 'Sabah', noon: 'Öğle', evening: 'Akşam' };
const MIN_END_DAY = 30;
const MAX_END_DAY = 40;
const RESPAWN_DAYS = 5;
const REVIVE_RITUAL_DAYS = { min: 2, max: 3 };

// Enerji & Aksiyon Sistemi
const ACTIONS_PER_TIME_CHANGE = 2;
const MAX_FATE_PER_DAY = 3;
const DAILY_ENERGY = 10;
const ENERGY_COST = { combat: 3, kader: 2, rest: 0 };

const Game = {
    day: 1,
    timeOfDay: 'morning',
    timeIndex: 0,
    finalDay: 0,
    characters: [],
    aliveCharacters: [],
    deadCharacters: [],
    isMultiplayer: false,
    isOver: false,
    usedCards: [],
    reviveQueue: [],   // { characterId, daysRemaining, cost }
    cardResults: [],   // bu turdaki seçimler
    playerCharacterId: null,

    // Yeni enerji/aksiyon state
    energy: {},
    actionsThisSlot: 0,
    fateCountToday: {},
    playerDone: {},
    currentActionType: null,

    // Envanter / Skill / Ekipman sistemi
    acquiredSkills: [],
    equippedSkills: [],
    equipment: { head: null, body: null, legs: null, feet: null, necklace: null, ring1: null, ring2: null },
    ownedEquipment: [],
    ownedArtifacts: [],

    // Level / XP sistemi
    xp: 0,
    level: 1,
    xpToLevel: [0, 500, 600, 750, 900, 1100, 1400, 1800, 2300, 3000],

    // Demirci crafting kuyrugu
    craftingQueue: [], // [{charId, setName, pieceSlot, dayOrdered}]
    shelterBuilt: false,

    getPlayerCharacter() {
        if (!this.isMultiplayer) return this.characters[0];
        return this.characters.find(c => c.id === this.playerCharacterId) || this.characters[0];
    },

    // --- Başlatma ---

    initCharacterState(char) {
        this.energy[char.id] = DAILY_ENERGY;
        this.fateCountToday[char.id] = 0;
        this.playerDone[char.id] = false;
    },

    startNew(playerName, characterId) {
        const charData = getCharacterById(characterId);
        if (!charData) return;

        if (characterId === 'bulent') {
            playerName = playerName || 'Bülent Ersoy';
        }

        this.isMultiplayer = false;
        if (CONFIG) CONFIG.gameMode = 'turn-based'; // Singleplayer her zaman sira tabanli
        this.day = 1;
        this.timeIndex = 0;
        this.timeOfDay = 'morning';
        this.finalDay = MIN_END_DAY + Math.floor(Math.random() * (MAX_END_DAY - MIN_END_DAY + 1));
        this.isOver = false;
        this.usedCards = [];
        this.reviveQueue = [];
        this.cardResults = [];
        this.energy = {};
        this.actionsThisSlot = 0;
        this.fateCountToday = {};
        this.playerDone = {};
        this.currentActionType = null;
        EventSystem.init();

        const isBulent = characterId === 'bulent';
        // Config stats'ı karaktere uygula (sadece başlangıçta)
        applyConfigStats(charData);

        // Per-karakter envanter state'i
        var charInv = {
            acquiredSkills: charData.characterSkills ? [...charData.characterSkills] : [],
            equippedSkills: charData.characterSkills ? [...charData.characterSkills].slice(0, 5) : [],
            equipment: { head: null, body: null, legs: null, feet: null, necklace: null, ring1: null, ring2: null },
            ownedEquipment: [],
            ownedArtifacts: []
        };

        this.characters = [{
            id: charData.id,
            name: playerName || charData.name,
            displayName: charData.displayName || charData.name,
            hearts: isBulent ? 4 : charData.hearts,
            maxHearts: charData.maxHearts,
            baseSkills: [...charData.baseSkills],
            synergy: charData.synergy ? { ...charData.synergy } : null,
            canRevive: charData.canRevive,
            isBulent: isBulent,
            bulentDayOneDeaded: false,
            role: charData.role,
            portrait: charData.portrait,
            _inv: charInv
        }];

        this.aliveCharacters = [...this.characters];
        this.deadCharacters = [];
        this.initCharacterState(this.characters[0]);

        // Başlangıç skill'leri
        this.acquiredSkills = charData.characterSkills ? [...charData.characterSkills] : [];
        this.equippedSkills = charData.characterSkills ? [...charData.characterSkills].slice(0,5) : [];
        this.equipment = { head: null, body: null, legs: null, feet: null, necklace: null, ring1: null, ring2: null };
        // Başlangıç ekipmanı: 2 rastgele COMMON parça
        charInv.ownedEquipment = [];
        var commonEq = getEquipmentByRarity('common');
        while (charInv.ownedEquipment.length < 2) {
            var rnd = commonEq[Math.floor(Math.random() * commonEq.length)];
            if (rnd && charInv.ownedEquipment.indexOf(rnd.id) < 0) charInv.ownedEquipment.push(rnd.id);
        }
        this.ownedEquipment = [...charInv.ownedEquipment];
        this.ownedArtifacts = [];
        this._dungeonLobbies = {};
        this.xp = 0;
        this.level = 1;

        ResourceManager.init(
            10 + (charData.id === 'dominic' ? 5 : 0),
            5 + (charData.id === 'dominic' ? 3 : 0),
            3 + (charData.id === 'dominic' ? 4 : 0)
        );

        ScreenManager.show('game-screen');
        this.updateHUD();
        this.renderCharacterBar();
        this.showStoryIntro();
    },

    loadState(saved) {
        this.day = saved.day;
        this.timeIndex = saved.timeIndex;
        this.timeOfDay = saved.timeOfDay;
        this.finalDay = saved.finalDay || saved.endDay || 30;
        this.isOver = saved.isOver;
        this.isMultiplayer = saved.isMultiplayer;
        this.usedCards = saved.usedCards || [];
        this.reviveQueue = saved.reviveQueue || [];
        this.cardResults = [];
        this.characters = saved.characters;
        this.aliveCharacters = this.characters.filter(c => c.hearts > 0);
        this.deadCharacters = this.characters.filter(c => c.hearts <= 0);
        this.energy = saved.energy || {};
        this.actionsThisSlot = saved.actionsThisSlot || 0;
        this.fateCountToday = saved.fateCountToday || {};
        this.playerDone = saved.playerDone || {};
        this.currentActionType = null;
        this.acquiredSkills = saved.acquiredSkills || [];
        this.equippedSkills = saved.equippedSkills || [];
        this.equipment = saved.equipment || { head: null, body: null, legs: null, feet: null, necklace: null, ring1: null, ring2: null };
        if (!('necklace' in this.equipment)) this.equipment.necklace = null;
        if (!('ring1' in this.equipment)) this.equipment.ring1 = null;
        if (!('ring2' in this.equipment)) this.equipment.ring2 = null;
        this.ownedEquipment = saved.ownedEquipment || [];
        this.ownedArtifacts = saved.ownedArtifacts || [];
        this.xp = saved.xp || 0;
        this.level = saved.level || 1;
        this.defeatedBosses = saved.defeatedBosses || [];
        this.shelterBuilt = saved.shelterBuilt || false;
        this.craftingQueue = saved.craftingQueue || [];
        this._dungeonLobbies = {};

        // Eksik state alanlarını başlat
        this.characters.forEach(c => {
            if (this.energy[c.id] === undefined) this.initCharacterState(c);
        });

        EventSystem.init();
        ResourceManager.loadSnapshot(saved.resources);
        ScreenManager.show('game-screen');
        this.updateHUD();
        this.renderCharacterBar();
        // Kayıtlı oyun gün 1 sabah ise hikayeyi göster
        if (this.day === 1 && this.timeIndex === 0 && this.actionsThisSlot === 0) {
            this.showStoryIntro();
        } else {
            this.startTurn();
        }
    },

    // --- Hikaye Giriş ---

    showStoryIntro() {
        const overlay = document.getElementById('story-intro-overlay');
        const titleEl = document.getElementById('story-intro-title');
        const textEl = document.getElementById('story-intro-text');
        const btn = document.getElementById('btn-story-continue');
        if (!overlay || !textEl) { this.startTurn(); return; }

        // Her karakterin hikayesini character-data.js'teki "story" alanından al
        const charDataMap = {};
        this.characters.forEach(c => {
            const full = getCharacterById(c.id);
            charDataMap[c.id] = full ? full.story : '';
        });

        const myChar = this.getPlayerCharacter();
        const myStory = charDataMap[myChar.id] || '';

        // Adım 1: Oyuncunun kendi karakter hikayesi
        const charNames = this.characters.map(c => c.displayName);
        const charList = charNames.length > 1
            ? charNames.slice(0, -1).join(', ') + ' ve ' + charNames.slice(-1)
            : charNames[0];

        this._storyStep = 1;
        titleEl.textContent = myChar.displayName;
        textEl.innerHTML = `<span class="highlight">Sen ${myChar.displayName} olarak...</span>\n\n${myStory}`;
        overlay.style.display = 'flex';
        btn.classList.remove('show');
        setTimeout(() => btn.classList.add('show'), 1500);

        btn.onclick = () => {
            if (this._storyStep === 1) {
                // Adım 2: Tüm karakterlerin kasabaya geliş hikayesi
                this._storyStep = 2;
                titleEl.textContent = 'Kasabaya Doğru...';
                let allStories = `<span class="highlight">${charList}.</span>\n\nKaranlık çöktüğünde, hayatta kalanlar bir kasabaya sığındı.\n\n`;
                this.characters.forEach(c => {
                    const s = charDataMap[c.id];
                    if (s) {
                        allStories += `<span class="highlight">${c.displayName}:</span> ${s}\n\n`;
                    }
                });
                allStories += `<span class="highlight">Bu kasaba ayakta kalmalı.</span>`;
                textEl.innerHTML = allStories;
                btn.classList.remove('show');
                setTimeout(() => btn.classList.add('show'), 2000);
            } else {
                // Oyunu başlat
                overlay.style.display = 'none';
                this.startTurn();
            }
        };
    },

    // --- Günlük / Slot Sıfırlama ---

    resetDailyState() {
        this.characters.forEach(c => {
            this.energy[c.id] = DAILY_ENERGY;
            this.fateCountToday[c.id] = 0;
        });
    },

    resetSlotState() {
        this.actionsThisSlot = 0;
        this.currentActionType = null;
        this.cardResults = [];
        this.characters.forEach(c => {
            this.playerDone[c.id] = false;
        });
    },

    // --- Gün / Tur Yönetimi ---

    _realtimeTimer: null,
    _realtimeSeconds: 0,

    startTurn() {
        if (this.isOver) return;

        if (typeof updateTimeOfDayVisuals === 'function') updateTimeOfDayVisuals(this.timeOfDay);

        this.checkBulentDayOne();
        this.processReviveQueue();

        const event = EventSystem.checkForEvent(this.day, this.timeOfDay);
        if (event) {
            this.showEvent(event);
        }

        this.resetSlotState();
        this.updateHUD();
        this.renderCharacterBar();
        this.showActionButtons();
        this.autoSave();
    },

    // --- Aksiyon Butonları ---

    showActionButtons() {
        const char = this.getPlayerCharacter();
        if (!char || char.hearts <= 0) return;

        const container = document.getElementById('choices-container');
        const scenarioText = document.getElementById('scenario-text');
        const scenarioIcon = document.getElementById('scenario-icon');
        if (!container) return;

        container.innerHTML = '';
        container.className = 'action-mode';

        const isEvening = this.timeOfDay === 'evening';

        const actions = [
            { type: 'party-dungeon', label: 'Zindan',  icon: '⚔️', cost: ENERGY_COST.combat, cssClass: 'action-combat', sub: `⚡-${ENERGY_COST.combat} | Takımca` },
            { type: 'combat', label: 'Hızlı Zindan',  icon: '🛡️', cost: ENERGY_COST.combat, cssClass: 'action-combat', sub: `⚡-${ENERGY_COST.combat} | Tek başına` },
            { type: 'kader',  label: 'Kader',  icon: '🌙', cost: ENERGY_COST.kader,  cssClass: 'action-kader',  sub: `⚡-${ENERGY_COST.kader} | ${(this.fateCountToday[char.id]||0)}/${MAX_FATE_PER_DAY}` },
            { type: 'rest',   label: 'Dinlen', icon: '🏕️', cost: 0, cssClass: 'action-rest',   sub: 'Zaman geçsin' }
        ];

        // Demirci butonu (Gökdeniz hayattaysa, şartsız)
        var gokdenizAlive = this.aliveCharacters.some(function(c) { return c.id === 'gokdeniz'; });
        if (gokdenizAlive) {
            actions.push({ type: 'blacksmith', label: 'Demirci', icon: '🔨', cost: 0, cssClass: 'action-kader', sub: 'Ekipman üret | Maden:' + ResourceManager.maden });
        }

        // İrem ise Diriltme butonu her zaman gözüksün
        if (char.id === 'irem') {
            var hasDead = this.deadCharacters.length > 0;
            var hasEnergy = (this.energy[char.id] || 0) >= 10;
            var subText = !hasDead ? 'Diriltilecek kimse yok' : (!hasEnergy ? 'Yetersiz enerji (' + (this.energy[char.id]||0) + '/10⚡)' : 'Ölü karakteri dirilt (10⚡)');
            actions.push({ type: 'revive', label: 'Diriltme', icon: '✨', cost: 10, cssClass: 'action-sleep', sub: subText });
        }

        // Pazar/Market butonu (1 enerji)
        if (this.energy[char.id] >= 1) {
            actions.push({ type: 'market', label: 'Pazar', icon: '🛒', cost: 1, cssClass: 'action-kader', sub: 'Uzak tüccar (1⚡) | Altın:' + ResourceManager.gold });
        }

        // Barınak inşaa butonu (10 odun, bir kere)
        if (!this.shelterBuilt) {
            var canBuild = ResourceManager.wood >= 10;
            actions.push({ type: 'build', label: 'İnşaa', icon: '🏚️', cost: 0, cssClass: 'action-rest', sub: canBuild ? 'Barınak inşaa et (10🪵)' : 'Yetersiz odun (' + ResourceManager.wood + '/10🪵)' });
        }

        // Akşam ise Uyu butonu ekle
        if (isEvening) {
            var healInfo = this.shelterBuilt ? ' (+1❤️ barınak)' : '';
            actions.push({ type: 'sleep', label: 'Uyu', icon: '🌙', cost: 0, cssClass: 'action-sleep', sub: 'Günü bitir, yarına geç' + healInfo });
        }

        // Config'den ikon config'ini al
        const iconCfg = (CONFIG && CONFIG.actionIcons) ? CONFIG.actionIcons : {};
        const typeToKey = {
            'party-dungeon': 'zindan', 'combat': 'hizli-zindan', 'kader': 'kader',
            'rest': 'dinlen', 'blacksmith': 'demirci', 'revive': 'diriltme',
            'market': 'pazar', 'build': 'insaa', 'sleep': 'uyu'
        };
        function getIconHTML(type) {
            var key = typeToKey[type] || type;
            var cfg = iconCfg[key];
            if (cfg && cfg.image) {
                return '<img class="action-icon-img" src="' + cfg.image + '" alt="">';
            }
            var icon = (cfg && cfg.icon) ? cfg.icon : '•';
            return '<span class="action-icon">' + icon + '</span>';
        }

        actions.forEach(a => {
            const enabled = this.canDoAction(char, a.type);
            const btn = document.createElement('div');
            btn.className = 'action-card ' + a.cssClass + (enabled ? '' : ' disabled');
            btn.innerHTML = getIconHTML(a.type) + `
                <span class="action-info">
                    <span class="action-label">${a.label}</span>
                    <span class="action-sub">${a.sub}</span>
                </span>
            `;
            if (enabled) {
                btn.addEventListener('click', () => {
                    Game.performAction(a.type);
                    try { AudioManager.playClick(); } catch(e) {}
                });
            }
            container.appendChild(btn);
        });

        if (scenarioText) {
            scenarioText.textContent = isEvening ? 'Akşam oldu. Günü bitir veya son bir hamle yap.' : 'Ne yapmak istersin?';
        }
        if (scenarioIcon) scenarioIcon.textContent = isEvening ? '🌅' : '⏳';
        document.getElementById('scenario-image').style.display = 'none';
        document.getElementById('card-area').style.display = '';

        this.updateEnergyDisplay(char);
        this.updateFateDisplay(char);
        this.updateActionCounter();
    },

    canDoAction(char, actionType) {
        if (this.isOver) return false;
        if (char.hearts <= 0) return false;

        // Uyu her zaman serbest
        if (actionType === 'sleep') return true;

        // Pazar: 1 enerji, altin var
        if (actionType === 'market') {
            return (this.energy[char.id] || 0) >= 1;
        }

        // İnşaa: 10 odun, barınak yoksa
        if (actionType === 'build') {
            return !this.shelterBuilt && ResourceManager.wood >= 10;
        }

        // Partili Zindan: yaşayan en az 1 karakter
        if (actionType === 'party-dungeon') {
            return this.aliveCharacters.length >= 1 && !this.playerDone[char.id];
        }

        // Demirci: Gökdeniz hayatta olsun yeter
        if (actionType === 'blacksmith') {
            return this.aliveCharacters.some(function(c) { return c.id === 'gokdeniz'; });
        }

        // Diriltme: Iremsen her zaman goster, ama sadece sartlar uygunsa aktif
        if (actionType === 'revive') {
            if (char.id !== 'irem') return false;
            if (this.deadCharacters.length === 0) return false;
            return (this.energy[char.id] || 0) >= 10;
        }

        // Dinlen her zaman serbest (0 enerji)
        if (actionType === 'rest') return !this.playerDone[char.id];

        if (this.playerDone[char.id]) return false;

        const cost = ENERGY_COST[actionType] || 0;
        if ((this.energy[char.id] || 0) < cost) return false;

        if (actionType === 'kader') {
            if ((this.fateCountToday[char.id] || 0) >= MAX_FATE_PER_DAY) return false;
        }

        return true;
    },

    performAction(actionType) {
        const char = this.getPlayerCharacter();
        if (!this.canDoAction(char, actionType)) return;

        if (actionType === 'build') {
            ResourceManager.spend(0, 10, 0);
            this.shelterBuilt = true;
            this.log(char.displayName + ' barinak insa etti! (10🪵)', 'event');
            this.showResult('İnşaa Tamamlandı!', 'Guvenli bir barinak insa ettin!\nArtik uyuyunca +1❤️ iyilesirsin.', {});
            document.getElementById('btn-result-continue').onclick = function() {
                Game.hideResult();
                Game.afterAction(char, null, null, 'rest');
            };
            return;
        }

        if (actionType === 'party-dungeon') {
            this.energy[char.id] -= ENERGY_COST.combat;
            this.updateEnergyDisplay(char);
            this.showPartyDungeonUI(char);
            return;
        }

        if (actionType === 'blacksmith') {
            this.showBlacksmithUI(char);
            return;
        }

        if (actionType === 'sleep') {
            // Barinak varsa +1 kalp
            if (this.shelterBuilt && char.hearts < char.maxHearts) {
                char.hearts = Math.min(char.maxHearts, char.hearts + 1);
                this.log(char.displayName + ' barinakta dinlendi. +1❤️', 'positive');
                this.renderCharacterBar();
            }
            console.log('=== UYU CALISTI === gun:', this.day, 'zaman:', this.timeOfDay);
            // Tum overlayleri kapat
            var ov = document.getElementById('result-overlay');
            var ca = document.getElementById('combat-area');
            if (ov) ov.style.display = 'none';
            if (ca) ca.style.display = 'none';

            // Günü sonlandır
            this.endDay();
            // Yeni güne geç
            this.timeIndex = 0;
            this.day++;
            this.timeOfDay = 'morning';
            this.resetDailyState();
            this.actionsThisSlot = 0;
            this.playerDone[char.id] = false;
            this.currentActionType = null;
            console.log('=== YENI GUN === gun:', this.day, 'zaman:', this.timeOfDay, 'enerji:', this.energy[char.id]);
            this.log(`${char.displayName} uyudu. ${this.day}. gün başlıyor...`, 'event');

            // Oyun sonu kontrolü
            if (this.day >= this.finalDay) { this.endGame('victory'); return; }
            if (this.aliveCharacters.length === 0) { this.endGame('defeat'); return; }

            // Özel durum kontrolleri
            this.checkBulentDayOne();
            this.processReviveQueue();
            this.processCraftingQueue();

            // Yeni gün eventi
            var ev = EventSystem.checkForEvent(this.day, this.timeOfDay);
            if (ev) { console.log('Event tetiklendi:', ev.title); this.showEvent(ev); }

            // UI'yi tamamen yenile
            this.updateHUD();
            this.updateEnergyDisplay(char);
            this.updateFateDisplay(char);
            this.updateActionCounter();
            this.renderCharacterBar();

            // Kart alanını göster ve aksiyon butonlarını renderla
            var cardArea = document.getElementById('card-area');
            if (cardArea) cardArea.style.display = '';
            this.showActionButtons();
            this.autoSave();
            return;
        }

        if (actionType === 'market') {
            this.energy[char.id] -= 1;
            this.updateEnergyDisplay(char);
            var items = [], rarities = ['common','common','common','uncommon','uncommon','rare'];
            for (var mi = 0; mi < 3; mi++) {
                var rar = rarities[Math.floor(Math.random() * rarities.length)];
                var pool = getEquipmentByRarity(rar);
                if (pool.length > 0) items.push({ item: pool[Math.floor(Math.random() * pool.length)], rarity: rar });
            }
            var priceMap = { common: 12, uncommon: 20, rare: 35 };
            var container = document.getElementById('choices-container');
            if (container) {
                container.innerHTML = '';
                container.className = 'action-mode';
                var self = this;
                items.forEach(function(it) {
                    var price = priceMap[it.rarity] || 12;
                    var canBuy = ResourceManager.gold >= price;
                    var btn = document.createElement('div');
                    btn.className = 'action-card action-kader' + (canBuy ? '' : ' disabled');
                    btn.innerHTML = '<span class=\"action-icon\">🛡️</span><span class=\"action-info\"><span class=\"action-label\">' + it.item.name + '</span><span class=\"action-sub\">' + it.rarity + ' | ' + price + '🪙</span></span>';
                    if (canBuy) btn.addEventListener('click', function(it2, pr) { return function() {
                        ResourceManager.spend(0, 0, pr);
                        if (!Game.ownedEquipment) Game.ownedEquipment = [];
                        if (Game.ownedEquipment.indexOf(it2.id) < 0) Game.ownedEquipment.push(it2.id);
                        Game.autoSave();
                        Game.log('Pazardan ' + it2.name + ' alindi! (-' + pr + '🪙)', 'positive');
                        Game.showResult('Satin Alindi!', it2.name + '\n' + it2.rarity + '\n' + pr + ' altin', {});
                        document.getElementById('btn-result-continue').onclick = function() { Game.hideResult(); Game.afterAction(char, null, null, 'rest'); };
                    }; }(it.item, price));
                    container.appendChild(btn);
                });
                var backBtn = document.createElement('div');
                backBtn.className = 'action-card action-rest';
                backBtn.innerHTML = '<span class=\"action-icon\">↩️</span><span class=\"action-info\"><span class=\"action-label\">Geri Don</span></span>';
                backBtn.addEventListener('click', function() { Game.afterAction(char, null, null, 'rest'); });
                container.appendChild(backBtn);
                document.getElementById('scenario-text').textContent = 'Tuccar: Esyalarima bak! (Altin: ' + ResourceManager.gold + '🪙)';
            }
            return;
        }

        if (actionType === 'revive') {
            // Diriltme: 10 enerji ile ölü karakteri dirilt
            this.energy[char.id] -= 10;
            var dead = this.deadCharacters[0];
            if (dead) {
                dead.hearts = dead.maxHearts;
                this.aliveCharacters.push(dead);
                this.deadCharacters = this.deadCharacters.filter(function(c) { return c.id !== dead.id; });
                this.initCharacterState(dead);
                this.log(char.displayName + ' ' + dead.displayName + 'i diriltti! (10 enerji)', 'event');
                this.renderCharacterBar();
                this.updateEnergyDisplay(char);
                this.showResult('Diriltme!', dead.displayName + ' hayata döndü!', {});
                document.getElementById('btn-result-continue').onclick = function() {
                    Game.hideResult();
                    Game.afterAction(char, null, null, 'rest');
                };
                return;
            }
        }

        if (actionType === 'combat' || actionType === 'kader') {
            this.energy[char.id] -= ENERGY_COST[actionType];
        }

        if (actionType === 'kader') {
            this.fateCountToday[char.id] = (this.fateCountToday[char.id] || 0) + 1;
        }

        if (actionType !== 'market' && actionType !== 'build') {
            this.actionsThisSlot++;
        }
        this.currentActionType = actionType;

        this.updateEnergyDisplay(char);
        this.updateFateDisplay(char);
        this.updateActionCounter();

        if (actionType === 'combat') {
            CombatSystem.startCombat(char);
        } else if (actionType === 'rest') {
            this.playerDone[char.id] = true;
            this.log(char.displayName + ' dinlendi.', '');
            this.showResult('Dinlenme', char.displayName + ' dinlendi. Zaman ilerliyor...', {});

            document.getElementById('btn-result-continue').onclick = function() {
                Game.hideResult();
                Game.afterAction(char, null, null, 'rest');
            };
        } else {
            CardSystem.drawCards(actionType === 'kader' ? 'kader' : 'danger');
        }
    },

    afterAction(char, card, choice, actionType) {
        actionType = actionType || this.currentActionType;
        this.currentActionType = null;

        // Bu oyuncunun devam edebilecek enerjisi var mı?
        const remainingEnergy = this.energy[char.id] || 0;
        const canCombat = remainingEnergy >= ENERGY_COST.combat;
        const canKader = remainingEnergy >= ENERGY_COST.kader && (this.fateCountToday[char.id] || 0) < MAX_FATE_PER_DAY;

        if (!canCombat && !canKader) {
            this.playerDone[char.id] = true;
        }

        if (!this.isMultiplayer) {
            this.checkTimeAdvance();
        } else {
            Multiplayer.send({
                type: 'player-action',
                characterId: char.id,
                playerName: char.name,
                actionType: actionType,
                choiceText: choice ? choice.text : (actionType === 'rest' ? 'dinlendi' : 'savasti'),
                done: this.playerDone[char.id]
            });
            if (this.playerDone[char.id]) {
                this.advanceTime();
            } else {
                this.showActionButtons();
            }
        }
    },

    checkTimeAdvance() {
        if (this.isOver) return;

        const allDone = this.characters.every(c => {
            if (c.hearts <= 0) return true;
            return this.playerDone[c.id];
        });

        if (allDone) {
            this.advanceTime();
        } else {
            this.showActionButtons();
        }
    },

    advanceTime() {
        this.timeIndex++;
        if (this.timeIndex >= TIMES_OF_DAY.length) {
            this.endDay();
            this.timeIndex = 0;
            this.day++;
            this.resetDailyState();
        }
        this.timeOfDay = TIMES_OF_DAY[this.timeIndex];
        if (typeof updateTimeOfDayVisuals === 'function') updateTimeOfDayVisuals(this.timeOfDay);

        if (this.day >= this.finalDay) {
            this.endGame('victory');
            return;
        }

        if (this.aliveCharacters.length === 0) {
            this.endGame('defeat');
            return;
        }

        this.startTurn();
    },

    endDay() {
        const aliveCount = this.aliveCharacters.length;
        if (aliveCount > 0) {
            const couldFeed = ResourceManager.consumeDailyFood(aliveCount);
            if (!couldFeed) {
                this.aliveCharacters.forEach(c => {
                    c.hearts = Math.max(0, c.hearts - 1);
                });
                this.log('Kıtlık! Yeterli yemek olmadığı için herkes 1 kalp kaybetti.', 'negative');
                this.checkDeaths();
            }
        }
    },

    // --- Bülent Özel ---

    checkBulentDayOne() {
        const bulent = this.characters.find(c => c.id === 'bulent');
        if (!bulent || bulent.bulentDayOneDeaded) return;

        if (this.day === 1 && this.timeOfDay === 'evening') {
            bulent.hearts = 0;
            bulent.bulentDayOneDeaded = true;
            this.aliveCharacters = this.aliveCharacters.filter(c => c.id !== 'bulent');
            this.deadCharacters.push(bulent);
            this.playerDone['bulent'] = true;
            this.log('Bülent Ersoy sahneden ayrıldı... Ama bu bir veda değil, sadece bir perde arası.', 'event');
        }

        if (this.day === 2 && this.timeOfDay === 'morning' && bulent.bulentDayOneDeaded) {
            const selectedIds = this.characters.map(c => c.id);
            const unselected = getUnselectedCharacters(selectedIds);
            if (unselected.length > 0) {
                const chosen = unselected[Math.floor(Math.random() * unselected.length)];
                bulent.hearts = chosen.hearts;
                bulent.maxHearts = chosen.maxHearts;
                bulent.baseSkills = [...chosen.baseSkills];
                bulent.synergy = chosen.synergy ? { ...chosen.synergy } : null;
                bulent.canRevive = chosen.canRevive;
                bulent.role = chosen.role;
                bulent.displayName = chosen.name;
                bulent.hearts = chosen.hearts;
                this.aliveCharacters.push(bulent);
                this.deadCharacters = this.deadCharacters.filter(c => c.id !== 'bulent');
                this.initCharacterState(bulent);
                this.log(`Bülent Ersoy küllerinden ${chosen.name} olarak doğdu!`, 'event');
            }
        }
    },

    // --- Dirilme / Can ---

    processReviveQueue() {
        const completed = [];
        this.reviveQueue = this.reviveQueue.filter(entry => {
            entry.daysRemaining--;
            if (entry.daysRemaining <= 0) {
                completed.push(entry);
                return false;
            }
            return true;
        });

        completed.forEach(entry => {
            const char = this.characters.find(c => c.id === entry.characterId);
            if (char) {
                char.hearts = char.maxHearts;
                this.aliveCharacters.push(char);
                this.deadCharacters = this.deadCharacters.filter(c => c.id !== char.id);
                this.initCharacterState(char);
                this.log(`${char.displayName} dirildi!`, 'positive');
            }
        });
    },

    processCraftingQueue() {
        var self = this;
        this.craftingQueue = this.craftingQueue.filter(function(entry) {
            if (self.day > entry.dayOrdered) {
                // Ertesi sabah teslim
                var set = EQUIPMENT_SETS.find(function(s) { return s.name === entry.setName; });
                if (set) {
                    var piece = set.pieces.find(function(p) { return p.slot === entry.pieceSlot; });
                    if (piece) {
                        if (!self.ownedEquipment) self.ownedEquipment = [];
                        if (self.ownedEquipment.indexOf(piece.id) < 0) self.ownedEquipment.push(piece.id);
                        self.log('🔨 Eşya uretimi tamamlandi: ' + piece.name + ' envanterine eklendi!', 'event');
                        self.showResult('Eşya Üretildi!', piece.name + ' envanterine eklendi.\nSet: ' + entry.setName, {});
                        var ov = document.getElementById('result-overlay');
                        if (ov) {
                            document.getElementById('btn-result-continue').onclick = function() {
                                ov.style.display = 'none';
                            };
                        }
                    }
                }
                return false;
            }
            return true;
        });
    },

    _getCraftCost: function(setRarity, pieceSlot) {
        // Rare: 22-28, Epic: 38-48
        var baseByRarity = { rare: 22, epic: 38 };
        var slotMult = { head: 1.0, body: 1.3, legs: 1.1, feet: 1.0 };
        return Math.round((baseByRarity[setRarity] || 25) * (slotMult[pieceSlot] || 1.0));
    },

    showBlacksmithUI: function(char) {
        var self = this;
        var charName = char.displayName || char.name;
        var dialogue = char.id === 'gokdeniz'
            ? '"Kendi ocagima hos geldin. Ne istersin?"'
            : '"Ben Gokdeniz. Kasabanin demircisi. ' + charName + ', sana nasil yardim edebilirim?"';

        // Rare ve epic setleri topla
        var rareSets = EQUIPMENT_SETS.filter(function(s) { return s.rarity === 'rare' || s.rarity === 'epic'; });

        var slots = [
            { slot: 'head', label: 'Başlık', icon: '🪖' },
            { slot: 'body', label: 'Zırh',   icon: '🛡️' },
            { slot: 'legs', label: 'Pantolon', icon: '👖' },
            { slot: 'feet', label: 'Bot',    icon: '👢' }
        ];

        var inQueue = this.craftingQueue.filter(function(e) { return e.dayOrdered >= self.day; }).length;

        // Tüm parçaları grid olarak listele
        var rowsHtml = '';
        rareSets.forEach(function(set) {
            var rarityColor = set.rarity === 'epic' ? '#c8a84e' : '#5b8bd5';
            rowsHtml += '<div style="color:' + rarityColor + ';font-family:var(--font-heading);font-size:0.9rem;padding:12px 0 4px;border-top:1px solid rgba(255,255,255,0.05);">' + set.name + ' <span style="font-size:0.6rem;color:var(--text-dim);">(' + set.rarity + ')</span></div>';
            rowsHtml += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">';
            slots.forEach(function(sl) {
                var cost = self._getCraftCost(set.rarity, sl.slot);
                var canAfford = ResourceManager.maden >= cost;
                var piece = set.pieces.find(function(p) { return p.slot === sl.slot; });
                var pieceName = piece ? piece.name : (set.name + ' ' + sl.label);
                rowsHtml += '<div class="craft-piece' + (canAfford ? '' : ' too-expensive') + '" ' +
                    'style="background:rgba(0,0,0,0.4);border:1px solid ' + (canAfford ? rarityColor : '#555') + ';border-radius:8px;padding:8px;text-align:center;cursor:' + (canAfford ? 'pointer' : 'not-allowed') + ';opacity:' + (canAfford ? '1' : '0.5') + ';transition:0.2s;" ' +
                    'onmouseover="if(' + canAfford + '){this.style.borderColor=\'#fff\';this.style.background=\'rgba(255,255,255,0.08)\';}" ' +
                    'onmouseout="if(' + canAfford + '){this.style.borderColor=\'' + rarityColor + '\';this.style.background=\'rgba(0,0,0,0.4)\';}" ' +
                    'onclick="if(' + canAfford + '){Game.orderCrafting(\'' + set.name + '\',\'' + sl.slot + '\');document.getElementById(\'blacksmith-modal\').remove();Game.afterAction(Game.getPlayerCharacter(),null,null,\'rest\');}">' +
                    '<span style="display:block;font-size:1.3rem;">' + sl.icon + '</span>' +
                    '<span style="font-size:0.65rem;color:var(--text-light);display:block;">' + pieceName + '</span>' +
                    '<span style="font-size:0.6rem;color:' + (canAfford ? '#ffaa44' : '#888') + ';font-weight:bold;">⛏️' + cost + '</span>' +
                    '</div>';
            });
            rowsHtml += '</div>';
        });

        var html =
            '<div class="modal-overlay" id="blacksmith-modal" style="display:flex;z-index:500;">' +
            '<div class="modal-box" style="max-width:680px;max-height:85vh;">' +
            '<div class="modal-header"><h2>🔨 Demirci Ocağı</h2>' +
            '<span style="color:#ffaa44;font-size:0.8rem;">⛏️ ' + ResourceManager.maden + ' maden</span>' +
            (inQueue > 0 ? '<span style="color:var(--gold);font-size:0.7rem;margin-left:8px;">📋 ' + inQueue + ' sipariş kuyrukta</span>' : '') +
            '<button class="modal-close" onclick="document.getElementById(\'blacksmith-modal\').remove();Game.afterAction(Game.getPlayerCharacter(),null,null,\'rest\');">&times;</button></div>' +
            '<div class="modal-body" style="max-height:60vh;overflow-y:auto;">' +
            '<p style="color:var(--gold);font-style:italic;margin-bottom:4px;">' + dialogue + '</p>' +
            '<p style="font-size:0.7rem;color:var(--text-dim);margin-bottom:8px;">⏳ Siparişler ertesi sabah envantere teslim edilir.</p>' +
            rowsHtml +
            '</div></div></div>';

        document.body.insertAdjacentHTML('beforeend', html);
    },

    orderCrafting: function(setName, pieceSlot) {
        var set = EQUIPMENT_SETS.find(function(s) { return s.name === setName; });
        if (!set) return;
        var cost = this._getCraftCost(set.rarity, pieceSlot);
        if (ResourceManager.maden < cost) {
            this.log('Yetersiz maden! ' + cost + ' ⛏️ gerekli.', 'negative');
            return;
        }
        var piece = set.pieces.find(function(p) { return p.slot === pieceSlot; });
        if (!piece) return;

        ResourceManager.spend(0, 0, 0, cost);
        this.craftingQueue.push({
            charId: this.getPlayerCharacter().id,
            setName: setName,
            pieceSlot: pieceSlot,
            dayOrdered: this.day
        });
        this.log('🔨 ' + piece.name + ' siparisi verildi! (-' + cost + '⛏️) Yarın sabah teslim.', 'event');
        this.showResult('Sipariş Verildi!', piece.name + '\nSet: ' + setName + '\n\n⏳ Ertesi sabah envanterinde olacak.\n💰 -' + cost + ' Maden (Kalan: ' + ResourceManager.maden + ')', {});
        document.getElementById('btn-result-continue').onclick = function() {
            Game.hideResult();
        };
    },

    _dungeonLobbies: {}, // { '2': { leader:charId, members:[charId,...] }, ... }

    showPartyDungeonUI: function(activeChar) {
        var self = this;
        if (!this._dungeonLobbies) this._dungeonLobbies = {};
        var alive = this.aliveCharacters;
        var myChar = activeChar || this.getPlayerCharacter();
        var myId = myChar ? myChar.id : null;

        // Multiplayer'da sunucudan gelen lobi state'ini kullan
        var lobbies = this._dungeonLobbies;

        var dungeons = [
            { size: 2, name: 'İkili Zindan', maxEnemy: 6, minEnemy: 3, level: 'D-C', color: '#6a9a5a', icon: '⚔️' },
            { size: 3, name: 'Üçlü Zindan', maxEnemy: 9, minEnemy: 5, level: 'D-B', color: '#5b8bd5', icon: '🛡️' },
            { size: 4, name: 'Dörtlü Zindan', maxEnemy: 11, minEnemy: 6, level: 'C-A', color: '#c8a84e', icon: '⚔️' },
            { size: 5, name: 'Beşli Zindan', maxEnemy: 14, minEnemy: 7, level: 'B-S', color: '#c860d0', icon: '💀' },
            { size: 6, name: 'Altılı Zindan', maxEnemy: 16, minEnemy: 8, level: 'A-S', color: '#ff6600', icon: '🔥' },
            { size: 7, name: 'Efsanevi', maxEnemy: 20, minEnemy: 10, level: 'A-SS', color: '#ff3333', icon: '👑', locked: alive.length < 7 }
        ];

        var gridCells = '';
        dungeons.forEach(function(dg) {
            var lobby = self._dungeonLobbies[dg.size];
            var members = lobby ? lobby.members : [];
            var leader = lobby ? lobby.leader : null;
            var iAmIn = myId && members.indexOf(myId) >= 0;
            var iAmLeader = leader === myId;
            var canStart = iAmLeader && members.length >= 1;

            var slotsHtml = '';
            for (var s = 0; s < dg.size; s++) {
                var chId = members[s];
                var ch = chId ? alive.find(function(c) { return c.id === chId; }) : null;
                if (ch) {
                    slotsHtml += '<div class="dng-slot filled" style="border-color:' + dg.color + ';position:relative;">' +
                        '<img src="' + (ch.portrait || '') + '">' +
                        (chId === leader ? '<span style="position:absolute;top:-6px;right:-6px;font-size:0.65rem;">👑</span>' : '') +
                        '</div>';
                } else {
                    slotsHtml += '<div class="dng-slot empty"></div>';
                }
            }
            var memberCount = members.length;
            var borderClr = canStart ? dg.color : (iAmIn ? '#6a9a5a' : 'rgba(255,255,255,0.1)');
            var statusText = dg.locked ? '🔒 Kilitli' : canStart ? '👑 Başlatmak için tıkla' : iAmIn ? '✅ Katıldın (lider bekleniyor)' : memberCount > 0 ? memberCount + ' kişi - Katıl' : 'Boş - Katıl';
            var cellClass = 'dungeon-cell' + (dg.locked ? ' locked' : '') + (canStart ? ' ready' : '') + (iAmIn ? ' joined' : '');

            gridCells +=
                '<div class="' + cellClass + '" style="border-color:' + borderClr + '" ' +
                'onmouseover="this.style.borderColor=\'' + dg.color + '\'" onmouseout="this.style.borderColor=\'' + borderClr + '\'" ' +
                'onclick="Game._dungeonCellClick(' + dg.size + ')">' +
                '<div class="dng-icon">' + dg.icon + '</div>' +
                '<div class="dng-name" style="color:' + dg.color + '">' + dg.name + '</div>' +
                '<div class="dng-info">' + dg.minEnemy + '-' + dg.maxEnemy + ' düşman | ' + dg.level + '</div>' +
                '<div class="dng-slots">' + slotsHtml + '</div>' +
                '<div class="dng-status" style="color:' + (canStart ? '#6a9a5a' : (iAmIn ? dg.color : '#888')) + '">' + statusText + '</div></div>';
        });

        var html =
            '<div class="modal-overlay" id="party-dungeon-modal" style="display:flex;z-index:500;">' +
            '<div class="modal-box" style="max-width:620px;max-height:90vh;">' +
            '<div class="modal-header"><h2>⚔️ Zindan Seferi</h2><span style="font-size:0.7rem;color:var(--text-dim);">👥 ' + alive.length + ' kişi</span><button class="modal-close" onclick="document.getElementById(\'party-dungeon-modal\').remove();Game.afterAction(Game.getPlayerCharacter(),null,null,\'rest\');">&times;</button></div>' +
            '<div class="modal-body" style="max-height:70vh;overflow-y:auto;padding:8px 12px;">' +
            '<p style="color:var(--gold);font-size:0.8rem;margin-bottom:10px;">Tıkla katıl. 👑 = lider. Lider başlatır. Tek başına da girebilirsin.</p>' +
            '<div class="dungeon-grid">' + gridCells + '</div>' +
            '</div></div></div>';

        document.body.insertAdjacentHTML('beforeend', html);
    },

    _dungeonCellClick: function(dgSize) {
        var self = this;
        if (!this._dungeonLobbies) this._dungeonLobbies = {};
        var lobby = this._dungeonLobbies[dgSize];
        var myChar = this.getPlayerCharacter();
        if (!myChar) return;
        var myId = myChar.id;
        var members = lobby ? lobby.members : [];
        var leader = lobby ? lobby.leader : null;
        var iAmIn = members.indexOf(myId) >= 0;

        // Multiplayer: sunucu uzerinden islem yap
        if (this.isMultiplayer) {
            if (iAmIn && leader === myId) {
                // Lider ve zaten icerde → canavar verisini olusturup sunucuya baslat
                document.getElementById('party-dungeon-modal').remove();
                // Host olarak canavar verisini olustur, server uzerinden tum oyunculari senkronize et
                var monsterData = CombatSystem.generatePartyMonsters(members.length, dgSize);
                Multiplayer.dungeonStart(dgSize, monsterData);
                return;
            }
            if (iAmIn && leader !== myId) {
                // Icinde ama lider degil → cik
                Multiplayer.dungeonLeave(dgSize);
                return;
            }
            // Disarida → katil (modal acik kalsin, sunucudan donus gelince _onDungeonUpdate yenileyecek)
            Multiplayer.dungeonJoin(dgSize);
            return;
        }

        // --- Singleplayer (eski davranis) ---

        // Lider ve zaten içerde → başlat
        if (iAmIn && leader === myId) {
            var alive = this.aliveCharacters;
            var fighters = [];
            members.forEach(function(id) {
                var ch = alive.find(function(c) { return c.id === id; });
                if (ch) fighters.push(ch);
            });
            if (fighters.length >= 1) {
                document.getElementById('party-dungeon-modal').remove();
                self._dungeonLobbies[dgSize] = null;
                CombatSystem.startPartyCombat(fighters, dgSize);
                return;
            }
        }

        // İçerde ama lider değil → çıkmak ister misin?
        if (iAmIn && leader !== myId) {
            if (confirm(myChar.displayName + ', zindandan ayrılmak ister misin?')) {
                lobby.members = members.filter(function(id) { return id !== myId; });
                if (lobby.members.length === 0) self._dungeonLobbies[dgSize] = null;
                else if (leader === myId && lobby.members.length > 0) lobby.leader = lobby.members[0];
            }
            document.getElementById('party-dungeon-modal').remove();
            self.showPartyDungeonUI();
            return;
        }

        // İçerde değil → katıl
        if (!this._dungeonLobbies[dgSize]) {
            this._dungeonLobbies[dgSize] = { leader: null, members: [] };
        }
        lobby = this._dungeonLobbies[dgSize];
        if (lobby.members.indexOf(myId) < 0) {
            lobby.members.push(myId);
        }
        if (!lobby.leader) lobby.leader = myId;

        document.getElementById('party-dungeon-modal').remove();
        self.showPartyDungeonUI();
    },

    // Sunucudan gelen dungeon lobby guncellemesi
    _onDungeonUpdate: function(lobbies) {
        this._dungeonLobbies = lobbies || {};
        // Eger zindan modali aciksa yenile
        var modal = document.getElementById('party-dungeon-modal');
        if (modal) {
            modal.remove();
            this.showPartyDungeonUI();
        }
    },

    // Sunucudan gelen zindan baslatma komutu
    _onDungeonStartCombat: function(msg) {
        var self = this;
        var modal = document.getElementById('party-dungeon-modal');
        if (modal) modal.remove();
        // Sadece benim karakterim gruptaysa zindan savasina gir
        var myChar = this.getPlayerCharacter();
        var myId = myChar ? myChar.id : null;
        var iAmIn = myId && (msg.memberIds || []).indexOf(myId) >= 0;
        if (!iAmIn) {
            this.log('Bir ekip zindana girdi!', 'event');
            return;
        }
        var alive = this.aliveCharacters;
        var fighters = [];
        (msg.memberIds || []).forEach(function(id) {
            var ch = alive.find(function(c) { return c.id === id; });
            if (ch) fighters.push(ch);
        });
        if (fighters.length >= 1) {
            this._dungeonLobbies[msg.dungeonSize] = null;
            CombatSystem.startPartyCombat(fighters, msg.dungeonSize, msg.monsters || null);
        }
    },

    startReviveRitual(characterId) {
        const char = this.characters.find(c => c.id === characterId);
        if (!char || char.hearts > 0) return false;

        const irem = this.aliveCharacters.find(c => c.id === 'irem');
        if (!irem) {
            this.log('Diriltme için İrem\'in hayatta olması gerekiyor.', 'negative');
            return false;
        }

        const ritualDays = REVIVE_RITUAL_DAYS.min +
            Math.floor(Math.random() * (REVIVE_RITUAL_DAYS.max - REVIVE_RITUAL_DAYS.min + 1));
        const cost = { food: 3, gold: 5 };

        if (!ResourceManager.canAfford(cost.food, cost.wood || 0, cost.gold)) {
            this.log('Diriltme ritüeli için yeterli kaynak yok! (3 yemek, 5 altın)', 'negative');
            return false;
        }

        ResourceManager.spend(cost.food, 0, cost.gold);
        this.reviveQueue.push({ characterId, daysRemaining: ritualDays, cost });
        this.log(`${char.displayName} için diriltme ritüeli başlatıldı. ${ritualDays} gün sürecek.`, 'event');
        return true;
    },

    checkDeaths() {
        const newlyDead = this.aliveCharacters.filter(c => c.hearts <= 0);
        newlyDead.forEach(c => {
            this.aliveCharacters = this.aliveCharacters.filter(a => a.id !== c.id);
            this.deadCharacters.push(c);
            this.playerDone[c.id] = true;
            this.log(`${c.displayName} öldü!`, 'negative');

            if (c.id === 'bulent' && this.day === 1) return;

            // İrem ölürse otomatik 2 gün sonra dirilir
            if (c.id === 'irem') {
                this.reviveQueue.push({ characterId: 'irem', daysRemaining: 2, cost: { food: 0, gold: 0 } });
                this.log('İrem öldü ama 2 gün sonra kendiliğinden dirilecek...', 'event');
            } else {
                const irem = this.aliveCharacters.find(a => a.id === 'irem');
                if (irem && ResourceManager.canAfford(3, 0, 5)) {
                    this.log('İrem bir diriltme ritüeli başlatabilir.', 'event');
                }
            }
        });

        if (this.aliveCharacters.length === 0) {
            this.endGame('defeat');
        }
    },

    // --- Etki Uygulama ---

    applyEffects(effects, character) {
        if (!effects) return;

        if (effects.heart !== undefined) {
            const newHearts = character.hearts + effects.heart;
            character.hearts = Math.max(0, Math.min(character.maxHearts, newHearts));
            if (effects.heart < 0) {
                AudioManager.playHeartBreak();
                this.log(`${character.displayName} ${Math.abs(effects.heart)} kalp kaybetti!`, 'negative');
            } else if (effects.heart > 0) {
                AudioManager.playHeartGain();
                this.log(`${character.displayName} ${effects.heart} kalp kazandı!`, 'positive');
            }
        }
        if (effects.food) ResourceManager.addFood(effects.food);
        if (effects.wood) ResourceManager.addWood(effects.wood);
        if (effects.gold) ResourceManager.addGold(effects.gold);

        this.checkDeaths();
        ResourceManager.updateHUD();
        this.renderCharacterBar();
    },

    // --- HUD ---

    updateHUD() {
        document.getElementById('hud-day').textContent = 'Gün: ' + this.day;
        document.getElementById('hud-time').textContent = TIME_LABELS[this.timeOfDay];
        this.updateLevelDisplay();

        const char = this.getPlayerCharacter();
        if (char) {
            this.updateEnergyDisplay(char);
            this.updateFateDisplay(char);
        }
        this.updateActionCounter();
    },

    updateEnergyDisplay(char) {
        const el = document.getElementById('hud-energy');
        if (!el) return;
        const e = this.energy[char.id] || 0;
        el.textContent = `⚡ ${e}/${DAILY_ENERGY}`;
        el.classList.toggle('energy-low', e <= 2);
    },

    updateFateDisplay(char) {
        const el = document.getElementById('hud-fate');
        if (!el) return;
        const c = this.fateCountToday[char.id] || 0;
        el.textContent = `🌙 ${c}/${MAX_FATE_PER_DAY}`;
    },

    updateActionCounter() {
        const el = document.getElementById('hud-actions');
        if (!el) return;
        el.textContent = `🎯 ${this.actionsThisSlot}/${ACTIONS_PER_TIME_CHANGE}`;
    },

    // --- Yardımcı ---

    log(msg, type = '') {
        const logEl = document.getElementById('log-entries');
        if (!logEl) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry ' + type;
        const prefix = type === 'positive' ? '+ ' : type === 'negative' ? '- ' : type === 'event' ? '* ' : '';
        entry.textContent = `[Gün ${this.day} - ${TIME_LABELS[this.timeOfDay]}] ${prefix}${msg}`;
        logEl.prepend(entry);

        while (logEl.children.length > 50) {
            logEl.removeChild(logEl.lastChild);
        }
    },

    showEvent(event) {
        if (!event) return;
        AudioManager.playEvent();
        this.log(`EVENT: ${event.title} - ${event.text}`, 'event');
        this.showResult(event.title, event.text, event.effects);

        // Event efekti: kalp ve kaynak değişimleri
        this.aliveCharacters.forEach(c => {
            if (event.effects.heart && event.effects.heart < 0) {
                c.hearts = Math.max(0, c.hearts + event.effects.heart);
            }
        });
        if (event.effects.food) ResourceManager.addFood(event.effects.food);
        if (event.effects.wood) ResourceManager.addWood(event.effects.wood);
        if (event.effects.gold) ResourceManager.addGold(event.effects.gold);

        this.checkDeaths();

        // Devam butonuna handler ata (bug fix)
        document.getElementById('btn-result-continue').onclick = () => {
            this.hideResult();
        };
    },

    showResult(title, text, effects) {
        var overlay = document.getElementById('result-overlay');
        var titleEl = document.getElementById('result-title');
        var textEl = document.getElementById('result-text');
        if (!overlay || !titleEl || !textEl) {
            this.log((title || '') + ': ' + (text || '').replace(/\n/g, ' '), '');
            return;
        }

        titleEl.textContent = title || '';

        // Metni <br> ile birlestir
        var html = (text || '').replace(/\n/g, '<br>');
        html += '<br><br>';

        if (effects) {
            var parts = [];
            if (effects.heart && effects.heart > 0) parts.push('❤️ +' + effects.heart);
            if (effects.heart && effects.heart < 0) parts.push('💔 ' + effects.heart);
            if (effects.food && effects.food > 0) parts.push('🍗 +' + effects.food);
            if (effects.food && effects.food < 0) parts.push('🍗 ' + effects.food);
            if (effects.wood && effects.wood > 0) parts.push('🪵 +' + effects.wood);
            if (effects.wood && effects.wood < 0) parts.push('🪵 ' + effects.wood);
            if (effects.gold && effects.gold > 0) parts.push('🪙 +' + effects.gold);
            if (effects.gold && effects.gold < 0) parts.push('🪙 ' + effects.gold);
            html += parts.join(' ');
        }
        textEl.innerHTML = html;
        overlay.style.display = 'flex';

        Animations.resultPopup(document.getElementById('result-box'));
    },

    hideResult() {
        document.getElementById('result-overlay').style.display = 'none';
    },

    endGame(type) {
        this.isOver = true;
        if (this._realtimeTimer) { clearInterval(this._realtimeTimer); this._realtimeTimer = null; }
        const overlay = document.getElementById('game-over-screen');
        const title = document.getElementById('game-over-title');
        const stats = document.getElementById('game-over-stats');

        if (type === 'victory') {
            title.textContent = 'Zafer!';
            title.style.color = 'var(--gold)';
            stats.textContent = `${this.day}. günde kurtuluşa ulaştınız!\nHayatta kalanlar: ${this.aliveCharacters.map(c => c.displayName).join(', ')}\nYemek: ${ResourceManager.food} | Odun: ${ResourceManager.wood} | Altın: ${ResourceManager.gold}`;
        } else {
            title.textContent = 'Yenilgi...';
            title.style.color = 'var(--red-light)';
            stats.textContent = `${this.day}. günde karanlığa yenildiniz.\nHerkes öldü.\nYemek: ${ResourceManager.food} | Odun: ${ResourceManager.wood} | Altın: ${ResourceManager.gold}`;
        }

        ScreenManager.show('game-over-screen');
        deleteSave();
        AudioManager.playEvent();
    },

    renderCharacterBar() {
        this.updateMyCharacter();
        this.updateOtherPlayers();
    },

    updateMyCharacter() {
        const char = this.getPlayerCharacter();
        if (!char) return;

        document.getElementById('my-char-name').textContent = char.name;
        const hearts = '❤️'.repeat(Math.max(0, char.hearts)) + '🖤'.repeat(char.maxHearts - Math.max(0, char.hearts));
        document.getElementById('my-char-hearts').textContent = hearts;

        const portrait = document.getElementById('my-portrait');
        portrait.src = char.portrait || '';
        portrait.onerror = () => portrait.classList.remove('has-image');
        portrait.onload = () => portrait.classList.add('has-image');
        if (!char.portrait) portrait.classList.remove('has-image');

        // Stats paneli (ekipman bonuslariyla)
        const statsEl = document.getElementById('my-char-stats');
        if (statsEl) {
            const fullChar = getCharacterById(char.id);
            const cs = (char.combatStats && char.combatStats.hp) ? char.combatStats : (fullChar ? fullChar.combatStats : (char.combatStats || {}));
            // Ekipman/artifact bonuslarini ekle
            var bonus = { hp:0, atk:0, def:0, mr:0, mag:0, spd:0, crit:0, mana:0 };
            if (this.equipment) {
                Object.values(this.equipment).forEach(function(eqId) {
                    if (!eqId) return;
                    var item = (typeof getEquipmentById === 'function' ? getEquipmentById(eqId) : null) || (typeof getArtifactById === 'function' ? getArtifactById(eqId) : null);
                    if (item && item.stats) {
                        Object.keys(item.stats).forEach(function(k) { bonus[k] = (bonus[k] || 0) + item.stats[k]; });
                    }
                });
            }
            var totalHp = (cs.hp || 0) + (bonus.hp || 0);
            var totalAtk = (cs.atk || 0) + (bonus.atk || 0);
            var totalDef = (cs.def || 0) + (bonus.def || 0);
            var totalMr = (cs.mr || 0) + (bonus.mr || 0);
            var totalMag = (cs.mag || 0) + (bonus.mag || 0);
            var totalCrit = (cs.crit || 0) + (bonus.crit || 0);
            statsEl.innerHTML = '<span>❤️HP:' + totalHp + '</span>' +
                '<span>⚔️ATK:' + totalAtk + '</span>' +
                '<span>🛡️DEF:' + totalDef + '</span>' +
                '<span>🔮MR:' + totalMr + '</span>' +
                '<span>✨BÜY:' + totalMag + '</span>' +
                '<span>💢Krit:%' + totalCrit + '</span>';
        }
    },

    updateOtherPlayers() {
        const list = document.getElementById('other-players-list');
        if (!list) return;
        list.innerHTML = '';

        const myChar = this.getPlayerCharacter();
        const others = this.characters.filter(c => c !== myChar);

        if (others.length === 0) {
            list.innerHTML = '<p style="color:var(--text-dim);font-size:0.75rem;">Diğer oyuncu yok</p>';
            return;
        }

        others.forEach(c => {
            const card = document.createElement('div');
            const isDone = this.playerDone[c.id];
            const isDead = c.hearts <= 0;
            card.className = 'other-player-card' + (isDead ? ' dead' : '') + (isDone ? ' done' : '');
            const hearts = '❤️'.repeat(Math.max(0, c.hearts)) + '🖤'.repeat(c.maxHearts - Math.max(0, c.hearts));
            card.innerHTML = `
                <div class="op-name">${c.name}</div>
                <div class="op-hearts">${hearts}</div>
                ${isDone && !isDead ? '<div class="op-done-badge">✓ Tamam</div>' : ''}
            `;
            list.appendChild(card);
        });
    },

    // Başarım / Seçim Geçmişi
    achievementHistory: [],

    recordChoice(charName, choiceText, effects) {
        this.achievementHistory.push({
            day: this.day,
            time: TIME_LABELS[this.timeOfDay],
            character: charName,
            choice: choiceText,
            effects: { ...effects }
        });
    },

    showAchievements() {
        const content = document.getElementById('achievements-content');
        if (!content) return;
        if (this.achievementHistory.length === 0) {
            content.innerHTML = '<p style="color:var(--text-dim)">Henüz seçim yapılmadı.</p>';
            return;
        }
        let html = '';
        let lastDay = 0;
        this.achievementHistory.forEach(a => {
            if (a.day !== lastDay) {
                if (lastDay > 0) html += '</div>';
                html += `<div class="achievement-day"><h4>Gün ${a.day} - ${a.time}</h4>`;
                lastDay = a.day;
            }
            const effText = [];
            if (a.effects.heart && a.effects.heart > 0) effText.push(`❤️+${a.effects.heart}`);
            if (a.effects.heart && a.effects.heart < 0) effText.push(`💔${a.effects.heart}`);
            if (a.effects.food) effText.push(`🍗${a.effects.food > 0 ? '+' : ''}${a.effects.food}`);
            if (a.effects.wood) effText.push(`🪵${a.effects.wood > 0 ? '+' : ''}${a.effects.wood}`);
            if (a.effects.gold) effText.push(`🪙${a.effects.gold > 0 ? '+' : ''}${a.effects.gold}`);
            html += `<div class="achievement-entry"><span class="ach-choice">${a.character}: "${a.choice}"</span> <span class="ach-effect">${effText.join(' ')}</span></div>`;
        });
        html += '</div>';
        content.innerHTML = html;
        document.getElementById('achievements-modal').style.display = 'flex';
    },

    // Harita Sistemi
    mapRegions: {},

    unlockRegion(category) {
        const regionMap = {
            food: 'forest', danger: 'cave', exploration: 'temple', nature: 'forest',
            social: 'village', magic: 'temple', dark: 'swamp', crafting: 'mountain',
            luck: 'lake', rest: 'forest', illness: 'swamp', milestone: 'castle', kader: 'temple'
        };
        const region = regionMap[category];
        if (region && !this.mapRegions[region]) {
            this.mapRegions[region] = true;
            this.log(`Yeni bölge keşfedildi!`, 'event');
        }
    },

    updateMapUI() {
        document.querySelectorAll('.map-region').forEach(el => {
            const region = el.dataset.region;
            if (this.mapRegions[region]) {
                el.classList.remove('locked');
                el.classList.add('unlocked');
            }
        });
    },

    // Barınak state
    shelterBuilt: false,

    // Boss state
    defeatedBosses: [],
    currentBossId: null,

    showMap() {
        var grid = document.getElementById('map-grid');
        if (!grid) { document.getElementById('map-modal').style.display = 'flex'; return; }

        grid.innerHTML = '';
        var self = this;

        // Kasaba (merkez)
        var townDiv = document.createElement('div');
        townDiv.className = 'map-region unlocked';
        townDiv.style.cssText = 'grid-column:1/-1;text-align:center;padding:8px;aspect-ratio:auto;min-height:auto;';
        townDiv.innerHTML = '<span class=\"map-icon\">🏚️</span><span class=\"map-label\">Kasaba (Guvenli Bolge)</span>';
        grid.appendChild(townDiv);

        // Boss'ları sırayla göster (5'ten 1'e)
        for (var i = 5; i >= 1; i--) {
            var boss = getBossByOrder(i);
            if (!boss) continue;
            var defeated = self.defeatedBosses.indexOf(boss.id) >= 0;
            var nextBoss = getBossByOrder(i + 1);
            var unlocked = i === 5 || (nextBoss && self.defeatedBosses.indexOf(nextBoss.id) >= 0);
            var div = document.createElement('div');
            div.className = 'map-region ' + (unlocked ? 'unlocked' : 'locked');
            div.setAttribute('data-boss', boss.id);
            if (unlocked && !defeated) {
                div.style.cursor = 'pointer';
                div.addEventListener('click', function(b) {
                    return function() {
                        self.currentBossId = b.id;
                        document.getElementById('map-boss-name').textContent = b.name;
                        document.getElementById('map-boss-title').textContent = b.title;
                        document.getElementById('map-boss-info').style.display = 'block';
                    };
                }(boss));
            }
            var portraitUrl = (CONFIG && CONFIG.bossPortraits) ? (CONFIG.bossPortraits[boss.portraitKey] || '') : '';
            if (unlocked && portraitUrl) {
                div.style.backgroundImage = 'url(' + portraitUrl + ')';
                div.style.backgroundSize = 'cover';
                div.style.backgroundPosition = 'center';
                div.style.position = 'relative';
                if (defeated) { div.style.filter = 'grayscale(0.6) brightness(0.5)'; }
            }
            // Yenilen boss'u diriltme butonu
            if (defeated && unlocked) {
                div.style.cursor = 'pointer';
                div.addEventListener('click', function(b) { return function() {
                    if (confirm(b.name + 'i antik buyu ile diriltip tekrar savasmak ister misin?')) {
                        self.currentBossId = b.id;
                        self.defeatedBosses = self.defeatedBosses.filter(function(id) { return id !== b.id; });
                        document.getElementById('map-boss-name').textContent = b.name;
                        document.getElementById('map-boss-title').textContent = b.title + ' (Diriltilmis)';
                        document.getElementById('map-boss-info').style.display = 'block';
                        self.showMap();
                    }
                };}(boss));
            }
            var iconHtml = (unlocked && !portraitUrl) ? (defeated ? '💀' : '👹') : '';
            div.innerHTML = (iconHtml ? '<span class=\"map-icon\">' + iconHtml + '</span>' : '') +
                '<span class=\"map-label\" style=\"position:relative;z-index:1;text-shadow:0 0 6px #000;\">' + (defeated ? boss.name + ' (Yenildi)' : (unlocked ? boss.name : '???')) + '</span>' +
                '<span class=\"map-lock\" style=\"position:relative;z-index:1;\">' + (defeated ? '✅' : (unlocked ? '' : '🔒')) + '</span>';
            grid.appendChild(div);
        }

        // Zeytin (final boss, hepsi yenilince acilir)
        var allDefeated = this.defeatedBosses.length >= 5;
        var zeytinDiv = document.createElement('div');
        zeytinDiv.className = 'map-region ' + (allDefeated ? 'unlocked' : 'locked');
        zeytinDiv.setAttribute('data-boss', 'zeytin');
        if (allDefeated) {
            zeytinDiv.style.cursor = 'pointer';
            zeytinDiv.addEventListener('click', function() {
                self.currentBossId = 'zeytin';
                var zb = getBossById('zeytin');
                document.getElementById('map-boss-name').textContent = zb.name;
                document.getElementById('map-boss-title').textContent = zb.title;
                document.getElementById('map-boss-info').style.display = 'block';
            });
        }
        var zPortrait = (CONFIG && CONFIG.bossPortraits) ? (CONFIG.bossPortraits['zeytin'] || '') : '';
        if (allDefeated && zPortrait) {
            zeytinDiv.style.backgroundImage = 'url(' + zPortrait + ')';
            zeytinDiv.style.backgroundSize = 'cover';
            zeytinDiv.style.backgroundPosition = 'center';
        }
        var zIcon = allDefeated && !zPortrait ? '🐱' : (!allDefeated ? '❓' : '');
        zeytinDiv.innerHTML = (zIcon ? '<span class=\"map-icon\">' + zIcon + '</span>' : '') +
            '<span class=\"map-label\">' + (allDefeated ? 'Zeytin' : '???') + '</span>' +
            '<span class=\"map-lock\">' + (allDefeated ? '⚔️' : '🔒') + '</span>';
        grid.appendChild(zeytinDiv);

        document.getElementById('map-modal').style.display = 'flex';
    },

    startBossFight() {
        if (!this.currentBossId) return;
        var boss = getBossById(this.currentBossId);
        if (!boss) return;

        if (this.isMultiplayer) {
            var aliveCount = this.aliveCharacters.length;
            document.getElementById('map-modal').style.display = 'none';
            // Tek oyuncu kaldiysa direkt boss fight baslat
            if (aliveCount <= 1) {
                this.log('Tek basinasin! Boss savasi basliyor...', 'event');
                this._sendBossInit(boss);
                return;
            }
            // Multiplayer: oylama başlat
            Multiplayer.send({ type: 'boss-vote', bossId: this.currentBossId });
            this.log('Boss savasi icin oylama baslatildi. Diger oyuncular bekleniyor...', 'event');
            var grid = document.getElementById('choices-container');
            if (grid) {
                grid.innerHTML = '<div style=\"text-align:center;color:var(--gold);padding:20px;\">🐱 Boss savasi oylamasi baslatildi.<br>Tum oyuncular kabul edince savas baslayacak.<br>Biri reddederse iptal olacak.</div>';
                grid.className = 'action-mode';
            }
        } else {
            // Singleplayer: direkt başlat
            document.getElementById('map-modal').style.display = 'none';
            CombatSystem.startBossFight(boss);
        }
    },

    // Multiplayer boss fight: fighter data'sını hesapla ve sunucuya gonder
    _sendBossInit(boss) {
        var playerCount = this.aliveCharacters.length || 1;
        var scaledHp = Math.round((boss.baseHp || boss.hp || 1500) * playerCount);
        var fightersData = [];
        var basicNames = {irem:'Asa Vurusu',gokdeniz:'Kilic Darbesi',noyan:'Kaptan Kancasi',begul:'Run Tokmagi',bedrican:'Tas Yumruk',cansin:'Pence',gunda:'Toprak Yumrugu',dominic:'Aile Darbesi',bulent:'Diva Tokadi'};
        var self = this;
        this.aliveCharacters.forEach(function(char) {
            var base = CombatSystem.getBaseStats(char);
            var skills = [];
            skills.push({id:'basic',name:basicNames[char.id]||'Temel Vurus',type:'physical',scaleStat:'atk',scaleFactor:1.0,baseEffect:0,manaCost:0,cooldown:0,target:'enemy',description:'ATKx1.',rarity:'character',characterId:null});
            var chInv = char._inv || {};
            var eqSkills = (chInv.equippedSkills && chInv.equippedSkills.length > 0) ? chInv.equippedSkills : (char.characterSkills || []);
            eqSkills.forEach(function(sid) { var sk = getSkillById(sid); if (sk) skills.push(sk); });
            fightersData.push({
                id: char.id,
                name: char.displayName || char.name,
                hp: base.hp, maxHp: base.hp,
                mana: Math.max(1, Math.floor(base.mag / 3)),
                maxMana: Math.max(1, Math.floor(base.mag / 3)),
                atk: base.atk, def: base.def, mr: base.mr || 0, mag: base.mag, spd: base.spd || 10,
                skills: skills
            });
        });
        fightersData.sort(function(a, b) { return b.spd - a.spd; });
        var turnOrder = fightersData.map(function(f) { return f.id; });
        Multiplayer.send({
            type: 'boss-init',
            bossId: boss.id,
            bossData: { scaledHp: scaledHp, skills: boss.skills || [], ultimate: boss.ultimate || null },
            fighters: fightersData,
            turnOrder: turnOrder
        });
    },

    // ========== ENVANTER SİSTEMİ ==========
    // Tek doğru kaynak: karakterin _inv nesnesi.
    // Game.equipment/ownedEquipment/... sadece save/combat uyumluluğu için kopyalanır.

    getInventory() {
        var ch = this.getPlayerCharacter();
        if (!ch) return null;
        if (!ch._inv) {
            ch._inv = {
                acquiredSkills: [],
                equippedSkills: [],
                equipment: { head: null, body: null, legs: null, feet: null, necklace: null, ring1: null, ring2: null },
                ownedEquipment: [],
                ownedArtifacts: []
            };
        }
        var eq = ch._inv.equipment;
        if (!('necklace' in eq)) eq.necklace = null;
        if (!('ring1' in eq)) eq.ring1 = null;
        if (!('ring2' in eq)) eq.ring2 = null;
        return ch._inv;
    },

    // char._inv → Game.* (save/combat için)
    syncInvToGame() {
        var inv = this.getInventory();
        if (!inv) return;
        this.equipment = { head: inv.equipment.head, body: inv.equipment.body, legs: inv.equipment.legs, feet: inv.equipment.feet, necklace: inv.equipment.necklace, ring1: inv.equipment.ring1, ring2: inv.equipment.ring2 };
        this.ownedEquipment = inv.ownedEquipment ? [...inv.ownedEquipment] : [];
        this.ownedArtifacts = inv.ownedArtifacts ? [...inv.ownedArtifacts] : [];
        this.equippedSkills = inv.equippedSkills ? [...inv.equippedSkills] : [];
        this.acquiredSkills = inv.acquiredSkills ? [...inv.acquiredSkills] : [];
    },

    // Game.* → char._inv (loadState veya dışarıdan değişiklik sonrası)
    syncGameToInv() {
        var inv = this.getInventory();
        if (!inv) return;
        if (this.equipment && typeof this.equipment === 'object') {
            inv.equipment.head = this.equipment.head !== undefined ? this.equipment.head : null;
            inv.equipment.body = this.equipment.body !== undefined ? this.equipment.body : null;
            inv.equipment.legs = this.equipment.legs !== undefined ? this.equipment.legs : null;
            inv.equipment.feet = this.equipment.feet !== undefined ? this.equipment.feet : null;
            inv.equipment.necklace = this.equipment.necklace !== undefined ? this.equipment.necklace : null;
            inv.equipment.ring1 = this.equipment.ring1 !== undefined ? this.equipment.ring1 : null;
            inv.equipment.ring2 = this.equipment.ring2 !== undefined ? this.equipment.ring2 : null;
        }
        if (this.ownedEquipment && this.ownedEquipment.length > 0) inv.ownedEquipment = [...this.ownedEquipment];
        if (this.ownedArtifacts && this.ownedArtifacts.length > 0) inv.ownedArtifacts = [...this.ownedArtifacts];
        if (this.equippedSkills && this.equippedSkills.length > 0) inv.equippedSkills = [...this.equippedSkills];
        if (this.acquiredSkills && this.acquiredSkills.length > 0) inv.acquiredSkills = [...this.acquiredSkills];
    },

    showInventory() {
        var modal = document.getElementById('inventory-modal');
        var grid = document.getElementById('inventory-grid');
        var equipSlots = document.getElementById('equipment-slots');
        var skillSlots = document.getElementById('skill-equip-slots');
        if (!modal || !grid) return;

        this.syncGameToInv();
        var inv = this.getInventory();
        var self = this;

        grid.innerHTML = '';
        if (equipSlots) equipSlots.innerHTML = '';
        if (skillSlots) skillSlots.innerHTML = '';

        // === 1. EKİPMAN SLOTLARI (7 slot) ===
        if (equipSlots) {
            var slotDefs = [
                { key: 'head', icon: '🎩', label: 'Başlık' },
                { key: 'body', icon: '👘', label: 'Kıyafet' },
                { key: 'legs', icon: '👖', label: 'Pantolon' },
                { key: 'feet', icon: '👢', label: 'Bot' },
                { key: 'necklace', icon: '📿', label: 'Kolye' },
                { key: 'ring1', icon: '💍', label: 'Yüzük 1' },
                { key: 'ring2', icon: '💍', label: 'Yüzük 2' }
            ];
            for (var si = 0; si < slotDefs.length; si++) {
                (function(slotDef) {
                    var div = document.createElement('div');
                    div.className = 'equip-slot';
                    var eqId = inv.equipment[slotDef.key];
                    var item = eqId ? (getEquipmentById(eqId) || getArtifactById(eqId)) : null;
                    if (item) {
                        div.className += ' filled';
                        var stats = [];
                        Object.keys(item.stats || {}).forEach(function(k) {
                            var v = item.stats[k];
                            if (v !== 0) stats.push((v > 0 ? '+' : '') + v + ' ' + k.toUpperCase());
                        });
                        var set = getSetByPieceId(item.id);
                        var setInfo = '';
                        if (set) {
                            var ownedSetPieces = 0;
                            Object.values(inv.equipment).forEach(function(eId) {
                                if (eId && getSetByPieceId(eId) && getSetByPieceId(eId).name === set.name) ownedSetPieces++;
                            });
                            var b2s = [], b4s = [];
                            Object.keys(set.bonus2 || {}).forEach(function(k) { b2s.push('+' + set.bonus2[k] + ' ' + k.toUpperCase()); });
                            Object.keys(set.bonus4 || {}).forEach(function(k) { b4s.push('+' + set.bonus4[k] + ' ' + k.toUpperCase()); });
                            setInfo = '<br><b>' + set.name + '</b> (' + ownedSetPieces + '/4)<br>' +
                                '<span style="font-size:0.55rem;color:#aaa">2 Parca: ' + b2s.join(', ') + '</span><br>' +
                                '<span style="font-size:0.55rem;color:#aaa">4 Parca: ' + b4s.join(', ') + '</span>';
                        }
                        div.innerHTML = '<span class="eq-icon">' + slotDef.icon + '</span><span class="eq-name">' + item.name + '</span>' +
                            '<div class="eq-tooltip"><b>' + item.name + '</b><br>' +
                            '<span style="font-size:0.6rem">' + stats.join(', ') + '</span>' + setInfo + '</div>';
                        div.addEventListener('click', function() {
                            inv.equipment[slotDef.key] = null;
                            self.syncInvToGame();
                            self.showInventory();
                        });
                    } else {
                        div.className += ' empty';
                        div.innerHTML = '<span class="eq-icon">' + slotDef.icon + '</span><span class="eq-label">' + slotDef.label + '</span>';
                    }
                    equipSlots.appendChild(div);
                })(slotDefs[si]);
            }
        }

        // === 2. ARTIFACT LİSTESİ ===
        if (inv.ownedArtifacts && inv.ownedArtifacts.length > 0) {
            var artHeader = document.createElement('div');
            artHeader.style.cssText = 'grid-column:1/-1;text-align:center;color:#c8a8d0;font-size:0.7rem;margin-top:8px;';
            artHeader.textContent = '--- Artifactlar (tikla: kusan) ---';
            grid.appendChild(artHeader);
            for (var ai = 0; ai < inv.ownedArtifacts.length; ai++) {
                (function(aId) {
                    var art = getArtifactById(aId);
                    if (!art) return;
                    var cell = document.createElement('div');
                    cell.className = 'inv-slot filled';
                    if (Object.values(inv.equipment).indexOf(aId) >= 0) cell.className += ' equipped';
                    var artStats = [];
                    if (art.stats) Object.keys(art.stats).forEach(function(k) {
                        var v = art.stats[k]; if (v !== 0) artStats.push((v > 0 ? '+' : '') + v + ' ' + k.toUpperCase());
                    });
                    cell.innerHTML = '<span class="inv-icon">💠</span><span class="inv-name">' + art.name + '</span>';
                    cell.title = art.name + ' [' + art.slot + ' | ' + art.rarity + '] | ' + artStats.join(', ') + (art.setId ? ' | Set: ' + art.setId : '');
                    cell.addEventListener('click', function() {
                        if (art.slot === 'ring') {
                            if (inv.equipment.ring1 === aId) inv.equipment.ring1 = null;
                            else if (inv.equipment.ring2 === aId) inv.equipment.ring2 = null;
                            else if (!inv.equipment.ring1) inv.equipment.ring1 = aId;
                            else if (!inv.equipment.ring2) inv.equipment.ring2 = aId;
                            else inv.equipment.ring1 = aId;
                        } else {
                            inv.equipment[art.slot] = (inv.equipment[art.slot] === aId) ? null : aId;
                        }
                        self.syncInvToGame();
                        self.showInventory();
                    });
                    grid.appendChild(cell);
                })(inv.ownedArtifacts[ai]);
            }
        }

        // === 3. EKİPMAN LİSTESİ ===
        if (inv.ownedEquipment && inv.ownedEquipment.length > 0) {
            var eqHeader = document.createElement('div');
            eqHeader.style.cssText = 'grid-column:1/-1;text-align:center;color:var(--gold);font-size:0.7rem;margin-top:8px;';
            eqHeader.textContent = '--- Ekipmanlar (tikla: kusan) ---';
            grid.appendChild(eqHeader);
            for (var ei = 0; ei < inv.ownedEquipment.length; ei++) {
                (function(eqId) {
                    var item = getEquipmentById(eqId);
                    if (!item) return;
                    var cell = document.createElement('div');
                    cell.className = 'inv-slot filled';
                    if (Object.values(inv.equipment).indexOf(eqId) >= 0) cell.className += ' equipped';
                    var eqStats = [];
                    if (item.stats) Object.keys(item.stats).forEach(function(k) {
                        var v = item.stats[k]; if (v !== 0) eqStats.push((v > 0 ? '+' : '') + v + ' ' + k.toUpperCase());
                    });
                    cell.innerHTML = '<span class="inv-icon">🛡️</span><span class="inv-name">' + item.name + '</span>';
                    cell.title = item.name + ' [' + item.slot + '] | ' + eqStats.join(', ');
                    cell.addEventListener('click', function() {
                        inv.equipment[item.slot] = eqId;
                        self.syncInvToGame();
                        self.showInventory();
                    });
                    grid.appendChild(cell);
                })(inv.ownedEquipment[ei]);
            }
        }

        // === 4. SKILL LİSTESİ ===
        var allSkills = [];
        if (inv.acquiredSkills) {
            inv.acquiredSkills.forEach(function(sid) {
                if (allSkills.indexOf(sid) < 0) allSkills.push(sid);
            });
        }
        var ch = self.getPlayerCharacter();
        if (ch && ch.characterSkills) {
            ch.characterSkills.forEach(function(sid) {
                if (allSkills.indexOf(sid) < 0) allSkills.push(sid);
            });
        }
        for (var ski = 0; ski < allSkills.length; ski++) {
            (function(skillId) {
                var sk = getSkillById(skillId);
                if (!sk) return;
                var cell = document.createElement('div');
                cell.className = 'inv-slot filled';
                if (inv.equippedSkills.indexOf(skillId) >= 0) cell.className += ' equipped';
                var icon = sk.type === 'physical' ? '⚔️' : sk.type === 'magic' ? '🔮' : sk.type === 'heal' ? '💚' : sk.type === 'buff' ? '🛡️' : sk.type === 'debuff' ? '💀' : '❓';
                var typeLabel = sk.type === 'physical' ? 'Fiziksel' : sk.type === 'magic' ? 'Buyu' : sk.type === 'heal' ? 'Sifa' : sk.type === 'buff' ? 'Buff' : sk.type === 'debuff' ? 'Debuff' : 'Ozel';
                var scaleLabel = sk.scaleStat === 'atk' ? 'ATK' : sk.scaleStat === 'mag' ? 'BUYU' : sk.scaleStat === 'def' ? 'DEF' : sk.scaleStat === 'spd' ? 'HIZ' : sk.scaleStat === 'hp' ? 'CAN' : sk.scaleStat;
                cell.innerHTML = '<span class="inv-icon">' + icon + '</span><span class="inv-name">' + sk.name + '</span>';
                if (sk.manaCost > 0) cell.innerHTML += '<span class="inv-mana">' + sk.manaCost + '💧</span>';
                cell.title = sk.name + ' [' + typeLabel + '] | Scale: ' + scaleLabel + '×' + sk.scaleFactor + ' | Mana:' + sk.manaCost + ' | CD:' + sk.cooldown + ' tur | ' + sk.description;
                cell.addEventListener('click', function() {
                    var idx = inv.equippedSkills.indexOf(skillId);
                    if (idx >= 0) { inv.equippedSkills.splice(idx, 1); }
                    else if (inv.equippedSkills.length < 5) { inv.equippedSkills.push(skillId); }
                    else { inv.equippedSkills.shift(); inv.equippedSkills.push(skillId); }
                    self.syncInvToGame();
                    self.showInventory();
                });
                grid.appendChild(cell);
            })(allSkills[ski]);
        }

        // === 5. SKILL SLOTLARI (5 tane) ===
        if (skillSlots) {
            var hotkeys = ['Q', 'E', 'F', 'G', 'R'];
            for (var ssi = 0; ssi < 5; ssi++) {
                (function(slotIdx) {
                    var slot = document.createElement('div');
                    slot.className = 'equip-slot';
                    var eqSkillId = inv.equippedSkills[slotIdx];
                    if (eqSkillId) {
                        var eqSk = getSkillById(eqSkillId);
                        if (eqSk) {
                            slot.className += ' filled';
                            var eqIcon = eqSk.type === 'physical' ? '⚔️' : eqSk.type === 'magic' ? '🔮' : eqSk.type === 'heal' ? '💚' : eqSk.type === 'buff' ? '🛡️' : '❓';
                            slot.innerHTML = '<span class="eq-icon">' + eqIcon + '</span><span class="eq-name">' + eqSk.name + '</span>' +
                                '<span style="position:absolute;top:2px;right:3px;font-size:0.5rem;color:var(--gold);">' + hotkeys[slotIdx] + '</span>';
                            slot.title = eqSk.name + ' | ' + eqSk.description + ' | ' + hotkeys[slotIdx] + ' tusu';
                            slot.addEventListener('click', function() {
                                inv.equippedSkills.splice(slotIdx, 1);
                                self.syncInvToGame();
                                self.showInventory();
                            });
                        }
                    } else {
                        slot.className += ' empty';
                        slot.innerHTML = '<span class="eq-icon">⬜</span><span class="eq-label">Slot ' + (slotIdx + 1) + '</span>' +
                            '<span style="position:absolute;top:2px;right:3px;font-size:0.5rem;color:var(--text-dim);">' + hotkeys[slotIdx] + '</span>';
                    }
                    skillSlots.appendChild(slot);
                })(ssi);
            }
        }

        document.getElementById('inv-equipped-count').textContent = (inv.equippedSkills ? inv.equippedSkills.length : 0) + '/5';
        modal.style.display = 'flex';
        this.renderCharacterBar();
    },

    hideInventory() {
        this.syncInvToGame();
        document.getElementById('inventory-modal').style.display = 'none';
        this.renderCharacterBar();
    },

    // --- Level / XP ---
    addXP(amount) {
        this.xp += amount;
        var nextLv = this.xpToLevel[this.level + 1];
        while (nextLv && this.xp >= nextLv) {
            this.level++;
            this.xp -= nextLv;
            // Level bonusu: +%10 HP, +1 tüm statlar
            var char = this.getPlayerCharacter();
            var fullChar = getCharacterById(char ? char.id : '') || char || {};
            var cs = fullChar.combatStats || char.combatStats || {};
            if (cs) {
                var oldHp = cs.hp || 500;
                cs.hp = Math.round((cs.hp || 500) * 1.1);
                cs.atk = (cs.atk || 0) + 1;
                cs.def = (cs.def || 0) + 1;
                cs.mr = (cs.mr || 0) + 1;
                cs.mag = (cs.mag || 0) + 1;
                cs.spd = (cs.spd || 0) + 1;
                this.log('LEVEL UP! Lv.' + this.level + '! HP:' + oldHp + '→' + cs.hp + ' (+%10), ATK/DEF/MR/MAG/SPD +1', 'event');
            }
            nextLv = this.xpToLevel[this.level + 1];
        }
        this.updateLevelDisplay();
        this.renderCharacterBar();
        this.autoSave();
    },

    updateLevelDisplay() {
        var el = document.getElementById('hud-level');
        if (!el) return;
        var nextLv = this.xpToLevel[this.level + 1] || 0;
        el.textContent = '⭐ Lv.' + this.level + ' (' + this.xp + '/' + nextLv + 'xp)';
    },

    autoSave() {
        const state = {
            day: this.day,
            timeIndex: this.timeIndex,
            timeOfDay: this.timeOfDay,
            finalDay: this.finalDay,
            isOver: this.isOver,
            isMultiplayer: this.isMultiplayer,
            usedCards: this.usedCards,
            reviveQueue: this.reviveQueue,
            craftingQueue: this.craftingQueue,
            characters: this.characters,
            resources: ResourceManager.getSnapshot(),
            energy: this.energy,
            actionsThisSlot: this.actionsThisSlot,
            fateCountToday: this.fateCountToday,
            playerDone: this.playerDone,
            acquiredSkills: this.acquiredSkills,
            equippedSkills: this.equippedSkills,
            equipment: this.equipment,
            ownedEquipment: this.ownedEquipment,
            ownedArtifacts: this.ownedArtifacts,
            xp: this.xp,
            level: this.level,
            defeatedBosses: this.defeatedBosses,
            shelterBuilt: this.shelterBuilt
        };
        saveGame(state);

        const btn = document.getElementById('btn-continue');
        if (btn) btn.style.display = 'flex';
    }
};
