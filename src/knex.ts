import { knex as _knex, Knex } from 'knex'
import env from './env'

export default class SingletonKnex {
	private static instance: Knex
	private constructor() {
		//
	}
	public static getInstance(): Knex {
		if (!env.DATABASE_URI) {
			throw new Error('DATABASE_URI variable not found')
		}
		if (!SingletonKnex.instance) {
			SingletonKnex.instance = _knex({
				client: 'pg',
				connection: env.DATABASE_URI
			})
		}
		return SingletonKnex.instance
	}
}
