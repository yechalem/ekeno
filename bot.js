// 1. ላይብረሪውን በትክክል መጥራት (ይህ መስመር ነው ስህተቱን የሚያስተካክለው)
const TelegramBot = require('node-telegram-bot-api');

// 2. የቴሌግራም ቦት Token አስገባ (ከ BotFather የተቀበልከውን)
const TOKEN = process.env.BOT_TOKEN || '1234567890:ABCdefGHIjklMNOpqrsTUVwxyZ';

// 3. የቦት ኢንስታንስ መፍጠር (polling: true በመጠቀም)
const bot = new TelegramBot(TOKEN, { polling: true });

// ቦቱ መስራት ሲጀምር Console ላይ የሚታይ መልእክት
console.log('🤖 ቦቱ በትክክል ስራ ጀምሯል...');

// 4. /start ሲባል የሚመልሰው መልእክት
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'ወዳጄ';

  bot.sendMessage(
    chatId,
    `ሰላም ${firstName}! 👋\nወደ ekeno ቦት እንኳን ደህና መጡ።\n\nእንዴት ልረዳዎ እችላለሁ?`
  );
});

// 5. ማንኛውም መልእክት ሲላክለት የሚሰጠው ምላሽ
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // /start ትእዛዝ ካልሆነ ብቻ ምላሽ ይስጥ
  if (text && !text.startsWith('/start')) {
    console.log(`ከ ${msg.from.first_name} የተላከ መልእክት፦ ${text}`);
    
    // እዚህ ላይ ለተጠቃሚው የሚላከውን ምላሽ ማስተካከል ትችላለህ
    bot.sendMessage(chatId, `እነሆ የላኩትን መልእክት ተቀብያለሁ፦ "${text}"`);
  }
});

// 6. የፖሊንግ ስህተት (Polling Error) እንዳይዘጋ ይከታተላል
bot.on('polling_error', (error) => {
  console.error('Polling Error:', error.code || error.message);
});
