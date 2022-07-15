import { dirname, fromFileUrl, html, join } from "$deps";
import { Api, events, TelegramClient } from "$grm";

import { CommandHandler } from "./handlers/mod.ts";
import { updateMessage } from "./helpers.ts";
import { getHelp, isModule, Module } from "./module.ts";

const externals = join(
  dirname(fromFileUrl(import.meta.url)),
  "externals",
);

export function managerModule(manager: ModuleManager): Module {
  return {
    name: "manager",
    handlers: [
      new CommandHandler("install", async ({ client, event }) => {
        const reply = await event.message.getReplyMessage();
        if (!reply) {
          return;
        }
        const { media } = reply;
        if (
          !(media instanceof Api.MessageMediaDocument) ||
          !(media.document instanceof Api.Document) ||
          media.document.mimeType != "text/vnd.trolltech.linguist" ||
          media.document.size.gt(5000)
        ) {
          return;
        }
        const result = await client.downloadMedia(media, {});
        if (!result) {
          await updateMessage(event, "Could not download the module.");
          return;
        }
        const spec = join(externals, `.${media.document.id}.ts`);
        await Deno.writeTextFile(
          spec,
          typeof result === "string" ? result : result.toString(),
        );
        let module;
        try {
          module = await ModuleManager.file(spec);
        } catch (_err) {
          await updateMessage(event, "The replied file is not a valid module.");
          return;
        }
        if (manager.modules.has(module.name)) {
          await updateMessage(event, "Module already installed.");
          return;
        }
        await Deno.rename(spec, join(externals, `${module.name}.ts`));
        manager.install(module, true);
        await updateMessage(event, "Module installed.");
      }),
      new CommandHandler("uninstall", async ({ event, args }) => {
        let uninstalled = 0;
        for (const arg of args) {
          const spec = join("externals", `${arg}.ts`);
          try {
            await Deno.remove(spec);
            manager.uninstall(arg);
            uninstalled++;
          } catch (_err) {
            //
          }
        }
        await updateMessage(
          event,
          `${uninstalled <= 0 ? "No" : uninstalled} module${
            uninstalled == 1 ? "" : "s"
          } uninstalled.`,
        );
      }),
      new CommandHandler("disable", async ({ event, args }) => {
        if (args.length == 0) {
          return;
        }
        let disabled = 0;
        for (const arg of args) {
          if (!manager.disabled.has(arg)) {
            manager.disabled.add(arg);
            disabled++;
          }
        }
        await updateMessage(
          event,
          `${disabled <= 0 ? "No" : disabled} module${
            disabled == 1 ? "" : "s"
          } disabled.`,
        );
      }),
      new CommandHandler("enable", async ({ event, args }) => {
        if (args.length == 0) {
          return;
        }
        let enabled = 0;
        for (const arg of args) {
          if (manager.disabled.has(arg)) {
            manager.disabled.delete(arg);
            enabled++;
          }
        }
        await updateMessage(
          event,
          `${enabled <= 0 ? "No" : enabled} module${
            enabled == 1 ? "" : "s"
          } enabled.`,
        );
      }),
      new CommandHandler("modules", async ({ event }) => {
        const all = Array.from(manager.modules.values());
        const nonDisableables = all
          .filter(([, disableable]) => !disableable)
          .map(([module]) => module.name);
        const installed = all
          .filter(([, disableable]) => disableable)
          .map(([module]) => module.name);
        let message = "**Built-in**\n";
        for (const module of nonDisableables) {
          message += html(module) + "\n";
        }
        message += "\n**Installed**\n";
        if (installed.length == 0) {
          message += "No modules installed.";
        } else {
          for (const module of installed) {
            message += html(module) + "\n";
          }
        }
        await event.message.reply({ message });
      }),
      new CommandHandler("help", async ({ event, args }) => {
        const name = args[0];
        if (!name) {
          await updateMessage(event, "Pass a module name as an argument.");
          return;
        }
        const module = manager.modules.get(name);
        if (!module) {
          await updateMessage(event, "This module is not installed.");
          return;
        }
        const message = getHelp(module[0]);
        if (!message) {
          await updateMessage(event, "This module has no help.");
          return;
        }
        await event.message.reply({ message });
      }),
    ],
    help: `
**Introduction**

The module manager lets you list the installed modules, get help for them and install external modules.

**Commands**

- install

Installs an external module from the replied module file.

- uninstall

Uninstalls one or more external modules.

- disable

Disables one or more external modules.

- enable

Enables one or more external modules.

- modules

Lists the installed modules.

- help

Sends the help message of a module if existing.
		`,
  };
}

export class ModuleManager {
  modules = new Map<string, [Module, boolean]>();

  constructor(
    private client: TelegramClient,
    public disabled = new Set<string>(),
  ) {}

  handler = async (event: events.NewMessageEvent) => {
    for (const [, [{ name, handlers }, disableable]] of this.modules) {
      if (disableable && this.disabled.has(name)) {
        return;
      }
      for (const handler of handlers) {
        if (await handler.check({ client: this.client, event })) {
          try {
            await handler.handle({ client: this.client, event });
          } catch (err) {
            console.error(err);
            try {
              let message = String(err);
              message = message.length <= 1000 ? message : "An error occurred.";
              await event.message.reply({ message });
            } catch (_err) {
              //
            }
          }
        }
      }
    }
  };

  install(module: Module, disableable = false) {
    if (this.modules.has(module.name)) {
      throw new Error(`Module ${module.name} is already installed`);
    }
    this.modules.set(module.name, [module, disableable]);
  }

  installMultiple(modules: Module[], disableable: boolean) {
    for (const module of modules) {
      this.install(module, disableable);
    }
  }

  uninstall(name: string) {
    return this.modules.delete(name);
  }

  uninstallMultiple(names: string[]) {
    return names.map(this.uninstall);
  }

  uninstallAll() {
    const disableables = new Array<string>();
    for (const [, [{ name }, disableable]] of this.modules) {
      if (disableable) {
        disableables.push(name);
      }
    }
    this.uninstallMultiple(disableables);
  }

  static async file(spec: string) {
    const mod = (await import(spec)).default;
    if (!isModule(mod)) {
      throw new Error("Invalid module");
    }
    return mod as Module;
  }

  static async directory(path: string) {
    const modules = new Array<Module>();
    for await (let { name: file } of Deno.readDir(path)) {
      if (file.startsWith(".")) {
        continue;
      }
      file = file.endsWith(".ts") || file.endsWith(".js")
        ? file.slice(0, -3)
        : `${file}/mod.ts`;
      const spec = join(path, file);
      const mod = await this.file(spec);
      modules.push(mod);
    }
    return modules;
  }
}
