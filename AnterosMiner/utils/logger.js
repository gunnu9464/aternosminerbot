const config = require('../config.json');

class Logger {
    constructor() {
        this.level = config.logging.level || 'info';
        this.enableTimestamp = config.logging.enableTimestamp !== false;
        
        // Log levels
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    formatMessage(level, message, ...args) {
        const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
        const prefix = this.enableTimestamp ? `[${timestamp}] ` : '';
        const levelStr = `[${level.toUpperCase()}]`;
        
        let formattedMessage = `${prefix}${levelStr} ${message}`;
        
        if (args.length > 0) {
            formattedMessage += ' ' + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
        }
        
        return formattedMessage;
    }

    shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
    }

    error(message, ...args) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, ...args));
        }
    }

    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, ...args));
        }
    }

    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, ...args));
        }
    }

    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message, ...args));
        }
    }
}

module.exports = new Logger();
