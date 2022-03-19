import axios from 'axios';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import '../assets/css/LogsPage.css';

function LogsPage() {
  const [logs, setLogs] = useState('');

  useEffect(() => {
    let isMounted = true;
    axios.get('/api/general/stdout').then((res) => {
      if (isMounted) setLogs(res.data);
    });
    return () => {
      isMounted = false;
    };
  });

  return (
    <Container className="main-container">
      <h1>Latests logs</h1>
      <Container className="console" style={{ whiteSpace: 'pre-wrap' }}>
        {logs.replaceAll('[39m', '').replaceAll('[32m', '').replaceAll('[33m', '')}
      </Container>
    </Container>
  );
}

export default LogsPage;
