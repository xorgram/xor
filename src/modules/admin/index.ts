import { Api } from 'telegram'
import { sleep } from 'telegram/Helpers'
import { CommandHandler } from '../../handlers'
import { Module } from '../../module'

const admin: Module = {
	name: 'admin',
	handlers: [
		new CommandHandler('promote', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				await event.message.edit({ text: "Couldn't fetch chat info" })
				return
			}

			let entity: Api.TypeEntityLike = {} as Api.TypeEntityLike
			let rank = 'Admin'

			const reply = await event.message.getReplyMessage()
			if (reply) {
				const sender = await reply.getSender()
				if (sender) {
					entity = sender
				}
				if (args[0]) {
					rank = args[0]
				}
			} else if (args[0] !== undefined && args[0].length != 0) {
				entity = await client.getEntity(args[0])
				if (!(entity instanceof Api.User)) {
					await event.message.edit({ text: 'Invalid username/user id' })
					return
				}
				if (args[1]) {
					rank = args[1]
				}
			}

			if (chat instanceof Api.Channel && chat.adminRights) {
				await client.invoke(
					new Api.channels.EditAdmin({
						channel: chat.id,
						userId: entity,
						adminRights: new Api.ChatAdminRights({
							addAdmins: chat.adminRights.addAdmins,
							anonymous: chat.adminRights.anonymous,
							banUsers: chat.adminRights.banUsers,
							changeInfo: chat.adminRights.changeInfo,
							deleteMessages: chat.adminRights.deleteMessages,
							editMessages: chat.adminRights.deleteMessages,
							inviteUsers: chat.adminRights.inviteUsers,
							manageCall: chat.adminRights.manageCall,
							pinMessages: chat.adminRights.pinMessages,
							postMessages: chat.adminRights.postMessages,
							other: chat.adminRights.other
						}),
						rank
					})
				)
				await event.message.edit({ text: 'Promoted to ' + rank })
			} else {
				await event.message.edit({ text: 'I have no admin rights.' })
				await sleep(2500)
				await event.message.delete({ revoke: true })
			}
		})
	],
	help: `
**Introduction**

This module includes commands to make administrating chats easily

**Commands**

- promote

Promotes user to admin. Format : 'promote @username custom-title'. Or if you reply to someone's message - 'promote custom-title'. Custom title is optional.

`
}

export default admin
