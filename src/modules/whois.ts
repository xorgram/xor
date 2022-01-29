import { Module } from '../module'
import { CommandHandler } from '../handlers'
import { Api } from 'telegram'
import { escape } from 'html-escaper'

const whois: Module = {
	handlers: [
		new CommandHandler('whois', async (client, event, args) => {
			let userId: bigInt.BigInteger | string = 'me'

			// In private chats show details of the person you are talking to
			if (event.isPrivate) {
				userId = event.chatId as bigInt.BigInteger
			}

			/**
			 * Additionally userid/username can be used
			 * @example >whois 777000
			 */
			if (args.length) {
				userId = args[0]
			}

			// Get info of user by replying to his/her message
			if (!event.isPrivate && event.message.replyToMsgId) {
				const repliedToMessage = await event.message.getReplyMessage()
				if (repliedToMessage) {
					userId = (repliedToMessage.fromId as Api.PeerUser).userId
				}
			}

			const userEntity = await client.getEntity(userId)
			const { fullUser, users } = await client.invoke(
				new Api.users.GetFullUser({ id: userEntity })
			)
			const user = users[0] as Api.User

			await event.message.edit({
				text:
					`<a href="tg://user?id=${user.id}"><b>${escape(
						user.firstName as string
					)} ${escape(user.lastName || '')}</b></a>\n` +
					`<b>ID:</b> <code>${user.id}</code>\n` +
					`<b>DC:</b> ${
						user.photo && 'dcId' in user.photo ? user.photo.dcId : 'N/A'
					}\n` +
					`<b>Username:</b> ${user.username ? '@' + user.username : 'N/A'}\n` +
					`<b>Description:</b> ${fullUser.about || 'N/A'}`,
				parseMode: 'html'
			})
		})
	]
}

export default whois
