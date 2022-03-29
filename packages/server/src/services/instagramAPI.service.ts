import axios from 'axios';
import { getCredentials, setCredentials } from '../database/DatabaseQueries';

async function checkIgAuth(sessionid: string): Promise<any> {
  const res = axios.get(
    `${process.env.BASE_URL}/auth/settings/get?sessionid=${sessionid}`
  );
  return res.catch((err) => {
    if (err) return false;
    return true;
  });
}

/**
 * Returns the sessionid
 */
const formUrlEncoded = (x) =>
  Object.keys(x).reduce((p, c) => `${p}&${c}=${encodeURIComponent(x[c])}`, '');
export async function igLogin(): Promise<boolean> {
  const credentials = await getCredentials();
  const isAuth = await checkIgAuth(credentials.lastSessionId);
  if (!isAuth) {
    try {
      return await axios
        .post(
          `${process.env.BASE_URL}/auth/login`,
          new URLSearchParams({
            username: credentials.username,
            password: credentials.password,
          })
        )
        .then((res) => {
          if (res.data) {
            setCredentials(
              credentials.username,
              credentials.password,
              res.data
            );
          }
          return true;
        });
    } catch (ex) {
      return false;
    }
  }
  console.log('Already logged in!');
  return true;
}

/**
 * Publish a post passed by param.
 * Make sure to edit the caption and url(image)
 */
export function publish(url: string, mediaType: string, caption: string) {
  // return createMediaObject(mediaType, caption, url);
}

export async function getRecentPosts(hashtag?: string) {
  return null;
}

export async function getTopPosts(hashtag: string) {
  // return getPosts(hashtag, 'top_media');
}

module.exports = {
  igLogin,
  checkIgAuth,
  publish,
  getRecentPosts,
  getTopPosts,
};
function data(
  URL: {
    new (url: string | URL, base?: string | URL | undefined): URL;
    prototype: URL;
    createObjectURL(obj: Blob | MediaSource): string;
    revokeObjectURL(url: string): void;
  },
  arg1: string,
  Headers: {
    new (init?: HeadersInit | undefined): Headers;
    prototype: Headers;
  },
  arg3: { 'Content-Type': string },
  data: any,
  arg5: string
) {
  throw new Error('Function not implemented.');
}
