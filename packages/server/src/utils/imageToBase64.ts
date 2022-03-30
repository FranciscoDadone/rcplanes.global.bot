const Jimp = require('jimp');

export async function imageToBase64(imageUrl: string): Promise<string> {
  const image = await Jimp.read(imageUrl);
  const buff = await image.getBase64Async(Jimp.MIME_PNG);
  return buff;
}
