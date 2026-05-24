/* ===== BIBIGAME - Oda Yöneticisi ===== */

class Room {
    constructor(code, name, hostWs, hostCharId, hostName) {
        this.code = code;
        this.name = name;
        this.players = [];
        this.totalActions = 0;
        this.slotChoices = [];
        this.bossFight = null;
        this.bossVote = null;
        this.dungeonLobbies = {}; // { '2': { leader: charId, members: [charId,...] }, ... }
        this.addPlayer(hostWs, hostCharId, hostName);
    }

    addPlayer(ws, characterId, playerName) {
        if (this.players.length >= 10) return false;

        const charTaken = this.players.find(p => p.characterId === characterId);
        if (charTaken) return false;

        this.players.push({
            id: this.generatePlayerId(),
            ws: ws,
            characterId: characterId,
            playerName: playerName,
            ready: false,
            chosen: false,
            lastChoice: null,
            done: false,
            lastActionType: null,
            readyForNextTurn: false
        });
        return true;
    }

    removePlayer(ws) {
        const player = this.getPlayer(ws);
        if (player) {
            player.done = true;
        }
        this.players = this.players.filter(p => p.ws !== ws);
    }

    getPlayer(ws) {
        return this.players.find(p => p.ws === ws);
    }

    getPlayerList() {
        return this.players.map(p => ({
            playerName: p.playerName,
            characterId: p.characterId,
            ready: p.ready
        }));
    }

    playerCount() {
        return this.players.length;
    }

    broadcast(msg, excludeWs = null) {
        this.players.forEach(p => {
            if (p.ws !== excludeWs && p.ws.readyState === 1) {
                p.ws.send(JSON.stringify(msg));
            }
        });
    }

    broadcastAll(msg) {
        this.players.forEach(p => {
            if (p.ws.readyState === 1) {
                p.ws.send(JSON.stringify(msg));
            }
        });
    }

    generatePlayerId() {
        return 'p_' + Math.random().toString(36).substr(2, 9);
    }

    // --- Aksiyon Tabanlı Tur Sistemi ---

    recordAction(player, actionType, choiceText, done, effects) {
        player.done = done;
        player.lastActionType = actionType;
        this.totalActions++;

        if (choiceText && effects) {
            this.slotChoices.push({
                playerId: player.id,
                playerName: player.playerName,
                characterId: player.characterId,
                actionType: actionType,
                choiceText: choiceText,
                effects: effects
            });
        }
    }

    shouldAdvanceTime() {
        const allDone = this.players.every(p => p.done === true);
        return allDone;
    }

    resetForNewSlot() {
        this.totalActions = 0;
        this.slotChoices = [];
        this.players.forEach(p => {
            p.done = false;
            p.lastActionType = null;
            p.chosen = false;
            p.lastChoice = null;
            p.readyForNextTurn = false;
        });
    }

    getDoneStatus() {
        const status = {};
        this.players.forEach(p => { status[p.characterId] = p.done; });
        return status;
    }

    // --- Eski Metodlar (geriye uyumluluk) ---

    allPlayersChosen() {
        return this.players.length > 0 && this.players.every(p => p.chosen === true);
    }

    getAllChoices() {
        // Yeni sistem: slotChoices'tan döndür
        if (this.slotChoices.length > 0) {
            return this.slotChoices;
        }
        return this.players.map(p => ({
            playerId: p.id,
            playerName: p.playerName,
            characterId: p.characterId,
            choiceIndex: p.lastChoice?.choiceIndex,
            choiceText: p.lastChoice?.choiceText,
            effects: p.lastChoice?.effects
        }));
    }

    resetChoices() {
        this.players.forEach(p => {
            p.chosen = false;
            p.lastChoice = null;
        });
    }

    allPlayersReadyForNext() {
        return this.players.length > 0 && this.players.every(p => p.readyForNextTurn === true);
    }

    resetTurnReady() {
        this.players.forEach(p => {
            p.readyForNextTurn = false;
        });
    }

    // --- Boss Fight Sistemi ---

    initBossFight(bossId, bossData, fighters, turnOrder) {
        this.bossFight = {
            bossId: bossId,
            bossHp: bossData.scaledHp,
            bossMaxHp: bossData.scaledHp,
            bossSkills: bossData.skills || [],
            bossUltimate: bossData.ultimate || null,
            fighters: fighters,
            turnOrder: turnOrder,
            currentFighterIndex: 0,
            phase: 'FIGHTER_TURNS', // FIGHTER_TURNS | BOSS_TURN | ENDED
            bossTurnCounter: 0,
            fightersEndedTurn: {} // characterId -> true (bu tur icin bitirdi mi)
        };
        turnOrder.forEach(function(id) {
            this.bossFight.fightersEndedTurn[id] = false;
        }.bind(this));
    }

    advanceBossTurn() {
        var bf = this.bossFight;
        if (!bf) return;
        bf.currentFighterIndex++;
        if (bf.currentFighterIndex >= bf.turnOrder.length) {
            bf.currentFighterIndex = 0;
        }
    }

    recordBossAction(fighterId, newFighterHp, newFighterMana) {
        var bf = this.bossFight;
        if (!bf) return;
        var fighter = bf.fighters.find(function(f) { return f.id === fighterId; });
        if (fighter) {
            fighter.hp = newFighterHp;
            fighter.mana = newFighterMana;
        }
    }

    endFighterTurn(fighterId) {
        var bf = this.bossFight;
        if (!bf) return;
        bf.fightersEndedTurn[fighterId] = true;
    }

    allFightersEndedTurn() {
        var bf = this.bossFight;
        if (!bf) return false;
        var aliveFighters = bf.fighters.filter(function(f) { return f.hp > 0; });
        if (aliveFighters.length === 0) return true;
        return aliveFighters.every(function(f) {
            return bf.fightersEndedTurn[f.id] === true;
        });
    }

    resetFightersEndedTurn() {
        var bf = this.bossFight;
        if (!bf) return;
        Object.keys(bf.fightersEndedTurn).forEach(function(id) {
            bf.fightersEndedTurn[id] = false;
        });
    }

    checkBossFightEnd() {
        var bf = this.bossFight;
        if (!bf) return null;
        if (bf.bossHp <= 0) return 'victory';
        var aliveCount = bf.fighters.filter(function(f) { return f.hp > 0; }).length;
        if (aliveCount === 0) return 'defeat';
        return null;
    }

    cleanupBossFight() {
        this.bossFight = null;
        this.bossVote = null;
    }

    // --- Zindan (Dungeon) Lobisi Sistemi ---

    dungeonJoin(size, characterId) {
        if (!this.dungeonLobbies) this.dungeonLobbies = {};
        // Karakter baska bir zindandaysa oradan cikar
        Object.keys(this.dungeonLobbies).forEach(function(key) {
            var lobby = this.dungeonLobbies[key];
            if (lobby && lobby.members) {
                lobby.members = lobby.members.filter(function(id) { return id !== characterId; });
                if (lobby.members.length === 0) {
                    this.dungeonLobbies[key] = null;
                } else if (lobby.leader === characterId) {
                    lobby.leader = lobby.members[0];
                }
            }
        }.bind(this));
        // Yeni zindana katil
        if (!this.dungeonLobbies[size]) {
            this.dungeonLobbies[size] = { leader: null, members: [] };
        }
        var lobby = this.dungeonLobbies[size];
        if (lobby.members.indexOf(characterId) < 0) {
            lobby.members.push(characterId);
        }
        if (!lobby.leader) lobby.leader = characterId;
        return this.getDungeonLobbyState();
    }

    dungeonLeave(size, characterId) {
        if (!this.dungeonLobbies) this.dungeonLobbies = {};
        var lobby = this.dungeonLobbies[size];
        if (!lobby) return this.getDungeonLobbyState();
        lobby.members = lobby.members.filter(function(id) { return id !== characterId; });
        if (lobby.members.length === 0) {
            this.dungeonLobbies[size] = null;
        } else if (lobby.leader === characterId) {
            lobby.leader = lobby.members[0];
        }
        return this.getDungeonLobbyState();
    }

    dungeonStart(size, characterId) {
        if (!this.dungeonLobbies) return null;
        var lobby = this.dungeonLobbies[size];
        if (!lobby) return null;
        if (lobby.leader !== characterId) return null;
        if (lobby.members.length < 1) return null;
        var members = [...lobby.members];
        this.dungeonLobbies[size] = null;
        return members;
    }

    getDungeonLobbyState() {
        if (!this.dungeonLobbies) this.dungeonLobbies = {};
        var state = {};
        Object.keys(this.dungeonLobbies).forEach(function(key) {
            var lobby = this.dungeonLobbies[key];
            if (lobby && lobby.members && lobby.members.length > 0) {
                state[key] = { leader: lobby.leader, members: [...lobby.members] };
            }
        }.bind(this));
        return state;
    }
}

class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code;
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
        } while (this.rooms.has(code));
        return code;
    }

    createRoom(ws, name, characterId, playerName) {
        const code = this.generateRoomCode();
        const room = new Room(code, name, ws, characterId, playerName);
        this.rooms.set(code, room);
        return room;
    }

    joinRoom(ws, code, characterId, playerName) {
        const room = this.rooms.get(code.toUpperCase());
        if (!room) return null;
        if (room.playerCount() >= 10) return null;

        const success = room.addPlayer(ws, characterId, playerName);
        return success ? room : null;
    }

    getRoom(code) {
        return this.rooms.get(code) || null;
    }

    removePlayer(ws) {
        if (!ws.roomCode) return;
        const room = this.rooms.get(ws.roomCode);
        if (!room) return;

        const player = room.getPlayer(ws);

        // Boss fight sırasında disconnect: fighter'ı ölü işaretle
        if (room.bossFight && player) {
            var bf = room.bossFight;
            var fighter = bf.fighters.find(function(f) { return f.id === player.characterId; });
            if (fighter && fighter.hp > 0) {
                fighter.hp = 0;
                room.endFighterTurn(player.characterId);
                room.broadcastAll({
                    type: 'boss-action-broadcast',
                    actorId: player.characterId,
                    actorName: player.playerName,
                    skillName: 'Baglantisi koptu!',
                    damage: 0, heal: 0,
                    newBossHp: bf.bossHp,
                    newFighterHp: 0,
                    newFighterMana: 0,
                    isCrit: false,
                    endedTurn: true
                });
                // Check if fight should end
                var endResult = room.checkBossFightEnd();
                if (endResult) {
                    room.broadcastAll({
                        type: 'boss-fight-end',
                        result: endResult,
                        bossId: bf.bossId,
                        xpGain: endResult === 'victory' ? Math.floor(bf.bossMaxHp / 2) : 0,
                        fightersFinalNames: bf.fighters.filter(function(f){return f.hp>0;}).map(function(f){return f.name;})
                    });
                    room.cleanupBossFight();
                }
            }
        }

        room.removePlayer(ws);

        // Zindan lobisinden de cikar
        if (player && room.dungeonLobbies) {
            var changed = false;
            Object.keys(room.dungeonLobbies).forEach(function(key) {
                var lobby = room.dungeonLobbies[key];
                if (lobby && lobby.members && lobby.members.indexOf(player.characterId) >= 0) {
                    lobby.members = lobby.members.filter(function(id) { return id !== player.characterId; });
                    if (lobby.members.length === 0) {
                        room.dungeonLobbies[key] = null;
                    } else if (lobby.leader === player.characterId) {
                        lobby.leader = lobby.members[0];
                    }
                    changed = true;
                }
            });
            if (changed) {
                var state = room.getDungeonLobbyState();
                room.broadcastAll({
                    type: 'dungeon-update',
                    lobbies: state
                });
            }
        }

        if (player) {
            room.broadcast({
                type: 'player-left',
                players: room.getPlayerList()
            });
        }

        if (room.playerCount() === 0) {
            this.rooms.delete(ws.roomCode);
            console.log(`Oda silindi: ${ws.roomCode}`);
        }

        ws.roomCode = null;
        ws.isHost = false;
    }
}

module.exports = { RoomManager, Room };
