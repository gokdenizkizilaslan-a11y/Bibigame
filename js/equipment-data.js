/* ===== BIBIGAME - Ekipman Verileri (90 Set, 360 Parça, Nadirlikli) ===== */
// Rarity: common(30), uncommon(20), rare(20), epic(10), mythic(5), legendary(3), ilahi(2)
// Her set 4 parça (head, body, legs, feet)

const EQUIPMENT_SETS = [];
var _eqid = 0;

function E(name, rarity, bonus2, bonus4, pieces) {
    EQUIPMENT_SETS.push({ name: name, rarity: rarity, bonus2: bonus2, bonus4: bonus4, pieces: pieces });
}

// Stat aralıkları rarity'e göre
var R = {
    common:    { hp:50,  atk:2, def:2, mr:2, mag:2, spd:1, crit:1, base:2 },
    uncommon:  { hp:75,  atk:3, def:3, mr:3, mag:3, spd:2, crit:1, base:3 },
    rare:      { hp:100, atk:4, def:4, mr:4, mag:4, spd:2, crit:2, base:4 },
    epic:      { hp:150, atk:5, def:5, mr:5, mag:5, spd:3, crit:2, base:5 },
    mythic:    { hp:200, atk:7, def:7, mr:7, mag:7, spd:3, crit:3, base:7 },
    legendary: { hp:300, atk:10, def:10, mr:10, mag:10, spd:4, crit:4, base:10 },
    ilahi:     { hp:500, atk:15, def:15, mr:15, mag:15, spd:5, crit:5, base:15 }
};

// Kısa yol: set oluştur
function makeSet(name, rarity, theme, stats2, stats4) {
    var r = R[rarity];
    var hp = r.hp, a = r.atk, d = r.def, m = r.mr, g = r.mag, s = r.spd, c = r.crit;
    var pieces = [
        { id: name.toLowerCase().replace(/ /g,'_')+'_baslik', name: name+' Başlığı', slot: 'head', stats: { hp: hp/3, def: d/3, mr: m/3 } },
        { id: name.toLowerCase().replace(/ /g,'_')+'_zirh',   name: name+' Zırhı',  slot: 'body', stats: { hp: hp/2, def: d/2, atk: a/3 } },
        { id: name.toLowerCase().replace(/ /g,'_')+'_pant',   name: name+' Pantolonu', slot: 'legs', stats: { hp: hp/3, def: d/3, spd: s/2 } },
        { id: name.toLowerCase().replace(/ /g,'_')+'_bot',    name: name+' Botu',   slot: 'feet', stats: { spd: s/2, atk: a/3 } }
    ];
    // Theme'e göre stat dağılımını ayarla
    if (theme === 'tank') {
        pieces[0].stats = { hp: hp/2, def: d/2, mr: m/2 };
        pieces[1].stats = { hp: hp, def: d, mr: m/2 };
        pieces[2].stats = { hp: hp/2, def: d/2 };
        pieces[3].stats = { hp: hp/3, def: d/3, mr: m/3 };
    } else if (theme === 'mage') {
        pieces[0].stats = { mag: g/2, mr: m/2 };
        pieces[1].stats = { mag: g, hp: hp/3 };
        pieces[2].stats = { mag: g/2, spd: s/2 };
        pieces[3].stats = { mag: g/3, spd: s/2 };
    } else if (theme === 'atk') {
        pieces[0].stats = { atk: a/2, crit: c/2 };
        pieces[1].stats = { atk: a, hp: hp/3 };
        pieces[2].stats = { atk: a/2, spd: s/2 };
        pieces[3].stats = { atk: a/3, spd: s/2 };
    } else if (theme === 'speed') {
        pieces[0].stats = { spd: s/2, crit: c/2 };
        pieces[1].stats = { spd: s/2, atk: a/2 };
        pieces[2].stats = { spd: s, hp: hp/3 };
        pieces[3].stats = { spd: s/2, atk: a/3 };
    } else if (theme === 'heal') {
        pieces[0].stats = { mag: g/2, hp: hp/2 };
        pieces[1].stats = { mag: g, hp: hp/2 };
        pieces[2].stats = { mag: g/2, mr: m/2 };
        pieces[3].stats = { mag: g/3, spd: s/2 };
    } else {
        // balanced: tüm statlardan biraz
        pieces[0].stats = { atk: a/3, def: d/3, hp: hp/3 };
        pieces[1].stats = { atk: a/2, def: d/2, hp: hp/2 };
        pieces[2].stats = { def: d/3, spd: s/2, hp: hp/3 };
        pieces[3].stats = { atk: a/3, spd: s/2 };
    }
    // Statları tam sayıya yuvarla
    pieces.forEach(function(p) {
        Object.keys(p.stats).forEach(function(k) { p.stats[k] = Math.max(1, Math.round(p.stats[k])); });
    });
    // Bonusları hesapla
    var b2 = {}, b4 = {};
    Object.keys(stats2).forEach(function(k) { b2[k] = Math.round(stats2[k] * R[rarity].base * 0.4); });
    Object.keys(stats4).forEach(function(k) { b4[k] = Math.round(stats4[k] * R[rarity].base * 1.2); });
    E(name, rarity, b2, b4, pieces);
}

// ===== 30 COMMON SET =====
var commonSets = [
    ['Demir', 'tank', {def:2}, {def:5,hp:3}],
    ['Deri', 'balanced', {spd:1,def:1}, {spd:3,def:3}],
    ['Keten', 'speed', {spd:2}, {spd:4,atk:1}],
    ['Tahta', 'tank', {def:2,hp:2}, {def:4,hp:4}],
    ['Bakır', 'balanced', {atk:1,def:1}, {atk:3,def:3}],
    ['Yün', 'heal', {mag:1,hp:2}, {mag:3,hp:4}],
    ['Postal', 'tank', {def:2}, {def:5,hp:2}],
    ['Avcı', 'atk', {atk:2}, {atk:4,spd:2}],
    ['Oduncu', 'atk', {atk:1,hp:1}, {atk:3,hp:3}],
    ['Çiftçi', 'heal', {hp:3}, {hp:5,mag:1}],
    ['Avare', 'speed', {spd:1,crit:1}, {spd:3,crit:2}],
    ['Serseri', 'atk', {atk:1,spd:1}, {atk:3,spd:2}],
    ['Köylü', 'balanced', {hp:2,def:1}, {hp:4,def:3}],
    ['Derviş', 'heal', {mag:2}, {mag:3,hp:2}],
    ['Madenci', 'tank', {def:2}, {def:5,atk:1}],
    ['İşçi', 'balanced', {atk:1,hp:1}, {atk:2,hp:4}],
    ['Balıkçı', 'speed', {spd:2}, {spd:3,atk:1}],
    ['Çoban', 'heal', {hp:2}, {hp:4,def:2}],
    ['Seyyah', 'speed', {spd:1}, {spd:3,hp:2}],
    ['Eski Muhafız', 'tank', {def:2,hp:1}, {def:4,hp:3}],
    ['Köşe Bekçisi', 'atk', {atk:2}, {atk:3,def:2}],
    ['Mahkum', 'balanced', {atk:1,def:1,hp:1}, {atk:2,def:2,hp:2}],
    ['Kaçak', 'speed', {spd:2}, {spd:4}],
    ['Çırak', 'balanced', {atk:1,mag:1}, {atk:2,mag:2}],
    ['Habercı', 'speed', {spd:1,hp:1}, {spd:3,hp:2}],
    ['Ebe', 'heal', {mag:2,hp:1}, {mag:3,hp:3}],
    ['Demirci', 'tank', {def:2,atk:1}, {def:4,atk:2}],
    ['Kazıcı', 'atk', {atk:2}, {atk:3,hp:2}],
    ['Ormanlı', 'balanced', {spd:1,hp:2}, {spd:2,hp:4}],
    ['Tarla Bekçisi', 'balanced', {def:1,hp:2}, {def:3,hp:4}],
];
commonSets.forEach(function(s) { makeSet(s[0], 'common', s[1], s[2], s[3]); });

// ===== 20 UNCOMMON SET =====
var uncommonSets = [
    ['Zincir', 'tank', {def:3}, {def:6,hp:4}],
    ['Yılan Derisi', 'speed', {spd:2,atk:1}, {spd:5,atk:2}],
    ['Kemik', 'tank', {def:2,mr:2}, {def:5,mr:4}],
    ['Tüccar', 'balanced', {hp:3,gold:1}, {hp:6,def:3}],
    ['Kartal', 'speed', {spd:3}, {spd:6,crit:2}],
    ['Obsidyen', 'mage', {mag:3}, {mag:6,mr:3}],
    ['Alev', 'mage', {mag:2,atk:1}, {mag:5,atk:3}],
    ['Buz', 'mage', {mag:2,mr:2}, {mag:5,mr:4}],
    ['Pusu', 'atk', {atk:2,crit:1}, {atk:5,crit:2}],
    ['Gece', 'speed', {spd:2}, {spd:5,atk:2}],
    ['Dağ', 'tank', {def:3,hp:2}, {def:6,hp:5}],
    ['Şimşek', 'speed', {spd:3,crit:1}, {spd:6,crit:3}],
    ['Sis', 'mage', {mag:2,mr:2}, {mag:5,mr:5}],
    ['Çakal', 'atk', {atk:3}, {atk:5,spd:3}],
    ['Ayı', 'tank', {hp:3,def:2}, {hp:7,def:4}],
    ['Tilki', 'speed', {spd:2,crit:2}, {spd:4,crit:4}],
    ['Yarasa', 'atk', {atk:2,spd:1}, {atk:4,spd:3}],
    ['Toprak', 'tank', {def:3}, {def:6,mr:3}],
    ['Nehir', 'heal', {mag:3,hp:2}, {mag:5,hp:5}],
    ['Yıldız', 'mage', {mag:3,crit:1}, {mag:6,crit:2}],
];
uncommonSets.forEach(function(s) { makeSet(s[0], 'uncommon', s[1], s[2], s[3]); });

// ===== 20 RARE SET =====
var rareSets = [
    ['Şövalye', 'tank', {def:4,hp:3}, {def:8,hp:8}],
    ['Suikastçi', 'atk', {atk:4,crit:2}, {atk:8,spd:4,crit:3}],
    ['Büyücü', 'mage', {mag:4,mr:2}, {mag:8,mr:5}],
    ['Şifa', 'heal', {mag:4,hp:3}, {mag:8,hp:8}],
    ['Kristal', 'tank', {def:3,mr:3}, {def:7,mr:7}],
    ['Doğa', 'speed', {spd:3,hp:3}, {spd:7,hp:7,atk:2}],
    ['Gölge', 'atk', {atk:3,mr:2}, {atk:7,mr:5}],
    ['Savaşçı', 'atk', {atk:4}, {atk:9,def:3,hp:4}],
    ['Kâhin', 'mage', {mag:4,crit:2}, {mag:8,crit:4,spd:2}],
    ['Koruyucu', 'tank', {mr:3,def:3}, {mr:7,def:7}],
    ['Bilge', 'mage', {mag:4,crit:1}, {mag:9,crit:3,spd:2}],
    ['Fırtına', 'speed', {spd:5}, {spd:9,atk:3,crit:3}],
    ['Kan', 'atk', {atk:4}, {atk:8,hp:2}],
    ['Yıldırım', 'mage', {mag:3,spd:2}, {mag:7,spd:4}],
    ['Ejderha', 'atk', {atk:4,mag:2}, {atk:9,mag:4,hp:5}],
    ['Bronz', 'tank', {def:4,hp:2}, {def:8,hp:6}],
    ['Cıva', 'speed', {spd:4}, {spd:8,mag:3}],
    ['Mercan', 'heal', {mag:4,hp:3}, {mag:7,hp:7}],
    ['Duman', 'mage', {mag:3,spd:2}, {mag:7,spd:5}],
    ['Çelik', 'tank', {def:5}, {def:10,atk:3}],
];
rareSets.forEach(function(s) { makeSet(s[0], 'rare', s[1], s[2], s[3]); });

// ===== 10 EPIC SET =====
var epicSets = [
    ['Ejderha Lordu', 'atk', {atk:6,mag:3}, {atk:12,mag:6,hp:8}],
    ['Baş Melek', 'heal', {mag:6,hp:5}, {mag:14,hp:12}],
    ['Ölüm', 'atk', {atk:6,crit:4}, {atk:14,crit:8}],
    ['Yüksek Büyücü', 'mage', {mag:7,mr:4}, {mag:14,mr:10}],
    ['Titan', 'tank', {def:7,hp:6}, {def:15,hp:15}],
    ['Feniks', 'mage', {mag:6,hp:4}, {mag:12,hp:10}],
    ['Yeraltı Lordu', 'tank', {def:6,mr:5}, {def:13,mr:12}],
    ['Gök', 'speed', {spd:7,atk:3}, {spd:14,atk:6}],
    ['Hiçlik', 'mage', {mag:6,mr:5}, {mag:14,mr:10}],
    ['Kıyamet', 'atk', {atk:7,def:3}, {atk:15,def:8,hp:6}],
];
epicSets.forEach(function(s) { makeSet(s[0], 'epic', s[1], s[2], s[3]); });

// ===== 5 MYTHIC SET =====
var mythicSets = [
    ['Tanrı Savaşçısı', 'atk', {atk:10,def:5,crit:4}, {atk:22,def:10,crit:8,hp:10}],
    ['Kadim Ejderha', 'atk', {atk:8,mag:6,hp:6}, {atk:18,mag:14,hp:15}],
    ['Sonsuzluk', 'mage', {mag:10,spd:4}, {mag:22,spd:8,mr:10,special:'doubleCast'}],
    ['Cennet', 'heal', {mag:10,hp:8}, {mag:22,hp:18}],
    ['Cehennem', 'mage', {mag:10,atk:5}, {mag:20,atk:12}],
];
mythicSets.forEach(function(s) { makeSet(s[0], 'mythic', s[1], s[2], s[3]); });

// ===== 3 LEGENDARY SET =====
var legendSets = [
    ['Yarı Tanrı', 'atk', {atk:15,def:8,crit:6,hp:10}, {atk:35,def:18,crit:12,hp:25}],
    ['Baş Büyücü', 'mage', {mag:15,mr:10,spd:5}, {mag:35,mr:20,spd:10}],
    ['Kadim Koruyucu', 'tank', {def:15,mr:12,hp:12}, {def:35,mr:25,hp:30}],
];
legendSets.forEach(function(s) { makeSet(s[0], 'legendary', s[1], s[2], s[3]); });

// ===== 2 İLAHİ (DIVINE) SET =====
var ilahiSets = [
    ['İlahi Adalet', 'atk', {atk:25,def:15,crit:10,hp:20}, {atk:60,def:35,crit:20,hp:50}],
    ['Kozmik Güç', 'mage', {mag:25,mr:15,spd:8}, {mag:60,mr:35,spd:15}],
];
ilahiSets.forEach(function(s) { makeSet(s[0], 'ilahi', s[1], s[2], s[3]); });

// ===== Yardımcı Fonksiyonlar =====

function getEquipmentById(id) {
    for (var i = 0; i < EQUIPMENT_SETS.length; i++) {
        for (var j = 0; j < EQUIPMENT_SETS[i].pieces.length; j++) {
            if (EQUIPMENT_SETS[i].pieces[j].id === id) return EQUIPMENT_SETS[i].pieces[j];
        }
    }
    return null;
}

function getSetByPieceId(id) {
    for (var i = 0; i < EQUIPMENT_SETS.length; i++) {
        for (var j = 0; j < EQUIPMENT_SETS[i].pieces.length; j++) {
            if (EQUIPMENT_SETS[i].pieces[j].id === id) return EQUIPMENT_SETS[i];
        }
    }
    return null;
}

function getAllEquipment() {
    var all = [];
    EQUIPMENT_SETS.forEach(function(set) {
        set.pieces.forEach(function(p) { all.push(p); });
    });
    return all;
}

function getEquipmentByRarity(rarity) {
    var all = [];
    EQUIPMENT_SETS.forEach(function(set) {
        if (set.rarity === rarity) set.pieces.forEach(function(p) { all.push(p); });
    });
    return all;
}

console.log('Ekipman: ' + EQUIPMENT_SETS.length + ' set, ' + getAllEquipment().length + ' parca');
