import { TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'

export abstract class Handler {
	abstract check(
		client: TelegramClient,
		event: NewMessageEvent
	): Promise<boolean>

	abstract handle(client: TelegramClient, event: NewMessageEvent): Promise<void>
}
