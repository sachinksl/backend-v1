
import { Box, Button, Typography } from '@mui/material';

export default function LoginAuth0() {
  return (
    <Box maxWidth={400} mx="auto" mt={8} p={4} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" mb={2}>Login</Typography>
      <Button
        fullWidth
        variant="contained"
        onClick={() => window.location.assign('http://localhost:8000/auth/login')}
      >
        Continue to secure login
      </Button>
    </Box>
  );
}
