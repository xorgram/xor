import { Api, TelegramClient } from 'telegram'

export const isAdmin = async (
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
