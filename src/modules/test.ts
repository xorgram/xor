import { Module } from '../module'
import { CommandHandler } from '../handlers'

const test: Module = {
	handlers: [
		new CommandHandler('test', async (_client, event, args, input) => {
			await event.message.reply({
				message: `Args: ${args}\nInput: ${input}`
			})
		})
	]
}

export default test
