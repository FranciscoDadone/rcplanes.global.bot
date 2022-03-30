import {
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Container,
  FormControl,
  Alert,
} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/css/ConfigurationPage.css';

function ConfigurationPage() {
  const [validated, setValidated] = useState(false);
  const [hashtagsToFetch, setHashtagsToFetch] = useState<
    [{ id: number; hashtag: string }]
  >([{ id: 0, hashtag: 'null' }]);
  const [addHashtagState, setAddHashtagState] = useState<string>('');
  const [authenticationState, setauthenticationState] = useState<{
    username: string;
    password: string;
    authenticator: string;
    fbId: string;
    accessToken: string;
    clientSecret: string;
    clientId: string;
  }>();
  const [configState, setConfigState] = useState<{
    uploadRate: number | undefined;
    descriptionBoilerplate: string | undefined;
    hashtagFetchingEnabled: boolean | undefined;
    autoPosting: boolean | undefined;
  }>();
  const [appStatus, setAppStatus] = useState('Idling...');
  const [credentialsState, setCredentialsState] = useState<{
    username: string;
  }>();
  const [credentialsError, setCredentialsError] = useState<string>('');
  const [credentialsSuccess, setCredentialsSuccess] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      while (isMounted) {
        setAppStatus(global.appStatus);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (configState === undefined || configState.uploadRate === -1) {
      axios.get('/api/general/general_config').then((res) => {
        if (isMounted) setConfigState(res.data);
      });
    }
    if (credentialsState === undefined) {
      axios.get('/api/user').then((res) => {
        setCredentialsState(res.data);
      });
    }
    if (
      hashtagsToFetch === undefined ||
      hashtagsToFetch[0].hashtag === 'null'
    ) {
      axios.get('/api/hashtags/hashtags').then((res) => {
        if (isMounted) setHashtagsToFetch(res.data);
      });
    }
    if (authenticationState === undefined) {
      axios.get('/api/general/credentials').then((res) => {
        if (isMounted)
          setauthenticationState({
            username: res.data.username,
            password: res.data.password,
            authenticator: '',
            fbId: res.data.fbId,
            accessToken: res.data.accessToken,
            clientSecret: res.data.clientSecret,
            clientId: res.data.clientId,
          });
      });
    }
    return () => {
      isMounted = false;
    };
  });

  const handleSubmitAuthentication = (event: any) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
    if (form.checkValidity()) {
      const formData = new FormData(form);
      const formDataObj = Object.fromEntries(formData.entries());
      axios.post('/api/general/set_credentials', {
        data: {
          username: formDataObj.username,
          password: formDataObj.password,
          authenticator: formDataObj.authenticator,
          fbId: formDataObj.fbId,
          accessToken: formDataObj.accessToken,
          clientSecret: formDataObj.clientSecret,
          clientId: formDataObj.clientId,
        },
      });
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const changeUploadRate = async (value: number) => {
    axios.post('/api/general/set_general_config', {
      data: {
        uploadRate: value,
        descriptionBoilerplate: configState?.descriptionBoilerplate,
        hashtagFetchingEnabled: configState?.hashtagFetchingEnabled,
        autoPosting: configState?.autoPosting,
      },
    });
    setConfigState({
      uploadRate: value,
      descriptionBoilerplate: configState?.descriptionBoilerplate,
      hashtagFetchingEnabled: configState?.hashtagFetchingEnabled,
      autoPosting: configState?.autoPosting,
    });
  };

  const changeFetchingEnabled = async () => {
    axios.post('/api/general/set_general_config', {
      data: {
        uploadRate: configState?.uploadRate,
        descriptionBoilerplate: configState?.descriptionBoilerplate,
        hashtagFetchingEnabled: !configState?.hashtagFetchingEnabled,
        autoPosting: configState?.autoPosting,
      },
    });
    setConfigState({
      uploadRate: configState?.uploadRate,
      descriptionBoilerplate: configState?.descriptionBoilerplate,
      hashtagFetchingEnabled: !configState?.hashtagFetchingEnabled,
      autoPosting: configState?.autoPosting,
    });
  };

  const changeAutoPosting = async () => {
    axios.post('/api/general/set_general_config', {
      data: {
        uploadRate: configState?.uploadRate,
        descriptionBoilerplate: configState?.descriptionBoilerplate,
        hashtagFetchingEnabled: configState?.hashtagFetchingEnabled,
        autoPosting: !configState?.autoPosting,
      },
    });
    setConfigState({
      uploadRate: configState?.uploadRate,
      descriptionBoilerplate: configState?.descriptionBoilerplate,
      hashtagFetchingEnabled: configState?.hashtagFetchingEnabled,
      autoPosting: !configState?.autoPosting,
    });
  };

  const saveDescriptionBoilerplate = async (event: any) => {
    const formData = new FormData(event?.currentTarget);
    const formDataObj = Object.fromEntries(formData.entries());
    axios.post('/api/general/set_general_config', {
      data: {
        uploadRate: configState?.uploadRate,
        descriptionBoilerplate: formDataObj.descriptionBoilerplate.toString(),
        hashtagFetchingEnabled: configState?.hashtagFetchingEnabled,
        autoPosting: configState?.autoPosting,
      },
    });
    setConfigState({
      uploadRate: configState?.uploadRate,
      descriptionBoilerplate: formDataObj.descriptionBoilerplate.toString(),
      hashtagFetchingEnabled: configState?.hashtagFetchingEnabled,
      autoPosting: configState?.autoPosting,
    });
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDeleteHashtag = (index: number) => {
    const hashtags: any = [];
    axios.delete('/api/hashtags/delete', {
      params: {
        hashtag: hashtagsToFetch[index].hashtag,
      },
    });
    hashtagsToFetch.forEach((h, i) => {
      if (i !== index) hashtags.push(h);
    });
    setHashtagsToFetch(hashtags);
  };

  const handleAddHashtag = () => {
    const aux = hashtagsToFetch;
    if (addHashtagState !== '') {
      let lastElem: any = { id: 0, hashtag: '' };
      if (hashtagsToFetch.length > 0) {
        lastElem = hashtagsToFetch[hashtagsToFetch.length - 1];
      }
      aux.push({
        id: lastElem.id + 1,
        hashtag: addHashtagState,
      });

      axios.post('/api/hashtags/add', {
        data: {
          hashtag: addHashtagState,
        },
      });
    }
    setHashtagsToFetch(aux);
    setAddHashtagState('');
  };

  const handleSubmitCredentialsChange = (event: any) => {
    const formData = new FormData(event?.currentTarget);
    const formDataObj = Object.fromEntries(formData.entries());
    if (formDataObj.newPassword1 === formDataObj.newPassword2) {
      if (formDataObj.newPassword1 === '')
        setCredentialsError('New passwords are blank!');
      else {
        const promise = axios.post(
          '/api/general/change_dashboard_credentials',
          {
            data: {
              oldPassword: formDataObj.oldPassword,
              newUsername: formDataObj.newUsername,
              newPassword: formDataObj.newPassword1,
            },
          }
        );
        promise.then((res) => {
          if (res.data === 'SUCCESS') {
            setCredentialsSuccess(
              'Successfully changed dashboard login information!'
            );
          } else {
            setCredentialsError('Incorrect password!');
          }
        });
        promise.catch((err) => {
          console.log(err);
        });
      }
    } else {
      setCredentialsError('Passwords missmatch!');
    }
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Container className="container">
      <hr />
      <h1>General configuration</h1>
      <Row className="mb-2">
        <Form>
          <Form.Group as={Col} md="2">
            <Form.Label>Upload rate in hours</Form.Label>
            <Form.Control
              required
              type="number"
              defaultValue={configState?.uploadRate}
              name="uploadRate"
              onChange={(e) => changeUploadRate(parseInt(e.target.value, 10))}
            />
          </Form.Group>

          <Form.Group as={Col} md="2">
            <Form.Check
              type="switch"
              name="hashtagFetchingSwitch"
              label="Fetching"
              defaultChecked={configState?.hashtagFetchingEnabled}
              className="hashtagFetchingSwitch"
              onClick={changeFetchingEnabled}
              disabled={appStatus !== 'Idling...'}
            />
          </Form.Group>
          <Form.Group as={Col} md="2">
            <Form.Check
              type="switch"
              name="autoPostingSwitch"
              label="Auto-posting"
              defaultChecked={configState?.autoPosting}
              className="hashtagFetchingSwitch"
              onClick={changeAutoPosting}
            />
          </Form.Group>
        </Form>
      </Row>
      <br />
      <hr />
      <Row className="mb-3">
        <Form noValidate onSubmit={saveDescriptionBoilerplate}>
          <Form.Group as={Col}>
            <Form.Label>
              <h1>Description boilerplate</h1>
              <small>
                Avaible placeholders: (%description%, %username%, %post_link%)
              </small>
            </Form.Label>
            <Form.Control
              required
              defaultValue={configState?.descriptionBoilerplate}
              name="descriptionBoilerplate"
              as="textarea"
              rows={10}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Button type="submit" className="saveButton">
            Save description
          </Button>
        </Form>
      </Row>
      <hr />
      <Row>
        <Form>
          <h1>Hashtags to fetch</h1>
          {hashtagsToFetch.map((hashtag: any, index) => (
            <InputGroup className="mb-3" key={hashtag.id}>
              <FormControl
                aria-describedby="basic-addon2"
                defaultValue={hashtag.hashtag}
                name={`hashtag${index}`}
                readOnly
              />
              <Button
                variant="outline-danger"
                onClick={() => handleDeleteHashtag(index)}
              >
                Delete
              </Button>
            </InputGroup>
          ))}
          <InputGroup className="mb-3">
            <FormControl
              aria-describedby="basic-addon2"
              name="addHashtag"
              value={addHashtagState}
              onChange={(e) => setAddHashtagState(e.target.value)}
            />
            <Button
              variant="outline-primary"
              id="button-addon2"
              onClick={handleAddHashtag}
            >
              Add hashtag
            </Button>
          </InputGroup>
        </Form>
      </Row>
      <hr />
      <h1>Instagram Authentication</h1>
      <Form
        noValidate
        onSubmit={handleSubmitAuthentication}
        validated={validated}
      >
        <Row className="mb-3">
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Username</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={authenticationState?.username}
                name="username"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                type="password"
                defaultValue={authenticationState?.password}
                name="password"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Athenticator</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={authenticationState?.authenticator}
                name="authenticator"
                disabled
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Access Token</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={authenticationState?.accessToken}
                name="accessToken"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Facebook Id</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={authenticationState?.fbId}
                name="fbId"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Client Id</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={authenticationState?.clientId}
                name="clientId"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Client secret</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={authenticationState?.clientSecret}
                name="clientSecret"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <br />
        <Button type="submit" className="saveButton">
          Save Ig/Fb authentication
        </Button>
      </Form>
      <hr />
      <h1>Dashboard login credentials</h1>
      <Alert variant="danger" show={credentialsError !== ''}>
        <Alert.Heading>{credentialsError}</Alert.Heading>
      </Alert>
      <Alert variant="success" show={credentialsSuccess !== ''}>
        <Alert.Heading>{credentialsSuccess}</Alert.Heading>
      </Alert>
      <Form
        noValidate
        onSubmit={handleSubmitCredentialsChange}
        validated={validated}
      >
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>Old password</Form.Label>
            <Form.Control required type="password" name="oldPassword" />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group as={Col}>
              <Form.Label>New username</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={credentialsState?.username}
                name="newUsername"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>New password</Form.Label>
              <Form.Control required type="password" name="newPassword1" />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Col}>
              <Form.Label>Confirm new password</Form.Label>
              <Form.Control required type="password" name="newPassword2" />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <br />
        <Button type="submit" className="saveButton">
          Save dashboard login credentials
        </Button>
      </Form>
    </Container>
  );
}

export default ConfigurationPage;
