import {
  bold,
  CommandHandler,
  fmt,
  Module,
  updateMessage,
} from "$xor";
import { lsKey } from "../../client.ts";

const security: Module = {
  name: "security",
  handlers: [
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

${bold("Commands")}

> sactivate

Activates the request blocking layer (activated by default).

> sdeactivate

Deactivates the request blocking layer.`,
};

export default security;
