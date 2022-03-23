import request from 'request-promise';

function checkIgAuth(): boolean {
  return request.post(
    `${process.env.BASE_URL}/auth/login`,
    {
      form: {
        username: 'credentials.username',
        password: 'credentials.password',
      },
    },
    (error, response, body) => {
      return body;
    }
  );
}
