import { useEffect } from 'react';
export default function ExternalLogin() {
  useEffect(() => {
    window.location.assign('http://localhost:8000/auth/login');
  }, []);
  return null;
}
