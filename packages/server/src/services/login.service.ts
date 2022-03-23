import request from 'request-promise';
import { getCredentials } from '../database/DatabaseQueries';

/**
 * Returns the sessionid
 */
export async function igLogin(): Promise<string> {
  const credentials = await getCredentials();
  return request.post(
    `${process.env.BASE_URL}/auth/login`,
    {
      form: {
        username: credentials.username,
        password: credentials.password,
      },
    },
    (error, response, body) => {
      return body;
    }
  );
}

module.exports = {
  igLogin,
};
