import { match } from "$mtkruto-filters";
import { HandleFuncResult, Handler, HandlerFuncParams } from "./handler.ts";

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

export class MessageHandler<T extends object> extends Handler {
  constructor(
    public func: MessageHandlerFunc<T>,
    public params?: MessageHandlerParams,
  ) {
    super();
  }

  // deno-lint-ignore require-await
  async check({ event }: HandlerFuncParams) {
    if (!this.params?.allowEdit && match("editedMessage", event)) {
      return false;
    }
    if (event.msg.out != (this.params?.out ?? true)) {
      return false;
    }
    if (
      this.params?.allowForward != false &&
      event.msg.forwards !== undefined
    ) {
      return false;
    }
    if (this.params?.scope !== undefined && this.params?.scope !== "all") {
      if (
        this.params?.scope == "group" &&
        !["supergroup", "group"].includes(event.msg.chat.type)
      ) {
        return false;
      } else if (
        this.params?.scope == "private" &&
        event.msg.chat.type !== "private"
      ) {
        return false;
      } else if (event.msg.chat.type !== "channel") {
        return false;
      }
    }
    return true;
  }

  handle({ client, event, ...rest }: HandlerFuncParams & T) {
    return this.func({ client, event, ...(rest as T) });
  }
}
