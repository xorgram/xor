$ARCHIVE_NAME = "archive.tgz"

Invoke-WebRequest -Uri "https://github.com/xorgram/xor/releases/download/latest/$ARCHIVE_NAME" -OutFile $ARCHIVE_NAME
tar xf $ARCHIVE_NAME
Remove-Item $ARCHIVE_NAME
if (Test-Path "dist") {
  Remove-Item -LiteralPath "dist" -Force -Recurse
}
Copy-Item -Path "./package/*" -Destination "./" -Recurse -Force
Remove-Item "package" -Recurse -Force

npm i --production --ignore-scripts
npm start