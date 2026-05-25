/* ===== BIBIGAME - Skill Verileri (145 skill) ===== */
// type: physical | magic | heal | buff | debuff | utility
// scaleStat: atk | mag | hp | spd | def
// target: enemy | self | ally | all_enemies | all_allies

const SKILLS = [];

function S(id, name, type, scaleStat, scaleFactor, baseEffect, manaCost, cooldown, target, desc, rarity, charId) {
    SKILLS.push({ id, name, type, scaleStat, scaleFactor, baseEffect, manaCost, cooldown, target, description: desc, rarity: rarity || 'common', characterId: charId || null });
}

// ===== KARAKTER ÖZEL SKILL'LER (45) =====

// --- Gökdeniz (Savaşçı) ---
S('gok_01','Öfke Darbesi','physical','atk',2.5,0,0,2,'enemy','ATK × 2.5 fiziksel hasar.','character','gokdeniz');
S('gok_02','Korkusuz Saldırı','physical','atk',3.0,0,1,3,'enemy','ATK × 3 hasar, kendine %10 hasar.','character','gokdeniz');
S('gok_03','Savaş Çığlığı','buff','atk',0.0,3,1,3,'self','2 tur +3 ATK.','character','gokdeniz');
S('gok_04','Son Nefes','physical','atk',4.0,0,1,4,'enemy','HP<%30 ise ATK×4 hasar.','character','gokdeniz');
S('gok_05','Demir Kalkan','buff','def',0.0,50,1,3,'self','1 tur %50 hasar azaltma.','character','gokdeniz');

// --- İrem (Şifacı) ---
S('ire_01','Süt Büyüsü','heal','mag',2.5,0,2,2,'ally','MAG×2.5 iyileştirme.', 'character','irem');
S('ire_02','İnek Kalkanı','buff','def',0.0,100,3,3,'ally','2 tur tüm hasarı engeller.', 'character','irem');
S('ire_03','Otlak Bereketi','heal','mag',1.0,0,4,4,'all_allies','Tüm takıma MAG×1 iyileştirme.', 'character','irem');
S('ire_04','Süt Dalgası','magic','mag',1.8,0,3,2,'all_enemies','MAG×1.8 büyü hasarı (tüm düşmanlara).', 'character','irem');
S('ire_05','Sürü Dayanışması','buff','def',0.0,2,2,3,'all_allies','3 tur takım +2 DEF.', 'character','irem');

// --- Noyan (Su Büyücüsü) ---
S('noy_01','Su Kırbacı','magic','mag',2.0,0,2,1,'enemy','MAG×2 hasar + 1 tur yavaşlatma.', 'character','noyan');
S('noy_02','Deniz Kalkanı','buff','def',0.0,30,2,2,'self','2 tur %30 hasar azaltma.', 'character','noyan');
S('noy_03','Gelgit Dalgası','magic','mag',1.5,0,4,3,'all_enemies','Tüm düşmanlara MAG×1.5 hasar.', 'character','noyan');
S('noy_04','Fırtına Çağrısı','debuff','mag',0.0,3,3,3,'all_enemies','2 tur düşman -3 DEF.', 'character','noyan');
S('noy_05','Okyanusun Gazabı','magic','mag',3.5,0,5,4,'enemy','MAG×3.5 dev hasar.', 'character','noyan');

// --- Begül (Rün Okuyucu) ---
S('beg_01','Antik Rün','buff','mag',0.0,0,2,2,'self','Rastgele +ATK/+DEF/+SPD buff.', 'character','begul');
S('beg_02','Boyut Kapısı','utility','mag',0.0,0,3,4,'self','1 tur dokunulmazlık.', 'character','begul');
S('beg_03','Rün Patlaması','magic','mag',2.5,0,2,2,'enemy','MAG×2.5 rün hasarı.', 'character','begul');
S('beg_04','Bilgi Parşömeni','debuff','mag',0.0,50,2,3,'enemy','2 tur düşmana +%50 hasar.', 'character','begul');
S('beg_05','Kadim Mühür','debuff','mag',0.0,0,4,4,'enemy','2 tur düşman skill kullanamaz.', 'character','begul');

// --- Bedrican (Tank) ---
S('bed_01','Taş Kalkan','buff','def',0.0,5,0,3,'self','3 tur +5 DEF.', 'character','bedrican');
S('bed_02','Golem Darbesi','physical','atk',2.0,0,1,3,'enemy','ATK×2 hasar + 1 tur stun.', 'character','bedrican');
S('bed_03','Toprak Sarsıntısı','physical','atk',1.0,0,1,4,'all_enemies','ATK×1 + yavaşlatma.', 'character','bedrican');
S('bed_04','Dayanıklı Yapı','heal','hp',0.1,0,1,5,'self','3 tur HP/10 yenileme.', 'character','bedrican');
S('bed_05','Matematik Kitabı','physical','atk',3.5,0,1,3,'enemy','HP<%40 ise ATK×3.5 hasar.', 'character','bedrican');

// --- Cansın (Terbiyeci) ---
S('can_01','Vahşi Çağrı','utility','mag',0.0,0,3,3,'self','Kurt çağır, 2 tur yardımcı hasar.', 'character','cansin');
S('can_02','Doğa Uyumu','heal','mag',1.5,0,1,1,'self','MAG×1.5 iyileştirme.', 'character','cansin');
S('can_03','Pençe Darbesi','physical','atk',2.0,0,1,2,'enemy','ATK×2 fiziksel hasar.', 'character','cansin');
S('can_04','Sürü Emri','physical','atk',2.0,0,2,3,'enemy','Kurt 2× hasar vurur.', 'character','cansin');
S('can_05','Vahşi Bağ','buff','hp',0.3,0,2,3,'self','2 tur hasarın %30 unu kurda yönlendir.', 'character','cansin');

// --- Gunda (Toprak Büyücüsü) ---
S('gun_01','Taş Yağmuru','magic','mag',1.5,0,3,2,'all_enemies','Tüm düşmanlara MAG×1.5 hasar.', 'character','gunda');
S('gun_02','Toprak Duvar','buff','def',0.0,4,2,3,'self','2 tur +4 DEF.', 'character','gunda');
S('gun_03','Deprem Dalgası','magic','mag',3.0,0,3,3,'enemy','MAG×3 tek hedef hasar.', 'character','gunda');
S('gun_04','Kum Fırtınası','debuff','mag',0.0,4,3,3,'all_enemies','2 tur düşman -4 ATK.', 'character','gunda');
S('gun_05','Bereketli Toprak','heal','mag',2.0,0,4,4,'self','MAG×2 iyileştirme + 2 tur HP yenileme.', 'character','gunda');

// --- Dominic (Dengeli) ---
S('dom_01','Aile Gücü','physical','atk',2.0,0,1,2,'enemy','ATK×2 + takım başı +%10.', 'character','dominic');
S('dom_02','Sürücü Refleksi','physical','atk',1.5,0,1,3,'enemy','1 tur hasar alma + counter.', 'character','dominic');
S('dom_03','Motivasyon','buff','atk',0.0,2,2,3,'all_allies','2 tur takım +2 ATK.', 'character','dominic');
S('dom_04','Garaj Ustası','magic','mag',1.5,0,2,2,'enemy','MAG×1.5 + 2 tur -2 DEF.', 'character','dominic');
S('dom_05','Son Sürat','physical','atk',3.0,0,1,4,'enemy','ATK×3, ertesi tur -5 DEF.', 'character','dominic');

// --- Emin (İksirci) ---
S('emi_01','Şifa İksiri','heal','mag',2.5,0,2,2,'ally','MAG×2.5 iyileştirme.','character','emir');
S('emi_02','Güç İksiri','buff','atk',0.0,3,2,3,'ally','2 tur +3 ATK.','character','emir');
S('emi_03','Zırh İksiri','buff','def',0.0,3,2,3,'ally','2 tur +3 DEF.','character','emir');
S('emi_04','Patlayıcı İksir','magic','mag',2.5,0,3,2,'enemy','MAG×2.5 hasar.','character','emir');
S('emi_05','Duman İksiri','debuff','mag',0.0,0,3,3,'enemy','2 tur düşman %50 ıskalar.','character','emir');

// --- Zeynep (Kırık Şövalye) ---
S('zey_01','Zırh Delme','physical','atk',2.0,0,1,2,'enemy','DEFin %50sini yok sayar, ATK×2.','character','zeynep');
S('zey_02','Kırık Kılıç','physical','atk',2.5,0,1,3,'enemy','ATK×2.5, kendine %5 hasar.','character','zeynep');
S('zey_03','Şövalye Yemini','buff','def',0.0,5,2,3,'self','3 tur +5 DEF.','character','zeynep');
S('zey_04','Kraliyet Darbesi','physical','atk',3.0,0,2,3,'enemy','ATK×3 hasar.','character','zeynep');
S('zey_05','Son Kale','buff','def',0.0,100,3,5,'self','HP<%30 ise 2 tur dokunulmazlık.','character','zeynep');

// --- Emir (Avcı) ---
S('emi_01','Babanne Bastonu','physical','atk',2.5,0,0,2,'enemy','ATK×2.5, babaannenin bastonunu fırlatır.','character','emin');
S('emi_02','Babanne Ruhu','magic','mag',5.5,0,2,1,'all_enemies','MAG×4.5, babaannenin ruhu herkese saldırır ve hatrı sayılır bir hasar verir.','character','emin');
S('emi_03','Avcı Oku','physical','atk',2.0,0,0,1,'enemy','ATK×2 menzilli hasar.','character','emin');
S('emi_04','Kapan','physical','atk',3.0,0,0,1,'enemy','ATK×3 tuzak hasarı.','character','emin');
S('emi_05','Tuvalet Korkusu','buff','atk',0.0,20,0,3,'self','babannesi onu heyecanlandırarak güclendirir','character','emin');

// --- Bora (Müzisyen) ---
S('bor_01','Melodi','magic','mag',2.0,0,2,1,'enemy','MAG×2 büyü hasarı.','character','bora');
S('bor_02','Bas Düşüşü','magic','mag',2.5,0,3,3,'all_enemies','MAG×2.5 alan hasarı.','character','bora');
S('bor_03','Ritmik Vuruş','physical','atk',1.5,0,0,1,'enemy','ATK×1.5 fiziksel.','character','bora');
S('bor_04','İlham Verici Şarkı','buff','atk',0.0,3,2,3,'all_allies','2 tur takım +3 ATK.','character','bora');
S('bor_05','Susturucu Nota','debuff','mag',0.0,0,2,3,'enemy','1 tur sessizlik.','character','bora');

// --- Bülent (Feniks) ---
S('bul_01','Sahne Işığı','debuff','mag',0.0,0,2,3,'enemy','1 tur düşman %50 ıskalar.', 'character','bulent');
S('bul_02','Diva Vedası','physical','atk',2.5,0,1,2,'enemy','ATK×2.5, kendine %20 hasar.', 'character','bulent');
S('bul_03','Feniks Alevi','magic','mag',2.0,0,3,3,'enemy','MAG×2 + 2 tur yanma.', 'character','bulent');
S('bul_04','Dramatik Final','physical','atk',5.0,0,0,5,'enemy','HP<%20 ise ATK×5 hasar.', 'character','bulent');
S('bul_05','Reenkarnasyon','utility','hp',0.0,0,4,5,'self','1 tur ölümsüzlük (HP 0 a düşmez).', 'character','bulent');

// --- Furkan (Suikastçı) ---
S('fur_01','Gölge Hançeri','physical','atk',2.5,0,0,2,'enemy','ATK×2.5, SPD düşmandan yüksekse 2×.', 'character','furkan');
S('fur_02','Zehir Ucu','physical','atk',2.0,0,1,2,'enemy','ATK×2 + 3 tur zehir (ATK×0.2/tur).', 'character','furkan');
S('fur_03','Sis Perdesi','utility','spd',0.0,0,2,3,'self','1 tur görünmezlik, sonraki saldırı 2× hasar.', 'character','furkan');
S('fur_04','Sessiz Suikast','physical','atk',4.0,0,2,5,'enemy','ATK×4 tek hedef. CD:5.', 'character','furkan');
S('fur_05','Kan Emici','physical','atk',2.5,0,1,3,'enemy','ATK×2.5, hasarın %25i kadar iyileş.', 'character','furkan');

// ===== 100 GENEL SKILL =====

// --- 25 Fiziksel (ATK scale, mana harcamaz) ---
[['Ağır Darbe','physical','atk',2.0,0,0,2,'enemy','ATK×2 hasar.','common',null],
['Kılıç Darbesi','physical','atk',1.8,5,0,1,'enemy','ATK×1.8 + 5 hasar.','common',null],
['Çifte Vuruş','physical','atk',1.3,0,0,1,'enemy','ATK×1.3, iki kere vurur.','common',null],
['Boyun Kesme','physical','atk',2.2,0,0,2,'enemy','ATK×2.2 hedefli vuruş.','common',null],
['Yumruk Yağmuru','physical','atk',1.0,0,0,2,'enemy','ATK×1 hızlı saldırı.','common',null],
['Zırh Kırıcı','physical','atk',1.5,0,0,2,'enemy','ATK×1.5 + 2 tur -2 DEF.','rare',null],
['Savaş Narası','physical','atk',0.8,0,0,1,'all_enemies','ATK×0.8 tüm düşmanlara.','rare',null],
['Ölümcül Darbe','physical','atk',2.8,0,0,3,'enemy','ATK×2.8 ağır hasar.','rare',null],
['Yıldırım Vuruşu','physical','spd',2.0,0,0,2,'enemy','SPD×2 hızlı saldırı.','rare',null],
['Kanlı Bıçak','physical','atk',2.5,0,0,2,'enemy','ATK×2.5, kendine %5 hasar.','rare',null],
['Bıçak Fırtınası','physical','atk',1.5,0,0,3,'all_enemies','ATK×1.5 tüm düşmanlara.','epic',null],
['Cellat Darbesi','physical','atk',3.5,0,0,4,'enemy','ATK×3.5 dev hasar.','epic',null],
['Uçan Tekme','physical','spd',2.5,0,0,2,'enemy','SPD×2.5 + olası stun.','epic',null],
['Yarık Açma','physical','atk',2.0,10,0,3,'enemy','ATK×2 + 10, 3 tur kanama.','epic',null],
['Zayıf Nokta','physical','atk',1.0,0,0,1,'enemy','ATK×1, sonraki saldırı +%50.','rare',null],
['Kalkan Tokadı','physical','def',1.5,0,0,2,'enemy','DEF×1.5 hasar + stun.','common',null],
['Hiddet Patlaması','physical','atk',1.0,0,0,3,'all_enemies','HP<%30 ise ATK×3 tüm düşmanlara.','epic',null],
['Sopalı Saldırı','physical','atk',1.5,5,0,1,'enemy','ATK×1.5 + 5 sopa.','common',null],
['Ok Atışı','physical','atk',1.8,0,0,1,'enemy','ATK×1.8 menzilli.','common',null],
['Kement Atma','physical','spd',1.0,0,0,2,'enemy','SPD×1 + 1 tur bağlama.','rare',null],
['Baltalı Saldırı','physical','atk',2.2,0,0,2,'enemy','ATK×2.2 balta.','common',null],
['Dikenli Kırbaç','physical','atk',2.0,0,0,2,'enemy','ATK×2 + kanama.','rare',null],
['Mızrak Savurma','physical','atk',1.6,0,0,2,'enemy','ATK×1.6 mızrakla.','common',null],
['Taş Atma','physical','atk',0.8,0,0,1,'enemy','ATK×0.8 basit saldırı.','common',null],
['Yumruk Zinciri','physical','atk',0.6,0,0,1,'enemy','ATK×0.6 3 kere ard arda.','rare',null]
].forEach(s => S('phy_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],s[10]));

// --- 25 Büyü (MAG scale, mana harcar) ---
[['Ateş Topu','magic','mag',2.0,0,2,2,'enemy','Ateş büyüsü: MAG×2.','common'],
['Buz Mızrağı','magic','mag',2.2,0,2,2,'enemy','Buz hasarı: MAG×2.2.','common'],
['Yıldırım Çağrısı','magic','mag',2.5,0,3,3,'enemy','Yıldırım: MAG×2.5.','rare'],
['Rüzgar Kesiği','magic','mag',1.5,0,1,1,'enemy','Rüzgar: MAG×1.5 hızlı.','common'],
['Gölge Oku','magic','mag',2.0,5,2,2,'enemy','Karanlık: MAG×2 + 5.','common'],
['Alev Duvarı','magic','mag',1.5,0,3,2,'all_enemies','Alev duvarı: MAG×1.5 tümüne.','rare'],
['Buz Fırtınası','magic','mag',1.8,0,4,3,'all_enemies','Buz fırtınası: MAG×1.8 tümüne.','epic'],
['Zihin Patlaması','magic','mag',3.0,0,4,3,'enemy','Psişik: MAG×3.','epic'],
['Enerji Küresi','magic','mag',1.8,0,1,1,'enemy','Saf enerji: MAG×1.8.','common'],
['Yer Çatlağı','magic','mag',2.0,0,3,2,'all_enemies','Yer büyüsü: MAG×2 tümüne.','rare'],
['Kan Büyüsü','magic','mag',2.5,0,2,2,'enemy','MAG×2.5, %5 HP bedel.','rare'],
['Ruh Alevi','magic','mag',2.8,0,3,3,'enemy','Ruh ateşi: MAG×2.8.','rare'],
['Kozmik Işın','magic','mag',3.5,0,5,4,'enemy','Kozmik: MAG×3.5 dev hasar.','legendary'],
['Hayalet Dokunuş','magic','mag',1.5,0,1,1,'enemy','MAG×1.5 savunmayı deler.','rare'],
['Elektrik Arkı','magic','mag',2.0,0,2,2,'enemy','Elektrik: MAG×2 + stun şansı.','common'],
['Zehir Püskürtme','magic','mag',1.5,0,2,2,'enemy','MAG×1.5 + 3 tur zehir.','common'],
['Lav Topu','magic','mag',2.8,0,4,3,'enemy','Lav: MAG×2.8 ağır hasar.','epic'],
['Sis Perdesi','debuff','mag',0.0,0,2,2,'all_enemies','2 tur düşman -%30 isabet.','common'],
['Kristal Şimşek','magic','mag',2.3,0,3,2,'enemy','Kristal: MAG×2.3.','rare'],
['Büyülü Ok','magic','mag',1.6,5,1,1,'enemy','MAG×1.6 + 5 büyülü ok.','common'],
['Ilım Dalgası','magic','mag',2.5,0,3,3,'all_enemies','MAG×2.5 tüm düşmanlara.','epic'],
['Göktaşı Çağrısı','magic','mag',4.0,0,6,5,'all_enemies','Meteor: MAG×4 tümüne.','legendary'],
['Hayalet Alev','magic','mag',2.0,10,2,2,'enemy','MAG×2 + 10 hayalet ateşi.','rare'],
['Titreyen Işık','magic','mag',1.2,0,1,0,'enemy','MAG×1.2 bedava büyü.','common'],
['Kara Delik','magic','mag',3.0,0,5,4,'all_enemies','MAG×3 tüm düşmanlara.','legendary']
].forEach(s => S('mag_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],null));

// --- 15 Şifa (MAG scale, mana harcar) ---
[['Hafif İyileştirme','heal','mag',1.5,0,1,1,'self','MAG×1.5 iyileştirme.','common'],
['Orta İyileştirme','heal','mag',2.0,0,2,2,'self','MAG×2 iyileştirme.','common'],
['Güçlü İyileştirme','heal','mag',3.0,0,3,3,'self','MAG×3 iyileştirme.','rare'],
['Toplu Şifa','heal','mag',1.5,0,3,3,'all_allies','Tüm takıma MAG×1.5 iyileştirme.','rare'],
['Yenilenme','heal','mag',0.5,0,2,3,'self','3 tur MAG×0.5 yenileme.','common'],
['Kutsal Işık','heal','mag',3.5,0,4,3,'ally','MAG×3.5 iyileştirme.','epic'],
['Doğa Şifası','heal','mag',2.0,5,2,2,'self','MAG×2 + 5 iyileştirme.','common'],
['Kan Yenileme','heal','hp',0.2,0,1,2,'self','HPnin %20si kadar iyileştirme.','rare'],
['Acil Şifa','heal','mag',1.0,0,1,1,'self','MAG×1 hızlı iyileştirme.','common'],
['Tam Şifa','heal','mag',4.0,0,5,4,'self','MAG×4 tam iyileştirme.','epic'],
['Kutsal Yağmur','heal','mag',2.0,0,4,3,'all_allies','Tüm takıma MAG×2 iyileştirme.','epic'],
['Savaş Alanı Şifası','heal','mag',1.2,0,2,2,'all_allies','Tüm takıma MAG×1.2 iyileştirme.','rare'],
['Özveri','heal','hp',0.5,0,0,3,'ally','HPnin yarısını ver, 2 katı iyileştir.','rare'],
['İksir Atma','heal','mag',1.0,10,1,1,'ally','MAG×1 + 10 iyileştirme.','common'],
['Canlandırma','heal','mag',2.5,0,4,5,'self','MAG×2.5 + tüm debuffları temizler.','legendary']
].forEach(s => S('heal_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],null));

// --- 15 Buff/Debuff ---
[['Güç Artırımı','buff','atk',0.0,3,1,3,'self','2 tur +3 ATK.','common'],
['Zırh Güçlendirme','buff','def',0.0,3,1,3,'self','2 tur +3 DEF.','common'],
['Hız Artırımı','buff','spd',0.0,3,1,3,'self','2 tur +3 SPD.','common'],
['Zayıflatma','debuff','mag',0.0,3,2,3,'enemy','2 tur -3 ATK.','common'],
['Zırh Kırma','debuff','mag',0.0,3,2,3,'enemy','2 tur -3 DEF.','common'],
['Yavaşlatma','debuff','mag',0.0,3,2,3,'enemy','2 tur -3 SPD.','common'],
['Savaş Alanı Buff','buff','atk',0.0,2,2,3,'all_allies','2 tur tüm takım +2 ATK.','rare'],
['Kör Etme','debuff','mag',0.0,0,3,3,'enemy','2 tur %50 ıskalama.','rare'],
['Sessizlik','debuff','mag',0.0,0,3,3,'enemy','2 tur büyü kullanamaz.','rare'],
['Uyku','debuff','mag',0.0,0,3,4,'enemy','2 tur stun (vurunca uyanır).','rare'],
['Kutsama','buff','mag',0.0,5,3,3,'self','3 tur +5 tüm statlar.','epic'],
['Lanet','debuff','mag',0.0,5,4,4,'enemy','3 tur -5 tüm statlar.','epic'],
['Yansıtma Kalkanı','buff','mag',0.0,0,3,4,'self','2 tur hasarın %50si yansır.','epic'],
['Öfke','buff','atk',0.0,5,2,3,'self','2 tur +5 ATK, -3 DEF.','rare'],
['Savunma Duruşu','buff','def',0.0,5,1,2,'self','2 tur +5 DEF, -2 ATK.','rare']
].forEach(s => S('buf_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],null));

// --- 10 Utility ---
[['Kaçış Planı','utility','spd',0.0,0,0,4,'self','Combat tan kaç, hasar almadan.','rare'],
['Hırsızlık','utility','spd',0.0,0,1,3,'enemy','Düşmandan altın çal.','rare'],
['Tuzak Kurma','utility','atk',1.5,0,0,3,'enemy','Tuzak: ertesi tur ATK×1.5 hasar.','common'],
['Keşif','utility','spd',0.0,0,0,2,'self','Düşmanın zayıf noktasını bul.','common'],
['İkinci Rüzgar','utility','hp',0.3,0,0,4,'self','HPnin %30u kadar iyileş.','rare'],
['Mana Çekme','utility','mag',0.5,0,0,3,'self','MAG×0.5 mana yenile.','epic'],
['Provoke','buff','def',0.0,5,0,3,'self','2 tur +5 DEF, düşman sana odaklanır.','rare'],
['Kamuflaj','utility','spd',0.0,0,1,3,'self','1 tur görünmezlik.','rare'],
['Silahsızlandırma','debuff','atk',0.0,3,0,2,'enemy','1 tur düşman silahsız.','common'],
['Savaş Çığlığı','buff','atk',0.0,5,2,4,'all_allies','2 tur tüm takım +5 ATK.','legendary']
].forEach(s => S('util_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],null));

// --- 10 Efsanevi/Nadir ---
S('leg_01','Ejderha Nefesi','magic','mag',5.0,0,7,5,'all_enemies','Ejderha ateşi: MAG×5 tüm düşmanlara.', 'legendary',null);
S('leg_02','Kıyamet Kılıcı','physical','atk',5.0,0,0,5,'enemy','ATK×5 dev fiziksel hasar.', 'legendary',null);
S('leg_03','Ölüm Dansı','physical','atk',2.5,0,0,2,'all_enemies','ATK×2.5 tüm düşmanlara 2 kere.', 'legendary',null);
S('leg_04','Melek Dokunuşu','heal','mag',5.0,0,5,3,'all_allies','MAG×5 tüm takıma iyileştirme.', 'legendary',null);
S('leg_05','Zaman Durdurma','utility','mag',0.0,0,6,6,'all_enemies','2 tur düşmanlar donar.', 'legendary',null);
S('leg_06','Ruh Emici','magic','mag',3.0,0,3,3,'enemy','MAG×3, hasarın yarısı kadar iyileş.', 'legendary',null);
S('leg_07','Göktaşı Yağmuru','magic','mag',3.5,0,7,5,'all_enemies','MAG×3.5 meteor yağmuru.', 'legendary',null);
S('leg_08','Kahramanlık','buff','atk',0.0,10,4,5,'all_allies','3 tur tüm takım +10 ATK +10 DEF.', 'legendary',null);
S('leg_09','Cehennem Ateşi','magic','mag',4.5,0,6,5,'enemy','MAG×4.5 + 5 tur yanma.', 'legendary',null);
S('leg_10','Sonsuzluk','heal','mag',10.0,0,10,10,'self','MAG×10 tam iyileştirme.', 'legendary',null);

// ===== 20 YENi DROP SKILL (Sezon 2) =====
S('new2_01','Yıldırım Zinciri','magic','mag',1.8,0,3,2,'all_enemies','Zincirleme yıldırım: MAG×1.8 tüm düşmanlara, %30 stun.', 'rare',null);
S('new2_02','Kan Kılıcı','physical','hp',0.3,0,2,2,'enemy','HP×0.3 hasar, verdiğin hasarın %20 si kadar iyileş.','epic',null);
S('new2_03','Hayalet Adım','utility','spd',0.0,0,1,3,'self','1 tur görünmezlik + sonraki saldırı 2× hasar.','rare',null);
S('new2_04','Buz Duvarı','buff','def',0.0,6,2,3,'self','2 tur +6 DEF, saldıran düşman 1 tur yavaşlar.','rare',null);
S('new2_05','Alev Kasırgası','magic','mag',2.2,0,4,3,'all_enemies','Alev fırtınası: MAG×2.2 + 2 tur yanma.','epic',null);
S('new2_06','Ruh Bağı','heal','mag',2.0,0,3,3,'ally','MAG×2 iyileştir, fazla iyileştirme sana gelir.','rare',null);
S('new2_07','Hiçlik Yumruğu','physical','atk',3.0,0,3,4,'enemy','ATK×3, DEFi %40 yok sayar.','epic',null);
S('new2_08','Zaman Sarmalı','utility','mag',0.0,0,5,5,'self','Kendi cooldownlarını sıfırla.','legendary',null);
S('new2_09','Zehirli Sis','debuff','mag',0.0,0,3,3,'all_enemies','3 tur zehir (MAG×0.3/tur) + -2 DEF.','rare',null);
S('new2_10','Taş Deri','buff','def',0.0,8,3,3,'self','2 tur +8 DEF, SPD -2.','rare',null);
S('new2_11','Kan Parmağı','physical','hp',0.25,0,1,1,'enemy','HP×0.25 hasar, kanama 3 tur.','common',null);
S('new2_12','Güneş Kılıcı','physical','atk',2.5,0,3,3,'enemy','Işık kılıcı: ATK×2.5, ölümsüzlere 2×.','epic',null);
S('new2_13','Kurt Sürüsü','physical','atk',1.2,0,3,2,'all_enemies','Kurt sürüsü saldırısı: ATK×1.2 × canavar sayısı.','rare',null);
S('new2_14','Mana Patlaması','magic','mag',4.0,0,6,4,'enemy','Tüm manayı harca: kalan mana başına +%10 hasar.','epic',null);
S('new2_15','Koruyucu Melek','heal','mag',3.0,0,4,4,'all_allies','Tüm takım MAG×3 iyileşme + 1 tur ölümsüzlük.','legendary',null);
S('new2_16','Gölge Adım','physical','spd',2.5,0,2,2,'enemy','SPD×2.5, arkadan saldırı. %40 kritik.','epic',null);
S('new2_17','Yer Sarsıntısı','physical','atk',1.8,0,3,3,'all_enemies','ATK×1.8 tüm düşmanlara + 1 tur stun.','epic',null);
S('new2_18','Kutsal Işın','magic','mag',2.8,0,4,3,'enemy','MAG×2.8, ölümsüzleri 3× hasar.','rare',null);
S('new2_19','Vampir Dokunuşu','magic','mag',2.0,0,2,2,'enemy','MAG×2, hasarın tamamı kadar iyileş.','epic',null);
S('new2_20','Kıyamet Çanı','magic','mag',6.0,0,8,6,'all_enemies','MAG×6 tüm düşmanlara. 1 kere kullanılabilir.','legendary',null);

// ===== Yardımcı Fonksiyonlar =====

function getSkillById(id) {
    return SKILLS.find(s => s.id === id) || null;
}

function getCharacterSkills(charId) {
    return SKILLS.filter(s => s.characterId === charId);
}

function getGeneralSkills() {
    return SKILLS.filter(s => !s.characterId);
}

function getSkillsByRarity(rarity) {
    return SKILLS.filter(s => s.rarity === rarity);
}

function getRandomSkill(rarity) {
    var pool = rarity ? getSkillsByRarity(rarity) : getGeneralSkills();
    if (pool.length === 0) pool = getGeneralSkills();
    return pool[Math.floor(Math.random() * pool.length)];
}

// ===== 100 YENI SKILL (HP-scale, cesitli mana) =====
// 30 HP-scale fiziksel
[['Dev Darbesi','physical','hp',0.3,0,1,2,'enemy','HP×0.3 hasar.','common'],['Son Nefes Vuruşu','physical','hp',0.5,0,2,3,'enemy','HP<%30 ise HP×0.5.','rare'],['Fedakarlık','physical','hp',0.4,0,0,2,'enemy','HP×0.4, kendine %10 hasar.','common'],['Dev Yumruk','physical','hp',0.25,10,1,1,'enemy','HP×0.25 + 10.','common'],['Öfke Patlaması','physical','hp',0.35,0,1,2,'enemy','HP×0.35 ofke.','rare'],['Titan Vuruşu','physical','hp',0.6,0,3,4,'enemy','HP×0.6 dev hasar.','epic'],['Yıkım','physical','hp',0.8,0,5,5,'enemy','HP×0.8.','legendary'],['Kan Darbesi','physical','hp',0.3,0,1,2,'enemy','HP×0.3, %5 iyileşme.','rare'],['Öfkeli Çarpma','physical','hp',0.2,0,0,1,'enemy','HP×0.2 hızlı.','common'],['Vahşi Saldırı','physical','hp',0.4,0,2,2,'enemy','HP×0.4.','rare']].forEach(function(s){S('hp_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],null);});

// 25 mixed mana-cost general skills
[['Buz Kılıcı','magic','mag',2.0,0,2,2,'enemy','MAG×2 buz hasarı.','common'],['Alev Yumruğu','magic','mag',2.2,0,2,2,'enemy','MAG×2.2 ateş.','common'],['Rüzgar Kırbacı','magic','mag',1.8,0,1,1,'enemy','MAG×1.8 rüzgar.','common'],['Toprak Mızrağı','magic','mag',2.5,0,3,2,'enemy','MAG×2.5 toprak.','rare'],['Işık Oku','magic','mag',2.0,5,2,2,'enemy','MAG×2+5 ışık.','common'],['Karanlık Dalgası','magic','mag',1.5,0,3,2,'all_enemies','MAG×1.5 AoE.','rare'],['Zehir Oku','magic','mag',1.8,0,2,2,'enemy','MAG×1.8+zehir.','common'],['Kan Büyüsü','magic','mag',2.5,0,2,2,'enemy','MAG×2.5, %5 HP.','rare'],['Yıldız Tozu','magic','mag',2.0,0,2,2,'all_enemies','MAG×2 AoE.','rare'],['Buz Fırtınası','magic','mag',2.5,0,4,3,'all_enemies','MAG×2.5 AoE.','epic']].forEach(function(s){S('new_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],null);});

// 25 heal/buff/debuff/utility
[['Hızlı Şifa','heal','mag',2.0,0,2,2,'self','MAG×2 iyileştirme.','common'],['Büyük Şifa','heal','mag',3.0,0,3,3,'self','MAG×3 iyileştirme.','rare'],['Kalkan Duası','buff','def',0,3,1,3,'self','+3 DEF 2 tur.','common'],['Güç Duası','buff','atk',0,3,1,3,'self','+3 ATK 2 tur.','common'],['Hız Duası','buff','spd',0,3,1,3,'self','+3 SPD 2 tur.','common'],['Lanet','debuff','mag',0,3,2,3,'enemy','-3 ATK 2 tur.','common'],['Zırh Kırma','debuff','mag',0,3,2,3,'enemy','-3 DEF 2 tur.','common'],['Kutsal Işık','heal','mag',4.0,0,4,4,'all_allies','Tüm takım MAG×4.','epic'],['Yenileme','heal','mag',1.0,0,1,2,'self','MAG×1+2 tur yenileme.','common'],['Enerji Kalkanı','buff','def',0,5,2,3,'self','+5 DEF 2 tur.','rare']].forEach(function(s){S('sup_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],null);});

// 20 more HP-scaling mixed
[['Taş Yumruk','physical','def',1.5,0,1,2,'enemy','DEF×1.5 hasar.','common'],['Kalkan Saldırısı','physical','def',2.0,0,2,3,'enemy','DEF×2 hasar.','rare'],['Hızlı Vuruş','physical','spd',2.0,0,1,1,'enemy','SPD×2 hasar.','common'],['Yıldırım Darbesi','physical','spd',3.0,0,3,2,'enemy','SPD×3 hasar.','epic'],['Can Emme','heal','hp',0.15,0,2,3,'self','HPnin %15i kadar iyileş.','rare'],['Hayat Ver','heal','hp',0.3,0,4,5,'ally','HPnin %30unu ver.','epic'],['Son Darbe','physical','atk',4.0,0,4,4,'enemy','ATK×4 son darbe.','epic'],['Çığlık','physical','atk',1.5,0,2,2,'all_enemies','ATK×1.5 AoE.','rare'],['Kırbaç','physical','atk',2.0,0,2,2,'enemy','ATK×2 kırbaç.','common'],['Sopa','physical','atk',1.0,5,0,1,'enemy','ATK×1+5 sopa.','common']].forEach(function(s){S('mix_'+s[5],s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],null);});

console.log('Skill verileri yüklendi: ' + SKILLS.length + ' skill (' + SKILLS.filter(function(s){return s.characterId}).length + ' karakter özel, ' + getGeneralSkills().length + ' genel)');
