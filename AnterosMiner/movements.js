const logger = require('./utils/logger');
const config = require('./config.json');

class MovementController {
    constructor(bot) {
        this.bot = bot;
        this.isMoving = false;
        this.currentMovement = null;
        this.movementInterval = null;
        this.jumpInterval = null;
        this.pauseTimeout = null;
        
        // Movement configuration
        this.movementConfig = config.movement;
        
        // Available movement directions
        this.movements = ['forward', 'back', 'left', 'right'];
        this.currentDirection = null;
        this.lookAroundInterval = null;
        this.inventoryInterval = null;
        this.sprintInterval = null;
        this.sneakInterval = null;
    }

    startRandomMovement() {
        if (this.movementInterval) {
            this.stop();
        }

        logger.info('Starting enhanced anti-AFK movement pattern');
        
        // Start the main movement loop
        this.scheduleNextMovement();
        
        // Start random jumping
        this.startRandomJumping();
        
        // Start additional anti-AFK behaviors
        this.startLookingAround();
        this.startInventoryActions();
        this.startContinuousVariations();
    }

    scheduleNextMovement() {
        if (!this.bot || !this.bot.entity) {
            return;
        }

        const pauseDuration = this.getRandomDuration(
            this.movementConfig.pauseDuration.min,
            this.movementConfig.pauseDuration.max
        );

        this.pauseTimeout = setTimeout(() => {
            this.executeRandomMovement();
        }, pauseDuration);
    }

    executeRandomMovement() {
        if (!this.bot || !this.bot.entity) {
            return;
        }

        // Stop current movement
        this.stopCurrentMovement();

        // Decide whether to change direction or continue
        const shouldChangeDirection = Math.random() < this.movementConfig.directionChangeChance || !this.currentDirection;
        
        if (shouldChangeDirection) {
            this.currentDirection = this.getRandomMovement();
        }

        // Start movement
        this.startMovement(this.currentDirection);

        // Schedule movement duration
        const moveDuration = this.getRandomDuration(
            this.movementConfig.walkDuration.min,
            this.movementConfig.walkDuration.max
        );

        this.movementInterval = setTimeout(() => {
            this.stopCurrentMovement();
            this.scheduleNextMovement();
        }, moveDuration);

        logger.debug(`Moving ${this.currentDirection} for ${moveDuration}ms`);
    }

    startMovement(direction) {
        if (!this.bot) return;

        try {
            switch (direction) {
                case 'forward':
                    this.bot.setControlState('forward', true);
                    break;
                case 'back':
                    this.bot.setControlState('back', true);
                    break;
                case 'left':
                    this.bot.setControlState('left', true);
                    break;
                case 'right':
                    this.bot.setControlState('right', true);
                    break;
            }
            this.isMoving = true;
            this.currentMovement = direction;
        } catch (error) {
            logger.error('Error starting movement:', error.message);
        }
    }

    stopCurrentMovement() {
        if (!this.bot || !this.isMoving) return;

        try {
            // Stop all movement controls
            this.bot.setControlState('forward', false);
            this.bot.setControlState('back', false);
            this.bot.setControlState('left', false);
            this.bot.setControlState('right', false);
            
            this.isMoving = false;
            this.currentMovement = null;
        } catch (error) {
            logger.error('Error stopping movement:', error.message);
        }
    }

    startRandomJumping() {
        const scheduleNextJump = () => {
            const jumpDelay = this.getRandomDuration(
                this.movementConfig.jumpInterval.min,
                this.movementConfig.jumpInterval.max
            );

            this.jumpInterval = setTimeout(() => {
                this.executeJump();
                scheduleNextJump(); // Schedule the next jump
            }, jumpDelay);
        };

        scheduleNextJump();
    }

    executeJump() {
        if (!this.bot || !this.bot.entity) {
            return;
        }

        try {
            // Check if bot is on ground before jumping
            if (this.bot.entity.onGround) {
                this.bot.setControlState('jump', true);
                
                // Release jump after a short duration
                setTimeout(() => {
                    if (this.bot) {
                        this.bot.setControlState('jump', false);
                    }
                }, 100);
                
                logger.debug('Bot jumped');
            }
        } catch (error) {
            logger.error('Error executing jump:', error.message);
        }
    }

    getRandomMovement() {
        return this.movements[Math.floor(Math.random() * this.movements.length)];
    }

    getRandomDuration(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Enhanced movement variations for better AFK prevention
    addMovementVariation() {
        if (!this.bot || !this.isMoving) return;

        // More frequent sprinting
        if (Math.random() < 0.3) {
            try {
                this.bot.setControlState('sprint', true);
                setTimeout(() => {
                    if (this.bot) {
                        this.bot.setControlState('sprint', false);
                    }
                }, this.getRandomDuration(500, 2000));
            } catch (error) {
                logger.error('Error toggling sprint:', error.message);
            }
        }

        // More frequent looking around
        if (Math.random() < 0.4) {
            this.lookAround();
        }

        // Random crouching while moving
        if (Math.random() < 0.15) {
            try {
                this.bot.setControlState('sneak', true);
                setTimeout(() => {
                    if (this.bot) {
                        this.bot.setControlState('sneak', false);
                    }
                }, this.getRandomDuration(300, 1000));
            } catch (error) {
                logger.error('Error toggling sneak:', error.message);
            }
        }
    }

    // Start continuous movement variations
    startContinuousVariations() {
        const variationSchedule = () => {
            const variationDelay = this.getRandomDuration(3000, 8000);
            setTimeout(() => {
                this.addMovementVariation();
                variationSchedule();
            }, variationDelay);
        };
        variationSchedule();
    }

    lookAround() {
        if (!this.bot) return;

        try {
            const yaw = (Math.random() - 0.5) * Math.PI; // Random yaw between -π/2 and π/2
            const pitch = (Math.random() - 0.5) * 0.5; // Small pitch variation
            
            this.bot.look(yaw, pitch, false);
        } catch (error) {
            logger.error('Error looking around:', error.message);
        }
    }

    startLookingAround() {
        const lookSchedule = () => {
            const lookDelay = this.getRandomDuration(8000, 20000);
            this.lookAroundInterval = setTimeout(() => {
                this.lookAround();
                lookSchedule();
            }, lookDelay);
        };
        lookSchedule();
    }

    startInventoryActions() {
        const inventorySchedule = () => {
            const inventoryDelay = this.getRandomDuration(15000, 30000);
            this.inventoryInterval = setTimeout(() => {
                this.performInventoryAction();
                inventorySchedule();
            }, inventoryDelay);
        };
        inventorySchedule();
    }

    performInventoryAction() {
        if (!this.bot) return;
        
        try {
            // Randomly open and close inventory
            if (Math.random() < 0.3) {
                logger.debug('Opening inventory');
                // Simulate opening inventory by looking at different angles
                this.bot.look(this.bot.entity.yaw + 0.1, this.bot.entity.pitch - 0.1, false);
                setTimeout(() => {
                    if (this.bot) {
                        this.bot.look(this.bot.entity.yaw - 0.1, this.bot.entity.pitch + 0.1, false);
                    }
                }, 500);
            }
            
            // Random crouch/uncrouch
            if (Math.random() < 0.2) {
                this.bot.setControlState('sneak', true);
                setTimeout(() => {
                    if (this.bot) {
                        this.bot.setControlState('sneak', false);
                    }
                }, this.getRandomDuration(500, 2000));
            }
        } catch (error) {
            logger.error('Error performing inventory action:', error.message);
        }
    }

    stop() {
        logger.info('Stopping movement controller');
        
        // Clear all intervals and timeouts
        if (this.movementInterval) {
            clearTimeout(this.movementInterval);
            this.movementInterval = null;
        }

        if (this.jumpInterval) {
            clearTimeout(this.jumpInterval);
            this.jumpInterval = null;
        }

        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
            this.pauseTimeout = null;
        }

        if (this.lookAroundInterval) {
            clearTimeout(this.lookAroundInterval);
            this.lookAroundInterval = null;
        }

        if (this.inventoryInterval) {
            clearTimeout(this.inventoryInterval);
            this.inventoryInterval = null;
        }

        // Stop current movement
        this.stopCurrentMovement();
    }

    getStatus() {
        return {
            isMoving: this.isMoving,
            currentMovement: this.currentMovement,
            currentDirection: this.currentDirection
        };
    }
}

module.exports = MovementController;
