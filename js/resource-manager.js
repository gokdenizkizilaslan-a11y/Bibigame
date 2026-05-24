/* ===== BIBIGAME - Kaynak Yöneticisi ===== */

const ResourceManager = {
    food: 10,
    wood: 5,
    gold: 3,
    maden: 0,

    init(food = 10, wood = 5, gold = 3, maden = 0) {
        this.food = food;
        this.wood = wood;
        this.gold = gold;
        this.maden = maden || 0;
        this.updateHUD();
    },

    addFood(amount) {
        this.food = Math.max(0, this.food + amount);
        this.updateHUD();
    },

    addWood(amount) {
        this.wood = Math.max(0, this.wood + amount);
        this.updateHUD();
    },

    addGold(amount) {
        this.gold = Math.max(0, this.gold + amount);
        this.updateHUD();
    },

    addMaden(amount) {
        this.maden = Math.max(0, this.maden + amount);
        this.updateHUD();
    },

    canAfford(food, wood, gold, maden) {
        return this.food >= (food || 0) &&
               this.wood >= (wood || 0) &&
               this.gold >= (gold || 0) &&
               this.maden >= (maden || 0);
    },

    spend(food, wood, gold, maden) {
        if (!this.canAfford(food, wood, gold, maden)) return false;
        if (food) this.food -= food;
        if (wood) this.wood -= wood;
        if (gold) this.gold -= gold;
        if (maden) this.maden -= maden;
        this.updateHUD();
        return true;
    },

    getDailyFoodConsumption(characterCount) {
        return characterCount;
    },

    consumeDailyFood(characterCount) {
        const cost = this.getDailyFoodConsumption(characterCount);
        this.food = Math.max(0, this.food - cost);
        this.updateHUD();
        return this.food > 0;
    },

    updateHUD() {
        const foodEl = document.getElementById('food-count');
        const woodEl = document.getElementById('wood-count');
        const goldEl = document.getElementById('gold-count');
        const madenEl = document.getElementById('maden-count');
        if (foodEl) foodEl.textContent = this.food;
        if (woodEl) woodEl.textContent = this.wood;
        if (goldEl) goldEl.textContent = this.gold;
        if (madenEl) madenEl.textContent = this.maden;

        // Düşük kaynak uyarısı
        [foodEl, woodEl, goldEl].forEach(el => {
            if (!el) return;
            const val = parseInt(el.textContent);
            el.classList.toggle('resource-low', val <= 1);
        });
    },

    getSnapshot() {
        return { food: this.food, wood: this.wood, gold: this.gold, maden: this.maden };
    },

    loadSnapshot(snap) {
        this.food = snap.food;
        this.wood = snap.wood;
        this.gold = snap.gold;
        this.maden = snap.maden || 0;
        this.updateHUD();
    }
};
