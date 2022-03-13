import { Api } from 'telegram'
import { randomBytes } from 'crypto'

type Null<T> = T | null

export const parseAttributes = (attrs: Api.TypeDocumentAttribute[]) => {
	let attrAnimated: Null<Api.DocumentAttributeAnimated> = null
	let attrAudio: Null<Api.DocumentAttributeAudio> = null
	let attrFilename: Null<Api.DocumentAttributeFilename> = null
	let attrHasStickers: Null<Api.DocumentAttributeHasStickers> = null
	let attrImageSize: Null<Api.DocumentAttributeImageSize> = null
	let attrSticker: Null<Api.DocumentAttributeSticker> = null
	let attrVideo: Null<Api.DocumentAttributeVideo> = null
	for (const attr of attrs) {
		if (attr instanceof Api.DocumentAttributeAnimated) {
			attrAnimated = attr
			continue
		}
		if (attr instanceof Api.DocumentAttributeAudio) {
			attrAudio = attr
			continue
		}
		if (attr instanceof Api.DocumentAttributeFilename) {
			attrFilename = attr
			continue
		}
		if (attr instanceof Api.DocumentAttributeHasStickers) {
			attrHasStickers = attr
			continue
		}
		if (attr instanceof Api.DocumentAttributeImageSize) {
			attrImageSize = attr
			continue
		}
		if (attr instanceof Api.DocumentAttributeSticker) {
			attrSticker = attr
			continue
		}
		if (attr instanceof Api.DocumentAttributeVideo) {
			attrVideo = attr
			continue
		}
	}
	return {
		attrAnimated,
		attrAudio,
		attrFilename,
		attrHasStickers,
		attrImageSize,
		attrSticker,
		attrVideo
	}
}

export const getRandomString = (bytes = 4) => randomBytes(bytes).toString('hex')
