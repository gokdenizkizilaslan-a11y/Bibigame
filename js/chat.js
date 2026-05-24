/* ===== BIBIGAME - Oyun Ici Sohbet ===== */

const Chat = {
    messages: [],
    maxMessages: 80,
    visible: true,
    unread: 0,
    _panel: null,
    _list: null,
    _input: null,
    _badge: null,
    _toggle: null,

    init() {
        // Panel HTML'ini oluştur
        var html =
            '<div id="chat-panel" class="chat-panel">' +
            '<div class="chat-header">' +
            '<span>💬 Sohbet</span>' +
            '<span id="chat-unread" class="chat-unread" style="display:none;">0</span>' +
            '<button id="chat-toggle" class="chat-toggle-btn">_</button>' +
            '</div>' +
            '<div id="chat-body" class="chat-body">' +
            '<div id="chat-messages" class="chat-messages"></div>' +
            '<div class="chat-input-row">' +
            '<input type="text" id="chat-input" class="chat-input" placeholder="Mesaj yaz..." maxlength="200">' +
            '<button id="chat-send" class="chat-send-btn">Gönder</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<button id="chat-bubble" class="chat-bubble" style="display:none;" title="Sohbeti aç">💬</button>';

        document.body.insertAdjacentHTML('beforeend', html);

        this._panel = document.getElementById('chat-panel');
        this._list = document.getElementById('chat-messages');
        this._input = document.getElementById('chat-input');
        this._badge = document.getElementById('chat-unread');
        this._toggle = document.getElementById('chat-toggle');
        this._body = document.getElementById('chat-body');
        this._bubble = document.getElementById('chat-bubble');

        var self = this;

        // Toggle butonu
        this._toggle.addEventListener('click', function() {
            self.toggle();
        });

        // Header'a tıkla toggle
        document.querySelector('#chat-panel .chat-header').addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') return;
            self.toggle();
        });

        // Mobil bubble
        this._bubble.addEventListener('click', function() {
            self.show();
            self._bubble.style.display = 'none';
        });

        // Enter ile gönder
        this._input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                self.send();
            }
        });

        // Gönder butonu
        document.getElementById('chat-send').addEventListener('click', function() {
            self.send();
        });

        // Mobilde başlangıçta kapalı
        if (window.innerWidth <= 768) {
            this.visible = false;
            this._body.style.display = 'none';
            this._panel.classList.add('chat-collapsed');
        }
    },

    send() {
        var text = this._input.value.trim();
        if (!text) return;
        // Kendi mesajını hemen göster (local echo)
        var myName = 'Sen';
        if (typeof Game !== 'undefined') {
            var pc = Game.getPlayerCharacter ? Game.getPlayerCharacter() : null;
            if (pc) myName = pc.displayName || pc.name || 'Sen';
        }
        if (Multiplayer.connected) {
            Multiplayer.send({ type: 'chat', text: text });
            // Server broadcast back olarak da gelecek, duplicate olmasın diye
            // receive'te son mesajla aynıysa skip'le
            this._lastSentText = text;
            this._lastSentTime = Date.now();
        }
        this._addMessage(myName, text, Date.now());
        this._input.value = '';
        this._input.focus();
    },

    receive(playerName, characterId, text, time) {
        // Kendi mesajımız server'dan geri geldiyse duplicate etme
        if (this._lastSentText === text && (Date.now() - this._lastSentTime) < 3000) {
            this._lastSentText = null;
            return;
        }
        this._addMessage(playerName, text, time || Date.now());
    },

    _addMessage(author, text, time) {
        this.messages.push({ playerName: author, text: text, time: time || Date.now() });
        if (this.messages.length > this.maxMessages) this.messages.shift();

        var timeStr = new Date(time || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        var entry = document.createElement('div');
        entry.className = 'chat-msg';
        entry.innerHTML = '<span class="chat-time">' + timeStr + '</span> ' +
            '<span class="chat-author">' + this._escape(author) + ':</span> ' +
            '<span class="chat-text">' + this._escape(text) + '</span>';

        this._list.appendChild(entry);
        this._list.scrollTop = this._list.scrollHeight;

        // Panel kapalıysa badge
        if (!this.visible) {
            this.unread++;
            this._badge.textContent = this.unread;
            this._badge.style.display = 'inline';
            if (window.innerWidth <= 768) {
                this._bubble.style.display = 'flex';
            }
        }
    },

    addLocal(author, text) {
        var entry = document.createElement('div');
        entry.className = 'chat-msg chat-local';
        entry.innerHTML = '<span class="chat-author">' + this._escape(author) + ':</span> ' +
            '<span class="chat-text" style="color:#888;">' + this._escape(text) + '</span>';
        this._list.appendChild(entry);
        this._list.scrollTop = this._list.scrollHeight;
    },

    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            this._body.style.display = 'flex';
            this._panel.classList.remove('chat-collapsed');
            this._toggle.textContent = '_';
            this.unread = 0;
            this._badge.style.display = 'none';
            this._bubble.style.display = 'none';
        } else {
            this._body.style.display = 'none';
            this._panel.classList.add('chat-collapsed');
            this._toggle.textContent = '□';
        }
    },

    show() {
        if (!this.visible) this.toggle();
    },

    _escape(s) {
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }
};
