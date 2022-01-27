import { TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'

import { MessageHandler } from './message_handler'

export type CommandHandlerFunc = (
	client: TelegramClient,
	event: NewMessageEvent,
	args: string[],
	input: string
) => Promise<void>

export class CommandHandler extends MessageHandler {
	constructor(
		public name: string,
		public func: CommandHandlerFunc,
		public aliases?: string[]
	) {
		super(func)
	}

	async check(client: TelegramClient, event: NewMessageEvent) {
		if (!super.check(client, event)) return false
		const { text } = event.message
		if (!['\\', '>'].includes(text[0])) return false
		const command = text.split(/\s/)[0].slice(1)
		return this.name == command || !!this.aliases?.includes(command)
	}

	async handle(client: TelegramClient, event: NewMessageEvent) {
		const { text } = event.message
		const args = text.split('\n')[0].split(/\s/).slice(1)
		let input = ''
		const inputType = event.message.text[0]
		const reply = await event.message.getReplyMessage()
		switch (inputType) {
			case '\\':
				input = text.split('\n').slice(1).join('\n').trim()
				break
			case '>':
				if (reply && reply.text) {
					input = reply.text
				}
		}
		await this.func(client, event, args, input)
	}
}
