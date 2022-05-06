ARCHIVE_NAME=archive.tgz

wget https://github.com/xorgram/xor/releases/latest/download/$ARCHIVE_NAME -O $ARCHIVE_NAME
tar xf $ARCHIVE_NAME
rm $ARCHIVE_NAME
rm -rf dist
mv package/* .
rmdir package

npm i --production --ignore-scripts
npm start
