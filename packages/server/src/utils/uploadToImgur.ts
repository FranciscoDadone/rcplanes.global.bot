const fs = require('fs');
const { ImgurClient } = require('imgur');

export function uploadToImgur(path: string, mediaType: string) {
  const client = new ImgurClient({ clientId: '3246fe4bdf4e7ef' });
  if (mediaType === 'IMAGE') {
    return client
      .upload({
        image: path.split('data:image/png;base64')[1],
        title: '',
        description: '',
        type: 'base64',
      })
      .then((data: any) => data.data.link);
  }
  return client
    .upload({
      image: fs.createReadStream(path),
      title: '',
      description: '',
      type: 'stream',
    })
    .then((data: any) => data.data.link);
}

module.exports = { uploadToImgur };
