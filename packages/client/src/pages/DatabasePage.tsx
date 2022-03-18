import { Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../components/Loading';

interface DataType {
  postId: string;
  date: string;
  hashtag: string;
  mediaType: string;
  permalink: string;
  childrenOf: string;
  status: string;
  username: string;
}

function DatabasePage() {
  const [posts1, setPosts1] = useState<[DataType]>();

  useEffect(() => {
    let isMounted = true;
    if (posts1 === undefined) {
      axios.get('/api/all_fetched_posts').then((res) => {
        if (isMounted) setPosts1(res.data);
      });
    }
    return () => {
      isMounted = false;
    };
  });

  let arr: [DataType] = [
    {
      postId: '',
      date: '',
      hashtag: '',
      mediaType: '',
      permalink: '',
      childrenOf: '',
      status: '',
      username: '',
    },
  ];
  if (posts1 !== undefined) arr = posts1;

  if (arr[0].postId === '')
    return <Loading text="Loading database..." spinner />;

  return (
    <>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Date fetched</th>
            <th>Id</th>
            <th>Hashtag</th>
            <th>Media Type</th>
            <th>Link</th>
            <th>Children of</th>
            <th>Status</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          {arr.map((post, index) => (
            <tr key={post.postId}>
              <td>{index}</td>
              <td>{post.date}</td>
              <td>{post.postId}</td>
              <td>{post.hashtag}</td>
              <th>{post.mediaType}</th>
              <th>{post.permalink}</th>
              <th>{post.childrenOf}</th>
              <th>{post.status}</th>
              <th>{post.username}</th>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default DatabasePage;
