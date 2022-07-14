import { cleanEnv, config, num, str } from "$deps";

config({ export: true });

export default cleanEnv(Deno.env.toObject(), {
  STRING_SESSION: str(),
  APP_ID: num(),
  APP_HASH: str(),
});
