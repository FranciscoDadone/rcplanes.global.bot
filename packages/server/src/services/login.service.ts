import request from 'request';

/**
 * Returns the sessionid
 */
export async function igLogin(): Promise<string> {
  return request.post(
    'http://localhost:8000/auth/login',
    {
      form: {
        sessionid: '51088662819%3AKaOfgQx5f2Iif8%3A7',
        username: 'rcplanes.global',
      },
    },
    (error, response, body) => {
      if (!error) return body;
      return error;
    }
  );
}

module.exports = {
  igLogin,
};
