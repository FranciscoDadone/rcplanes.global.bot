import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

sqlite3.verbose();
let database: sqlite3.Database;

export function close() {
  database.close();
  console.log('Database closed.');
}

async function initDB() {
  const sql = 'INSERT INTO hashtagsToFetch (hashtag) VALUES (?)';
  database.run(sql, ['aeromodelismo']);
  database.run(sql, ['rcplanes']);

  database.run(
    'INSERT INTO credentials (username, password, sessionid) VALUES ("","","");'
  );

  database.run(
    `INSERT INTO util (lastUploadDate, totalPostedMedias, queuedMedias) VALUES ('${new Date().toString()}', 0, 0);`
  );

  database.run(
    'INSERT INTO generalConfig (uploadRate, descriptionBoilerplate, hashtagFetchingEnabled, autoPosting) VALUES (3, "%description%", true, true);'
  );

  const hashedPassword = await bcrypt.hash('admin', 10);
  database.run('INSERT INTO user (username, hashedPassword) VALUES (?,?)', [
    'admin',
    hashedPassword,
  ]);
}

function createTables() {
  // postsFromHashtags
  database.exec(`
    CREATE TABLE IF NOT EXISTS postsFromHashtags (
      date         TEXT,
      postId      TEXT NOT NULL UNIQUE,
      hashtag      TEXT NOT NULL,
      mediaType   TEXT NOT NULL,
      storagePath TEXT NOT NULL UNIQUE,
      permalink    TEXT NOT NULL,
      caption      TEXT,
      childrenOf  INTEGER,
      status       TEXT,
      username     TEXT NOT NULL
    );`);

  // hashtagsToFetch
  database.exec(`CREATE TABLE IF NOT EXISTS hashtagsToFetch (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hashtag TEXT NOT NULL);`);

  // profilesToFetch
  database.exec(`CREATE TABLE IF NOT EXISTS profilesToFetch (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL);`);

  // mediaQueue
  database.exec(`CREATE TABLE IF NOT EXISTS mediaQueue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media TEXT NOT NULL,
    mediaType TEXT NOT NULL,
    caption TEXT,
    owner TEXT NOT NULL);`);

  // credentials
  database.exec(`CREATE TABLE IF NOT EXISTS credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    sessionid TEXT,
    fbId TEXT,
    accessToken TEXT,
    clientSecret TEXT,
    clientId TEXT);`);

  // generalConfig
  database.exec(`CREATE TABLE IF NOT EXISTS generalConfig (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploadRate NUMBER NOT NULL,
    descriptionBoilerplate TEXT NOT NULL,
    hashtagFetchingEnabled INTEGER NOT NULL,
    profilesFetchingEnabled INTEGER NOT NULL,
    autoPosting INTEGER NOT NULL);`);

  // util
  database.exec(`CREATE TABLE IF NOT EXISTS util (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lastUploadDate TEXT NOT NULL,
    totalPostedMedias NUMBER NOT NULL,
    queuedMedias NUMBER NOT NULL);`);

  // postedMedias
  database.exec(`CREATE TABLE IF NOT EXISTS postedMedias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    igLink TEXT NOT NULL,
    imgurLink TEXT NOT NULL,
    mediaType TEXT NOT NULL,
    owner TEXT NOT NULL,
    caption TEXT NOT NULL,
    date TEXT NOT NULL);`);

  database.exec(
    'CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, hashedPassword BLOB)'
  );
}

export function connect(): sqlite3.Database {
  database = new sqlite3.Database(
    `./database.sqlite`,
    sqlite3.OPEN_READWRITE,
    (err: Error | null) => {
      createTables();
      if (err) {
        database = new sqlite3.Database(`./database.sqlite`, (err1) => {
          if (err1) {
            console.log(`Database error ${err1}`);
          }
          createTables();
          initDB();
        });
      }
      console.log('Database connected!');
    }
  );
  // database.on('trace', (err) => {
  //   console.log(err);
  // });
  return database;
}

export function getDatabase(): sqlite3.Database {
  return database;
}

module.exports = { connect, getDatabase, close };
