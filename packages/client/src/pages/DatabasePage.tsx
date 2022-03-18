import { Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Loading from '../components/Loading';

interface DataType {
  post_id: string;
  date: string;
  hashtag: string;
  media_type: string;
  permalink: string;
  children_of: string;
  status: string;
  username: string;
}

function DatabasePage() {
  const [posts1, setPosts1] = useState<[DataType]>();

  useEffect(() => {
    let isMounted = true;
    // if (posts1 === undefined) {
    //   ipcRenderer.invoke('getAllPosts').then((data) => {
    //     if (isMounted) setPosts1(data);
    //   });
    // }
    return () => {
      isMounted = false;
    };
  });

  let arr: [DataType] = [
    {
      post_id: '',
      date: '',
      hashtag: '',
      media_type: '',
      permalink: '',
      children_of: '',
      status: '',
      username: '',
    },
  ];
  if (posts1 !== undefined) arr = posts1;

  if (arr[0].post_id === '')
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
            <tr key={post.post_id}>
              <td>{index}</td>
              <td>{post.date}</td>
              <td>{post.post_id}</td>
              <td>{post.hashtag}</td>
              <th>{post.media_type}</th>
              <th>{post.permalink}</th>
              <th>{post.children_of}</th>
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
