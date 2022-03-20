import { getGeneralConfig } from '../database/DatabaseQueries';
import { startHashtagFetching } from './HashtagFetchingTask';
import { startPostingTask } from './PostingTask';

export default async function TasksManager(turn?: string) {
  const config = await getGeneralConfig();
  if (turn === undefined) {
    startPostingTask();
    startHashtagFetching(true);
    if (config.autoPosting) {
      console.log('Auto-posting enabled! :)');
    } else {
      console.log('Auto-posting disabled :(');
    }
    if (config.hashtagFetchingEnabled) {
      console.log('Fetching enabled! :)');
    } else {
      console.log('Fetching disabled :(');
    }
  }
  if (turn === 'fetching') {
    if (config.hashtagFetchingEnabled) {
      console.log('Fetching enabled! :)');
      startHashtagFetching(false);
    } else {
      console.log('Fetching disabled :(');
      global.appStatus = 'Idling...';
    }
  }
}
