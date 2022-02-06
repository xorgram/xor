#!/usr/bin/env node

const { join } = require('path')
const { promises: fs } = require('fs')

const { TelegramClient } = require('telegram')
const { NewMessage } = require('telegram/events')
const { StringSession } = require('telegram/sessions')
const { LogLevel } = require('telegram/extensions/Logger')

const { ModuleManager, managerModule } = require('../dist/module_manager')
const env = require('./env')

async function start() {
	const client = new TelegramClient(
		new StringSession(env.STRING_SESSION),
		env.APP_ID,
		env.APP_HASH,
		{}
	)
	const manager = new ModuleManager(client)
	let started = false
	client.setLogLevel(LogLevel.NONE)
	if (started) {
		return
	}
	try {
		await fs.mkdir('externals')
	} catch (_err) {
		//
	}
	manager.installMultiple(
		await ModuleManager.directory(join(__dirname, '..', 'dist', 'modules')),
		false
	)
	manager.install(managerModule(manager), false)
	manager.installMultiple(await ModuleManager.directory('externals'), true)
	client.addEventHandler(manager.handler, new NewMessage({}))
	await client.start({ botAuthToken: '' })
	started = true
}
start()
