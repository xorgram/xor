import { join } from 'path'

import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { LogLevel } from 'telegram/extensions/Logger'

import env from './env'
import { installModules } from './module'

const client = new TelegramClient(
	new StringSession(env.STRING_SESSION),
	env.APP_ID,
	env.APP_HASH,
	{}
)
client.setLogLevel(LogLevel.NONE)
async function start() {
	await installModules(client, join(__dirname, 'modules'))
	await client.start({ botAuthToken: '' })
}
start()
