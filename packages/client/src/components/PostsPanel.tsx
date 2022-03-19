import { Row, Container, Pagination } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import '../assets/css/PostsPanel.css';

function splitUp(arr: any, n: number) {
  const rest = arr.length % n;
  let restUsed = rest;
  const partLength = Math.floor(arr.length / n);
  const result: any[] = [];

  for (let i = 0; i < arr.length; i += partLength) {
    let end = partLength + i;
    let add = false;

    if (rest !== 0 && restUsed) {
      // should add one element for the division
      end++;
      restUsed--; // we've used one division element now
      add = true;
    }
    result.push(arr.slice(i, end)); // part of the array
    if (add) {
      i++; // also increment i in the case we added an extra element for division
    }
  }
  return result;
}

function PostsPanel(props: { posts: any }) {
  const { posts } = props;
  const [activeTab, setActiveTab] = useState<number>(1);
  const [auxPosts, setAuxPosts] = useState(splitUp(posts, posts.length / 55));

  if (posts === undefined) return <div />;

  const handleClick = (number: number) => {
    setActiveTab(number);
  };

  if (posts !== undefined && posts.length !== 0) {
    const updateArray = () => {
      axios.get('/api/posts/non_deleted_fetched_posts').then((data) => {
        setAuxPosts(splitUp(data.data, data.data.length / 55));
      });
    };

    return (
      <div className="black-bg">
        <Container>
          <div className="paginationDiv">
            <Pagination className="justify-content-center">
              <Pagination.Item onClick={() => handleClick(1)}>
                {1}
              </Pagination.Item>
              <Pagination.Ellipsis />

              {activeTab - 2 > 0 ? (
                <Pagination.Item onClick={() => handleClick(activeTab - 2)}>
                  {activeTab - 2}
                </Pagination.Item>
              ) : (
                <Pagination.Item>&nbsp;</Pagination.Item>
              )}
              {activeTab - 1 > 0 ? (
                <Pagination.Item onClick={() => handleClick(activeTab - 1)}>
                  {activeTab - 1}
                </Pagination.Item>
              ) : (
                <Pagination.Item>&nbsp;</Pagination.Item>
              )}
              <Pagination.Item active>{activeTab}</Pagination.Item>
              {activeTab < auxPosts.length ? (
                <Pagination.Item onClick={() => handleClick(activeTab + 1)}>
                  {activeTab + 1}
                </Pagination.Item>
              ) : (
                <Pagination.Item>&nbsp;</Pagination.Item>
              )}
              {activeTab + 1 < auxPosts.length ? (
                <Pagination.Item onClick={() => handleClick(activeTab + 2)}>
                  {activeTab + 2}
                </Pagination.Item>
              ) : (
                <Pagination.Item>&nbsp;</Pagination.Item>
              )}

              <Pagination.Ellipsis />
              <Pagination.Item onClick={() => handleClick(auxPosts.length)}>
                {auxPosts.length}
              </Pagination.Item>
            </Pagination>
          </div>

          <Row className="fluid" xs="auto">
            {auxPosts[activeTab - 1].map((post: any) => (
              <PostCard
                post={post}
                key={post.postId}
                updateList={updateArray}
              />
            ))}
          </Row>

          <div className="paginationDiv paginationBottom">
            <Pagination className="justify-content-center">
              <Pagination.Item onClick={() => handleClick(1)}>
                {1}
              </Pagination.Item>
              <Pagination.Ellipsis />

              {activeTab - 2 > 0 ? (
                <Pagination.Item onClick={() => handleClick(activeTab - 2)}>
                  {activeTab - 2}
                </Pagination.Item>
              ) : (
                <Pagination.Item>&nbsp;</Pagination.Item>
              )}
              {activeTab - 1 > 0 ? (
                <Pagination.Item onClick={() => handleClick(activeTab - 1)}>
                  {activeTab - 1}
                </Pagination.Item>
              ) : (
                <Pagination.Item>&nbsp;</Pagination.Item>
              )}
              <Pagination.Item active>{activeTab}</Pagination.Item>
              {activeTab < auxPosts.length ? (
                <Pagination.Item onClick={() => handleClick(activeTab + 1)}>
                  {activeTab + 1}
                </Pagination.Item>
              ) : (
                <Pagination.Item>&nbsp;</Pagination.Item>
              )}
              {activeTab + 1 < auxPosts.length ? (
                <Pagination.Item onClick={() => handleClick(activeTab + 2)}>
                  {activeTab + 2}
                </Pagination.Item>
              ) : (
                <Pagination.Item>&nbsp;</Pagination.Item>
              )}

              <Pagination.Ellipsis />
              <Pagination.Item onClick={() => handleClick(auxPosts.length)}>
                {auxPosts.length}
              </Pagination.Item>
            </Pagination>
          </div>
        </Container>
      </div>
    );
  }
  return (
    <div className="black-bg">
      <Container>
        <h1 className="empty-text">Empty</h1>
      </Container>
    </div>
  );
}

export default PostsPanel;
