import { join } from 'path'
import { promises as fs } from 'fs'

import { Api, TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'
import escape from 'html-escape'

import { Module, isModule } from './module'
import { CommandHandler } from './handlers'
import { getHelp } from '.'

export function managerModule(manager: ModuleManager): Module {
	return {
		name: 'manager',
		handlers: [
			new CommandHandler('install', async (client, event) => {
				const reply = await event.message.getReplyMessage()
				if (!reply) {
					return
				}
				const { media } = reply
				if (
					!(media instanceof Api.MessageMediaDocument) ||
					!(media.document instanceof Api.Document) ||
					media.document.mimeType != 'application/javascript' ||
					media.document.size > 5000
				) {
					return
				}
				const result = await client.downloadMedia(media, {})
				const spec = join('externals', '.' + media.document.id + '.js')
				await fs.writeFile(spec, result)
				let module
				try {
					module = await ModuleManager.file(spec)
				} catch (err) {
					await event.message.edit({
						text:
							event.message.text +
							'\n' +
							'The replied file is not a valid module.'
					})
					return
				}
				if (manager.modules.has(module.name)) {
					await event.message.edit({
						text: event.message.text + '\n' + 'Module already installed.'
					})
					return
				}
				await fs.rename(spec, join('externals', module.name + '.js'))
				manager.install(module, true)
				await event.message.edit({
					text: event.message.text + '\n' + 'Module installed.'
				})
			}),
			new CommandHandler('uninstall', async (_client, event, args) => {
				let uninstalled = 0
				for (const arg of args) {
					const spec = join('externals', arg + '.js')
					try {
						await fs.rm(spec)
						manager.uninstall(arg)
						uninstalled++
					} catch (err) {
						//
					}
				}
				await event.message.edit({
					text:
						event.message.text +
						'\n' +
						`${uninstalled <= 0 ? 'No' : uninstalled} module${
							uninstalled == 1 ? '' : 's'
						} uninstalled.`
				})
			}),
			new CommandHandler('disable', async (_client, event, args) => {
				if (args.length == 0) {
					return
				}
				let disabled = 0
				for (const arg of args) {
					if (!manager.disabled.has(arg)) {
						manager.disabled.add(arg)
						disabled++
					}
				}
				await event.message.edit({
					text:
						event.message.text +
						'\n' +
						`${disabled <= 0 ? 'No' : disabled} module${
							disabled == 1 ? '' : 's'
						} disabled.`
				})
			}),
			new CommandHandler('enable', async (_client, event, args) => {
				if (args.length == 0) {
					return
				}
				let enabled = 0
				for (const arg of args) {
					if (manager.disabled.has(arg)) {
						manager.disabled.delete(arg)
						enabled++
					}
				}
				await event.message.edit({
					text:
						event.message.text +
						'\n' +
						`${enabled <= 0 ? 'No' : enabled} module${
							enabled == 1 ? '' : 's'
						} enabled.`
				})
			}),
			new CommandHandler('modules', async (_client, event) => {
				const all = Array.from(manager.modules.values())
				const nonDisableables = all
					.filter(([, disableable]) => !disableable)
					.map(([module]) => module.name)
				const installed = all
					.filter(([, disableable]) => disableable)
					.map(([module]) => module.name)
				let message = '**Built-in**\n'
				for (const module of nonDisableables) {
					message += escape(module) + '\n'
				}
				message += '\n**Installed**\n'
				if (installed.length == 0) {
					message += 'No modules installed.'
				} else {
					for (const module of installed) {
						message += escape(module) + '\n'
					}
				}
				await event.message.reply({ message })
			}),
			new CommandHandler('help', async (_client, event, args) => {
				const name = args[0]
				if (!name) {
					await event.message.edit({
						text:
							event.message.text + '\n' + 'Pass a module name as an argument.'
					})
					return
				}
				const module = manager.modules.get(name)
				if (!module) {
					await event.message.edit({
						text: event.message.text + '\n' + 'This module is not installed.'
					})
					return
				}
				const message = getHelp(module[0])
				if (!message) {
					await event.message.edit({
						text: event.message.text + '\n' + 'This module has no help.'
					})
					return
				}
				await event.message.reply({ message })
			})
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
		`
	}
}

export class ModuleManager {
	modules = new Map<string, [Module, boolean]>()

	constructor(
		private client: TelegramClient,
		public disabled = new Set<string>()
	) {}

	handler = async (event: NewMessageEvent) => {
		for (const [, [{ name, handlers }, disableable]] of this.modules) {
			if (disableable && this.disabled.has(name)) {
				return
			}
			for (const handler of handlers) {
				if (await handler.check(this.client, event)) {
					try {
						await handler.handle(this.client, event)
					} catch (err) {
						console.error(err)
						try {
							let message = String(err)
							message = message.length <= 1000 ? message : 'An error occurred.'
							await event.message.reply({ message })
						} catch (err) {
							//
						}
					}
				}
			}
		}
	}

	install(module: Module, disableable = false) {
		if (this.modules.has(module.name)) {
			throw new Error(`Module ${module.name} is already installed`)
		}
		this.modules.set(module.name, [module, disableable])
	}

	installMultiple(modules: Module[], disableable: boolean) {
		for (const module of modules) {
			this.install(module, disableable)
		}
	}

	uninstall(name: string) {
		return this.modules.delete(name)
	}

	uninstallMultiple(names: string[]) {
		return names.map(this.uninstall)
	}

	uninstallAll() {
		const disableables = new Array<string>()
		for (const [, [{ name }, disableable]] of this.modules) {
			if (disableable) {
				disableables.push(name)
			}
		}
		this.uninstallMultiple(disableables)
	}

	static async file(spec: string) {
		const mod = (await import(spec)).default
		if (!isModule(mod)) {
			throw new Error('Invalid module')
		}
		return <Module>mod
	}

	static async directory(path: string) {
		const modules = new Array<Module>()
		const files = await fs.readdir(path)
		for (let file of files) {
			if (file.startsWith('.')) {
				continue
			}
			file =
				file.endsWith('.ts') || file.endsWith('.js') ? file.slice(0, -3) : file
			const spec = join(path, file)
			const mod = await this.file(spec)
			modules.push(mod)
		}
		return modules
	}
}
