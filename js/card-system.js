/* ===== BIBIGAME - Kart Sistemi ===== */

const CardSystem = {
    drawnCards: [],
    selectedChoice: null,
    waitingForPlayers: false,
    timerInterval: null,
    timeLeft: 0,
    timerTotal: 0,

    startTimer() {
        this.stopTimer();
        this.timerTotal = ConfigManager.getTimerSeconds();
        this.timeLeft = this.timerTotal;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.onTimerExpired();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    updateTimerDisplay() {
        const text = document.getElementById('timer-text');
        const circle = document.getElementById('timer-progress');
        if (!text || !circle) return;

        text.textContent = this.timeLeft;
        const totalLen = 2 * Math.PI * 20; // r=20
        const offset = totalLen * (1 - this.timeLeft / this.timerTotal);
        circle.setAttribute('stroke-dashoffset', offset);

        circle.classList.toggle('danger', this.timeLeft <= 15);
        circle.classList.toggle('warning', this.timeLeft > 15 && this.timeLeft <= 30);
    },

    onTimerExpired() {
        if (this.selectedChoice) return; // Zaten seçim yapıldı

        const character = Game.getPlayerCharacter();

        if (Game.isMultiplayer && Multiplayer && Multiplayer.connected) {
            // Multiplayer - rastgele seçim gönder
            const card = this.drawnCards[0];
            const choice = card.choices[Math.floor(Math.random() * card.choices.length)];
            this.selectedChoice = { card, choice, letter: '⏰' };
            const effects = this.computeEffects(card, choice, character);
            this.disableChoices();
            Multiplayer.send({
                type: 'card-choice',
                characterId: character.id,
                playerName: character.displayName || character.name,
                choiceText: choice.text,
                choiceIndex: card.choices.indexOf(choice),
                effects: effects
            });
            Game.log('⏰ Süre doldu! Rastgele seçim yapıldı.', '');
        } else {
            // Single player - rastgele seçim uygula
            const card = this.drawnCards[0];
            const choice = card.choices[Math.floor(Math.random() * card.choices.length)];
            this.selectedChoice = { card, choice, letter: '⏰' };
            this.applyChoiceToPlayer(card, choice, character);
        }
    },

    drawCards(category) {
        this.selectedChoice = null;
        this.stopTimer();

        var milestoneDays = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];
        var pool;
        // Gune ozel kart var mi?
        var dayCards = CARDS.filter(function(c) { return c.daySpecific === Game.day; });
        if (dayCards.length > 0 && Math.random() < 0.5) {
            pool = dayCards;
        } else if (milestoneDays.indexOf(Game.day) >= 0 && Game.timeOfDay === 'morning') {
            pool = CARDS.filter(function(c) { return c.category === 'milestone'; });
        } else {
            // Gune ozel kartlari normal havuzdan DISLA
            pool = CARDS.filter(function(c) { return c.category === category && !c.daySpecific; });
        }

        if (pool.length === 0) {
            pool = CARDS.filter(function(c) { return c.category !== 'milestone' && !c.daySpecific; });
        }

        let available = pool.filter(c => !Game.usedCards.includes(c.id));
        if (available.length === 0) {
            // Kader kartlari hicbir zaman tekrar etmez — baska havuzdan cek
            if (category === 'kader') {
                pool = CARDS.filter(function(c) { return c.category !== 'milestone' && c.category !== 'kader' && !c.daySpecific; });
                available = pool.filter(function(c) { return !Game.usedCards.includes(c.id); });
                if (available.length === 0) available = pool;
            } else {
                // Diger kategoriler: sadece bu kategoriyi sifirla
                var poolIds = pool.map(function(c) { return c.id; });
                Game.usedCards = Game.usedCards.filter(function(id) { return !poolIds.includes(id); });
                available = pool;
            }
        }

        // Nadirlige gore agirlikli secim
        const rarityRoll = Math.random() * 100;
        let targetRarity;
        if (rarityRoll < 60) targetRarity = 'common';
        else if (rarityRoll < 85) targetRarity = 'rare';
        else if (rarityRoll < 97) targetRarity = 'epic';
        else targetRarity = 'legendary';

        let filtered = available.filter(c => c.rarity === targetRarity);
        if (filtered.length === 0) {
            filtered = available.filter(c => c.rarity === 'common');
        }
        if (filtered.length === 0) {
            filtered = available;
        }

        const drawn = filtered[Math.floor(Math.random() * filtered.length)];
        Game.usedCards.push(drawn.id);

        this.drawnCards = [drawn];
        this.renderScenario(drawn);
        this.renderChoices(drawn);
        this.startTimer();
    },

    generateResultNarrative(effects) {
        if (!effects) return '';
        const p = [];
        const ef = effects;
        if (ef.heart && ef.heart > 0) p.push(`${ef.heart} kalp kazandin`);
        if (ef.heart && ef.heart < 0) p.push(`${Math.abs(ef.heart)} kalp kaybettin`);
        if (ef.food && ef.food > 0) p.push(`${ef.food} yemek buldun`);
        if (ef.food && ef.food < 0) p.push(`${Math.abs(ef.food)} yemek kaybettin`);
        if (ef.wood && ef.wood > 0) p.push(`${ef.wood} odun topladin`);
        if (ef.wood && ef.wood < 0) p.push(`${Math.abs(ef.wood)} odun harcadin`);
        if (ef.gold && ef.gold > 0) p.push(`${ef.gold} altin kazandin`);
        if (ef.gold && ef.gold < 0) p.push(`${Math.abs(ef.gold)} altin kaybettin`);
        return p.length > 0 ? p.join('. ') + '.' : 'Secimin sonuclandi.';
    },

    renderScenario(card) {
        var st = document.getElementById('scenario-text');
        if (st) st.textContent = card.scenario || '';
        // Nadirlik gostergesi
        const rarityEl = document.getElementById('scenario-rarity');
        if (rarityEl) {
            const labels = { common: 'Yaygın', rare: 'Nadir', epic: 'Epik', legendary: 'Efsanevi' };
            const colors = { common: '#aaa', rare: '#5b9bd5', epic: '#c060e0', legendary: '#ff8800' };
            rarityEl.textContent = labels[card.rarity] || '';
            rarityEl.style.color = colors[card.rarity] || '#aaa';
        }

        // Kart resmi (config'ten)
        const img = document.getElementById('scenario-image');
        if (img) {
            const cardImgPath = ConfigManager.getCardImagePath(card.id);
            if (cardImgPath) {
                img.src = cardImgPath;
                img.style.display = 'block';
                img.onerror = function() { img.style.display = 'none'; };
                img.onload = function() { img.style.display = 'block'; };
            } else {
                img.style.display = 'none';
            }
        }

        // Nadirlik ikonu (config'ten) — resim veya emoji
        var iconEl = document.getElementById('scenario-icon');
        if (iconEl) {
            var rarityIcon = ConfigManager.getRarityIcon(card.rarity);
            if (rarityIcon && rarityIcon.match && rarityIcon.match(/\.(png|jpg|jpeg|gif|webp)/i)) {
                iconEl.innerHTML = '<img src=\"' + rarityIcon + '\" style=\"max-width:48px;max-height:48px;\">';
            } else {
                iconEl.textContent = rarityIcon || '📜';
            }
            iconEl.title = (card.rarity || '') + ' - ' + (card.category || '');
        }

        // Kart arka plan (config'ten)
        var box = document.getElementById('scenario-box');
        if (box) {
            var bgUrl = (CONFIG && CONFIG.cardBackgrounds) ? (CONFIG.cardBackgrounds[card.rarity] || '') : '';
            if (bgUrl && bgUrl.length > 1) {
                box.style.background = 'url(' + bgUrl + ') center/cover no-repeat';
                box.style.backgroundColor = 'rgba(20,16,12,0.85)';
                box.style.backgroundBlendMode = 'overlay';
            } else {
                box.style.background = '';
                box.style.backgroundImage = '';
                box.style.backgroundColor = '';
                box.style.backgroundBlendMode = '';
            }
            Animations.cardDeal(box);
        }

        // Kart alanini goster
        var cardArea = document.getElementById('card-area');
        if (cardArea) cardArea.style.display = '';
    },

    renderChoices(card) {
        const container = document.getElementById('choices-container');
        container.innerHTML = '';
        container.className = '';
        const letters = ['A', 'B', 'C', 'D'];

        card.choices.forEach((choice, i) => {
            const el = document.createElement('div');
            el.className = 'choice-card';
            el.innerHTML = `
                <span class="choice-letter">${letters[i]}</span>
                <span class="choice-text">${choice.text}</span>
                ${choice.hint ? `<span class="choice-hint">${choice.hint}</span>` : ''}
            `;

            el.addEventListener('click', (function(cardRef, choiceRef, letterRef) {
                return function(e) {
                    if (Game.isOver) return;
                    try { AudioManager.playCardDraw(); } catch(ignored) {}
                    CardSystem.handleChoice(cardRef, choiceRef, letterRef);
                };
            })(card, choice, letters[i]));

            container.appendChild(el);
            Animations.cardDeal(el);
        });
    },

    handleChoice(card, choice, letter) {
        if (Game.isOver) return;
        if (this.selectedChoice) return;

        this.stopTimer();
        this.selectedChoice = { card, choice, letter };
        Game.log('Secim yapildi: ' + (choice.text || ''), '');

        const character = Game.getPlayerCharacter();
        if (!character) { Game.log('HATA: Karakter bulunamadi!', 'negative'); return; }

        // Single player - direkt uygula
        if (!Game.isMultiplayer || !Multiplayer || !Multiplayer.connected) {
            this.applyChoiceToPlayer(card, choice, character);
            return;
        }

        // Multiplayer: sunucuya gonder, bekle
        const effects = this.computeEffects(card, choice, character);
        this.disableChoices();
        Multiplayer.send({
            type: 'card-choice',
            characterId: character.id,
            playerName: character.displayName || character.name,
            choiceText: choice.text,
            choiceIndex: card.choices.indexOf(choice),
            effects: effects
        });
    },

    disableChoices() {
        document.querySelectorAll('.choice-card').forEach(el => {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
        });
    },

    enableChoices() {
        document.querySelectorAll('.choice-card').forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        });
    },

    // Multiplayer'da all-choices-in gelince çağrılır
    applyAllChoices(choicesData) {
        choicesData.forEach(data => {
            const character = Game.characters.find(c => c.id === data.characterId);
            if (character && data.effects) {
                Game.recordChoice(data.playerName, data.choiceText, data.effects);
                Game.log(`${data.playerName}: "${data.choiceText}" seçti.`, '');
                Game.applyEffects(data.effects, character);
            }
        });

        this.enableChoices();

        // Her oyuncunun secimi ve efektleriyle sonuc
        var allEffects = { heart: 0, food: 0, wood: 0, gold: 0 };
        choicesData.forEach(function(data) {
            if (data.effects) {
                if (data.effects.heart) allEffects.heart += data.effects.heart;
                if (data.effects.food) allEffects.food += data.effects.food;
                if (data.effects.wood) allEffects.wood += data.effects.wood;
                if (data.effects.gold) allEffects.gold += data.effects.gold;
            }
        });
        var resultText = choicesData.map(function(d) {
            var effStr = CardSystem.generateResultNarrative(d.effects || {});
            return d.playerName + ': "' + d.choiceText + '" → ' + effStr;
        }).join('\n');

        Game.showResult('Tur Tamamlandı', resultText, allEffects);

        var continueBtn = document.getElementById('btn-result-continue');
        if (continueBtn) {
            continueBtn.onclick = function() {
                Game.hideResult();
                var ch = Game.getPlayerCharacter();
                if (ch) Game.afterAction(ch, null, null, Game.currentActionType);
            };
        }
    },

    computeEffects(card, choice, character) {
        const effects = { ...choice.effects };

        // Karakter bonus kontrolü
        if (card.characterBonus && card.characterBonus[character.id]) {
            Object.keys(card.characterBonus[character.id]).forEach(k => {
                effects[k] = (effects[k] || 0) + card.characterBonus[character.id][k];
            });
        }

        // İrem sinerjisi
        if (character.id === 'irem' && effects.heart && effects.heart > 0) {
            const gokdeniz = Game.aliveCharacters.find(c => c.id === 'gokdeniz');
            if (gokdeniz) { effects.heart *= 2; }
        }

        // Gökdeniz sinerjisi
        if (character.id === 'gokdeniz' && choice.effects.heart && choice.effects.heart < 0) {
            const irem = Game.aliveCharacters.find(c => c.id === 'irem');
            if (irem) { effects.heart = Math.ceil(effects.heart / 2); }
        }

        // Noyan & Begül sinerjisi
        if ((character.id === 'noyan' || character.id === 'begul') && Math.random() < 0.5) {
            const other = character.id === 'noyan' ? 'begul' : 'noyan';
            const partner = Game.aliveCharacters.find(c => c.id === other);
            if (partner && effects.heart && effects.heart < 0) { effects.heart = 0; }
        }

        // Cansın & Gunda sinerjisi
        if ((character.id === 'cansin' || character.id === 'gunda')) {
            const other = character.id === 'cansin' ? 'gunda' : 'cansin';
            const partner = Game.aliveCharacters.find(c => c.id === other);
            if (partner && effects.heart && effects.heart < 0) { effects.heart = Math.ceil(effects.heart * 0.7); }
        }

        // Dominic aile gücü
        if (character.id === 'dominic') {
            const familyCount = Game.aliveCharacters.length;
            if (familyCount > 1 && effects.gold) { effects.gold += familyCount; }
        }

        // --- Kalp dengeleme (nadirlige gore) ---
        if (effects.heart && effects.heart > 0) {
            if (card.rarity === 'common') {
                effects.heart = Math.max(0, effects.heart - 1); // common max +1
            } else if (card.rarity === 'rare' && Math.random() < 0.5) {
                effects.heart = Math.max(0, effects.heart - 1); // rare %50 dusur
            }
            // epic: oldugu gibi
        }
        // legendary kalp kaybini azalt, kazanci artir
        if (card.rarity === 'legendary') {
            if (effects.heart && effects.heart < 0) {
                effects.heart = Math.ceil(effects.heart / 2); // yari hasar
            } else if (effects.heart && effects.heart > 0) {
                effects.heart += 1; // +1 bonus
            }
        }

        return effects;
    },

    applyChoiceToPlayer(card, choice, character) {
        if (!character) { Game.log('HATA: applyChoice - karakter null', 'negative'); return; }
        if (character.hearts <= 0) { Game.log('HATA: applyChoice - karakter ölü', 'negative'); return; }
        try {
            const effects = this.computeEffects(card, choice, character);
            Game.recordChoice(character.displayName || character.name, choice.text, effects);
            Game.unlockRegion(card.category);
            Game.log(character.displayName || character.name + ': "' + (choice.text || '') + '" secti.', '');
            Game.applyEffects(effects, character);
            this.disableChoices();

            const narrative = choice.result || this.generateResultNarrative(effects);
            Game.showResult('Secim Yapildi', (character.displayName || character.name) + ': "' + (choice.text || '') + '"\n\n' + narrative, effects);

            var continueBtn = document.getElementById('btn-result-continue');
            if (continueBtn) {
                continueBtn.onclick = function() {
                    Game.hideResult();
                    Game.afterAction(character, card, choice);
                };
            } else {
                Game.log('UYARI: btn-result-continue bulunamadi, 2sn sonra devam ediliyor...', '');
                var self = this;
                setTimeout(function() {
                    Game.hideResult();
                    Game.afterAction(character, card, choice);
                }, 2000);
            }
        } catch(err) {
            Game.log('KART HATASI: ' + (err.message || err), 'negative');
            Game.afterAction(character, card, choice);
        }
    }
};
