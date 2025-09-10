// src/components/PropertyDetail.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, LinearProgress, List, ListItem, ListItemText, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import {
  getProperty, listDocuments, buildForm2, getLatestForm2,
  getMe, createInvite
} from '../api';
import DocumentPanel from './DocumentPanel';

export default function PropertyDetail() {
  const { id } = useParams();
  const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8000';

  // ---- ALL HOOKS (top-level, unconditional) ----
  const [prop, setProp] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedKind, setSelectedKind] = useState(null);
  const docsRef = useRef(null);

  // invite state (Agent/Admin only UI, but hooks must live at top)
  const [me, setMe] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);

  // ---- effects ----
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, d] = await Promise.all([getProperty(id), listDocuments(id)]);
        setProp(p);
        setDocs(d);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try { setMe(await getMe()); } catch { /* ignore if not ready */ }
    })();
  }, []);

  // ---- derived ----
  const roles = me?.roles || [];
  const canInvite = roles.includes('Agent') || roles.includes('Admin');

  // early returns are OK here because hooks were already called
  if (loading) return <Box p={3}>Loading…</Box>;
  if (!prop) return <Box p={3}>Not found</Box>;

  const { title, address, type, progress } = prop;
  const checklist = prop.checklist ?? [];
  const completed = progress?.completed ?? 0;
  const total = progress?.total ?? 0;
  const pct = total ? (completed / total) * 100 : 0;

  const jumpToDocs = (kind) => {
    setSelectedKind(kind);
    setTimeout(() => docsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <Box maxWidth={800} mx="auto" mt={4} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" gutterBottom>{title}</Typography>
      <Typography variant="body1" gutterBottom>{address} • Type: {type}</Typography>

      <Typography>Progress: {completed} / {total}</Typography>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 10, mb: 2, borderRadius: 1 }} />

      {/* Form 2 actions */}
      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
        <Button
          variant="contained"
          disabled={total === 0 || completed < total}
          onClick={async () => {
            const win = window.open('', '_blank');
            try {
              const created = await buildForm2(id);
              win.location = `${API_ORIGIN}/api/form2/${created.id}/download`;
            } catch (e) {
              win?.close();
              alert(`Build failed: ${e}`);
            }
          }}
        >
          Generate Form 2 (PDF)
        </Button>

        <Button
          variant="outlined"
          onClick={async () => {
            const win = window.open('', '_blank');
            try {
              const latest = await getLatestForm2(id);
              win.location = `${API_ORIGIN}/api/form2/${latest.id}/download`;
            } catch {
              win?.close();
              alert('No Form 2 generated yet');
            }
          }}
        >
          View Latest
        </Button>

        {canInvite && (
          <Button variant="outlined" onClick={() => { setInviteOpen(true); setInviteMsg(''); }}>
            Invite Seller
          </Button>
        )}
      </Box>

      {/* Checklist */}
      <List sx={{ mt: 2 }}>
        {checklist.map(item => (
          <ListItem
            key={item.id ?? item.label}
            secondaryAction={!item.complete && (
              <Button size="small" onClick={() => jumpToDocs(item.id)}>
                Upload…
              </Button>
            )}
          >
            <ListItemText
              primary={item.label}
              secondary={item.required ? 'Required' : 'Optional'}
              primaryTypographyProps={{ color: item.complete ? 'success.main' : 'text.primary' }}
            />
            {item.complete ? <Chip label="Done" color="success" size="small" /> : null}
          </ListItem>
        ))}
      </List>

      {/* Documents */}
      <Typography variant="h6" sx={{ mt: 3 }}>Documents</Typography>
      <List>
        {docs.map(d => (
          <ListItem
            key={d.id}
            divider
            secondaryAction={
              <Button
                size="small"
                onClick={() => window.open(`${API_ORIGIN}/api/documents/${d.id}/download`, '_blank')}
              >
                Download
              </Button>
            }
          >
            <ListItemText
              primary={d.filename}
              secondary={`kind: ${d.kind} • sha256: ${d.sha256.slice(0, 12)}… • ${new Date(d.createdAt).toLocaleString()}`}
            />
          </ListItem>
        ))}
        {docs.length === 0 && <ListItem><ListItemText primary="No documents yet." /></ListItem>}
      </List>

      {/* Uploads panel */}
      <Box ref={docsRef} mt={3}>
        <DocumentPanel propertyId={id} onChanged={() => {
          // refresh property/docs after upload/delete
          (async () => {
            setLoading(true);
            try {
              const [p, d] = await Promise.all([getProperty(id), listDocuments(id)]);
              setProp(p);
              setDocs(d);
            } finally { setLoading(false); }
          })();
        }} initialKind={selectedKind} />
      </Box>

      {/* Invite dialog (hooks are above; this is just conditional rendering) */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Invite Seller to this Property</DialogTitle>
        <DialogContent>
          {inviteMsg && <Alert severity="info" sx={{ mb: 2 }}>{inviteMsg}</Alert>}
          <TextField
            fullWidth
            autoFocus
            label="Seller Email"
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            margin="dense"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={inviteBusy || !inviteEmail.trim()}
            onClick={async () => {
              setInviteBusy(true);
              try {
                const resp = await createInvite(id, { email: inviteEmail, role: 'Seller' });
                setInviteMsg(`Invite created. Dev link (also in server logs): ${resp.link}`);
                setInviteEmail('');
              } catch (e) {
                alert(String(e.message || e));
              } finally {
                setInviteBusy(false);
              }
            }}
          >
            {inviteBusy ? 'Sending…' : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
