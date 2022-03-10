import '../assets/css/App.css';
import axios from 'axios';
import AppNavbar from './AppNavbar';

function App() {
  const login = () => {
    axios({
      method: 'post',
      data: {
        username: 'lolo',
        password: '1234',
      },
      withCredentials: true,
      url: 'http://localhost:8080/auth/login',
    }).then((res) => {
      console.log(res);
    });
  };

  const checkAuth = () => {
    axios({
      method: 'get',
      url: 'http://localhost:8080/api/user',
      withCredentials: true,
    }).then((res1) => {
      console.log(res1);
    });
  };
  return (
    <>
      <AppNavbar />
      <button onClick={login} type="button">Login</button>
      <button onClick={checkAuth} type="button">Check auth</button>
    </>
  );
}

export default App;
