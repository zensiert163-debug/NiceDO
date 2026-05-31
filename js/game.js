class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
        
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        this.keys = {};
        this.setupInputHandlers();
        
        this.score = 0;
        this.wave = 1;
        this.enemySpawnTimer = 0;
        
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        
        this.gameLoop();
    }
    
    resizeCanvas() {
        if (this.isMobile) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            this.canvas.width = window.innerWidth - 250;
            this.canvas.height = window.innerHeight;
            if (this.minimapCanvas) {
                this.minimapCanvas.width = 230;
                this.minimapCanvas.height = 150;
            }
        }
    }
    
    setupInputHandlers() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Desktop mouse aiming
        if (!this.isMobile) {
            document.addEventListener('mousemove', (e) => {
                this.player.setTarget(e.clientX, e.clientY);
            });
            
            document.addEventListener('click', () => {
                this.player.shoot();
            });
        } else {
            // Mobile touch aiming (but not on controls)
            document.addEventListener('touchmove', (e) => {
                if (e.target === this.canvas) {
                    const touch = e.touches[0];
                    this.lastTouchX = touch.clientX;
                    this.lastTouchY = touch.clientY;
                    this.player.setTarget(touch.clientX, touch.clientY);
                }
            });
        }
    }
    
    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: x = Math.random() * this.canvas.width; y = -50; break;
            case 1: x = this.canvas.width + 50; y = Math.random() * this.canvas.height; break;
            case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 50; break;
            case 3: x = -50; y = Math.random() * this.canvas.height; break;
        }
        
        this.enemies.push(new Enemy(x, y, this.wave));
    }
    
    update() {
        // Update Player
        this.player.update(this.keys, this.canvas.width, this.canvas.height);
        
        // Update Enemies
        this.enemies.forEach((enemy, index) => {
            enemy.update(this.player);
            
            if (enemy.health <= 0) {
                this.score += enemy.scoreReward;
                this.enemies.splice(index, 1);
                this.createExplosion(enemy.x, enemy.y);
            }
        });
        
        // Update Projectiles
        this.projectiles.forEach((projectile, index) => {
            projectile.update();
            
            if (projectile.isOutOfBounds(this.canvas.width, this.canvas.height)) {
                this.projectiles.splice(index, 1);
            }
        });
        
        // Update Particles
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.alpha <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // Collision Detection
        this.checkCollisions();
        
        // Spawn Enemies
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer > 120 - (this.wave * 5)) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // Wave Management
        if (this.enemies.length === 0 && this.enemySpawnTimer === 0) {
            this.wave++;
            this.updateWaveDisplay();
        }
    }
    
    updateWaveDisplay() {
        const waveElement = document.getElementById('wave');
        const waveDesktopElement = document.getElementById('wave-desktop');
        if (waveElement) waveElement.textContent = this.wave;
        if (waveDesktopElement) waveDesktopElement.textContent = this.wave;
    }
    
    checkCollisions() {
        // Projectile vs Enemy
        this.projectiles.forEach((projectile, pIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                const distance = Math.hypot(
                    projectile.x - enemy.x,
                    projectile.y - enemy.y
                );
                
                if (distance < projectile.radius + enemy.radius) {
                    enemy.takeDamage(projectile.damage);
                    this.projectiles.splice(pIndex, 1);
                    this.createExplosion(projectile.x, projectile.y);
                }
            });
        });
        
        // Enemy vs Player
        this.enemies.forEach((enemy) => {
            const distance = Math.hypot(
                enemy.x - this.player.x,
                enemy.y - this.player.y
            );
            
            if (distance < enemy.radius + this.player.radius) {
                this.player.takeDamage(enemy.damage);
                enemy.takeDamage(10);
            }
        });
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y));
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw game objects
        this.player.draw(this.ctx);
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Draw HUD
        this.drawHUD();
        
        // Draw minimap only on desktop
        if (!this.isMobile && this.minimapCtx) {
            this.drawMinimap();
        }
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = 0.5;
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.canvas.width;
            const y = (i * 47) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawHUD() {
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = 'bold 16px Arial';
        
        // Desktop HUD
        if (!this.isMobile) {
            this.ctx.fillText(`Wave: ${this.wave}`, 20, 30);
            this.ctx.fillText(`Score: ${this.score}`, 20, 60);
            this.ctx.fillText(`Enemies: ${this.enemies.length}`, 20, 90);
        }
    }
    
    drawMinimap() {
        if (!this.minimapCtx) return;
        
        const mapWidth = this.minimapCanvas.width;
        const mapHeight = this.minimapCanvas.height;
        const scaleX = mapWidth / this.canvas.width;
        const scaleY = mapHeight / this.canvas.height;
        
        this.minimapCtx.fillStyle = '#0a0e27';
        this.minimapCtx.fillRect(0, 0, mapWidth, mapHeight);
        
        // Draw player
        this.minimapCtx.fillStyle = '#00ff88';
        this.minimapCtx.fillRect(
            this.player.x * scaleX - 2,
            this.player.y * scaleY - 2,
            4, 4
        );
        
        // Draw enemies
        this.minimapCtx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            this.minimapCtx.fillRect(
                enemy.x * scaleX - 1,
                enemy.y * scaleY - 1,
                2, 2
            );
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
});