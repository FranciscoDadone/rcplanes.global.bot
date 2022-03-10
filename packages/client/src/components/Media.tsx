function Media(props: {
  mediaType: string;
  media: string;
  autoplay: boolean;
  videoWidth?: string;
  videoMinWidth?: string;
  imageWidth?: string;
  imageMinWidth?: string;
}) {
  const {
    mediaType,
    media,
    autoplay,
    videoWidth,
    videoMinWidth,
    imageWidth,
    imageMinWidth,
  } = props;

  if (mediaType === 'VIDEO') {
    return (
      <div>
        <video
          className="video"
          autoPlay={autoplay}
          controls
          style={{ minWidth: videoMinWidth, width: videoWidth }}
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
};

export default Media;
