const Jimp = require('jimp');

export async function addWatermark(image_url: string, username: string) {
  if (username === undefined) return;
  const image = await Jimp.read(image_url);

  return Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then((font: any) =>
    (async () => {
      image.resize(1280, Jimp.AUTO);

      const watermark = await Jimp.read(
        `${__dirname}/../../../assets/images/watermark.png`
      );
      const watermarkBackground = await Jimp.read(
        `${__dirname}/../../../assets/images/watermark_background.png`
      );

      const watermarkWidth = 500;
      const imageWidth = image.getWidth();
      const imageHeight = image.getHeight();

      const finalWidth =
        watermarkWidth * ((watermarkWidth * 100) / imageWidth) * 0.02;
      watermark.resize(finalWidth, Jimp.AUTO);
      const finalHeight = watermark.getHeight();

      image.blit(watermark, 10, imageHeight - finalHeight - 10);

      if (username.length > 15) {
        watermarkBackground.resize((username.length - 15) * 14, finalHeight);
        image.blit(
          watermarkBackground,
          watermark.getWidth() + 10,
          imageHeight - finalHeight - 10
        );
      }

      image.print(font, 105, image.getHeight() - 48, username);

      const buff = await image.getBase64Async(Jimp.MIME_PNG);
      return buff;
    })()
  );
}

module.exports = {
  addWatermark,
};
