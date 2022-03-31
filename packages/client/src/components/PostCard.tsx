import { Card, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/css/PostCard.css';
import MediaModal from './MediaModal';
import videoImg from '../assets/images/video.png';

function PostCard(props: { post: any; updateList: any }) {
  const { post, updateList } = props;

  let previewSrc = `/storage/${post.storagePath}`;

  const [show, setShow] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (show && post.mediaType === 'VIDEO') {
      axios
        .post('api/general/video_duration', {
          data: {
            path: post.storagePath,
          },
        })
        .then((res) => {
          if (isMounted) setVideoDuration(parseInt(res.data, 10));
        });
    }
    return () => {
      isMounted = false;
    };
  });

  const handleShow = () => {
    setShow(true);
  };

  const handleDelete = () => {
    axios.delete('/api/posts/delete', {
      params: {
        postId: post.postId,
        mediaType: post.mediaType,
      },
    });
    updateList();
  };

  const handleClose = () => {
    setShow(false);
    updateList();
  };

  if (post === undefined) return <div />;

  if (post.mediaType === 'VIDEO') {
    previewSrc = videoImg;
  }

  return (
    <>
      <div className="cardStyle">
        <Card
          style={{
            width: '18rem',
            height: '29rem',
          }}
          bg="dark"
          border="light"
        >
          <Card.Header className="mb-2">@{post.username}</Card.Header>
          <Card.Body
            className="container"
            style={{ cursor: 'pointer' }}
            onClick={handleShow}
          >
            <Card.Img variant="top" src={previewSrc} />
          </Card.Body>
          <Card.Footer>
            <div className="footer-container">
              <div>
                <small className="text-muted">Fetched: {post.date}</small>
              </div>
              <div className="trashcan">
                <Button variant="danger" onClick={handleDelete}>
                  <img
                    src="https://img.icons8.com/ios-glyphs/25/000000/trash--v1.png"
                    alt="trash can"
                  />
                </Button>
              </div>
            </div>
          </Card.Footer>
        </Card>
      </div>
      <MediaModal
        show={show}
        post={post}
        media={`/storage/${post.storagePath}`}
        mediaType={post.mediaType}
        handleClose={handleClose}
        handleDelete={handleDelete}
        videoDuration={
          post.mediaType === 'VIDEO' || post.mediaType === 'REEL'
            ? videoDuration
            : 0
        }
      />
    </>
  );
}

export default PostCard;
