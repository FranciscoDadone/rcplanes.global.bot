import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
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
  videoDuration: number;
  showDelete?: boolean;
  deleteFromStorageOnClose?: boolean;
  refreshQueue?: any;
}) {
  const {
    show,
    post,
    media,
    mediaType,
    handleClose,
    handleDelete,
    videoDuration,
    showDelete,
    deleteFromStorageOnClose,
    refreshQueue,
  } = props;
  const [caption, setCaption] = useState<string>();
  const [mediaModal, setMediaModal] = useState(media);
  const [usernameInImg, setUsernameInImg] = useState(post.username);
  const [loading, setLoading] = useState(false);
  const [postAsReel, setPostAsReel] = useState(true);
  const [slider, setSlider] = useState([0, 59]);

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
  if (
    (mediaModal.includes('/storage') || mediaModal === '') &&
    show &&
    post.mediaType === 'IMAGE'
  )
    postProcessUsernameInImg(usernameInImg);

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

  const handleQueue = async () => {
    setLoading(true);
    if (
      (post.mediaType === 'VIDEO' || post.mediaType === 'REEL') &&
      videoDuration > 60
    ) {
      const trim = await axios.post('api/general/trim_video', {
        data: {
          path: `storage/${post.storagePath}`,
          start: slider[0],
          end: slider[1],
        },
      });
      if (trim.data !== 'SUCCESS') return;
    }
    await axios
      .post('api/posts/queue', {
        data: {
          id: post.postId,
          mediaPath: post.storagePath,
          usernameInImg,
          mediaType: mediaType === 'VIDEO' && postAsReel ? 'REEL' : mediaType,
          caption,
          owner: usernameInImg,
        },
      })
      .then((code) => {
        if (code.status !== 200) console.log('Error while queueing media.');
        else {
          setLoading(false);
          handleClose();
        }
      });
    setMediaModal('');
    setUsernameInImg('');
    if (deleteFromStorageOnClose) refreshQueue();
  };

  const handleSliderChange = (e) => {
    const start = e[0];
    const end = e[1];
    const duration = end - start;

    if (duration > 10 && duration < 60) setSlider(e);
  };

  const handleCloseIntern = () => {
    setMediaModal('');
    setUsernameInImg('');
    if (deleteFromStorageOnClose) {
      const fileName = media.includes('/') ? media.split('/')[2] : media;
      axios.post('/api/general/delete_from_storage', {
        data: {
          fileName,
        },
      });
    }
    handleClose();
  };

  if (loading || media === '' || post.storagePath === '') {
    return (
      <Modal
        show={show}
        onHide={handleCloseIntern}
        fullscreen
        className="modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Post from: @{usernameInImg} (#{post.hashtag})
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
      <Modal
        show={show}
        onHide={handleCloseIntern}
        fullscreen
        className="modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Post from: @{post.username} (#{post.hashtag})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#282c34' }}>
          <div className="modal-container">
            <div className="modal-image">
              <div style={videoDuration > 59 ? {} : { display: 'none' }}>
                <h4 className="center">
                  This video is too long, please trim it
                </h4>
                <div className="slider-container">
                  <div className="slider-time">
                    {Math.floor(slider[0] / 60) < 10
                      ? `0${Math.floor(slider[0] / 60)}`
                      : Math.floor(slider[0] / 60)}
                    :
                    {slider[0] - Math.floor(slider[0] / 60) * 60 < 10
                      ? `0${slider[0] - Math.floor(slider[0] / 60) * 60}`
                      : slider[0] - Math.floor(slider[0] / 60) * 60}
                  </div>
                  <Slider
                    range
                    allowCross={false}
                    defaultValue={[0, 60]}
                    onChange={handleSliderChange}
                    value={slider}
                    max={videoDuration}
                    pushable
                    draggableTrack
                  />
                  <div className="slider-time">
                    {Math.floor(slider[1] / 60) < 10
                      ? `0${Math.floor(slider[1] / 60)}`
                      : Math.floor(slider[1] / 60)}
                    :
                    {slider[1] - Math.floor(slider[1] / 60) * 60 < 10
                      ? `0${slider[1] - Math.floor(slider[1] / 60) * 60}`
                      : slider[1] - Math.floor(slider[1] / 60) * 60}
                  </div>
                </div>
                <div className="center">Duration: {slider[1] - slider[0]}s</div>
              </div>
              <Media
                mediaType={mediaType}
                media={post.mediaType === 'IMAGE' ? mediaModal : media}
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
                <Row>
                  <Col>
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={post.username}
                        onChange={(e) => {
                          setUsernameInImg(e.target.value);
                          postProcessUsernameInImg(e.target.value);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Form.Group as={Col} md="3">
                    <Form.Check
                      type="switch"
                      name="postAsReel"
                      label="Post as reel"
                      defaultChecked
                      style={
                        post.mediaType !== 'VIDEO' ? { display: 'none' } : {}
                      }
                      className="postAsReel"
                      onClick={() => setPostAsReel(!postAsReel)}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Col>
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
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseIntern}>
            Close
          </Button>
          <Button
            variant="danger"
            onClick={sendDelete}
            style={{ display: showDelete ? 'block' : 'none' }}
          >
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

MediaModal.defaultProps = {
  showDelete: true,
  deleteFromStorageOnClose: false,
  refreshQueue: {},
};

export default MediaModal;
