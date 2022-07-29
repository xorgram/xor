import { getLevelByName, log } from "./deps.ts";

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
