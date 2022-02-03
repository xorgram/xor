import { NewMessageEvent } from 'telegram/events'

export async function wrap(event: NewMessageEvent, func: () => Promise<void>) {
	try {
		await func()
	} catch (err) {
		console.error(err)
		try {
			let message = String(err)
			message = message.length <= 1000 ? message : 'An error occurred.'
			await event.message.reply({ message })
		} catch (_err) {
			//
		}
	}
}
