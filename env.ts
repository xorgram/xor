import { cleanEnv, config, makeValidator, num, str } from "./deps.ts";

await config({ export: true });

// https://stackoverflow.com/a/54256858/12250600
const PREFIX_REGEX = /^[^\p{L}\d\s@#\$]$/u;

const cmdPrefix = makeValidator((input) => {
  if (PREFIX_REGEX.test(input)) {
    return input;
  }
  console.warn(
    "COMMAND_PREFIX falling back to '\\', single symbol expected excluding @,#,$",
  );
  return "\\";
});

const inputPrefix = makeValidator((input) => {
  if (
    PREFIX_REGEX.test(input) &&
    input !== Deno.env.toObject().COMMAND_PREFIX
  ) {
    return input;
  }
  console.warn(
    "INPUT_PREFIX falling back to '>', single symbol expected excluding @,#,$ & COMMAND_PREFIX",
  );
  return "\\";
});

export default cleanEnv(Deno.env.toObject(), {
  STRING_SESSION: str(),
  APP_ID: num(),
  APP_HASH: str(),
  COMMAND_PREFIX: cmdPrefix({ default: "\\" }),
  INPUT_PREFIX: inputPrefix({ default: ">" }),
});
