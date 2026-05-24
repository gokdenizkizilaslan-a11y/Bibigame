/* ===== BIBIGAME - Event Sistemi ===== */

const EventSystem = {
    triggeredEvents: [],
    eventChain: null,

    init() {
        this.triggeredEvents = [];
        this.eventChain = null;
    },

    checkForEvent(day, timeOfDay) {
        // Dönüm noktası günü mü?
        const milestoneDays = [5, 10, 15, 20, 25, 30];
        if (milestoneDays.includes(day) && timeOfDay === 'morning') {
            return this.getMilestoneEvent(day);
        }

        // Rastgele event (%25 şans)
        if (Math.random() < 0.25) {
            return this.getRandomEvent();
        }

        return null;
    },

    getMilestoneEvent(day) {
        const events = {
            5: {
                title: 'İlk Kilometre Taşı',
                text: '5. güne ulaştın! Ormanın ruhları seni fark etti. Bir ruh sana bir armağan sunuyor.',
                effects: { food: +3, wood: +2, gold: +5 }
            },
            10: {
                title: 'Hayatta Kalma Ustası',
                text: '10 gün! Artık vahşi doğanın bir parçası oldun. Yeteneklerin gelişiyor, tehlikeler büyüyor.',
                effects: { heart: +1, gold: +3 }
            },
            15: {
                title: 'Karanlığın Ortasında',
                text: '15. gün. Yolun yarısı. Karanlık güçler varlığını hissetti. Bir boss beliriyor!',
                effects: { heart: -1, gold: +8 }
            },
            20: {
                title: 'Sınav Günü',
                text: '20. gün. Hayatta kalma içgüdülerin zirvede. Ama kadim bir lanet serbest kalıyor...',
                effects: { heart: -2, gold: +5, food: +3 }
            },
            25: {
                title: 'Son Düzlük',
                text: '25. gün. Sona yaklaşıyorsun. Ama düşmanların da son kozlarını oynuyor.',
                effects: { heart: -2, wood: +5, gold: +5 }
            },
            30: {
                title: 'Kaderin Eşiğinde',
                text: '30. gün! Artık her an her şey olabilir. Kaderini kendin çizeceksin.',
                effects: { heart: +1, gold: +10 }
            }
        };
        return events[day] || null;
    },

    getRandomEvent() {
        const events = [
            {
                title: 'Şanslı Buluş',
                text: 'Yürürken ayağın bir taşa takıldı. Altından eski bir para kesesi çıktı!',
                effects: { gold: +5 }
            },
            {
                title: 'Kurt Sürüsü',
                text: 'Gece terk edilmiş kasabanın etrafında bir kurt sürüsü toplandı. Ulumaları sabaha kadar sürdü.',
                effects: { heart: -1, wood: -1 }
            },
            {
                title: 'Bereketli Yağmur',
                text: 'Günlerce süren yağmur toprağı canlandırdı. Kasabanın eski bahçelerinde yabani sebzeler filizlendi.',
                effects: { food: +4 }
            },
            {
                title: 'Rüzgarın Fısıltısı',
                text: 'Terk edilmiş evlerin arasından geçen rüzgar, eski bir günlüğü önüne savurdu. Sayfalarında yararlı bilgiler var.',
                effects: { gold: +1 }
            },
            {
                title: 'Devrilen Ağaç',
                text: 'Fırtına dev bir ağacı devirdi. Odun toplamak için harika bir fırsat!',
                effects: { wood: +6 }
            },
            {
                title: 'Yağmacı Kuşlar',
                text: 'Gece bir kuzgun sürüsü erzaklarını karıştırdı. Bir kısmını kaçırdılar.',
                effects: { food: -3 }
            },
            {
                title: 'Peri Pınarı',
                text: 'Kasabanın eski çeşmesinden hâlâ su akıyor. Büyülü bir parıltısı var. Suyu içince yaraların iyileşiyor.',
                effects: { heart: +1 }
            },
            {
                title: 'Göktaşı',
                text: 'Gece gökyüzünde bir ışık çizgisi belirdi. Yakınlara bir göktaşı düştü. Parçaları değerli metaller içeriyor.',
                effects: { gold: +4 }
            }
        ];

        if (this.triggeredEvents.length >= events.length) {
            this.triggeredEvents = [];
        }

        const available = events.filter((_, i) => !this.triggeredEvents.includes(i));
        const idx = Math.floor(Math.random() * available.length);
        const originalIdx = events.indexOf(available[idx]);
        this.triggeredEvents.push(originalIdx);

        return available[idx] || events[0];
    }
};
