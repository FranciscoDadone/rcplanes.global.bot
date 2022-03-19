import axios from 'axios';
import { useState } from 'react';
import { Form, Button, Container, Image } from 'react-bootstrap';
import '../assets/css/LoginPage.css';
import icon from '../assets/images/icon.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    axios({
      method: 'post',
      data: {
        username,
        password,
      },
      withCredentials: true,
      url: '/auth/login',
    }).then((res) => {
      console.log(res);
      if (res.data === 'SUCCESS') {
        window.location.href = '/';
      }
    });
  };

  return (
    <Container className="main-container">
      <Container style={{ textAlign: 'center' }}>
        <br />
        <h1>Log-in</h1>
        <br />
        <hr />
        <br />
        <Image src={icon} fluid roundedCircle />
        <h4>RcPlanesGlobal</h4>
      </Container>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="on"
          />
        </Form.Group>
        <Button variant="primary" type="submit" onClick={login}>
          Submit
        </Button>
      </Form>
    </Container>
  );
}

export default LoginPage;
