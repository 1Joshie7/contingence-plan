import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from './token';

export const getUserRole = () => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch {
    return null;
  }
};