const TelegramBot = require('node-telegram-bot-api');

// ከ BotFather ያገኘኸውን Token አስገባ
const TOKEN = '8575247623:AAEbjBhY67yTBoNX3HKpblqncDEw_zwkQaA';
const bot = new TelegramBot(TOKEN, { polling: true });

// የራስህን Telegram ID እዚህ አስገባ (አድሚን መሆንህን ለማወቅ)
const ADMIN_ID = 686733543; 

// የጨዋታህ WebApp ሊንክ
const GAME_WEB_APP_URL = 'https://your-keno-game.netlify.app';

// የጊዜያዊ ዳታቤዝ (የተጫዋቾች ሂሳብ ማከማቻ)
const userBalances = {};

// /start ሲባል
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'ተጫዋች';

  if (!userBalances[chatId]) {
    userBalances[chatId] = 0.00; // አዲስ ተጫዋች ሲመጣ ቦነስ 0 ETB
  }

  const welcomeText = `ሰላም ${firstName}! 👋\nወደ **Ethio Keno Game** እንኳን ደህና መጡ።\n\n💰 **ያልዎት የብር መጠን:** ${userBalances[chatId]} ETB`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 Start Game (መጫወት)', web_app: { url: GAME_WEB_APP_URL } }],
        [
          { text: '📥 Deposit (ገንዘብ ማስገባት)', callback_data: 'btn_deposit' },
          { text: '📤 Withdraw (ገንዘብ ማውጣት)', callback_data: 'btn_withdraw' }
        ],
        [{ text: '⚙️ Admin Panel', callback_data: 'btn_admin' }]
      ]
    },
    parse_mode: 'Markdown'
  };

  bot.sendMessage(chatId, welcomeText, keyboard);
});

// የቁልፎች ምላሽ
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  // Deposit ጥያቄ
  if (data === 'btn_deposit') {
    bot.sendMessage(chatId, `📥 **ገንዘብ ለማስገባት (Deposit):**\n\n1. በቴሌብር **09xxxxxxxx** ወይም CBE **1000xxxxxxxxx** ብር ያስገቡ።\n2. የክፍያ ደረሰኝ/ፎቶ እና ያስገቡትን መጠን እዚህ ቦት ላይ ለክሊፑ/ላኩልን።\n\nአድሚኑ አረጋግጦ ሂሳብዎን ይሞላል።`, { parse_mode: 'Markdown' });
  }

  // Withdraw ጥያቄ
  else if (data === 'btn_withdraw') {
    bot.sendMessage(chatId, `📤 **ገንዘብ ለማውጣት:**\n\nለማውጣት የሚፈልጉትን መጠን እና የቴሌብር/ባንክ ቁጥርዎን በዚህ መልኩ ይጻፉ፦\n\n\`withdraw 200 Telebirr 0911xxxxxx\``, { parse_mode: 'Markdown' });
  }

  // Admin control panel
  else if (data === 'btn_admin') {
    if (userId === ADMIN_ID) {
      bot.sendMessage(chatId, `⚙️ **የአድሚን መቆጣጠሪያ፦**\n\n1. የተጫዋች ሂሳብ ለመጨመር (Deposit Approve)፦\n\`addmoney USER_ID AMOUNT\`\n\nምሳሌ፦ \`addmoney 987654321 500\`\n\n2. የተጫዋች ሂሳብ ለመቀነስ፦\n\`deductmoney USER_ID AMOUNT\``, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, `❌ ይህ ክፍል ለአድሚን ብቻ የተፈቀደ ነው።`);
    }
  }

  bot.answerCallbackQuery(query.id);
});

// አድሚኑ የተጫዋችን ሂሳብ በኮማንድ ሲጨምር (Deposit Approval System)
bot.onText(/\/addmoney (.+) (.+)/, (msg, match) => {
  const senderId = msg.from.id;
  if (senderId !== ADMIN_ID) return;

  const targetUserId = match[1];
  const amount = parseFloat(match[2]);

  if (!userBalances[targetUserId]) userBalances[targetUserId] = 0;
  userBalances[targetUserId] += amount;

  bot.sendMessage(senderId, `✅ በስኬት ለ ተጫዋች ID: ${targetUserId} መጠን ${amount} ETB ተጨምሯል።\nአሁናዊ ሂሳብ: ${userBalances[targetUserId]} ETB`);
  
  // ለተጫዋቹ መልእክት ይላካል
  bot.sendMessage(targetUserId, `🎉 **ደስ ደስ ይበልዎት!**\n\nበአድሚኑ **${amount} ETB** በስኬት ገቢ ሆኖልዎታል። አሁን መጫወት ይችላሉ!`, { parse_mode: 'Markdown' });
});

// ተጫዋች Withdraw ሲጽፍ ለአድሚኑ ማሳወቅ
bot.onText(/withdraw (.+) (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const amount = parseFloat(match[1]);
  const accountType = match[2];
  const accountNumber = match[3];

  if ((userBalances[chatId] || 0) < amount) {
    return bot.sendMessage(chatId, `❌ በቂ የሒሳብ መጠን የለዎትም!`);
  }

  // ለአድሚኑ የትራንስፈር ጥያቄ መላክ
  bot.sendMessage(ADMIN_ID, `🚨 **አዲስ የ ገንዘብ ማውጣት (Withdraw) ጥያቄ!**\n\n👤 ተጫዋች ID: \`${chatId}\`\n💰 መጠን: ${amount} ETB\n🏦 አካውንት: ${accountType} - ${accountNumber}\n\nክፍያውን ፈጽመው ሂሳቡን ለመቀነስ፦\n\`deductmoney ${chatId} ${amount}\``, { parse_mode: 'Markdown' });

  bot.sendMessage(chatId, `✅ የገንዘብ ማውጣት ጥያቄዎ ለአድሚን ተልኳል። አድሚኑ አረጋግጦ ገቢ ያደርግልዎታል።`);
});

// አድሚኑ የሰው ሂሳብ ሲቀንስ (Withdraw Approval)
bot.onText(/\/deductmoney (.+) (.+)/, (msg, match) => {
  const senderId = msg.from.id;
  if (senderId !== ADMIN_ID) return;

  const targetUserId = match[1];
  const amount = parseFloat(match[2]);

  if (userBalances[targetUserId]) {
    userBalances[targetUserId] -= amount;
    bot.sendMessage(senderId, `✅ ከ ተጫዋች ID: ${targetUserId} መጠን ${amount} ETB ተቀንሷል።`);
    bot.sendMessage(targetUserId, `💸 ከሂሳብዎ **${amount} ETB** ወጥቶ ወደ አካውንትዎ ተልኳል!`);
  }
});