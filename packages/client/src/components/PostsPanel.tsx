import { Row, Container, Pagination } from 'react-bootstrap';
import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState(1);

  if (posts === undefined) return <div />;

  const handleClick = (number: number) => {
    setActiveTab(number);
  };

  const auxPosts = splitUp(posts, posts.length / 55);

  const items = [];
  for (let number = 1; number <= auxPosts.length; number++) {
    items.push(
      // <Pagination.Item
      //   key={number}
      //   active={number === activeTab}
      //   onClick={() => handleClick(number)}
      // >
      //   {number}
      // </Pagination.Item>
    );
  }

  return (
    <div className="black-bg">
      <Container>
        <div className="paginationDiv">
          <Pagination className="pagination">{items}</Pagination>
        </div>

        <Row className="fluid" xs="auto">
          {auxPosts[activeTab - 1].map((post: any) => (
            <PostCard post={post} key={post.post_id} />
          ))}
        </Row>

        <div className="paginationDiv paginationBottom">
          <Pagination className="pagination">{items}</Pagination>
        </div>
      </Container>
    </div>
  );
}

export default PostsPanel;
