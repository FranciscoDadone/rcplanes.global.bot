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
  const [activeTab, setActiveTab] = useState(1);
  const [auxPosts, setAuxPosts] = useState(splitUp(posts, posts.length / 55));

  if (posts === undefined) return <div />;

  const handleClick = (number: number) => {
    setActiveTab(number);
  };

  if (posts !== undefined && posts.length !== 0) {
    const items: any = [];
    for (let number = 1; number <= auxPosts.length; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === activeTab}
          onClick={() => handleClick(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    const updateArray = () => {
      axios.get('/api/fetchedPosts').then((data) => {
        setAuxPosts(splitUp(data.data, data.data.length / 55));
      });
    };

    return (
      <div className="black-bg">
        <Container>
          <div className="paginationDiv">
            <Pagination className="pagination">{items}</Pagination>
          </div>

          <Row className="fluid" xs="auto">
            {auxPosts[activeTab - 1].map((post: any) => (
              <PostCard
                post={post}
                key={post.post_id}
                updateList={updateArray}
              />
            ))}
          </Row>

          <div className="paginationDiv paginationBottom">
            <Pagination className="pagination">{items}</Pagination>
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
