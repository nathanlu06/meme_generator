import { BigInteger } from "big-integer";
import fs from "fs";
import { TelegramClient } from "telegram";
import { CustomFile } from "telegram/client/uploads";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";

const config = {
  telegram: {
    apiId: parseInt(process.env.TELEGRAM_API_ID!),
    apiHash: process.env.TELEGRAM_API_HASH!,
    phoneNumber: process.env.TELEGRAM_PHONE_NUMBER!,
    password: process.env.TELEGRAM_PASSWORD!,
    sessionString: process.env.TELEGRAM_SESSION_STRING!,
  },
};

// Constants
const SESSION_FILE = "session.txt";
const DEFAULT_CHANNEL_DESCRIPTION = "Verification portal for our group";

// Initialize Telegram client
export const initializeClient = (sessionString: string) => {
  return new TelegramClient(
    new StringSession(sessionString),
    config.telegram.apiId,
    config.telegram.apiHash,
    {
      connectionRetries: 5,
    }
  );
};

// Load or create session
export const getSessionString = (): string => {
  return fs.existsSync(SESSION_FILE)
    ? fs.readFileSync(SESSION_FILE, "utf-8")
    : config.telegram.sessionString || "";
};

// Save session to file
const saveSession = async (client: TelegramClient) => {
  try {
    fs.writeFileSync(SESSION_FILE, client.session.save() as never);
    console.log("✅ Session saved successfully!");
  } catch (error) {
    console.error("❌ Error saving session:", error);
  }
};

// Create a new Telegram group
export async function createTelegramGroup(
  client: TelegramClient,
  groupTitle: string
): Promise<BigInteger> {
  const createGroup = await client.invoke(
    new Api.messages.CreateChat({
      users: [],
      title: groupTitle.slice(0, 255),
    })
  );

  const updates = createGroup.updates.toJSON();
  if (!updates || !("chats" in updates)) {
    throw new Error("Failed to create group: No chat information received");
  }

  const chatId = updates.chats[0].id;
  console.log(`✅ Group "${groupTitle}" created with ID:`, chatId);

  // turn the group into a supergroup
  const migrateChat = await client.invoke(
    new Api.messages.MigrateChat({ chatId })
  );

  const supergroup = migrateChat.toJSON();

  if (!supergroup || !("updates" in supergroup)) {
    throw new Error("Failed to migrate group: No chat information received");
  }

  const supergroupId = supergroup.updates.find(
    (update) => update.className === "UpdateChannel"
  )?.channelId;

  if (!supergroupId) {
    throw new Error("Failed to migrate group: No supergroup ID received");
  }

  console.log(
    `✅ Group "${groupTitle}" migrated to supergroup with ID:`,
    supergroupId
  );

  // enable chat history
  await client.invoke(
    new Api.channels.TogglePreHistoryHidden({
      channel: supergroupId,
      enabled: false,
    })
  );

  // add 100 to the start of the supergroup id
  return supergroupId.negate();
}

// Update group photo
export async function updateGroupPhoto(
  client: TelegramClient,
  chatId: BigInteger,
  photoPath: string
) {
  if (!fs.existsSync(photoPath)) {
    console.log("⚠️ Group photo not found. Skipping...");
    return;
  }

  //   const file = await client.uploadFile({
  //     file: new CustomFile("pfp.png", fs.statSync(photoPath).size, photoPath,),
  //     workers: 1,
  //   });
  const file = await client.uploadFile({
    file: new CustomFile("pfp.png", fs.statSync(photoPath).size, photoPath),
    workers: 1,
  });

  await client.invoke(
    new Api.messages.EditChatPhoto({
      chatId,
      photo: new Api.InputChatUploadedPhoto({ file }),
    })
  );
  console.log("✅ Group photo updated!");
}

// Manage group members
export async function addGroupAdmin(
  client: TelegramClient,
  chatId: BigInteger,
  username: string
) {
  await client.invoke(
    new Api.channels.InviteToChannel({
      channel: chatId,
      users: [username],
    })
  );
  console.log(`✅ User ${username} added to the group!`);

  await client.invoke(
    new Api.channels.EditAdmin({
      channel: chatId,
      userId: username,
      adminRights: new Api.ChatAdminRights({
        changeInfo: true,
        postMessages: true,
        editMessages: true,
        deleteMessages: true,
        banUsers: true,
        inviteUsers: true,
        pinMessages: true,
        addAdmins: true,
        anonymous: true,
        manageCall: true,
        other: true,
        deleteStories: true,
        editStories: true,
        manageTopics: true,
        postStories: true,
      }),
      rank: "owner",
    })
  );

  console.log(`✅ User ${username} promoted to group admin!`);
}

// Authentication function
export async function authenticate(client: TelegramClient) {
  await client.start({
    phoneNumber: config.telegram.phoneNumber,
    password: async () => config.telegram.password,
    phoneCode: async () => "Enter the code you received: ",
    onError: (err) => console.error("Login error:", err),
  });
  console.log("✅ Logged in successfully!");
  await saveSession(client);
}

// Update group settings
export async function updateGroupAbout(
  client: TelegramClient,
  chatId: BigInteger,
  about: string
) {
  await client.invoke(
    new Api.messages.EditChatAbout({
      peer: chatId,
      about: about.slice(0, 255),
    })
  );
  console.log("✅ Group description updated!");
}
