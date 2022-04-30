import env from './env'
import { knex as _knex, Knex } from 'knex'

let instance: Knex | undefined

export const connectable = !!env.DATABASE_URI

export default function db() {
	if (!connectable) {
		throw new Error('DATABASE_URI variable not found')
	}
	if (!instance) {
		instance = _knex({
			client: 'pg',
			connection: env.DATABASE_URI
		})
	}
	return instance
}
