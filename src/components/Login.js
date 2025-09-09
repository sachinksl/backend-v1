import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate authentication check, replace with real API call
    if (email === 'user@example.com' && password === 'password') {
      onLogin({ email, token: 'dummy-token' });
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      maxWidth={400}
      mx="auto"
      mt={8}
      p={4}
      boxShadow={3}
      borderRadius={2}
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      flexDirection="column"
      gap={2}
    >
      <Typography variant="h5" component="h2" textAlign="center" mb={2}>
        Login
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
      />

      <Button type="submit" variant="contained" color="primary" fullWidth>
        Log In
      </Button>
    </Box>
  );
}

export default Login;
