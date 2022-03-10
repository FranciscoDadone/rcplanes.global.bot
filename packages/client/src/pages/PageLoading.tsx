import { Spinner } from 'react-bootstrap';
import '../assets/css/PageLoading.css';

function PageLoading() {
  return (
    <div className="black-bg loading">
      <h1 className="loading-tag">Loading content...</h1>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export default PageLoading;
