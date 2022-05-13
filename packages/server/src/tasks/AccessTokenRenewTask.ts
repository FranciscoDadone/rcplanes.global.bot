import { getUtil } from '../database/DatabaseQueries';
import { renewAccessToken } from '../services/instagramAPI.service';

export async function startAccessTokenRenewTask() {
  const util = await getUtil();
  const { lastAccessTokenRenewDate } = util;
  const lastDate = new Date(lastAccessTokenRenewDate);
  const currentDate = new Date();

  lastDate.setDate(lastDate.getDate() + 10);

  if (lastDate < currentDate) renewAccessToken();

  await new Promise((resolve) => setTimeout(resolve, 86400000));
  startAccessTokenRenewTask();
}

module.exports = {
  startAccessTokenRenewTask,
};
