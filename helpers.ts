import { MessageDocument } from "$mtkruto";
import { Event } from "./handlers/mod.ts";
import { fmt, type Stringable } from "./deps.ts";
import { Client } from "./client.ts";

export async function updateMessage(
  client: Client,
  event: Event,
  text: Stringable
): Promise<void> {
  try {
    const msg = fmt`${event.msg.text}\n${text}`;
    await client.editMessageText(event.msg.chat.id, event.msg.id, msg.text, {
      entities: msg.entities,
    });
  } catch (error) {
    console.error("Failed to update message:", error);
  }
}

export async function getReplyMessage(client: Client, event: Event) {
  if (!event.msg.replyToMessageId) {
    return null;
  }

  try {
    return await client.getMessage(
      event.msg.chat.id,
      event.msg.replyToMessageId
    );
  } catch (error) {
    console.error("Failed to get reply message:", error);
    return null;
  }
}

export async function downloadDocument(
  client: Client,
  doc: MessageDocument
): Promise<string | null> {
  try {
    const chunks: Uint8Array[] = [];
    for await (const chunk of client.download(doc.document.fileId)) {
      chunks.push(chunk);
    }
    const combined = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    return new TextDecoder().decode(combined);
  } catch (error) {
    console.error("Failed to download document:", error);
    return null;
  }
}

export function createLongMessage(text: string, filename?: string) {
  if (text.length <= 4096) {
    return { text: text.trim() };
  }

  const document = new TextEncoder().encode(text);
  return {
    document,
    fileName: filename || "output.txt",
    caption: "Output too long, sent as file",
  };
}

export async function sendLongText(
  client: Client,
  event: Event,
  text: string,
  reply = false,
  filename?: string
): Promise<void> {
  const { document, fileName, caption } = createLongMessage(text, filename);
  if (document) {
    await client.sendDocument(event.msg.chat.id, document, {
      fileName,
      caption,
      ...(reply
        ? { replyTo: { chatId: event.msg.chat.id, messageId: event.msg.id } }
        : {}),
    });
  } else {
    await client.sendMessage(event.msg.chat.id, text, {
      ...(reply
        ? { replyTo: { chatId: event.msg.chat.id, messageId: event.msg.id } }
        : {}),
    });
  }
}
