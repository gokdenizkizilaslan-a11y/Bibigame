/* ===== BIBIGAME - Kayıt Sistemi ===== */

const SAVE_KEY = 'bibigame_save';

function saveGame(gameState) {
    const saveData = {
        version: '0.1.0',
        timestamp: Date.now(),
        gameState: gameState
    };
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        return true;
    } catch (e) {
        console.error('Kayıt başarısız:', e);
        return false;
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const saveData = JSON.parse(raw);
        return saveData.gameState;
    } catch (e) {
        console.error('Yükleme başarısız:', e);
        return null;
    }
}

function hasSaveData() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
}

function getSaveInfo() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
        const data = JSON.parse(raw);
        const dt = new Date(data.timestamp);
        const gs = data.gameState;
        return {
            day: gs.day,
            character: gs.characters ? gs.characters[0]?.name : '?',
            date: dt.toLocaleDateString('tr-TR'),
            time: dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
    } catch (e) {
        return null;
    }
}
