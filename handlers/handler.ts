import { NewMessageEvent, TelegramClient } from "$grm";

export const End = Symbol();

export interface HandlerFuncParams {
  client: TelegramClient;
  event: NewMessageEvent;
}

export abstract class Handler {
  abstract check(
    { client, event }: HandlerFuncParams,
  ): Promise<boolean> | boolean;

  abstract handle(
    { client, event }: HandlerFuncParams,
  ): Promise<void | typeof End>;
}
