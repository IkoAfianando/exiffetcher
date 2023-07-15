const express = require('express');
const crypto = require('crypto');
const { spawnSync } = require("child_process");
var process = require('process');
const { ExifImage } = require('exif');
const { promisify } = require('util');
const fs = require('fs');

const exifImagePromise = promisify(ExifImage);

const allowedProtocols = ['http', 'https'];
const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.render('index');
});

app.post('/', async (req, res) => {
  const imageUrl = req.body.url;
  // console.log(imageUrl)
  if (imageUrl === null || imageUrl.length === 0) {
    return res.redirect('/iko');
  }

  var tmpFilePath = '';
  const tokens = imageUrl.split('://');
  // console.log(tokens)
  if (tokens.length == 2) {
    const fileType = imageUrl.split('.').pop();
    // console.log(fileType)
    if (allowedProtocols.find(protocol => tokens[0].match(protocol))) {
      console.log("Masuk ke protocol yang diperbolehkan")
      if (allowedExtensions.find(extension => fileType.match(extension))) {
        console.log("Masuk ke extension yang diperbolehkan")
        if (!fs.existsSync('/tmp/' + fileType)) {
          fs.mkdirSync('/tmp/' + fileType);
        }
        console.log("Iko Afianando Masuk sini")
        tmpFilePath = fileType + '/' + crypto.createHash('sha256').update(imageUrl).digest('hex');
        console.log(tmpFilePath)
      }
    }
  }
  console.log(tmpFilePath, "Iko Afianando")

  if (tmpFilePath != '') {
    try {
      process.chdir('/tmp/');
      spawnSync("curl", [
        imageUrl,
        '-o',
        tmpFilePath,
        '--max-filesize',
        '3000000',
        '--connect-timeout',
        '10'
      ]);
      // Baca konten file flag.txt
      const flagContent = fs.readFileSync(__dirname + '/flag.txt', 'utf-8');
      console.log(flagContent)
      const exifData = await exifImagePromise({ image : tmpFilePath });
      console.log(exifData)
      return res.render('index', {'exifData': exifData, 'flagContent': flagContent});
    } catch (error) {
      //

    }
  }
  return res.render('index', {'error': 'Cannot retrieve Exif data'});
});

app.listen(1337, () => {
  console.log('Server is running on port 1337');
});
