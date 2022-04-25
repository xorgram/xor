import { config } from 'dotenv'
import { cleanEnv, num, str } from 'envalid'

config()

export default cleanEnv(process.env, {
	STRING_SESSION: str(),
	APP_ID: num(),
	APP_HASH: str(),
	DATABASE_URI: str({ default: '' })
})
