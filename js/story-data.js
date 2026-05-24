/* ===== BIBIGAME - Hikaye Verileri ===== */

const STORY = {
    // Giriş hikayesi (oyun başında)
    intro: function(charNames) {
        var list = charNames.length > 1
            ? charNames.slice(0, -1).join(', ') + ' ve ' + charNames.slice(-1)
            : charNames[0];
        return 'Zeytin\'in karanlığı tüm toprakları sarmıştı. Siyah bir kedi, gözlerinde yıldızlar, pençelerinde karanlık.\n\n' +
            'Dünyanın 4 büyük kötüsünden biriydi. Ot içmeyi ve marul yemeyi severdi. Gaddardı.\n\n' +
            list + ' — onun zulmünden kaçıp bu terk edilmiş kasabaya sığındı.\n\n' +
            'Ama Zeytin\'in 5 tiranı etrafı sarmıştı. Kurtuluş yoktu.\nTek yol: tiranları tek tek alt etmek.\n\n' +
            'Ve sonra... Zeytin\'in kendisiyle yüzleşmek.';
    },

    // Boss savaşı öncesi
    bossIntro: function(boss, charNames) {
        var list = charNames.length > 1
            ? charNames.slice(0, -1).join(', ') + ' ve ' + charNames.slice(-1)
            : charNames[0];
        return boss.title + '\n\n' + boss.introText + '\n\n' +
            list + ' onunla yüzleşmek için ilerliyor...';
    },

    // Boss yenilince — sadece savaşan karakterlerin isimleri geçer
    bossDefeat: function(boss, charNames) {
        var list = charNames.length > 1
            ? charNames.slice(0, -1).join(', ') + ' ve ' + charNames.slice(-1)
            : charNames[0];
        return list + ' ' + boss.name + '\'i yendi!\n\n' + boss.deathLine + '\n\n' +
            'Kalan tiran sayısı: ' + (boss.order - 1);
    },

    // Zeytin final
    zeytinFinal: function(charNames) {
        var list = charNames.length > 1
            ? charNames.slice(0, -1).join(', ') + ' ve ' + charNames.slice(-1)
            : charNames[0];
        return list + ' Zeytin\'i yendi!\n\n' +
            '"Miyav... Bu sadece bir mola... İnsanlar... bitmedi..."\n\n' +
            '*Zeytin bir avuç ot alıp gölgelere karışır.*\n\n' +
            'Kasaba kurtuldu. En azından şimdilik.\n\n' +
            'Karanlık geri çekildi. Güneş ilk kez bulutların arasından süzüldü.\n\n' +
            'Ama ufukta... başka kedilerin gölgesi var.\n\n' +
            '=== SON ===';
    },

    // Hikaye başlığı
    title: 'Karanlık Çökerken',
    subtitle: 'Bir BIBIGAME Hikayesi'
};

function getStoryIntro(charNames) {
    return STORY.intro(charNames);
}

function getBossIntro(bossId, charNames) {
    var boss = getBossById(bossId);
    if (!boss) return '';
    return STORY.bossIntro(boss, charNames);
}

function getBossDefeat(bossId, charNames) {
    var boss = getBossById(bossId);
    if (!boss) return '';
    return STORY.bossDefeat(boss, charNames);
}

function getZeytinFinal(charNames) {
    return STORY.zeytinFinal(charNames);
}

console.log('Hikaye verileri yuklendi');
