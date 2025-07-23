import { WithFilter } from "$mtkruto";
import type { Client, XorContext } from "../client.ts";

export type NewMessageEvent = WithFilter<XorContext, "message:text">;
export type EditedMessageEvent = WithFilter<XorContext, "editedMessage:text">;

export const End = Symbol();

export type Event = NewMessageEvent | EditedMessageEvent;

export type HandleFuncResult = Promise<void | typeof End>;

export interface HandlerFuncParams {
  client: Client;
  event: Event;
}

export abstract class Handler {
  abstract check({
    client,
    event,
  }: HandlerFuncParams): Promise<boolean> | boolean;

  abstract handle({ client, event }: HandlerFuncParams): HandleFuncResult;
}
