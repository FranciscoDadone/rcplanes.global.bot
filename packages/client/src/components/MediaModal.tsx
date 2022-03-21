import { Modal, Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Media from './Media';
import Loading from './Loading';
import '../assets/css/MediaModal.css';

function MediaModal(props: {
  show: boolean;
  post: any;
  media: any;
  mediaType: string;
  handleClose: any;
  handleDelete: any;
}) {
  const { show, post, media, mediaType, handleClose, handleDelete } = props;
  const [caption, setCaption] = useState<string>();
  const [mediaModal, setMediaModal] = useState(media);
  const [usernameInImg, setUsernameInImg] = useState(post.username);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    axios.get('api/general/general_config').then((data) => {
      if (isMounted && caption === undefined) {
        const captionFormatted = data.data.descriptionBoilerplate
          .replace('%description%', post.caption)
          .replace('%username%', post.username)
          .replace('%post_link%', post.permalink);
        setCaption(captionFormatted);
      }
    });
    return () => {
      isMounted = false;
    };
  });

  const sendDelete = () => {
    handleDelete();
    handleClose();
  };

  const handleQueue = () => {
    setLoading(true);
    axios
      .post('api/posts/queue', {
        data: {
          id: post.postId,
          mediaPath: post.storagePath,
          usernameInImg,
          mediaType,
          caption,
          owner: post.username,
        },
      })
      .then((code) => {
        if (code.status !== 200) console.log('Error while queueing media.');
        else {
          setLoading(false);
          handleClose();
        }
      });
  };

  const postProcessUsernameInImg = (username: string) => {
    if (show && post.mediaType === 'IMAGE') {
      axios
        .get('api/post_process_image', {
          params: {
            image: post.storagePath,
            username,
          },
        })
        .then((data) => {
          setMediaModal(data.data);
          setUsernameInImg(username);
        });
    }
  };
  if (mediaModal === media) postProcessUsernameInImg(post.username);

  if (loading) {
    return (
      <Modal show={show} onHide={handleClose} fullscreen className="modal">
        <Modal.Header closeButton>
          <Modal.Title>
            Post from: @{post.username} (#{post.hashtag})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#282c34' }}>
          <Loading text="Queueing media..." spinner />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled>
            Close
          </Button>
          <Button variant="danger" disabled>
            Delete
          </Button>
          <Button variant="success" disabled>
            ✉️ Queue media
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
  return (
    <>
      <Modal show={show} onHide={handleClose} fullscreen className="modal">
        <Modal.Header closeButton>
          <Modal.Title>
            Post from: @{post.username} (#{post.hashtag})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#282c34' }}>
          <div className="modal-container">
            <div className="modal-image">
              <Media
                mediaType={mediaType}
                media={mediaModal}
                autoplay
                imageMinWidth="60vh"
              />
              <div style={{ display: 'flex' }}>
                <div>
                  <ul>
                    <li>Owner: {post.username}</li>
                    <li>ID: {post.postId}</li>
                    <li>Hashtag: {post.hashtag}</li>
                  </ul>
                </div>
                <div>
                  <ul>
                    <li>Fetched: {post.date}</li>
                    <li>Type: {post.mediaType}</li>
                    <li>Link: {post.permalink}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', paddingLeft: '1rem' }}>
              <Form>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    defaultValue={post.username}
                    onChange={(e) => {
                      postProcessUsernameInImg(e.target.value);
                    }}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Caption</Form.Label>
                  <Form.Control
                    as="textarea"
                    defaultValue={caption}
                    rows={16}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={sendDelete}>
            Delete
          </Button>
          <Button variant="success" onClick={handleQueue}>
            ✉️ Queue media
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MediaModal;
