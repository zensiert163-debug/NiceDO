class Enemy {
    constructor(x, y, wave = 1) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.width = 24;
        this.height = 24;
        
        this.health = 20 + (wave * 5);
        this.maxHealth = this.health;
        this.damage = 5 + (wave * 2);
        this.scoreReward = 10 + (wave * 5);
        this.speed = 2 + (wave * 0.5);
        
        this.rotation = 0;
        this.shootTimer = 0;
    }
    
    update(player) {
        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
            this.rotation = Math.atan2(dy, dx);
        }
        
        this.shootTimer++;
    }
    
    takeDamage(damage) {
        this.health -= damage;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw enemy ship
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, -10);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Draw health bar
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - 15, this.y - 30, 30, 4);
        
        const healthRatio = this.health / this.maxHealth;
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(this.x - 15, this.y - 30, 30 * healthRatio, 4);
    }
}
