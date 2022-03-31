import bcrypt from 'bcryptjs';
import { Post } from '../models/Post';

const DatabaseHandler = require('./DatabaseHandler');

/**
 * Saves a post to the database.
 * @param {Post} post
 */
export function savePostFromHashtag(post: Post) {
  console.log(
    `Saving (${post.getMediaType()}): ${post.getPostId()} (#${post.getHashtag()}) (@${post.getUsername()})`
  );
  const db = DatabaseHandler.getDatabase();

  try {
    db.run(
      'INSERT INTO postsFromHashtags (postId, mediaType, storagePath, permalink, caption, childrenOf, hashtag, status, date, username) VALUES (?,?,?,?,?,?,?,?,?,?)',
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
    'SELECT * FROM postsFromHashtags WHERE (postId=? OR childrenOf=?);';
  return new Promise((resolve) => {
    db.all(sql, [id, id], (_err: any, rows: any) => {
      if (Object.keys(rows).length === 0) resolve(undefined);
      else resolve(rows);
    });
  });
}

export async function addHashtagToFetch(hashtag: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = 'INSERT INTO hashtagsToFetch (hashtag) VALUES (?)';
  db.run(sql, [hashtag]);
}

export async function getAllHashtagsToFetch(): Promise<{
  [key: string]: any[];
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM hashtagsToFetch;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows);
    });
  });
}

export async function getAllNonDeletedPosts(): Promise<Post[]> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM postsFromHashtags WHERE (status=?)';
  return new Promise((resolve) => {
    db.all(sql, [''], (_err: any, rows: any) => {
      const posts: Post[] = [];
      for (const row of rows) {
        posts.push(
          new Post(
            row.postId,
            row.mediaType,
            row.storagePath,
            row.caption,
            row.permalink,
            row.hashtag,
            row.status,
            row.date,
            row.username,
            row.childrenOf,
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
  const sql = 'SELECT * FROM postsFromHashtags';
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
    'INSERT INTO mediaQueue (media, mediaType, caption, owner) VALUES (?,?,?,?)';
  db.run(sql, [media, mediaType, caption, owner]);
}

export async function removePostFromQueue(id: number) {
  const db = DatabaseHandler.getDatabase();
  const sql = `DELETE FROM mediaQueue WHERE id=${id}`;
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
  const sql = 'SELECT * FROM mediaQueue;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows);
    });
  });
}

export async function updatePostStatus(postId: string, status: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE postsFromHashtags SET (status)=('${status}') WHERE postId=${postId}`;
  db.run(sql);
}

export async function deleteHashtag(hashtag: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = `DELETE FROM hashtagsToFetch WHERE (hashtag)=('${hashtag}');`;
  db.run(sql);
}

export async function getCredentials(): Promise<{
  username: string;
  password: string;
  sessionid: string;
  fbId: string;
  accessToken: string;
  clientSecret: string;
  clientId: string;
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM credentials;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve({
        username: rows[0].username,
        password: rows[0].password,
        sessionid: rows[0].sessionid,
        fbId: rows[0].fbId,
        accessToken: rows[0].accessToken,
        clientSecret: rows[0].clientSecret,
        clientId: rows[0].clientId,
      });
    });
  });
}

export async function setCredentials(
  username: string,
  password: string,
  sessionid: string,
  fbId: string,
  accessToken: string,
  clientSecret: string,
  clientId: string
) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE credentials SET (username, password, sessionid, fbId, accessToken, clientSecret, clientId)=('${username}', '${password}', '${sessionid}', '${fbId}', '${accessToken}', '${clientSecret}', '${clientId}') WHERE id=1`;
  db.run(sql);
}

export async function getGeneralConfig(): Promise<{
  id: number;
  uploadRate: number;
  descriptionBoilerplate: string;
  hashtagFetchingEnabled: boolean;
  autoPosting: boolean;
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM generalConfig;';
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve({
        id: rows[0].id,
        uploadRate: rows[0].uploadRate,
        descriptionBoilerplate: rows[0].descriptionBoilerplate,
        hashtagFetchingEnabled: rows[0].hashtagFetchingEnabled === 1,
        autoPosting: rows[0].autoPosting === 1,
      });
    });
  });
}

export async function setGeneralConfig(
  uploadRate: number,
  descriptionBoilerplate: string,
  hashtagFetchingEnabled: boolean,
  autoPosting: boolean
) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE generalConfig SET (uploadRate, descriptionBoilerplate, hashtagFetchingEnabled, autoPosting)=(?,?,?,?) WHERE id=1`;
  db.run(sql, [
    uploadRate,
    descriptionBoilerplate,
    hashtagFetchingEnabled,
    autoPosting,
  ]);
}

export async function getUtil(): Promise<{
  id: number;
  lastUploadDate: string;
  totalPostedMedias: number;
  queuedMedias: number;
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
  lastUploadDate: string,
  totalPostedMedias: number,
  queuedMedias: number
) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE util SET (lastUploadDate, totalPostedMedias, queuedMedias)=(?,?,?) WHERE id=1`;
  db.run(sql, [lastUploadDate, totalPostedMedias, queuedMedias]);
}

export async function addPostToHistory(
  igLink: string,
  imgurLink: string,
  mediaType: string,
  owner: string,
  caption: string,
  date: string
) {
  const db = DatabaseHandler.getDatabase();
  const sql =
    'INSERT INTO postedMedias (igLink, imgurLink, mediaType, owner, caption, date) VALUES (?,?,?,?,?,?)';
  db.run(sql, [igLink, imgurLink, mediaType, owner, caption, date]);
}

export async function getQueuePost(id: number): Promise<{
  id: string;
  media: string;
  mediaType: string;
  caption: string;
  owner: string;
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = `SELECT * FROM mediaQueue WHERE id=${id}`;
  return new Promise((resolve) => {
    db.all(sql, (_err: any, rows: any) => {
      resolve(rows[0]);
    });
  });
}

export async function swapInQueue(id1, id2) {
  const db = DatabaseHandler.getDatabase();
  const row1: any = await getQueuePost(id1);
  const row2: any = await getQueuePost(id2);

  const sql1 = `UPDATE mediaQueue SET (media, mediaType, caption, owner)=(?,?,?,?) WHERE id=${id1}`;
  const sql2 = `UPDATE mediaQueue SET (media, mediaType, caption, owner)=(?,?,?,?) WHERE id=${id2}`;
  db.run(sql1, [row2.media, row2.mediaType, row2.caption, row2.owner]);
  db.run(sql2, [row1.media, row1.mediaType, row1.caption, row1.owner]);
}

export async function updateQueuePostCaption(id: string, caption: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = `UPDATE mediaQueue SET (caption)=(?) WHERE id=${id}`;
  db.run(sql, [caption]);
}

export async function getUserFromUsername(username: string) {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM user WHERE (username)=(?)';
  return new Promise((resolve) => {
    db.all(sql, [username], (_err: any, rows: any) => {
      resolve(rows[0]);
    });
  });
}

export async function getUserFromId(id: number): Promise<{
  id: number;
  username: string;
  hashedPassword: string;
  salt: string;
}> {
  const db = DatabaseHandler.getDatabase();
  const sql = 'SELECT * FROM user WHERE (id)=(?)';
  return new Promise((resolve) => {
    db.all(sql, [id], (_err: any, rows: any) => {
      resolve(rows[0]);
    });
  });
}

export async function updateUserFromId(
  id: number,
  newUsername: string,
  newPassword: string
) {
  const db = DatabaseHandler.getDatabase();

  const sql = `UPDATE user SET (username, hashedPassword)=(?,?) WHERE id=${id}`;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  db.run(sql, [newUsername, hashedPassword]);
}

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
  getUserFromUsername,
  getUserFromId,
  getQueuePost,
  updateUserFromId,
};
