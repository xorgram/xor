// This file will include dependencies and helpers for all modules (built-in and externals).
import { events } from "$grm";
import { Buffer } from "$grm/deps.ts";
import { type SendMessageParams } from "$grm/src/client/messages.ts";
import { CustomFile } from "$grm/src/client/uploads.ts";
import { pre } from "$xor";
import { fmt, Stringable } from "./deps.ts";

export async function wrap(
  event: events.NewMessageEvent,
  func: () => Promise<void>,
) {
  try {
    await func();
  } catch (err) {
    console.error(err);
    try {
      let message = String(err);
      message = message.length <= 1000 ? message : "An error occurred.";
      await event.message.reply({ message });
    } catch (_err) {
      //
    }
  }
}

export async function updateMessage(
  event: events.NewMessageEvent,
  text: Stringable,
) {
  return await event.message.edit(
    fmt`${event.message.text}\n${text}`.edit,
  );
}

export function longText(
  text: string,
  name?: string,
): SendMessageParams {
  return text.length > 4096
    ? {
      file: new CustomFile(
        name ?? crypto.randomUUID(),
        text.length,
        "",
        Buffer.from(text),
      ),
    }
    : pre(text.trim(), "").send;
}
