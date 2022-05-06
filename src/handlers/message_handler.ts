import { Handler, IHandler } from './handler'

export type MessageHandlerFunc<T extends object> = ({
	client,
	event,
	...rest
}: T & IHandler) => Promise<void>

export class MessageHandler<T extends object> extends Handler {
	out?: boolean
	scope?: 'all' | 'group' | 'private' | 'channel'
	allowForward?: boolean

	constructor(public func: MessageHandlerFunc<T>) {
		super()
	}

	async check({ event }: IHandler) {
		if (this.out !== undefined && this.out !== event.message.out) {
			return false
		}
		if (!event.message.out) {
			return false
		}
		if (this.allowForward != false && event.message.forward !== undefined) {
			return false
		}
		if (this.scope !== undefined && this.scope !== 'all') {
			if (this.scope == 'group' && !event.isGroup) {
				return false
			} else if (this.scope == 'private' && !event.isPrivate) {
				return false
			} else if (!event.isChannel) {
				return false
			}
		}
		return true
	}

	handle({ client, event, ...rest }: IHandler & T) {
		return this.func({ client, event, ...(rest as T) })
	}
}
