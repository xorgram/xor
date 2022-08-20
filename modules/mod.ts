import admin from "./admin/mod.ts";
import files from "./files/mod.ts";
import util from "./util/mod.ts";
import security from "./security/mod.ts";

const modules = [security, admin, files, util];

export default modules;
