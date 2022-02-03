import { TelegramClient, Api } from 'telegram'
import { Entity } from 'telegram/define'

import escape from 'html-escape'

const kv = (k: string, v: unknown) => `${k}: ${String(v)}\n`

export async function whois(
	entity: Entity,
	client: TelegramClient,
	escape_ = true
) {
	let whois = ''
	if (entity instanceof Api.Chat) {
		const { fullChat } = await client.invoke(
			new Api.messages.GetFullChat({ chatId: entity.id })
		)
		whois += kv('ID', entity.id)
		whois += kv(
			'DC',
			entity.photo instanceof Api.ChatPhoto ? entity.photo.dcId : 'N/A'
		)
		whois += kv('Name', entity.title)
		whois += kv('Membership', entity.left ? 'Not member' : 'Member')
		whois += '\n' + fullChat.about ?? ''
	} else if (entity instanceof Api.Channel) {
		const { fullChat } = await client.invoke(
			new Api.channels.GetFullChannel({ channel: entity.id })
		)
		whois += kv('ID', entity.id)
		whois += kv(
			'DC',
			entity.photo instanceof Api.ChatPhoto ? entity.photo.dcId : 'N/A'
		)
		whois += kv('Name', entity.title)
		whois += kv('Username', entity.username)
		whois += kv('Membership', entity.left ? 'Not member' : 'Member')
		whois == '\n' + fullChat.about ?? ''
	} else if (entity instanceof Api.User) {
		const { fullUser } = await client.invoke(
			new Api.users.GetFullUser({ id: entity.id })
		)
		whois += kv('ID', entity.id)
		whois += kv(
			'DC',
			entity.photo instanceof Api.UserProfilePhoto ? entity.photo.dcId : 'N/A'
		)
		whois += kv('Name', entity.firstName + ' ' + (entity.lastName ?? ''))
		whois += kv('Username', entity.username)
		whois += '\n' + fullUser.about
	} else {
		whois += 'Could not resolve whois'
	}
	if (escape_) {
		whois = escape(whois)
	}
	return whois
}

export const pre = (string: string) => '<pre>' + escape(string) + '</pre>'
