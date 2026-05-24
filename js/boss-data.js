/* ===== BIBIGAME - Boss Verileri (6 Boss) ===== */
const BOSSES = [];

function addBossSkill(bossId, skill) {
    var boss = BOSSES.find(function(b) { return b.id === bossId; });
    if (boss) boss.skills.push(skill);
}

// ===== 5. TIRAN: TAYYIP & KILICLAROGLU =====
BOSSES.push({
    id: 'tayyip_kiliclaroglu', name: 'Tayyip & Kiliclaroglu', title: '5. Tiran - Ask ve Vergi', order: 5,
    baseHp: 3500, atk: 35, def: 14, mr: 10, mag: 8, spd: 8,
    deathLine: 'Vergilerim... hepsi seni mutlu etmek icindi Kemalim.',
    introText: 'Iki asik, modern Turkiyeden bu karanlik diyara isinlanmis.',
    portraitKey: 'tayyip_kiliclaroglu',
    skills: [
        { name: 'Vergi Darbesi', type: 'physical', baseDmg: 130, target: 'single', desc: 'Tayyip vergi levhasiyla vurur.' },
        { name: 'Adalet Yumrugu', type: 'physical', baseDmg: 120, target: 'all', desc: 'Kiliclaroglu herkese adalet dagitir.' },
        { name: 'Ekonomi Krizi', type: 'magic', baseDmg: 100, target: 'all', desc: 'Piyasalar coker.' },
        { name: 'Secim Vaadi', type: 'heal', baseDmg: -500, target: 'self', desc: 'Bos vaatlerle iyilesir.' },
        { name: 'Miting Coskusu', type: 'buff', baseDmg: 0, target: 'self', desc: '2 tur +5 ATK.' }
    ],
    ultimate: { name: 'OHAL Ilani', type: 'magic', baseDmg: 450, target: 'all', desc: 'Olaganustu hal!' }
});

// ===== 4. TIRAN: EYUP B. =====
BOSSES.push({
    id: 'eyup_b', name: 'Eyup B.', title: '4. Tiran - Geometri Efendisi', order: 4,
    baseHp: 5000, atk: 40, def: 14, mr: 12, mag: 20, spd: 10,
    deathLine: 'Sinav... iptal... edilmistir...',
    introText: 'Elit kitap firlatma yetenegiyle taninan matematik hocasi.',
    portraitKey: 'eyup_b',
    skills: [
        { name: 'Kitap Firlatma', type: 'physical', baseDmg: 160, target: 'all', desc: 'Kitaplari saga sola firlatir.' },
        { name: 'Geometri Halkasi', type: 'magic', baseDmg: 150, target: 'all', desc: 'Pergel ile cizdigi cember.' },
        { name: 'Turev Alma', type: 'magic', baseDmg: 170, target: 'single', desc: 'Caninin turevini alir.' },
        { name: 'Soru Cozumu', type: 'heal', baseDmg: -600, target: 'self', desc: 'Zor soruyu cozup moral bulur.' },
        { name: 'Sinav Kaygisi', type: 'debuff', baseDmg: 0, target: 'all', desc: '2 tur -3 DEF.' }
    ],
    ultimate: { name: 'Kuantum Denklemi', type: 'magic', baseDmg: 550, target: 'all', desc: 'Cozulemeyen denklem patlar.' }
});

// ===== 3. TIRAN: MICHAEL JACKSON =====
BOSSES.push({
    id: 'michael_jackson', name: 'Michael Jackson', title: '3. Tiran - Popun Krali', order: 3,
    baseHp: 7000, atk: 45, def: 18, mr: 18, mag: 30, spd: 16,
    deathLine: 'Hee-hee... Bu son dansimdi... Ama muzik asla olmez.',
    introText: 'Ay yuruyusuyle savas alanina gelir.',
    portraitKey: 'michael_jackson',
    skills: [
        { name: 'Ay Yuruyusu', type: 'physical', baseDmg: 200, target: 'single', desc: 'Puruzsuz bir ay yuruyusuyle carpar.' },
        { name: 'Billie Jean Ritmi', type: 'magic', baseDmg: 180, target: 'all', desc: 'Bas ritmi herkesi sarsar.' },
        { name: 'Thriller Dansi', type: 'magic', baseDmg: 200, target: 'all', desc: 'Zombi dansi herkesi icine ceker.' },
        { name: 'Smooth Criminal', type: 'physical', baseDmg: 220, target: 'single', desc: 'Yercekimine meydan okuyan one egilme.' },
        { name: 'Heal the World', type: 'heal', baseDmg: -800, target: 'self', desc: 'Dunyayi iyilestirirken kendi de iyilesir.' }
    ],
    ultimate: { name: 'Moonwalk Kiyameti', type: 'magic', baseDmg: 650, target: 'all', desc: 'Geri geri yururken zaman durur.' }
});

// ===== 2. TIRAN: SUTAS AYRAN =====
BOSSES.push({
    id: 'sutas_ayran', name: 'Sutas Ayran', title: '2. Tiran - Fermente Ofke', order: 2,
    baseHp: 9000, atk: 50, def: 22, mr: 14, mag: 22, spd: 6,
    deathLine: 'Son damla... sisenin dibinde kaldi...',
    introText: 'Kocaman bir ayran kutusu.',
    portraitKey: 'sutas_ayran',
    skills: [
        { name: 'Ayran Dalgasi', type: 'magic', baseDmg: 250, target: 'all', desc: 'Ayran dalgasi her yeri kaplar.' },
        { name: 'Yogurt Firtinasi', type: 'magic', baseDmg: 280, target: 'all', desc: 'Probiyotik firtina.' },
        { name: 'Kapak Firlatma', type: 'physical', baseDmg: 240, target: 'all', desc: 'Etrafa sise kapaklari sacar.' },
        { name: 'Fermantasyon', type: 'heal', baseDmg: -1000, target: 'self', desc: 'Mayalanip iyilesir.' },
        { name: 'Eksi Tat', type: 'debuff', baseDmg: 0, target: 'all', desc: '2 tur -4 ATK.' }
    ],
    ultimate: { name: 'Sut Patlamasi', type: 'magic', baseDmg: 800, target: 'all', desc: 'Tum ayran birikintisi patlar.' }
});

// ===== 1. TIRAN: MARI & DARI =====
BOSSES.push({
    id: 'mari_dari', name: 'Mari & Dari', title: '1. Tiran - Olumsuz Ask', order: 1,
    baseHp: 11000, atk: 55, def: 20, mr: 20, mag: 28, spd: 10,
    deathLine: 'El ele tutusurlar. Mari: "Sonsuza kadar..." Dari: "...birlikte."',
    introText: 'Birbirlerine olan asklariyla bilinirler.',
    portraitKey: 'mari_daridir',
    special: 'shared_damage',
    skills: [
        { name: 'Ask Darbesi', type: 'physical', baseDmg: 280, target: 'all', desc: 'Ask dalgasi herkesi sarar.' },
        { name: 'Kalp Patlamasi', type: 'magic', baseDmg: 320, target: 'all', desc: 'Ask enerjisi dalga dalga yayilir.' },
        { name: 'Sevgi Sifasi', type: 'heal', baseDmg: -1200, target: 'self', desc: 'Asklariyla iyilesirler.' },
        { name: 'Kiskanclik Krizi', type: 'debuff', baseDmg: 0, target: 'all', desc: '2 tur -3 ATK -3 DEF.' },
        { name: 'Sonsuz Baglilik', type: 'buff', baseDmg: 0, target: 'self', desc: '3 tur +5 DEF +5 MR.' }
    ],
    ultimate: { name: 'Ebedi Ask', type: 'magic', baseDmg: 900, target: 'all', desc: 'Asklari fiziksel forma burunur.' }
});

// ===== FINAL BOSS: ZEYTIN =====
BOSSES.push({
    id: 'zeytin', name: 'Zeytin', title: 'Kara Kedi - 4 Buyuk Kotuden Biri', order: 0,
    baseHp: 15000, atk: 65, def: 25, mr: 25, mag: 35, spd: 14,
    deathLine: 'Miyav... Bu sadece bir mola... Insanlar bitmedi...',
    introText: 'Siyah bir kedi. Ot icmeyi ve marul yemeyi sever.',
    portraitKey: 'zeytin',
    skills: [
        { name: 'Pence Darbesi', type: 'physical', baseDmg: 350, target: 'all', desc: 'Pencelerini savurarak herkese saldirir.' },
        { name: 'Karanlik Topu', type: 'magic', baseDmg: 380, target: 'single', desc: 'Karanlik enerjiyle dolu bir yumak.' },
        { name: 'Marul Ziyafeti', type: 'heal', baseDmg: -1500, target: 'self', desc: 'Marul yiyip canini yeniler.' },
        { name: 'Ot Dumani', type: 'debuff', baseDmg: 0, target: 'all', desc: '2 tur -5 ATK.' },
        { name: 'Kedi Cigligi', type: 'magic', baseDmg: 400, target: 'all', desc: 'Tuyler urperten bir ciglik.' }
    ],
    ultimate: { name: 'Dokuz Can', type: 'magic', baseDmg: 1200, target: 'all', desc: 'Dokuz caninin gucunu serbest birakir.' }
});

function getBossById(id) { return BOSSES.find(function(b) { return b.id === id; }) || null; }
function getBossByOrder(order) { return BOSSES.find(function(b) { return b.order === order; }) || null; }
