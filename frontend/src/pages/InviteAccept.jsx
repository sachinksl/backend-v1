import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography, Alert } from '@mui/material';
import { getInvite, acceptInvite, getMe } from '../api';

export default function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setInfo(await getInvite(token));
      } catch (e) { setErr('Invalid or expired invite.'); }
      try {
        setMe(await getMe());
      } catch {}
    })();
  }, [token]);

  if (err) return <Box p={3}><Alert severity="error">{err}</Alert></Box>;
  if (!info) return <Box p={3}>Loading…</Box>;

  const loggedInEmail = me?.email || '(not logged in)';
  const mustLogin = !me;

  return (
    <Box maxWidth={600} mx="auto" mt={6} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" gutterBottom>Property Invite</Typography>
      <Typography gutterBottom>
        You were invited as <b>{info.role}</b> for this property. Invite email: <b>{info.email}</b>
      </Typography>
      <Typography gutterBottom>
        Current session: <b>{loggedInEmail}</b>
      </Typography>

      {mustLogin && (
        <Alert severity="info" sx={{ my: 2 }}>
          Please <RouterLink to="/login">log in</RouterLink> with <b>{info.email}</b> and reload this page.
        </Alert>
      )}

      <Button
        variant="contained"
        disabled={mustLogin}
        onClick={async () => {
          try {
            const r = await acceptInvite(token);
            navigate(`/properties/${r.propertyId}`);
          } catch (e) {
            alert(String(e.message || e));
          }
        }}
      >
        Accept Invite
      </Button>
    </Box>
  );
}
