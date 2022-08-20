import { EditedMessage, NewMessage, StringSession } from "$grm";
import { Client } from "./client.ts";
import "./setup.ts";
import env from "./env.ts";
import modules from "./modules/mod.ts";
import * as log from "std/log/mod.ts";
import { managerModule, ModuleManager } from "./module_manager.ts";

const client = new Client(
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
manager.installMultiple(
  await ModuleManager.files(
    Object.keys(localStorage).filter((v) => v.startsWith("module_")).map((v) =>
      localStorage.getItem(v)!
    ),
  ),
  true,
);
client.addEventHandler(manager.handler, new NewMessage({}));
client.addEventHandler(manager.handler, new EditedMessage({}));
await client.start();
log.info("started");
