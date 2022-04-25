import { knex as Knex } from 'knex'
import env from './env'

export default Knex({
	client: 'pg',
	connection: env.DATABASE_URI
})
