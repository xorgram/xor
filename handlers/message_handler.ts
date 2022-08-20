import { EditedMessageEvent } from "$grm";
import { HandleFuncResult, Handler, HandlerFuncParams } from "./handler.ts";

// deno-lint-ignore ban-types
export type MessageHandlerFunc<T extends object> = ({
  client,
  event,
  ...rest
}: HandlerFuncParams & T) => HandleFuncResult;

export interface MessageHandlerParams {
  out?: boolean;
  scope?: "all" | "group" | "private" | "channel";
  allowForward?: boolean;
  allowEdit?: boolean;
}

// deno-lint-ignore ban-types
export class MessageHandler<T extends object> extends Handler {
  constructor(
    public func: MessageHandlerFunc<T>,
    public params?: MessageHandlerParams,
  ) {
    super();
  }

  // deno-lint-ignore require-await
  async check({ event }: HandlerFuncParams) {
    if (
      this.params?.allowEdit == false && event instanceof EditedMessageEvent
    ) {
      return false;
    }
    if (event.message.out != (this.params?.out ?? false)) {
      return false;
    }
    if (
      this.params?.allowForward != false && event.message.forward !== undefined
    ) {
      return false;
    }
    if (this.params?.scope !== undefined && this.params?.scope !== "all") {
      if (this.params?.scope == "group" && !event.isGroup) {
        return false;
      } else if (this.params?.scope == "private" && !event.isPrivate) {
        return false;
      } else if (!event.isChannel) {
        return false;
      }
    }
    return true;
  }

  handle({ client, event, ...rest }: HandlerFuncParams & T) {
    return this.func({ client, event, ...(rest as T) });
  }
}
