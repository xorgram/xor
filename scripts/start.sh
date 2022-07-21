BASE_URL=https://raw.githubusercontent.com/xorgram/xor/$(deno eval "console.log((await (await fetch(\"https://api.github.com/repos/xorgram/xor/tags\")).json())[0].name)")
deno run --allow-env --allow-net --allow-read --allow-run --allow-write --import-map=$BASE_URL/import_map.json -r $BASE_URL/main.ts
