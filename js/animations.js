/* ===== BIBIGAME - Arka Plan Animasyonları ===== */

const Animations = {
    canvas: null,
    ctx: null,
    particles: [],
    animFrame: null,

    init() {
        this.canvas = document.getElementById('particles-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Parçacıkları oluştur (ateşböcekleri / kül)
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3 - 0.2,
                opacity: Math.random() * 0.5 + 0.1,
                freq: Math.random() * 0.02 + 0.01,
                offset: Math.random() * Math.PI * 2,
                life: 0
            });
        }

        this.loop();
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    loop() {
        this.animFrame = requestAnimationFrame(() => this.loop());
        this.update();
        this.draw();
    },

    update() {
        for (const p of this.particles) {
            p.life += p.freq;
            p.x += p.speedX + Math.sin(p.life + p.offset) * 0.1;
            p.y += p.speedY;
            p.opacity = 0.1 + Math.sin(p.life) * 0.25 + 0.3;

            // Canvas sınırlarını aşarsa yeniden başlat
            if (p.y < -10) { p.y = this.canvas.height + 10; p.x = Math.random() * this.canvas.width; }
            if (p.y > this.canvas.height + 10) { p.y = -10; p.x = Math.random() * this.canvas.width; }
            if (p.x < -10) p.x = this.canvas.width + 10;
            if (p.x > this.canvas.width + 10) p.x = -10;
        }
    },

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 180, 60, ${p.opacity})`;
            ctx.fill();
            // Işıma efekti
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 160, 40, ${p.opacity * 0.2})`;
            ctx.fill();
        }
    },

    cardDeal(element) {
        element.style.animation = 'none';
        element.offsetHeight; // reflow
        element.style.animation = 'slideUp 0.4s ease-out';
    },

    heartFlash(element) {
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = 'pulse 0.5s 3';
    },

    resultPopup(element) {
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = 'slideUp 0.5s ease-out';
    }
};
