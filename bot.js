const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TOKEN = process.env.BOT_TOKEN || '8575247623:AAEbjBhY67yTBoNX3HKpblqncDEw_zwkQaA';
const GAME_WEB_APP_URL = 'https://courageous-chimera-65cd3c.netlify.app'; // የ Keno ድረ-ገጽህ ሊንክ

// የቴሌግራም ቦት ማስጀመር
const bot = new TelegramBot(TOKEN, { polling: true });

// Render Health Check እንዳያቋርጠው Express Server መክፈት
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Ethio Keno Bot is active!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// /start ሲባል የሚወጣው ሜኑ
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'ተጫዋች';

  const welcomeText = `ሰላም ${firstName}! 👋\nወደ **Ethio Keno Game** እንኳን ደህና መጡ።\n\nከታች ያሉትን አማራጮች በመጠቀም መጫወት ይችላሉ።`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 Start Game (መጫወት)', web_app: { url: GAME_WEB_APP_URL } }],
        [
          { text: '📥 Deposit (ገንዘብ ማስገባት)', callback_data: 'btn_deposit' },
          { text: '📤 Withdraw (ገንዘብ ማውጣት)', callback_data: 'btn_withdraw' }
        ],
        [{ text: '⚙️ Admin', callback_data: 'btn_admin' }]
      ]
    },
    parse_mode: 'Markdown'
  };

  bot.sendMessage(chatId, welcomeText, keyboard);
});

// የቁልፎች ምላሽ
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'btn_deposit') {
    bot.sendMessage(chatId, '📥 **Deposit:**\n\nበቴሌብር ወይም ባንክ ገቢ ያድርጉ።\n\n📱 Telebirr: 09xxxxxxxx\n💳 CBE: 1000xxxxxxxxx');
  } else if (data === 'btn_withdraw') {
    bot.sendMessage(chatId, '📤 **Withdraw:**\n\nየሚያወጡትን መጠን እና ስልክ ቁጥር ይጻፉ።');
  } else if (data === 'btn_admin') {
    bot.sendMessage(chatId, '⚙️ ይህ ክፍል ለአድሚን ብቻ የተፈቀደ ነው።');
  }

  bot.answerCallbackQuery(query.id);
});

bot.on('polling_error', (err) => console.error(err));
