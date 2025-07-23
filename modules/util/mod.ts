import { toFileUrl } from "@std/path";
import { getRandomId } from "$mtkruto";
import {
  bold,
  CommandHandler,
  fmt,
  Module,
  sendLongText,
  type Stringable,
  updateMessage,
  version,
  mtkrutoVersion,
  getReplyMessage,
} from "$xor";
import { whois } from "./helpers.ts";

const LOAD_TIME = Date.now();
// const telegramVersion =

const EVAL_HEADER = `import { Api } from "$mtkruto";
import { Client, NewMessageEvent, getReplyMessage } from "$xor";

interface EvalParams {
  client: Client;
  event: NewMessageEvent;
}

export async function eval_({ client, event }: EvalParams): Promise<any> {
  const c = client;
  const e = event;
  const message = event.msg;
  const m = message;
  const reply = await getReplyMessage(client, event);
  const r = reply;
`;

const EVAL_FOOTER = "}\n";

const util: Module = {
  name: "util",
  handlers: [
    new CommandHandler("ping", async ({ client, event }) => {
      const before = Date.now();
      await client.invoke({ _: "ping", ping_id: getRandomId() });
      const diff = Date.now() - before;
      await updateMessage(client, event, `${diff}ms`);
    }),
    new CommandHandler(
      "shell",
      async ({ client, event, args, input }) => {
        if (args.length < 1) {
          return;
        }
        args = args.slice(1);
        let { text } = event.msg;
        text = text.slice(text.split(/\s/)[0].length);
        const [cmd, ..._args] = text.trim().split(/\s/);
        const proc = new Deno.Command(cmd, {
          args: _args,
          stdout: "piped",
          stderr: "piped",
          stdin: input.length == 0 ? undefined : "piped",
        }).spawn();
        text = `[${proc.pid}]${text}`;
        await updateMessage(client, event, text);
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        if (input.length != 0) {
          const stdinWriter = proc.stdin.getWriter();
          await stdinWriter.write(encoder.encode(input));
          await stdinWriter.close();
        }
        const stdoutReader = proc.stdout.getReader();
        const { value: stdoutChunk } = await stdoutReader.read();
        const stdout = decoder.decode(stdoutChunk ?? new Uint8Array());
        stdoutReader.releaseLock();

        const stderrReader = proc.stderr.getReader();
        const { value: stderrChunk } = await stderrReader.read();
        const stderr = decoder.decode(stderrChunk ?? new Uint8Array());
        stderrReader.releaseLock();
        if (stdout.length > 0) {
          await sendLongText(client, event, stdout, true, "stdout.txt");
        }
        if (stderr.length > 0) {
          await sendLongText(client, event, stderr, true, "stderr.txt");
        }
        const code = (await proc.status).code;
        text += "\n" + `Exited with code ${code}.`;
        await updateMessage(client, event, text);
      },
      {
        aliases: ["sh", "cmd", "exec"],
      }
    ),
    new CommandHandler("uptime", async ({ client, event }) => {
      let seconds = Math.floor((Date.now() - LOAD_TIME) / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds - hours * 3600) / 60);
      seconds = seconds - hours * 3600 - minutes * 60;
      // TODO: use deno std for the time format?
      await updateMessage(
        client,
        event,
        (hours > 0 ? `${hours > 9 ? hours : "0" + hours}:` : "") +
          `${minutes > 9 ? minutes : "0" + minutes}:` +
          `${seconds > 9 ? seconds : "0" + seconds}`
      );
    }),
    new CommandHandler(
      "version",
      async ({ event, client }) => {
        await updateMessage(
          client,
          event,
          `MTKruto ${mtkrutoVersion}
Xor ${version}

Deno ${Deno.version.deno}
TypeScript ${Deno.version.typescript}
V8 ${Deno.version.v8}`
        );
      },
      { aliases: ["v"] }
    ),
    new CommandHandler("whois", async ({ client, event, args }) => {
      const info = new Array<Stringable>();
      if (args[0] !== undefined && args[0].length != 0) {
        const entity = await client.getInputUser(args[0]);
        info.push((await whois(entity, client)).trim() + "\n\n");
      }
      const chat = await client.getChat(event.msg.chat.id);
      if (chat) {
        info.push(fmt`${bold("Here")}\n`); // @ts-expect-error asdf
        info.push((await whois(chat, client)).trim() + "\n\n");
      }
      const reply = await getReplyMessage(client, event);
      if (reply) {
        const sender = await client.getInputUser(reply.from.id);
        if (sender) {
          info.push(fmt`${bold("Reply")}\n`);
          info.push((await whois(sender, client)).trim() + "\n\n");
        }
        if (reply.forwardFrom && reply.forwardFrom.type === "user") {
          const sender = await client.getInputUser(reply.forwardFrom.user.id);
          if (sender) {
            info.push(fmt`${bold("Forwarder")}\n`);
            info.push((await whois(sender, client)).trim() + "\n\n");
          }
        }
      }
      if (info.length == 0) {
        return;
      }
      await updateMessage(
        client,
        event,
        fmt(["\n", ...info.map(() => "")], ...info)
      );
    }),
    new CommandHandler(
      "eval",
      async ({ client, event, input }) => {
        const path = await Deno.makeTempFile({ suffix: ".ts" });
        await Deno.writeTextFile(path, `${EVAL_HEADER}${input}${EVAL_FOOTER}`);
        const { eval_ } = await import(toFileUrl(path).href);
        await Deno.remove(path);
        let result = JSON.stringify(await eval_({ client, event }), null, 4);
        if (!result) {
          await event.reply("No output.");
          return;
        }
        if (result.startsWith('"')) {
          result = result.replace(/"/g, "");
        }
        await sendLongText(client, event, result, true, "result.txt");
      },
      { allowEdit: true }
    ),
  ],
  help: fmt`${bold("Introduction")}

The util module includes some useful commands to interact with the system and get basic information of the surrounding.

${bold("Commands")}

- ping

Tells how much a ping of Telegram servers takes.

- shell, sh, cmd, exec

Runs a shell command and sends its output. Any input will be passed to the stdin of the process.

- uptime

Displays the uptime of the bot in (hh:)mm:ss format.

- version, v

Displays the versions of Xor and other software.

- whois

Fetches and displays basic information about the current chat, the provided identifier as the first argument and/or the replied message. The provided identifier can be a username, a phone number, a user/chat ID or a chat invite ID.

- eval

Runs and sends the output of JavaScript code. As of now, it passes the client as \`client | c\`, the \`NewMessageEvent\` as \`event | e\`, the message as \`message | m\`, the replied message as \`reply | r\`, xorgram-methods instance as \`methods\` and the API namespace as \`Api\`.`,
};

export default util;
