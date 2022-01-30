import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { LogLevel } from 'telegram/extensions/Logger'

import env from './env'
import { load } from './modules'
import { installModules } from './module'

const client = new TelegramClient(
	new StringSession(env.STRING_SESSION),
	env.APP_ID,
	env.APP_HASH,
	{}
)
client.setLogLevel(LogLevel.NONE)
async function start() {
	installModules(client, await load())
	await client.start({ botAuthToken: '' })
}
start()
