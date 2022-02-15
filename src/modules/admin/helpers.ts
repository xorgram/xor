import { Api, TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'

export const amIAdmin = (chat: Api.TypeEntityLike) => {
	return chat instanceof Api.Channel && !chat.adminRights
}

export const isUserAdmin = async (
	user: Api.User,
	chat: Api.TypeEntityLike,
	client: TelegramClient
) => {
	const participant = (
		await client.invoke(
			new Api.channels.GetParticipant({
				channel: chat,
				participant: user
			})
		)
	).participant

	return (
		participant instanceof Api.ChannelParticipantAdmin ||
		participant instanceof Api.ChannelParticipantCreator
	)
}

export const getUser = async (
	event: NewMessageEvent,
	client: TelegramClient,
	args: string[],
	getRank = false
) => {
	let entity: Api.User = {} as Api.User
	let rank = 'Admin'

	const reply = await event.message.getReplyMessage()
	if (reply) {
		const sender = await reply.getSender()
		if (sender && sender instanceof Api.User) {
			entity = sender
		}
		if (getRank && args[0]) {
			rank = args[0]
		}
	} else if (args[0] !== undefined && args[0].length != 0) {
		const _entity = await client.getEntity(args[0])
		if (!(_entity instanceof Api.User)) {
			await event.message.edit({ text: 'Invalid username/user id' })
			return
		}
		entity = _entity
		if (getRank && args[1]) {
			rank = args[1]
		}
	}

	return {
		entity,
		rank: rank
	}
}

export const promote = async (
	user: Api.User,
	rank: string,
	chat: Api.Channel,
	client: TelegramClient
) => {
	await client.invoke(
		new Api.channels.EditAdmin({
			channel: chat.id,
			userId: user,
			adminRights: new Api.ChatAdminRights({
				addAdmins: chat.adminRights?.addAdmins ?? false,
				anonymous: chat.adminRights?.anonymous ?? false,
				banUsers: chat.adminRights?.banUsers ?? false,
				changeInfo: chat.adminRights?.changeInfo ?? false,
				deleteMessages: chat.adminRights?.deleteMessages ?? false,
				editMessages: chat.adminRights?.deleteMessages ?? false,
				inviteUsers: chat.adminRights?.inviteUsers ?? false,
				manageCall: chat.adminRights?.manageCall ?? false,
				pinMessages: chat.adminRights?.pinMessages ?? false,
				postMessages: chat.adminRights?.postMessages ?? false,
				other: chat.adminRights?.other ?? false
			}),
			rank
		})
	)
}

export const demote = async (
	user: Api.User,
	chat: Api.Channel,
	client: TelegramClient
) => {
	await client.invoke(
		new Api.channels.EditAdmin({
			channel: chat.id,
			userId: user,
			adminRights: new Api.ChatAdminRights({
				addAdmins: false,
				anonymous: false,
				banUsers: false,
				changeInfo: false,
				deleteMessages: false,
				editMessages: false,
				inviteUsers: false,
				manageCall: false,
				pinMessages: false,
				postMessages: false,
				other: false
			}),
			rank: ''
		})
	)
}

export const banUser = async (
	user: Api.User,
	chat: Api.TypeEntityLike,
	client: TelegramClient
) => {
	if (chat instanceof Api.Channel) {
		if (chat.gigagroup || chat.megagroup) {
			return await client.invoke(
				new Api.channels.EditBanned({
					channel: chat,
					participant: user,
					bannedRights: new Api.ChatBannedRights({
						untilDate: 0,
						viewMessages: true,
						sendMessages: true,
						sendMedia: true,
						sendStickers: true,
						sendGifs: true,
						sendGames: true,
						sendInline: true,
						embedLinks: true
					})
				})
			)
		}

		console.log(chat.id)

		return await client.invoke(
			new Api.messages.DeleteChatUser({
				chatId: chat.id,
				userId: user.id
			})
		)
	}
}
