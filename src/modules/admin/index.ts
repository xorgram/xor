import { Api } from 'telegram'
import { Methods } from '@xorgram/methods'
import { CommandHandler } from '../../handlers'
import { Module } from '../../module'
import { getUser, wrapRpcErrors } from './helpers'

const admin: Module = {
	name: 'admin',
	handlers: [
		new CommandHandler('promote', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				return
			}
			const user = await getUser(event, client, args, true)
			if (!user) {
				await event.message.edit({ text: 'User not found.' })
				return
			}
			if (chat instanceof Api.Channel) {
				const xor = new Methods(client)
				await wrapRpcErrors(event, async () => {
					await xor.promoteChatMember({
						chatId: chat.id,
						userId: user.entity,
						rank: user.rank,
						canChangeInfo: chat.adminRights?.changeInfo,
						canDeleteMessages: chat.adminRights?.deleteMessages,
						canEditMessages: chat.adminRights?.editMessages,
						canInviteUsers: chat.adminRights?.inviteUsers,
						canManageCalls: chat.adminRights?.manageCall,
						canPinMessages: chat.adminRights?.pinMessages,
						canPromoteMembers: chat.adminRights?.addAdmins,
						canRestrictMembers: chat.adminRights?.banUsers
					})
					await event.message.edit({
						text: event.message.text + '\n' + 'User promoted.'
					})
				})
			} else {
				await event.message.edit({
					text: event.message.text + '\n' + 'Cannot promote here.'
				})
			}
		}),
		new CommandHandler('demote', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				return
			}
			const user = await getUser(event, client, args)
			if (!user) {
				await event.message.edit({
					text: event.message.text + '\n' + 'User not found.'
				})
				return
			}
			if (chat instanceof Api.Channel) {
				const xor = new Methods(client)
				await wrapRpcErrors(event, async () => {
					await xor.promoteChatMember({
						chatId: chat.id,
						userId: user.entity,
						rank: user.rank,
						canManageChat: false
					})
					await event.message.edit({
						text: event.message.text + '\n' + 'User demoted.'
					})
				})
			} else {
				await event.message.edit({
					text: event.message.text + '\n' + 'Cannot demote here.'
				})
			}
		}),
		new CommandHandler('ban', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				return
			}
			const user = await getUser(event, client, args)
			if (!user) {
				await event.message.edit({
					text: event.message.text + '\n' + 'User not found.'
				})
				return
			}
			await wrapRpcErrors(event, async () => {
				const xor = new Methods(client)
				await xor.banChatMember({
					chatId: chat.id,
					userId: await client.getEntity(user.entity)
				})
				await event.message.edit({
					text: event.message.text + '\n' + 'User banned.'
				})
			})
		}),
		new CommandHandler('unban', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				return
			}
			const user = await getUser(event, client, args)
			if (!user) {
				await event.message.edit({
					text: event.message.text + '\n' + 'User not found.'
				})
				return
			}

			await wrapRpcErrors(event, async () => {
				const xor = new Methods(client)
				await xor.unbanChatMember({
					chatId: chat.id,
					userId: await client.getEntity(user.entity)
				})
				await event.message.edit({
					text: event.message.text + '\n' + 'User unbanned.'
				})
			})
		}),
		new CommandHandler('pin', async (client, event, args) => {
			const chat = await event.message.getChat()
			if (!chat) {
				return
			}
			const reply = await event.message.getReplyMessage()
			if (reply) {
				const xor = new Methods(client)
				await wrapRpcErrors(event, async () => {
					await xor.pinChatMessage({
						chatId: chat.id,
						messageId: reply.id,
						disableNotification: args[0] === 'silent'
					})
					await event.message.edit({
						text: event.message.text + '\n' + 'Message pinned.'
					})
				})
			} else {
				await event.message.edit({
					text: event.message.text + '\n' + 'Reply a the message to pin.'
				})
			}
		}),
		new CommandHandler('unpin', async (client, event) => {
			const chat = await event.message.getChat()
			if (!chat) {
				return
			}
			const reply = await event.message.getReplyMessage()
			if (reply) {
				const xor = new Methods(client)
				await wrapRpcErrors(event, async () => {
					const resp = await xor.unpinChatMessage({
						chatId: chat.id,
						messageId: reply.id
					})
					if (resp instanceof Api.Updates) {
						await event.message.edit({
							text:
								event.message.text + '\n' + resp.updates.length
									? 'Message unpinned.'
									: 'Message was not pinned.'
						})
					}
				})
			} else {
				await event.message.edit({
					text: event.message.text + '\n' + 'Reply a pinned message to unpin.'
				})
			}
		})
	],
	help: `
**Introduction**

This module includes commands to make administrating chats easily

**Commands**

- promote

Promotes user to admin. Format : 'promote @username custom-title'. Or if you reply to someone's message - 'promote custom-title'. Custom title is optional.

- demote

Demotes participant from admin to user. Format : 'demote @username/userid'. Or if you reply to someone's message - 'demote'.

- ban

Bans or removes user from chat. Format : 'ban username/user id' or reply 'ban' to someone's message.

- unban

Unban user from supergroup. Format : 'unban username/user id' or reply 'unban' to banned user's message.

- pin

Pins a message. Reply 'pin' to the target message. Use 'pin silent' for silent pins.

- unpin

Unpins a pinned message. Reply 'unpin' to the pinned message.
`
}

export default admin
