class Weapon {
    constructor() {
        this.fireRate = 10;
        this.damage = 25;
        this.projectileSpeed = 8;
        this.lastShot = 0;
    }
    
    fire(x, y, rotation) {
        const now = Date.now();
        const projectiles = [];
        
        if (now - this.lastShot > this.fireRate) {
            projectiles.push(new Projectile(
                x,
                y,
                rotation,
                this.projectileSpeed,
                this.damage
            ));
            this.lastShot = now;
        }
        
        return projectiles;
    }
}

class Projectile {
    constructor(x, y, rotation, speed, damage) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.speed = speed;
        this.damage = damage;
        this.radius = 4;
        
        this.vx = Math.cos(rotation) * speed;
        this.vy = Math.sin(rotation) * speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    isOutOfBounds(canvasWidth, canvasHeight) {
        return this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw projectile trail
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
        ctx.stroke();
    }
}
