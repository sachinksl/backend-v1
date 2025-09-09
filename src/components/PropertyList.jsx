// src/components/PropertyList.jsx
import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText, Typography, Alert, ListItemButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import { listProperties, createProperty, getMe } from '../api';
import { deleteProperty } from '../api';


export default function PropertyList() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  // form state
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('house');        // e.g. "house", "unit"
  const [sellerEmail, setSellerEmail] = useState(''); // optional
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const refresh = async () => {
    const data = await listProperties();
    setItems(data);
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch {/* ignore if /api/me not available yet */}
      refresh();
    })();
  }, []);

  // role gate for the button
  const roles = user?.roles || [];
  const canCreate = roles.includes('Agent') || roles.includes('Admin');

  const resetForm = () => {
    setTitle(''); setAddress(''); setType('house'); setSellerEmail(''); setErrMsg('');
  };

  const onCreate = async () => {
    setErrMsg('');
    const payload = {
      title: (title || '').trim(),
      address: (address || '').trim(),
      type: (type || 'house').trim().toLowerCase(),
      ...(sellerEmail && sellerEmail.trim() ? { sellerEmail: sellerEmail.trim() } : {}),
    };

    if (!payload.title || !payload.address) {
      setErrMsg('Please enter both Title and Address.');
      return;
    }

    setBusy(true);
    try {
      await createProperty(payload);
      setOpen(false);
      resetForm();
      await refresh();
    } catch (e) {
      const msg = String(e.message || '');
      if (msg.includes('title_address_required')) {
        setErrMsg('Please enter both Title and Address.');
      } else if (msg.includes('seller not found')) {
        setErrMsg('Seller email must belong to a user in your org.');
      } else if (msg.includes('forbidden')) {
        setErrMsg('Only Agents or Admins can create properties.');
      } else {
        setErrMsg(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This will remove its docs, Form 2 and serve packs.`)) return;
    try {
      await deleteProperty(p.id);
      await refresh();
    } catch (e) {
      alert(String(e.message || e));
    }
  };
  

  return (
    <Box maxWidth={800} mx="auto" mt={4} p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Properties</Typography>
        {canCreate && (
          <Button variant="contained" onClick={() => setOpen(true)}>
            New Property
          </Button>
        )}
      </Box>

  

      <List>
  {items.map(p => (
    <ListItem
      key={p.id}
      secondaryAction={
        (canCreate /* Agent/Admin */) && (
          <Button color="error" size="small" onClick={() => onDelete(p)}>
            Delete
          </Button>
        )
      }
      disablePadding
    >
      <ListItemButton component={Link} to={`/properties/${p.id}`}>
        <ListItemText primary={p.title} secondary={`${p.address} • ${p.type}`} />
      </ListItemButton>
    </ListItem>
  ))}
  {items.length === 0 && (
    <ListItem><ListItemText primary="No properties yet." /></ListItem>
  )}
</List>


      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} fullWidth maxWidth="sm">
        <DialogTitle>New Property</DialogTitle>
        <DialogContent>
          {errMsg && <Alert severity="error" sx={{ mb: 2 }}>{errMsg}</Alert>}
          <TextField
            required fullWidth margin="dense" label="Title"
            value={title} onChange={e => setTitle(e.target.value)}
          />
          <TextField
            required fullWidth margin="dense" label="Address"
            value={address} onChange={e => setAddress(e.target.value)}
          />
          <TextField
            fullWidth margin="dense" label="Type (e.g., house, unit)"
            value={type} onChange={e => setType(e.target.value)}
          />
          <TextField
            fullWidth margin="dense" label="Seller Email (optional, must be in your org)"
            value={sellerEmail} onChange={e => setSellerEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={onCreate}
            disabled={busy || !title.trim() || !address.trim()}
          >
            {busy ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
