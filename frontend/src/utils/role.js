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

export const getUserId = () => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Django REST Framework Simple JWT typically uses 'user_id'
    // It could also be 'id' or 'sub'
    return decoded.user_id || decoded.id || decoded.sub;
  } catch {
    return null;
  }
};