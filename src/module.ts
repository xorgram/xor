import { Handler } from './handlers'

export interface Module {
	name: string
	handlers: Handler[]
	help?: string
}

export function isModule(value: unknown): value is Module {
	const obj = Object(value)
	return (
		typeof obj.name === 'string' &&
		Array.isArray(obj.handlers) &&
		obj.handlers.filter((handler: unknown) => handler instanceof Handler)
			.length != undefined
	)
}
