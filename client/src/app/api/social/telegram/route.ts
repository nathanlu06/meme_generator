import * as Telegram from "@/lib/telegram";
import { NextResponse } from "next/server";
import { Api } from "telegram";
import { CustomFile } from "telegram/client/uploads";

interface TelegramRequest {
  groupName: string;
  groupDescription: string;
  adminUsername: string;
  imageUrl: string;
  message: string;
}

export async function POST(req: Request) {
  const body: TelegramRequest = await req.json();
  const { groupName, groupDescription, adminUsername, imageUrl, message } =
    body;
  if (!groupName || !adminUsername) {
    return new Response("Invalid request", { status: 400 });
  }

  const client = Telegram.initializeClient(Telegram.getSessionString());
  await Telegram.authenticate(client);

  // Create group and channel
  const groupId = await Telegram.createTelegramGroup(client, body.groupName);

  try {
    // download image
    const extension = imageUrl.split(".").pop();
    const image = await fetch(imageUrl);
    const imageBlob = await image.blob();
    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const file = await client.uploadFile({
      file: new CustomFile(`pfp.${extension}`, imageBlob.size, "", buffer),
      workers: 1,
    });

    await client.invoke(
      new Api.channels.EditPhoto({
        channel: groupId,
        photo: new Api.InputChatUploadedPhoto({ file }),
      })
    );
  } catch (error) {
    console.error("Error downloading image:", error);
  }

  await Telegram.updateGroupAbout(client, groupId, groupDescription).catch(
    (error) => {
      console.error("Error updating group description:", error);
    }
  );
  await Telegram.addGroupAdmin(client, groupId, adminUsername).catch(
    (error) => {
      console.error("Error adding group admin:", error);
    }
  );

  if (message) {
    try {
      await client.invoke(
        new Api.messages.SendMessage({
          peer: groupId,
          message,
        })
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  await client.destroy();

  return NextResponse.json({
    success: true,
  });
}
