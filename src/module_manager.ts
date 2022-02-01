import { join } from 'path'
import { readdirSync } from 'fs'

import { TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'

import { Module, isModule } from './module'

export class ModuleManager {
	private modules = new Map<string, [Module, boolean]>()

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
		const files = readdirSync(path)
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
