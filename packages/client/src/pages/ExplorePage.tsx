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
        if (isMounted) setPosts(data.data);
      });
    }
    return () => {
      isMounted = false;
    };
  });

  // console.log(posts);/

  if (posts !== undefined) {
    return <PostsPanel posts={posts} />;
  }
  return <PageLoading />;
}

export default ExplorePage;
