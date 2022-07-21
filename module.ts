import { Handler } from "./handlers/mod.ts";

export interface Module {
  name: string;
  handlers: Handler[];
  help?: string;
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
  if (mod.help !== undefined) {
    mod.help = mod.help.trim();
    if (mod.help.length > 0 && mod.help.length <= 4096) {
      return mod.help;
    }
  }
}
