function Media(props: {
  mediaType: string;
  media: string;
  autoplay: boolean;
  videoWidth?: string;
  videoMinWidth?: string;
  videoMaxHeight?: string;
  imageWidth?: string;
  imageMinWidth?: string;
}) {
  const {
    mediaType,
    media,
    autoplay,
    videoWidth,
    videoMinWidth,
    videoMaxHeight,
    imageWidth,
    imageMinWidth,
  } = props;
  if (mediaType === 'VIDEO' || mediaType === 'REEL') {
    return (
      <div>
        <video
          className="video"
          autoPlay={autoplay}
          controls
          style={{
            minWidth: videoMinWidth,
            width: videoWidth,
            maxHeight: videoMaxHeight || '70vh',
            height: '70vh',
          }}
        >
          <source src={media} type="video/mp4" />
        </video>
      </div>
    );
  }
  return (
    <div>
      <img
        src={media}
        alt="img"
        className="image"
        style={{ minWidth: imageMinWidth, width: imageWidth }}
      />
    </div>
  );
}

Media.defaultProps = {
  videoWidth: '50%',
  videoMinWidth: '43vw',
  imageWidth: '40%',
  imageMinWidth: '40vw',
  videoMaxHeight: '70vh',
};

export default Media;
