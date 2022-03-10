import { Spinner } from 'react-bootstrap';

export default function AppStatus(props: { status: string }) {
  const { status } = props;
  if (status !== 'Idling...') {
    return (
      <div>
        <h5>
          <Spinner animation="border" role="status" size="sm">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          {` ${status}`}
        </h5>
      </div>
    );
  }
  return (
    <div>
      <h5>{status}</h5>
    </div>
  );
}
