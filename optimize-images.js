var path = require('path');
var fs = require('fs');
var sharp = require('sharp');

(async () => {
  const imageFolder = path.join(__dirname, './content/resources/images')
  if (!fs.existsSync(imageFolder)) return //TODO: remove all images
  const blurFolder = path.join(__dirname, './content/resources/blur')
  const webp280Folder = path.join(__dirname, './content/resources/webp-280')
  const webp1920Folder = path.join(__dirname, './content/resources/webp-1920')
  const resultFolders = [
    { folder: blurFolder, extension: 'jpg' },
    { folder: webp280Folder, extension: 'webp' },
    { folder: webp1920Folder, extension: 'webp' },
  ]
  const deletePromises = resultFolders.map(({ folder: resultFolder, extension }) => (async () => {
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
  images.forEach(async filename => {
    try {
      const [, timestamp, outputFilename] = filename.match(/(\d+)-\d+-\d+-(.+)/)
      const blurFilePath = path.join(blurFolder, `${timestamp}-${outputFilename}`) + '.jpg'
      const webp280FilePath = path.join(webp280Folder, `${timestamp}-${outputFilename}`) + '.webp'
      const webp1920FilePath = path.join(webp1920Folder, `${timestamp}-${outputFilename}`) + '.webp'
      const instance = sharp(path.join(imageFolder, filename), { animated: true })
      const metadata = await instance.metadata()
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
      if (!fs.existsSync(webp280FilePath)) {
        console.log('create ' + webp280FilePath)
        instance.clone()
          .webp({ effort: 6 })
          .resize({ width: (metadata.width > 280)? 280 : metadata.width })
          .toFile(webp280FilePath, function (err) {
            if (err) console.error(err)
          });
      }
      if (!fs.existsSync(webp1920FilePath)) {
        console.log('create ' + webp1920FilePath)
        instance.clone()
          .webp({ effort: 6 })
          .resize({ width: (metadata.width > 1920)? 1920 : metadata.width })
          .toFile(webp1920FilePath, function (err) {
            if (err) console.error(err)
          });
      }
    }
    catch (e) {
      console.error(e)
    }
  })
})()