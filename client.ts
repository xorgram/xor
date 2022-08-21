import * as log from "std/log/mod.ts";
import { Api, MTProtoSender, TelegramClient } from "$grm";

export const sensitives = [
  /([+]?\d{1,3}([-\s]+)?|)\d{3}([-\s]+)?\d{3}([-\s]+)?\d{4}/,
  /[0-9a-f]{32}/,
  /[0-9]{10}:[0-9A-z_-]{35}/,
];

export const lsKey = "deactivate_security";

export class Client extends TelegramClient {
  invoke(request: Api.AnyRequest, sender?: MTProtoSender) {
    if (!localStorage.getItem(lsKey)) {
      let content = "";
      if (
        request instanceof Api.messages.EditMessage ||
        request instanceof Api.messages.SendMessage ||
        request instanceof Api.messages.SendMedia
      ) {
        content = request.message ?? "";
      } else if (request instanceof Api.messages.SendMultiMedia) {
        content = request.multiMedia.map((v) => v.message).join("");
      }
      for (const sensitive of sensitives) {
        if (sensitive.test(content)) {
          throw new Error("Request might contain sensitive information");
        }
      }
    } else {
      log.warning("the security module is not active");
    }
    return super.invoke(request, sender);
  }
}
