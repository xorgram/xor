import { events, LogLevel, StringSession, TelegramClient } from "$grm";
import { dirname, fromFileUrl, join } from "./deps.ts";
import env from "./env.ts";
import { managerModule, ModuleManager } from "./module_manager.ts";

const client = new TelegramClient(
  new StringSession(env.STRING_SESSION),
  env.APP_ID,
  env.APP_HASH,
  {},
);
const manager = new ModuleManager(client);
client.setParseMode(undefined);
client.setLogLevel(LogLevel.NONE);
try {
  await Deno.mkdir("externals");
} catch (_err) {
  //
}
manager.installMultiple(
  await ModuleManager.directory(
    join(dirname(fromFileUrl(import.meta.url)), "modules"),
  ),
  false,
);
manager.install(managerModule(manager), false);
manager.installMultiple(
  await ModuleManager.directory(
    join(dirname(fromFileUrl(import.meta.url)), "externals"),
  ),
  true,
);
client.addEventHandler(manager.handler, new events.NewMessage({}));
client.start({ botAuthToken: "" });
