import { TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'

import { Handler } from './handler'

export type MessageHandlerFunc = (
	client: TelegramClient,
	event: NewMessageEvent,
	..._: any // eslint-disable-line @typescript-eslint/no-explicit-any
) => Promise<void>

export class MessageHandler extends Handler {
	out?: boolean
	scope?: 'all' | 'group' | 'private' | 'channel'
	allowForward?: boolean

	constructor(public func: MessageHandlerFunc) {
		super()
	}

	async check(_client: TelegramClient, event: NewMessageEvent) {
		if (this.out !== undefined && this.out !== event.message.out) {
			return false
		}
		if (!event.message.out) {
			return false
		}
		if (this.allowForward != false && event.message.forward !== undefined) {
			return false
		}
		if (this.scope !== undefined && this.scope !== 'all') {
			if (this.scope == 'group' && !event.isGroup) {
				return false
			} else if (this.scope == 'private' && !event.isPrivate) {
				return false
			} else if (!event.isChannel) {
				return false
			}
		}
		return true
	}

	handle(client: TelegramClient, event: NewMessageEvent) {
		return this.func(client, event)
	}
}
