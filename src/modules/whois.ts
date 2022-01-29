import { Module } from '../module'
import { CommandHandler } from '../handlers'
import { Api } from 'telegram'
import { escape } from 'html-escaper'

const whois: Module = {
	handlers: [
		new CommandHandler('whois', async (client, event, _args, input) => {
			let userId: bigInt.BigInteger | string = 'me'

			// In private chats show details of the person you are talking to
			if (event.isPrivate && event.chatId) {
				userId = event.chatId
			}

			/**
			 * Additionally userid/username can be used
			 * @example >whois 777000
			 */
			if (input) {
				userId = input
			}

			// Get info of user by replying to his/her message
			if (!event.isPrivate && event.message.replyToMsgId) {
				const repliedToMessage = await event.message.getReplyMessage()
				if (
					repliedToMessage &&
					repliedToMessage.fromId &&
					'userId' in repliedToMessage.fromId
				) {
					userId = repliedToMessage.fromId.userId
				}
			}

			const userEntity = await client.getEntity(userId)
			const { fullUser, users } = await client.invoke(
				new Api.users.GetFullUser({ id: userEntity })
			)
			const user = users[0]

			// Check if type of user is Api.User
			if ('firstName' in user) {
				await event.message.edit({
					text:
						`<a href="tg://user?id=${user.id}"><b>${escape(
							user.firstName || ''
						)} ${escape(user.lastName || '')}</b></a>\n` +
						`<b>ID:</b> <code>${user.id}</code>\n` +
						`<b>DC:</b> ${
							user.photo && 'dcId' in user.photo ? user.photo.dcId : 'N/A'
						}\n` +
						`<b>Username:</b> ${
							user.username ? '@' + user.username : 'N/A'
						}\n` +
						`<b>Description:</b> ${fullUser.about || 'N/A'}`,
					parseMode: 'html'
				})
			}
			// If typeof user is UserEmpty
			else {
				await event.message.edit({ text: 'Invalid id/username' })
			}
		})
	]
}

export default whois
