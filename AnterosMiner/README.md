# Minecraft AFK Bot for Aternos

A Node.js bot that automatically walks and jumps in Minecraft to prevent AFK timeouts on your Aternos server.

## Features

- **Automatic Movement**: Random walking patterns (forward, backward, left, right)
- **Random Jumping**: Prevents AFK detection with natural jumping intervals
- **Connection Management**: Automatic reconnection with exponential backoff
- **Error Handling**: Robust error handling for connection issues
- **Aternos Compatible**: Works perfectly with Aternos free Minecraft servers
- **Configurable**: Easy configuration for different servers and behavior
- **Logging**: Detailed logging with configurable levels

## Quick Setup for Aternos

1. **Get your Aternos server address**:
   - Go to your Aternos dashboard
   - Start your Minecraft server
   - Copy the server address (it looks like: `yourservername.aternos.me`)

2. **Configure the bot**:
   - Open `config.json` file
   - Replace `CHANGE_THIS_TO_YOUR_ATERNOS_SERVER` with your actual server name
   - Replace `CHANGE_THIS_TO_YOUR_BOT_NAME` with any username you want for the bot
   - Make sure your Aternos server allows offline mode players (most do by default)

3. **Start the bot**:
   - The bot will automatically install dependencies and start
   - It will connect to your server and begin walking and jumping randomly
   - The bot will automatically reconnect if disconnected

## Configuration Example

```json
{
    "server": {
        "host": "myserver.aternos.me",
        "port": 25565,
        "version": "1.20.1"
    },
    "bot": {
        "username": "MyAFKBot",
        "reconnectDelay": 5000,
        "maxReconnectAttempts": 10
    }
}
```

## Installation

Dependencies are automatically installed when the bot starts:
```bash
npm install mineflayer
