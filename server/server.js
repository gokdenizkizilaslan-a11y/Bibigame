/* ===== BIBIGAME - HTTP + WebSocket Sunucusu ===== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { RoomManager } = require('./room-manager');
const os = require('os');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const rooms = new RoomManager();

// MIME types
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg'
};

function serveFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Bulunamadı</h1>');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    if (url === '/') url = '/index.html';

    const filePath = path.join(ROOT, url);

    // Güvenlik: sadece ROOT içindeki dosyalara izin ver
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Yasak');
        return;
    }

    serveFile(res, filePath);
});

// WebSocket'i HTTP sunucusuna bağla
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`Bağlantı: ${ip}`);

    ws.on('message', (raw) => {
        let msg;
        try {
            msg = JSON.parse(raw.toString());
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', message: 'Geçersiz mesaj formatı.' }));
            return;
        }
        handleMessage(ws, msg);
    });

    ws.on('close', () => {
        rooms.removePlayer(ws);
        console.log(`Bağlantı koptu: ${ip}`);
    });

    ws.on('error', (err) => {
        console.error('WebSocket hatası:', err.message);
    });
});

function handleMessage(ws, msg) {
    switch (msg.type) {
        case 'create':
            handleCreate(ws, msg);
            break;
        case 'join':
            handleJoin(ws, msg);
            break;
        case 'start':
            handleStart(ws, msg);
            break;
        case 'card-choice':
            handleCardChoice(ws, msg);
            break;
        case 'player-action':
            handlePlayerAction(ws, msg);
            break;
        case 'boss-vote':
            handleBossVote(ws, msg);
            break;
        case 'boss-vote-response':
            handleBossVoteResponse(ws, msg);
            break;
        case 'boss-init':
            handleBossInit(ws, msg);
            break;
        case 'boss-action':
            handleBossAction(ws, msg);
            break;
        case 'boss-end-turn':
            handleBossEndTurn(ws);
            break;
        case 'leave':
            rooms.removePlayer(ws);
            break;
        case 'chat':
            handleChat(ws, msg);
            break;
        default:
            ws.send(JSON.stringify({ type: 'error', message: 'Bilinmeyen mesaj tipi.' }));
    }
}

function handleCreate(ws, msg) {
    const room = rooms.createRoom(ws, msg.roomName, msg.characterId, msg.playerName);
    ws.roomCode = room.code;
    ws.isHost = true;

    ws.send(JSON.stringify({
        type: 'room-created',
        roomCode: room.code,
        players: room.getPlayerList()
    }));

    console.log(`Oda kuruldu: ${room.code} - "${room.name}"`);
}

function handleJoin(ws, msg) {
    const room = rooms.joinRoom(ws, msg.roomCode, msg.characterId, msg.playerName);

    if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Oda bulunamadı veya dolu.' }));
        return;
    }

    ws.roomCode = room.code;
    ws.isHost = false;

    ws.send(JSON.stringify({
        type: 'joined',
        roomCode: room.code,
        players: room.getPlayerList()
    }));

    room.broadcast({
        type: 'player-joined',
        players: room.getPlayerList()
    }, ws);

    console.log(`${msg.playerName} odaya katıldı: ${room.code}`);
}

function handleStart(ws, msg) {
    if (!ws.isHost) {
        ws.send(JSON.stringify({ type: 'error', message: 'Sadece oda sahibi oyunu başlatabilir.' }));
        return;
    }

    const room = rooms.getRoom(ws.roomCode);
    if (!room) return;

    // Host karakterini guncelle (degistirmis olabilir)
    if (msg.characterId && msg.playerName) {
        var hostPlayer = room.getPlayer(ws);
        if (hostPlayer) {
            hostPlayer.characterId = msg.characterId;
            hostPlayer.playerName = msg.playerName;
            if (msg.characterId === 'bulent') hostPlayer.playerName = hostPlayer.playerName || 'Bülent Ersoy';
        }
    }

    const players = room.getPlayerList();
    if (players.length < 1) {
        ws.send(JSON.stringify({ type: 'error', message: 'Oyunu başlatmak için en az 1 oyuncu gerekli.' }));
        return;
    }

    room.broadcast({
        type: 'game-starting',
        characters: players,
        gameMode: (msg && msg.gameMode) || 'turn-based'
    });

    console.log(`Oyun başlatıldı: ${room.code} - ${players.length} oyuncu`);
}

function handleCardChoice(ws, msg) {
    const room = rooms.getRoom(ws.roomCode);
    if (!room) return;

    // Bu oyuncunun seçimini kaydet
    const player = room.getPlayer(ws);
    if (!player) return;

    player.lastChoice = {
        playerName: msg.playerName,
        characterId: msg.characterId,
        choiceIndex: msg.choiceIndex,
        choiceText: msg.choiceText,
        effects: msg.effects
    };
    player.chosen = true;

    console.log(`${msg.playerName} seçim yaptı: "${msg.choiceText}"`);

    // Diğer oyunculara bu seçimi göster
    room.broadcast({
        type: 'player-chose',
        playerName: msg.playerName,
        choiceText: msg.choiceText
    }, ws);

    // Herkes seçimini yaptı mı?
    if (room.allPlayersChosen()) {
        const allChoices = room.getAllChoices();
        room.broadcastAll({
            type: 'all-choices-in',
            choices: allChoices
        });
        room.resetChoices();
        console.log(`Oda ${room.code}: Tüm seçimler tamamlandı.`);
    }
}

function handlePlayerAction(ws, msg) {
    const room = rooms.getRoom(ws.roomCode);
    if (!room) return;

    const player = room.getPlayer(ws);
    if (!player) return;

    console.log(`${player.playerName}: ${msg.actionType} -> "${msg.choiceText}" (done: ${msg.done})`);

    // Diğer oyunculara broadcast (aksiyon log'u için)
    room.broadcast({
        type: 'player-action-broadcast',
        playerName: player.playerName,
        characterId: player.characterId,
        actionType: msg.actionType,
        choiceText: msg.choiceText,
        done: msg.done
    }, ws);
}

function handleBossVote(ws, msg) {
    console.log('boss-vote alindi. roomCode:', ws.roomCode, 'bossId:', msg.bossId);
    var room = rooms.getRoom(ws.roomCode);
    if (!room) { console.log('boss-vote: ODA BULUNAMADI!'); return; }
    var initiator = room.getPlayer(ws);
    console.log('boss-vote: oda bulundu, oyuncu:', initiator ? initiator.playerName : '?', 'toplam oyuncu:', room.players.length);
    room.bossVote = { bossId: msg.bossId, votes: {}, initiatorWs: ws };
    room.players.forEach(function(p) {
        console.log('boss-vote-request gonderiliyor:', p.playerName);
        p.ws.send(JSON.stringify({
            type: 'boss-vote-request',
            bossId: msg.bossId,
            initiatorName: initiator ? initiator.playerName : 'Biri'
        }));
    });
    console.log('boss-vote: tum oyunculara gonderildi.');
}

function handleBossVoteResponse(ws, msg) {
    var room = rooms.getRoom(ws.roomCode);
    if (!room || !room.bossVote) return;
    var player = room.getPlayer(ws);
    if (!player) return;
    room.bossVote.votes[player.playerName] = msg.accept;

    room.broadcastAll({
        type: 'boss-vote-update',
        votes: room.bossVote.votes,
        total: room.players.length
    });

    // Biri reddetti → iptal
    if (msg.accept === false) {
        room.broadcastAll({ type: 'boss-vote-cancelled', reason: player.playerName + ' reddetti.' });
        room.bossVote = null;
        return;
    }

    // Herkes kabul etti mi?
    var allAccepted = room.players.every(function(p) {
        return room.bossVote.votes[p.playerName] === true;
    });
    if (allAccepted) {
        var initiatorWs = room.bossVote.initiatorWs;
        if (initiatorWs && initiatorWs.readyState === 1) {
            initiatorWs.send(JSON.stringify({ type: 'boss-fight-start-multi', bossId: room.bossVote.bossId }));
        }
        room.bossVote = null;
    }
}

function handleBossInit(ws, msg) {
    var room = rooms.getRoom(ws.roomCode);
    if (!room) return;
    room.initBossFight(msg.bossId, msg.bossData, msg.fighters, msg.turnOrder);
    var bf = room.bossFight;
    room.broadcastAll({
        type: 'boss-fight-start',
        bossId: msg.bossId,
        bossHp: bf.bossHp,
        bossMaxHp: bf.bossMaxHp,
        fighters: msg.fighters,
        turnOrder: msg.turnOrder
    });
    // Ilk fighter'a sira bildirimi
    room.broadcastAll({
        type: 'boss-whose-turn',
        fighterId: bf.turnOrder[0],
        fighterIndex: 0
    });
}

function handleBossAction(ws, msg) {
    var room = rooms.getRoom(ws.roomCode);
    if (!room || !room.bossFight) return;
    var player = room.getPlayer(ws);
    if (!player) return;
    var bf = room.bossFight;
    var currentFighterId = bf.turnOrder[bf.currentFighterIndex];
    if (player.characterId !== currentFighterId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Sira sende degil.' }));
        return;
    }
    bf.bossHp = msg.newBossHp;
    room.recordBossAction(player.characterId, msg.newFighterHp, msg.newFighterMana);
    room.broadcastAll({
        type: 'boss-action-broadcast',
        actorId: player.characterId,
        actorName: player.playerName,
        skillId: msg.skillId,
        skillName: msg.skillName,
        damage: msg.damage || 0,
        heal: msg.heal || 0,
        newBossHp: msg.newBossHp,
        newFighterHp: msg.newFighterHp,
        newFighterMana: msg.newFighterMana,
        isCrit: msg.isCrit || false,
        endedTurn: msg.endedTurn || false
    });
    if (msg.endedTurn) {
        room.endFighterTurn(player.characterId);
    }
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
        return;
    }
    // Eger fighter turu bitirdiyse, siradakine gec
    if (msg.endedTurn) {
        advanceToNextFighter(room);
    }
}

function advanceToNextFighter(room) {
    var bf = room.bossFight;
    if (!bf) return;
    if (room.allFightersEndedTurn()) {
        executeServerBossTurn(room);
    } else {
        var startIdx = bf.currentFighterIndex;
        var nextIdx = (startIdx + 1) % bf.turnOrder.length;
        while (nextIdx !== startIdx) {
            var fid = bf.turnOrder[nextIdx];
            var f = bf.fighters.find(function(ff){return ff.id===fid;});
            if (f && f.hp > 0 && !bf.fightersEndedTurn[fid]) break;
            nextIdx = (nextIdx + 1) % bf.turnOrder.length;
        }
        bf.currentFighterIndex = nextIdx;
        room.broadcastAll({
            type: 'boss-whose-turn',
            fighterId: bf.turnOrder[nextIdx],
            fighterIndex: nextIdx
        });
    }
}

function handleBossEndTurn(ws) {
    var room = rooms.getRoom(ws.roomCode);
    if (!room || !room.bossFight) return;
    var player = room.getPlayer(ws);
    if (!player) return;
    var bf = room.bossFight;
    room.endFighterTurn(player.characterId);
    room.broadcastAll({
        type: 'boss-action-broadcast',
        actorId: player.characterId,
        actorName: player.playerName,
        skillName: 'Sirasini bitirdi',
        damage: 0, heal: 0,
        newBossHp: bf.bossHp,
        newFighterHp: (bf.fighters.find(function(f){return f.id===player.characterId;})||{}).hp||0,
        newFighterMana: (bf.fighters.find(function(f){return f.id===player.characterId;})||{}).mana||0,
        endedTurn: true
    });
    advanceToNextFighter(room);
}

function executeServerBossTurn(room) {
    var bf = room.bossFight;
    if (!bf) return;
    bf.phase = 'BOSS_TURN';
    bf.bossTurnCounter++;
    var isUltimate = bf.bossTurnCounter >= 5 && bf.bossUltimate;
    var skill;
    if (isUltimate && bf.bossUltimate) {
        skill = bf.bossUltimate;
        bf.bossTurnCounter = 0;
    } else {
        skill = bf.bossSkills[Math.floor(Math.random() * bf.bossSkills.length)];
    }
    var damageResults = [];
    bf.fighters.forEach(function(f) {
        if (f.hp <= 0) return;
        var dmg = skill.baseDmg || 80;
        var reduction = Math.floor(dmg * (f.def || 10) * 0.002);
        var actualDmg = Math.max(5, dmg - reduction);
        f.hp = Math.max(0, f.hp - actualDmg);
        damageResults.push({ fighterId: f.id, hpAfter: f.hp, damage: actualDmg });
    });
    room.broadcastAll({
        type: 'boss-turn',
        isUltimate: isUltimate,
        skillName: skill.name,
        damageResults: damageResults,
        bossHp: bf.bossHp
    });
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
    } else {
        bf.phase = 'FIGHTER_TURNS';
        room.resetFightersEndedTurn();
        bf.currentFighterIndex = 0;
        room.broadcastAll({
            type: 'boss-whose-turn',
            fighterId: bf.turnOrder[0],
            fighterIndex: 0
        });
    }
}

function handleChat(ws, msg) {
    const room = rooms.getRoom(ws.roomCode);
    if (!room) return;
    const player = room.getPlayer(ws);
    if (!player) return;
    room.broadcastAll({
        type: 'chat',
        playerName: player.playerName,
        characterId: player.characterId,
        text: (msg.text || '').substring(0, 200),
        time: Date.now()
    });
}

// Yerel IP adreslerini bul
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

server.listen(PORT, () => {
    console.log('============================================');
    console.log('  BIBIGAME Sunucusu Başlatıldı');
    console.log('============================================');
    console.log(`  Port: ${PORT}`);
    console.log('');
    console.log('  Bu bilgisayarda aç:');
    console.log(`  → http://localhost:${PORT}`);
    console.log('');
    const ips = getLocalIPs();
    if (ips.length > 0) {
        console.log('  Telefon/tablet ile aynı WiFi\'deysen:');
        ips.forEach(ip => {
            console.log(`  → http://${ip}:${PORT}`);
        });
    }
    console.log('');
    console.log('  Sunucuyu durdurmak için Ctrl+C yap.');
    console.log('============================================');
});
