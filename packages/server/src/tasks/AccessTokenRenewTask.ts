import { getUtil } from '../database/DatabaseQueries';
import { renewAccessToken } from '../services/instagramAPI.service';

export async function startAccessTokenRenewTask() {
  const util = await getUtil();
  const { lastAccessTokenRenewDate } = util;
  const lastDate = new Date(lastAccessTokenRenewDate);
  const currentDate = new Date();

  lastDate.setDate(lastDate.getDate() + 2);

  // if (lastDate < currentDate) renewAccessToken();
  renewAccessToken();

  await new Promise((resolve) => setTimeout(resolve, 3600000));
  startAccessTokenRenewTask();
}

module.exports = {
  startAccessTokenRenewTask,
};
