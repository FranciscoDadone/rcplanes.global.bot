import {
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Container,
  FormControl,
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
  const [credentialsState, setCredentialsState] = useState<{
    accessToken: string;
    clientId: string;
    igAccountId: string;
    clientSecret: string;
  }>();
  const [configState, setConfigState] = useState<{
    uploadRate: number;
    descriptionBoilerplate: string;
    hashtagFetchingEnabled: boolean;
    autoPosting: boolean;
  }>();

  useEffect(() => {
    let isMounted = true;
    if (configState === undefined) {
      axios.get('/api/general/general_config').then((res) => {
        if (isMounted) setConfigState(res.data);
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
    if (credentialsState === undefined) {
      axios.get('/api/general/credentials').then((res) => {
        if (isMounted) setCredentialsState(res.data);
      });
    }
    return () => {
      isMounted = false;
    };
  });

  const handleSubmit = (event: any) => {
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
          accessToken: formDataObj.authToken,
          clientSecret: formDataObj.clientSecret,
          clientId: formDataObj.clientId,
          igAccountId: formDataObj.igAccountId,
        },
      });
      axios.post('/api/general/set_general_config', {
        data: {
          uploadRate: formDataObj.uploadRate,
          descriptionBoilerplate: formDataObj.descriptionBoilerplate,
          hashtagFetchingEnabled: formDataObj.hashtagFetchingSwitch === 'on',
          autoPosting: formDataObj.autoPostingSwitch === 'on',
        },
      });
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleDeleteHashtag = (index: number) => {
    const hashtags: any = [];
    axios.post('/api/hashtags/delete', {
      data: {
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

  return (
    <Container className="container">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <hr />
        <h1>General configuration</h1>
        <Row className="mb-2">
          <Form.Group as={Col} md="2" controlId="validationCustom01">
            <Form.Label>Upload rate in hours</Form.Label>
            <Form.Control
              required
              type="number"
              defaultValue={configState?.uploadRate}
              name="uploadRate"
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="2" controlId="validationCustom01">
            <Form.Check
              type="switch"
              name="hashtagFetchingSwitch"
              label="Fetching"
              defaultChecked={configState?.hashtagFetchingEnabled}
              className="hashtagFetchingSwitch"
            />
          </Form.Group>
          <Form.Group as={Col} md="2" controlId="validationCustom01">
            <Form.Check
              type="switch"
              name="autoPostingSwitch"
              label="Auto-posting"
              defaultChecked={configState?.autoPosting}
              className="hashtagFetchingSwitch"
            />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="validationCustom01">
            <Form.Label>
              Description boilerplate
              <br />
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
        </Row>
        <Row>
          <h4>Hashtags to fetch</h4>
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
                id="button-addon2"
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
        </Row>
        <hr />
        <h1>Authentication</h1>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="validationCustom01">
            <Form.Label>Auth token</Form.Label>
            <Form.Control
              required
              type="text"
              defaultValue={credentialsState?.accessToken}
              name="authToken"
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group as={Col} controlId="validationCustom01">
              <Form.Label>Client Id</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={credentialsState?.clientId}
                name="clientId"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Col} controlId="validationCustom01">
              <Form.Label>Client Secret</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={credentialsState?.clientSecret}
                name="clientSecret"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group as={Col} controlId="validationCustom01">
              <Form.Label>Instagram account id</Form.Label>
              <Form.Control
                required
                type="text"
                defaultValue={credentialsState?.igAccountId}
                name="igAccountId"
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <br />
        <Button type="submit" className="saveButton">
          Save configuration
        </Button>
      </Form>
    </Container>
  );
}

export default ConfigurationPage;
