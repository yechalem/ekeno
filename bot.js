// 1. የቴሌግራም ላይብረሪ ጥሪ አስተካክል
const TelegramBotModule = require('node-telegram-bot-api');
const TelegramBot = TelegramBotModule.default || TelegramBotModule;
const http = require('http');

// 2. የቴሌግራም ቦት Token
const TOKEN = process.env.BOT_TOKEN || '8575247623:AAEbjBhY67yTBoNX3HKpblqncDEw_zwkQaA';

// 3. የቦት ኢንስታንስ መፍጠር
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 ቦቱ በትክክል ስራ ጀምሯል...');

// 4. Render እንዳይዘጋው Dummy HTTP Server መፍጠር
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running successfully!');
}).listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// 5. /start ሲባል የሚመልሰው መልእክት
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'ወዳጄ';

  bot.sendMessage(
    chatId,
    `ሰላም ${firstName}! 👋\nወደ ekeno ቦት እንኳን ደህና መጡ።\n\nእንዴት ልረዳዎ እችላለሁ?`
  );
});

// 6. ማንኛውም መልእክት ሲላክለት የሚሰጠው ምላሽ
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && !text.startsWith('/start')) {
    console.log(`ከ ${msg.from.first_name} የተላከ መልእክት፦ ${text}`);
    bot.sendMessage(chatId, `እነሆ የላኩትን መልእክት ተቀብያለሁ፦ "${text}"`);
  }
});

// 7. የፖሊንግ ስህተት እንዳይዘጋ ይከታተላል
bot.on('polling_error', (error) => {
  console.error('Polling Error:', error.code || error.message);
});
