/* ===== BIBIGAME - Multiplayer İstemci ===== */

const Multiplayer = {
    ws: null,
    roomCode: null,
    isHost: false,
    connected: false,
    players: [],
    playerCharacterId: null,
    serverUrl: (() => {
        const loc = window.location;
        const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
        if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
            return `${protocol}//${loc.hostname}:${loc.port || '3000'}`;
        }
        // Tünel (pinggy, ngrok, cloudflare) — port gerekmez
        return `${protocol}//${loc.hostname}`;
    })(),

    initLobby() {
        // Bağlantı adresini göster
        const joinUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? window.location.origin + ':' + (window.location.port || '3000')
            : window.location.origin;
        document.getElementById('join-url-display').textContent = joinUrl;

        // Karakter seçimlerini doldur
        CharacterSelect.populateLobbySelect('lobby-char-grid-create');
        CharacterSelect.populateLobbySelect('lobby-char-grid-join');

        // Tab kontrolü
        document.querySelectorAll('.lobby-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.lobby-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const panelId = 'lobby-' + tab.dataset.tab;
                document.querySelectorAll('.lobby-panel').forEach(p => p.style.display = 'none');
                document.getElementById(panelId).style.display = 'block';
            });
        });

        // Oda kur
        document.getElementById('btn-create-room').addEventListener('click', () => {
            AudioManager.playClick();
            this.createRoom();
        });

        // Odaya katıl
        document.getElementById('btn-join-room').addEventListener('click', () => {
            AudioManager.playClick();
            this.joinRoom();
        });

        // Oyun başlat
        document.getElementById('btn-start-multiplayer').addEventListener('click', () => {
            AudioManager.playClick();
            this.startGame();
        });

        // Geri dön
        document.getElementById('btn-lobby-back').addEventListener('click', () => {
            AudioManager.playClick();
            this.disconnect();
            ScreenManager.show('main-menu');
        });
    },

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.serverUrl);

                this.ws.onopen = () => {
                    this.connected = true;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    const msg = JSON.parse(event.data);
                    this.handleMessage(msg);
                };

                this.ws.onerror = () => reject(new Error('Bağlantı hatası'));
                this.ws.onclose = () => {
                    this.connected = false;
                    if (this.roomCode) {
                        console.log('Sunucu bağlantısı kesildi.');
                    }
                };
            } catch (e) {
                reject(e);
            }
        });
    },

    async createRoom() {
        const roomName = document.getElementById('room-name-input').value.trim() || 'Macera Odası';
        const charId = CharacterSelect._lobbyCreateChar || CHARACTERS[0].id;
        const playerName = document.getElementById('lobby-player-name-create').value.trim() || getCharacterById(charId).name;

        try {
            await this.connect();
            this.isHost = true;
            this.playerCharacterId = charId;
            this.send({ type: 'create', roomName, characterId: charId, playerName });
        } catch (e) {
            alert('Sunucuya bağlanılamadı. Sunucunun çalıştığından emin olun.\n\nTerminalde: node server/server.js');
        }
    },

    async joinRoom() {
        const code = document.getElementById('room-code-input').value.trim().toUpperCase();
        const charId = CharacterSelect._lobbyJoinChar || CHARACTERS[0].id;
        const playerName = document.getElementById('lobby-player-name-join').value.trim() || getCharacterById(charId).name;

        if (code.length !== 6) {
            alert('Geçerli bir oda kodu girin (6 karakter).');
            return;
        }

        try {
            await this.connect();
            this.isHost = false;
            this.playerCharacterId = charId;
            this.send({ type: 'join', roomCode: code, characterId: charId, playerName });
        } catch (e) {
            alert('Sunucuya bağlanılamadı. Sunucunun çalıştığından emin olun.');
        }
    },

    startGame() {
        if (!this.isHost) return;
        var charId = CharacterSelect._lobbyCreateChar || CHARACTERS[0].id;
        var playerName = document.getElementById('lobby-player-name-create').value.trim() || getCharacterById(charId).name;
        this.playerCharacterId = charId;
        this.send({ type: 'start', gameMode: 'turn-based', characterId: charId, playerName: playerName });
    },

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.roomCode = null;
        this.isHost = false;
        this.connected = false;
        this.players = [];
    },

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    },

    dungeonJoin(size) {
        this.send({ type: 'dungeon-join', dungeonSize: size });
    },

    dungeonLeave(size) {
        this.send({ type: 'dungeon-leave', dungeonSize: size });
    },

    dungeonStart(size) {
        this.send({ type: 'dungeon-start', dungeonSize: size });
    },

    dungeonFlee(fleeMsg) {
        this.send({ type: 'dungeon-flee', fleeMsg: fleeMsg });
    },

    handleMessage(msg) {
        switch (msg.type) {
            case 'room-created':
                this.roomCode = msg.roomCode;
                document.getElementById('created-room-info').style.display = 'block';
                document.getElementById('room-code-display').textContent = msg.roomCode;
                this.updatePlayerList(msg.players);
                break;

            case 'player-joined':
                this.updatePlayerList(msg.players);
                break;

            case 'player-left':
                this.updatePlayerList(msg.players);
                break;

            case 'joined':
                this.roomCode = msg.roomCode;
                document.getElementById('joined-room-info').style.display = 'block';
                document.getElementById('joined-players').textContent =
                    'Bağlandı! Oyuncular: ' + msg.players.map(p => p.playerName).join(', ');
                break;

            case 'game-starting':
                // Multiplayer oyunu başlat
                Game.isMultiplayer = true;
                if (msg.gameMode && CONFIG) CONFIG.gameMode = msg.gameMode;
                Game.playerCharacterId = this.playerCharacterId;
                Game.day = 1;
                Game.timeIndex = 0;
                Game.timeOfDay = 'morning';
                Game.finalDay = MIN_END_DAY + Math.floor(Math.random() * (MAX_END_DAY - MIN_END_DAY + 1));
                Game.isOver = false;
                Game.usedCards = [];
                Game.reviveQueue = [];
                Game.characters = msg.characters.map((c, i) => {
                    var fullChar = getCharacterById(c.characterId);
                    var skills = fullChar ? (fullChar.characterSkills || []) : [];
                    var charObj = {
                        id: c.characterId,
                        name: c.playerName,
                        displayName: (fullChar?.displayName || fullChar?.name || c.characterId),
                        hearts: 4,
                        maxHearts: 4,
                        baseSkills: [...(fullChar?.baseSkills || [])],
                        synergy: fullChar?.synergy || null,
                        canRevive: fullChar?.canRevive || false,
                        role: fullChar?.role || '',
                        portrait: fullChar?.portrait || '',
                        isBulent: c.characterId === 'bulent',
                        bulentDayOneDeaded: false,
                        characterSkills: skills,
                        combatStats: fullChar?.combatStats ? {...fullChar.combatStats} : null,
                        passive: fullChar?.passive || null
                    };
                    // Config'teki statlari uygula
                    if (typeof applyConfigStats === 'function') applyConfigStats(charObj);
                    return charObj;
                });
                Game.aliveCharacters = [...Game.characters];
                Game.deadCharacters = [];
                Game.energy = {};
                Game.actionsThisSlot = 0;
                Game.fateCountToday = {};
                Game.playerDone = {};
                Game.currentActionType = null;
                Game.cardResults = [];
                // Her oyuncunun kendi skill'lerini baslat
                var myChar = Game.characters.find(c => c.id === Game.playerCharacterId);
                Game.acquiredSkills = myChar && myChar.characterSkills ? [...myChar.characterSkills] : [];
                Game.equippedSkills = myChar && myChar.characterSkills ? [...myChar.characterSkills].slice(0, 5) : [];
                Game.ownedEquipment = [];
                Game.ownedArtifacts = [];
                Game.equipment = { head: null, body: null, legs: null, feet: null, necklace: null, ring1: null, ring2: null };
                // Başlangıç ekipmanı: 2 rastgele COMMON parça
                var commonEq = typeof getEquipmentByRarity === 'function' ? getEquipmentByRarity('common') : [];
                while (Game.ownedEquipment.length < 2 && commonEq.length > 0) {
                    var rnd = commonEq[Math.floor(Math.random() * commonEq.length)];
                    if (rnd && Game.ownedEquipment.indexOf(rnd.id) < 0) Game.ownedEquipment.push(rnd.id);
                }
                // Her karaktere _inv tanımla
                Game.characters.forEach(function(c) {
                    if (!c._inv) c._inv = {
                        acquiredSkills: c.characterSkills ? [...c.characterSkills] : [],
                        equippedSkills: c.characterSkills ? [...c.characterSkills].slice(0, 5) : [],
                        equipment: { head: null, body: null, legs: null, feet: null, necklace: null, ring1: null, ring2: null },
                        ownedEquipment: [...Game.ownedEquipment],
                        ownedArtifacts: []
                    };
                });
                Game.defeatedBosses = [];
                Game._dungeonLobbies = {};
                Game.xp = 0;
                Game.level = 1;
                Game.shelterBuilt = false;
                Game.characters.forEach(c => Game.initCharacterState(c));
                ResourceManager.init(
                    10 + Game.characters.length * 2,
                    5 + Game.characters.length,
                    3 + Game.characters.length
                );
                EventSystem.init();
                ScreenManager.show('game-screen');
                Game.updateHUD();
                Game.renderCharacterBar();
                Game.startTurn();
                break;

            case 'player-chose':
                // Başka oyuncunun seçimini göster
                Game.log(`${msg.playerName}: "${msg.choiceText}" seçti.`, '');
                break;

            case 'all-choices-in':
                // Tüm seçimler toplandı, uygula
                CardSystem.applyAllChoices(msg.choices);
                break;

            case 'boss-vote-request':
                // Boss daveti geldi
                if (confirm(msg.initiatorName + ' boss savasina gitmek istiyor. Kabul ediyor musun?')) {
                    Multiplayer.send({ type: 'boss-vote-response', accept: true });
                    Game.log('Boss savasini kabul ettin.', 'event');
                } else {
                    Multiplayer.send({ type: 'boss-vote-response', accept: false });
                    Game.log('Boss savasini reddettin.', '');
                }
                break;

            case 'boss-vote-update':
                Game.log('Boss oylamasi: ' + JSON.stringify(msg.votes), '');
                break;

            case 'boss-fight-start-multi':
                // Oylama kabul edildi, boss state'ini hesapla ve sunucuya gonder
                (function() {
                    var boss = getBossById(msg.bossId);
                    if (!boss) return;
                    document.getElementById('card-area').style.display = 'none';
                    document.getElementById('choices-container').innerHTML = '';
                    Game._sendBossInit(boss);
                })();
                break;

            case 'boss-vote-cancelled':
                Game.log('Boss oylamasi iptal: ' + msg.reason, 'negative');
                document.getElementById('card-area').style.display = '';
                document.getElementById('choices-container').innerHTML = '';
                Game.showActionButtons();
                break;

            case 'boss-fight-start':
                Game.log('Boss savasi basliyor!', 'event');
                document.getElementById('card-area').style.display = 'none';
                document.getElementById('choices-container').innerHTML = '';
                CombatSystem.startBossFightMultiplayer(msg);
                break;

            case 'boss-whose-turn':
                CombatSystem.handleBossWhoseTurn(msg);
                break;

            case 'boss-action-broadcast':
                CombatSystem.receiveBossAction(msg);
                break;

            case 'boss-turn':
                CombatSystem.receiveBossTurn(msg);
                break;

            case 'boss-fight-end':
                CombatSystem.receiveBossFightEnd(msg);
                break;

            case 'player-action-broadcast':
                // Başka oyuncu aksiyon yaptı
                Game.log(`${msg.playerName}: ${msg.choiceText}`, '');
                Game.renderCharacterBar();
                break;

            case 'all-choices-in':
                // Eski sistemden gelen mesajlar için yedek
                CardSystem.applyAllChoices(msg.choices);
                break;

            case 'player-chose':
                Game.log(`${msg.playerName}: "${msg.choiceText}" seçti.`, '');
                break;

            case 'game-over':
                Game.endGame(msg.result);
                break;

            case 'chat':
                Chat.receive(msg.playerName, msg.characterId, msg.text, msg.time);
                break;

            case 'dungeon-update':
                Game._onDungeonUpdate(msg.lobbies);
                break;

            case 'dungeon-start-combat':
                Game._onDungeonStartCombat(msg);
                break;

            case 'dungeon-flee':
                Game.log(msg.fleeMsg, 'flee');
                break;
        }
    },

    updatePlayerList(players) {
        this.players = players;
        const list = document.getElementById('lobby-player-list');
        if (list) {
            list.innerHTML = players.map(p =>
                `<span class="lobby-player-tag">${p.playerName} (${getCharacterById(p.characterId)?.name || '?'})</span>`
            ).join('');
        }
        document.getElementById('players-in-room').textContent = `Oyuncular (${players.length}/7):`;
    }
};
