/* ===== BIBIGAME - Artifact Verileri (20 Kolye + 40 Yüzük) ===== */

const ARTIFACTS = [];

function A(id, name, slot, rarity, stats, setBonus, setId) {
    ARTIFACTS.push({ id: id, name: name, slot: slot, rarity: rarity, stats: stats, setBonus: setBonus || null, setId: setId || null });
}

// ===== 20 KOLYE =====
A('kolye_01','Taş Kolye','necklace','common',{hp:30,def:1});
A('kolye_02','Demir Kolye','necklace','common',{hp:40,atk:1});
A('kolye_03','Bakır Kolye','necklace','common',{hp:35,mr:1});
A('kolye_04','Gümüş Kolye','necklace','uncommon',{hp:60,mag:2});
A('kolye_05','Altın Kolye','necklace','uncommon',{hp:80,def:2,mr:1});
A('kolye_06','Yakut Kolye','necklace','rare',{hp:100,atk:3,crit:2});
A('kolye_07','Safir Kolye','necklace','rare',{hp:100,mag:3,mr:2});
A('kolye_08','Zümrüt Kolye','necklace','rare',{hp:120,def:3,spd:2});
A('kolye_09','Elmas Kolye','necklace','epic',{hp:180,atk:5,mag:3,crit:3});
A('kolye_10','Ejderha Dişi','necklace','epic',{hp:200,atk:6,def:3});
A('kolye_11','Buz Kristali','necklace','epic',{hp:170,mag:6,mr:4});
A('kolye_12','Karanlık Kolye','necklace','mythic',{hp:280,atk:7,mag:5,crit:4});
A('kolye_13','Melek Kolyesi','necklace','mythic',{hp:300,mag:8,def:4,mr:4});
A('kolye_14','Kadim Run','necklace','mythic',{hp:260,atk:5,mag:5,mana:2});
A('kolye_15','Feniks Tüyü','necklace','legendary',{hp:400,atk:10,mag:5,crit:5});
A('kolye_16','Ejderha Kalbi','necklace','legendary',{hp:500,atk:12,def:5,mr:5});
A('kolye_17','Zaman Kumu','necklace','legendary',{hp:450,mag:12,spd:6,crit:5});
A('kolye_18','Kozmik Işık','necklace','ilahi',{hp:700,atk:15,mag:15,crit:8,mana:3});
A('kolye_19','Sonsuzluk Zinciri','necklace','ilahi',{hp:800,def:12,mr:12,spd:8});
A('kolye_20','Kader İpi','necklace','ilahi',{hp:750,atk:12,mag:12,crit:10,mana:4});

// ===== 40 YÜZÜK =====
// Common (8)
A('yuzuk_01','Taş Yüzük','ring','common',{hp:20,def:1});
A('yuzuk_02','Demir Yüzük','ring','common',{hp:25,atk:1});
A('yuzuk_03','Bakır Yüzük','ring','common',{hp:20,mr:1});
A('yuzuk_04','Kemik Yüzük','ring','common',{atk:2});
A('yuzuk_05','İp Yüzük','ring','common',{spd:2});
A('yuzuk_06','Tahta Yüzük','ring','common',{hp:30});
A('yuzuk_07','Cam Yüzük','ring','common',{mag:2});
A('yuzuk_08','Çakıl Yüzük','ring','common',{crit:1});

// Uncommon (8)
A('yuzuk_09','Gümüş Yüzük','ring','uncommon',{hp:45,def:2});
A('yuzuk_10','Ametist Yüzük','ring','uncommon',{hp:40,mag:3});
A('yuzuk_11','Opal Yüzük','ring','uncommon',{hp:40,spd:3});
A('yuzuk_12','Turkuaz Yüzük','ring','uncommon',{hp:50,mr:3});
A('yuzuk_13','Akik Yüzük','ring','uncommon',{atk:3,crit:1});
A('yuzuk_14','Yeşim Yüzük','ring','uncommon',{def:3,hp:35});
A('yuzuk_15','Kuvars Yüzük','ring','uncommon',{mag:3,mana:1});
A('yuzuk_16','Onyx Yüzük','ring','uncommon',{atk:2,def:2});

// Rare (8)
A('yuzuk_17','Yakut Yüzük','ring','rare',{hp:70,atk:4,crit:2});
A('yuzuk_18','Safir Yüzük','ring','rare',{hp:70,mag:4,mr:2});
A('yuzuk_19','Zümrüt Yüzük','ring','rare',{hp:80,def:4,spd:2});
A('yuzuk_20','Elmas Yüzük','ring','rare',{hp:90,atk:3,mag:2});
A('yuzuk_21','Yıldız Yüzüğü','ring','rare',{hp:75,mag:4,crit:3});
A('yuzuk_22','Ay Yüzüğü','ring','rare',{hp:75,mr:4,spd:3});
A('yuzuk_23','Güneş Yüzüğü','ring','rare',{hp:85,atk:4,def:3});
A('yuzuk_24','Kan Yüzüğü','ring','rare',{hp:65,atk:5});

// Epic (6)
A('yuzuk_25','Ejderha Yüzüğü','ring','epic',{hp:130,atk:6,def:4,crit:3});
A('yuzuk_26','Buz Yüzüğü','ring','epic',{hp:120,mag:6,mr:5});
A('yuzuk_27','Alev Yüzüğü','ring','epic',{hp:120,atk:6,mag:4});
A('yuzuk_28','Fırtına Yüzüğü','ring','epic',{hp:110,spd:7,crit:4});
A('yuzuk_29','Gölge Yüzüğü','ring','epic',{hp:125,atk:5,mr:5});
A('yuzuk_30','Işık Yüzüğü','ring','epic',{hp:130,mag:5,def:5});

// Mythic (4)
A('yuzuk_31','Kadim Yüzük','ring','mythic',{hp:200,atk:8,mag:5,crit:4});
A('yuzuk_32','Ruh Yüzüğü','ring','mythic',{hp:190,mag:9,def:5,mr:5});
A('yuzuk_33','Yıldırım Yüzüğü','ring','mythic',{hp:180,spd:9,crit:6});
A('yuzuk_34','Hiçlik Yüzüğü','ring','mythic',{hp:210,atk:7,mag:7});

// Legendary (3)
A('yuzuk_35','Kral Yüzüğü','ring','legendary',{hp:300,atk:12,def:8,crit:6});
A('yuzuk_36','Tanrı Yüzüğü','ring','legendary',{hp:320,mag:12,mr:8,mana:3});
A('yuzuk_37','Kader Yüzüğü','ring','legendary',{hp:280,atk:10,mag:8,spd:6,crit:8});

// İlahi (3)
A('yuzuk_38','Kozmik Yüzük','ring','ilahi',{hp:500,atk:15,mag:15,crit:10,mana:5});
A('yuzuk_39','Sonsuzluk Yüzüğü','ring','ilahi',{hp:550,def:15,mr:15,spd:10});
A('yuzuk_40','Evren Yüzüğü','ring','ilahi',{hp:480,atk:12,mag:12,def:10,mr:10,crit:8,mana:4});

// ===== SET BONUSLARI (2 parca) =====
var SET_BONUSES = {};

function SB(setId, bonus) { SET_BONUSES[setId] = bonus; }

SB('ates_seti',{desc:'Ateş Seti (Yakut Kolye + Alev Yüzük)',atk:5,mag:3});
SB('buz_seti',{desc:'Buz Seti (Buz Kristali + Buz Yüzük)',mag:5,mr:4});
SB('ejderha_seti',{desc:'Ejderha Seti (Ejderha Dişi + Ejderha Yüzüğü)',atk:8,hp:100});
SB('kral_seti',{desc:'Kral Seti (Elmas Kolye + Kral Yüzüğü)',atk:5,def:5,hp:80});
SB('kader_seti',{desc:'Kader Seti (Kader İpi + Kader Yüzüğü)',atk:8,mag:8,crit:8});

// Set atamalari
ARTIFACTS.forEach(function(a){
    if(a.id==='kolye_05'){a.setId='ates_seti';a.setBonus=SET_BONUSES['ates_seti'];}
    if(a.id==='yuzuk_27'){a.setId='ates_seti';a.setBonus=SET_BONUSES['ates_seti'];}
    if(a.id==='kolye_11'){a.setId='buz_seti';a.setBonus=SET_BONUSES['buz_seti'];}
    if(a.id==='yuzuk_26'){a.setId='buz_seti';a.setBonus=SET_BONUSES['buz_seti'];}
    if(a.id==='kolye_10'){a.setId='ejderha_seti';a.setBonus=SET_BONUSES['ejderha_seti'];}
    if(a.id==='yuzuk_25'){a.setId='ejderha_seti';a.setBonus=SET_BONUSES['ejderha_seti'];}
    if(a.id==='kolye_09'){a.setId='kral_seti';a.setBonus=SET_BONUSES['kral_seti'];}
    if(a.id==='yuzuk_35'){a.setId='kral_seti';a.setBonus=SET_BONUSES['kral_seti'];}
    if(a.id==='kolye_20'){a.setId='kader_seti';a.setBonus=SET_BONUSES['kader_seti'];}
    if(a.id==='yuzuk_37'){a.setId='kader_seti';a.setBonus=SET_BONUSES['kader_seti'];}
});

function getArtifactById(id) { return ARTIFACTS.find(function(a){return a.id===id;})||null; }
function getArtifactsByRarity(rarity) { return ARTIFACTS.filter(function(a){return a.rarity===rarity;}); }
function getArtifactsBySlot(slot) { return ARTIFACTS.filter(function(a){return a.slot===slot;}); }
function getRandomArtifact(rarity) {
    var pool = rarity ? getArtifactsByRarity(rarity) : ARTIFACTS;
    if(!pool.length) pool = ARTIFACTS;
    return pool[Math.floor(Math.random()*pool.length)];
}

console.log('Artifact verileri yuklendi: ' + ARTIFACTS.length + ' artifacts');
