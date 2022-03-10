import { Card, Button } from 'react-bootstrap';
import { useState } from 'react';
import path from 'path';
import '../assets/css/PostCard.css';
import MediaModal from './MediaModal';

const STORAGE_PATH = process.env.NODE_ENV
  ? path.join(__dirname, '../../../../../../storage')
  : '';

function PostCard(props: any) {
  const { post } = props;

  let previewSrc = `file://${STORAGE_PATH}/${post.storage_path}`;

  const [show, setShow] = useState(false);
  const handleShow = () => {
    setShow(true);
  };
  // ipcRenderer.on('hideModalToRenderer', (_ev, s) => {
  //   setShow(s);
  // });

  const handleDelete = () => {
    // ipcRenderer.invoke('deletePost', {
    //   id: post.post_id,
    //   mediaType: post.media_type,
    // });
  };

  if (post === undefined) return <div />;

  if (post.media_type === 'VIDEO') {
    previewSrc = `file://${path.join(
      STORAGE_PATH,
      '../assets/images/video.png'
    )}`;
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
        media={`file://${STORAGE_PATH}/${post.storage_path}`}
        mediaType={post.media_type}
      />
    </>
  );
}

export default PostCard;
