import { dirname, fromFileUrl, join } from "$deps";
import { events, LogLevel, StringSession, TelegramClient } from "$grm";

import env from "./env.ts";
import { managerModule, ModuleManager } from "./module_manager.ts";

async function start() {
  const client = new TelegramClient(
    new StringSession(env.STRING_SESSION),
    env.APP_ID,
    env.APP_HASH,
    {},
  );
  const manager = new ModuleManager(client);
  let started = false;
  client.setLogLevel(LogLevel.NONE);
  if (started) {
    return;
  }
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
  await client.start({ botAuthToken: "" });
  started = true;
}
start();
