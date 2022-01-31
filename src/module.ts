import { join } from 'path'
import { readdirSync } from 'fs'

import { TelegramClient } from 'telegram'
import { NewMessage, NewMessageEvent } from 'telegram/events'

import { Handler } from './handlers'

export interface Module {
	handlers: Handler[]
}

export async function wrap(func: () => Promise<void>) {
	try {
		await func()
	} catch (err) {
		console.error(err)
	}
}

export async function installModules(client: TelegramClient, dir: string) {
	const modules = new Array<Module>()
	const files = readdirSync(dir)
	for (let file of files) {
		file =
			file.endsWith('.ts') || file.endsWith('.js') ? file.slice(0, -3) : file
		const spec = join(dir, file)
		const mod = await import(spec)
		if (mod.default !== undefined) modules.push(mod.default)
	}
	async function eventHandler(event: NewMessageEvent) {
		for (const { handlers } of modules)
			for (const handler of handlers)
				if (await handler.check(client, event)) {
					try {
						await handler.handle(client, event)
					} catch (err) {
						console.error(err)
					}
				}
	}
	client.addEventHandler(eventHandler, new NewMessage({}))
	return eventHandler
}
