import '../assets/css/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppHandler from './AppHandler';
import Context from './Context';

function App() {
  return (
    <>
      <Context>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppHandler />} />
          </Routes>
        </BrowserRouter>
      </Context>
    </>
  );
}

export default App;
