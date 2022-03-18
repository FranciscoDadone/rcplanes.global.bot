export class Post {
  postId;
  mediaType;
  caption;
  permalink;
  hashtag = '';
  status;
  date;
  username;
  storagePath;
  childrenOf;
  mediaUrl;

  constructor(
    postId?: string,
    mediaType?: string,
    storagePath?: string,
    caption?: string,
    permalink?: string,
    hashtag?: string,
    status?: string,
    date?: string,
    username?: string,
    childrenOf?: string,
    mediaUrl?: string
  ) {
    this.postId = postId ?? '';
    this.mediaType = mediaType ?? '';
    this.storagePath = storagePath ?? '';
    this.caption = caption ?? '';
    this.permalink = permalink ?? '';
    this.hashtag = hashtag ?? '';
    this.status = status ?? '';
    this.date = date ?? '';
    this.username = username ?? '';
    this.childrenOf = childrenOf ?? '';
    this.mediaUrl = mediaUrl ?? '';
  }

  getPostId() {
    return this.postId;
  }
  getMediaType() {
    return this.mediaType;
  }
  getStoragePath() {
    return this.storagePath;
  }
  getCaption() {
    return this.caption;
  }
  getPermalink() {
    return this.permalink;
  }
  getHashtag() {
    return this.hashtag;
  }
  getStatus() {
    return this.status;
  }
  getDate() {
    return this.date;
  }
  getUsername() {
    return this.username;
  }
  getChildrenOf() {
    return this.childrenOf;
  }
  getMediaURL() {
    return this.mediaUrl;
  }

  setStoragePath(path: string) {
    this.storagePath = path;
  }
}

module.exports = { Post };
