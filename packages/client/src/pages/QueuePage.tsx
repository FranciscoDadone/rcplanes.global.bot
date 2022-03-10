import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import {
  faArrowDownLong,
  faArrowUpLong,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Media from '../components/Media';
import '../assets/css/QueuePage.css';
import EditModal from '../components/EditModal';
import PageLoading from './PageLoading';

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
      // ipcRenderer.invoke('getQueue').then((data) => {
      //   if (isMounted) {
      //     setQueuedPosts(data);
      //   }
      // });
    }
    return () => {
      isMounted = false;
    };
  }, [queuedPosts]);

  if (queuedPosts[0].owner === '') {
    return <PageLoading />;
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
    // ipcRenderer.send('updateQueue', {
    //   r1: queuedPosts[index],
    //   r2: queuedPosts[index - 1],
    // });
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
    // ipcRenderer.send('updateQueue', {
    //   r1: queuedPosts[index],
    //   r2: queuedPosts[index + 1],
    // });
  };

  // ipcRenderer.on('hideEditModalToRenderer', (_ev, args) => {
  //   const aux = queuedPosts;
  //   const postIndex = queuedPosts.indexOf(
  //     queuedPosts.filter((p) => p.id === args.id)[0]
  //   );
  //   if (!args.deleted) {
  //     aux[postIndex].caption = args.caption;
  //   } else {
  //     aux.splice(postIndex, 1);
  //   }
  //   setQueuedPosts(aux);
  //   setShowModal(false);
  // });

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
