// 1. ላይብረሪዎችን መጥራት
const TelegramBotModule = require('node-telegram-bot-api');
const TelegramBot = TelegramBotModule.default || TelegramBotModule;
const express = require('express');

// 2. መረጃዎች (Configs)
const TOKEN = process.env.BOT_TOKEN || '8575247623:AAEbjBhY67yTBoNX3HKpblqncDEw_zwkQaA';
const GAME_WEB_APP_URL = 'https://tiny-dasik-98c906.netlify.app';
const ADMIN_ID = 686733543; // 👉 እዚህ ላይ የራስህን የቴሌግራም Numeric ID አስገባ

// 3. ጊዚያዊ የባላንስ መያዣ (Database)
const userBalances = {};

// 4. የቴሌግራም ቦት ማስጀመር
const bot = new TelegramBot(TOKEN, { polling: true });

// 5. Express Server - Health Check እና ለ Netlify App ባላንስ የሚያቀብል API
const app = express();
const PORT = process.env.PORT || 10000;

// CORS ፈቃድ (Netlify App ባላንሱን በ API ለመጠየቅ እንዲችል።)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send('Ethio Keno Bot with Admin & App Balance Control is active!');
});

// 🌐 Netlify Keno App የተጫዋቹን ባላንስ የሚቀበልበት API Endpoint
app.get('/api/balance/:userId', (req, res) => {
  const userId = req.params.userId;
  const balance = userBalances[userId] || 0;
  res.json({ success: true, userId: userId, balance: balance });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 6. /start ሲባል የሚወጣው ዋና ሜኑ
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'ተጫዋች';

  if (!userBalances[chatId]) userBalances[chatId] = 0;

  // 👉 ለ Netlify App የተጫዋቹን Telegram ID በ URL parameter አያይዞ መላክ
  const userGameUrl = `${GAME_WEB_APP_URL}?userId=${chatId}`;

  const welcomeText = `ሰላም ${firstName}! 👋\nወደ **Ethio Keno Game** እንኳን ደህና መጡ።\n\n💰 **የአሁኑ ባላንስዎ፦** ${userBalances[chatId]} ብር\n🆔 **የእርስዎ ID፦** \`${chatId}\``;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 Start Game (መጫወት)', web_app: { url: userGameUrl } }],
        [
          { text: '📥 Deposit (ገንዘብ ማስገባት)', callback_data: 'btn_deposit' },
          { text: '📤 Withdraw (ገንዘብ ማውጣት)', callback_data: 'btn_withdraw' }
        ],
        [{ text: '💰 Balance Check (ባላንስ ማየት)', callback_data: 'btn_balance' }]
      ]
    },
    parse_mode: 'Markdown'
  };

  bot.sendMessage(chatId, welcomeText, keyboard);
});

// 7. የሜኑ ቁልፎች ምላሽ (Inline Buttons)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'btn_deposit') {
    bot.sendMessage(
      chatId,
      `📥 **ገንዘብ ገቢ ማድረጊያ (Deposit):**\n\n1. በቴሌብር ወይም ባንክ ሂሳቡን ያስገቡ፦\n📱 **Telebirr:** 0912345678\n💳 **CBE:** 1000123456789\n\n2. ክፍያ ከፈጸሙ በኋላ **የክፍያውን ደረሰኝ ፎቶ (Screenshot)** አሁን ለቦቱ ይላኩ።\n\n🆔 **የእርስዎ Telegram ID:** \`${chatId}\``,
      { parse_mode: 'Markdown' }
    );
  } else if (data === 'btn_withdraw') {
    bot.sendMessage(
      chatId,
      `📤 **ገንዘብ ማውጫ (Withdraw):**\n\nየሚያወጡትን መጠን እና የተቀባይ ስልክ ቁጥር በሚከተለው ፎርማት ይላኩ፦\n\n\`withdraw 200 Telebirr 0911xxxxxx\`\n\n*(ለምሳሌ፦ withdraw 200 Telebirr 0912345678)*`,
      { parse_mode: 'Markdown' }
    );
  } else if (data === 'btn_balance') {
    const balance = userBalances[chatId] || 0;
    bot.sendMessage(chatId, `💰 **የአሁኑ ባላንስዎ፦** ${balance} ብር`);
  }

  bot.answerCallbackQuery(query.id);
});

// 8. ተጫዋቹ የ Deposit ደረሰኝ (Photo) ሲልክ ለአድሚኑ ማስተላለፍ
bot.on('photo', (msg) => {
  const chatId = msg.chat.id;
  const photoId = msg.photo[msg.photo.length - 1].file_id;
  const senderName = msg.from.first_name || 'ተጠቃሚ';

  bot.sendPhoto(ADMIN_ID, photoId, {
    caption: `📥 **አዲስ የ Deposit ደረሰኝ ደርሷል!**\n\n👤 **የላከው፦** ${senderName}\n🆔 **Telegram ID፦** \`${chatId}\`\n\nገንዘብ ለመጨመር፦\n\`/addmoney ${chatId} መጠን\``,
    parse_mode: 'Markdown'
  });

  bot.sendMessage(chatId, '✅ ደረሰኝዎ ለአድሚን ደርሷል። ተመርምሮ ባላንስዎ ከተረጋገጠ በኋላ ገቢ ይደረግልዎታል!');
});

// 9. ተጫዋቹ Withdraw ጥያቄ ሲልክ ለአድሚኑ ማስተላለፍ
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  if (text.toLowerCase().startsWith('withdraw')) {
    const senderName = msg.from.first_name || 'ተጠቃሚ';

    bot.sendMessage(
      ADMIN_ID,
      `📤 **አዲስ የ Withdraw ጥያቄ!**\n\n👤 **ተጠቃሚ፦** ${senderName}\n🆔 **Telegram ID፦** \`${chatId}\`\n💬 **ዝርዝር፦** ${text}\n\nገንዘቡን ከላኩ በኋላ ከቦቱ ለመቀነስ፦\n\`/deductmoney ${chatId} መጠን\``,
      { parse_mode: 'Markdown' }
    );

    bot.sendMessage(chatId, '✅ የ Withdraw ጥያቄዎ ለአድሚን ተልኳል። ክፍያው ሲፈጸም ባላንስዎ ይቀነሳል!');
  }
});

// 10. አድሚኑ ብቻ የሚጠቀምባቸው ትዕዛዞች (ADMIN COMMANDS)

// /addmoney USER_ID AMOUNT
bot.onText(/\/addmoney (\d+) (\d+)/, (msg, match) => {
  if (msg.chat.id !== ADMIN_ID) return;

  const targetUserId = match[1];
  const amountToAdd = parseInt(match[2]);

  if (!userBalances[targetUserId]) userBalances[targetUserId] = 0;
  userBalances[targetUserId] += amountToAdd;

  bot.sendMessage(ADMIN_ID, `✅ ለ User ID \`${targetUserId}\` መጠን **${amountToAdd} ብር** ተጨምሯል።\n💰 አዲሱ ባላንስ፦ **${userBalances[targetUserId]} ብር**`, { parse_mode: 'Markdown' });
  bot.sendMessage(targetUserId, `🎉 **መልካም ዜና!**\n\nበመለያዎ ላይ **${amountToAdd} ብር** ገቢ ሆኗል።\n💰 የአሁኑ ባላንስዎ፦ **${userBalances[targetUserId]} ብር**`);
});

// /deductmoney USER_ID AMOUNT
bot.onText(/\/deductmoney (\d+) (\d+)/, (msg, match) => {
  if (msg.chat.id !== ADMIN_ID) return;

  const targetUserId = match[1];
  const amountToDeduct = parseInt(match[2]);

  if (!userBalances[targetUserId]) userBalances[targetUserId] = 0;

  userBalances[targetUserId] -= amountToDeduct;
  if (userBalances[targetUserId] < 0) userBalances[targetUserId] = 0;

  bot.sendMessage(ADMIN_ID, `✅ ከ User ID \`${targetUserId}\` መጠን **${amountToDeduct} ብር** ተቀንሷል።\n💰 ቀሪ ባላንስ፦ **${userBalances[targetUserId]} ብር**`, { parse_mode: 'Markdown' });
  bot.sendMessage(targetUserId, `💸 ከሂሳብዎ ላይ **${amountToDeduct} ብር** ተቀንሷል።\n💰 ቀሪ ባላንስዎ፦ **${userBalances[targetUserId]} ብር**`);
});

bot.on('polling_error', (err) => console.error(err));
