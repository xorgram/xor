import { TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'

export interface HandlerFuncParams {
	client: TelegramClient
	event: NewMessageEvent
}

export abstract class Handler {
	abstract check({ client, event }: HandlerFuncParams): Promise<boolean>

	abstract handle({ client, event }: HandlerFuncParams): Promise<void>
}
