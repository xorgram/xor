import { knex as _knex, Knex } from 'knex'
import env from './env'

class SingletonKnex {
	private static instance: Knex
	private constructor() {
		//
	}
	public static getInstance(): Knex {
		if (!env.DATABASE_URI) {
			return <Knex>{}
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

export default SingletonKnex.getInstance()
