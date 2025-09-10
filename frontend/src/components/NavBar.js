import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8000';


function NavBar({ user, onLogout }) {
  return (
    <Box sx={{ p: 2, bgcolor: '#f1f1f1', display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        {/* left side links */}
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        {user && <Link to="/dashboard" style={{ marginRight: 12 }}>Dashboard</Link>}
        {user && <Link to="/properties" style={{ marginRight: 12 }}>Properties</Link>}
        {user && <Link to="/disclosure" style={{ marginRight: 12 }}>Disclosure</Link>}
      </Box>

      <Box>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>{user.name || user.email}</span>
            <Button
      variant="outlined"
      onClick={() => (window.location.href = `${API_ORIGIN}/auth/logout`)}
    >
      Logout
    </Button>
          </>
        ) : (
<Button
    variant="outlined"
    onClick={() => (window.location.href = `${API_ORIGIN}/auth/login`)}
  >
    Login
  </Button>
        )}
      </Box>
    </Box>
  );
}

export default NavBar;
