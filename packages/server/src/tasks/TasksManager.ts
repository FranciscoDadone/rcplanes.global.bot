import { getGeneralConfig } from '../database/DatabaseQueries';
import { startHashtagFetching } from './HashtagFetchingTask';
import { startPostingTask } from './PostingTask';
import { startProfilesFetching } from './ProfilesFetchingTask';
import { startAccessTokenRenewTask } from './AccessTokenRenewTask';

export default async function TasksManager(turn?: string) {
  const config = await getGeneralConfig();
  if (turn === undefined) {
    startPostingTask();
    startHashtagFetching(true);
    startProfilesFetching(true);
    startAccessTokenRenewTask();

    if (config.autoPosting) {
      console.log('Auto-posting enabled! :)');
    } else {
      console.log('Auto-posting disabled :(');
    }
    if (config.hashtagFetchingEnabled) {
      console.log('Hashtag fetching enabled! :)');
    } else {
      console.log('Hashtag fetching disabled :(');
    }
    if (config.profilesFetchingEnabled) {
      console.log('Profiles fetching enabled! :)');
    } else {
      console.log('Profiles fetching disabled :(');
    }
  }

  if (turn === 'fetching') {
    if (config.hashtagFetchingEnabled) {
      console.log('Hashtag fetching enabled! :)');
      startHashtagFetching(false);
    } else {
      console.log('Hashtag fetching disabled :(');
      global.appStatus = 'Idling...';
    }
  } else if (turn === 'profiles') {
    if (config.profilesFetchingEnabled) {
      console.log('Profiles fetching enabled! :)');
      startProfilesFetching(false);
    } else {
      console.log('Profiles fetching disabled :(');
      global.appStatus = 'Idling...';
    }
  }
}
