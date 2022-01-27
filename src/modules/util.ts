import { exec, spawn } from 'child_process'

import { zero } from 'big-integer'
import { Api, version as telegramVersion } from 'telegram'

import { Module } from '../module'
import { version } from '../constants'
import { CommandHandler } from '../handlers'

const util: Module = {
	handlers: [
		new CommandHandler('ping', async (client, event) => {
			const before = Date.now()
			await client.invoke(new Api.Ping({ pingId: zero }))
			const diff = Date.now() - before
			await event.message.edit({
				text: event.message.text + ' ' + diff + 'ms'
			})
		}),
		new CommandHandler(
			'shell',
			async (_client, event, args, input) => {
				if (args.length < 1) return
				const command = args[0]
				args = args.slice(1)
				let { text } = event.message
				text = text.slice(text.split(/\s/)[0].length)
				let pidDisplayed = (_?: unknown) => {} // eslint-disable-line
				const displayPid = new Promise(r => (pidDisplayed = r))
				if (input.length == 0) {
					const proc = exec(text, async (err, stdout, stderr) => {
						await displayPid
						if (stdout.length > 0 && stdout.length <= 4096)
							await event.message.reply({ message: stdout })
						if (stderr.length > 0 && stderr.length <= 4096)
							await event.message.reply({ message: stderr })
					}).on('exit', async code => {
						await displayPid
						if (code) {
							text += '\n' + `Exited with code ${code}.`
							await event.message.edit({ text })
						}
					})
					text = `[${proc.pid}]` + text
					await event.message.edit({ text })
					pidDisplayed()
					return
				}
				const stdoutChunks = new Array<Buffer>()
				const stderrChunks = new Array<Buffer>()
				const proc = spawn(command, args).on('close', async code => {
					await displayPid
					if (code != null) {
						text += '\n' + `Exited with code ${code}.`
						await event.message.edit({ text })
					}
					const stdout = stdoutChunks.map(String).join('')
					const stderr = stderrChunks.map(String).join('')
					if (stdout.length > 0 && stdout.length <= 4096)
						await event.message.reply({ message: stdout })
					if (stderr.length > 0 && stderr.length <= 4096)
						await event.message.reply({ message: stderr })
				})
				proc.stdout.on('data', c => stdoutChunks.push(c))
				proc.stderr.on('data', c => stderrChunks.push(c))
				text = `[${proc.pid}]` + text
				await event.message.edit({ text })
				pidDisplayed()
				proc.stdin.write(input)
				proc.stdin.end()
			},
			['sh', 'cmd', 'exec']
		),
		new CommandHandler('uptime', async (_client, event) => {
			let seconds = Math.floor(process.uptime())
			const hours = Math.floor(seconds / 3600)
			var minutes = Math.floor((seconds - hours * 3600) / 60)
			seconds = seconds - hours * 3600 - minutes * 60
			await event.message.edit({
				text:
					event.message.text +
					' ' +
					(hours > 0 ? `${hours > 9 ? hours : '0' + hours}:` : '') +
					`${minutes > 9 ? minutes : '0' + minutes}:` +
					`${seconds > 9 ? seconds : '0' + seconds}`
			})
		}),
		new CommandHandler(
			'version',
			async (_client, event) => {
				await event.message.edit({
					text:
						event.message.text +
						'\n' +
						'Xor ' +
						version +
						'\n' +
						'Node.js ' +
						process.version.slice(1) +
						'\n' +
						'Gram.js ' +
						telegramVersion
				})
			},
			['v']
		)
	]
}

export default util
