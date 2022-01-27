import { TelegramClient } from 'telegram'
import { NewMessage, NewMessageEvent } from 'telegram/events'

import { Handler } from './handlers'

export interface Module {
	handlers: Handler[]
}

export function installModules(client: TelegramClient, modules: Module[]) {
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
