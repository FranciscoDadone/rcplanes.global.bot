import axios from 'axios';
import { getCredentials, setCredentials } from '../database/DatabaseQueries';
import { Post } from '../models/Post';

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

async function getPosts(hashtag: string, postsFromIgGraphAPI: any) {
  const ret: Post[] = [];
  const sessionid = (await getCredentials()).lastSessionId;

  for (const post of postsFromIgGraphAPI) {
    // eslint-disable-next-line no-underscore-dangle
    if (post.node.__typename === 'GraphSidecar') {
      const subPosts = (
        await axios.post(
          `${process.env.BASE_URL}/media/info`,
          new URLSearchParams({
            sessionid,
            pk: post.node.id,
            use_cache: 'true',
          })
        )
      ).data.resources;
      for (const subPost of subPosts) {
        ret.push(
          new Post(
            subPost.pk,
            subPost.media_type === 1 ? 'IMAGE' : 'VIDEO',
            '',
            post.node.edge_media_to_caption.edges[0].node.text,
            `https://www.instagram.com/p/${post.node.shortcode}/`,
            hashtag,
            '',
            new Date().toLocaleDateString('en-GB'),
            post.node.owner.id,
            post.node.id,
            subPost.media_type === 1 ? subPost.thumbnail_url : subPost.video_url
          )
        );
      }
      // eslint-disable-next-line no-underscore-dangle
    } else if (post.node.__typename === 'GraphImage') {
      ret.push(
        new Post(
          post.id,
          'IMAGE',
          '',
          post.node.edge_media_to_caption.edges[0].node.text,
          `https://www.instagram.com/p/${post.node.shortcode}/`,
          hashtag,
          '',
          new Date().toLocaleDateString('en-GB'),
          post.node.owner.id,
          '',
          post.display_url
        )
      );
      // eslint-disable-next-line no-underscore-dangle
    } else if (post.node.__typename === 'GraphVideo') {
      const videoPost = (
        await axios.post(
          `${process.env.BASE_URL}/media/info`,
          new URLSearchParams({
            sessionid,
            pk: post.node.id,
            use_cache: 'true',
          })
        )
      ).data;
      ret.push(
        new Post(
          post.id,
          'VIDEO',
          '',
          post.node.edge_media_to_caption.edges[0].node.text,
          `https://www.instagram.com/p/${post.node.shortcode}/`,
          hashtag,
          '',
          new Date().toLocaleDateString('en-GB'),
          videoPost.user.username,
          '',
          videoPost.video_url
        )
      );
    }
  }
  return ret;
}

export async function getRecentPosts(hashtag: string): Promise<Post[]> {
  const posts = (
    await axios.get(`https://www.instagram.com/explore/tags/${hashtag}/?__a=1`)
  ).data.graphql.hashtag.edge_hashtag_to_media.edges;
  return getPosts(hashtag, posts);
}

export async function getTopPosts(hashtag: string): Promise<Post[]> {
  const posts = (
    await axios.get(`https://www.instagram.com/explore/tags/${hashtag}/?__a=1`)
  ).data.graphql.hashtag.edge_hashtag_to_top_posts.edges;
  return getPosts(hashtag, posts);
}

module.exports = {
  igLogin,
  checkIgAuth,
  publish,
  getRecentPosts,
  getTopPosts,
};
