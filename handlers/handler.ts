import { EditedMessageEvent, NewMessageEvent, TelegramClient } from "$grm";

export const End = Symbol();

export type Event = NewMessageEvent | EditedMessageEvent;

export type HandleFuncResult = Promise<void | typeof End>;

export interface HandlerFuncParams {
  client: TelegramClient;
  event: Event;
}

export abstract class Handler {
  abstract check(
    { client, event }: HandlerFuncParams,
  ): Promise<boolean> | boolean;

  abstract handle(
    { client, event }: HandlerFuncParams,
  ): HandleFuncResult;
}
