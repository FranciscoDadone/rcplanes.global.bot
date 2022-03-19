import { useEffect, useState } from 'react';
import axios from 'axios';
import PostsPanel from '../components/PostsPanel';
import Loading from '../components/Loading';

function ExplorePage() {
  const [posts, setPosts] = useState<any>();
  useEffect(() => {
    let isMounted = true;
    if (posts === undefined || posts.length === 0) {
      axios.get('api/posts/non_deleted_fetched_posts').then((data) => {
        if (isMounted) {
          if (data.data.length === 0) setPosts([{ username: 'undefined' }]);
          else setPosts(data.data);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  });

  if (posts !== undefined && posts[0] !== undefined) {
    if (posts[0].username === 'undefined') {
      return <Loading text="There are no posts fetched." />;
    }
    return <PostsPanel posts={posts} />;
  }
  return <Loading text="Loading content..." spinner />;
}

export default ExplorePage;
