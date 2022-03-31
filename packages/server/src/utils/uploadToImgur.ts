const fs = require('fs');
const { ImgurClient } = require('imgur');

export function uploadToImgur(
  path: string,
  mediaType: string,
  notRepeat?: boolean
): Promise<string> {
  const client = new ImgurClient({ clientId: '3246fe4bdf4e7ef' });
  return new Promise((resolve) => {
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
    const request = client.upload({
      image: fs.createReadStream(path),
      title: '',
      description: '',
      type: 'stream',
    });
    request.then((data: any) => {
      (async () => {
        if (!data.data.link && !notRepeat) {
          console.log('Retrying upload in 1m');
          // eslint-disable-next-line promise/param-names
          await new Promise((resolve1) => setTimeout(resolve1, 60000));
          resolve(uploadToImgur(path, mediaType, true));
        }
        console.log('Uploaded to Imgur: ', data.data.link);
        resolve(data.data.link);
      })();
    });
  });
}

module.exports = { uploadToImgur };
