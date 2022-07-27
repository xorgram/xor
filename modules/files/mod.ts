import { Api, CustomFile } from "$grm";
import { Buffer } from "$grm-deps";
import {
  bold,
  code,
  CommandHandler,
  fmt,
  join,
  Module,
  updateMessage,
} from "$xor";
import { parseAttributes } from "./helpers.ts";

const files: Module = {
  name: "files",
  handlers: [
    new CommandHandler(
      "download",
      async ({ client, event }) => {
        const media = (await event.message.getReplyMessage())?.media;
        if (!media) {
          await updateMessage(event, "Reply a file to download.");
          return;
        }
        let filename = "";
        if (media instanceof Api.MessageMediaPhoto) {
          filename = "photo_" + media.photo?.id.toString() + ".png";
        }
        if (
          media instanceof Api.MessageMediaDocument &&
          !(media instanceof Api.MessageMediaEmpty) &&
          media.document &&
          !(media.document instanceof Api.DocumentEmpty)
        ) {
          const { attrFilename } = parseAttributes(media.document.attributes);
          if (attrFilename) {
            filename = attrFilename.fileName;
          } else {
            const mime = media.document.mimeType;
            if (mime.includes("video")) {
              filename = "video_" + media.document.id + "." +
                mime.split("/")[1];
            }
            if (mime.includes("audio")) {
              filename = "audio" + media.document.id + "." + mime.split("/")[1];
            }
          }
        }
        await updateMessage(event, "Downloading...");
        const mediaBuffer = await client.downloadMedia(media, {});
        if (!mediaBuffer) {
          await updateMessage(event, "Download failed.");
          return;
        }
        const spec = join("downloads", filename);
        await Deno.mkdir(join("downloads"), { recursive: true });
        await Deno.writeFile(
          spec,
          typeof mediaBuffer === "string"
            ? new TextEncoder().encode(mediaBuffer)
            : mediaBuffer,
        );
        await updateMessage(
          event,
          fmt`Downloaded to ${code(`./downloads/${filename}`)}.`,
        );
      },
      { aliases: ["dl"] },
    ),
    new CommandHandler(
      "upload",
      async ({ client, event, args }) => {
        if (!args || !args.length) {
          await updateMessage(event, "Provide a file path to upload.");
          return;
        }
        const filePath = join(Deno.cwd(), args[0]);
        const forceDocument = args[1] ? args[1] === "true" : true;
        try {
          // TODO: check R perm?
          await Deno.stat(filePath);
        } catch (e) {
          await updateMessage(
            event,
            `${e}: File not found or permission denied`,
          );
          return;
        }
        if (!event.chatId) {
          return;
        }
        await updateMessage(event, "Uploading...");
        await client.sendFile(event.chatId, {
          file: filePath,
          forceDocument,
        });
        await updateMessage(event, "Uploaded.");
      },
      { aliases: ["ul"] },
    ),
    new CommandHandler(
      "rnupload",
      async ({ client, event, args }) => {
        if (!args || !args.length) {
          await updateMessage(event, "Provide a new name.");
          return;
        }
        const media = (await event.message.getReplyMessage())?.media;
        if (!media) {
          await updateMessage(event, "Reply a file to download.");
          return;
        }
        if (!event.chatId) {
          return;
        }
        await updateMessage(event, "Downloading...");
        const mediaBuffer = await client.downloadMedia(media, {});
        if (!mediaBuffer) {
          await updateMessage(event, "Download failed.");
          return;
        }
        await updateMessage(event, "Uploading...");
        await client.sendFile(event.chatId, {
          file: new CustomFile(
            args[0],
            mediaBuffer.length,
            "",
            Buffer.from(mediaBuffer),
          ),
          forceDocument: true,
        });
        await updateMessage(event, `Renamed to ${args[0]}.`);
      },
      { aliases: ["rnul"] },
    ),
    new CommandHandler(
      "listdl",
      async ({ event }) => {
        const files = [...Deno.readDirSync(join(Deno.cwd(), "downloads"))].map(
          (v) => v.name,
        ).map((v) => code(v));
        await updateMessage(
          event,
          files.length == 0
            ? "Downloads are empty."
            : fmt([""].concat(files.map(() => "")), ...files),
        );
      },
      {
        aliases: ["lsdl"],
      },
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
