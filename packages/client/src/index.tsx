import { render } from 'react-dom';
import App from './pages/App';

global.appStatus = 'Idling...';

render(<App />, document.getElementById('root'));
