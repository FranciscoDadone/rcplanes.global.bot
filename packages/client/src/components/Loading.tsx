import { Spinner } from 'react-bootstrap';
import '../assets/css/Loading.css';

function Loading(props: { text: string; spinner?: boolean }) {
  const { text, spinner } = props;
  if (spinner) {
    return (
      <div className="black-bg loading">
        <h1 className="loading-tag">{text}</h1>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  return (
    <div className="black-bg loading">
      <h1 className="loading-tag">{text}</h1>
    </div>
  );
}

Loading.defaultProps = {
  spinner: false,
};

export default Loading;
