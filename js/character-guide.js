/*
==============================================================
  BIBIGAME - KARAKTER & SKİLL REHBERİ
==============================================================
  Bu dosya OYUN TARAFINDAN YÜKLENMEZ.
  Sadece sana referans olması için.
  Karakter eklemek veya değiştirmek için
  aşağıdaki talimatları takip et.

  = İÇİNDEKİLER =
  1. KARAKTER EKLEME (character-data.js)
  2. SKİLL EKLEME (skill-data.js)
  3. STAT AYARLAMA (config.json)
  4. MEVCUT KARAKTERLERİ DEĞİŞTİRME
  5. PASSİV EFEKTLER
  6. SİNERJİ SİSTEMİ
==============================================================
*/


/* ============================================================
   1. KARAKTER EKLEME (character-data.js)
   ============================================================

   character-data.js dosyasının içinde CHARACTERS array'i var.
   Yeni karakter eklemek için aşağıdaki şablonu kullan:

   -----------------------------------------------------------------
   {
       id: "karakter_id",        // benzersiz, kısa, ingilizce harf
       name: "Karakter Adı",      // görünen isim
       title: "Ünvanı / Rolü",    // alt başlık
       role: "Savaşçı",           // Savaşçı | Büyücü | Tank | Destek | Suikastçı | Özel
       description: "Uzun açıklama...",   // karakter tanımı
       story: "Hikayesi...",             // arka plan hikayesi
       hearts: 4,
       maxHearts: 4,              // can sayısı (genelde 4)
       baseSkills: [              // temel yetenekler (günlük oyun için)
           "Yetenek 1 - ne işe yarar",
           "Yetenek 2 - ne işe yarar",
           "Yetenek 3 - ne işe yarar",
           "Yetenek 4 - ne işe yarar",
           "Yetenek 5 - ne işe yarar"
       ],
       synergy: {                 // OPSİYONEL: başka karakterle sinerji
           character: "diger_karakter_id",
           characterName: "Diğer Karakter Adı",
           effect: "Sinerji açıklaması."
       },
       canRevive: false,          // ölünce dirilebilir mi?
       portrait: "assets/characters/karakter_id.png",  // portre resmi
       combatStats: {             // SAVAŞ İSTATİSTİKLERİ
           hp: 500,               // can
           atk: 12,               // fiziksel saldırı
           def: 10,               // fiziksel savunma
           spd: 10,               // hız (kim önce vurur)
           mag: 5,                // büyü gücü
           mr: 10,                // büyü direnci
           crit: 5                // kritik şansı (yüzde)
       },
       characterSkills: [         // skill ID'leri (aşağıya bak)
           'xyz_01','xyz_02','xyz_03','xyz_04','xyz_05'
       ],
       passive: {                 // OPSİYONEL: pasif yetenek
           name: "Pasif Adı",
           description: "Pasif açıklaması.",
           effect: "passiveEffectAdı"  // aşağıdaki listeden seç
       }
   },
   -----------------------------------------------------------------

   ÖNEMLİ:
   - id: sadece ingilizce küçük harf, rakam ve alt çizgi kullan
   - characterSkills: skill ID'leri 5 tane olmalı
   - portrait dosyasını assets/characters/ klasörüne at
   - Sona , koymayı unutma (diğer karakterlerin arasına)


   ============================================================
   2. SKİLL EKLEME (skill-data.js)
   ============================================================

   skill-data.js dosyasında S() fonksiyonu var.
   Yeni karakter skill'i eklemek için:

   -----------------------------------------------------------------
   S('xyz_01','Skill Adı','type','scaleStat',scaleFactor,baseEffect,manaCost,cooldown,'target','Açıklama','character','karakter_id');
   -----------------------------------------------------------------

   PARAMETRELER:
   ┌──────────────┬──────────────────────────────────────────────┐
   │ Parametre    │ Ne işe yarar                                │
   ├──────────────┼──────────────────────────────────────────────┤
   │ 1. id        │ Benzersiz ID. xyz_01 gibi.                  │
   │ 2. name      │ Skill adı.                                  │
   │ 3. type      │ physical | magic | heal | buff | debuff |   │
   │              │ utility                                      │
   │ 4. scaleStat │ Hangi stat'a göre hasar/iyileşme hesaplanır │
   │              │ atk | mag | hp | def | spd                   │
   │ 5. scaleFactor│ Çarpan. Örn: 2.5 = stat×2.5 hasar          │
   │ 6. baseEffect│ Sabit ek hasar/iyileştirme (0 olabilir)     │
   │ 7. manaCost  │ Mana maliyeti (0=mana harcamaz)             │
   │ 8. cooldown  │ Kaç turda 1 kullanılabilir (0=her tur)      │
   │ 9. target    │ enemy | self | ally | all_enemies |          │
   │              │ all_allies                                   │
   │ 10. desc     │ Açıklama yazısı                              │
   │ 11. rarity   │ 'character' (karakter skilli için)           │
   |              | common | rare | epic | legendary             │
   │ 12. charId   │ Karakter ID'si (genel skill için null)      │
   └──────────────┴──────────────────────────────────────────────┘

   ÖRNEKLER:
   // Fiziksel hasar skilli
   S('xyz_01','Kılıç Darbesi','physical','atk',2.0,0,0,2,'enemy','ATK×2 hasar.','character','karakter_id');

   // Büyü hasarı
   S('xyz_02','Ateş Topu','magic','mag',2.5,0,2,2,'enemy','MAG×2.5 hasar.','character','karakter_id');

   // İyileştirme (ally = takım arkadaşına)
   S('xyz_03','Şifa','heal','mag',2.0,0,2,2,'ally','MAG×2 iyileştirme.','character','karakter_id');

   // Buff (kendine)
   S('xyz_04','Güçlenme','buff','atk',0.0,3,1,3,'self','2 tur +3 ATK.','character','karakter_id');

   // Tüm düşmana hasar
   S('xyz_05','Alan Vuruşu','magic','mag',1.5,0,3,2,'all_enemies','MAG×1.5 tüm düşmanlara.','character','karakter_id');


   ============================================================
   3. STAT AYARLAMA (config.json)
   ============================================================

   config.json dosyasının içinde "characterStats" bölümü var.
   Orada karakter ID'sine göre istatistikleri değiştirebilirsin.
   Buradaki değerler, character-data.js içindeki orijinal
   değerleri EZER. Yani character-data.js'i değiştirmeden
   sadece buradan stat ayarlayabilirsin.

   ÖRNEK:
   "characterStats": {
       "irem": {
           "hp": 560,
           "atk": 7,
           "def": 13,
           "mr": 14,
           "mag": 25,
           "spd": 9,
           "crit": 5
       }
   }

   NOT: Sadece değiştirmek istediğin statları yazman yeterli.
   Örn: sadece "hp": 600 yazsan, diğer statlar character-data.js'den gelir.


   ============================================================
   4. MEVCUT KARAKTERİ DEĞİŞTİRME
   ============================================================

   A) STAT DEĞİŞTİRMEK İÇİN:
      - Ya character-data.js'den direkt değiştir
      - Ya da config.json > characterStats bölümüne ekle

   B) SKİLL DEĞİŞTİRMEK İÇİN:
      skill-data.js'de ilgili S() satırını bul ve değiştir.
      Örn: gok_01'in hasarını artırmak için scaleFactor'ü
      2.5'ten 3.0'a çıkar.

   C) YENİ SKİLL EKLEMEK İÇİN:
      1) skill-data.js'ye yeni S() satırı ekle
      2) character-data.js'de characterSkills array'ine
         yeni skill ID'sini ekle

   D) KARAKTER SİLMEK İÇİN:
      character-data.js'deki karakter bloğunu sil.
      config.json'daki characterStats'ını da sil.


   ============================================================
   5. PASSİV EFEKTLER
   ============================================================

   Kullanılabilir passive effect değerleri:

   ┌──────────────────┬──────────────────────────────────────────┐
   │ effect           │ Ne yapar                               │
   ├──────────────────┼──────────────────────────────────────────┤
   │ autoRevive       │ Ölünce 2 gün sonra otomatik dirilir    │
   │ doubleCast       │ %50 şansla skill 2 kere atar           │
   │ waterHeal        │ Su büyüleri hasarın %10u kadar         │
   │                  │ iyileştirir                            │
   │ runePower        │ Düşmanın zayıf noktasını görür +%10   │
   │                  │ hasar                                  │
   │ stoneSkin        │ HP %50 altındayken %30 az hasar        │
   │ packLeader       │ Kurt companion %50 fazla hasar         │
   │ earthSlow        │ Toprak skilleri düşmanı yavaşlatır     │
   │ familyBuff       │ Her canlı takım arkadaşı için +%5 stat│
   │ phoenixRebirth   │ Savaşta 1 kere tam canla dirilir      │
   │ potionMaster     │ İksirler %25 daha etkili              │
   │ armorPierce      │ Düşman DEF'inin %50sini yok sayar     │
   │ execute          │ Canı %10 altı boss olmayan düşmanları │
   │                  │ anında öldürür                        │
   │ rhythmMag        │ Her tur +2 MAG (kümülatif, max +20)   │
   │ vampiricTouch    │ Verdiği hasarın %25i kadar iyileşir   │
   └──────────────────┴──────────────────────────────────────────┘


   ============================================================
   6. SİNERJİ SİSTEMİ
   ============================================================

   İki karakter arasında özel bir bağ oluşturmak için
   synergy kullanılır. Sadece etkisi açıklama olarak
   yazılır, mekanik olarak oyunda manuel işlenir.

   Kullanımı:
   synergy: {
       character: "diger_karakter_id",
       characterName: "Diğer Karakter Adı",
       effect: "Sinerji açıklaması."
   }

   Sinerjisi olmayan karakterler için synergy: null yap.


   ============================================================
   HIZLI KARAKTER EKLEME ŞABLONU (kopyala yapıştır)
   ============================================================

   // 1) skill-data.js'ye skill'leri ekle:
   S('yen_01','Yeni Skil 1','physical','atk',2.0,0,0,2,'enemy','ATK×2 hasar.','character','yenikarakter');
   S('yen_02','Yeni Skil 2','magic','mag',2.5,0,2,2,'enemy','MAG×2.5 hasar.','character','yenikarakter');
   S('yen_03','Yeni Skil 3','heal','mag',2.0,0,2,2,'ally','MAG×2 iyileştirme.','character','yenikarakter');
   S('yen_04','Yeni Skil 4','buff','atk',0.0,3,1,3,'self','2 tur +3 ATK.','character','yenikarakter');
   S('yen_05','Yeni Skil 5','physical','atk',3.0,0,1,3,'enemy','ATK×3 hasar.','character','yenikarakter');

   // 2) character-data.js'ye karakter bloğunu ekle (CHARACTERS array'in içine):
   {
       id: "yenikarakter",
       name: "Yeni Karakter",
       title: "Ünvan / Rol",
       role: "Savaşçı",
       description: "Karakter açıklaması.",
       story: "Arka plan hikayesi.",
       hearts: 4,
       maxHearts: 4,
       baseSkills: [
           "Skil 1 - açıklama",
           "Skil 2 - açıklama",
           "Skil 3 - açıklama",
           "Skil 4 - açıklama",
           "Skil 5 - açıklama"
       ],
       synergy: null,
       canRevive: false,
       portrait: "assets/characters/yenikarakter.png",
       combatStats: { hp: 500, atk: 12, def: 10, spd: 10, mag: 5, mr: 10, crit: 5 },
       characterSkills: ['yen_01','yen_02','yen_03','yen_04','yen_05'],
       passive: { name: "Pasif Adı", description: "Pasif açıklaması.", effect: "effectAdı" }
   },

   // 3) config.json > characterPortraits'a portre yolunu ekle:
   "yenikarakter": "assets/characters/yenikarakter.png",

   // 4) config.json > characterStats'a istatistikleri ekle (OPSİYONEL):
   "yenikarakter": { "hp": 500, "atk": 12, "def": 10, "spd": 10, "mag": 5, "mr": 10, "crit": 5 }
*/
