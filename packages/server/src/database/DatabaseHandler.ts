import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

sqlite3.verbose();
let database: sqlite3.Database;

export function close() {
  database.close();
  console.log('Database closed.');
}

async function initDB() {
  const sql = 'INSERT INTO hashtags_to_fetch (hashtag) VALUES (?)';
  database.run(sql, ['aeromodelismo']);
  database.run(sql, ['rcplanes']);

  database.run(
    'INSERT INTO credentials (access_token, client_secret, client_id, ig_account_id) VALUES ("null","","","");'
  );

  database.run(
    `INSERT INTO util (last_upload_date, total_posted_medias, queued_medias) VALUES ('${new Date().toString()}', 0, 0);`
  );

  database.run(
    'INSERT INTO general_config (upload_rate, description_boilerplate, hashtag_fetching_enabled) VALUES (3, "%description%", true);'
  );

  const hashedPassword = await bcrypt.hash('admin', 10);
  database.run('INSERT INTO user (username, hashed_password) VALUES (?,?)', [
    'admin',
    hashedPassword,
  ]);
}

function createTables() {
  // posts_from_hashtags
  database.exec(`
    CREATE TABLE IF NOT EXISTS posts_from_hashtags (
      date         TEXT,
      post_id      TEXT NOT NULL UNIQUE,
      hashtag      TEXT NOT NULL,
      media_type   TEXT NOT NULL,
      storage_path TEXT NOT NULL UNIQUE,
      permalink    TEXT NOT NULL,
      caption      TEXT,
      children_of  INTEGER,
      status       TEXT,
      username     TEXT NOT NULL
    );`);

  // hashtags_to_fetch
  database.exec(`CREATE TABLE IF NOT EXISTS hashtags_to_fetch (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hashtag TEXT NOT NULL);`);

  // media_queue
  database.exec(`CREATE TABLE IF NOT EXISTS media_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media TEXT NOT NULL,
    mediaType TEXT NOT NULL,
    caption TEXT,
    owner TEXT NOT NULL);`);

  // credentials
  database.exec(`CREATE TABLE IF NOT EXISTS credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    client_id TEXT NOT NULL,
    ig_account_id TEXT NOT NULL);`);

  // general_config
  database.exec(`CREATE TABLE IF NOT EXISTS general_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_rate NUMBER NOT NULL,
    description_boilerplate TEXT NOT NULL,
    hashtag_fetching_enabled INTEGER NOT NULL);`);

  // util
  database.exec(`CREATE TABLE IF NOT EXISTS util (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_upload_date TEXT NOT NULL,
    total_posted_medias NUMBER NOT NULL,
    queued_medias NUMBER NOT NULL);`);

  // posted_medias
  database.exec(`CREATE TABLE IF NOT EXISTS posted_medias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ig_link TEXT NOT NULL,
    imgur_link TEXT NOT NULL,
    media_type TEXT NOT NULL,
    owner TEXT NOT NULL,
    caption TEXT NOT NULL,
    date TEXT NOT NULL);`);

  database.exec(
    'CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, hashed_password BLOB, salt BLOB)'
  );
}

export function connect(): sqlite3.Database {
  database = new sqlite3.Database(
    `${__dirname}/database.sqlite`,
    sqlite3.OPEN_READWRITE,
    (err: Error | null) => {
      createTables();
      if (err) {
        database = new sqlite3.Database(
          `${__dirname}/database.sqlite`,
          (err1) => {
            if (err1) {
              console.log(`Database error ${err1}`);
            }
            createTables();
            initDB();
          }
        );
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
