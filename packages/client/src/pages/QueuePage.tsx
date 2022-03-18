import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import {
  faArrowDownLong,
  faArrowUpLong,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Media from '../components/Media';
import '../assets/css/QueuePage.css';
import EditModal from '../components/EditModal';
import Loading from '../components/Loading';

function QueuePage() {
  const [queuedPosts, setQueuedPosts] = useState<
    [
      {
        id: number;
        caption: string;
        media: string;
        mediaType: string;
        owner: string;
      }
    ]
  >([
    {
      id: 0,
      caption: '',
      media: '',
      mediaType: '',
      owner: '',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showId, setShowId] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (queuedPosts === undefined || queuedPosts[0].mediaType === '') {
      axios.get('/api/queue/queue').then((data) => {
        if (isMounted) setQueuedPosts(data.data);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [queuedPosts]);

  if (queuedPosts[0].owner === '') {
    return <Loading text="Loading queue..." spinner />;
  }

  const handleUp = (post: {
    id: number;
    caption: string;
    media: string;
    mediaType: string;
    owner: string;
  }) => {
    const arr: any = [];
    let index = 0;
    for (let i = 0; i < queuedPosts.length; i++) {
      if (post === queuedPosts[i]) {
        index = i;
      }
      arr.push(queuedPosts[i]);
    }
    if (index - 1 < 0) return;
    const aux = arr[index];
    arr[index] = {
      id: arr[index].id,
      caption: arr[index - 1].caption,
      media: arr[index - 1].media,
      mediaType: arr[index - 1].mediaType,
      owner: arr[index - 1].owner,
    };
    arr[index - 1] = {
      id: arr[index - 1].id,
      caption: aux.caption,
      media: aux.media,
      mediaType: aux.mediaType,
      owner: aux.owner,
    };

    setQueuedPosts(arr);
    axios.post('/api/queue/swap', {
      data: {
        id1: queuedPosts[index].id,
        id2: queuedPosts[index - 1].id,
      },
    });
  };

  const handleDown = (post: {
    id: number;
    caption: string;
    media: string;
    mediaType: string;
    owner: string;
  }) => {
    const arr: any = [];
    let index = 0;
    for (let i = 0; i < queuedPosts.length; i++) {
      if (post === queuedPosts[i]) {
        index = i;
      }
      arr.push(queuedPosts[i]);
    }
    if (index + 1 >= queuedPosts.length) return;
    const aux = arr[index];
    arr[index] = {
      id: arr[index].id,
      caption: arr[index + 1].caption,
      media: arr[index + 1].media,
      mediaType: arr[index + 1].mediaType,
      owner: arr[index + 1].owner,
    };
    arr[index + 1] = {
      id: arr[index + 1].id,
      caption: aux.caption,
      media: aux.media,
      mediaType: aux.mediaType,
      owner: aux.owner,
    };
    setQueuedPosts(arr);
  };

  const refreshQueue = (post: any, type: string) => {
    const aux = queuedPosts;

    const ret: any = [];
    if (type === 'DELETE') {
      const postIndex = queuedPosts.indexOf(
        queuedPosts.filter((p) => p.id === post.id)[0]
      );
      const aux2 = aux.splice(postIndex, 1);
      for (let i = 0; i < aux.length; i++) {
        if (aux[i] !== aux2[0]) ret.push(aux[i]);
      }
    } else if (type === 'UPDATE') {
      for (let i = 0; i < aux.length; i++) {
        if (aux[i].id === post.id) {
          ret.push({
            id: post.id,
            caption: post.caption,
            owner: aux[i].owner,
            media: aux[i].media,
            mediaType: aux[i].mediaType,
          });
        } else {
          ret.push(aux[i]);
        }
      }
    }
    setQueuedPosts(ret);
  };

  const handleEdit = (post: {
    id: number;
    caption: string;
    media: string;
    mediaType: string;
    owner: string;
  }) => {
    setShowModal(true);
    setShowId(post.id.toString());
  };

  return (
    <>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>#</th>
            <th>Preview</th>
            <th>Id</th>
            <th>Owner</th>
            <th>Media Type</th>
            <th>Caption</th>
            <th>&nbsp;</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {queuedPosts?.map((post, index) => (
            <tr key={post.id}>
              <td>&nbsp;</td>
              <td>{index}</td>
              <td className="media-container">
                <Media
                  mediaType={post.mediaType}
                  media={post.media}
                  autoplay={false}
                  imageWidth="20%"
                  imageMinWidth="10vw"
                  videoWidth="20%"
                  videoMinWidth="10vw"
                />
              </td>
              <td className="vertical-middle">{post.id}</td>
              <td className="vertical-middle">{post.owner}</td>
              <td className="vertical-middle">{post.mediaType}</td>
              <td>{post.caption}</td>
              <th className="vertical-middle">
                <Button variant="primary" onClick={() => handleUp(post)}>
                  <FontAwesomeIcon icon={faArrowUpLong} />
                </Button>
                <Button variant="primary" onClick={() => handleDown(post)}>
                  <FontAwesomeIcon icon={faArrowDownLong} />
                </Button>
              </th>
              <th className="vertical-middle">
                <Button variant="warning" onClick={() => handleEdit(post)}>
                  Edit
                </Button>
                <EditModal
                  show={showModal}
                  post={post}
                  showId={showId}
                  key={`${post.id}${post.owner}`}
                  handleClose={() => setShowModal(false)}
                  refreshQueue={refreshQueue}
                />
              </th>
              <th>&nbsp;</th>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default QueuePage;
