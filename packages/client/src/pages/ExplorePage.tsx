import { useEffect, useState } from 'react';
import axios from 'axios';
import PostsPanel from '../components/PostsPanel';
import PageLoading from './PageLoading';

function ExplorePage() {
  const [posts, setPosts] = useState<any>();

  useEffect(() => {
    let isMounted = true;
    if (posts === undefined || posts.length === 0) {
      axios.get('api/fetchedPosts').then((data) => {
        if (isMounted) {
          if (data.data.length === 0) setPosts({ username: 'undefined' });
          else setPosts(data.data);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  });

  if (
    posts !== undefined &&
    posts[0] !== undefined &&
    posts[0].username !== 'undefined'
  ) {
    return <PostsPanel posts={posts} />;
  }
  return <PageLoading />;
}

export default ExplorePage;
