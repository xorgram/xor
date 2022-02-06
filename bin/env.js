const { config } = require('dotenv')
const { cleanEnv, num, str } = require('envalid')

config()

module.exports = cleanEnv(process.env, {
	STRING_SESSION: str(),
	APP_ID: num(),
	APP_HASH: str()
})
