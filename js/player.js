class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.width = 30;
        this.height = 30;
        
        this.health = 100;
        this.maxHealth = 100;
        this.shield = 50;
        this.maxShield = 50;
        
        this.speed = 5;
        this.rotation = 0;
        this.targetX = x;
        this.targetY = y;
        
        this.weapon = new Weapon();
        this.credits = 0;
        
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.rotation = Math.atan2(dy, dx);
    }
    
    update(keys, canvasWidth, canvasHeight) {
        let moveX = 0;
        let moveY = 0;
        
        if (this.isMobile && window.touchInput) {
            // Mobile touch input
            const touchInput = window.touchInput.getInput();
            moveX = touchInput.moveX;
            moveY = touchInput.moveY;
        } else {
            // Desktop keyboard input
            if (keys['w'] || keys['ArrowUp']) moveY -= 1;
            if (keys['s'] || keys['ArrowDown']) moveY += 1;
            if (keys['a'] || keys['ArrowLeft']) moveX -= 1;
            if (keys['d'] || keys['ArrowRight']) moveX += 1;
        }
        
        // Normalize diagonal movement
        const magnitude = Math.hypot(moveX, moveY);
        if (magnitude > 0) {
            moveX = (moveX / magnitude) * this.speed;
            moveY = (moveY / magnitude) * this.speed;
            
            this.x += moveX;
            this.y += moveY;
        }
        
        // Boundary checking
        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
        
        // Regenerate shield
        if (this.shield < this.maxShield) {
            this.shield += 0.1;
        }
        
        // Update UI
        const hpElement = document.getElementById('hp') || document.getElementById('hp-desktop');
        const shieldElement = document.getElementById('shield') || document.getElementById('shield-desktop');
        const creditsElement = document.getElementById('credits');
        
        if (hpElement) hpElement.textContent = Math.ceil(this.health);
        if (shieldElement) shieldElement.textContent = Math.ceil(this.shield);
        if (creditsElement) creditsElement.textContent = this.credits;
    }
    
    shoot() {
        if (window.game) {
            const projectiles = this.weapon.fire(this.x, this.y, this.rotation);
            window.game.projectiles.push(...projectiles);
        }
    }
    
    takeDamage(damage) {
        const shieldAbsorb = Math.min(this.shield, damage);
        this.shield -= shieldAbsorb;
        const remainingDamage = damage - shieldAbsorb;
        this.health -= remainingDamage;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw ship
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -12);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 12);
        ctx.closePath();
        ctx.fill();
        
        // Draw shield indicator
        const shieldRatio = this.shield / this.maxShield;
        ctx.strokeStyle = `rgba(0, 100, 255, ${shieldRatio})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
        
        // Draw health bar
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - 20, this.y - 35, 40, 5);
        
        const healthRatio = this.health / this.maxHealth;
        ctx.fillStyle = healthRatio > 0.5 ? '#00ff88' : '#ff6600';
        ctx.fillRect(this.x - 20, this.y - 35, 40 * healthRatio, 5);
    }
}