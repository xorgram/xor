import { HandlerFuncParams } from "./handler.ts";
import { MessageHandler } from "./message_handler.ts";
import env from "../env.ts";

export interface CommandHandlerFuncParams {
  args: string[];
  input: string;
}

// deno-lint-ignore ban-types
export type CommandHandlerFunc<T extends object> = ({
  client,
  event,
  ...rest
}: HandlerFuncParams & T) => Promise<void>;

export interface CommandHandlerOpts {
  aliases?: string[];
  rawArgs?: boolean;
  rawInput?: boolean;
}

export class CommandHandler extends MessageHandler<CommandHandlerFuncParams> {
  opts: CommandHandlerOpts;

  constructor(
    public name: string,
    public func: CommandHandlerFunc<CommandHandlerFuncParams>,
    opts?: CommandHandlerOpts,
  ) {
    super(func);
    this.opts = opts ?? {};
    this.opts.rawInput = this.opts.rawInput ?? true;
  }

  async check({ client, event }: HandlerFuncParams) {
    if (!(await super.check({ client, event }))) {
      return false;
    }
    const { text } = event.message;
    if (![env.COMMAND_PREFIX, env.INPUT_PREFIX].includes(text[0])) {
      return false;
    }
    const command = text.split(/\s/)[0].slice(1);
    return this.name == command || !!this.opts?.aliases?.includes(command);
  }

  async handle({ client, event }: HandlerFuncParams) {
    const { text, message } = event.message;
    const args = (this.opts?.rawArgs ? message : text)
      .split("\n")[0]
      .split(/\s/)
      .slice(1);
    let input = "";
    const inputType = message[0];
    const reply = await event.message.getReplyMessage();
    switch (inputType) {
      case env.COMMAND_PREFIX:
        input = (this.opts?.rawInput ? message : text)
          .split("\n")
          .slice(1)
          .join("\n")
          .trim();
        break;
      case env.INPUT_PREFIX:
        if (reply && reply.text) {
          input = this.opts?.rawInput ? reply.message : reply.text;
        }
    }
    await this.func({ client, event, args, input });
  }
}
