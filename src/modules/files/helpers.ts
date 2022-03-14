import { Api } from 'telegram'

type Nullable<T> = T | null

export const parseAttributes = (attrs: Api.TypeDocumentAttribute[]) => {
	let attrAnimated: Nullable<Api.DocumentAttributeAnimated> = null
	let attrAudio: Nullable<Api.DocumentAttributeAudio> = null
	let attrFilename: Nullable<Api.DocumentAttributeFilename> = null
	let attrHasStickers: Nullable<Api.DocumentAttributeHasStickers> = null
	let attrImageSize: Nullable<Api.DocumentAttributeImageSize> = null
	let attrSticker: Nullable<Api.DocumentAttributeSticker> = null
	let attrVideo: Nullable<Api.DocumentAttributeVideo> = null
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
