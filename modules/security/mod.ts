import {
  bold,
  CommandHandler,
  fmt,
  MessageHandler,
  Module,
  updateMessage,
} from "$xor";
import * as log from "@std/log";
import { lsKey, sensitives } from "../../client.ts";

const security: Module = {
  name: "security",
  handlers: [
    new MessageHandler(async ({ event, client }) => {
      let toDelete = false;
      if (!event.msg.text.startsWith("signore")) {
        for (const sensitive of sensitives) {
          if (sensitive.test(event.msg.text)) {
            toDelete = true;
            break;
          }
        }
      }
      if (toDelete) {
        if (!localStorage.getItem(lsKey)) {
          await client.deleteMessage(event.chat.id, event.msg.id, {
            onlyForMe: false,
          });
          log.info(`deleted a sensitive message in ${event.chat.id}`);
        } else {
          log.warn("the security module is not active");
        }
      }
    }),
    new CommandHandler("sactivate", async ({ event, client }) => {
      let text = "Already active.";
      if (localStorage.getItem(lsKey)) {
        localStorage.removeItem("deactivate_security");
        text = "Reactivated.";
      }
      await updateMessage(client, event, text);
    }),
    new CommandHandler("sdeactivate", async ({ event, client }) => {
      let text = "Already deactivated.";
      if (!localStorage.getItem(lsKey)) {
        localStorage.setItem(lsKey, "1");
        text = "Deactivated.";
      }
      await updateMessage(client, event, text);
    }),
  ],
  help: fmt`${bold("Introduction")}

This module adds a request blocking layer to block requests that might contain sensitive information (e.g. phone numbers or API keys). It also deletes outgoing messages that might contain sensitive information.

You can suppress the automatic deletion of sensitive outgoing messages with the prefix "signore".

${bold("Commands")}

> sactivate

Activates the request blocking layer (activated by default).

> sdeactivate

Deactivates the request blocking layer.`,
};

export default security;
