// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DisclosureChat from './components/DisclosureChat';
import NavBar from './components/NavBar';
import { fetchProgress } from './api';
import ExternalLogin from './components/ExternalLogin';
import LoginAuth0 from './components/LoginAuth0';
import PropertyDetail from './components/PropertyDetail';
import PropertyList from './components/PropertyList';
import PropertiesPage from './pages/Properties'; // <- use this one

import InviteAcceptPage from './pages/InviteAccept';


function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false); // NEW
  const [progress, setProgress] = useState({ completed: 1, total: 3 });
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const startDisclosure = () => navigate('/disclosure');


  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        setUser(res.ok ? await res.json() : null);
      } catch {
        setUser(null);
      }       finally {
        setAuthReady(true); // we know if logged in or not
      }
    })();
  }, []);

  if (!authReady) return null; // or a small spinner while checking

  return (
    <>
      <NavBar user={user} onLogout={() => window.location.assign('http://localhost:8000/auth/logout')} />
    


<Routes>
  {/* Public home (optional) */}
  <Route path="/" element={<div style={{ padding: 24 }}>AppHome</div>} />

  {/* Login page (button that goes to Auth0) */}
  <Route path="/login" element={<div style={{ padding: 24 }}>Click Login in the navbar</div>} />

  {/* Dashboard (protected) */}
  
  <Route 
    path="/dashboard" 
    element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
    />

  {/* Properties list (protected) */}
  <Route
    path="/properties"
    element={user ? <PropertiesPage /> : <Navigate to="/login" replace />}
  />

  {/* Property detail (protected) */}
  <Route
    path="/properties/:id"
    element={user ? <PropertyDetail /> : <Navigate to="/login" replace />}
  />

  {/* Disclosure (protected) */}
  <Route
    path="/disclosure"
    element={user ? <DisclosureChat /> : <Navigate to="/login" replace />}
  />

  {/* Fallback */}
  <Route path="*" 
  element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
  
  <Route path="/invite/:token" element={<InviteAcceptPage />} />
  
</Routes>

    </>
  );
}

export default App;
