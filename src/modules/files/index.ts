import { Api } from 'telegram'
import fs from 'fs/promises'
import { join } from 'path'
import { CommandHandler } from '../../handlers'
import { Module } from '../../module'
import { parseAttributes, getRandomString } from './helpers'

const files: Module = {
	name: 'files',
	handlers: [
		new CommandHandler(
			'download',
			async (client, event) => {
				const reply = await event.message.getReplyMessage()
				if (!reply) {
					return
				}
				const { media } = reply
				if (!media) {
					await event.message.edit({
						text: event.message.text + '\nNo media found on the replied message'
					})
					return
				}
				let filename = ''
				if (media instanceof Api.MessageMediaPhoto) {
					filename = 'photo_' + getRandomString() + '.png'
				}
				if (
					media instanceof Api.MessageMediaDocument &&
					!(media instanceof Api.MessageMediaEmpty) &&
					media.document &&
					!(media.document instanceof Api.DocumentEmpty)
				) {
					const { attrFilename } = parseAttributes(media.document.attributes)
					if (attrFilename) {
						filename = attrFilename.fileName
					} else {
						const mime = media.document.mimeType
						if (mime.includes('video')) {
							filename = 'video_' + getRandomString() + mime.split('/')[1]
						}
						if (mime.includes('audio')) {
							filename = 'audio' + getRandomString() + mime.split('/')[1]
						}
					}
				}
				const mediaBuffer = await client.downloadMedia(media, {})
				const spec = join('downloads', filename)
				await fs.mkdir(join('downloads'), { recursive: true })
				await fs.writeFile(spec, mediaBuffer)
				await event.message.edit({
					text:
						event.message.text +
						'\nDownloaded to <code>/downloads/' +
						filename +
						'</code>',
					parseMode: 'html'
				})
			},
			{ aliases: ['dl'] }
		)
	]
}

export default files
