import { Api } from 'telegram'
import { sleep } from 'telegram/Helpers'
import { CommandHandler } from '../../handlers'
import { Module } from '../../module'
import {
	amIAdmin,
	isUserAdmin,
	promote,
	demote,
	banUser,
	getUser
} from './helpers'

const admin: Module = {
	name: 'admin',
	handlers: [
		new CommandHandler('promote', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				await event.message.edit({ text: "Couldn't fetch chat info" })
				return
			}

			if (!amIAdmin(chat)) {
				await event.message.edit({ text: 'I am not an admin here' })
				return
			}

			const user = await getUser(event, client, args, true)
			if (!user) {
				await event.message.edit({ text: 'User not found' })
				return
			}

			if (await isUserAdmin(user.entity, chat, client)) {
				await event.message.edit({
					text: "User is already an admin, Can't promote him/her"
				})
				return
			}

			if (chat instanceof Api.Channel && chat.adminRights) {
				await promote(user.entity, user.rank, chat, client)
				await event.message.edit({ text: 'Promoted to admin' })
			} else {
				await event.message.edit({ text: 'I have no admin rights.' })
				await sleep(2500)
				await event.message.delete({ revoke: true })
			}
		}),
		new CommandHandler('demote', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				await event.message.edit({ text: "Couldn't fetch chat info" })
				return
			}

			if (!amIAdmin(chat)) {
				await event.message.edit({ text: 'I am not an admin here' })
				return
			}

			const user = await getUser(event, client, args)
			if (!user) {
				await event.message.edit({ text: 'User not found' })
				return
			}

			if (!(await isUserAdmin(user.entity, chat, client))) {
				await event.message.edit({ text: "User isn't an admin" })
				return
			}

			if (chat instanceof Api.Channel && chat.adminRights) {
				await demote(user.entity, chat, client)
				await event.message.edit({ text: 'Demoted successfully' })
			} else {
				await event.message.edit({ text: "Can't demote this user" })
				await sleep(3000)
				await event.message.delete({ revoke: true })
			}
		}),
		new CommandHandler('ban', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				await event.message.edit({ text: "Couldn't fetch chat info" })
				return
			}

			if (chat instanceof Api.Channel && !chat.adminRights) {
				await event.message.edit({ text: 'I am not an admin here' })
				return
			}

			const user = await getUser(event, client, args)
			if (!user) {
				await event.message.edit({ text: 'User not found' })
				return
			}

			if (await isUserAdmin(user.entity, chat, client)) {
				await event.message.edit({ text: 'User is an admin' })
				return
			}

			await banUser(user.entity, chat, client)
			await event.message.edit({ text: 'Banned successully' })
		})
	],
	help: `
**Introduction**

This module includes commands to make administrating chats easily

**Commands**

- promote

Promotes user to admin. Format : 'promote @username custom-title'. Or if you reply to someone's message - 'promote custom-title'. Custom title is optional.

- demote

Demotes participant from admin to user. Format : 'demote @username/userid'. Or if you reply to someone's message - 'demote'

- ban

Bans or removes user from chat. Format : 'ban username/user id' or reply 'ban' to someone's message
`
}

export default admin
