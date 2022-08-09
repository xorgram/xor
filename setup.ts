import * as log from "std/log/mod.ts";
import { getLevelByName } from "std/log/levels.ts";
import { setup } from "pls";

const level = (() => {
  let toReturn = "INFO";
  try {
    const level = Deno.env.get("LOG_LEVEL");
    if (level) {
      // deno-lint-ignore no-explicit-any
      getLevelByName(level as any);
      toReturn = level;
    }
  } catch (_err) {
    //
  }
  return toReturn as log.LevelName;
})();

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler(level),
    file: new log.handlers.FileHandler(level, {
      filename: ".log",
      mode: "a",
    }),
  },
  loggers: {
    default: {
      handlers: ["console", "file"],
    },
  },
});

let connected = false;

if (Deno.env.get("PLS_CONNECTION_URI")) {
  try {
    await setup({ include: [/^module_/] });
    connected = true;
  } catch (err) {
    log.warning(`could not connect to the database: ${err}`);
  }
}

if (connected) {
  log.info("connected to the database");
} else {
  log.info("not using database");
}
