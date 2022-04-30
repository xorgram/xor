import { Knex, knex as _knex } from 'knex'

import env from './env'

let instance: Knex | undefined

export const connectable = !!env.DATABASE_URI

export default function db() {
	if (!connectable) {
		throw new Error('Cannot connect to the database')
	}
	if (!instance) {
		instance = _knex({
			client: 'pg',
			connection: env.DATABASE_URI
		})
	}
	return instance
}
