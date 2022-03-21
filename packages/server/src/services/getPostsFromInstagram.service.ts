import URLSearchParams from 'url';
import { Post } from '../models/Post';
import { getCredentials, getGeneralConfig } from '../database/DatabaseQueries';

const request = require('request');

// async function getHashtagId(hashtag: string): Promise<any> {
//   const generalConfig = await getGeneralConfig();
//   if (!generalConfig.hashtagFetchingEnabled) return;
//   const credentials: any = await getCredentials();
//   return new Promise((resolve) => {
//     const res = fetch(
//       `https://graph.facebook.com/v12.0/ig_hashtag_search?${new URLSearchParams.URLSearchParams(
//         {
//           user_id: credentials.igAccountId,
//           access_token: credentials.accessToken,
//           q: hashtag,
//           fields: 'id,name',
//         }
//       )}`,
//       {
//         method: 'GET',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     res.then((data: any) =>
//       data.json().then((data1: any) => {
//         if (data.status === 400) {
//           console.log(data1);
//           resolve(data1);
//         }
//         if (data1.data === undefined) {
//           console.log('================ ERROR ================');
//           console.log(data1.error.message);
//           console.log('=======================================');
//           return resolve(undefined);
//         }
//         return resolve(data1.data[0].id);
//       })
//     );
//   });
// }

// async function getUsername(post: { permalink: any }): Promise<string> {
//   return new Promise((resolve) => {
//     fetch(`https://api.instagram.com/oembed/?url=${post.permalink}`, {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     }).then((data2: { status: number; json: () => Promise<any> }) => {
//       if (data2.status === 200) {
//         return resolve(
//           data2
//             .json()
//             .then((data2json: { author_name: any }) => data2json.author_name)
//         );
//       }
//       return resolve('Unknown');
//     });

//     setTimeout(() => {
//       resolve('Unknown');
//     }, 5000);
//   });
// }

// export async function getPosts(hashtag: string, type: string): Promise<Post> {
//   const credentials: any = await getCredentials();
//   return getHashtagId(hashtag).then((id) => {
//     if (id === undefined) return [];
//     return fetch(
//       `https://graph.facebook.com/v12.0/${id}/${type}?${new URLSearchParams.URLSearchParams(
//         {
//           user_id: credentials.igAccountId,
//           access_token: credentials.accessToken,
//           fields:
//             'id,children{media_url,media_type},caption,media_type,media_url,permalink',
//         }
//       )}`,
//       {
//         method: 'GET',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//         },
//       }
//     ).then((data: { json: () => Promise<any> }) =>
//       data.json().then((data1: { data: any; error: any }) => {
//         if (data1.error && data1.error.code === 190) {
//           return;
//         }
//         const postsCount =
//           data1.data === undefined ? 0 : Object.keys(data1.data).length;
//         console.log(
//           `Got ${postsCount} posts (unfiltered) from Instagram API #${hashtag}`
//         );
//         let actualPost: Post;
//         return (async () => {
//           const postsToReturn: any[] = [];
//           for (let i = 0; i < postsCount; i++) {
//             const post = data1.data[i];
//             let username = 'Unknown';
//             try {
//               username = await getUsername(post);
//             } catch (err) {
//               console.log("Couldn't get the username! ");
//               console.log(post);
//             }
//             if (username !== 'rcplanes.global') {
//               if (post.media_type === 'CAROUSEL_ALBUM') {
//                 // eslint-disable-next-line no-restricted-syntax
//                 for (const children of post.children.data) {
//                   actualPost = new Post(
//                     children.id,
//                     children.media_type,
//                     '',
//                     post.caption,
//                     post.permalink,
//                     hashtag,
//                     '',
//                     new Date().toLocaleDateString('en-GB'),
//                     username,
//                     post.id,
//                     children.media_url
//                   );
//                   postsToReturn.push(actualPost);
//                 }
//               } else {
//                 actualPost = new Post(
//                   post.id,
//                   post.media_type,
//                   '',
//                   post.caption,
//                   post.permalink,
//                   hashtag,
//                   '',
//                   new Date().toLocaleDateString('en-GB'),
//                   username,
//                   '0',
//                   post.media_url
//                 );
//                 postsToReturn.push(actualPost);
//               }
//             }
//           }
//           return postsToReturn;
//         })();
//       })
//     );
//   });
// }

export async function getRecentPosts(hashtag?: string) {
  // return getPosts(hashtag, 'recent_media');

  request.post(
    'http://localhost:8081/user/info_by_username',
    {
      form: {
        sessionid: '51088662819%3AKaOfgQx5f2Iif8%3A7',
        username: 'rcplanes.global',
      },
    },
    (error, response, body) => {
      console.log(body);
    }
  );
}

export async function getTopPosts(hashtag: string) {
  // return getPosts(hashtag, 'top_media');
}

module.exports = { getRecentPosts, getTopPosts };
