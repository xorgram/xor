// This file will include helpers for all modules (built-in and externals).
import { CustomFile, NewMessageEvent, SendMessageParams } from "$grm";
import { Buffer } from "$grm-deps";
import { fmt, pre, type Stringable } from "./deps.ts";

export function updateMessage(
  event: NewMessageEvent,
  text: Stringable,
) {
  return event.message.edit(
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
