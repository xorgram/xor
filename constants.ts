import xor from "./deno.json" with { type: "json" };

const versionMatch = /@([\d.]+)\//.exec(xor.imports.$mtkruto);

export const version = "0.3.5";
export const mtkrutoVersion: string = versionMatch ? versionMatch[1] : "latest";
