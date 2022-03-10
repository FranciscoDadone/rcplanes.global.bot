import { getCredentials } from '../database/DatabaseQueries';

const { URLSearchParams } = require('url');
const fetch = require('node-fetch');

async function checkStatus(id: string) {
  const credentials: any = await getCredentials();
  return fetch(
    `https://graph.facebook.com/v13.0/${id}?fields=status_code&access_token=${credentials.access_token}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  ).then((res: any) => res.json().then((data: any) => data.status_code));
}

async function publishMedia(id: string) {
  const credentials: any = await getCredentials();
  const res = await fetch(
    `https://graph.facebook.com/v13.0/${
      credentials.ig_account_id
    }/media_publish?${new URLSearchParams({
      creation_id: id,
      access_token: credentials.access_token,
    })}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }
  );
  return res.json().then((data: { id: string }) => {
    console.log(`Media published! ${data.id}`);
    return data.id;
  });
}
async function createMediaObject(
  media_type: string,
  caption: string,
  url: string
) {
  const credentials: any = await getCredentials();
  if (media_type === 'IMAGE') {
    console.log('Creating media object... (IMAGE)');
    const res = await fetch(
      `https://graph.facebook.com/v12.0/${
        credentials.ig_account_id
      }/media?${new URLSearchParams({
        caption,
        access_token: credentials.access_token,
        image_url: url,
      })}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return res.json().then((data: any) => {
      console.log(`Media object ID: ${data.id}`);
      console.log(data);
      return publishMedia(data.id);
    });
  }
  console.log('Creating media object... (VIDEO)');
  const res = await fetch(
    `https://graph.facebook.com/v12.0/${
      credentials.ig_account_id
    }/media?${new URLSearchParams({
      caption,
      media_type: 'VIDEO',
      access_token: credentials.access_token,
      video_url: url,
    })}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
  return res.json().then((data: any) => {
    console.log(`Media object ID: ${data.id}`);
    function loopback() {
      return checkStatus(data.id).then((status) => {
        return (async () => {
          if (status !== 'FINISHED') {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            loopback();
          } else {
            return publishMedia(data.id);
          }
        })();
      });
    }
    return loopback();
  });
}

/**
 * Publish a post passed by param.
 * Make sure to edit the caption and url(image)
 */
export function publish(url: string, media_type: string, caption: string) {
  return createMediaObject(media_type, caption, url);
}

module.exports = { publish };
