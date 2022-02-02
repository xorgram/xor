import { TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'

import { MessageHandler } from './message_handler'

export type CommandHandlerFunc = (
	client: TelegramClient,
	event: NewMessageEvent,
	args: string[],
	input: string
) => Promise<void>

export interface CommandHandlerOpts {
	aliases?: string[]
	rawArgs?: boolean
	rawInput?: boolean
}

export class CommandHandler extends MessageHandler {
	opts: CommandHandlerOpts

	constructor(
		public name: string,
		public func: CommandHandlerFunc,
		opts?: CommandHandlerOpts
	) {
		super(func)
		this.opts = opts ?? {}
		this.opts.rawInput = this.opts.rawInput ?? true
	}

	async check(client: TelegramClient, event: NewMessageEvent) {
		if (!(await super.check(client, event))) return false
		const { text } = event.message
		if (!['\\', '>'].includes(text[0])) return false
		const command = text.split(/\s/)[0].slice(1)
		return this.name == command || !!this.opts?.aliases?.includes(command)
	}

	async handle(client: TelegramClient, event: NewMessageEvent) {
		const { text, message } = event.message
		const args = (this.opts?.rawArgs ? message : text)
			.split('\n')[0]
			.split(/\s/)
			.slice(1)
		let input = ''
		const inputType = message[0]
		const reply = await event.message.getReplyMessage()
		switch (inputType) {
			case '\\':
				input = (this.opts?.rawInput ? message : text)
					.split('\n')
					.slice(1)
					.join('\n')
					.trim()
				break
			case '>':
				if (reply && reply.text) {
					input = this.opts?.rawInput ? reply.message : reply.text
				}
		}
		await this.func(client, event, args, input)
	}
}
