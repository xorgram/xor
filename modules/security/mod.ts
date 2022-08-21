import {
  bold,
  CommandHandler,
  fmt,
  MessageHandler,
  Module,
  updateMessage,
} from "$xor";
import * as log from "std/log/mod.ts";
import { lsKey, sensitives } from "../../client.ts";

const security: Module = {
  name: "security",
  handlers: [
    new MessageHandler(async ({ event }) => {
      let toDelete = false;
      if (!event.message.text.startsWith("signore")) {
        for (const sensitive of sensitives) {
          if (sensitive.test(event.message.message)) {
            toDelete = true;
            log.info(`deleted a sensitive message in ${event.chatId}`);
            return;
          }
        }
      }
      if (toDelete) {
        if (!localStorage.getItem(lsKey)) {
          await event.message.delete();
        } else {
          log.warning("the security module is not active");
        }
      }
    }),
    new CommandHandler("sactivate", async ({ event }) => {
      let text = "Already active.";
      if (localStorage.getItem(lsKey)) {
        localStorage.removeItem("deactivate_security");
        text = "Reactivated.";
      }
      await updateMessage(event, text);
    }),
    new CommandHandler("sdeactivate", async ({ event }) => {
      let text = "Already deactivated.";
      if (!localStorage.getItem(lsKey)) {
        localStorage.setItem(lsKey, "1");
        text = "Deactivated.";
      }
      await updateMessage(event, text);
    }),
  ],
  help: fmt`${bold("Introduction")}

This module adds a request blocking layer to block requests that might contain sensitive information (e.g. phone numbers or API keys). It also deletes outgoing messages that might contain sensitive information.

You can make suppress the automatic deletion of sensitive outgoing messages with the prefix "signore".

${bold("Commands")}

> sactivate

Activates the request blocking layer (activated by default).

> sdeactivate

Deactivates the request blocking layer.`,
};

export default security;
