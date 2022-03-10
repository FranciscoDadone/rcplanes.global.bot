import '../assets/css/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import AppHandler from './AppHandler';
import Context from './Context';

function App() {
  return (
    <>
      <Context>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppHandler />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </Context>
    </>
  );
}

export default App;
