import { Handler } from "./handlers/mod.ts";
import { FormattedString } from "./deps.ts";

export interface Module {
  name: string;
  handlers: Handler[];
  help?: string | FormattedString;
}

export function isModule(value: unknown): value is Module {
  const obj = Object(value);
  return (
    typeof obj.name === "string" &&
    Array.isArray(obj.handlers) &&
    obj.handlers.filter((handler: unknown) => handler instanceof Handler)
        .length != undefined
  );
}

export function getHelp(mod: Module) {
  if (typeof mod.help !== "undefined") {
    const length = typeof mod.help === "string"
      ? mod.help.length
      : mod.help.text.length;
    if (length > 0 && length <= 4096) {
      return mod.help;
    }
  }
}
