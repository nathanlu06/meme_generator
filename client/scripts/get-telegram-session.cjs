const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const dotenv = require("dotenv");

dotenv.config();

(async () => {
  const client = new TelegramClient(
    new StringSession(),
    parseInt(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH,
    {
      connectionRetries: 5,
    }
  );

  await client.start({
    phoneNumber: process.env.TELEGRAM_PHONE_NUMBER,
    password: async () => process.env.TELEGRAM_PASSWORD,
    phoneCode: async () => await input.text("Enter the code you received: "),
    onError: (err) => console.error("Login error:", err),
  });

  console.log(client.session.save());
})();
