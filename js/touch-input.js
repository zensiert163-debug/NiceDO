class TouchInput {
    constructor() {
        this.joystickContainer = document.getElementById('joystick-container');
        this.joystickStick = document.getElementById('joystick-stick');
        this.shootButton = document.getElementById('shoot-button');
        
        this.joystickRadius = 60; // Half of 120px container
        this.joystickCenterX = 0;
        this.joystickCenterY = 0;
        this.joystickActive = false;
        
        this.touchInput = {
            moveX: 0,
            moveY: 0,
            isShooting: false
        };
        
        this.isMobile = this.checkIsMobile();
        
        if (this.isMobile) {
            this.setupTouchHandlers();
        }
    }
    
    checkIsMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    setupTouchHandlers() {
        // Joystick touch handlers
        this.joystickContainer.addEventListener('touchstart', (e) => this.handleJoystickStart(e), false);
        this.joystickContainer.addEventListener('touchmove', (e) => this.handleJoystickMove(e), false);
        this.joystickContainer.addEventListener('touchend', (e) => this.handleJoystickEnd(e), false);
        this.joystickContainer.addEventListener('touchcancel', (e) => this.handleJoystickEnd(e), false);
        
        // Shoot button handlers
        this.shootButton.addEventListener('touchstart', (e) => this.handleShootStart(e), false);
        this.shootButton.addEventListener('touchend', (e) => this.handleShootEnd(e), false);
        this.shootButton.addEventListener('touchcancel', (e) => this.handleShootEnd(e), false);
        
        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target === this.joystickContainer || e.target === this.shootButton || 
                e.target.parentElement === this.joystickContainer) {
                e.preventDefault();
            }
        }, false);
    }
    
    handleJoystickStart(e) {
        e.preventDefault();
        this.joystickActive = true;
        
        const rect = this.joystickContainer.getBoundingClientRect();
        this.joystickCenterX = rect.left + rect.width / 2;
        this.joystickCenterY = rect.top + rect.height / 2;
        
        this.updateJoystickPosition(e.touches[0]);
    }
    
    handleJoystickMove(e) {
        e.preventDefault();
        if (!this.joystickActive) return;
        
        this.updateJoystickPosition(e.touches[0]);
    }
    
    handleJoystickEnd(e) {
        e.preventDefault();
        this.joystickActive = false;
        this.touchInput.moveX = 0;
        this.touchInput.moveY = 0;
        
        // Reset stick position
        this.joystickStick.style.transform = 'translate(0, 0)';
    }
    
    updateJoystickPosition(touch) {
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        let deltaX = touchX - this.joystickCenterX;
        let deltaY = touchY - this.joystickCenterY;
        
        // Calculate distance from center
        const distance = Math.hypot(deltaX, deltaY);
        const maxDistance = this.joystickRadius - 25; // Stick radius is 25px
        
        // Normalize movement
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * maxDistance;
            deltaY = Math.sin(angle) * maxDistance;
        }
        
        // Update stick position
        this.joystickStick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // Store normalized input (-1 to 1)
        this.touchInput.moveX = (deltaX / maxDistance) * (distance > 15 ? 1 : 0);
        this.touchInput.moveY = (deltaY / maxDistance) * (distance > 15 ? 1 : 0);
    }
    
    handleShootStart(e) {
        e.preventDefault();
        this.touchInput.isShooting = true;
        
        if (window.game && window.game.player) {
            window.game.player.shoot();
        }
    }
    
    handleShootEnd(e) {
        e.preventDefault();
        this.touchInput.isShooting = false;
    }
    
    getInput() {
        return this.touchInput;
    }
}

// Initialize touch input
window.touchInput = null;
window.addEventListener('load', () => {
    window.touchInput = new TouchInput();
});