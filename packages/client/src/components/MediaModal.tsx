import { Modal, Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import path from 'path';
import Media from './Media';

const STORAGE_PATH = process.env.NODE_ENV
  ? path.join(__dirname, '../../../../../../storage')
  : '';

function MediaModal(props: {
  show: boolean;
  post: any;
  media: any;
  mediaType: string;
}) {
  const { show, post, media, mediaType } = props;
  const [caption, setCaption] = useState<string>();
  const [mediaModal, setMediaModal] = useState(media);

  useEffect(() => {
    let isMounted = true;
    // ipcRenderer.invoke('getGeneralConfig').then((data) => {
    //   if (isMounted && caption === undefined) {
    //     const captionFormatted = data.description_boilerplate
    //       .replace('%description%', post.caption)
    //       .replace('%username%', post.username)
    //       .replace('%post_link%', post.permalink);
    //     setCaption(captionFormatted);
    //   }
    // });
    return () => {
      isMounted = false;
    };
  });

  const handleClose = () => {
    // ipcRenderer.invoke('hideModal');
  };

  const handleDelete = () => {
    // ipcRenderer
    //   .invoke('deletePost', {
    //     id: post.post_id,
    //     mediaType,
    //   })
    //   .then(() => {
    //     handleClose();
    //   });
  };

  const handleQueue = () => {
    handleClose();
    // ipcRenderer
    //   .invoke('addToQueue', {
    //     id: post.post_id,
    //     media: mediaModal,
    //     mediaType,
    //     caption,
    //     owner: post.username,
    //   })
    //   .catch((err) => {
    //     throw new Error(`Error queueing media: ${err}`);
    //   });
  };

  const postProcessUsernameInImg = (username: string) => {
    if (show && post.media_type === 'IMAGE') {
    //   ipcRenderer
    //     .invoke('postProcessImage', {
    //       path: `${STORAGE_PATH}/${post.storage_path}`,
    //       username,
    //     })
    //     .then((res) => {
    //       setMediaModal(res);
    //     });
    }
  };
  if (mediaModal === media) postProcessUsernameInImg(post.username);

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
              <Media mediaType={mediaType} media={mediaModal} autoplay />
              <div style={{ display: 'flex' }}>
                <div>
                  <ul>
                    <li>Owner: {post.username}</li>
                    <li>ID: {post.post_id}</li>
                    <li>Hashtag: {post.hashtag}</li>
                  </ul>
                </div>
                <div>
                  <ul>
                    <li>Fetched: {post.date}</li>
                    <li>Type: {post.media_type}</li>
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
          <Button variant="danger" onClick={handleDelete}>
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
