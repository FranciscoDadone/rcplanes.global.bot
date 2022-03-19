import { getGeneralConfig } from '../database/DatabaseQueries';
import { startHashtagFetching } from './HashtagFetchingTask';

export default async function TasksManager(turn?: string) {
  if (turn === undefined || turn === 'fetching') {
    const config = await getGeneralConfig();
    if (config.hashtagFetchingEnabled) {
      console.log('Fetching enabled! :)');
      startHashtagFetching(false);
    } else {
      console.log('Fetching disabled :(');
      global.appStatus = 'Idling...';
    }
  }
}
