import { useEffect, useState, useRef } from 'react';
import { Button, Table, Container } from 'react-bootstrap';
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
import MediaModal from '../components/MediaModal';

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
  const inputCustomPost = useRef<any>(null);
  const [newPostModal, setNewPostModal] = useState({
    filename: '',
    mimetype: '',
  });
  const mediaType = newPostModal.mimetype.includes('image/')
    ? 'IMAGE'
    : 'VIDEO';

  useEffect(() => {
    let isMounted = true;
    if (!queuedPosts || !queuedPosts[0] || queuedPosts[0].mediaType === '') {
      axios.get('/api/queue/queue').then((data) => {
        if (isMounted) setQueuedPosts(data.data);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [queuedPosts]);

  if (queuedPosts[0] && queuedPosts[0].owner === '') {
    return <Loading text="Loading queue..." spinner />;
  }

  if (!queuedPosts[0]) {
    return <Loading text="Empty queue" />;
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

    let ret: any = [];
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
            owner: post.username,
            media: aux[i].media,
            mediaType: aux[i].mediaType,
          });
        } else {
          ret.push(aux[i]);
        }
      }
    } else if (type === 'REFRESH') {
      axios.get('/api/queue/queue').then((data) => {
        ret = data.data;
      });
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

  const handleAddCustomPost = () => {
    inputCustomPost?.current.click();
  };

  const inputChangeEvent = (e) => {
    const file = e.target.files[0];

    const data = new FormData();
    data.append('file', file);
    axios.post('/api/queue/upload', data).then(async (res) => {
      if (res.statusText === 'OK') {
        setNewPostModal(res.data);
      }
    });
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
              <td style={{ wordBreak: 'break-word' }}>{post.caption}</td>
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
      <Container className="customPostBtn">
        <br />
        <br />
        <hr />
        <Button variant="primary" onClick={handleAddCustomPost}>
          Upload custom post
        </Button>
        <hr />
      </Container>
      <input
        type="file"
        id="file"
        ref={inputCustomPost}
        onChange={(e) => inputChangeEvent(e)}
        accept="image/*,video/*"
        style={{ display: 'none' }}
      />
      <MediaModal
        show={newPostModal.filename !== ''}
        post={{
          username: '',
          mediaType,
          storagePath: newPostModal.filename,
          caption: '',
          permalink: '',
          postId: 0,
        }}
        media={`/storage/${newPostModal.filename}`}
        mediaType={mediaType}
        handleClose={() =>
          setNewPostModal({
            filename: '',
            mimetype: '',
          })
        }
        handleDelete={() => {}}
        videoDuration={0}
        showDelete={false}
        deleteFromStorageOnClose
        refreshQueue={() => refreshQueue({}, 'REFRESH')}
      />
    </>
  );
}

export default QueuePage;
