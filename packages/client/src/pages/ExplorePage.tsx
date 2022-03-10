import { useEffect, useState } from 'react';
import PostsPanel from '../components/PostsPanel';
import PageLoading from './PageLoading';

function ExplorePage() {
  const [posts, setPosts] = useState();

  useEffect(() => {
    let isMounted = true;
    // if (posts === undefined || posts.length === 0)
    //   ipcRenderer.invoke('getPosts').then((data) => {
    //     if (isMounted) {
    //       setPosts(data);
    //     }
    //   });
    return () => {
      isMounted = false;
    };
  });

  // ipcRenderer.on('updatePosts', (_ev, postsDB: Post[]) => {
  //   setPosts(postsDB);
  // });

  if (posts === undefined) {
    return <PageLoading />;
  }

  return (
    <>
      <PostsPanel posts={posts} />
    </>
  );
}

export default ExplorePage;
