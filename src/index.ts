import { join } from 'path'

import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { LogLevel } from 'telegram/extensions/Logger'

import env from './env'
import { ModuleManager } from './module_manager'
import { NewMessage } from 'telegram/events'

const client = new TelegramClient(
	new StringSession(env.STRING_SESSION),
	env.APP_ID,
	env.APP_HASH,
	{}
)
const manager = new ModuleManager(client)
client.setLogLevel(LogLevel.NONE)
client.addEventHandler(manager.handler, new NewMessage({}))
async function start() {
	manager.installMultiple(
		false,
		...(await ModuleManager.directory(join(__dirname, 'modules')))
	)
	await client.start({ botAuthToken: '' })
}
start()
