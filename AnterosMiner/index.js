const MinecraftBot = require("./bot");
const config = require("./config.json");
const logger = require("./utils/logger");

// Override config with environment variables if provided
const serverConfig = {
    host: process.env.MC_HOST || config.server.host,
    port: process.env.MC_PORT || config.server.port,
    username: process.env.MC_USERNAME || config.bot.username,
    version: process.env.MC_VERSION || config.server.version,
};

// Validate required configuration
if (!serverConfig.host || !serverConfig.username) {
    logger.error(
        "Missing required configuration: host and username are required",
    );
    process.exit(1);
}

logger.info("Starting Minecraft AFK Bot...");
logger.info(`Server: ${serverConfig.host}:${serverConfig.port}`);
logger.info(`Username: ${serverConfig.username}`);

// Create and start the bot
const afkBot = new MinecraftBot(serverConfig);

// Handle process termination
process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down bot gracefully...");
    afkBot.stop();
    process.exit(0);
});

process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down bot gracefully...");
    afkBot.stop();
    process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    afkBot.stop();
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});
