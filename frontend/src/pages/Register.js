import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'student' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register/', form);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error);
      alert('Error registering');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} />
      <br/><input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
      <br/><input type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
      <br/><select onChange={e => setForm({...form, role: e.target.value})}>
        <option value="student">Student</option>
        <option value="lecturer">Lecturer</option>
      </select>
      <br/>
      <button type="submit">Register</button>
      <br/>
      <a href="/login">Back to Login</a>
    </form>
  );
}

export default Register;