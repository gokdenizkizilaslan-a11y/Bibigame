/* ===== BIBIGAME - Karakter Verileri ===== */

const CHARACTERS = [
    {
        id: "irem",
        name: "İrem the Cow Mage",
        title: "İnek Büyücü / Şifacı",
        role: "Destek",
        description: "Medikal yeteneklere ve mistik inek güçlerine sahip bir destek karakteri. Takım arkadaşlarını iyileştirme ve hayatta tutma konusunda uzmandır. Takımda Gökdeniz'in bulunması, onun şifa ve destek yeteneklerinin verimliliğini gözle görülür şekilde artırır.",
        story: "Kasabanın şifacısı olarak bilinen İrem, büyülü inekleriyle çevredeki yaralıları iyileştiriyordu. Karanlık çöktüğünde kasaba halkının tek umudu haline geldi.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Süt Büyüsü - Takım arkadaşına 1 kalp iyileştirir",
            "İnek Kalkanı - 1 tur hasar almaz",
            "Otlak Bereketi - +2 yemek kazandırır",
            "Diriltme Ritüeli - Ölü karakteri 2-3 günde diriltir",
            "Sürü Dayanışması - Tüm takıma +1 geçici kalp"
        ],
        synergy: {
            character: "gokdeniz",
            characterName: "Gökdeniz",
            effect: "İrem'in şifa yetenekleri iki kat etkili olur. Gökdeniz'in varlığı İrem'i korur."
        },
        canRevive: true,
        portrait: "assets/characters/irem.png",
        combatStats: { hp: 485, atk: 7, def: 13, spd: 9, mag: 16, mr: 14 , crit: 5},
        characterSkills: ['ire_01','ire_02','ire_03','ire_04','ire_05'],
        passive: { name: "Oz Iyilesme", description: "Oldugunde 2 gun sonra otomatik dirilir.", effect: "autoRevive" }
    },
    {
        id: "gokdeniz",
        name: "Gökdeniz the Racist Villager",
        title: "Öfkeli Savaşçı / Ön Cephe",
        role: "Savaşçı",
        description: "Agresif saldırı tarzı ve yüksek atak gücüyle öne çıkan bir savaşçı. Kasabanın yerlisidir ve dışarıdan gelenlere karşı mesafelidir. Takımda İrem'in olması, onun savaşma azmini körükler ve atak gücünü yükseltir.",
        story: "Kasabanın demircisiydi. Karanlık yaratıklar ilk saldırdığında örsünü kalkan, çekicini silah yaptı. Yabancılara güvenmez ama İrem'in sözünü dinler.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Önyargı Darbesi - Düşmana 2 hasar",
            "Köylü Kalkanı - 1 hasarı engeller",
            "Hiddet Dalgası - Tüm düşmanlara 1 hasar",
            "Öfke Nöbeti - 2 tur boyunca +1 atak gücü",
            "Son Nefes Mücadelesi - 1 kalp kalsa bile 2 kat hasar verir"
        ],
        synergy: {
            character: "irem",
            characterName: "İrem",
            effect: "Gökdeniz'in atak gücü %50 artar. İrem'in varlığı onu sakinleştirir ve odaklanmasını sağlar."
        },
        canRevive: false,
        portrait: "assets/characters/gokdeniz.png",
        combatStats: { hp: 560, atk: 18, def: 12, spd: 10, mag: 4, mr: 8 , crit: 5},
        characterSkills: ['gok_01','gok_02','gok_03','gok_04','gok_05'],
        passive: { name: "Savas Cilginligi", description: "%50 sansla skill 2 defa tetiklenir.", effect: "doubleCast" }
    },
    {
        id: "noyan",
        name: "Noyan the Ship Captain",
        title: "Gemi Kaptanı / Su Büyücüsü",
        role: "Büyücü/Saldırı",
        description: "Bir zamanlar uçsuz bucaksız denizlerde kaptanlık yapan Noyan, gemisi kayalıklara çarpıp parçalandıktan sonra bu kasabaya sığınmak zorunda kaldı. Yıllarını denizlerde geçirmiş olmanın verdiği su büyüsü yetenekleriyle dövüşür. Dalgaları ve fırtınaları kontrol edebilir.",
        story: "Gemisi 'Kutsal Nağme' bir fırtınada kayalıklara çarptı. Mürettebatından sağ kalanlarla birlikte kasabaya sığındı. Okyanusun tuzu hâlâ sakalında, denizin gücü avuçlarında. Su büyüsüyle hem dostlarına kalkan olur hem düşmanlarını boğar.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Su Kırbacı - Düşmana su dalgasıyla 2 hasar",
            "Deniz Kalkanı - 1 hasarı su bariyeriyle engeller",
            "Fırtına Çağrısı - Tüm düşmanları 1 tur yavaşlatır",
            "Gelgit Dalgası - Düşmanı geri püskürtür, 1 tur etkisiz",
            "Okyanusun Gazabı - Tüm düşmanlara 2 hasar"
        ],
        synergy: {
            character: "begul",
            characterName: "Begül",
            effect: "Noyan'ın su büyüsü Begül'ün rünleriyle güçlenir. Su ve rün enerjisi birleşir."
        },
        canRevive: false,
        portrait: "assets/characters/noyan.png",
        combatStats: { hp: 490, atk: 8, def: 10, spd: 14, mag: 18, mr: 12 , crit: 7},
        characterSkills: ['noy_01','noy_02','noy_03','noy_04','noy_05'],
        passive: { name: "Su Emici", description: "Su buyuleri hasarin %10u kadar iyilestirir.", effect: "waterHeal" }
    },
    {
        id: "begul",
        name: "Begül the TLL Teacher",
        title: "Dil Öğretmeni / Rün Okuyucu",
        role: "Destek/Bilge",
        description: "Başka bir boyuttan bu dünyaya gelmiş gizemli bir dil öğretmeni. Dünyadaki diğer kimsenin çözemediği antik rünleri okuyabilme gücüne sahiptir. Noyan ile olan sinerjisi sayesinde antik rünleri normalden daha derinlemesine inceleyebilir.",
        story: "Kimsenin bilmediği bir dilden konuşarak kasabaya geldi. Antik rünlerle kaplı defteri ve sakin tavrıyla kasaba halkını şaşırttı. Rünleri okuyabilen tek kişi o.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Antik Rün Okuma - Gizli kart etkisini açığa çıkarır",
            "Boyut Kapısı - 1 tur kaçış/takım koruması",
            "Dil Büyüsü - Düşmanı 1 tur etkisiz bırakır (iletişim kopar)",
            "Bilgi Parşömeni - +3 altın kazandırır",
            "Rün Patlaması - Düşmana rün gücüyle 2 hasar"
        ],
        synergy: {
            character: "noyan",
            characterName: "Noyan",
            effect: "Begül'ün rün okuma yeteneği 2 kat etkili olur. Noyan'ın su büyüsü rünleri canlandırır."
        },
        canRevive: false,
        portrait: "assets/characters/begul.png",
        combatStats: { hp: 460, atk: 6, def: 8, spd: 12, mag: 17, mr: 14 , crit: 6},
        characterSkills: ['beg_01','beg_02','beg_03','beg_04','beg_05'],
        passive: { name: "Run Bilgisi", description: "Runler dusmanin zayif noktasini gosterir, +%10 hasar.", effect: "runePower" }
    },
    {
        id: "bedrican",
        name: "Bedrican the Golem",
        title: "Golem / Tank",
        role: "Tank",
        description: "Takımın ön cephesini koruyan tam bir tank karakter. Muazzam bir zırha ve can havuzuna sahiptir. Canı tehlikeli seviyelere düştüğünde ve köşeye sıkıştığında, düşmanlarına ağır bir hasar kaynağı olarak devasa 3D matematik kitapları fırlatır.",
        story: "Eski bir akademisyenin başarısız bir büyü sonucu taşa dönüşmüş asistanıydı. Yüzyıllar sonra karanlığın yükselişiyle yeniden canlandı. Taş bedeniyle kasabanın kalkanı oldu.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Taş Kalkan - 2 hasarı engeller",
            "Golem Darbesi - Düşmana 2 hasar",
            "Matematik Kitabı Fırlatma - (can < 2 ise) 4 hasar",
            "Dayanıklı Yapı - Maksimum kalbi geçici 5 yapar",
            "Toprak Sarsıntısı - Tüm düşmanları yavaşlatır"
        ],
        synergy: null,
        canRevive: false,
        portrait: "assets/characters/bedrican.png",
        combatStats: { hp: 650, atk: 10, def: 18, spd: 6, mag: 2, mr: 14 , crit: 3},
        characterSkills: ['bed_01','bed_02','bed_03','bed_04','bed_05'],
        passive: { name: "Tas Dayaniklilik", description: "HP %50nin altina dusunce %30 daha az hasar alir.", effect: "stoneSkin" }
    },
    {
        id: "cansin",
        name: "Cansın the Tamer",
        title: "Canavar Terbiyecisi / Evcilleştirici",
        role: "Özel",
        description: "Vahşi doğaya hükmeden yetenekli bir evcil hayvan terbiyecisi. Karşılaştığı bir canavarı evcilleştirerek kendi safına çekebilir. Gunda Rahman ile birlikte olduğunda hayatta kalma becerisi artar.",
        story: "Ormanın derinliklerinde büyümüş, hayvanların dilini çözmüş bir avcı. Kurt sürüsüyle birlikte kasabaya geldiğinde önce korku yarattı, sonra en güçlü müttefik oldu.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Canavar Evcilleştirme - 1 canavarı müttefik yapar",
            "Vahşi Çağrı - Evcilleştirilmiş canavar 2 hasar verir",
            "Doğa Uyumu - +2 yemek +1 odun kazandırır",
            "Sürü Emri - Tüm canavarlar 1 tur ekstra saldırır",
            "Vahşi Bağ - Canavarın hasarını emer (canavara gelen hasarı paylaşır)"
        ],
        synergy: {
            character: "gunda",
            characterName: "Gunda Rahman",
            effect: "Cansın ve Gunda'nın hayatta kalma becerisi ve dayanıklılığı artar. Birlikte doğada daha güçlüler."
        },
        canRevive: false,
        portrait: "assets/characters/cansin.png",
        combatStats: { hp: 500, atk: 12, def: 11, spd: 13, mag: 8, mr: 9 , crit: 6},
        characterSkills: ['can_01','can_02','can_03','can_04','can_05'],
        passive: { name: "Suru Lideri", description: "Kurt companion %50 daha fazla hasar verir.", effect: "packLeader" }
    },
    {
        id: "gunda",
        name: "Gunda Rahman",
        title: "Toprak Büyücüsü / Bilge",
        role: "Büyücü",
        description: "Toprak büyülerine ve kadim bilgilere hükmeden bir bilge. Toprağı şekillendirerek savaş alanını kontrol edebilir. Cansın ile birlikte hareket ettiğinde her ikisinin de dayanıklılığı ve yaşam enerjisi güçlenir.",
        story: "Uzak diyarlardan gelen bir toprak rahibi. Ayak bastığı yerde taşlar şekil değiştirir. Kasabaya barış getirmek için geldi ama savaşmak zorunda kalacağını biliyordu.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Toprak Duvar - 2 hasarı engeller",
            "Kum Fırtınası - Düşmanları 1 tur kör eder",
            "Taş Yağmuru - Tüm düşmanlara 1 hasar",
            "Bereketli Toprak - +3 yemek kazandırır",
            "Deprem Dalgası - 1 düşmana 3 hasar"
        ],
        synergy: {
            character: "cansin",
            characterName: "Cansın",
            effect: "Gunda'nın dayanıklılığı artar. Cansın ile doğanın dengesini bulur."
        },
        canRevive: false,
        portrait: "assets/characters/gunda.png",
        combatStats: { hp: 475, atk: 9, def: 9, spd: 11, mag: 19, mr: 13 , crit: 5},
        characterSkills: ['gun_01','gun_02','gun_03','gun_04','gun_05'],
        passive: { name: "Toprak Hukmu", description: "Toprak skilleri dusmani yavaslatir (-2 SPD, 2 tur).", effect: "earthSlow" }
    },
    {
        id: "dominic",
        name: "Dominic Toretto",
        title: "Aile Reisi / Güçlü Başlangıç",
        role: "Dengeli",
        description: "Arabalara ve her şeyden çok ailesine düşkün efsanevi bir figür. Aile bağlarının verdiği sarsılmaz motivasyonla tüm temel nitelikleri diğer karakterlere kıyasla bir adım öndedir.",
        story: "Ailesiyle birlikte kasabaya en son ulaşan kafiledeydi. Tozlu yollardan geçip geldi. 'Aile her şeydir' sözüyle kasaba savunmasının bel kemiği oldu.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Aile Gücü - Takımdaki her karakter başına +1 geçici güç",
            "Sürücü Refleksi - 1 ölümcül darbeden kaçınır",
            "Motivasyon Konuşması - Takıma 1 tur buff (+1 tüm istatistikler)",
            "Garaj Ustası - +2 odun +1 altın kazandırır",
            "Son Sürat - 1 düşmana araba çarpar (3 hasar)"
        ],
        synergy: null,
        canRevive: false,
        portrait: "assets/characters/dominic.png",
        combatStats: { hp: 525, atk: 14, def: 14, spd: 12, mag: 6, mr: 12 , crit: 6},
        characterSkills: ['dom_01','dom_02','dom_03','dom_04','dom_05'],
        passive: { name: "Aile Reisi", description: "Her canli takim arkadasi icin +%5 tum statlar.", effect: "familyBuff" }
    },
    {
        id: "bulent",
        name: "Bülent Ersoy",
        title: "Diva / Feniks",
        role: "Özel",
        description: "Eşsiz ve dramatik bir oyun tarzına sahip diva. Savaşın ilk gününde hayatta kalamaz; ancak ikinci gün küllerinden doğarak, henüz seçilmemiş başka bir karakterin formunda yeniden sahneye döner.",
        story: "Kasabanın eski tiyatrosunda son performansını sergilerken karanlık çöktü. İlk gün yok oldu, ikinci gün bambaşka bir yüzle döndü. Ölüm onun için bir perde arası.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Diva Vedası - İlk gün ölür (kaçınılmaz)",
            "Feniks Dönüşü - 2. gün seçilmemiş karakter olarak dirilir",
            "Sahne Işığı - 1 düşmanı büyüler, 2 tur etkisiz",
            "Dramatik Final - 1 düşmanla birlikte kendini feda eder",
            "Reenkarnasyon Aurası - Takımdaki ölü karakterler 1 gün daha hızlı dirilir"
        ],
        synergy: null,
        canRevive: false,
        portrait: "assets/characters/bulent.png",
        combatStats: { hp: 500, atk: 12, def: 5, spd: 11, mag: 8, mr: 4, crit: 5},
        characterSkills: ['bul_01','bul_02','bul_03','bul_04','bul_05'],
        passive: { name: "Feniks Dogusu", description: "Savasta cani 0 veya altina inerse bir kereligine tam canla geri dogar.", effect: "phoenixRebirth" }
    },
    {
        id: "emin",
        name: "Emin the Potion Guy",
        title: "İksir Ustası / Destek Büyücü",
        role: "Destek/Büyücü",
        description: "İksirleriyle takımı güçlendiren genç bir simyager. Zeytin'in zulmünden kaçarken laboratuvarını sırtlayıp gelmiş. Yüksek büyü gücü ve büyü direnciyle öne çıkar.",
        story: "Zeytin'in karanlığı laboratuvarını yok ettiğinde, Emin en değerli iksirlerini alıp kaçtı. Kasabaya geldiğinde elinde sadece bir çanta dolusu şişe ve bitmek bilmeyen bir merak vardı. Şimdi iksirleriyle takımı güçlendiriyor.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Şifa İksiri — Takım arkadaşına 2 kalp iyileştirir",
            "Güç İksiri — 2 tur +3 ATK",
            "Zırh İksiri — 2 tur +3 DEF",
            "Patlayıcı İksir — Düşmana MAG×2.5 hasar",
            "Duman İksiri — 2 tur düşman %50 ıskalar"
        ],
        synergy: null,
        canRevive: false,
        portrait: "assets/characters/emir.png",
        combatStats: { hp: 470, atk: 6, def: 14, spd: 10, mag: 20, mr: 16, crit: 4 },
        characterSkills: ['emi_01','emi_02','emi_03','emi_04','emi_05'],
        passive: { name: "İksir Ustalığı", description: "İksirler %25 daha etkili (iyileştirme ve bufflar).", effect: "potionMaster" }
    },
    {
        id: "zeynep",
        name: "Zeynep the Old Knight",
        title: "Eski Şövalye / Zırh Delici",
        role: "Savaşçı/Tank",
        description: "Henuz 20 yasinda ama 12 yasinda sovalyeydi. Krallik Zeytin'in eline geçince görevinden ayrılıp bu kasabaya sığındı. Paslı zırhı ve kırık kılıcıyla hâlâ dimdik ayakta. Zırh delme yeteneğiyle tanınır.",
        story: "12 yasinda kraliyetin en genc sovalyesi oldu. 8 yil kralliga hizmet etti. Zeytin'in karanlığı karşısında zırhı parçalandı, kılıcı kırıldı. Yenilgiyi kabul edip kasabaya çekildi. Şimdi intikam icin biliyor. 20 yasinda emekli bir sovalyeydi ama hala dimdik ayakta.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Zırh Delme — DEF'i %50 yok sayarak ATK×2 hasar",
            "Kırık Kılıç — ATK×2.5 hasar, kendine %5 hasar",
            "Şövalye Yemini — 3 tur +5 DEF",
            "Kraliyet Darbesi — ATK×3 hasar",
            "Son Kale — HP<%30 ise 2 tur dokunulmazlık"
        ],
        synergy: null,
        canRevive: false,
        portrait: "assets/characters/zeynep.png",
        combatStats: { hp: 580, atk: 16, def: 16, spd: 7, mag: 4, mr: 14, crit: 4 },
        characterSkills: ['zey_01','zey_02','zey_03','zey_04','zey_05'],
        passive: { name: "Zırh Delme", description: "Düşman DEF'inin %50sini yok sayar.", effect: "armorPierce" }
    },
    {
        id: "emir",
        name: "Emir the Hunter",
        title: "Avcı / Babanne Ruhu",
        role: "Savaşçı/Avcı",
        description: "Ölü babaannesinin ruhunu kullanarak savaşan genç bir avcı. Babaannesi tuvalette kayıp düşüp öldüğü için tuvaletlerden korkar. Bastonu hâlâ elinde, ruhu hâlâ yanında.",
        story: "Babaannesi bir gece tuvalete gitti ve bir daha çıkmadı. Ertesi gün onu tuvalette hareketsiz buldular. O günden beri Emir tuvaletlere giremez. Ama babaannesinin ruhu onu hiç terk etmedi. Bastonuyla savaşırken, babaannesinin fısıltısını duyar.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Babanne Bastonu — ATK×2.5 hasar, babaannenin bastonunu fırlatır",
            "Babanne Ruhu — MAG×2 hasar, babaannenin ruhu saldırır",
            "Avcı Oku — ATK×2 menzilli hasar",
            "Kapan — ATK×3 tuzak hasarı",
            "Tuvalet Korkusu — 2 tur düşman -3 ATK (korku bulaşıcıdır)"
        ],
        synergy: null,
        canRevive: false,
        portrait: "assets/characters/emir.png",
        combatStats: { hp: 540, atk: 17, def: 15, spd: 11, mag: 6, mr: 9, crit: 5 },
        characterSkills: ['emi_01','emi_02','emi_03','emi_04','emi_05'],
        passive: { name: "İnfaz", description: "Canı %10un altına düşen boss olmayan düşmanları anında öldürür.", effect: "execute" }
    },
    {
        id: "bora",
        name: "Bora the Musical Nigga",
        title: "Müzisyen / Ritm Ustası",
        role: "Destek/Büyücü",
        description: "Müziğiyle hem dostlarına ilham veren hem düşmanlarını sersemleten yetenekli bir müzisyen. Her notada biraz büyü, her ritmde biraz güç var.",
        story: "Zeytin'in karanlığı çökmeden önce kasabanın tek müzisyeniydi. Düğünlerde, cenazelerde, her yerde o vardı. Şimdi müziğini savaş alanına taşıdı. Bas gitarını sırtlayıp geldi.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Melodi — MAG×2 büyü hasarı",
            "Bas Düşüşü — MAG×2.5 alan hasarı",
            "Ritmik Vuruş — ATK×1.5 fiziksel hasar",
            "İlham Verici Şarkı — 2 tur takım +3 ATK",
            "Susturucu Nota — 1 tur düşman sessiz"
        ],
        synergy: null,
        canRevive: false,
        portrait: "assets/characters/bora.png",
        combatStats: { hp: 450, atk: 7, def: 9, spd: 15, mag: 19, mr: 13, crit: 6 },
        characterSkills: ['bor_01','bor_02','bor_03','bor_04','bor_05'],
        passive: { name: "Ritim", description: "Her tur +2 MAG (kümülatif, max +20).", effect: "rhythmMag" }
    },
    {
        id: "furkan",
        name: "Furkan the Assassin",
        title: "Gölge Suikastçı / Eski Yoldaş",
        role: "Suikastçı",
        description: "Bir zamanlar Zeytin'in en güvendiği adamıydı. Karanlık büyüdükçe Zeytin'in yöntemleri değişti; masumları feda etmeye başladı. Furkan buna sessiz kalamadı ve yollarını ayırdı. Şimdi gölgelerde yürüyüp, hançeriyle karanlığa direniyor.",
        story: "Zeytin ile birlikte büyüdüler. Aynı köyde, aynı sokakta. Ama Zeytin karanlığa yenik düşünce, Furkan kendi yolunu çizmek zorunda kaldı. Zeytinin zayıf noktalarını herkesten iyi bilir. Bu bilgiyi kullanmak için doğru zamanı bekliyor.",
        hearts: 4,
        maxHearts: 4,
        baseSkills: [
            "Gölge Hançeri — ATK×2.5 hasar, arkadan vurursa 2×",
            "Zehir Ucu — ATK×2 + 3 tur zehir",
            "Sis Perdesi — 1 tur görünmezlik",
            "Suikast — ATK×4 tek hedef (5 tur CD)",
            "Kan Emici — ATK×2.5, hasarın %25i kadar iyileş"
        ],
        synergy: null,
        canRevive: false,
        portrait: "assets/characters/furkan.png",
        combatStats: { hp: 470, atk: 19, def: 10, spd: 18, mag: 5, mr: 8, crit: 8 },
        characterSkills: ['fur_01','fur_02','fur_03','fur_04','fur_05'],
        passive: { name: "Kan Calma", description: "Verdigi hasarin %25i kadar iyilesir.", effect: "vampiricTouch" }
    }
];

function getCharacterById(id) {
    const char = CHARACTERS.find(c => c.id === id);
    if (char) {
        const configPortrait = ConfigManager.getPortrait(id);
        if (configPortrait) char.portrait = configPortrait;
    }
    return char || null;
}

function applyConfigStats(char) {
    if (!char || !char.combatStats) return;
    const configStats = ConfigManager.getCharacterStats(char.id);
    if (configStats) {
        Object.keys(configStats).forEach(function(key) {
            char.combatStats[key] = configStats[key];
        });
    }
}

function getUnselectedCharacters(selectedIds) {
    return CHARACTERS.filter(c => !selectedIds.includes(c.id));
}
