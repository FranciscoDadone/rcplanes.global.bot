import fs from 'fs';

const ffmpeg = require('fluent-ffmpeg');
const ffmpeginstaller = require('@ffmpeg-installer/ffmpeg');

const ffmpegPath = ffmpeginstaller.path;
/**
 * Trims a video and returns true if success
 * @param path video path
 * @param start start time in seconds
 * @param duration video duration in seconds
 */
export async function trimVideo(
  path: string,
  start: number,
  duration: number
): Promise<boolean> {
  ffmpeg.setFfmpegPath(ffmpegPath);

  const output = path.replace('.mp4', '.temp.mp4');

  return new Promise((resolve) => {
    ffmpeg(path)
      .setStartTime(start)
      .setDuration(duration)
      .output(output)
      .on('end', (err) => {
        if (!err) {
          try {
            fs.unlinkSync(path);
          } catch (_err) {
            console.log(_err);
          }
          fs.renameSync(output, path);
          return resolve(true);
        }
      })
      .on('error', (err1) => {
        console.log(err1);
        return resolve(false);
      })
      .run();
  });
}
