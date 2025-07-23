import { Client } from "./client.ts";
import "./setup.ts";
import env from "./env.ts";
import modules from "./modules/mod.ts";
import * as log from "@std/log";
import { managerModule, ModuleManager } from "./module_manager.ts";
import { replyFmt } from "./deps.ts";

const client = new Client({
  apiId: env.APP_ID,
  apiHash: env.APP_HASH,
  authString: env.STRING_SESSION,
});

client.use(replyFmt);

const manager = new ModuleManager(client);

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
    Object.keys(localStorage)
      .filter((v) => v.startsWith("module_"))
      .map((v) => localStorage.getItem(v)!),
  ),
  true,
);

client.on("message:text", manager.handler);
client.on("editedMessage:text", manager.handler);

await client.start();
log.info("started");
