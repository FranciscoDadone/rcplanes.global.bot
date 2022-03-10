import axios from 'axios';
import '../assets/css/App.css';

function LoginPage() {
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

  return (
    <div>
      <button type="button" onClick={login}>
        Login
      </button>
    </div>
  );
}

export default LoginPage;
