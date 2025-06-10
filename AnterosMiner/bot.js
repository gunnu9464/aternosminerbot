const mineflayer = require('mineflayer');
const MovementController = require('./movements');
const logger = require('./utils/logger');
const config = require('./config.json');

class MinecraftBot {
    constructor(serverConfig) {
        this.serverConfig = serverConfig;
        this.bot = null;
        this.movementController = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = config.bot.maxReconnectAttempts;
        this.reconnectDelay = config.bot.reconnectDelay;
        this.isRunning = false;
        this.reconnectTimeout = null;

        this.connect();
    }

    connect() {
        if (this.isRunning) {
            logger.warn('Bot is already running, skipping connection attempt');
            return;
        }

        logger.info('Attempting to connect to Minecraft server...');
        
        try {
            this.bot = mineflayer.createBot({
                host: this.serverConfig.host,
                port: this.serverConfig.port,
                username: this.serverConfig.username,
                version: this.serverConfig.version,
                auth: 'offline', // Most Aternos servers use offline mode
                skipValidation: true,
                hideErrors: false,
                checkTimeoutInterval: 60000,
                keepAlive: true
            });

            this.setupEventHandlers();
            this.isRunning = true;
        } catch (error) {
            logger.error('Failed to create bot:', error.message);
            this.handleReconnect();
        }
    }

    setupEventHandlers() {
        // Successful login
        this.bot.on('login', () => {
            logger.info(`Successfully logged in as ${this.bot.username}`);
            this.reconnectAttempts = 0;
        });

        // Bot spawned in world
        this.bot.on('spawn', () => {
            logger.info('Bot spawned in world, starting AFK behavior...');
            this.startAFKBehavior();
        });

        // Handle chat messages (for monitoring)
        this.bot.on('chat', (username, message) => {
            if (username !== this.bot.username) {
                logger.info(`[Chat] ${username}: ${message}`);
            }
        });

        // Handle server messages
        this.bot.on('message', (message) => {
            const text = message.toString();
            if (text.includes('kicked') || text.includes('banned') || text.includes('timeout')) {
                logger.warn(`Server message: ${text}`);
            }
        });

        // Handle disconnection
        this.bot.on('end', (reason) => {
            logger.warn(`Bot disconnected: ${reason || 'Unknown reason'}`);
            if (reason === 'socketClosed') {
                logger.info('Connection closed during handshake - server may have anti-bot protection');
            }
            this.cleanup();
            this.handleReconnect();
        });

        // Handle errors
        this.bot.on('error', (error) => {
            logger.error(`Bot error: ${error.message}`);
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                logger.error('Connection refused or host not found');
            } else if (error.message.includes('Invalid username')) {
                logger.error('Username may be invalid - try a different name');
            } else if (error.message.includes('outdated')) {
                logger.error('Version mismatch - server may be using different Minecraft version');
            }
            logger.debug('Full error details:', error);
        });

        // Handle kick events
        this.bot.on('kicked', (reason) => {
            logger.warn(`Bot was kicked: ${reason}`);
            this.cleanup();
            this.handleReconnect();
        });

        // Health monitoring
        this.bot.on('health', () => {
            if (this.bot.health <= 5) {
                logger.warn(`Low health: ${this.bot.health}/20`);
            }
        });

        // Death handling
        this.bot.on('death', () => {
            logger.warn('Bot died, respawning...');
            if (this.bot) {
                this.bot.respawn();
            }
        });
    }

    startAFKBehavior() {
        if (!this.bot || !this.bot.entity) {
            logger.error('Cannot start AFK behavior: bot not properly initialized');
            return;
        }

        // Initialize movement controller
        this.movementController = new MovementController(this.bot);
        this.movementController.startRandomMovement();

        logger.info('AFK behavior started - bot will now walk and jump randomly');
    }

    handleReconnect() {
        if (!this.isRunning) {
            return; // Bot was manually stopped
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping bot.`);
            this.stop();
            return;
        }

        this.reconnectAttempts++;
        // Progressive delay: start with 15s, then 30s, 45s, etc.
        const baseDelay = this.reconnectDelay;
        const delay = baseDelay + (this.reconnectAttempts * 15000);
        
        logger.info(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay/1000} seconds...`);
        logger.info('Server may be restarting or have anti-bot protection. Waiting longer...');
        
        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    cleanup() {
        if (this.movementController) {
            this.movementController.stop();
            this.movementController = null;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    stop() {
        logger.info('Stopping bot...');
        this.isRunning = false;
        
        this.cleanup();

        if (this.bot) {
            try {
                this.bot.quit('AFK Bot shutting down');
            } catch (error) {
                logger.warn('Error during bot shutdown:', error.message);
            }
            this.bot = null;
        }

        logger.info('Bot stopped successfully');
    }

    // Public methods for external control
    getStatus() {
        return {
            isRunning: this.isRunning,
            isConnected: this.bot && this.bot.player,
            reconnectAttempts: this.reconnectAttempts,
            username: this.bot ? this.bot.username : null,
            health: this.bot ? this.bot.health : null,
            position: this.bot && this.bot.entity ? this.bot.entity.position : null
        };
    }
}

module.exports = MinecraftBot;
