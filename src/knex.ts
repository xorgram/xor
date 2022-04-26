import { knex as _knex, Knex } from 'knex'
import env from './env'

let instance: Knex | undefined
export default function knex() {
	if (!env.DATABASE_URI) {
		throw new Error('DATABASE_URI variable not found')
	}
	if (instance === undefined) {
		instance = _knex({
			client: 'pg',
			connection: env.DATABASE_URI
		})
	}
	return instance
}
