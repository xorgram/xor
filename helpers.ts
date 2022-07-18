// This file will include helpers for all modules (built-in and externals).
import { CustomFile, NewMessageEvent, SendMessageParams } from "$grm";
import { Buffer } from "$grm/deps.ts";
import { fmt, pre, type Stringable } from "./deps.ts";

export async function wrap(
  event: NewMessageEvent,
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
  event: NewMessageEvent,
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
