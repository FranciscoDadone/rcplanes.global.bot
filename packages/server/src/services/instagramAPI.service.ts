import fetch from 'node-fetch';
import axios from 'axios';
import {
  getCredentials,
  getUtil,
  setCredentials,
  setUtil,
} from '../database/DatabaseQueries';
import { Post } from '../models/Post';
import { addWatermark } from '../utils/addWatermark';

const FormData = require('form-data');

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
 * Returns if logged in or not
 */
export async function igLogin(): Promise<boolean | string> {
  const credentials = await getCredentials();
  const isAuth = await checkIgAuth(credentials.sessionid);
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
              res.data,
              credentials.fbId,
              credentials.accessToken,
              credentials.clientSecret,
              credentials.clientId
            );
          }
          return true;
        });
    } catch (ex: any) {
      return ex.response.data.exc_type;
    }
  }
  console.log('Already logged in!');
  return true;
}

/**
 * Publish a post passed by param.
 * Returns permalink
 */
export async function publish(
  media: string,
  mediaType: string,
  caption: string,
  username: string
): Promise<string> {
  const { sessionid } = await getCredentials();
  const mediaPath = media;
  const formData = new FormData();
  let processedMedia = mediaPath;
  if (mediaType === 'IMAGE') {
    await addWatermark(media, username, true, 'storage/temp.jpg');
    processedMedia = 'storage/temp.jpg';
  }

  let userInfo;
  await axios
    .post(
      `${process.env.BASE_URL}/user/info_by_username`,
      new URLSearchParams({
        sessionid,
        username,
      })
    )
    .then((res) => {
      userInfo = res.data;
    })
    .catch((err) => {
      if (err) userInfo = { exc_type: 'UserNotFound' };
    });
  if (
    !userInfo.exc_type ||
    userInfo.exc_type !== 'UserNotFound' ||
    userInfo.pk !== undefined
  ) {
    axios
      .post(
        `${process.env.BASE_URL}/user/follow`,
        new URLSearchParams({
          sessionid,
          user_id: userInfo.pk,
        })
      )
      .catch((err) => {
        if (err) console.log(err);
      });

    formData.append(
      'usertags',
      JSON.stringify({
        user: userInfo,
        x: 0.5,
        y: 0.5,
      })
    );
  }

  const url = `http://backend-frontend:8080/${processedMedia}`;

  formData.append('sessionid', sessionid);
  formData.append('caption', caption);
  formData.append('url', url);

  let type = 'photo';
  if (mediaType === 'VIDEO') type = 'video';
  else if (mediaType === 'REEL') type = 'clip';
  return fetch(`${process.env.BASE_URL}/${type}/upload/by_url`, {
    method: 'POST',
    headers: formData.getHeaders(),
    body: formData,
  })
    .then((res) => res.json())
    .then((results) => {
      console.log('API RESULT (debugging): ', results);
      return `https://www.instagram.com/p/${results.code}`;
    })
    .catch((error) => {
      if (error) console.error(error);
    });
}

async function getHashtagId(hashtag: string) {
  const { accessToken, fbId } = await getCredentials();
  const hashtagIdRequest = axios.get(
    `https://graph.facebook.com/v12.0/ig_hashtag_search?q=${hashtag}&user_id=${fbId}&access_token=${accessToken}`
  );
  hashtagIdRequest.catch((err) => {
    if (err) console.log(err.response.data);
  });
  return (await hashtagIdRequest).data.data[0].id;
}

async function getUsername(post: { permalink: any }): Promise<string> {
  return new Promise((resolve) => {
    axios
      .get(`https://api.instagram.com/oembed/?url=${post.permalink}`)
      .then((data) => {
        if (data.status === 200) {
          return resolve(data.data.author_name);
        }
        return resolve('Unknown');
      })
      .catch((err) => {
        if (err) return resolve('Unknown');
      });
    setTimeout(() => {
      resolve('Unknown');
    }, 5000);
  });
}

export async function getPosts(
  hashtag: string,
  type: string
): Promise<Post[] | undefined> {
  const { accessToken, fbId, username } = await getCredentials();
  const hashtagId = await getHashtagId(hashtag);
  if (hashtagId === undefined) return [];

  const dataJSON = axios.get(
    `https://graph.facebook.com/v12.0/${hashtagId}/${type}?user_id=${fbId}&access_token=${accessToken}&fields=id,children{media_url,media_type},caption,media_type,media_url,permalink`
  );

  return dataJSON.then((data) => {
    const postsJSON = data.data.data;
    if (data.data.error) {
      return;
    }
    const postsCount =
      postsJSON === undefined ? 0 : Object.keys(postsJSON).length;
    console.log(
      `Got ${postsCount} posts (unfiltered) from Instagram API #${hashtag}`
    );
    let actualPost: Post;
    return (async () => {
      const postsToReturn: any[] = [];
      for (let i = 0; i < postsCount; i++) {
        const post = postsJSON[i];
        let fusername = 'Unknown';
        try {
          fusername = await getUsername(post);
        } catch (err) {
          console.log("Couldn't get the username! ");
        }
        if (fusername !== username) {
          if (post.media_type === 'CAROUSEL_ALBUM') {
            // eslint-disable-next-line no-restricted-syntax
            for (const children of post.children.data) {
              actualPost = new Post(
                children.id,
                children.media_type,
                '',
                post.caption,
                post.permalink,
                hashtag,
                '',
                new Date().toLocaleDateString('en-GB'),
                fusername,
                post.id,
                children.media_url
              );
              postsToReturn.push(actualPost);
            }
          } else {
            actualPost = new Post(
              post.id,
              post.media_type,
              '',
              post.caption,
              post.permalink,
              hashtag,
              '',
              new Date().toLocaleDateString('en-GB'),
              fusername,
              '0',
              post.media_url
            );
            postsToReturn.push(actualPost);
          }
        }
      }
      return postsToReturn;
    })();
  });
}

export async function getRecentPosts(
  hashtag: string
): Promise<Post[] | undefined> {
  return getPosts(hashtag, 'recent_media');
}

export async function getTopPosts(
  hashtag: string
): Promise<Post[] | undefined> {
  return getPosts(hashtag, 'top_media');
}

export async function getUsernameFromId(id: string): Promise<string> {
  const { sessionid } = await getCredentials();
  return (
    await axios.post(
      `${process.env.BASE_URL}/user/info`,
      new URLSearchParams({
        sessionid,
        user_id: id,
      })
    )
  ).data.username;
}

export async function getPostsFromUsername(username: string): Promise<Post[]> {
  const { sessionid } = await getCredentials();
  let userId = '';
  let error = false;

  await axios
    .post(
      `${process.env.BASE_URL}/user/id_from_username`,
      new URLSearchParams({
        sessionid,
        username,
      })
    )
    .then((res) => {
      userId = res.data;
    })
    .catch((err) => {
      if (err) error = true;
    });

  if (error) return [];

  let userMedias;
  await axios
    .post(
      `${process.env.BASE_URL}/media/user_medias`,
      new URLSearchParams({
        user_id: userId,
        sessionid,
      })
    )
    .then((res) => {
      userMedias = res;
    })
    .catch((err) => {
      if (err) error = true;
    });

  if (error) return [];

  const posts: Post[] = [];
  for (const post of userMedias.data) {
    if (post.resources.length > 0) {
      for (const subPost of post.resources) {
        posts.push(
          new Post(
            subPost.pk,
            subPost.media_type === 1 ? 'IMAGE' : 'VIDEO',
            '',
            post.caption_text,
            `https://www.instagram.com/p/${post.code}/`,
            '',
            '',
            new Date().toLocaleDateString('en-GB'),
            post.user.username,
            post.pk,
            subPost.media_type === 1 ? subPost.thumbnail_url : subPost.video_url
          )
        );
      }
    } else {
      posts.push(
        new Post(
          post.pk,
          post.media_type === 1 ? 'IMAGE' : 'VIDEO',
          '',
          post.caption_text,
          `https://www.instagram.com/p/${post.code}/`,
          '',
          '',
          new Date().toLocaleDateString('en-GB'),
          post.user.username,
          '',
          post.media_type === 1 ? post.thumbnail_url : post.video_url
        )
      );
    }
  }
  return posts;
}

export async function renewAccessToken() {
  const credentials = await getCredentials();
  const util = await getUtil();

  axios
    .post(
      `https://graph.facebook.com/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${credentials.clientId}&client_secret=${credentials.clientSecret}&fb_exchange_token=${credentials.accessToken}`
    )
    .then((res) => {
      setCredentials(
        credentials.username,
        credentials.password,
        credentials.sessionid,
        credentials.fbId,
        res.data.access_token,
        credentials.clientSecret,
        credentials.clientId
      );
      console.log('Renewed access token!');
      setUtil(
        util.lastUploadDate,
        new Date().toString(),
        util.totalPostedMedias,
        util.queuedMedias
      );
    })
    .catch((err) => {
      console.log(err.response.data);
    });
}

module.exports = {
  igLogin,
  checkIgAuth,
  publish,
  getRecentPosts,
  getTopPosts,
  getUsernameFromId,
  getPostsFromUsername,
  renewAccessToken,
};
