/* ===== BIBIGAME - Sıra Tabanlı Dövüş (Çoklu Canavar & Skill) ===== */

const CombatSystem = {
    state: 'IDLE',
    monsters: [],
    monsterIndex: 0,
    character: null,
    playerHp: 0, playerMaxHp: 0,
    playerMana: 0, playerMaxMana: 0,
    combatLog: [],
    turnCount: 0, fled: false, playerFirst: true,
    playerSkills: [],
    skillCooldowns: {},
    usedSkillsThisTurn: [], // bu tur kullanılan skill ID'leri
    activeBuffs: {}, activeDebuffs: {},
    petActive: false, petDamage: 0,

    rollD20() { return Math.floor(Math.random() * 20) + 1; },
    rollD(s) { return Math.floor(Math.random() * s) + 1; },

    // Vuruş efekti: ekran sarsıntısı + kırmızı flaş + slash + partikül + hasar yazısı
    hitEffect(targetEl, dmg, isCrit, dmgType) {
        if (!targetEl) return;

        // 1. Tüm combat alanını sars
        var combatArea = document.getElementById('combat-area');
        if (combatArea) {
            combatArea.classList.remove('screen-shake','heavy-shake');
            void combatArea.offsetWidth;
            combatArea.classList.add(isCrit ? 'heavy-shake' : 'screen-shake');
            setTimeout(function() { combatArea.classList.remove('screen-shake','heavy-shake'); }, 750);
        }

        // 2. Kırmızı flaş vignette
        var vignette = document.createElement('div');
        vignette.className = 'hit-vignette';
        document.body.appendChild(vignette);
        setTimeout(function() { if (vignette.parentNode) vignette.parentNode.removeChild(vignette); }, 450);

        // 3. Hedefi salla/büyüt
        targetEl.classList.remove('target-hit','hit-flash');
        void targetEl.offsetWidth;
        targetEl.classList.add('target-hit');
        targetEl.classList.add('hit-flash');
        setTimeout(function() { targetEl.classList.remove('target-hit','hit-flash'); }, 450);

        // 4. Slash (fiziksel) veya büyü patlaması (magic)
        if (dmgType === 'magic') {
            this._addMagicBurst(targetEl);
        } else {
            this._addSlash(targetEl, isCrit);
        }

        // 5. Kıvılcım partikülleri (2x sayı)
        this._spawnSparks(targetEl,
            dmgType === 'magic' ? 'purple' : (dmgType === 'heal' ? 'green' : 'orange'),
            isCrit ? 18 : 10);

        // 6. Hasar yazısı
        if (dmg > 0) {
            var floatEl = document.createElement('div');
            floatEl.className = 'dmg-float' + (isCrit ? ' crit' : '');
            floatEl.textContent = (isCrit ? '💥 ' : '') + '-' + dmg;
            targetEl.style.position = targetEl.style.position || 'relative';
            targetEl.appendChild(floatEl);
            setTimeout(function() { if (floatEl.parentNode) floatEl.parentNode.removeChild(floatEl); }, 1100);
        }
    },

    // Boss vuruş efekti
    hitBossEffect(dmg, isCrit) {
        var bossEl = document.getElementById('boss-main-box');
        if (bossEl) this.hitEffect(bossEl, dmg, isCrit, 'physical');
    },

    // --- İç efekt yardımcıları ---

    _addSlash(targetEl, isCrit) {
        var slash = document.createElement('div');
        slash.className = 'combat-slash' + (isCrit ? ' crit' : '');
        targetEl.appendChild(slash);
        setTimeout(function() { if (slash.parentNode) slash.parentNode.removeChild(slash); }, 500);
    },

    _addMagicBurst(targetEl) {
        var burst = document.createElement('div');
        burst.className = 'magic-burst';
        targetEl.appendChild(burst);
        setTimeout(function() { if (burst.parentNode) burst.parentNode.removeChild(burst); }, 600);
    },

    _spawnSparks(targetEl, color, count) {
        var rect = targetEl.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var colors = {
            orange: ['#ffaa44','#ffcc66','#ff8800','#ffffff','#ffdd88','#ff6600'],
            purple: ['#c880ff','#e0a0ff','#aa40ff','#ffffff','#d080ff','#9933ff'],
            green: ['#80ff80','#a0ffa0','#40ff40','#ffffff','#80ffaa','#22cc44'],
            blue: ['#80a0ff','#a0c0ff','#4080ff','#ffffff','#80c0ff','#3366ff'],
            red: ['#ff6060','#ff8080','#ff2020','#ffffff','#ff4444','#ff0000']
        };
        var palette = colors[color] || colors.orange;
        for (var i = 0; i < count; i++) {
            var spark = document.createElement('div');
            spark.className = 'combat-spark';
            spark.style.left = cx + 'px';
            spark.style.top = cy + 'px';
            spark.style.backgroundColor = palette[Math.floor(Math.random() * palette.length)];
            var size = 3 + Math.random() * 8;
            spark.style.width = size + 'px';
            spark.style.height = size + 'px';
            var angle = Math.random() * Math.PI * 2;
            var dist = 30 + Math.random() * 80;
            spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
            spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
            document.body.appendChild(spark);
            setTimeout(function() { if (spark.parentNode) spark.parentNode.removeChild(spark); }, 650);
        }
    },

    // Buff görsel efekti
    _applyBuffGlow(targetEl, buffType) {
        if (!targetEl) return;
        targetEl.classList.remove('shield-glow','rage-glow','magic-glow');
        void targetEl.offsetWidth;
        if (buffType === 'def' || buffType === 'shield') {
            targetEl.classList.add('shield-glow');
        } else if (buffType === 'atk' || buffType === 'rage') {
            targetEl.classList.add('rage-glow');
        } else if (buffType === 'mag' || buffType === 'magic') {
            targetEl.classList.add('magic-glow');
        }
    },

    _clearBuffGlow(targetEl) {
        if (!targetEl) return;
        targetEl.classList.remove('shield-glow','rage-glow','magic-glow');
    },

    // İyileşme efekti
    _playHealEffect(targetEl, amount) {
        if (!targetEl) return;
        targetEl.classList.remove('heal-glow');
        void targetEl.offsetWidth;
        targetEl.classList.add('heal-glow');
        this._spawnSparks(targetEl, 'green', 8);
        if (amount > 0) {
            var floatEl = document.createElement('div');
            floatEl.className = 'dmg-float heal';
            floatEl.textContent = amount + '';
            targetEl.style.position = targetEl.style.position || 'relative';
            targetEl.appendChild(floatEl);
            setTimeout(function() { if (floatEl.parentNode) floatEl.parentNode.removeChild(floatEl); }, 1100);
        }
        setTimeout(function() { targetEl.classList.remove('heal-glow'); }, 900);
    },

    // Debuff efekti
    _playDebuffEffect(targetEl) {
        if (!targetEl) return;
        targetEl.classList.remove('debuff-overlay');
        void targetEl.offsetWidth;
        targetEl.classList.add('debuff-overlay');
        this._spawnSparks(targetEl, 'purple', 5);
        setTimeout(function() { targetEl.classList.remove('debuff-overlay'); }, 900);
    },

    // Arena çapında flaş
    _playArenaFlash(color) {
        var flash = document.createElement('div');
        flash.className = 'arena-flash ' + (color || 'red');
        document.body.appendChild(flash);
        setTimeout(function() { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 600);
    },

    // Pasif efektini oku
    getPassive(char) {
        var fullChar = getCharacterById(char.id) || char;
        return fullChar.passive || null;
    },

    getBaseStats(char) {
        if (!char) { return { hp: 500, atk: 10, def: 10, spd: 10, mag: 10, mr: 0, crit: 0 }; }
        var fullChar = getCharacterById(char.id) || char;
        var srcStats = (char.combatStats && char.combatStats.hp) ? char.combatStats : (fullChar.combatStats || char.combatStats || { hp: 500, atk: 10, def: 10, spd: 10, mag: 10 });
        var s = { ...srcStats };
        var ids = Game.aliveCharacters.map(function(c) { return c.id; });
        if (char.id === 'gokdeniz' && ids.indexOf('irem') >= 0) s.atk += 2;
        if (char.id === 'noyan' && ids.indexOf('begul') >= 0) s.mag += 2;
        if (char.id === 'begul' && ids.indexOf('noyan') >= 0) s.mag += 1;
        if ((char.id === 'cansin' || char.id === 'gunda') && ids.indexOf(char.id === 'cansin' ? 'gunda' : 'cansin') >= 0) { s.def += 1; s.atk += 1; }

        // Ekipman bonusları (karakterin _inv'sinden oku)
        var charInv = char._inv || {};
        var charEquip = charInv.equipment || Game.equipment || {};
        if (charEquip) {
            var self = this;
            var eqPieces = [];
            Object.keys(charEquip).forEach(function(slot) {
                var eqId = charEquip[slot];
                if (eqId) {
                    var item = getEquipmentById(eqId) || getArtifactById(eqId);
                    if (item && item.stats) {
                        if (getSetByPieceId(eqId)) eqPieces.push({ id: eqId, set: getSetByPieceId(eqId) });
                        Object.keys(item.stats).forEach(function(stat) {
                            s[stat] = (s[stat] || 0) + item.stats[stat];
                        });
                    }
                }
            });
            // Artifact set bonusları
            var artSetCounts = {};
            Object.values(charEquip).forEach(function(eqId) {
                if (!eqId) return;
                var art = getArtifactById(eqId);
                if (art && art.setId) artSetCounts[art.setId] = (artSetCounts[art.setId] || 0) + 1;
            });
            Object.keys(artSetCounts).forEach(function(setId) {
                if (artSetCounts[setId] >= 2) {
                    var bonus = ARTIFACTS.find(function(a){return a.setId===setId && a.setBonus;});
                    if (bonus && bonus.setBonus) {
                        Object.keys(bonus.setBonus).forEach(function(k) {
                            if (k !== 'desc' && typeof bonus.setBonus[k] === 'number') s[k] = (s[k] || 0) + bonus.setBonus[k];
                        });
                    }
                }
            });
            // Set bonusları
            var setCounts = {};
            eqPieces.forEach(function(p) { if (p.set) setCounts[p.set.name] = (setCounts[p.set.name] || 0) + 1; });
            Object.keys(setCounts).forEach(function(setName) {
                var count = setCounts[setName];
                var set = EQUIPMENT_SETS.find(function(x) { return x.name === setName; });
                if (!set) return;
                if (count >= 2) {
                    if (set.bonus2.atk) s.atk = (s.atk || 0) + (set.bonus2.atk || 0);
                    if (set.bonus2.def) s.def = (s.def || 0) + (set.bonus2.def || 0);
                    if (set.bonus2.mr) s.mr = (s.mr || 0) + (set.bonus2.mr || 0);
                    if (set.bonus2.mag) s.mag = (s.mag || 0) + (set.bonus2.mag || 0);
                    if (set.bonus2.spd) s.spd = (s.spd || 0) + (set.bonus2.spd || 0);
                    if (set.bonus2.hp) s.hp = (s.hp || 0) + (set.bonus2.hp || 0);
                    if (set.bonus2.crit) s.crit = (s.crit || 0) + (set.bonus2.crit || 0);
                }
                if (count >= 4) {
                    if (set.bonus4.atk) s.atk = (s.atk || 0) + (set.bonus4.atk || 0);
                    if (set.bonus4.def) s.def = (s.def || 0) + (set.bonus4.def || 0);
                    if (set.bonus4.mr) s.mr = (s.mr || 0) + (set.bonus4.mr || 0);
                    if (set.bonus4.mag) s.mag = (s.mag || 0) + (set.bonus4.mag || 0);
                    if (set.bonus4.spd) s.spd = (s.spd || 0) + (set.bonus4.spd || 0);
                    if (set.bonus4.hp) s.hp = (s.hp || 0) + (set.bonus4.hp || 0);
                    if (set.bonus4.crit) s.crit = (s.crit || 0) + (set.bonus4.crit || 0);
                }
            });
        }
        return s;
    },

    getEffectiveStats(char) {
        var s = this.getBaseStats(char);
        var self = this;
        Object.keys(this.activeBuffs).forEach(function(k) { if (s[k] !== undefined) s[k] += (self.activeBuffs[k].value || 0); });
        return s;
    },

    // --- Combat Başlat ---

    // Klavye kısayolları (sadece bir kere)
    _keyboardInited: false,
    initKeyboard() {
        if (this._keyboardInited) return;
        this._keyboardInited = true;
        var self = this;
        document.addEventListener('keydown', function(e) {
            if (self.state !== 'PLAYER_TURN') return;
            var key = e.key.toLowerCase();
            var hotkeys = ['q','e','f','g','r','t'];
            var idx = hotkeys.indexOf(key);
            if (idx >= 0) {
                e.preventDefault();
                var skills = self.isBossFight ? ((self.fighters[self.currentFighterIndex] || {}).skills || []) : self.playerSkills;
                if (skills.length > idx) {
                    self.isBossFight ? self.useBossSkill(skills[idx].id) : self.useSkill(skills[idx].id);
                }
            }
        });
    },

    startCombat(character) {
        if (this.state !== 'IDLE') { this.hide(); }
        this.character = character;
        this.isBossFight = false;
        this.fighters = [];
        this.initKeyboard();
        // Canavar grubu oluştur (1-3 tane)
        this.monsters = [];
        var count = Math.random() < 0.3 ? 2 : 1;
        if (Game.day > 20 && Math.random() < 0.4) count = Math.random() < 0.3 ? 3 : 2;
        for (var i = 0; i < count; i++) {
            var m = getRandomMonster(Game.day);
            m.currentHp = m.hp;
            m.maxHp = m.hp;
            m.index = i;
            this.monsters.push(m);
        }
        this.monsterIndex = 0;
        this.combatLog = [];
        this.turnCount = 0; this.fled = false;
        this.activeBuffs = {}; this.activeDebuffs = {}; this.skillCooldowns = {}; this.usedSkillsThisTurn = [];
        this.petActive = false; this.petDamage = 0;

        var base = this.getBaseStats(character);
        this.playerMaxHp = base.hp; this.playerHp = base.hp;
        this.playerMaxMana = character.id === 'irem' ? 4 : Math.max(1, Math.floor(base.mag / 3));
        this.playerMana = this.playerMaxMana;
        this.playerFirst = base.spd >= (this.monsters[0].speed || 8);

        this.playerSkills = [];
        var basicNames = { irem: 'Asa Vuruşu', gokdeniz: 'Kılıç Darbesi', noyan: 'Kaptan Kancası', begul: 'Rün Tokmağı', bedrican: 'Taş Yumruk', cansin: 'Pençe', gunda: 'Toprak Yumruğu', dominic: 'Aile Darbesi', bulent: 'Diva Tokadı' };
        this.playerSkills.push({ id: 'basic', name: basicNames[character.id] || 'Temel Vuruş', type: 'physical', scaleStat: 'atk', scaleFactor: 1.0, baseEffect: 0, manaCost: 0, cooldown: 0, target: 'enemy', description: 'ATK×1 + d20.', rarity: 'character', characterId: null });
        // Karakterin kendi skill'lerini oku (_inv veya Game uzerinden)
        var charInv = character._inv || {};
        var skillsToLoad = (charInv.equippedSkills && charInv.equippedSkills.length > 0) ? charInv.equippedSkills : (Game.equippedSkills && Game.equippedSkills.length > 0) ? Game.equippedSkills : (character.characterSkills || []);
        var self = this;
        skillsToLoad.forEach(function(sid) { var sk = getSkillById(sid); if (sk) self.playerSkills.push(sk); });

        this.state = 'INTRO';
        this._skillsBuilt = false;
        this._skillBtns = {};
        this.show();
        MusicPlayer.playCategory('battle');
        var mNames = this.monsters.map(function(m) { return m.name; }).join(', ');
        this.addLog(mNames + ' ortaya cikti! (' + this.monsters.length + ' dusman)', 'intro');

        setTimeout(function() {
            if (self.playerFirst) {
                self.addLog('Daha hizlisin! Ilk sen basliyorsun.', 'player');
                self.startPlayerTurn();
            } else {
                self.addLog(mNames + ' daha hizli!', 'monster');
                self.state = 'MONSTER_TURN';
                self.render();
                setTimeout(function() { self.monstersAttack(); }, 800);
            }
        }, 1500);
    },

    startPlayerTurn() {
        this.state = 'PLAYER_TURN';
        this.usedSkillsThisTurn = [];
        this.playerMana = this.playerMaxMana;
        // Bora pasifi: her tur +2 MAG
        var pass = this.getPassive(this.character);
        if (pass && pass.effect === 'rhythmMag') {
            if (!this._rhythmStacks) this._rhythmStacks = 0;
            if (this._rhythmStacks < 20) this._rhythmStacks += 2;
            this.activeBuffs.mag = { value: this._rhythmStacks, turns: 99 };
            this.addLog('Ritim: +' + this._rhythmStacks + ' MAG!', 'buff');
        }
        this.render();
        this.enableButtons();
        this.addLog('Sirasi sende. Mana: ' + this.playerMana + '/' + this.playerMaxMana, 'player');
    },

    // --- Skill Kullanımı ---

    canUseSkill(skill) {
        if (this.state !== 'PLAYER_TURN') return false;
        if (skill.manaCost > this.playerMana) return false;
        if (skill.cooldown > 0 && this.skillCooldowns[skill.id] && this.skillCooldowns[skill.id] > 0) return false;
        // Double-cast kontrolü: Sonsuzluk 4-parca bonusu varsa aynı skill 2 kere
        var hasDoubleCast = this.hasSetBonus('doubleCast');
        if (this.usedSkillsThisTurn.indexOf(skill.id) >= 0 && !hasDoubleCast) return false;
        // Aynı skill en fazla 2 kere (double-cast ile)
        if (hasDoubleCast && this.usedSkillsThisTurn.filter(function(s) { return s === skill.id; }).length >= 2) return false;
        if (skill.target !== 'all_enemies' && skill.target !== 'all_allies' && this.getAliveMonsters().length === 0) return false;
        return true;
    },

    hasSetBonus(specialName) {
        var charInv2 = (this.character && this.character._inv) ? this.character._inv : {};
        var chEq = charInv2.equipment || {};
        var setCounts = {};
        Object.values(chEq).forEach(function(eqId) {
            if (eqId) {
                var set = getSetByPieceId(eqId);
                if (set) setCounts[set.name] = (setCounts[set.name] || 0) + 1;
            }
        });
        for (var setName in setCounts) {
            if (setCounts[setName] >= 4) {
                var set = EQUIPMENT_SETS.find(function(s) { return s.name === setName; });
                if (set && set.bonus4 && set.bonus4.special === specialName) return true;
            }
        }
        return false;
    },

    getAliveMonsters() {
        return this.monsters.filter(function(m) { return m.currentHp > 0; });
    },

    useSkill(skillId) {
        if (this.state !== 'PLAYER_TURN') return;
        var self = this;
        var skill = skillId === 'basic' ? this.playerSkills[0] : getSkillById(skillId);
        if (!skill || !this.canUseSkill(skill)) {
            this.addLog(skill ? skill.name + ' kullanilamaz!' : 'Skill bulunamadi!', 'miss');
            return;
        }

        this.playerMana -= skill.manaCost;
        this.usedSkillsThisTurn.push(skill.id);
        if (skill.cooldown > 0) this.skillCooldowns[skill.id] = skill.cooldown;
        this.turnCount++;

        var stats = this.getEffectiveStats(this.character);
        var alive = this.getAliveMonsters();

        this.addLog(skill.name + '!', 'player');

        // Hedef seçimi: alive[0] default, AoE için tümü
        var target = skill.target === 'all_enemies' ? null : (alive[0] || this.monsters[0]);
        var passive = this.getPassive(this.character);
        // Gökdeniz pasifi: %50 çift tetiklenme
        var doubleCast = (passive && passive.effect === 'doubleCast' && Math.random() < 0.5);

        var isCrit = false;
        var critChance = stats.crit || Math.floor((stats.spd || 10) / 2);
        if (Math.random() * 100 < critChance) isCrit = true;

        var dmg = 0, heal = 0, isBasic = skillId === 'basic';

        // Hasar hesaplama: stat × factor (tam), kritik ise ×1.75
        var calcDmg = function(baseStat, factor, baseBonus) {
            var total = Math.round(baseStat * factor) + (baseBonus || 0);
            if (isCrit) { total = Math.round(total * 1.75); self.addLog('KRiTiK! %75 bonus!', 'crit'); }
            return Math.max(1, total);
        };

        switch (skill.type) {
            case 'physical':
                if (isBasic) { dmg = calcDmg(stats.atk, 1.0, 0); }
                else { dmg = calcDmg(stats[skill.scaleStat], skill.scaleFactor, skill.baseEffect); }
                if (skillId === 'gok_04' && this.playerHp < this.playerMaxHp * 0.3) dmg = calcDmg(stats.atk, 4.0, 0);
                if (skillId === 'bed_05' && this.playerHp < this.playerMaxHp * 0.4) dmg = calcDmg(stats.atk, 3.5, 0);
                if (skillId === 'bul_04' && this.playerHp < this.playerMaxHp * 0.2) dmg = calcDmg(stats.atk, 5.0, 0);
                if (skillId === 'dom_01') dmg = calcDmg(stats.atk, 2 + Game.aliveCharacters.length * 0.1, 0);
                if (skillId === 'gok_02') { dmg = calcDmg(stats.atk, 3.0, 0); this.playerHp = Math.max(0, this.playerHp - Math.round(this.playerMaxHp * 0.1)); this.addLog('Geri tepme!', 'monster-hit'); }
                if (skillId === 'bul_02') { dmg = calcDmg(stats.atk, 2.5, 0); this.playerHp = Math.max(0, this.playerHp - Math.round(this.playerMaxHp * 0.2)); }
                if (skillId === 'dom_05') { dmg = calcDmg(stats.atk, 3.0, 0); this.activeBuffs.def = { value: -5, turns: 1 }; }
                if (skill.target === 'all_enemies') {
                    this.applyAoEDamage(dmg, 'physical', passive);
                } else if (target) {
                    this.applyDamageToMonster(target, dmg, 'physical', passive);
                }
                // Gökdeniz double cast
                if (doubleCast && this.bossHp === undefined) {
                    this.addLog('Pasif: Cift tetiklenme!', 'buff');
                    if (skill.target === 'all_enemies') this.applyAoEDamage(dmg, 'physical', passive);
                    else if (target) this.applyDamageToMonster(target, dmg, 'physical', passive);
                }
                break;
            case 'magic':
                dmg = calcDmg(stats.mag, skill.scaleFactor, skill.baseEffect);
                if (skill.target === 'all_enemies') {
                    this.applyAoEDamage(dmg, 'magic', passive);
                } else if (target) {
                    this.applyDamageToMonster(target, dmg, 'magic', passive);
                }
                // Noyan pasifi: su büyüleri %10 iyileştirir
                if (passive && passive.effect === 'waterHeal') {
                    var waterHeal = Math.round(dmg * 0.1);
                    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + waterHeal);
                    this.addLog('Su Emici: +' + waterHeal + ' HP', 'heal');
                }
                // Furkan pasifi: hasarın %25i kadar iyileş
                if (passive && passive.effect === 'vampiricTouch' && dmg > 0) {
                    var vampHeal = Math.round(dmg * 0.25);
                    if (vampHeal > 0) {
                        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + vampHeal);
                        this.addLog('Kan Calma: +' + vampHeal + ' HP', 'heal');
                        this._playHealEffect(document.getElementById('combat-player-box'), vampHeal);
                    }
                }
                break;
            case 'heal':
                heal = Math.round(stats.mag * skill.scaleFactor) + skill.baseEffect;
                if (passive && passive.effect === 'potionMaster') heal = Math.round(heal * 1.25);
                if (skill.target === 'all_allies') {
                    heal = Math.round(stats.mag * skill.scaleFactor);
                    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
                    this.addLog('Tum takim ' + heal + ' HP iyilesti!', 'heal');
                } else {
                    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
                    this.addLog(heal + ' HP iyilestin!', 'heal');
                }
                this._playHealEffect(document.getElementById('combat-player-box'), heal);
                break;
            case 'buff':
                var bufStat = skill.scaleStat;
                var bufVal = skill.baseEffect || Math.round(stats[bufStat] * 0.3);
                var bufTurns = Math.max(1, skill.cooldown - 1);
                if (skillId === 'gok_03') { bufStat = 'atk'; bufVal = 3; bufTurns = 2; }
                if (skillId === 'ire_02') { bufStat = 'def'; bufVal = 100; bufTurns = 2; this.addLog('2 tur tum hasari engeller!', 'buff'); }
                if (skillId === 'gok_05') { bufStat = 'def'; bufVal = 50; bufTurns = 1; }
                if (skillId === 'beg_01') { var r = ['atk', 'def', 'spd'][Math.floor(Math.random() * 3)]; bufStat = r; bufVal = 3; }
                this.activeBuffs[bufStat] = { value: bufVal, turns: bufTurns };
                this.addLog(bufStat.toUpperCase() + ' +' + bufVal + ' (' + bufTurns + ' tur)', 'buff');
                this._applyBuffGlow(document.getElementById('combat-player-box'),
                    bufStat === 'def' ? 'shield' : bufStat === 'atk' ? 'rage' : 'magic');
                break;
            case 'debuff':
                if (skillId === 'bul_01') { this.activeDebuffs.blind = { turns: 1 }; this.addLog('Dusman %50 iskalayacak!', 'debuff'); }
                else if (skillId === 'beg_04') { this.activeDebuffs.vulnerable = { turns: 2 }; }
                else if (skillId === 'beg_05' || skillId === 'buf_09') { this.activeDebuffs.silence = { turns: 2 }; }
                else if (skillId === 'noy_01') { this.activeDebuffs.slow = { turns: 1 }; }
                else { this.activeDebuffs[skill.scaleStat] = { value: skill.baseEffect || 3, turns: Math.max(1, skill.cooldown - 1) }; }
                this.addLog(skill.name + ' uygulandi!', 'debuff');
                alive.forEach(function(m) {
                    var mel = document.getElementById('monster-box-' + m.index);
                    if (mel) self._playDebuffEffect(mel);
                });
                break;
            case 'utility':
                if (skillId === 'can_01') { this.petActive = true; this.petDamage = Math.round(stats.atk * 0.8); this.addLog('Kurt cagrildi!', 'buff'); this._spawnSparks(document.getElementById('combat-player-box'), 'blue', 10); }
                if (skillId === 'ire_04') { this.playerHp = Math.round(this.playerMaxHp * 0.5); this.addLog('%50 HP ile dirildin!', 'heal'); this._playHealEffect(document.getElementById('combat-player-box'), Math.round(this.playerMaxHp * 0.5)); this._playArenaFlash('blue'); }
                if (skillId === 'bul_05') { this.activeBuffs.immortal = { value: 1, turns: 1 }; this._playArenaFlash('red'); }
                if (skillId === 'beg_02') { this.activeBuffs.invincible = { value: 1, turns: 1 }; this._applyBuffGlow(document.getElementById('combat-player-box'), 'shield'); }
                break;
        }

        if (this.petActive) {
            var pd = this.petDamage + this.rollD(6);
            if (target) this.applyDamageToMonster(target, pd);
        }

        // Rarity bazlı ekstra efektler
        if (skill.rarity === 'legendary') {
            this._playArenaFlash('purple');
            var selfx = this;
            setTimeout(function() { selfx._playArenaFlash('red'); }, 250);
            var tgtEl = target ? document.getElementById('monster-box-' + target.index) : document.getElementById('combat-monsters');
            if (tgtEl) this._spawnSparks(tgtEl, 'purple', 25);
        } else if (skill.rarity === 'epic' && skill.type !== 'buff' && skill.type !== 'utility') {
            if (dmg > 20 || heal > 20) {
                this._playArenaFlash(skill.type === 'magic' ? 'purple' : (skill.type === 'heal' ? 'blue' : 'red'));
            }
            var etEl = target ? document.getElementById('monster-box-' + target.index) : document.getElementById('combat-player-box');
            if (etEl) this._spawnSparks(etEl, skill.type === 'magic' ? 'purple' : (skill.type === 'heal' ? 'green' : 'orange'), 16);
        }

        this.render();

        if (this.getAliveMonsters().length === 0) { this.endCombat('VICTORY'); return; }
        if (this.playerHp <= 0 && !this.checkPhoenixRebirth()) { this.endCombat('DEFEAT'); return; }

        // Aynı turda kullanılabilecek skill kaldı mı?
        var canContinue = this.playerSkills.some(function(s) { return self.canUseSkill(s); });
        if (!canContinue) {
            this.addLog('Kullanilabilir skill kalmadi. Sira dusmanda.', 'miss');
            this.endPlayerTurn();
        }
    },

    // LoL tarzı hasar azaltma: DEF×%2 fiziksel, MR×%2 büyü
    reduceDamage(dmg, type, defender, attackerPassive) {
        var reduction = 0;
        // Zeynep pasifi: zırh delme
        var pierce = (attackerPassive && attackerPassive.effect === 'armorPierce') ? 0.5 : 0;
        if (type === 'physical') {
            reduction = Math.min(0.8, (defender.defense || 0) * 0.02 * (1 - pierce));
        } else if (type === 'magic') {
            reduction = Math.min(0.8, (defender.mr || 0) * 0.02);
        }
        // Begül pasifi: +%10 hasar
        if (attackerPassive && attackerPassive.effect === 'runePower') dmg = Math.round(dmg * 1.1);
        // Emin pasifi: +%25 + level×%5 hasar
        if (attackerPassive && attackerPassive.effect === 'potionToss') {
            var lv = Game.level || 1;
            var bonus = 25 + (lv - 1) * 5; // %25 + her level %5
            dmg = Math.round(dmg * (1 + bonus / 100));
        }
        return Math.round(dmg * (1 - reduction));
    },

    applyDamageToMonster(monster, dmg, dmgType, attackerPassive) {
        dmgType = dmgType || 'physical';
        var actual = this.reduceDamage(dmg, dmgType, monster, attackerPassive);
        if (this.activeDebuffs.vulnerable) actual = Math.round(actual * 1.5);
        monster.currentHp = Math.max(0, monster.currentHp - actual);
        // Emir pasifi: canı %10 altına düşen boss olmayan düşmanı infaz et
        if (attackerPassive && attackerPassive.effect === 'execute' && monster.currentHp > 0 && monster.currentHp < monster.maxHp * 0.1) {
            if (!this.isBossFight) {
                monster.currentHp = 0;
                this.addLog('⚡ İNFAZ! ' + monster.name + ' aninda oldu!', 'crit');
            }
        }
        var reducText = actual < dmg ? ' (-' + (dmg - actual) + ')' : '';
        this.addLog(monster.name + ' -' + actual + ' HP' + reducText + ' (' + monster.currentHp + '/' + monster.maxHp + ')', 'hit');
        var monEl = document.getElementById('monster-box-' + monster.index);
        if (monEl) this.hitEffect(monEl, actual, false, dmgType);
    },

    applyAoEDamage(dmg, dmgType, attackerPassive) {
        dmgType = dmgType || 'physical';
        var self = this;
        this.monsters.forEach(function(m) {
            if (m.currentHp > 0) {
                var actual = self.reduceDamage(dmg, dmgType, m, attackerPassive);
                if (self.activeDebuffs.vulnerable) actual = Math.round(actual * 1.5);
                m.currentHp = Math.max(0, m.currentHp - actual);
                self.addLog(m.name + ' -' + actual + ' HP (' + m.currentHp + '/' + m.maxHp + ')', 'hit');
                var mel = document.getElementById('monster-box-' + m.index);
                if (mel) self.hitEffect(mel, actual, false, dmgType);
            }
        });
        this._playArenaFlash(dmgType === 'magic' ? 'purple' : 'red');
        this.addLog('Alan hasari: ' + dmg, 'hit');
    },

    endPlayerTurn() {
        this.disableButtons();
        this.state = 'MONSTER_TURN';
        // Cooldown'ları azalt, buff'ları güncelle
        var self = this;
        Object.keys(this.skillCooldowns).forEach(function(k) { if (self.skillCooldowns[k] > 0) self.skillCooldowns[k]--; });
        Object.keys(this.activeBuffs).forEach(function(k) { if (self.activeBuffs[k].turns > 0) { self.activeBuffs[k].turns--; if (self.activeBuffs[k].turns <= 0) delete self.activeBuffs[k]; } });
        // Buff glow'ları temizle (aktif buff kalmadıysa)
        var hasDef = self.activeBuffs.def && self.activeBuffs.def.turns > 0;
        var hasAtk = self.activeBuffs.atk && self.activeBuffs.atk.turns > 0;
        var hasMag = self.activeBuffs.mag && self.activeBuffs.mag.turns > 0;
        if (!hasDef && !hasAtk && !hasMag) self._clearBuffGlow(document.getElementById('combat-player-box'));
        Object.keys(this.activeDebuffs).forEach(function(k) { if (self.activeDebuffs[k].turns !== undefined && self.activeDebuffs[k].turns > 0) { self.activeDebuffs[k].turns--; if (self.activeDebuffs[k].turns <= 0) delete self.activeDebuffs[k]; } });
        this.addLog('--- Dusman sirasi ---', 'monster');
        setTimeout(function() { self.monstersAttack(); }, 600);
    },

    // --- Canavar Saldırısı ---

    monstersAttack() {
        var self = this;
        var alive = this.getAliveMonsters();
        if (alive.length === 0) { this.endCombat('VICTORY'); return; }

        // Her canavar bir kere saldirir
        alive.forEach(function(m, i) {
            setTimeout(function() {
                self.singleMonsterAttack(m);
                if (i === alive.length - 1) {
                    // Son canavar da saldirdi, sıra oyuncuda
                    setTimeout(function() {
                        if (self.getAliveMonsters().length === 0) { self.endCombat('VICTORY'); return; }
                        if (self.playerHp <= 0 && !self.checkPhoenixRebirth()) { self.endCombat('DEFEAT'); return; }
                        self.startPlayerTurn();
                    }, 500);
                }
            }, i * 700);
        });
    },

    singleMonsterAttack(monster) {
        var stats = this.getEffectiveStats(this.character);
        // %40 ihtimal skill kullan
        var mSkill = null;
        if (Math.random() < 0.4) mSkill = getMonsterSkill(monster.id);

        if (mSkill) {
            // Canavar skill'i kullanıyor
            this.addLog(monster.name + ' ' + mSkill.name + ' kullandi!', 'monster');
            var dmg = mSkill.baseDmg || (monster.attackBonus + this.rollD(monster.damageDie));
            if (mSkill.type === 'buff') {
                this.activeBuffs['monster_' + monster.id + '_def'] = {value: 5, turns: 2};
                this.addLog(monster.name + ' guclendi!', 'monster');
            } else if (mSkill.type === 'debuff') {
                this.activeDebuffs.slow = {turns: 1};
                this.addLog('Yavasladin!', 'debuff');
            } else {
                dmg = this.reduceDamage(dmg, mSkill.type, {defense: stats.def || 0, mr: stats.mr || 0});
                this.playerHp = Math.max(0, this.playerHp - dmg);
                this.addLog('-'+dmg+' HP', 'monster-hit');
                this.showDamageFloat('player', dmg, false);
            }
            this.render();
            if (this.playerHp <= 0 && !this.activeBuffs.immortal && !this.checkPhoenixRebirth()) { this.endCombat('DEFEAT'); }
            return;
        }

        var roll = this.rollD20();
        var atkTotal = roll + monster.attackBonus;
        if (this.activeDebuffs.atk !== undefined) atkTotal -= this.activeDebuffs.atk.value;
        if (this.activeDebuffs.blind && Math.random() < 0.5) {
            this.addLog(monster.name + ' saldirdi ama ISKALADI! (kor)', 'miss');
            return;
        }
        var defThreshold = 10 + stats.def;
        if (this.activeBuffs.def && this.activeBuffs.def.value >= 100) {
            this.addLog(monster.name + ' saldirdi ama KALKAN korudu!', 'buff');
            return;
        }

        this.addLog(monster.name + ' saldiriyor! (zAR:' + roll + '+' + monster.attackBonus + '=' + atkTotal + ')', 'monster');

        if (this.activeBuffs.invincible || this.activeBuffs.immortal) {
            this.addLog('Dokunulmazlik korudu!', 'buff');
        } else if (roll === 20) {
            var dmg = monster.attackBonus * 2;
            dmg = this.reduceDamage(dmg, monster.dmgType || 'physical', { defense: stats.def || 0, mr: stats.mr || 0 });
            if (this.activeBuffs.def && this.activeBuffs.def.value >= 50) dmg = Math.round(dmg * 0.5);
            // Bedrican pasifi: HP<%50 ise %30 hasar azaltma
            if (this.playerHp < this.playerMaxHp * 0.5) {
                var bp = this.getPassive(this.character);
                if (bp && bp.effect === 'stoneSkin') { dmg = Math.round(dmg * 0.7); this.addLog('Tas Dayaniklilik: -%30!', 'buff'); }
            }
            this.playerHp = Math.max(0, this.playerHp - dmg);
            this.addLog(monster.name + ' KRITIK! -' + dmg + ' HP', 'crit');
            this.showDamageFloat('player', dmg, true);
        } else if (atkTotal >= defThreshold) {
            var dmg = monster.attackBonus;
            dmg = this.reduceDamage(dmg, monster.dmgType || 'physical', { defense: stats.def || 0, mr: stats.mr || 0 });
            if (this.activeBuffs.def && this.activeBuffs.def.value >= 50) dmg = Math.round(dmg * 0.5);
            if (this.playerHp < this.playerMaxHp * 0.5) {
                var bp2 = this.getPassive(this.character);
                if (bp2 && bp2.effect === 'stoneSkin') { dmg = Math.round(dmg * 0.7); this.addLog('Tas Dayaniklilik: -%30!', 'buff'); }
            }
            this.playerHp = Math.max(0, this.playerHp - dmg);
            this.addLog(monster.name + ' vurdu! -' + dmg + ' HP', 'monster-hit');
            this.showDamageFloat('player', dmg, false);
        } else {
            this.addLog(monster.name + ' iskaladi!', 'miss');
        }
        this.render();
    },

    playerFlee() {
        if (this.state !== 'PLAYER_TURN') return;
        this.disableButtons();
        this.fled = true;
        // Can yarıdan azsa: 1 kalp kaybeder
        if (this.playerHp < this.playerMaxHp / 2) {
            this.character.hearts = Math.max(1, this.character.hearts - 1);
            this.addLog('Canin yariya indiginde kacarsan 1 kalp kaybedersin! (-1❤️)', 'monster-hit');
            this.endCombat('FLEE');
            return;
        }
        // Normal kaçış: %50 hasar
        var dmg = 0;
        if (Math.random() > 0.5) {
            var m = this.getAliveMonsters()[0];
            if (m) dmg = m.attackBonus + this.rollD(8);
            this.playerHp = Math.max(0, this.playerHp - dmg);
            this.addLog('Kacarken ' + dmg + ' hasar aldin!', 'monster-hit');
        } else {
            this.addLog('Kacmayi basardin!', 'flee');
        }
        this.endCombat('FLEE');
    },

    // Bülent Ersoy pasifi: savasta bir kereligine tam canla dirilme
    _bulentRebirthed: false,

    checkPhoenixRebirth(fighterObj) {
        if (this._bulentRebirthed) return false;
        var char = null;
        if (fighterObj) {
            char = fighterObj.char || fighterObj.character || fighterObj;
        } else if (this.character) {
            char = this.character;
        }
        if (!char || char.id !== 'bulent') return false;
        var passive = this.getPassive ? this.getPassive(char) : (char.passive || {});
        if (passive.effect !== 'phoenixRebirth') return false;
        if (fighterObj) {
            fighterObj.hp = fighterObj.maxHp || fighterObj.baseStats?.hp || 500;
            fighterObj.mana = fighterObj.maxMana || fighterObj.mana || 5;
        } else {
            this.playerHp = this.playerMaxHp || 500;
            this.playerMana = this.playerMaxMana || this.playerMana;
        }
        this._bulentRebirthed = true;
        this.addLog('🔥 FENiKS DOGUSU! Bulent Ersoy kullerinden tam canla geri dondu!', 'crit');
        this._playArenaFlash('red');
        var playerBox = document.getElementById('combat-player-box');
        if (playerBox) { this._playHealEffect(playerBox, this.playerMaxHp); this._applyBuffGlow(playerBox, 'rage'); }
        if (this.showBossUI) this.showBossUI();
        this.render();
        return true;
    },

    // Boss fight: tum fighter'lari kontrol et, Bulent öldüyse dirilt
    checkBossPhoenixRebirth() {
        if (this._bulentRebirthed) return;
        var self = this;
        this.fighters.forEach(function(f) {
            if (f.hp <= 0 && f.char && f.char.id === 'bulent') {
                self.checkPhoenixRebirth(f);
            }
        });
    },

    endCombat(result) {
        this.state = result;
        this.disableButtons();
        var self = this;
        this._bulentRebirthed = false;

        if (result === 'VICTORY') {
            var totalGold = 0, totalFood = 0, totalWood = 0, totalMaden = 0;
            this.monsters.forEach(function(m) {
                totalGold += m.rewards.gold + Math.floor(Math.random() * 3);
                totalFood += m.rewards.food + (Math.random() < 0.3 ? 1 : 0);
                totalWood += m.rewards.wood + (Math.random() < 0.3 ? 1 : 0);
                // Maden: nadirlige gore (D:1-3, C:2-5, B:3-7, A:5-10, S:8-18, SS:15-30)
                var rarityMaden = { D:[1,3], C:[2,5], B:[3,7], A:[5,10], S:[8,18], SS:[15,30] };
                var range = rarityMaden[m.rarity] || [1,2];
                var drop = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
                totalMaden += drop;
            });
            if (totalGold > 0) ResourceManager.addGold(totalGold);
            if (totalFood > 0) ResourceManager.addFood(totalFood);
            if (totalWood > 0) ResourceManager.addWood(totalWood);
            if (totalMaden > 0) ResourceManager.addMaden(totalMaden);

            var rewardText = [];
            if (totalGold > 0) rewardText.push(totalGold + ' altin');
            if (totalFood > 0) rewardText.push(totalFood + ' yemek');
            if (totalWood > 0) rewardText.push(totalWood + ' odun');
            if (totalMaden > 0) rewardText.push(totalMaden + ' maden');

            var newSkill = null;
            if (Math.random() < 0.3) { newSkill = getRandomSkill('common'); if (Math.random() < 0.1) newSkill = getRandomSkill('rare'); if (Math.random() < 0.03) newSkill = getRandomSkill('epic'); }
            if (newSkill) {
                if (!Game.acquiredSkills) Game.acquiredSkills = [];
                if (Game.acquiredSkills.indexOf(newSkill.id) < 0) Game.acquiredSkills.push(newSkill.id);
            }

            // Ekipman/Artifact düşürme (%100 sans, config oranlariyla)
            var droppedEq = null;
            var isBoss = this.monsters.some(function(m) { return m.tier >= 3; });
            var dropRates = (CONFIG && CONFIG.equipmentDrops) ? (isBoss ? (CONFIG.equipmentDrops.boss || CONFIG.equipmentDrops) : (CONFIG.equipmentDrops.normal || CONFIG.equipmentDrops)) : {common:100};
            var roll = Math.random() * 100;
            var cumulative = 0;
            var dropOrder = ['ilahi','legendary','mythic','rare','uncommon','common'];
            for (var di = 0; di < dropOrder.length; di++) {
                cumulative += (dropRates[dropOrder[di]] || 0);
                if (roll < cumulative) {
                    // %50 ekipman, %50 artifact
                    if (Math.random() < 0.5) {
                        var eqPool = getEquipmentByRarity(dropOrder[di]);
                        if (eqPool.length > 0) droppedEq = eqPool[Math.floor(Math.random() * eqPool.length)];
                    } else {
                        var artPool = getArtifactsByRarity(dropOrder[di]);
                        if (artPool.length > 0) droppedEq = artPool[Math.floor(Math.random() * artPool.length)];
                    }
                    // Fallback
                    if (!droppedEq) {
                        var fallback = getEquipmentByRarity('common');
                        if (fallback.length > 0) droppedEq = fallback[Math.floor(Math.random() * fallback.length)];
                    }
                    break;
                }
            }
            if (droppedEq) {
                var isArtifact = getArtifactById(droppedEq.id);
                if (isArtifact) {
                    if (!Game.ownedArtifacts) Game.ownedArtifacts = [];
                    if (Game.ownedArtifacts.indexOf(droppedEq.id) < 0) Game.ownedArtifacts.push(droppedEq.id);
                } else {
                    if (!Game.ownedEquipment) Game.ownedEquipment = [];
                    if (Game.ownedEquipment.indexOf(droppedEq.id) < 0) Game.ownedEquipment.push(droppedEq.id);
                }
            }

            var eqRarity = '';
            if (droppedEq && typeof getSetByPieceId === 'function') {
                var st = getSetByPieceId(droppedEq.id);
                if (st && st.rarity) eqRarity = ' (' + st.rarity + ')';
            }
            var eqText = droppedEq ? '\n\nEkipman dustu: ' + droppedEq.name + eqRarity : '';
            // XP kazanma (nadirlik bazli)
            var xpGain = 0;
            var self3 = this;
            this.monsters.forEach(function(m) {
                xpGain += rarityXp(m.rarity || 'D');
            });
            Game.addXP(xpGain);

            Game.showResult('Zafer!', 'Dusmanlar yenildi!\n' + this.turnCount + ' turda kazandin.\nCan: ' + this.playerHp + '/' + this.playerMaxHp + '\n+'+xpGain+' XP\n\nOduller: ' + (rewardText.join(', ') || 'Yok') + (newSkill ? '\n\nYeni skill: ' + newSkill.name : '') + eqText, {});
            Game.log('Savas kazanildi! +' + xpGain + ' XP (' + rewardText.join(', ') + ')' + (newSkill ? ' Yeni skill: ' + newSkill.name : '') + (droppedEq ? ' Ekipman: ' + droppedEq.name : ''), 'positive');
        } else if (result === 'DEFEAT') {
            this.character.hearts = Math.max(1, this.character.hearts - 1);
            Game.showResult('Bozgun...', 'Yenildin.\n-1 Kalp', { heart: -1 });
            Game.log('Savasta bozguna ugradi! (-1 kalp)', 'negative');
            Game.renderCharacterBar();
        } else if (result === 'FLEE') {
            Game.showResult('Kactin', 'Savastan kactin.\nCan: ' + this.playerHp + '/' + this.playerMaxHp, {});
            Game.log('Savastan kacti.', '');
            Game.renderCharacterBar();
        }

        var char = this.character;
        document.getElementById('btn-result-continue').onclick = function() {
            Game.hideResult();
            CombatSystem.hide();
            Game.afterAction(char, null, null, 'combat');
        };
    },

    // === UI ===

    show() {
        document.getElementById('card-area').style.display = 'none';
        document.getElementById('combat-area').style.display = 'block';
        document.getElementById('combat-log-entries').innerHTML = '';

        // Player box'u sifirla (boss fight bozmus olabilir)
        var pbox = document.getElementById('combat-player-box');
        if (pbox && !document.getElementById('player-hp-fill')) {
            pbox.innerHTML = '<div class=\"hp-bar-container\"><span class=\"hp-bar-label\">Sen</span><div class=\"hp-bar-track\"><div class=\"hp-bar-fill player-hp\" id=\"player-hp-fill\"></div></div><span class=\"hp-bar-text\" id=\"player-hp-text\">' + this.playerMaxHp + '/' + this.playerMaxHp + '</span></div><div id=\"combat-player-stats\" class=\"combat-stats\"></div><div class=\"hp-bar-container mana-bar\"><span class=\"hp-bar-label\">Mana</span><div class=\"hp-bar-track mana-track\"><div class=\"hp-bar-fill mana-fill\" id=\"mana-fill\"></div></div><span class=\"hp-bar-text\" id=\"mana-text\">' + this.playerMaxMana + '/' + this.playerMaxMana + '</span></div>';
        }

        // HP ve mana barini resetle
        this.playerHp = this.playerMaxHp;
        this.playerMana = this.playerMaxMana;
        var php = document.getElementById('player-hp-fill');
        if (php) { php.style.width = '100%'; php.style.background = 'linear-gradient(90deg,#2d6b2d,#4a9a4a)'; }
        var pht = document.getElementById('player-hp-text');
        if (pht) pht.textContent = this.playerHp + '/' + this.playerMaxHp;
        var mf = document.getElementById('mana-fill');
        if (mf) mf.style.width = '100%';
        var mt = document.getElementById('mana-text');
        if (mt) mt.textContent = this.playerMana + '/' + this.playerMaxMana;
        this.renderMonsterBoxes();
        this.updateCombatStatsDisplay();
        this.renderSkills();
        this.render();
    },

    updateCombatStatsDisplay() {
        var char = this.character || Game.getPlayerCharacter();
        if (!char) return;
        var stats = this.getEffectiveStats(char);
        var el = document.getElementById('combat-player-stats');
        if (el) el.textContent = 'HP:' + this.playerHp + '/' + this.playerMaxHp + ' | ATK:' + stats.atk + ' DEF:' + stats.def + ' MR:' + (stats.mr||0) + ' BUY:' + stats.mag;
    },

    renderMonsterBoxes() {
        var container = document.getElementById('combat-monsters');
        if (!container) return;
        container.innerHTML = '';
        var self = this;
        var count = this.monsters.length;
        var isMobile = window.innerWidth <= 600;
        // Dinamik grid: az canavar -> büyük, çok canavar -> kompakt
        // Mobilde en fazla 3 sütun
        var cols;
        if (count <= 2) cols = count;
        else if (count <= 3) cols = 3;
        else cols = isMobile ? 3 : 4;
        container.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
        if (count >= 4) {
            container.classList.add('compact');
        } else {
            container.classList.remove('compact');
        }
        this.monsters.forEach(function(m) {
            var box = document.createElement('div');
            box.className = 'monster-mini-box';
            box.id = 'monster-box-' + m.index;
            var rarity = m.rarity || 'D';
            var rarityColor = RARITY_COLOR[rarity] || '#888';
            var portrait = getMonsterPortrait(m.id);
            if (portrait) {
                box.style.backgroundImage = 'url(' + portrait + ')';
            } else {
                box.classList.add('no-portrait');
            }
            box.style.borderColor = rarityColor;
            box.innerHTML =
                '<div class=\"monster-overlay\">' +
                '<span class=\"monster-mini-name\"><span class=\"monster-rarity-badge\" style=\"background:' + rarityColor + '\">' + rarity + '</span> ' + m.name + '</span>' +
                '<span class=\"monster-mini-type\" style=\"color:' + rarityColor + '\">' + rarity + ' Seviye</span>' +
                '<div class=\"hp-bar-container mini-hp\"><div class=\"hp-bar-track mini-track\"><div class=\"hp-bar-fill monster-hp\" id=\"monster-hp-fill-' + m.index + '\"></div></div><span class=\"hp-bar-text\" id=\"monster-hp-text-' + m.index + '\">' + m.currentHp + '/' + m.maxHp + '</span></div>' +
                '</div>';
            container.appendChild(box);
        });
    },

    hide() {
        document.getElementById('combat-area').style.display = 'none';
        document.getElementById('card-area').style.display = '';
        var mc = document.getElementById('combat-monsters');
        if (mc) { mc.classList.remove('compact'); mc.style.gridTemplateColumns = ''; }
        this.state = 'IDLE'; this.isBossFight = false; this.isPartyFight = false;
        this.monsters = []; this.character = null;
        this.partyFighters = []; this.partyMonsters = []; this.partyTurnOrder = [];
        this.combatLog = []; this.turnCount = 0;
        this.activeBuffs = {}; this.activeDebuffs = {}; this.skillCooldowns = {}; this.usedSkillsThisTurn = [];
        this.playerHp = 0; this.playerMaxHp = 0; this.playerMana = 0; this.playerMaxMana = 0;
        this._partySkillsBuilt = false; this._partySkillBtns = {};
        MusicPlayer.playCategory('game');
    },

    render() {
        this.updateCombatStatsDisplay();
        // Boss fight render
        if (this.isBossFight) {
            var bp = Math.round((this.bossHp / this.bossMaxHp) * 100);
            var bf = document.getElementById('boss-hp-fill');
            var bt = document.getElementById('boss-hp-text');
            if (bf) bf.style.width = bp + '%';
            if (bt) bt.textContent = this.bossHp + '/' + this.bossMaxHp;
            this.fighters.forEach(function(f, i) {
                var fp = Math.round((f.hp / f.maxHp) * 100);
                var ff = document.getElementById('fighter-hp-' + i);
                if (ff) ff.style.width = fp + '%';
            });
            var logEl = document.getElementById('combat-log-entries');
            if (logEl) logEl.innerHTML = this.combatLog.slice(-5).map(function(e) { return '<div class=\"combat-log-entry ' + e.cls + '\">' + e.msg + '</div>'; }).join('');
            return;
        }

        // Normal combat render
        var self = this;
        this.monsters.forEach(function(m) {
            var fill = document.getElementById('monster-hp-fill-' + m.index);
            var txt = document.getElementById('monster-hp-text-' + m.index);
            var box = document.getElementById('monster-box-' + m.index);
            if (fill) fill.style.width = Math.round((m.currentHp / m.maxHp) * 100) + '%';
            if (txt) txt.textContent = m.currentHp + '/' + m.maxHp;
            if (box) box.classList.toggle('dead', m.currentHp <= 0);
        });
        // Oyuncu HP
        var pPct = Math.round((this.playerHp / this.playerMaxHp) * 100);
        var ph = document.getElementById('player-hp-fill');
        if (ph) { ph.style.width = pPct + '%'; if (pPct < 25) ph.style.background = 'linear-gradient(90deg,#8b2020,#c84040)'; else if (pPct < 50) ph.style.background = 'linear-gradient(90deg,#8b6d20,#c8a840)'; else ph.style.background = 'linear-gradient(90deg,#2d6b2d,#4a9a4a)'; }
        var pt = document.getElementById('player-hp-text');
        if (pt) pt.textContent = this.playerHp + '/' + this.playerMaxHp;
        // Mana
        var mf = document.getElementById('mana-fill');
        var mt = document.getElementById('mana-text');
        if (mf) mf.style.width = Math.round((this.playerMana / Math.max(1, this.playerMaxMana)) * 100) + '%';
        if (mt) mt.textContent = this.playerMana + '/' + this.playerMaxMana;
        // Log
        var logEl = document.getElementById('combat-log-entries');
        if (logEl) { logEl.innerHTML = this.combatLog.slice(-5).map(function(e) { return '<div class="combat-log-entry ' + e.cls + '">' + e.msg + '</div>'; }).join(''); }

        this._updateSkillStates();
    },

    _buildSkillButtons() {
        var container = document.getElementById('combat-skills');
        if (!container) return;
        container.innerHTML = '';
        this._skillBtns = {};
        var self = this;
        this.playerSkills.forEach(function(skill, idx) {
            var icon = skill.type === 'physical' ? '⚔️' : skill.type === 'magic' ? '🔮' : skill.type === 'heal' ? '💚' : skill.type === 'buff' ? '🛡️' : skill.type === 'debuff' ? '💀' : '❓';
            var scaleAbbr = skill.scaleStat === 'atk' ? 'ATK' : skill.scaleStat === 'mag' ? 'BÜY' : skill.scaleStat === 'def' ? 'DEF' : skill.scaleStat === 'spd' ? 'HIZ' : 'CAN';
            var isBasicSkill = skill.id === 'basic';
            var scaleBadge = isBasicSkill ? '' : '<span class=\"skill-scale\">' + scaleAbbr + '</span>';
            var typeLabel = skill.type === 'physical' ? 'Fiziksel' : skill.type === 'magic' ? 'Büyü' : skill.type === 'heal' ? 'Şifa' : skill.type === 'buff' ? 'Güçlendirme' : skill.type === 'debuff' ? 'Zayıflatma' : 'Özel';
            var scaleLabel = skill.scaleStat === 'atk' ? 'ATK' : skill.scaleStat === 'mag' ? 'BÜYÜ' : skill.scaleStat === 'def' ? 'DEF' : skill.scaleStat === 'spd' ? 'HIZ' : 'CAN';
            var dmgInfo = skill.type === 'heal' ? (scaleLabel + '×' + skill.scaleFactor + ' iyileştirme') : skill.type === 'buff' || skill.type === 'debuff' ? skill.description : (scaleLabel + '×' + skill.scaleFactor + (skill.baseEffect > 0 ? ' +' + skill.baseEffect : '') + ' hasar');
            var tt = '<div class=\"skill-tooltip\"><b>' + skill.name + '</b><br>' +
                '<span class=\"tt-type\">' + typeLabel + '</span> | ' + dmgInfo + '<br>' +
                (skill.manaCost > 0 ? '💧Mana: ' + skill.manaCost + ' | ' : '') +
                '⏳CD: ' + skill.cooldown + ' tur' +
                (skill.target === 'all_enemies' ? ' | 🎯 Alan hasarı' : skill.target === 'all_allies' ? ' | 🎯 Tüm takım' : '') +
                '<br><span style=\"font-size:0.6rem;color:#999\">' + skill.description + '</span></div>';
            var hotkeys = ['Q','E','F','G','R','T'];
            var hotkeyLabel = idx < 6 ? '<span class=\"skill-hotkey\">' + (hotkeys[idx] || '') + '</span>' : '';
            var btn = document.createElement('div');
            btn.className = 'skill-card';
            btn.setAttribute('data-skill-id', skill.id);
            btn.innerHTML = icon + '<span class="skill-name">' + skill.name + '</span>' + hotkeyLabel + scaleBadge +
                '<span class="skill-cd" style="display:none;"></span>' +
                '<span class="skill-mana">' + (skill.manaCost > 0 ? skill.manaCost + '💧' : '') + '</span>' +
                '<span class="skill-used" style="display:none;">✓</span>' + tt;
            btn.addEventListener('click', function() { self.useSkill(skill.id); });
            container.appendChild(btn);
            self._skillBtns[skill.id] = btn;
        });
        this._skillsBuilt = true;
    },

    _updateSkillStates() {
        if (!this._skillsBuilt) { this._buildSkillButtons(); return; }
        var self = this;
        var anyMissing = false;
        this.playerSkills.forEach(function(skill) {
            var btn = self._skillBtns[skill.id];
            if (!btn) { anyMissing = true; return; }
            var canUse = self.canUseSkill(skill);
            var onCD = skill.cooldown > 0 && self.skillCooldowns[skill.id] && self.skillCooldowns[skill.id] > 0;
            var used = self.usedSkillsThisTurn.indexOf(skill.id) >= 0;
            var disabled = (self.state !== 'PLAYER_TURN') || !canUse || used;
            btn.classList.toggle('disabled', disabled);
            // CD badge
            var cdEl = btn.querySelector('.skill-cd');
            if (cdEl) {
                cdEl.textContent = onCD ? self.skillCooldowns[skill.id] : '';
                cdEl.style.display = onCD ? '' : 'none';
            }
            // Used badge
            var usedEl = btn.querySelector('.skill-used');
            if (usedEl) usedEl.style.display = used ? '' : 'none';
        });
        if (anyMissing) { this._skillsBuilt = false; this._buildSkillButtons(); }

        // Yemek Ye butonu
        var foodBtn = document.getElementById('btn-eat-food');
        if (foodBtn) {
            foodBtn.style.display = self.state === 'PLAYER_TURN' ? 'inline-block' : 'none';
            var canEat = ResourceManager.food >= 5 && self.playerHp < self.playerMaxHp;
            foodBtn.disabled = !canEat;
            foodBtn.style.opacity = canEat ? '1' : '0.5';
            foodBtn.textContent = '🍗 Yemek Ye (5🍗 → 50HP) [' + ResourceManager.food + '🍗]';
        }

        // Sırayı Bitir butonu
        var endBtn = document.getElementById('btn-end-turn');
        if (endBtn) {
            endBtn.style.display = self.state === 'PLAYER_TURN' ? 'block' : 'none';
            endBtn.disabled = self.state !== 'PLAYER_TURN';
        }
    },

    renderSkills() { this._updateSkillStates(); },

    addLog(msg, cls) { this.combatLog.push({ msg: msg, cls: cls }); this.render(); },

    enableButtons() {
        var flee = document.getElementById('btn-flee');
        if (flee) { flee.disabled = false; flee.style.opacity = '1'; }
        this.renderSkills();
    },

    disableButtons() {
        var flee = document.getElementById('btn-flee');
        if (flee) { flee.disabled = true; flee.style.opacity = '0.5'; }
    },

    showDamageFloat(target, amount, crit) {
        var boxId = target === 'player' ? 'combat-player-box' : 'monster-box-' + (target.replace('monster-', '') || '0');
        var box = document.getElementById(boxId);
        if (!box) return;

        // Oyuncu hasar alınca ekranı sars
        if (target === 'player') {
            var combatArea = document.getElementById('combat-area');
            if (combatArea) {
                combatArea.classList.remove('screen-shake','heavy-shake');
                void combatArea.offsetWidth;
                combatArea.classList.add(crit ? 'heavy-shake' : 'screen-shake');
                setTimeout(function() { combatArea.classList.remove('screen-shake','heavy-shake'); }, 750);
            }
            // Kırmızı flaş
            var vignette = document.createElement('div');
            vignette.className = 'hit-vignette';
            document.body.appendChild(vignette);
            setTimeout(function() { if (vignette.parentNode) vignette.parentNode.removeChild(vignette); }, 450);
            // Partiküller
            this._spawnSparks(box, 'red', crit ? 15 : 8);
            // Hedefi salla
            box.classList.remove('target-hit');
            void box.offsetWidth;
            box.classList.add('target-hit');
            setTimeout(function() { box.classList.remove('target-hit'); }, 450);
        }

        var el = document.createElement('div');
        el.className = 'dmg-float' + (crit ? ' crit' : '');
        el.textContent = (crit ? '💥 ' : '') + '-' + amount;
        box.appendChild(el);
        setTimeout(function() { el.remove(); }, 1200);
    },

    // ===== BOSS FIGHT MODU =====
    isBossFight: false,
    bossData: null,
    bossHp: 0, bossMaxHp: 0,
    bossUltimateReady: false,
    bossTurnCounter: 0,
    fighters: [], // [{char, hp, maxHp, mana, maxMana, name, skills, cooldowns, usedThisTurn}]
    currentFighterIndex: 0,
    isMultiplayerBossFight: false,
    bossFightMyTurn: false,
    bossFightCurrentActorId: null,

    startBossFight(boss) {
        if (this.state !== 'IDLE') return;
        this.isBossFight = true;
        this.character = Game.getPlayerCharacter();
        this.bossData = boss;
        var playerCount = Game.aliveCharacters.length || 1;
        var scaledHp = Math.round((boss.baseHp || boss.hp || 1500) * playerCount);
        this.bossHp = scaledHp;
        this.bossMaxHp = scaledHp;
        this.bossUltimateReady = false;
        this.bossTurnCounter = 0;
        this.combatLog = [];
        this.turnCount = 0;
        this.fled = false;
        this.activeBuffs = {};
        this.activeDebuffs = {};
        this.state = 'INTRO';

        // Tüm canlı karakterleri savaşçı olarak ekle
        this.fighters = [];
        var self = this;
        Game.aliveCharacters.forEach(function(char) {
            var base = self.getBaseStats(char);
            var skills = [];
            // Temel vuruş
            var basicNames = {irem:'Asa Vuruşu',gokdeniz:'Kılıç Darbesi',noyan:'Kaptan Kancası',begul:'Rün Tokmağı',bedrican:'Taş Yumruk',cansin:'Pençe',gunda:'Toprak Yumruğu',dominic:'Aile Darbesi',bulent:'Diva Tokadı'};
            skills.push({id:'basic',name:basicNames[char.id]||'Temel Vuruş',type:'physical',scaleStat:'atk',scaleFactor:1.0,baseEffect:0,manaCost:0,cooldown:0,target:'enemy',description:'ATK×1.',rarity:'character',characterId:null});
            var chInvBoss = char._inv || {};
            var eqSkills = (chInvBoss.equippedSkills && chInvBoss.equippedSkills.length > 0) ? chInvBoss.equippedSkills : (Game.equippedSkills && Game.equippedSkills.length > 0) ? Game.equippedSkills : (char.characterSkills || []);
            eqSkills.forEach(function(sid) { var sk = getSkillById(sid); if (sk) skills.push(sk); });
            self.fighters.push({
                char: char,
                name: char.displayName || char.name,
                hp: base.hp, maxHp: base.hp,
                mana: Math.max(1, Math.floor(base.mag / 3)),
                maxMana: Math.max(1, Math.floor(base.mag / 3)),
                baseStats: base,
                skills: skills,
                cooldowns: {},
                usedThisTurn: [],
                isPlayer: char.id === Game.getPlayerCharacter().id
            });
        });

        // SPD'ye göre sırala (boss dahil)
        this.currentFighterIndex = 0;
        this.showBossUI();
        this._bossSkillsForFighter = -1;
        this._bossSkillBtns = {};
        MusicPlayer.playCategory('boss');

        var charNames = this.fighters.map(function(f) { return f.name; });
        this.addLog(boss.name + ' ile karsi karsiyasiniz!', 'intro');
        this.addLog(boss.introText, 'desc');

        setTimeout(function() {
            self.startBossTurn();
        }, 2000);
    },

    showBossUI() {
        document.getElementById('card-area').style.display = 'none';
        document.getElementById('combat-area').style.display = 'block';
        var bossBox = document.getElementById('combat-monsters');
        if (bossBox) { bossBox.classList.remove('compact'); bossBox.style.gridTemplateColumns = '1fr'; }
        if (bossBox) {
            bossBox.innerHTML = '<div id=\"boss-main-box\">' +
                '<img id=\"boss-portrait\" src=\"' + (CONFIG && CONFIG.bossPortraits ? (CONFIG.bossPortraits[this.bossData.portraitKey] || '') : '') + '\" style=\"max-width:150px;max-height:150px;border-radius:8px;margin-bottom:8px;\">' +
                '<h3 style=\"color:var(--red-light);\">' + this.bossData.name + '</h3>' +
                '<p style=\"font-size:0.7rem;color:var(--text-dim);\">' + this.bossData.title + '</p>' +
                '<div class=\"hp-bar-container\"><span>Boss</span><div class=\"hp-bar-track\" style=\"width:250px;\"><div class=\"hp-bar-fill monster-hp\" id=\"boss-hp-fill\"></div></div><span id=\"boss-hp-text\">' + this.bossHp + '/' + this.bossMaxHp + '</span></div>' +
                (this.bossUltimateReady ? '<div style=\"color:#ff4444;animation:pulse 0.5s infinite;font-size:0.8rem;\">⚠️ ULTIMATE HAZIR!</div>' : '') +
                '</div>';
        }
        // Oyuncuları göster (kompakt grid)
        var playerBox = document.getElementById('combat-player-box');
        if (playerBox) {
            var cols = this.fighters.length <= 2 ? 1 : this.fighters.length <= 4 ? 2 : 3;
            var isMyTurn = !this.isMultiplayerBossFight || this.bossFightMyTurn;
            playerBox.innerHTML = '<div id=\"boss-fighters\" style=\"display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:4px;\">' +
                this.fighters.map(function(f, i) {
                    var isActive = i === this.currentFighterIndex && isMyTurn;
                    var deathClass = f.hp <= 0 ? ' dead' : '';
                    return '<div class=\"boss-fighter' + (isActive ? ' active' : '') + deathClass + '\" id=\"fighter-' + i + '\">' +
                        '<span class=\"bf-name\">' + (isActive ? '▶ ' : '') + f.name + '</span>' +
                        '<div class=\"hp-bar-container mini-hp\"><div class=\"hp-bar-track mini-track\"><div class=\"hp-bar-fill player-hp\" id=\"fighter-hp-' + i + '\"></div></div><span class=\"hp-bar-text\">' + f.hp + '/' + f.maxHp + '</span></div>' +
                        '<span class=\"bf-mana\">💧' + f.mana + '/' + f.maxMana + '</span>' +
                        '</div>';
                }.bind(this)).join('') + '</div>';
        }
        this.renderBossSkills();
        this.render();
    },

    startBossTurn() {
        // Kimin sırası?
        var fighter = this.fighters[this.currentFighterIndex];
        if (!fighter || fighter.hp <= 0) {
            this.nextBossFighter();
            return;
        }

        if (fighter.isPlayer) {
            // Oyuncu sırası
            this.state = 'PLAYER_TURN';
            fighter.mana = fighter.maxMana;
            fighter.usedThisTurn = [];
            this.addLog('Sira ' + fighter.name + '\'de!', 'player');
            this.showBossUI();
            this.enableBossSkills();
        } else {
            // AI oyuncu sırası (multiplayer'da diğer oyuncular)
            this.state = 'MONSTER_TURN';
            this.aiBossFighterTurn(fighter);
        }
    },

    bossTurn() {
        this.state = 'MONSTER_TURN';
        this.bossTurnCounter++;
        // Ultimate her 5 turda bir
        if (this.bossTurnCounter >= 5 && !this.bossUltimateReady) {
            this.bossUltimateReady = true;
            this.addLog('⚠️ ' + this.bossData.name + ' ultimate hazirlaniyor: ' + this.bossData.ultimate.name + '!', 'crit');
            this.showBossUI();
            var self = this;
            setTimeout(function() { self.bossExecuteUltimate(); }, 1500);
            return;
        }
        // Normal skill seç (rastgele)
        var skill = this.bossData.skills[Math.floor(Math.random() * this.bossData.skills.length)];
        this.bossExecuteSkill(skill);
    },

    bossExecuteSkill(skill) {
        if (!skill) return;
        this.addLog(this.bossData.name + ' ' + skill.name + ' kullandi!', 'monster');
        if (skill.type === 'heal') {
            this.bossHp = Math.min(this.bossMaxHp, this.bossHp + Math.abs(skill.baseDmg));
            this.addLog('+' + Math.abs(skill.baseDmg) + ' HP iyilesti!', 'heal');
        } else if (skill.type === 'buff') {
            this.activeBuffs['boss_buff'] = {value: 5, turns: 2};
            this.addLog('Boss guclendi!', 'monster');
        } else if (skill.type === 'debuff') {
            var self = this;
            this.fighters.forEach(function(f) { if (f.hp > 0) f.hp = Math.max(0, f.hp - 20); });
            this.addLog('Debuff! Herkes -20 HP.', 'monster-hit');
            this.hitBossEffect(20, false);
        } else {
            var _self = this;
            this.hitBossEffect(skill.baseDmg || 80, false);
            var dmg = skill.baseDmg;
            if (skill.target === 'all') {
                var self2 = this;
                this.fighters.forEach(function(f) {
                    if (f.hp > 0) {
                        var reduced = self2.reduceDamage(dmg, skill.type, {defense: f.baseStats.def || 0, mr: f.baseStats.mr || 0});
                        f.hp = Math.max(0, f.hp - reduced);
                        self2.addLog(f.name + ' -' + reduced + ' HP', 'monster-hit');
                    }
                });
            } else {
                var target = this.fighters.filter(function(f) { return f.hp > 0; }).sort(function(a, b) { return b.hp - a.hp; })[0];
                if (target) {
                    var reduced = this.reduceDamage(dmg, skill.type, {defense: target.baseStats.def || 0, mr: target.baseStats.mr || 0});
                    target.hp = Math.max(0, target.hp - reduced);
                    this.addLog(target.name + ' -' + reduced + ' HP', 'monster-hit');
                }
            }
        }
        this.showBossUI();
        this.render();

        if (this.bossHp <= 0) { this.endBossFight('VICTORY'); return; }
        this.checkBossPhoenixRebirth();
        this.checkBossPhoenixRebirth();
        if (this.fighters.every(function(f) { return f.hp <= 0; })) { this.endBossFight('DEFEAT'); return; }

        // Boss turu bitti, sira oyuncuya gecti
        var self = this;
        setTimeout(function() {
            self.currentFighterIndex = 0;
            self.startBossTurn();
        }, 1000);
    },

    bossExecuteUltimate() {
        var ult = this.bossData.ultimate;
        this.addLog('💥 ' + this.bossData.name + ' ULTIMATE: ' + ult.name + '!', 'crit');
        this.hitBossEffect(0, true);
        this._playArenaFlash('red');
        var self2 = this;
        setTimeout(function() { self2._playArenaFlash('purple'); }, 300);
        var dmg = ult.baseDmg;
        var self = this;
        this.fighters.forEach(function(f) {
            if (f.hp > 0) {
                var reduced = self.reduceDamage(dmg, ult.type, {defense: f.baseStats.def || 0, mr: f.baseStats.mr || 0});
                f.hp = Math.max(0, f.hp - reduced);
                self.addLog(f.name + ' -' + reduced + ' HP!', 'crit');
            }
        });
        this.bossUltimateReady = false;
        this.bossTurnCounter = 0;
        this.showBossUI();
        this.render();

        this.checkBossPhoenixRebirth();
        if (this.fighters.every(function(f) { return f.hp <= 0; })) { this.endBossFight('DEFEAT'); return; }
        var self2 = this;
        setTimeout(function() {
            self2.currentFighterIndex = 0;
            self2.startBossTurn();
        }, 1200);
    },

    useBossSkill(skillId) {
        if (this.state !== 'PLAYER_TURN') return;
        var fighter = this.fighters[this.currentFighterIndex];
        if (!fighter || !fighter.isPlayer) return;
        var skill = skillId === 'basic' ? fighter.skills[0] : fighter.skills.find(function(s) { return s.id === skillId; });
        if (!skill) return;
        if (fighter.mana < skill.manaCost) return;
        if (fighter.usedThisTurn.indexOf(skill.id) >= 0) return;
        if (skill.cooldown > 0 && fighter.cooldowns[skill.id] && fighter.cooldowns[skill.id] > 0) return;

        fighter.mana -= skill.manaCost;
        fighter.usedThisTurn.push(skill.id);
        if (skill.cooldown > 0) fighter.cooldowns[skill.id] = skill.cooldown;

        var stats = fighter.baseStats;
        var dmg = 0, heal = 0;
        if (skill.type === 'physical' || skill.type === 'magic') {
            dmg = Math.round(stats[skill.scaleStat] * skill.scaleFactor) + skill.baseEffect;
            if (this.bossData.special === 'shared_damage') dmg = Math.round(dmg * 2);
            this.bossHp = Math.max(0, this.bossHp - dmg);
            this.addLog(fighter.name + ': ' + skill.name + '! -' + dmg + ' HP', 'hit');
            this.hitBossEffect(dmg, false);
        } else if (skill.type === 'heal') {
            heal = Math.round(stats.mag * skill.scaleFactor) + skill.baseEffect;
            fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
            this.addLog(fighter.name + ': ' + skill.name + '! +' + heal + ' HP', 'heal');
        } else if (skill.type === 'buff') {
            this.activeBuffs['fighter_' + fighter.char.id] = {value: 5, turns: 2};
            this.addLog(fighter.name + ': ' + skill.name + '!', 'buff');
        }

        Object.keys(fighter.cooldowns).forEach(function(k) { if (fighter.cooldowns[k] > 0) fighter.cooldowns[k]--; });

        // Multiplayer: server'a gonder
        if (this.isMultiplayerBossFight) {
            var canContinue = fighter.skills.some(function(s) {
                var cdOk = !s.cooldown || !fighter.cooldowns[s.id] || fighter.cooldowns[s.id] <= 0;
                return fighter.mana >= s.manaCost && fighter.usedThisTurn.indexOf(s.id) < 0 && cdOk;
            });
            var endedTurn = !canContinue;
            if (endedTurn) {
                this.addLog(fighter.name + ' turu bitti.', '');
                this.bossFightMyTurn = false;
                this.disableBossSkillButtons();
            }
            Multiplayer.send({
                type: 'boss-action',
                skillId: skillId,
                skillName: skill.name,
                damage: dmg,
                heal: heal,
                newBossHp: this.bossHp,
                newFighterHp: fighter.hp,
                newFighterMana: fighter.mana,
                isCrit: false,
                endedTurn: endedTurn
            });
            this.showBossUI();
            this.render();
            // Multiplayer'da server boss-fight-end gonderecek, local endBossFight cagirma
            if (!endedTurn) this.renderBossSkills();
            return;
        }

        this.showBossUI();
        this.render();

        if (this.bossHp <= 0) { this.endBossFight('VICTORY'); return; }

        var canContinue = fighter.skills.some(function(s) {
            var cdOk = !s.cooldown || !fighter.cooldowns[s.id] || fighter.cooldowns[s.id] <= 0;
            return fighter.mana >= s.manaCost && fighter.usedThisTurn.indexOf(s.id) < 0 && cdOk;
        });
        if (!canContinue) {
            this.addLog(fighter.name + ' turu bitti.', '');
            this.nextBossFighter();
        }
    },

    aiBossFighterTurn(fighter) {
        // AI: rastgele skill kullan
        var usable = fighter.skills.filter(function(s) {
            return s.manaCost <= fighter.mana && fighter.usedThisTurn.indexOf(s.id) < 0;
        });
        if (usable.length > 0) {
            var sk = usable[Math.floor(Math.random() * usable.length)];
            fighter.mana -= sk.manaCost;
            fighter.usedThisTurn.push(sk.id);
            if (sk.cooldown > 0) fighter.cooldowns[sk.id] = sk.cooldown;
            if (sk.type !== 'heal' && sk.type !== 'buff') {
                var dmg = Math.round(fighter.baseStats[sk.scaleStat] * sk.scaleFactor) + sk.baseEffect;
                this.bossHp = Math.max(0, this.bossHp - dmg);
                this.addLog(fighter.name + ': ' + sk.name + '! -' + dmg + ' HP', 'hit');
                this.hitBossEffect(dmg, false);
            } else if (sk.type === 'heal') {
                fighter.hp = Math.min(fighter.maxHp, fighter.hp + Math.round(fighter.baseStats.mag * sk.scaleFactor));
            }
        }
        this.showBossUI();
        this.render();
        if (this.bossHp <= 0) { this.endBossFight('VICTORY'); return; }
        var self = this;
        setTimeout(function() { self.nextBossFighter(); }, 800);
    },

    nextBossFighter() {
        this.currentFighterIndex++;
        if (this.currentFighterIndex >= this.fighters.length) {
            // Tüm oyuncular oynadı, boss sırası
            this.currentFighterIndex = 0;
            this.bossTurn();
            return;
        }
        this.startBossTurn();
    },

    endBossFight(result) {
        this.state = result;
        if (result === 'VICTORY') {
            // Boss XP: order 5(Tayyip)=2500, 4(Eyup)=3500, 3(MJ)=5000, 2(Sutas)=7000, 1(Mari)=10000, 0(Zeytin)=15000
            var xpTable = {5:2500, 4:3500, 3:5000, 2:7000, 1:10000, 0:15000};
            var xpGain = (xpTable[this.bossData.order] || 2500) + Math.floor(Math.random() * 1001);
            Game.addXP(xpGain);
            // Maden: ekipman mantığıyla (rare %30, epic %40, legendary %27, ilahi %3)
            var mRoll = Math.random() * 100;
            var mCum = 0;
            var bossMaden = 10;
            var mTable = [
                { r: 'ilahi',     chance: 3,  base: 40, extra: 20 },
                { r: 'legendary', chance: 27, base: 20, extra: 20 },
                { r: 'epic',      chance: 40, base: 10, extra: 10 },
                { r: 'rare',      chance: 30, base: 5,  extra: 5 }
            ];
            for (var mi = 0; mi < mTable.length; mi++) {
                mCum += mTable[mi].chance;
                if (mRoll < mCum) {
                    bossMaden = mTable[mi].base + Math.floor(Math.random() * (mTable[mi].extra + 1));
                    break;
                }
            }
            ResourceManager.addMaden(bossMaden);
            this.addLog('⛏️ +' + bossMaden + ' maden!', 'buff');
            // Boss'u yenildi olarak işaretle
            if (Game.defeatedBosses.indexOf(this.bossData.id) < 0) Game.defeatedBosses.push(this.bossData.id);
            Game.autoSave();

            var charNames = this.fighters.map(function(f) { return f.name; });
            var story = getBossDefeat(this.bossData.id, charNames);

            Game.showResult('BOSS YENILDI!', story + '\n\n+' + xpGain + ' XP', {});
            Game.log(this.bossData.name + ' yenildi! +' + xpGain + ' XP', 'event');
        } else {
            this.fighters.forEach(function(f) {
                var char = Game.characters.find(function(c) { return c.id === f.char.id; });
                if (char) char.hearts = Math.max(1, char.hearts - 1);
            });
            Game.showResult('Bozgun...', this.bossData.name + ' cok guclu!\n\nHerkes 1 kalp kaybetti. Guclenip tekrar dene.', { heart: -1 });
            Game.log('Boss savasinda bozguna ugradi!', 'negative');
            Game.renderCharacterBar();
        }

        var self = this;
        document.getElementById('btn-result-continue').onclick = function() {
            Game.hideResult();
            self.hideBossUI();
            self.isBossFight = false;
            self.state = 'IDLE';
            Game.afterAction(Game.getPlayerCharacter(), null, null, 'combat');
        };
    },

    hideBossUI() {
        document.getElementById('combat-area').style.display = 'none';
        document.getElementById('card-area').style.display = '';
        this.isBossFight = false;
        this.isMultiplayerBossFight = false;
        this.bossFightMyTurn = false;
        MusicPlayer.playCategory('game');
    },

    renderBossSkills() {
        var container = document.getElementById('combat-skills');
        if (!container) return;
        // Sadece fighter degisince rebuild et
        if (this._bossSkillsForFighter !== this.currentFighterIndex) {
            this._bossSkillsForFighter = this.currentFighterIndex;
            this._bossSkillBtns = {};
            container.innerHTML = '';
            var fighter = this.fighters[this.currentFighterIndex];
            if (!fighter || !fighter.isPlayer || this.state !== 'PLAYER_TURN') return;
            var self = this;
            fighter.skills.forEach(function(skill) {
                var btn = document.createElement('div');
                btn.className = 'skill-card';
                btn.setAttribute('data-skill-id', skill.id);
                var icon = skill.type === 'physical' ? '⚔️' : skill.type === 'magic' ? '🔮' : skill.type === 'heal' ? '💚' : skill.type === 'buff' ? '🛡️' : '❓';
                var typeLabel2 = skill.type === 'physical' ? 'Fiziksel' : skill.type === 'magic' ? 'Büyü' : skill.type === 'heal' ? 'Şifa' : skill.type === 'buff' ? 'Güçlendirme' : skill.type === 'debuff' ? 'Zayıflatma' : 'Özel';
                var scaleLabel2 = skill.scaleStat === 'atk' ? 'ATK' : skill.scaleStat === 'mag' ? 'BÜYÜ' : skill.scaleStat === 'def' ? 'DEF' : skill.scaleStat === 'spd' ? 'HIZ' : 'CAN';
                var dmgInfo2 = skill.type === 'heal' ? (scaleLabel2 + '×' + skill.scaleFactor + ' iyileştirme') : skill.type === 'buff' || skill.type === 'debuff' ? skill.description : (scaleLabel2 + '×' + skill.scaleFactor + (skill.baseEffect > 0 ? ' +' + skill.baseEffect : '') + ' hasar');
                var tt2 = '<div class=\"skill-tooltip\"><b>' + skill.name + '</b><br>' +
                    '<span class=\"tt-type\">' + typeLabel2 + '</span> | ' + dmgInfo2 + '<br>' +
                    (skill.manaCost > 0 ? '💧Mana: ' + skill.manaCost + ' | ' : '') +
                    '⏳CD: ' + skill.cooldown + ' tur' +
                    (skill.target === 'all_enemies' ? ' | 🎯 Alan hasarı' : skill.target === 'all_allies' ? ' | 🎯 Tüm takım' : '') +
                    '<br><span style=\"font-size:0.6rem;color:#999\">' + skill.description + '</span></div>';
                btn.innerHTML = icon + '<span class=\"skill-name\">' + skill.name + '</span>' + (skill.manaCost > 0 ? '<span class=\"skill-mana\">' + skill.manaCost + '💧</span>' : '') + tt2;
                btn.addEventListener('click', function() { self.useBossSkill(skill.id); });
                container.appendChild(btn);
                self._bossSkillBtns[skill.id] = btn;
            });
        } else {
            // Update states only
            var fighter2 = this.fighters[this.currentFighterIndex];
            if (!fighter2) return;
            var self2 = this;
            fighter2.skills.forEach(function(skill) {
                var btn = self2._bossSkillBtns[skill.id];
                if (!btn) { self2._bossSkillsForFighter = -1; return; }
                var canUse = fighter2.mana >= skill.manaCost &&
                    fighter2.usedThisTurn.indexOf(skill.id) < 0 &&
                    (!skill.cooldown || !fighter2.cooldowns[skill.id] || fighter2.cooldowns[skill.id] <= 0);
                btn.classList.toggle('disabled', !canUse);
            });
        }
    },

    enableBossSkills() {
        this.renderBossSkills();
        var flee = document.getElementById('btn-flee');
        if (flee) {
            if (this.isMultiplayerBossFight) {
                flee.style.display = 'none';
            } else {
                flee.style.display = 'inline-block'; flee.disabled = false; flee.style.opacity = '1'; flee.style.pointerEvents = 'auto';
            }
        }
        var endBtn = document.getElementById('btn-end-turn');
        if (endBtn) { endBtn.style.display = 'inline-block'; endBtn.disabled = false; endBtn.style.opacity = '1'; endBtn.style.pointerEvents = 'auto'; }
        var combatActions = document.getElementById('combat-actions');
        if (combatActions) { combatActions.style.display = 'flex'; combatActions.style.pointerEvents = 'auto'; }
    },

    eatFood() {
        if (this.state !== 'PLAYER_TURN') return;
        if (ResourceManager.food < 5) { this.addLog('Yetersiz yemek! (5 gerekli)', 'miss'); return; }
        var heal = 50;
        if (this.isBossFight) {
            var fighter = this.fighters[this.currentFighterIndex];
            if (fighter && fighter.hp < fighter.maxHp) {
                ResourceManager.spend(0, 0, 0); ResourceManager.food -= 5; ResourceManager.updateHUD();
                fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
                this.addLog(fighter.name + ' yemek yedi! +' + heal + ' HP', 'heal');
            }
        } else {
            if (this.playerHp < this.playerMaxHp) {
                ResourceManager.spend(0, 0, 0); ResourceManager.food -= 5; ResourceManager.updateHUD();
                this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
                this.addLog('Yemek yedin! +' + heal + ' HP', 'heal');
            }
        }
        this.render();
    },

    endBossPlayerTurn() {
        if (this.state !== 'PLAYER_TURN' || !this.isBossFight) return;
        var fighter = this.fighters[this.currentFighterIndex];
        if (!fighter) return;

        if (this.isMultiplayerBossFight) {
            this.addLog(fighter.name + ' turu bitirdi.', '');
            this.bossFightMyTurn = false;
            this.disableBossSkillButtons();
            Multiplayer.send({ type: 'boss-end-turn' });
            return;
        }

        if (fighter) this.addLog(fighter.name + ' turu bitirdi.', '');
        this.nextBossFighter();
    },

    // === MULTIPLAYER BOSS FIGHT METODLARI ===

    startBossFightMultiplayer(msg) {
        if (this.state !== 'IDLE') return;
        this.isBossFight = true;
        this.isMultiplayerBossFight = true;
        this.character = Game.getPlayerCharacter();
        this.bossData = getBossById(msg.bossId);
        this.bossHp = msg.bossHp;
        this.bossMaxHp = msg.bossMaxHp;
        this.bossUltimateReady = false;
        this.bossTurnCounter = 0;
        this.combatLog = [];
        this.turnCount = 0;
        this.fled = false;
        this.activeBuffs = {};
        this.activeDebuffs = {};
        this.state = 'INTRO';
        this.bossFightMyTurn = false;

        var self = this;
        this.fighters = msg.fighters.map(function(f) {
            var char = Game.characters.find(function(c) { return c.id === f.id; });
            return {
                char: char,
                name: f.name,
                hp: f.hp, maxHp: f.maxHp,
                mana: f.mana, maxMana: f.maxMana,
                baseStats: { hp: f.hp || 500, atk: f.atk || 10, def: f.def || 10, mr: f.mr || 0, mag: f.mag || 10, spd: f.spd || 10 },
                skills: f.skills || [],
                cooldowns: {},
                usedThisTurn: [],
                isPlayer: f.id === (Game.getPlayerCharacter() ? Game.getPlayerCharacter().id : null)
            };
        });
        this.currentFighterIndex = 0;

        this.showBossUI();
        this._bossSkillsForFighter = -1;
        this._bossSkillBtns = {};
        MusicPlayer.playCategory('boss');
        this.addLog(this.bossData.name + ' ile karsi karsiyasiniz!', 'intro');
        this.addLog(this.bossData.introText || '', 'desc');
        this.disableBossSkillButtons();
    },

    handleBossWhoseTurn(msg) {
        this.currentFighterIndex = msg.fighterIndex;
        this.bossFightCurrentActorId = msg.fighterId;
        var fighter = this.fighters[msg.fighterIndex];
        if (!fighter || fighter.hp <= 0) return;

        fighter.mana = fighter.maxMana;
        fighter.usedThisTurn = [];
        this.state = 'PLAYER_TURN';

        if (fighter.isPlayer) {
            this.bossFightMyTurn = true;
            this.addLog('Sira sende! (' + fighter.name + ')', 'player');
            this.showBossUI();
            this.enableBossSkills();
        } else {
            this.bossFightMyTurn = false;
            this.addLog('Sira ' + fighter.name + '\'de. Bekleniyor...', '');
            this.showBossUI();
            this.disableBossSkillButtons();
        }
    },

    receiveBossAction(msg) {
        if (msg.actorId === (Game.getPlayerCharacter() ? Game.getPlayerCharacter().id : null)) return;
        var fighter = this.fighters.find(function(f) { return f.char && f.char.id === msg.actorId; });
        if (!fighter) return;
        this.bossHp = msg.newBossHp;
        fighter.hp = msg.newFighterHp;
        fighter.mana = msg.newFighterMana;
        if (msg.damage > 0) {
            this.addLog(fighter.name + ': ' + msg.skillName + '! -' + msg.damage + ' HP' + (msg.isCrit ? ' (Kritik!)' : ''), 'hit');
            this.hitBossEffect(msg.damage, msg.isCrit);
        } else if (msg.heal > 0) {
            this.addLog(fighter.name + ': ' + msg.skillName + '! +' + msg.heal + ' HP', 'heal');
        } else if (msg.endedTurn) {
            this.addLog(fighter.name + ': ' + msg.skillName, '');
        } else {
            this.addLog(fighter.name + ': ' + msg.skillName + '!', '');
        }
        this.showBossUI();
        this.render();
    },

    receiveBossTurn(msg) {
        this.state = 'MONSTER_TURN';
        this.addLog(this.bossData.name + ' ' + msg.skillName + ' kullandi!', 'monster');
        this.hitBossEffect(0, false);
        var self = this;
        msg.damageResults.forEach(function(r) {
            var fighter = self.fighters.find(function(f) { return f.char && f.char.id === r.fighterId; });
            if (fighter) {
                fighter.hp = r.hpAfter;
                self.addLog(fighter.name + ' -' + r.damage + ' HP', 'monster-hit');
            }
        });
        this.bossHp = msg.bossHp;
        if (msg.isUltimate) {
            this.bossUltimateReady = false;
            this.bossTurnCounter = 0;
        }
        this.showBossUI();
        this.render();
        if (this.bossHp <= 0) { this.endBossFight('VICTORY'); return; }
        this.checkBossPhoenixRebirth();
        if (this.fighters.every(function(f) { return f.hp <= 0; })) { this.endBossFight('DEFEAT'); return; }
    },

    receiveBossFightEnd(msg) {
        if (msg.result === 'VICTORY') {
            this.state = 'VICTORY';
            Game.addXP(msg.xpGain);
            if (Game.defeatedBosses.indexOf(msg.bossId) < 0) Game.defeatedBosses.push(msg.bossId);
            Game.autoSave();
            var story = typeof getBossDefeat === 'function' ? getBossDefeat(msg.bossId, msg.fightersFinalNames || []) : '';
            Game.showResult('BOSS YENILDI!', story + '\n\n+' + msg.xpGain + ' XP', {});
            Game.log(this.bossData.name + ' yenildi! +' + msg.xpGain + ' XP', 'event');
        } else {
            this.state = 'DEFEAT';
            Game.characters.forEach(function(c) {
                c.hearts = Math.max(1, c.hearts - 1);
            });
            Game.showResult('Bozgun...', this.bossData.name + ' cok guclu!', {});
            Game.log('Boss savasinda bozguna ugradi!', 'negative');
            Game.renderCharacterBar();
        }
        var self = this;
        document.getElementById('btn-result-continue').onclick = function() {
            Game.hideResult();
            self.hideBossUI();
            self.isBossFight = false;
            self.isMultiplayerBossFight = false;
            self.state = 'IDLE';
            Game.afterAction(Game.getPlayerCharacter(), null, null, 'combat');
        };
    },

    disableBossSkillButtons() {
        var container = document.getElementById('combat-skills');
        if (container) container.innerHTML = '<p style="color:var(--text-dim);text-align:center;font-size:0.75rem;">Bekleniyor...</p>';
        var flee = document.getElementById('btn-flee');
        if (flee) { flee.style.display = 'none'; flee.disabled = true; }
        var endBtn = document.getElementById('btn-end-turn');
        if (endBtn) { endBtn.style.display = 'none'; endBtn.disabled = true; }
        var combatActions = document.getElementById('combat-actions');
        if (combatActions) combatActions.style.display = 'none';
    },

    // ===== PARTİ ZİNDAN SİSTEMİ =====
    isPartyFight: false,
    partyFighters: [],
    partyMonsters: [],
    partyTurnOrder: [], // [{type:'player'|'monster', index}]
    partyTurnIdx: 0,
    partyUsedSkills: {},
    partyCooldowns: {},
    _partySkillsBuilt: false,
    _partySkillBtns: {},

    startPartyCombat: function(fighters, dgSize) {
        if (this.state !== 'IDLE') { this.hide(); }
        this.state = 'INTRO';
        this.isPartyFight = true;
        this.dungeonSize = dgSize || fighters.length;
        this.combatLog = [];
        this.turnCount = 0;
        this.fled = false;
        this.activeBuffs = {};
        this.activeDebuffs = {};
        this._partySkillsBuilt = false;
        this._partySkillBtns = {};
        this.partyUsedSkills = {};
        this.partyCooldowns = {};

        // Karakterleri hazırla
        var self = this;
        this.partyFighters = fighters.map(function(ch) {
            var base = self.getBaseStats(ch);
            var skills = [];
            var basicNames = {irem:'Asa Vuruşu',gokdeniz:'Kılıç Darbesi',noyan:'Kaptan Kancası',begul:'Rün Tokmağı',bedrican:'Taş Yumruk',cansin:'Pençe',gunda:'Toprak Yumruğu',dominic:'Aile Darbesi',bulent:'Diva Tokadı',furkan:'Gölge Hançeri'};
            skills.push({id:'basic',name:basicNames[ch.id]||'Temel Vuruş',type:'physical',scaleStat:'atk',scaleFactor:1.0,baseEffect:0,manaCost:0,cooldown:0,target:'enemy',description:'ATK×1.',rarity:'character',characterId:null});
            var chInv = ch._inv || {};
            var eqSkills = (chInv.equippedSkills && chInv.equippedSkills.length > 0) ? chInv.equippedSkills : (ch.characterSkills || []);
            eqSkills.forEach(function(sid) { var sk = getSkillById(sid); if (sk) skills.push(sk); });
            var f = {
                char: ch,
                name: ch.displayName || ch.name,
                hp: base.hp, maxHp: base.hp,
                mana: Math.max(1, Math.floor(base.mag / 3)),
                maxMana: Math.max(1, Math.floor(base.mag / 3)),
                baseStats: base,
                skills: skills,
                passive: self.getPassive(ch)
            };
            self.partyUsedSkills[f.name] = [];
            self.partyCooldowns[f.name] = {};
            return f;
        });

        // Canavar grubu (zindan büyüklüğüne göre)
        var partySize = fighters.length;
        var dz = this.dungeonSize || partySize;
        var monsterCount, minLevel, maxLevel;
        if (dz <= 1) {
            monsterCount = 1 + Math.floor(Math.random() * 3); // 1-3
            minLevel = 0; maxLevel = 0; // D only
        } else if (dz === 2) {
            monsterCount = 3 + Math.floor(Math.random() * 4); // 3-6
            minLevel = 0; maxLevel = 5;  // D-C
        } else if (dz === 3) {
            monsterCount = 5 + Math.floor(Math.random() * 5); // 5-9
            minLevel = 0; maxLevel = 10; // D-C-B
        } else if (dz === 4) {
            monsterCount = 6 + Math.floor(Math.random() * 6); // 6-11
            minLevel = 5; maxLevel = 15;  // C-B-A
        } else if (dz === 5) {
            monsterCount = 7 + Math.floor(Math.random() * 8); // 7-14
            minLevel = 10; maxLevel = 20; // B-A-S
        } else if (dz === 6) {
            monsterCount = 8 + Math.floor(Math.random() * 9); // 8-16
            minLevel = 15; maxLevel = 25; // A-S
        } else {
            monsterCount = 10 + Math.floor(Math.random() * 11); // 10-20
            minLevel = 15; maxLevel = 30; // A-SS
        }
        this.partyMonsters = [];
        for (var i = 0; i < monsterCount; i++) {
            var levelOffset = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
            var m = getRandomMonster(Game.day + levelOffset);
            m.currentHp = m.hp;
            m.maxHp = m.hp;
            if (partySize >= 2) m.hp = Math.round(m.hp * (1 + partySize * 0.15));
            m.currentHp = m.hp;
            m.maxHp = m.hp;
            m.index = i;
            this.partyMonsters.push(m);
        }

        // Tur sırası: SPD'ye göre hepsini sırala
        this._buildPartyTurnOrder();

        var mNames = this.partyMonsters.map(function(m) { return m.name; }).join(', ');
        this.addLog(partySize + ' kişilik ekip zindana girdi!', 'intro');
        this.addLog(mNames + ' ortaya çıktı! (' + monsterCount + ' düşman)', 'intro');

        document.getElementById('card-area').style.display = 'none';
        document.getElementById('combat-area').style.display = 'block';
        this.showPartyUI();
        MusicPlayer.playCategory('battle');

        var self2 = this;
        setTimeout(function() { self2._startPartyTurn(); }, 1500);
    },

    _buildPartyTurnOrder: function() {
        this.partyTurnOrder = [];
        var self = this;
        // Tüm karakterleri ekle
        this.partyFighters.forEach(function(f, i) {
            self.partyTurnOrder.push({ type: 'player', index: i, spd: f.baseStats.spd || 10 });
        });
        // Tüm canavarları ekle
        this.partyMonsters.forEach(function(m, i) {
            self.partyTurnOrder.push({ type: 'monster', index: i, spd: m.speed || 8 });
        });
        // SPD'ye göre sırala (yüksekten düşüğe)
        this.partyTurnOrder.sort(function(a, b) { return b.spd - a.spd; });
        this.partyTurnIdx = 0;
    },

    showPartyUI: function() {
        var self = this;
        // Canavar kutusu
        var monContainer = document.getElementById('combat-monsters');
        if (monContainer) {
            monContainer.innerHTML = '';
            var monCount = this.partyMonsters.length;
            var isMobile = window.innerWidth <= 600;
            var cols;
            if (monCount <= 2) cols = monCount;
            else if (monCount <= 3) cols = 3;
            else cols = isMobile ? 3 : 4;
            monContainer.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
            if (monCount >= 4) {
                monContainer.classList.add('compact');
            } else {
                monContainer.classList.remove('compact');
            }
            this.partyMonsters.forEach(function(m) {
                var rarity = m.rarity || 'D';
                var rarityColor = RARITY_COLOR[rarity] || '#888';
                var portrait = getMonsterPortrait(m.id);
                var box = document.createElement('div');
                box.className = 'monster-mini-box no-portrait';
                box.id = 'party-monster-box-' + m.index;
                box.style.borderColor = rarityColor;
                if (portrait) {
                    box.classList.remove('no-portrait');
                    box.style.backgroundImage = 'url(' + portrait + ')';
                }
                box.innerHTML = '<div class="monster-overlay">' +
                    '<span class="monster-mini-name"><span class="monster-rarity-badge" style="background:' + rarityColor + '">' + rarity + '</span> ' + m.name + '</span>' +
                    '<span class="monster-mini-type" style="color:' + rarityColor + '">' + rarity + ' Seviye</span>' +
                    '<div class="hp-bar-container mini-hp"><div class="hp-bar-track mini-track"><div class="hp-bar-fill monster-hp" id="party-monster-hp-' + m.index + '"></div></div><span class="hp-bar-text" id="party-monster-hpt-' + m.index + '">' + m.currentHp + '/' + m.maxHp + '</span></div>' +
                    '</div>';
                monContainer.appendChild(box);
            });
        }

        // Karakterleri göster
        var playerBox = document.getElementById('combat-player-box');
        if (playerBox) {
            var cols = this.partyFighters.length <= 2 ? 1 : this.partyFighters.length <= 4 ? 2 : 3;
            playerBox.innerHTML = '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:4px;">' +
                this.partyFighters.map(function(f, i) {
                    var port = f.char.portrait || '';
                    return '<div class="party-fighter-card" id="party-fighter-' + i + '" style="background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:6px;text-align:center;">' +
                        (port ? '<img src="' + port + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--border-gold);">' : '') +
                        '<div style="font-size:0.65rem;color:var(--text-light);">' + f.name + '</div>' +
                        '<div class="hp-bar-container mini-hp"><div class="hp-bar-track mini-track" style="width:50px;"><div class="hp-bar-fill player-hp" id="party-fighter-hp-' + i + '" style="background:linear-gradient(90deg,#2d6b2d,#4a9a4a);"></div></div><span class="hp-bar-text" style="font-size:0.5rem;" id="party-fighter-hpt-' + i + '">' + f.hp + '/' + f.maxHp + '</span></div>' +
                        '<div style="font-size:0.55rem;color:#5588cc;">💧<span id="party-fighter-mp-' + i + '">' + f.mana + '/' + f.maxMana + '</span></div>' +
                        '</div>';
                }).join('') + '</div>';
        }

        // Başlangıçta aksiyon butonlarını gizle
        var endBtn = document.getElementById('btn-end-turn');
        var fleeBtn = document.getElementById('btn-flee');
        if (endBtn) endBtn.style.display = 'none';
        if (fleeBtn) { fleeBtn.style.display = 'none'; fleeBtn.disabled = true; }

        this.renderPartySkills();
        this._renderPartyState();
    },

    _startPartyTurn: function() {
        // Tur indeksini ilerlet, ölüleri atla
        var startIdx = this.partyTurnIdx;
        var found = false;
        var loopCount = 0;
        while (loopCount < this.partyTurnOrder.length * 2) {
            var entry = this.partyTurnOrder[this.partyTurnIdx];
            if (entry.type === 'player') {
                var f = this.partyFighters[entry.index];
                if (f && f.hp > 0 && !f.fled) { found = true; break; }
            } else {
                var m = this.partyMonsters[entry.index];
                if (m && m.currentHp > 0) { found = true; break; }
            }
            this.partyTurnIdx = (this.partyTurnIdx + 1) % this.partyTurnOrder.length;
            loopCount++;
        }
        if (!found) {
            if (this.partyMonsters.every(function(m) { return m.currentHp <= 0; })) {
                this._endPartyCombat('VICTORY');
            } else if (this.partyFighters.every(function(f) { return f.hp <= 0 || f.fled; })) {
                this._endPartyCombat('DEFEAT');
            }
            return;
        }

        var active = this.partyTurnOrder[this.partyTurnIdx];
        if (active.type === 'player') {
            var fighter = this.partyFighters[active.index];
            fighter.mana = fighter.maxMana;
            this.partyUsedSkills[fighter.name] = [];
            this.state = 'PLAYER_TURN';
            this._renderPartyState();
            this.renderPartySkills();
            this._highlightPartyActor('player', active.index);
            this.addLog('Sıra ' + fighter.name + '\'de!', 'player');
        } else {
            var monster = this.partyMonsters[active.index];
            this.state = 'MONSTER_TURN';
            this._highlightPartyActor('monster', active.index);
            this.addLog(monster.name + ' saldırıyor...', 'monster');
            var self = this;
            setTimeout(function() { self._partyMonsterAttack(monster); }, 700);
        }
    },

    _highlightPartyActor: function(type, idx) {
        // Karakter kartlarını temizle
        this.partyFighters.forEach(function(f, i) {
            var el = document.getElementById('party-fighter-' + i);
            if (el) el.style.borderColor = (type === 'player' && i === idx) ? 'var(--gold)' : 'rgba(255,255,255,0.1)';
        });
        // Canavar kutularını temizle
        this.partyMonsters.forEach(function(m, i) {
            var el = document.getElementById('party-monster-box-' + i);
            if (el) el.style.borderColor = (type === 'monster' && i === idx) ? '#ff4444' : (RARITY_COLOR[m.rarity] || '#888');
        });
    },

    _partyMonsterAttack: function(monster) {
        var roll = this.rollD20();
        var dmg = roll + monster.attackBonus;
        // Rastgele hedef seç
        var aliveFighters = this.partyFighters.filter(function(f) { return f.hp > 0 && !f.fled; });
        if (aliveFighters.length === 0) { this._endPartyCombat('DEFEAT'); return; }
        var target = aliveFighters[Math.floor(Math.random() * aliveFighters.length)];

        this.addLog(monster.name + ' ' + target.name + '\'e saldırdı! (zAR:' + roll + '+' + monster.attackBonus + '=' + dmg + ')', 'monster');
        var stats = target.baseStats;
        var reduced = this.reduceDamage(dmg, monster.dmgType || 'physical', {defense: stats.def || 0, mr: stats.mr || 0});
        target.hp = Math.max(0, target.hp - reduced);
        this.addLog(target.name + ' -' + reduced + ' HP (' + target.hp + '/' + target.maxHp + ')', 'monster-hit');

        var fighterEl = document.getElementById('party-fighter-' + this.partyFighters.indexOf(target));
        if (fighterEl) this.hitEffect(fighterEl, reduced, roll === 20);
        this._renderPartyState();

        if (this.partyFighters.every(function(f) { return f.hp <= 0 || f.fled; })) { this._endPartyCombat('DEFEAT'); return; }

        // Sonraki tura geç
        var self = this;
        this.partyTurnIdx = (this.partyTurnIdx + 1) % this.partyTurnOrder.length;
        setTimeout(function() { self._startPartyTurn(); }, 800);
    },

    partyUseSkill: function(skillId) {
        if (this.state !== 'PLAYER_TURN') return;
        var entry = this.partyTurnOrder[this.partyTurnIdx];
        var fighter = this.partyFighters[entry.index];
        if (!fighter) return;
        var skill = skillId === 'basic' ? fighter.skills[0] : getSkillById(skillId);
        if (!skill) return;

        // Skill kullanılabilir mi?
        if (fighter.mana < skill.manaCost) return;
        var used = this.partyUsedSkills[fighter.name] || [];
        var cds = this.partyCooldowns[fighter.name] || {};
        if (used.indexOf(skill.id) >= 0) return;
        if (skill.cooldown > 0 && cds[skill.id] && cds[skill.id] > 0) return;

        // Skill'i uygula
        fighter.mana -= skill.manaCost;
        used.push(skill.id);
        if (skill.cooldown > 0) cds[skill.id] = skill.cooldown;
        this.partyUsedSkills[fighter.name] = used;
        this.partyCooldowns[fighter.name] = cds;

        var stats = fighter.baseStats;
        var dmg = 0, heal = 0;
        var aliveMonsters = this.partyMonsters.filter(function(m) { return m.currentHp > 0; });
        var targetMon = aliveMonsters[0];
        var monEl = targetMon ? document.getElementById('party-monster-box-' + targetMon.index) : null;

        if (skill.type === 'physical' || skill.type === 'magic') {
            var statVal = stats[skill.scaleStat] || stats.atk;
            dmg = Math.round(statVal * skill.scaleFactor) + (skill.baseEffect || 0);
            var dmgType = skill.type === 'magic' ? 'magic' : 'physical';
            if (skill.target === 'all_enemies') {
                var self = this;
                this.partyMonsters.forEach(function(m) {
                    if (m.currentHp > 0) {
                        var actual = self.reduceDamage(dmg, dmgType, m);
                        m.currentHp = Math.max(0, m.currentHp - actual);
                        self.addLog(m.name + ' -' + actual + ' HP', 'hit');
                    }
                });
                this.addLog(fighter.name + ': ' + skill.name + '! (Alan hasarı: ' + dmg + ')', 'hit');
                if (dmg > 20) this._playArenaFlash(dmgType === 'magic' ? 'purple' : 'red');
            } else if (targetMon) {
                var actual = this.reduceDamage(dmg, dmgType, targetMon);
                targetMon.currentHp = Math.max(0, targetMon.currentHp - actual);
                this.addLog(fighter.name + ': ' + skill.name + '! -' + actual + ' HP', 'hit');
                if (monEl) this.hitEffect(monEl, actual, false, dmgType);
            }
            // Furkan vampiric pasif
            if (fighter.passive && fighter.passive.effect === 'vampiricTouch' && dmg > 0) {
                var vampHeal = Math.round(dmg * 0.25);
                fighter.hp = Math.min(fighter.maxHp, fighter.hp + vampHeal);
                this.addLog('Kan Calma: +' + vampHeal + ' HP', 'heal');
            }
        } else if (skill.type === 'heal') {
            heal = Math.round((stats.mag || 10) * skill.scaleFactor) + (skill.baseEffect || 0);
            if (skill.target === 'all_allies') {
                var self2 = this;
                this.partyFighters.forEach(function(f) {
                    if (f.hp > 0) {
                        f.hp = Math.min(f.maxHp, f.hp + heal);
                        self2.addLog(f.name + ' +' + heal + ' HP!', 'heal');
                        var fel = document.getElementById('party-fighter-' + self2.partyFighters.indexOf(f));
                        if (fel) self2._playHealEffect(fel, heal);
                    }
                });
            } else {
                fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
                this.addLog(fighter.name + ' +' + heal + ' HP!', 'heal');
                var fel2 = document.getElementById('party-fighter-' + entry.index);
                if (fel2) this._playHealEffect(fel2, heal);
            }
        } else if (skill.type === 'buff') {
            var bufStat = skill.scaleStat;
            var bufVal = skill.baseEffect || Math.round(stats[bufStat] * 0.3);
            this.activeBuffs['party_' + bufStat] = { value: bufVal, turns: Math.max(1, skill.cooldown - 1) };
            this.addLog(fighter.name + ': ' + bufStat.toUpperCase() + ' +' + bufVal, 'buff');
        } else if (skill.type === 'debuff') {
            this.activeDebuffs['party_debuff'] = { turns: 2 };
            this.addLog(fighter.name + ': ' + skill.name + '!', 'debuff');
            if (targetMon) {
                var mel2 = document.getElementById('party-monster-box-' + targetMon.index);
                if (mel2) this._playDebuffEffect(mel2);
            }
        }

        // Legendary/epic efekt
        if (skill.rarity === 'legendary') {
            var self3 = this;
            this._playArenaFlash('purple');
            setTimeout(function() { self3._playArenaFlash('red'); }, 250);
        } else if (skill.rarity === 'epic' && dmg > 20) {
            this._playArenaFlash(skill.type === 'magic' ? 'purple' : 'red');
        }

        this._renderPartyState();
        this.renderPartySkills();

        if (this.partyMonsters.every(function(m) { return m.currentHp <= 0; })) { this._endPartyCombat('VICTORY'); return; }
        if (this.partyFighters.every(function(f) { return f.hp <= 0 || f.fled; })) { this._endPartyCombat('DEFEAT'); return; }

        // Aynı turda kullanılabilecek skill kaldı mı?
        var self4 = this;
        var canContinue = fighter.skills.some(function(s) {
            var used2 = self4.partyUsedSkills[fighter.name] || [];
            var cds2 = self4.partyCooldowns[fighter.name] || {};
            if (fighter.mana < s.manaCost) return false;
            if (used2.indexOf(s.id) >= 0) return false;
            if (s.cooldown > 0 && cds2[s.id] && cds2[s.id] > 0) return false;
            return true;
        });
        if (!canContinue) {
            self4.addLog(fighter.name + ': Kullanilabilir skill kalmadi.', 'miss');
            // Sonraki tura geç
            self4.partyTurnIdx = (self4.partyTurnIdx + 1) % self4.partyTurnOrder.length;
            setTimeout(function() { self4._startPartyTurn(); }, 500);
        }
    },

    partyEndTurn: function() {
        if (this.state !== 'PLAYER_TURN') return;
        var entry = this.partyTurnOrder[this.partyTurnIdx];
        var fighter = this.partyFighters[entry.index];
        this.addLog(fighter.name + ' turu bitirdi.', '');
        this.partyTurnIdx = (this.partyTurnIdx + 1) % this.partyTurnOrder.length;
        var self = this;
        setTimeout(function() { self._startPartyTurn(); }, 300);
    },

    partyFlee: function() {
        if (this.state !== 'PLAYER_TURN') return;
        var entry = this.partyTurnOrder[this.partyTurnIdx];
        var fighter = this.partyFighters[entry.index];

        // Multiplayer: kacis mesajini diger oyunculara gonder
        if (Game.isMultiplayer && typeof Multiplayer !== 'undefined') {
            Multiplayer.dungeonFlee(fighter.name + ' zindandan kacti!');
        }

        // Can yarıdan azsa: 1 kalp kaybeder
        if (fighter.hp < fighter.maxHp / 2) {
            fighter.char.hearts = Math.max(1, fighter.char.hearts - 1);
            this.addLog(fighter.name + ' cani yariya indiginde kacarsa 1 kalp kaybeder! (-1❤️)', 'monster-hit');
        } else {
            // Normal kaçış: %50 hasar
            if (Math.random() > 0.5) {
                var aliveMonsters = this.partyMonsters.filter(function(m) { return m.currentHp > 0; });
                var attacker = aliveMonsters[Math.floor(Math.random() * aliveMonsters.length)];
                if (attacker) {
                    var dmg = attacker.attackBonus + this.rollD(8);
                    fighter.hp = Math.max(0, fighter.hp - this.reduceDamage(dmg, attacker.dmgType || 'physical', fighter.baseStats));
                    this.addLog(fighter.name + ' kacarken ' + dmg + ' hasar aldi!', 'monster-hit');
                }
            } else {
                this.addLog(fighter.name + ' kacmayi basardi!', 'flee');
            }
        }
        // Bu fighter kaçtı, devam et
        fighter.fled = true;
        fighter.hp = 0;
        this._renderPartyState();
        // Kalan canlı fighter var mı?
        var aliveFighters = this.partyFighters.filter(function(f) { return f.hp > 0 && !f.fled; });
        if (aliveFighters.length === 0) {
            this._endPartyCombat('DEFEAT');
            return;
        }
        // Sonraki tura geç
        this.partyTurnIdx = (this.partyTurnIdx + 1) % this.partyTurnOrder.length;
        var self = this;
        setTimeout(function() { self._startPartyTurn(); }, 400);
    },

    renderPartySkills: function() {
        var container = document.getElementById('combat-skills');
        if (!container) return;
        var entry = this.partyTurnOrder[this.partyTurnIdx];
        if (!entry || entry.type !== 'player' || this.state !== 'PLAYER_TURN') {
            container.innerHTML = '<p style="color:var(--text-dim);text-align:center;font-size:0.75rem;">Bekleniyor...</p>';
            return;
        }
        var fighter = this.partyFighters[entry.index];
        if (!this._partySkillsBuilt || this._partySkillsFor !== fighter.name) {
            this._partySkillsBuilt = true;
            this._partySkillsFor = fighter.name;
            this._partySkillBtns = {};
            container.innerHTML = '';
            var self = this;
            fighter.skills.forEach(function(skill) {
                var icon = skill.type === 'physical' ? '⚔️' : skill.type === 'magic' ? '🔮' : skill.type === 'heal' ? '💚' : skill.type === 'buff' ? '🛡️' : skill.type === 'debuff' ? '💀' : '❓';
                var typeLabel = skill.type === 'physical' ? 'Fiziksel' : skill.type === 'magic' ? 'Büyü' : skill.type === 'heal' ? 'Şifa' : skill.type === 'buff' ? 'Güçlendirme' : skill.type === 'debuff' ? 'Zayıflatma' : 'Özel';
                var scaleLabel = skill.scaleStat === 'atk' ? 'ATK' : skill.scaleStat === 'mag' ? 'BÜYÜ' : skill.scaleStat === 'def' ? 'DEF' : skill.scaleStat === 'spd' ? 'HIZ' : 'CAN';
                var dmgInfo = skill.type === 'heal' ? (scaleLabel + '×' + skill.scaleFactor + ' iyileştirme') : skill.type === 'buff' || skill.type === 'debuff' ? skill.description : (scaleLabel + '×' + skill.scaleFactor + (skill.baseEffect > 0 ? ' +' + skill.baseEffect : '') + ' hasar');
                var tt = '<div class=\"skill-tooltip\"><b>' + skill.name + '</b><br>' +
                    '<span class=\"tt-type\">' + typeLabel + '</span> | ' + dmgInfo + '<br>' +
                    (skill.manaCost > 0 ? '💧Mana: ' + skill.manaCost + ' | ' : '') +
                    '⏳CD: ' + skill.cooldown + ' tur' +
                    (skill.target === 'all_enemies' ? ' | 🎯 Alan hasarı' : skill.target === 'all_allies' ? ' | 🎯 Tüm takım' : '') +
                    '<br><span style=\"font-size:0.6rem;color:#999\">' + skill.description + '</span></div>';
                var btn = document.createElement('div');
                btn.className = 'skill-card';
                btn.setAttribute('data-skill-id', skill.id);
                btn.innerHTML = icon + '<span class="skill-name">' + skill.name + '</span>' +
                    (skill.manaCost > 0 ? '<span class="skill-mana">' + skill.manaCost + '💧</span>' : '') + tt;
                btn.addEventListener('click', function() { self.partyUseSkill(skill.id); });
                container.appendChild(btn);
                self._partySkillBtns[skill.id] = btn;
            });
        } else {
            // Update states only
            var self2 = this;
            var used = this.partyUsedSkills[fighter.name] || [];
            var cds = this.partyCooldowns[fighter.name] || {};
            var anyMissing2 = false;
            fighter.skills.forEach(function(skill) {
                var btn = self2._partySkillBtns[skill.id];
                if (!btn) { anyMissing2 = true; return; }
                var canUse = fighter.mana >= skill.manaCost &&
                    used.indexOf(skill.id) < 0 &&
                    (!skill.cooldown || !cds[skill.id] || cds[skill.id] <= 0);
                btn.classList.toggle('disabled', !canUse);
            });
            if (anyMissing2) { self2._partySkillsBuilt = false; self2.renderPartySkills(); return; }
        }

        // Yemek Ye butonu
        var foodBtn = document.getElementById('btn-eat-food');
        if (foodBtn) {
            foodBtn.style.display = this.state === 'PLAYER_TURN' ? 'inline-block' : 'none';
            var canEat = ResourceManager.food >= 5 && fighter.hp < fighter.maxHp;
            foodBtn.disabled = !canEat;
            foodBtn.style.opacity = canEat ? '1' : '0.5';
            foodBtn.textContent = '🍗 Yemek Ye (5🍗 → 50HP) [' + ResourceManager.food + '🍗]';
            foodBtn.onclick = function() {
                if (ResourceManager.food >= 5 && fighter.hp < fighter.maxHp) {
                    ResourceManager.food -= 5; ResourceManager.updateHUD();
                    fighter.hp = Math.min(fighter.maxHp, fighter.hp + 50);
                    self2.addLog(fighter.name + ' yedi! +50 HP', 'heal');
                    self2._renderPartyState();
                    self2.renderPartySkills();
                }
            };
        }

        // Sırayı Bitir
        var endBtn = document.getElementById('btn-end-turn');
        if (endBtn) {
            endBtn.style.display = this.state === 'PLAYER_TURN' ? 'block' : 'none';
        }
        // Kaç
        var fleeBtn = document.getElementById('btn-flee');
        if (fleeBtn) {
            fleeBtn.style.display = this.state === 'PLAYER_TURN' ? 'inline-block' : 'none';
            fleeBtn.disabled = false;
            fleeBtn.style.opacity = '1';
            fleeBtn.style.pointerEvents = 'auto';
        }
    },

    _renderPartyState: function() {
        var self = this;
        this.partyMonsters.forEach(function(m) {
            var fill = document.getElementById('party-monster-hp-' + m.index);
            var txt = document.getElementById('party-monster-hpt-' + m.index);
            var box = document.getElementById('party-monster-box-' + m.index);
            if (fill) fill.style.width = Math.round((m.currentHp / m.maxHp) * 100) + '%';
            if (txt) txt.textContent = m.currentHp + '/' + m.maxHp;
            if (box) box.classList.toggle('dead', m.currentHp <= 0);
        });
        this.partyFighters.forEach(function(f, i) {
            var fill = document.getElementById('party-fighter-hp-' + i);
            var txt = document.getElementById('party-fighter-hpt-' + i);
            var mp = document.getElementById('party-fighter-mp-' + i);
            var card = document.getElementById('party-fighter-' + i);
            if (f.fled) {
                if (card) { card.style.opacity = '0.4'; card.style.borderColor = '#666'; }
                if (fill) fill.style.width = '0%';
                if (txt) txt.textContent = 'KAÇTI';
                if (mp) mp.textContent = '-';
            } else {
                if (card) { card.style.opacity = '1'; card.style.borderColor = ''; }
                if (fill) {
                    var pct = Math.round((f.hp / f.maxHp) * 100);
                    fill.style.width = pct + '%';
                    if (pct < 25) fill.style.background = 'linear-gradient(90deg,#8b2020,#c84040)';
                    else if (pct < 50) fill.style.background = 'linear-gradient(90deg,#8b6d20,#c8a840)';
                    else fill.style.background = 'linear-gradient(90deg,#2d6b2d,#4a9a4a)';
                }
                if (txt) txt.textContent = f.hp + '/' + f.maxHp;
                if (mp) mp.textContent = f.mana + '/' + f.maxMana;
            }
        });
        var logEl = document.getElementById('combat-log-entries');
        if (logEl) logEl.innerHTML = this.combatLog.slice(-5).map(function(e) { return '<div class="combat-log-entry ' + e.cls + '">' + e.msg + '</div>'; }).join('');
    },

    _endPartyCombat: function(result) {
        this.state = result;
        var isVictory = result === 'VICTORY';
        var totalGold = 0, totalFood = 0, totalWood = 0, totalMaden = 0;
        if (isVictory) {
            var partyMult = this.partyFighters.length;
            this.partyMonsters.forEach(function(m) {
                totalGold += m.rewards.gold * partyMult + Math.floor(Math.random() * 5);
                totalFood += m.rewards.food * partyMult + Math.floor(Math.random() * 3);
                totalWood += m.rewards.wood * partyMult + Math.floor(Math.random() * 3);
                var rarityMaden = { D:[2,5], C:[3,8], B:[5,12], A:[8,18], S:[12,25], SS:[20,45] };
                var range = rarityMaden[m.rarity] || [2,4];
                totalMaden += range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
            });
            if (totalGold > 0) ResourceManager.addGold(totalGold);
            if (totalFood > 0) ResourceManager.addFood(totalFood);
            if (totalWood > 0) ResourceManager.addWood(totalWood);
            if (totalMaden > 0) ResourceManager.addMaden(totalMaden);
        }
        var rewardText = [];
        if (totalGold > 0) rewardText.push(totalGold + ' altin');
        if (totalFood > 0) rewardText.push(totalFood + ' yemek');
        if (totalWood > 0) rewardText.push(totalWood + ' odun');
        if (totalMaden > 0) rewardText.push(totalMaden + ' maden');

        this.hide();
        this.isPartyFight = false;
        this.partyFighters = [];
        this.partyMonsters = [];
        MusicPlayer.playCategory('game');

        var char = Game.getPlayerCharacter();
        if (isVictory) {
            var newSkill = null;
            if (Math.random() < 0.5) { newSkill = getRandomSkill('common'); if (Math.random() < 0.2) newSkill = getRandomSkill('rare'); if (Math.random() < 0.08) newSkill = getRandomSkill('epic'); }
            if (newSkill && (!Game.acquiredSkills || Game.acquiredSkills.indexOf(newSkill.id) < 0)) {
                if (!Game.acquiredSkills) Game.acquiredSkills = [];
                Game.acquiredSkills.push(newSkill.id);
            }
            Game.showResult('Zafer!', 'Parti zindani temizlendi!\nOduller: ' + (rewardText.join(', ') || 'Yok') + (newSkill ? '\n\nYeni skill: ' + newSkill.name : ''), {});
            Game.log('Parti zindani kazanildi! (' + rewardText.join(', ') + ')', 'positive');
        } else if (result === 'FLEE') {
            Game.showResult('Kactiniz', 'Parti zindandan kacti.', {});
            Game.log('Parti zindandan kacti.', '');
            Game.renderCharacterBar();
        } else {
            this.partyFighters.forEach(function(f) {
                if (f.hp <= 0 && !f.fled) f.char.hearts = Math.max(1, f.char.hearts - 1);
            });
            Game.showResult('Bozgun...', 'Parti zindanda yenildi! Herkes -1 kalp.', { heart: -1 });
            Game.log('Parti zindaninda bozguna ugradi!', 'negative');
            Game.renderCharacterBar();
        }
        document.getElementById('btn-result-continue').onclick = function() {
            Game.hideResult();
            CombatSystem.hide();
            Game.afterAction(char, null, null, 'combat');
        };
        Game.autoSave();
    },

};
