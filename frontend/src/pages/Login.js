import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      const decoded = jwtDecode(access);
      const role = decoded.role;
      if (role === 'lecturer') {
        navigate('/lecturer');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error('Login failed', error);
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <br/><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <br/><button type="submit">Login</button>
      <br/>
      <a href="/register">Register</a>
    </form>
  );
}

export default Login;