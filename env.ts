import {
  cleanEnv,
  config,
  getLevelByName,
  log,
  makeValidator,
  num,
  str,
} from "./deps.ts";

await config({ export: true });

// https://stackoverflow.com/a/54256858/12250600
const PREFIX_REGEX = /^[^\p{L}\d\s@#\$]$/u;

const cmdPrefix = makeValidator((input) => {
  console.log(input, PREFIX_REGEX.test(input));
  if (PREFIX_REGEX.test(input)) {
    return input;
  }
  log.warning(
    "Falling back to '\\' for COMMAND_PREFIX, a single symbol excluding @, #, $ was expected",
  );
  Deno.exit();
  return "\\";
});

const inputPrefix = makeValidator((input) => {
  if (PREFIX_REGEX.test(input) && input !== Deno.env.get("COMMAND_PREFIX")) {
    return input;
  }
  log.warning(
    "Falling back to '>' for INPUT_PREFIX, a single symbol excluding @, #, $ and COMMAND_PREFIX was expected",
  );
  return "\\";
});

export default cleanEnv(Deno.env.toObject(), {
  STRING_SESSION: str(),
  APP_ID: num(),
  APP_HASH: str(),
  COMMAND_PREFIX: cmdPrefix({ default: "\\" }),
  INPUT_PREFIX: inputPrefix({ default: ">" }),
  // deno-lint-ignore no-explicit-any
  LOG_LEVEL: makeValidator((input) => getLevelByName(input as any))(),
});
