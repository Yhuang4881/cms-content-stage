var path = require('path');
var fs = require('fs');
var sharp = require('sharp');

(async () => {
  const imageFolder = path.join(__dirname, './content/resources/images')
  const blurFolder = path.join(__dirname, './content/resources/blur')
  const webpFolder = path.join(__dirname, './content/resources/webp-1920')
  const resultFolders = [{folder: blurFolder, extension: 'jpg'}, {folder: webpFolder, extension: 'webp'}]
  const deletePromises = resultFolders.map(({folder: resultFolder, extension}) => (async () => {
    if (!fs.existsSync(resultFolder)) {
      fs.mkdirSync(resultFolder);
    }
    else {
      const images = await fs.promises.readdir(imageFolder)
      const leftImages = images.map(filename => {
        const [, timestamp, outputFilename] = filename.match(/(\d+)-\d+-\d+-(.+)/)
        return `${timestamp}-${outputFilename}.${extension}`
      })
      const resultImages = await fs.promises.readdir(resultFolder)
      const deletedImages = resultImages.filter(resultImage => !leftImages.includes(resultImage))
      deletedImages.forEach(deletedImage => {
        console.log('delete ' + deletedImage)
        fs.promises.rm(path.join(resultFolder, deletedImage))
      })
    }
  })())
  await Promise.all(deletePromises)
  const images = await fs.promises.readdir(imageFolder)
  images.forEach(filename => {
    try {
      const [, timestamp, outputFilename] = filename.match(/(\d+)-\d+-\d+-(.+)/)
      const blurFilePath = path.join(blurFolder, `${timestamp}-${outputFilename}`) + '.jpg'
      const webpFilePath = path.join(webpFolder, `${timestamp}-${outputFilename}`) + '.webp'
      const instance = sharp(path.join(imageFolder, filename))
      if (!fs.existsSync(blurFilePath)) {
        console.log('create ' + blurFilePath)
        instance.clone()
          .resize(10, 10, {
            fit: sharp.fit.inside,
            withoutEnlargement: true
          })
          .jpeg({
            quality: 10,
          })
          .toFile(blurFilePath, function (err) {
            if (err) console.error(err)
          });
      }
      if (!fs.existsSync(webpFilePath)) {
        console.log('create ' + webpFilePath)
        instance.clone()
          .webp({ effort: 4 })
          .resize({ width: 1920 })
          .toFile(webpFilePath, function (err) {
            if (err) console.error(err)
          });
      }
    }
    catch (e) {
      console.error(e)
    }
  })
})()