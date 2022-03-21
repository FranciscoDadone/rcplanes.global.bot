
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/FranciscoDadone/rcplanes.global.bot-webversion">
    <img src="packages/client/src/assets/images/icon.png" />
</a>

  <h3 align="center">rcplanes.global.bot</h3>
  <p align="center">
  Instagram bot to fetch images and videos of RC planes and repost them.
<br />
    <br />
  </p>
</p>

This started as a way to advertise and make more visible RC stuff.

It's a bot that fetches posts from different hashtags using the Instagram API and let you add media to a queue to later be autoposted (with a rate that is configurable). It also adds a watermark with the page mention and original post owner credit in the left bottom of all the images. It has a user-friendly web interface built with ```ReactJS``` that let you know all that is happening in the app.

This project is based on my other project that is the same app but built using Electron for Desktop.

### Built With

* [NodeJS](https://nodejs.org)
* [Express](https://expressjs.com)
* [Sqlite3](https://www.sqlite.org/index.html)
* [ReactBootstrap](https://react-bootstrap.github.io/)
* [ReactJS](https://reactjs.org/)
* [TypeScript](https://www.typescriptlang.org/)

# Images
- Login page: Dashboard login (default creds: admin:admin)
<img src=".github/images/login.png" />

- Explore page: Main page where fetched content will show.
<img src=".github/images/explore.png" />

- Media popup: this shows when you click an image in the explore page and let you decide to delete that post or send it to the queue.
<img src=".github/images/mediaModal.png" />

- Configuration page
<img src=".github/images/configuration1.png" />
<img src=".github/images/configuration2.png" />
<img src=".github/images/configuration3.png" />
<img src=".github/images/configuration4.png" />

- Database page: page that shows database contents.
<img src=".github/images/database.png" />

- Queue: media queue of selected content.
<img src=".github/images/queue.png" />

- Logs: application logs
<img src=".github/images/logs.png" />

### Installation
#### Regular install
1. Clone the repo.
   ```sh
   $ git clone https://github.com/FranciscoDadone/rcplanes.global.bot-webversion
   ```
2. Install dependencies
   ```sh
   $ yarn install
   $ ( cd packages/client && yarn )
   $ ( cd packages/server && yarn )
   $ ( cd packages/common && yarn )
   ```
3. Running on production
    ```sh
    $ ( cd packages/client && yarn build )
    $ ( cd packages/server && yarn build )
    $ ( cd packages/common && yarn build )
    $ yarn start
    ```
4. Running on development
    ```sh
    $ yarn dev
    ```


### Docker install
1. Build the image
    ```Dockerfile
    $ docker build . -t rcplanes.global.bot
    ```

2. Running the image
    ```Dockerfile
    $ docker run -d -p <PORT>:8080 --restart unless-stopped rcplanes.global.bot
    ```

# Authentication credentials
### Steps:
 - Create a Facebook Application at https://developers.facebook.com/. 
 - Add ```Facebook login``` and ```Instagram Graph API```.
 - Go to https://developers.facebook.com/tools/explorer/ and select this permissions:
      - pages_show_list
      - business_management
      - instagram_basic
      - instagram_manage_comments
      - instagram_manage_insights
      - instagram_content_publish
      - instagram_manage_messages
      - pages_read_engagement
      - pages_read_user_content
- Following the next step... Generate the Access Token.

### Credentials
- Auth Token: Read the Steps above.
- Client ID
<img src=".github/images/clientId.png" />
- Client secret (https://developers.facebook.com/apps/340051487987229/settings/basic/)
<img src=".github/images/clientSecret.png" />
- Instagram account ID ( search for 'fbid' in https://www.instagram.com/rcplanes.global/?__a=1 )

# API Endpoints
  ## /auth/
  ### POST ```/auth/login```
  Receives a username and password and returns: ```SUCCESS``` when authenticated AND ```INCORRECT_CREDENTIALS``` when no user found with that credentials. 
  * data: { username, password }

  ### POST ```/auth/logout```
  Logs the user out. Returns ```SUCCESS``` when logged out.

  ### GET ```/auth/user```
  Gets the current logged user. Same as ```/api/user```

  ## /api/
  ### GET ```/api/user```
  Returns current authenticated user.
  
  ### GET ```/api/status```
  Returns the current app status.

  ### GET ```/api/post_process_image```
  Receives a instagram post id (stored image name) and username and returns a postprocessed image with the watermark.
 * params: { image, username }
    * image: instagram post id (stored image path).
    * username: username to add to the watermark.
  
  ## /api/general/
  ### GET ```/api/general/general_config```
  Returns the general config: { uploadRate, descriptionBoilerplate, hashtagFetching, autoPosting }

  ### POST ```/api/general/set_general_config```
  Receives general config fields and stores them in the database.
  * data: { uploadRate, descriptionBoilerplate, hashtagFetching, autoPosting }

  ### GET ```/api/general/credentials```
  Returns the stored Instagram/Facebook credentials: { accessToken, clientSecret clientId, igAccountId }

  ### POST ```/api/general/set_credentials```
  Receives Instagram/Facebook credentials and stores them in the database.
  * data: { accessToken, clientSecret, clientId, igAccountId }

  ### GET ```/api/general/util```
  Returns { lastUploadDate, totalPostedMedias, queuedMedias }

  ### POST ```/api/general/change_dashboard_credentials```
  Receives the old password to compare the proceed with the change and the new username and password.
  Returns ```SUCCESS``` if the change succeded and ```PASSWORD_MISSMACH``` if the old password doesn't match with the one on the database.
  * data: { oldPassword, newPassword, newUsername }

  ### GET ```/api/general/logs```
  Returns the server logs at runtime.

  ## /api/hashtags/
  ### GET ```/api/hashtags/hashtags```
  Returns all the hashtags to fetch.

  ### POST ```/api/hashtags/add```
  Receives a new hashtag and adds it to the database of hashtags to fetch.
  * data: { hashtag }

  ### DELETE ```/api/hashtags/delete```
  Receives a hashtag and deletes it from the database of hashtags to fetch.
  * params: { hashtag }

  ## /api/posts/
  ### GET ```/api/posts/non_deleted_fetched_posts```
  Returns all the posts that have not been deleted, queued or posted.
  * Return: { postId, mediaType, storagePath, caption, permalink, hashtag, status, date, username, childrenOf }

  ### GET ```/api/posts/all_fetched_posts```
  Returns all fetched posts.
  * Return: { postId, mediaType, storagePath, caption, permalink, hashtag, status, date, username, childrenOf }

  ### DELETE ```/api/posts/delete```
  Receives a post id and deletes that post from the fetched posts.
  * params: { postId }

  ### POST ```/api/posts/queue```
  Receives a post and adds it to the queue.
  * data: { id, mediaPath, usernameInImg, mediaType, caption, owner }
    * id: fetched post id
    * mediaPath: where the media is stored in the filesystem.
    * mediaType: IMAGE or VIDEO
    * caption: post caption
    * owner: post owner aka username

  ## /api/queue/
  ### GET ```/api/queue/queue```
  Returns an array of the current posts in queue.
  * Return: [{ id, media, mediaType, caption, owner }]

  ### POST ```/api/queue/swap```
  Receives the id's of two posts and swaps them in the queue.
  * data: { id1, id2 }

  ### DELETE ```/api/queue/delete```
  Receives a post id and deletes that post from the queue.
  * params: { id }
  
  ### PATCH ```/api/queue/update_post```
  Receives a post id and the caption and updates it on the database.
  * data: { id, caption }

<!-- CONTACT -->
# Contact

- Francisco Dadone - [@FranDadone](https://twitter.com/FranDadone) - dadonefran@gmail.com

- Project Link: [https://github.com/FranciscoDadone/rcplanes.global.bot-webversion](https://github.com/FranciscoDadone/rcplanes.global.bot-webversion)


# TO-DO
- Access Token auto-refresh
- Profiles fetching
- Posting schedule
- Manually add post to queue
- 2FA Authentication to the panel
