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
			await event.message.edit({
				text: event.message.text + '\n' + 'Invalid user ID or username.'
			})
			return
		}
		entity = _entity
		if (getRank && args[1]) {
			rank = args[1]
		}
	} else {
		return
	}
	return {
		entity,
		rank: rank
	}
}

export const ExpectedErrors: { [key: string]: string } = {
	// Edit Admin Rights
	ADMINS_TOO_MUCH: 'There are too many admins.',
	ADMIN_RANK_EMOJI_NOT_ALLOWED: 'The admin title cannot contain emojis.',
	ADMIN_RANK_INVALID: 'The specified admin title is invalid.',
	BOTS_TOO_MUCH: 'There are too many bots.',
	BOT_CHANNELS_NA: 'Bots cannot edit admin privileges.',
	BOT_GROUPS_BLOCKED: 'This bot cannot be added to groups.',
	CHANNEL_INVALID: 'The provided channel is invalid.',
	CHANNEL_PRIVATE: 'You have not joined this chat.',
	CHAT_ADMIN_INVITE_REQUIRED: 'You do not have the rights to do this.',
	CHAT_ADMIN_REQUIRED: 'You must be an admin to do this.',
	CHAT_WRITE_FORBIDDEN: 'You cannot write in this chat.',
	FRESH_CHANGE_ADMINS_FORBIDDEN: 'You cannot add or modify other admins yet.',
	INPUT_USER_DEACTIVATED: 'The specified user was deleted.',
	PEER_ID_INVALID: 'The provided ID is invalid.',
	RIGHT_FORBIDDEN: 'Your rights do not allow you to do this.',
	USERS_TOO_MUCH: 'The maximum number of users has been exceeded.',
	USER_BLOCKED: 'User blocked.',
	USER_CHANNELS_TOO_MUCH:
		'One of the users you tried to add is in too many chats.',
	USER_CREATOR: 'You cannot leave this channel, because you are its creator.',
	USER_ID_INVALID: 'The provided user ID is invalid.',
	USER_NOT_MUTUAL_CONTACT: 'The provided user is not a mutual contact.',
	USER_PRIVACY_RESTRICTED:
		'The user’s privacy settings do not allow you to do this.',
	USER_RESTRICTED: 'You’re restricted, you cannot create channels or chats.',
	// PIN
	CHAT_NOT_MODIFIED: 'The pinned message was not modified.',
	MESSAGE_ID_INVALID: 'Message ID invalid.',
	PIN_RESTRICTED: 'You canot pin messages.',
	USER_BANNED_IN_CHANNEL:
		'You are banned from sending messages in supergroups/channels.'
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
				text: event.message.text + '\n' + ExpectedErrors[error['errorMessage']]
			})
			return
		} else {
			throw error
		}
	}
}
