import { TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'

export interface IHandler {
	client: TelegramClient
	event: NewMessageEvent
}

export abstract class Handler {
	abstract check({ client, event }: IHandler): Promise<boolean>

	abstract handle({ client, event }: IHandler): Promise<void>
}
