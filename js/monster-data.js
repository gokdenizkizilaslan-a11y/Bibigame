/* ===== BIBIGAME - Canavar Verileri (Nadirlik + XP Sistemi) ===== */

const RARITY_XP = { D: [150,300], C: [300,550], B: [500,900], A: [800,1400], S: [1200,2200], SS: [2000,4000] };
const RARITY_LABEL = { D:'D', C:'C', B:'B', A:'A', S:'S', SS:'SS' };
const RARITY_COLOR = { D:'#888', C:'#6a9a5a', B:'#5b8bd5', A:'#c8a84e', S:'#c860d0', SS:'#ff4444' };
const RARITY_ICON = { D:'⬜', C:'🟩', B:'🟦', A:'🟨', S:'🟪', SS:'🟥' };

function rarityXp(rarity) {
    var range = RARITY_XP[rarity] || [100,250];
    return Math.floor(range[0] + Math.random() * (range[1] - range[0]));
}

const MONSTERS = [
    // ===== D SEViYE (Common - Gün 1-10) XP: 150-300 =====
    { id:'kurt', name:'Kurt', tier:1, rarity:'D', hp:350, attackBonus:16, defense:15, damageDie:8, speed:10, mr:8, dmgType:'physical', description:'Sari disleriyle hirlayan, acliktan gozu donmus bir bozkurt.', rewards:{gold:3,food:2,wood:0} },
    { id:'zehirli-orumcek', name:'Zehirli Orumcek', tier:1, rarity:'D', hp:300, attackBonus:19, defense:13, damageDie:6, speed:13, mr:10, dmgType:'physical', description:'Sirtindaki parlak desenlerle zehrini belli eden dev bir magara orumcegi.', rewards:{gold:2,food:1,wood:0} },
    { id:'kemirgen-surusu', name:'Kemirgen Surusu', tier:1, rarity:'D', hp:400, attackBonus:13, defense:11, damageDie:6, speed:8, mr:6, dmgType:'physical', description:'Birbirine kenetlenmis, karanligin icinden akan dev bir fare surusu.', rewards:{gold:2,food:3,wood:0} },
    { id:'zombi', name:'Zombi', tier:1, rarity:'D', hp:320, attackBonus:14, defense:8, damageDie:6, speed:4, mr:1, dmgType:'physical', description:'Curumus etten yapilmis, yavas ama dayanikli bir olu.', rewards:{gold:2,food:1,wood:0} },
    { id:'zehirli-solucan', name:'Zehirli Solucan', tier:1, rarity:'D', hp:380, attackBonus:12, defense:6, damageDie:8, speed:7, mr:4, dmgType:'physical', description:'Topragin altindan cikan, asit tüküren dev bir solucan.', rewards:{gold:3,food:3,wood:0} },
    { id:'hayalet', name:'Hayalet', tier:1, rarity:'D', hp:260, attackBonus:16, defense:4, damageDie:6, speed:18, mr:20, dmgType:'magic', description:'Duvarlardan gecen, dokunulmaz bir ruh.', rewards:{gold:5,food:0,wood:0} },
    { id:'dev-sivrisinek', name:'Dev Sivrisinek', tier:1, rarity:'D', hp:280, attackBonus:15, defense:5, damageDie:4, speed:20, mr:3, dmgType:'physical', description:'Keskin ignesiyle kan emen dev bir bocek.', rewards:{gold:2,food:2,wood:0} },
    { id:'balcik-adam', name:'Balcik Adam', tier:1, rarity:'D', hp:420, attackBonus:11, defense:10, damageDie:6, speed:3, mr:2, dmgType:'physical', description:'Camurdan olusmus, sekilsiz ve agir hareket eden bir yaratik.', rewards:{gold:3,food:0,wood:1} },

    // ===== C SEViYE (Uncommon - Gün 1-15) XP: 300-550 =====
    { id:'et-yiyen-bitki', name:'Et Yiyen Bitki', tier:1, rarity:'C', hp:450, attackBonus:18, defense:17, damageDie:8, speed:6, mr:5, dmgType:'physical', description:'Asma kollari ve dikenli sarmasiklariyla batakligin ac bekcisi.', rewards:{gold:4,food:2,wood:1} },
    { id:'golge-yaratik', name:'Golge Yaratik', tier:2, rarity:'B', hp:500, attackBonus:22, defense:18, damageDie:10, speed:12, mr:10, dmgType:'physical', description:'Bicimsiz, karanliktan beslenen ve dokundugu her seyi solduran bir hiclik parcasi.', rewards:{gold:5,food:0,wood:2} },
    { id:'iskelet-savasci', name:'Iskelet Savasci', tier:2, rarity:'B', hp:575, attackBonus:21, defense:20, damageDie:8, speed:9, mr:7, dmgType:'physical', description:'Pasli kilici ve catlamis zirhiyla eski bir savascinin kemikleri.', rewards:{gold:6,food:0,wood:1} },
    { id:'harpi', name:'Harpi', tier:2, rarity:'C', hp:475, attackBonus:24, defense:17, damageDie:8, speed:14, mr:11, dmgType:'physical', description:'Keskin penceleri ve tuyler ürperten cigligiyla gokyuzunun lanetli avcisi.', rewards:{gold:7,food:1,wood:0} },
    { id:'dev-orumcek', name:'Dev Orumcek', tier:2, rarity:'C', hp:480, attackBonus:18, defense:12, damageDie:8, speed:16, mr:8, dmgType:'physical', description:'Tavanlarda gezinen, ag puskurten dev bir orumcek.', rewards:{gold:5,food:2,wood:1} },
    { id:'zincirli-ruh', name:'Zincirli Ruh', tier:2, rarity:'B', hp:420, attackBonus:20, defense:10, damageDie:10, speed:11, mr:14, dmgType:'magic', description:'Zincirlere bagli, inleyen bir ruh. Soguk dokunusu ruhu dondurur.', rewards:{gold:7,food:0,wood:0} },
    { id:'tas-adam', name:'Tas Adam', tier:2, rarity:'C', hp:550, attackBonus:19, defense:22, damageDie:10, speed:5, mr:6, dmgType:'physical', description:'Kayadan oyulmus, yumruguyla topragi titreten bir yaratik.', rewards:{gold:5,food:0,wood:3} },
    { id:'ates-yaratik', name:'Ates Yaratik', tier:2, rarity:'C', hp:440, attackBonus:23, defense:14, damageDie:8, speed:13, mr:12, dmgType:'magic', description:'Vucudundan alevler yukselen, kucuk bir ates elementi.', rewards:{gold:6,food:0,wood:1} },

    // ===== B SEViYE (Rare - Gün 5-25) XP: 500-900 =====
    { id:'curumus-dev', name:'Curumus Dev', tier:2, rarity:'B', hp:900, attackBonus:55, defense:22, damageDie:14, speed:6, mr:8, dmgType:'physical', description:'Bir zamanlar insan olan, simdi kokusmus et ve kor kuvvete donusmus dev bir yaratik.', rewards:{gold:4,food:3,wood:2} },
    { id:'alev-iblisi', name:'Alev Iblisi', tier:3, rarity:'A', hp:1400, attackBonus:72, defense:28, damageDie:18, speed:12, mr:14, dmgType:'physical', description:'Derisinden alevler sizan, gozleri koz gibi yanan bir alt-dunya yaratigi.', rewards:{gold:8,food:0,wood:3} },
    { id:'su-iblisi', name:'Su Iblisi', tier:3, rarity:'A', hp:1200, attackBonus:65, defense:20, damageDie:16, speed:13, mr:22, dmgType:'magic', description:'Nehirlerden cikan, suyu silah gibi kullanan kadim bir iblis.', rewards:{gold:9,food:0,wood:3} },
    { id:'gargoyle', name:'Gargoyle', tier:3, rarity:'B', hp:850, attackBonus:48, defense:22, damageDie:14, speed:15, mr:16, dmgType:'physical', description:'Tastan oyulmus, canlanmis cirkin bir yaratik. Kanatlari var.', rewards:{gold:10,food:0,wood:2} },
    { id:'zirhli-trol', name:'Zirhli Trol', tier:3, rarity:'B', hp:1200, attackBonus:52, defense:26, damageDie:16, speed:4, mr:10, dmgType:'physical', description:'Kalin derisi ve tas gibi kaslariyla dev bir trol.', rewards:{gold:8,food:3,wood:4} },
    { id:'yildirim-kus', name:'Yildirim Kus', tier:3, rarity:'B', hp:850, attackBonus:50, defense:20, damageDie:14, speed:18, mr:18, dmgType:'magic', description:'Kanatlarindan elektrik sacan, firtina habercisi efsanevi bir kus.', rewards:{gold:9,food:2,wood:1} },
    { id:'kan-golem', name:'Kan Golem', tier:3, rarity:'B', hp:1100, attackBonus:54, defense:24, damageDie:16, speed:9, mr:14, dmgType:'physical', description:'Pıhtılasmis kandan olusmus, her vurusunda buyuyen urpertici bir golem.', rewards:{gold:10,food:0,wood:2} },
    { id:'kultur-buyucusu', name:'Kultur Buyucusu', tier:3, rarity:'B', hp:800, attackBonus:58, defense:18, damageDie:12, speed:13, mr:26, dmgType:'magic', description:'Unutulmus kulturlere tapan, kara enerjiyle oluleri dirilten bir buyucu.', rewards:{gold:12,food:0,wood:0} },

    // ===== A SEViYE (Epic - Gün 10-35) XP: 800-1400 =====
    { id:'karabasan', name:'Karabasan', tier:3, rarity:'A', hp:1100, attackBonus:68, defense:24, damageDie:16, speed:16, mr:16, dmgType:'physical', description:'Golgelerden suzulup ruyalara sizan, zihni parcalayan kadim bir varlik.', rewards:{gold:6,food:0,wood:2} },
    { id:'tas-golem', name:'Tas Golem', tier:3, rarity:'A', hp:1600, attackBonus:60, defense:30, damageDie:18, speed:5, mr:6, dmgType:'physical', description:'Uzerinde unutulmus runler kazili, her adimi yeri titreten granit bir dev.', rewards:{gold:9,food:0,wood:3} },
    { id:'buyucu-kultist', name:'Buyucu Kultist', tier:3, rarity:'A', hp:1000, attackBonus:64, defense:22, damageDie:14, speed:14, mr:14, dmgType:'physical', description:'Kara buyuyle gozleri bosluga donmus, fisildadigi her sozcukle gercekligi buken bir tarikat uyesi.', rewards:{gold:11,food:0,wood:0} },
    { id:'ejderha-yavrusu', name:'Ejderha Yavrusu', tier:4, rarity:'S', hp:2000, attackBonus:90, defense:30, damageDie:20, speed:13, mr:16, dmgType:'physical', description:'Henüz tam buyumemis ama pullari celigi kesen, nefesi kavuran genc bir ejderha.', rewards:{gold:14,food:4,wood:2} },
    { id:'donmus-dev', name:'Donmus Dev', tier:4, rarity:'A', hp:1800, attackBonus:75, defense:26, damageDie:18, speed:6, mr:20, dmgType:'magic', description:'Buzla kapli, nefesi donduran kadim bir dev.', rewards:{gold:13,food:5,wood:3} },
    { id:'ruh-hirsizi', name:'Ruh Hirsizi', tier:4, rarity:'A', hp:1300, attackBonus:78, defense:22, damageDie:16, speed:17, mr:22, dmgType:'magic', description:'Gozlerinin icine baktigi kisinin ruhunu calmaya calisan sinsi bir iblis.', rewards:{gold:15,food:0,wood:0} },
    { id:'demir-zirhli', name:'Demir Zirhli', tier:4, rarity:'A', hp:2000, attackBonus:70, defense:34, damageDie:16, speed:8, mr:12, dmgType:'physical', description:'Tepeden tirnaga demir kapli, kara lordun ordusundan bir savasci.', rewards:{gold:12,food:0,wood:5} },

    // ===== S SEViYE (Legendary - Gün 15+) XP: 1200-2200 =====
    { id:'olum-sovalyesi', name:'Olum Sovalyesi', tier:4, rarity:'S', hp:2200, attackBonus:95, defense:30, damageDie:20, speed:10, mr:12, dmgType:'physical', description:'Zirhi ruhlarla kapli, kara kiliciyla dokundugu her cani sonduren lanetli bir sovalyeee.', rewards:{gold:12,food:0,wood:5} },
    { id:'kadim-hortlak', name:'Kadim Hortlak', tier:4, rarity:'S', hp:1800, attackBonus:105, defense:26, damageDie:18, speed:15, mr:16, dmgType:'physical', description:'Yuzyillardir olumden kacan, bukulmus parmaklarindan kara enerji fiskiran bir buyucu lordu.', rewards:{gold:16,food:0,wood:3} },
    { id:'kaos-sovalyesi', name:'Kaos Sovalyesi', tier:4, rarity:'S', hp:2100, attackBonus:90, defense:28, damageDie:20, speed:11, mr:24, dmgType:'magic', description:'Kara buyuyle guclendirilmis, gozleri alev sacan lanetli bir sovalyeee.', rewards:{gold:15,food:0,wood:5} },
    { id:'ates-ejderi', name:'Ates Ejderi', tier:4, rarity:'S', hp:2600, attackBonus:110, defense:30, damageDie:22, speed:14, mr:20, dmgType:'magic', description:'Pullari alev alev yanan, nefesiyle daglari eriten yetiskin bir ejder.', rewards:{gold:20,food:6,wood:4} },
    { id:'olaganustu-varlik', name:'Olaganustu Varlik', tier:4, rarity:'S', hp:1900, attackBonus:115, defense:24, damageDie:20, speed:19, mr:26, dmgType:'magic', description:'Bu dunyaya ait olmayan, gercekligi buken bir baska boyut yaratigi.', rewards:{gold:18,food:0,wood:0} },

    // ===== SS SEViYE (Mythic - Gün 20+, cok nadir) XP: 2000-4000 =====
    { id:'karanlik-lordu', name:'Karanlik Lordu', tier:4, rarity:'SS', hp:3500, attackBonus:130, defense:34, damageDie:24, speed:15, mr:28, dmgType:'magic', description:'Zeytinin sag kolu, karanligin ta kendisinden dogmus olumsuz bir komutan.', rewards:{gold:30,food:0,wood:8} },
    { id:'antik-iblis', name:'Antik Iblis', tier:4, rarity:'SS', hp:4200, attackBonus:125, defense:32, damageDie:22, speed:13, mr:24, dmgType:'physical', description:'Bin yildir uyuyan, simdi uyanmis dev bir iblis. Gozleri korku sacar.', rewards:{gold:25,food:0,wood:6} },
    { id:'buz-anasi', name:'Buz Anasi', tier:4, rarity:'SS', hp:3200, attackBonus:120, defense:28, damageDie:22, speed:17, mr:30, dmgType:'magic', description:'Kuzeyin en derin magarasindan gelen, dokundugu her seyi donduran kadim bir ruh.', rewards:{gold:28,food:4,wood:4} },
    { id:'yildiz-canavari', name:'Yildiz Canavari', tier:4, rarity:'SS', hp:3800, attackBonus:140, defense:36, damageDie:24, speed:11, mr:22, dmgType:'magic', description:'Yildizlardan dusmus, kozmik enerjiyle beslenen sekilsiz bir dehset.', rewards:{gold:35,food:0,wood:10} },
    { id:'olum-melegi', name:'Olum Melegi', tier:4, rarity:'SS', hp:3600, attackBonus:145, defense:28, damageDie:26, speed:16, mr:32, dmgType:'magic', description:'Kanatlari golge, kilici kiyamet. Karsisinda duran herkesin sonu olur.', rewards:{gold:40,food:0,wood:0} },
];

// ===== CANAVAR SKILL'LERI =====
const MONSTER_SKILLS = {};

function addMS(monsterId, skillName, type, dmg, manaCost, desc) {
    if (!MONSTER_SKILLS[monsterId]) MONSTER_SKILLS[monsterId] = [];
    MONSTER_SKILLS[monsterId].push({ name: skillName, type: type, baseDmg: dmg, manaCost: manaCost || 0, description: desc });
}

// --- Tier 1-2 Monster Skills ---
addMS('kurt','Vahsi Isirik','physical',22,0,'Keskin disleriyle saldirir.');
addMS('kurt','Uluma','buff',0,1,'Ulur, kendini guclendirir +2 ATK.');
addMS('zehirli-orumcek','Zehirli Isırık','physical',20,0,'Zehirli disleriyle isirir.');
addMS('zehirli-orumcek','Ag Puskurtme','debuff',0,1,'Ag firlatir, rakibi yavaslatir.');
addMS('kemirgen-surusu','Suru Saldirisi','physical',18,0,'Yuzlerce fare ayni anda saldirir.');
addMS('zombi','Curumus Isirik','physical',20,0,'Curumus disleriyle isirir.');
addMS('zombi','Olu Direnci','buff',0,1,'Olumsuz gucuyle canlanir, +10% HP.');
addMS('zehirli-solucan','Asit Tukurugu','magic',22,1,'Asitli salyasini firlatir.');
addMS('hayalet','Ruhani Dokunus','magic',25,1,'Duvarlardan gecip ruhani hasar verir.');
addMS('dev-sivrisinek','Kan Emme','physical',18,0,'Kan emer, canini yeniler.');
addMS('balcik-adam','Camur Savurma','physical',16,0,'Camur parcasi firlatir.');
addMS('et-yiyen-bitki','Sarmasik Darbesi','physical',24,0,'Dikenli sarmasiklariyla vurur.');
addMS('et-yiyen-bitki','Tuzak Kok','physical',28,1,'Yerden kok cikararak saldirir.');
addMS('harpi','Pence Darbesi','physical',26,0,'Keskin penceleriyle saldirir.');
addMS('harpi','Saldiri Cigligi','magic',30,1,'Saldiri cigligi atar, alan hasari.');
addMS('tas-adam','Kaya Yumrugu','physical',28,0,'Tas yumruguyla vurur.');
addMS('ates-yaratik','Alev Topu','magic',30,1,'Kucuk bir alev topu firlatir.');

// --- Tier 2-3 Monster Skills ---
addMS('golge-yaratik','Golge Pencesi','physical',50,0,'Karanlik pencesiyle saldirir.');
addMS('golge-yaratik','Karanlik Nefes','magic',65,1,'Karanlik enerji ufler.');
addMS('golge-yaratik','Golgeye Gomul','buff',0,1,'1 tur gorunmez olur.');
addMS('golge-yaratik','Ruh Emici','magic',55,1,'Ruh enerjisini ceker, iyilesir.');
addMS('iskelet-savasci','Kemik Firlatma','physical',40,0,'Kemik parcalari firlatir.');
addMS('iskelet-savasci','Pasli Kilic','physical',55,0,'Pasli kiliciyla savurur.');
addMS('iskelet-savasci','Olum Cigligi','magic',50,1,'Ruh parcalayan bir ciglik atar.');
addMS('iskelet-savasci','Kemik Zirh','buff',0,1,'Kemikleriyle kendini guclendirir, +3 DEF.');
addMS('dev-orumcek','Ag Puskurtme','physical',45,1,'Yapiskan ag firlatir.');
addMS('dev-orumcek','Zehirli Isirik','physical',50,0,'Zehirli disleriyle isirir.');
addMS('zincirli-ruh','Ruh Zinciri','magic',55,1,'Zincirlerini savurur, ruh hasari.');
addMS('zincirli-ruh','Dondurucu Inilti','magic',50,1,'Iniltisiyle kan dondurur.');
addMS('curumus-dev','Ezici Darbe','physical',65,0,'Dev yumruguyla ezer.');
addMS('curumus-dev','Kokmus Nefes','magic',55,1,'Zehirli nefesini ufler.');
addMS('alev-iblisi','Alev Topu','magic',75,1,'Dev bir alev topu firlatir.');
addMS('alev-iblisi','Cehennem Nefesi','magic',90,2,'Alev puskurtur, alan hasari.');
addMS('alev-iblisi','Kizgin Pence','physical',60,0,'Alev almis pencesiyle vurur.');
addMS('su-iblisi','Su Kirbaci','magic',65,1,'Su dalgasiyla vurur.');
addMS('su-iblisi','Bogulma','magic',80,2,'Suyu akcigerlere doldurur.');
addMS('gargoyle','Tas Kanat','physical',55,0,'Kanadiyla vurur.');
addMS('gargoyle','Tas Kesit','physical',65,1,'Keskin tas parcalari firlatir.');
addMS('zirhli-trol','Dev Yumruk','physical',70,0,'Dev yumruguyla ezer.');
addMS('zirhli-trol','Trol Kukremesi','physical',55,0,'Kukrer, alan hasari.');
addMS('zirhli-trol','Deri Sertlestirme','buff',0,1,'Derisi tas gibi olur, +5 DEF.');
addMS('yildirim-kus','Yildirim Darbesi','magic',65,1,'Elektrik yuklu saldiri.');
addMS('yildirim-kus','Firtina Kanadi','physical',60,0,'Kanadiyla firtina yaratir.');
addMS('kan-golem','Kan Emme','magic',65,1,'Kanini emer, canini yeniler.');
addMS('kan-golem','Pıhtı Patlamasi','physical',70,2,'Kan pıhtısını patlatır.');
addMS('kultur-buyucusu','Oluleri Dirilt','magic',60,1,'Oluleri cagirir, saldiri yapar.');
addMS('kultur-buyucusu','Kara Ayin','magic',80,3,'Kara ayinla yuksek hasar verir.');

// --- Tier 3-4 Monster Skills ---
addMS('karabasan','Kabus Dalgasi','magic',80,2,'Zihin parcalayan kabus dalgasi.');
addMS('karabasan','Ruh Iskence','magic',70,1,'Ruhuna iskence eder.');
addMS('tas-golem','Deprem Darbesi','physical',85,2,'Yeri sarsan dev bir yumruk.');
addMS('tas-golem','Kaya Yagmuru','physical',75,1,'Tas parcaciklari yagdirir.');
addMS('buyucu-kultist','Kara Buyu Oku','magic',65,1,'Kara buyu oku firlatir.');
addMS('buyucu-kultist','Lânet Yagmuru','magic',80,2,'Lanetli yagmur yagdirir.');
addMS('buyucu-kultist','Zihin Kontrolu','debuff',0,2,'1 tur oyuncuyu saskina cevirir.');
addMS('buyucu-kultist','Kan Ritueli','magic',95,3,'Kendi kaniyla buyu yapar.');
addMS('ejderha-yavrusu','Ejderha Atesi','magic',90,2,'Agzindan alev puskurtur.');
addMS('ejderha-yavrusu','Kuyruk Savurma','physical',70,0,'Kuyruguyla savurur.');
addMS('ejderha-yavrusu','Pence Darbesi','physical',75,0,'Keskin pencesiyle saldirir.');
addMS('donmus-dev','Buz Mizragi','magic',80,2,'Keskin buz parcasi firlatir.');
addMS('donmus-dev','Dondurucu Nefes','magic',85,2,'Nefesiyle dondurur.');
addMS('ruh-hirsizi','Ruh Emme','magic',78,2,'Ruhu cekip hasar verir.');
addMS('ruh-hirsizi','Golge Iskence','magic',85,2,'Golgeyle iskence eder.');
addMS('demir-zirhli','Kalkan Darbesi','physical',65,0,'Kalkaniyla sert vurur.');
addMS('demir-zirhli','Agir Kilic','physical',80,1,'Agir kiliciyla tek bir darbe.');

// --- S/SS Tier Skills ---
addMS('olum-sovalyesi','Kara Kilic','physical',85,0,'Kara kiliciyla olumcul bir darbe.');
addMS('olum-sovalyesi','Olum Bakisi','magic',75,1,'Gozleriyle olum enerjisi yollar.');
addMS('olum-sovalyesi','Ruh Toplama','magic',70,1,'Ruhlari toplar, iyilesir.');
addMS('olum-sovalyesi','Kiyamet Kilici','physical',130,3,'Tum gucuyle son bir darbe.');
addMS('kadim-hortlak','Olum Isareti','magic',90,2,'Parmagindan kara enerji fiskirtir.');
addMS('kadim-hortlak','Lanet Solugu','magic',105,2,'Lanetli nefesini ufler.');
addMS('kaos-sovalyesi','Kaos Kilici','magic',90,2,'Kaos enerjisiyle dolu kiliç.');
addMS('kaos-sovalyesi','Kara Patlama','magic',105,3,'Kara enerji patlamasi.');
addMS('ates-ejderi','Ejder Kukremesi','magic',110,2,'Kukrer, alan hasari.');
addMS('ates-ejderi','Cehennem Atesi','magic',140,3,'Her seyi yakan alev dalgasi.');
addMS('olaganustu-varlik','Boyut Darbesi','magic',105,2,'Baska boyuttan enerji getirir.');
addMS('olaganustu-varlik','Gerceklik Bükme','magic',130,3,'Gercekligi buker, ezici hasar.');
addMS('karanlik-lordu','Karanlik Patlamasi','magic',120,2,'Saf karanlik enerjisi patlamasi.');
addMS('karanlik-lordu','Olumcul Emir','magic',150,3,'Tek kelimeyle agir hasar verir.');
addMS('antik-iblis','Cehennem Darbesi','physical',110,2,'Dev pençesiyle yeri yarar.');
addMS('antik-iblis','Iblis Atesi','magic',130,3,'Agzindan cehennem atesi puskurtur.');
addMS('buz-anasi','Buz Firtinasi','magic',105,2,'Dondurucu ruzgar estirir.');
addMS('buz-anasi','Sonsuz Kis','magic',140,3,'Her seyi donduran kadim buyu.');
addMS('yildiz-canavari','Kozmik Isin','magic',130,3,'Yildizlardan enerji ceker.');
addMS('yildiz-canavari','Meteor Yagmuru','physical',120,2,'Gokyuzunden meteor yagdirir.');
addMS('olum-melegi','Kiyamet Kilici','physical',140,3,'Tek vurusla ruhu bedenden ayirir.');
addMS('olum-melegi','Olum Kanadi','magic',120,2,'Kanatlarindan olum enerjisi sacar.');

console.log('Canavar verileri: ' + MONSTERS.length + ' canavar (' +
    MONSTERS.filter(function(m){return m.rarity==='D'}).length + 'D ' +
    MONSTERS.filter(function(m){return m.rarity==='C'}).length + 'C ' +
    MONSTERS.filter(function(m){return m.rarity==='B'}).length + 'B ' +
    MONSTERS.filter(function(m){return m.rarity==='A'}).length + 'A ' +
    MONSTERS.filter(function(m){return m.rarity==='S'}).length + 'S ' +
    MONSTERS.filter(function(m){return m.rarity==='SS'}).length + 'SS), skill: ' + Object.keys(MONSTER_SKILLS).length + ' tur');

// ===== YARDIMCI FONKSİYONLAR =====

function getTierForDay(day) {
    if (day <= 10) return 1;
    if (day <= 20) return 2;
    if (day <= 30) return 3;
    return 4;
}

function getMonsterSkill(monsterId) {
    var skills = MONSTER_SKILLS[monsterId];
    if (!skills || skills.length === 0) return null;
    return skills[Math.floor(Math.random() * skills.length)];
}

// Gun bazli rastgele canavar (nadirlik sistemiyle)
function getRandomMonster(day) {
    // Gune gore acik nadirlikleri belirle
    var unlockedRarities = ['D'];
    if (day >= 1) unlockedRarities.push('C');
    if (day >= 5) unlockedRarities.push('B');
    if (day >= 10) unlockedRarities.push('A');
    if (day >= 15) unlockedRarities.push('S');
    if (day >= 20) unlockedRarities.push('SS');

    // Nadirlik agirliklari (toplam 100)
    // Dusuk nadirlik hep daha yuksek sansli, gun ilerledikce yukseklerin sansi artar
    var weights = {};
    if (day >= 20) {
        weights = { D:30, C:25, B:20, A:12, S:8, SS:5 };
    } else if (day >= 15) {
        weights = { D:35, C:28, B:20, A:12, S:5 };
    } else if (day >= 10) {
        weights = { D:40, C:28, B:20, A:12 };
    } else if (day >= 5) {
        weights = { D:45, C:30, B:25 };
    } else {
        weights = { D:55, C:45 };
    }

    // Acik nadirliklerle agirliklari filtrele
    var roll = Math.random() * 100;
    var cumulative = 0;
    var chosenRarity = 'D';
    var rarityOrder = ['SS','S','A','B','C','D'];
    for (var i = 0; i < rarityOrder.length; i++) {
        var r = rarityOrder[i];
        if (unlockedRarities.indexOf(r) < 0) continue;
        cumulative += weights[r] || 10;
        if (roll < cumulative) { chosenRarity = r; break; }
    }

    var pool = MONSTERS.filter(function(m) { return unlockedRarities.indexOf(m.rarity) >= 0 && m.rarity === chosenRarity; });
    if (pool.length === 0) pool = MONSTERS.filter(function(m) { return unlockedRarities.indexOf(m.rarity) >= 0; });
    if (pool.length === 0) pool = MONSTERS;

    var chosen = pool[Math.floor(Math.random() * pool.length)];
    var copy = JSON.parse(JSON.stringify(chosen));

    // Milestone gunlerinde (5,10,15,20,25,30) bir ust nadirlik garanti
    var milestoneDays = [5,10,15,20,25,30];
    if (milestoneDays.indexOf(day) >= 0 && Math.random() < 0.35) {
        var idx = unlockedRarities.indexOf(chosenRarity);
        if (idx < unlockedRarities.length - 1) {
            var higherRarity = unlockedRarities[idx + 1];
            var rarePool = MONSTERS.filter(function(m) { return m.rarity === higherRarity; });
            if (rarePool.length > 0) {
                copy = JSON.parse(JSON.stringify(rarePool[Math.floor(Math.random() * rarePool.length)]));
            }
        }
    }

    return copy;
}

function getMonsterById(id) {
    return MONSTERS.find(function(m) { return m.id === id; }) || null;
}

function getMonsterPortrait(monsterId) {
    if (!CONFIG || !CONFIG.monsterPortraits) return '';
    return CONFIG.monsterPortraits[monsterId] || '';
}
