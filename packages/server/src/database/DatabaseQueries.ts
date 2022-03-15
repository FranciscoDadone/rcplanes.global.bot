import { Post } from '../models/Post';

const DatabaseHandler = require('./DatabaseHandler');

/**
 * Saves a post to the database.
 * @param {Post} post
 */
export function savePostFromHashtag(post: Post) {
  console.log(
    `Saving (${post.getMediaType()}): ${post.getPostId()} (#${post.getHashtag()})`
  );
  const db = DatabaseHandler.getDatabase();

  try {
    db.run(
      'INSERT INTO posts_from_hashtags (post_id, media_type, storage_path, permalink, caption, children_of, hashtag, status, date, username) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [
        post.getPostId(),
        post.getMediaType(),
        post.getStoragePath(),
        post.getPermalink(),
        post.getCaption(),
        post.getChildrenOf(),
        post.getHashtag(),
        post.getStatus(),
        post.getDate(),
        post.getUsername(),
      ]
    );
  } catch (e) {
    console.error(e);
  }
}

/**
 * Gets a post from the database.
 */
export async function getPostFromIdJSON(id: string) {
  const db = DatabaseHandler.getDatabase();
  const sql =
    'SELECT * FROM posts_from_hashtags WHERE (post_id=? OR children_of=?);';
  return new Promise((resolve) => {
    db.all(sql, [id, id], (_err: any, rows: any) => {
      if (Object.keys(rows).length === 0) resolve(undefined);
      else resolve(rows);
    });
  });
}

export async function addHashtagToFetch(hashtag: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = 'INSERT INTO hashtags_to_fetch (hashtag) VALUES (?)';
  db.run(sql, [hashtag]);
}

export async function getAllHashtagsToFetch(): Promise<{
  [key: string]: any[];
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM hashtags_to_fetch;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows);
    });
  });
}

export async function getAllNonDeletedPosts(): Promise<Post[]> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM posts_from_hashtags WHERE (status=?)';
  return new Promise((resolve) => {
    db.all(sql, [''], (_err: any, rows: any) => {
      const posts: Post[] = [];
      for (const row of rows) {
        posts.push(
          new Post(
            row.post_id,
            row.media_type,
            row.storage_path,
            row.caption,
            row.permalink,
            row.hashtag,
            row.status,
            row.date,
            row.username,
            row.children_of,
            ''
          )
        );
      }
      resolve(posts);
    });
  });
}

export async function getAllPostsJSON(): Promise<{
  postId: string;
  date: string;
  hashtag: string;
  mediaType: string;
  permalink: string;
  childrenOf: string;
  status: string;
  owner: string;
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM posts_from_hashtags';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows);
    });
  });
}

export async function addPostToQueue(
  media: string,
  mediaType: string,
  caption: string,
  owner: string
) {
  const db = DatabaseHandler.getDatabase();
  const sql =
    'INSERT INTO media_queue (media, mediaType, caption, owner) VALUES (?,?,?,?)';
  db.run(sql, [media, mediaType, caption, owner]);
}

export async function removePostFromQueue(id: number) {
  const db = DatabaseHandler.getDatabase();
  const sql = `DELETE FROM media_queue WHERE id=${id}`;
  db.run(sql);
}

export async function getQueue(): Promise<
  [
    {
      id: number;
      media: string;
      mediaType: string;
      caption: string;
      owner: string;
    }
  ]
> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM media_queue;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows);
    });
  });
}

export async function updatePostStatus(postId: string, status: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE posts_from_hashtags SET (status)=('${status}') WHERE post_id=${postId}`;
  db.run(sql);
}

export async function deleteHashtag(hashtag: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = `DELETE FROM hashtags_to_fetch WHERE (hashtag)=('${hashtag}');`;
  db.run(sql);
}

export async function getCredentials() {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM credentials;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows[0]);
    });
  });
}

export async function setCredentials(
  access_token: string,
  client_secret: string,
  client_id: string,
  ig_account_id: string
) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE credentials SET (access_token, client_secret, client_id, ig_account_id)=('${access_token}', '${client_secret}', '${client_id}', '${ig_account_id}') WHERE id=1`;
  db.run(sql);
}

export async function getGeneralConfig(): Promise<{
  id: number;
  upload_rate: number;
  description_boilerplate: string;
  hashtag_fetching_enabled: boolean;
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM general_config;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows[0]);
    });
  });
}

export async function setGeneralConfig(
  uploadRate: number,
  descriptionBoilerplate: string,
  hashtag_fetching_enabled: boolean
) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE general_config SET (upload_rate, description_boilerplate, hashtag_fetching_enabled)=(?,?,?) WHERE id=1`;
  db.run(sql, [uploadRate, descriptionBoilerplate, hashtag_fetching_enabled]);
}

export async function getUtil(): Promise<{
  id: number;
  last_upload_date: string;
  total_posted_medias: number;
  queued_medias: number;
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM util;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows[0]);
    });
  });
}

export async function setUtil(
  last_upload_date: string,
  total_posted_medias: number,
  queued_medias: number
) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE util SET (last_upload_date, total_posted_medias, queued_medias)=(?,?,?) WHERE id=1`;
  db.run(sql, [last_upload_date, total_posted_medias, queued_medias]);
}

export async function addPostToHistory(
  ig_link: string,
  imgur_link: string,
  media_type: string,
  owner: string,
  caption: string,
  date: string
) {
  const db = DatabaseHandler.getDatabase();
  const sql =
    'INSERT INTO posted_medias (ig_link, imgur_link, media_type, owner, caption, date) VALUES (?,?,?,?,?,?)';
  db.run(sql, [ig_link, imgur_link, media_type, owner, caption, date]);
}

export async function swapInQueue(
  row1: {
    id: number;
    media: string;
    mediaType: string;
    caption: string;
    owner: string;
  },
  row2: {
    id: number;
    media: string;
    mediaType: string;
    caption: string;
    owner: string;
  }
) {
  const db = DatabaseHandler.getDatabase();
  const sql1 = `UPDATE media_queue SET (media, mediaType, caption, owner)=(?,?,?,?) WHERE id=${row1.id}`;
  const sql2 = `UPDATE media_queue SET (media, mediaType, caption, owner)=(?,?,?,?) WHERE id=${row2.id}`;
  db.run(sql1, [row2.media, row2.mediaType, row2.caption, row2.owner]);
  db.run(sql2, [row1.media, row1.mediaType, row1.caption, row1.owner]);
}

export async function updateQueuePostCaption(id: string, caption: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE media_queue SET (caption)=(?) WHERE id=${id}`;
  db.run(sql, [caption]);
}

export async function getUser() {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM user WHERE id = 1';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows[0]);
    });
  });
}

// export async function addUserToDB(username: string, hashedPassword: any) {
//   const db = DatabaseHandler.getDatabase();
//   const sql = 'INSERT INTO users (username, hashed_password) VALUES (?, ?)';
//   db.run(sql, [username, hashedPassword]);
// }

// export async function getTotalOfUsers(): Promise<number> {
//   const db = DatabaseHandler.getDatabase();
//   const sql = 'SELECT COUNT(*) FROM users';
//   return new Promise<number>((resolve) => {
//     db.all(sql, (_err, count) => {
//       resolve(count[0]['COUNT(*)']);
//     });
//   });
// }

module.exports = {
  savePostFromHashtag,
  getPostFromIdJSON,
  addHashtagToFetch,
  getAllHashtagsToFetch,
  getAllNonDeletedPosts,
  addPostToQueue,
  updatePostStatus,
  getAllPostsJSON,
  deleteHashtag,
  getCredentials,
  setCredentials,
  setGeneralConfig,
  getGeneralConfig,
  setUtil,
  getUtil,
  getQueue,
  removePostFromQueue,
  addPostToHistory,
  swapInQueue,
  updateQueuePostCaption,
  getUser,
};
