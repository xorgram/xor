import { Api, TelegramClient } from 'telegram'
import { NewMessageEvent } from 'telegram/events'
import { RPCError } from 'telegram/errors'

export const getUser = async (
	event: NewMessageEvent,
	client: TelegramClient,
	args: string[],
	getRank = false
) => {
	let entity = {} as Api.User
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

export const ExpectedErrors: { [key: string]: string } = {
	// Edit Admin Rights
	ADMINS_TOO_MUCH: 'There are too many admins.',
	ADMIN_RANK_EMOJI_NOT_ALLOWED: 'An admin rank cannot contain emojis.',
	ADMIN_RANK_INVALID: 'The specified admin rank is invalid.',
	BOTS_TOO_MUCH: 'There are too many bots in this chat/channel.',
	BOT_CHANNELS_NA: "Bots can't edit admin privileges.",
	BOT_GROUPS_BLOCKED: "This bot can't be added to groups.",
	CHANNEL_INVALID: 'The provided channel is invalid.',
	CHANNEL_PRIVATE: "You haven't joined this channel/supergroup.",
	CHAT_ADMIN_INVITE_REQUIRED: 'You do not have the rights to do this.',
	CHAT_ADMIN_REQUIRED: 'You must be an admin in this chat to do this.',
	CHAT_WRITE_FORBIDDEN: "You can't write in this chat.",
	FRESH_CHANGE_ADMINS_FORBIDDEN:
		"You were just elected admin, you can't add or modify other admins yet.",
	INPUT_USER_DEACTIVATED: 'The specified user was deleted.',
	PEER_ID_INVALID: 'The provided peer id is invalid.',
	RIGHT_FORBIDDEN: 'Your admin rights do not allow you to do this.',
	USERS_TOO_MUCH:
		'The maximum number of users has been exceeded (to create a chat, for example).',
	USER_BLOCKED: 'User blocked.',
	USER_CHANNELS_TOO_MUCH:
		'One of the users you tried to add is already in too many channels/supergroups.',
	USER_CREATOR: "You can't leave this channel, because you're its creator.",
	USER_ID_INVALID: 'The provided user ID is invalid.',
	USER_NOT_MUTUAL_CONTACT: 'The provided user is not a mutual contact.',
	USER_PRIVACY_RESTRICTED:
		"The user's privacy settings do not allow you to do this.",
	USER_RESTRICTED: "You're spamreported, you can't create channels or chats.",
	// PIN
	CHAT_NOT_MODIFIED: "The pinned message wasn't modified.",
	MESSAGE_ID_INVALID: 'MESSAGE_ID_INVALID',
	PIN_RESTRICTED: "You can't pin messages.",
	USER_BANNED_IN_CHANNEL:
		"You're banned from sending messages in supergroups/channels."
}

export async function wrapRpcErrors(
	event: NewMessageEvent,
	func: () => Promise<void> | void
) {
	try {
		await func()
	} catch (error) {
		if (error instanceof RPCError && ExpectedErrors[error['errorMessage']]) {
			await event.message.edit({
				text: ExpectedErrors[error['errorMessage']]
			})
			return
		} else {
			throw error
		}
	}
}
