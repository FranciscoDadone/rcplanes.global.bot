import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import '../assets/css/LogsPage.css';

function LogsPage() {
  const [logs, setLogs] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      while (isMounted) {
        axios.get('/api/general/stdout').then((res) => {
          setLogs(res.data);
        });
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    })();
    return () => {
      isMounted = false;
    };
  });

  const messagesEndRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  return (
    <Container className="main-container">
      <h1>Latests logs</h1>
      <Container className="console">
        {logs.replaceAll('[39m', '').replaceAll('[32m', '').replaceAll('[33m', '')}
        <div ref={messagesEndRef} />
      </Container>
    </Container>
  );
}

export default LogsPage;
