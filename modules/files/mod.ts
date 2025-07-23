import { join } from "@std/path";
import {
  bold,
  code,
  CommandHandler,
  fmt,
  FormattedString,
  getReplyMessage,
  Module,
  updateMessage,
} from "$xor";
import { extractFileInfo } from "./helpers.ts";

const files: Module = {
  name: "files",
  handlers: [
    new CommandHandler(
      "download",
      async ({ client, event }) => {
        const reply = await getReplyMessage(client, event);
        const fileInfo = reply ? extractFileInfo(reply) : null;
        if (!fileInfo) {
          await updateMessage(client, event, "Reply a file to download.");
          return;
        }
        const { fileId, filename = "file.bin" } = fileInfo;
        await updateMessage(client, event, "Downloading...");
        const mediaBuffer = client.download(fileId);
        const spec = join("downloads", filename);
        await Deno.mkdir(join("downloads"), { recursive: true });
        const file = await Deno.open(spec, {
          write: true,
          create: true,
          truncate: true,
        });
        try {
          for await (const chunk of mediaBuffer) {
            await file.write(chunk);
          }
        } finally {
          file.close();
        }
        await updateMessage(
          client,
          event,
          fmt`Downloaded to ${code(`./downloads/${filename}`)}.`
        );
      },
      { aliases: ["dl"] }
    ),
    new CommandHandler(
      "upload",
      async ({ client, event, args }) => {
        if (!args || !args.length) {
          await updateMessage(client, event, "Provide a file path to upload.");
          return;
        }
        const filePath = join(Deno.cwd(), args[0]);
        // const forceDocument = args[1] ? args[1] === "true" : true;
        try {
          // TODO: check R perm?
          await Deno.stat(filePath);
        } catch (e) {
          await updateMessage(
            client,
            event,
            `${e}: File not found or permission denied`
          );
          return;
        }
        if (!event.chat.id) {
          return;
        }
        await updateMessage(client, event, "Uploading...");
        const file = await Deno.open(filePath, { read: true });
        try {
          await client.sendDocument(event.chat.id, file.readable);
          await updateMessage(client, event, "Uploaded.");
        } finally {
          file.close();
        }
      },
      { aliases: ["ul"] }
    ),
    new CommandHandler(
      "rnupload",
      async ({ client, event, args }) => {
        if (!args || !args.length) {
          await updateMessage(client, event, "Provide a new name.");
          return;
        }
        const reply = await getReplyMessage(client, event);
        const fileInfo = reply ? extractFileInfo(reply) : null;
        if (!fileInfo) {
          await updateMessage(client, event, "Reply a file to re-upload.");
          return;
        }
        const { fileId } = fileInfo;
        if (!event.chat.id) {
          return;
        }
        await updateMessage(client, event, "Downloading...");
        const mediaBuffer = client.download(fileId);
        // Create a temp file to stream the download, then re-upload with new name
        const tempPath = join("downloads", args[0]);
        await Deno.mkdir(join("downloads"), { recursive: true });
        const file = await Deno.open(tempPath, {
          write: true,
          create: true,
          truncate: true,
        });
        try {
          for await (const chunk of mediaBuffer) {
            await file.write(chunk);
          }
        } finally {
          file.close();
        }
        await updateMessage(client, event, "Uploading...");
        const uploadFile = await Deno.open(tempPath, { read: true });
        try {
          await client.sendDocument(event.chat.id, uploadFile.readable, {
            fileName: args[0],
          });
          await updateMessage(client, event, `Renamed to ${args[0]}.`);
        } finally {
          uploadFile.close();
        }
      },
      { aliases: ["rnul"] }
    ),
    new CommandHandler(
      "listdl",
      async ({ client, event }) => {
        let files: FormattedString[] = [];
        try {
          files = [...Deno.readDirSync(join(Deno.cwd(), "downloads"))]
            .map((v) => v.name)
            .map((v) => code(v));
        } catch (_) {
          // Folder does not exist or is empty
        }
        const formattedMsg =
          files.length === 0
            ? fmt`Downloads are empty.`
            : fmt([""].concat(files.map(() => "")), ...files);

        await client.editMessageText(
          event.chat.id,
          event.msg.id,
          formattedMsg.text,
          { entities: formattedMsg.entities }
        );
      },
      {
        aliases: ["lsdl"],
      }
    ),
  ],
  help: fmt`${bold("Introduction")}

The files module can be used for operations like file download, upload, listing and more.

${bold("Commands")}

- download, dl

Downloads the replied file or media.

- upload, ul

Uploads a local file to Telegram.

- rnupload, rnul

Re-uploads the replied file to Telegram with a new name.

- listdl, lsdl

Lists the downloaded files.`,
};

export default files;
