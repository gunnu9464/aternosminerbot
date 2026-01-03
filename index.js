const mineflayer = require('mineflayer');
const express = require('express');

// 🌐 Express server to keep Render alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(PORT, () => console.log(`🌍 Web server active on port ${PORT}`));

// 🔁 Bot creation with auto-reconnect
function createBot() {
  let bot;

  try {
    bot = mineflayer.createBot({
      host: 'XDserverOP.aternos.me',
      port: 48903,
      username: 'billi_mausi',
      auth: 'offline'
    });

    bot.on('spawn', () => {
      console.log('✅ billi_mausi joined the server!');

      // Movement loop every second
      setInterval(() => {
        bot.setControlState('forward', true);
        bot.setControlState('back', true);
        bot.setControlState('left', true);
        bot.setControlState('right', true);
        bot.setControlState('jump', true);
        bot.setControlState('sprint', true);
        bot.setControlState('sneak', true);

        setTimeout(() => {
          bot.setControlState('forward', false);
          bot.setControlState('back', false);
          bot.setControlState('left', false);
          bot.setControlState('right', false);
          bot.setControlState('jump', false);
          bot.setControlState('sprint', false);
          bot.setControlState('sneak', false);
        }, 500);
      }, 1000);
    });

    bot.on('end', () => {
      console.log('🔄 Disconnected. Retrying in 15 seconds...');
      setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => {
      console.log('⚠️ Bot error:', err.message);
      setTimeout(createBot, 15000);
    });

  } catch (e) {
    console.log('💥 Crash caught:', e.message);
    setTimeout(createBot, 15000);
  }
}

createBot();
