var path = require('path');
var fs = require('fs');
var sharp = require('sharp');

(async () => {
  const imageFolderPath = path.join(__dirname, './content/resources/images')
  const blurFolderPath = path.join(imageFolderPath, 'blur')
  if (!fs.existsSync(blurFolderPath)) fs.mkdirSync(blurFolderPath);
  let images = await fs.promises.readdir(imageFolderPath)
  images = images.filter(image => image !== 'blur')
  images.forEach(filename => {
    const blurFilePath = path.join(blurFolderPath, filename)
    if (fs.existsSync(blurFilePath)) return;
    sharp(path.join(imageFolderPath, filename))
      .resize({ width: 10 })
      .toFile(blurFilePath, function (err) {
        if (err) throw err;
      });
  })
})()