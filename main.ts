import { NewMessage, StringSession, TelegramClient } from "$grm";
import env from "./env.ts";
import modules from "./modules/mod.ts";
import { managerModule, ModuleManager } from "./module_manager.ts";

const client = new TelegramClient(
  new StringSession(env.STRING_SESSION),
  env.APP_ID,
  env.APP_HASH,
  { logLevel: "none" },
);
const manager = new ModuleManager(client);
client.setParseMode(undefined);
try {
  await Deno.mkdir("externals");
} catch (_err) {
  //
}
manager.installMultiple(modules, false);
manager.install(managerModule(manager), false);
manager.installMultiple(await ModuleManager.directory("externals"), true);
client.addEventHandler(manager.handler, new NewMessage({}));
client.start();
