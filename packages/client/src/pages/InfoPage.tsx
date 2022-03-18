// next upload date; total uploads; total queue; total followers; app status;
// total deleted; total posted; total likes

import { Card } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import '../assets/css/InfoPage.css';

function InfoPage() {
  const [nextUpload, setNextUpload] = useState({
    nextUpload: '',
    eta: '',
  });

  useEffect(() => {
    let isMounted = true;

    if (nextUpload.nextUpload === '') {
      axios
        .get<{
          id: number;
          lastUploadDate: string;
          totalPostedMedias: number;
          queuedMedias: number;
        }>('/api/general/get_util')
        .then((util) => {
          axios
            .get<{
              id: number;
              uploadRate: number;
              descriptionBoilerplate: string;
              hashtagFetchingEnabled: boolean;
            }>('/api/general/general_config')
            .then((generalConfig) => {
              const nextPostDate = new Date(util.data.lastUploadDate);
              nextPostDate.setHours(
                nextPostDate.getHours() + generalConfig.data.uploadRate
              );
              setNextUpload({
                nextUpload: nextPostDate.toString(),
                eta: '',
              });
            });
        });
    }

    setTimeout(() => {
      if (isMounted) {
        const nextUploadDate = new Date(nextUpload.nextUpload);
        const now = new Date();

        const diff = moment
          .utc(
            moment(nextUploadDate, 'DD/MM/YYYY HH:mm:ss').diff(
              moment(now, 'DD/MM/YYYY HH:mm:ss')
            )
          )
          .format('HH:mm:ss');

        setNextUpload({
          nextUpload:
            parseInt(diff.substring(0, 2), 10) >= 23
              ? ''
              : nextUpload.nextUpload,
          eta: diff,
        });
      }
    }, 1000);
    return () => {
      isMounted = false;
    };
  });

  return (
    <Card className="cardContainer">
      <Card.Body className="cardBody">
        <h1 className="cardTitle">Uploads info</h1>
        <hr />
        <ul>
          <li>Next upload date: {nextUpload.nextUpload}</li>
          <li>ETA next upload: {nextUpload.eta}</li>
        </ul>
        <br />
        <h1 className="cardTitle">Database</h1>
        <hr />
        <ul>
          <li>Total queue: 0</li>
          <li>Total posted: 0</li>
          <li>Total fetched: 0</li>
        </ul>
      </Card.Body>
    </Card>
  );
}

export default InfoPage;
