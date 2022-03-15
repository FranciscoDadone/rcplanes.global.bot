import { useState } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEarthAmerica,
  faGear,
  faDatabase,
  faList,
  faCircleInfo,
  faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AppStatus from './AppStatus';
import ExplorePage from '../pages/ExplorePage';
import ConfigurationPage from '../pages/ConfigurationPage';
import DatabasePage from '../pages/DatabasePage';
import QueuePage from '../pages/QueuePage';
import InfoPage from '../pages/InfoPage';
import appIcon from '../assets/images/icon.png';
import '../assets/css/AppNavbar.css';

export default function AppNavbar() {
  const [Status, setStatus] = useState('Booting up...');
  const [Component, setComponent] = useState(<ExplorePage />);

  const logout = () => {
    axios.get('/auth/logout').then((res) => {
      if (res.data === 'SUCCESS') {
        window.location.href = '/';
      }
    });
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" fixed="top" expand="lg">
        <Container fluid>
          <Navbar.Brand
            className="navBrand"
            href="https://www.instagram.com/rcplanes.global/"
          >
            <img src={appIcon} alt="App icon" className="navbarBrand" />
            &nbsp;&nbsp;RcPlanesBot
          </Navbar.Brand>
          <div className="verticalLine" />
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
              variant="pills"
            >
              <Nav.Link onClick={() => setComponent(<ExplorePage />)}>
                <FontAwesomeIcon icon={faEarthAmerica} />
                &nbsp;Explore
              </Nav.Link>
              <Nav.Link onClick={() => setComponent(<ConfigurationPage />)}>
                <FontAwesomeIcon icon={faGear} />
                &nbsp;Configuration
              </Nav.Link>
              <Nav.Link onClick={() => setComponent(<DatabasePage />)}>
                <FontAwesomeIcon icon={faDatabase} />
                &nbsp;Database
              </Nav.Link>
              <Nav.Link onClick={() => setComponent(<QueuePage />)}>
                <FontAwesomeIcon icon={faList} />
                &nbsp;Queue
              </Nav.Link>
              <Nav.Link onClick={() => setComponent(<InfoPage />)}>
                <FontAwesomeIcon icon={faCircleInfo} />
                &nbsp;Info
              </Nav.Link>
              <Nav.Link onClick={logout}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                &nbsp;Logout
              </Nav.Link>
            </Nav>
            <Navbar.Text>
              <AppStatus status={Status} />
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div
        style={{
          marginTop: '4rem',
          backgroundColor: '#282c34',
          color: 'white',
        }}
      >
        {Component}
      </div>
    </>
  );
}
