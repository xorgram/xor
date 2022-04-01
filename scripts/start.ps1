$ARCHIVE_NAME="archive.tgz"
$LATEST_TAG=$(Invoke-RestMethod -Uri "https://api.github.com/repos/xorgram/xor/releases/latest").tag_name

Invoke-WebRequest -Uri "https://github.com/xorgram/xor/releases/download/$LATEST_TAG/$ARCHIVE_NAME" -OutFile $ARCHIVE_NAME
tar xf $ARCHIVE_NAME
Remove-Item $ARCHIVE_NAME
Copy-Item -Path "./package/*" -Destination "./" -Recurse -Force
Remove-Item "package" -Recurse -Force

npm i --production --ignore-scripts
npm start