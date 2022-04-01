ARCHIVE_NAME=archive.tgz
// https://gist.github.com/lukechilds/a83e1d7127b78fef38c2914c4ececc3c
LATEST_TAG=$(wget -qO- https://api.github.com/repos/xorgram/xor/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

wget https://github.com/xorgram/xor/releases/download/$LATEST_TAG/$ARCHIVE_NAME -O $ARCHIVE_NAME
tar xf $ARCHIVE_NAME
rm $ARCHIVE_NAME
rm -rf dist
mv package/* .
rmdir package

npm i --production --ignore-scripts
npm start
