import { useEffect, useState } from 'react';
import {
  Box, Button, FormControl, InputLabel, MenuItem, Select,
  List, ListItem, ListItemText, Typography
} from '@mui/material';
import { listDocuments, uploadViaProxy as uploadDocument } from '../api';

const KIND_OPTIONS = [
  { id: 'title_search', label: 'Title search document' },
  { id: 'pool_safety', label: 'Pool safety certificate (if pool)' },
  { id: 'smoke_alarm', label: 'Smoke alarm compliance certificate' },
];

export default function DocumentPanel({ propertyId, initialKind, onChanged }) {
  const [docs, setDocs] = useState([]);
  const [kind, setKind] = useState(initialKind || 'title_search');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (initialKind) setKind(initialKind); }, [initialKind]);
  const refresh = async () => setDocs(await listDocuments(propertyId));
  useEffect(() => { refresh().catch(console.error); }, [propertyId]);

  const onChoose = (e) => setFile(e.target.files?.[0] || null);

  const onUpload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      await uploadDocument(propertyId, file, kind);
      setFile(null);
      await refresh();
      onChanged?.(); // let parent recompute checklist/progress
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onView = (id) => window.open(`/api/documents/${id}/download`, '_blank');

  const onDownload = (id) => {
    const a = document.createElement('a');
    a.href = `/api/documents/${id}/download`;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    const r = await fetch(`/api/documents/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!r.ok) { alert('Delete failed'); return; }
    await refresh();
    onChanged?.();
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>Documents</Typography>

      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
        <FormControl sx={{ minWidth: 260 }}>
          <InputLabel id="doc-kind">Kind</InputLabel>
          <Select
            labelId="doc-kind"
            label="Kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {KIND_OPTIONS.map(k => <MenuItem key={k.id} value={k.id}>{k.label}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="outlined" component="label" disabled={busy}>
          Choose file
          <input hidden type="file" onChange={onChoose} />
        </Button>

        <Button
          variant="contained"
          onClick={onUpload}
          disabled={!file || busy}
        >
          {busy ? 'Uploading…' : 'Upload'}
        </Button>

        {file && <Typography variant="body2">Selected: {file.name}</Typography>}
      </Box>

      <List sx={{ mt: 2 }}>
        {docs.map(d => (
          <ListItem
            key={d.id}
            divider
            secondaryAction={
              <Box display="flex" gap={1}>
                <Button size="small" onClick={() => onView(d.id)}>View</Button>
                <Button size="small" onClick={() => onDownload(d.id)}>Download</Button>
                <Button size="small" color="error" onClick={() => onDelete(d.id)}>Delete</Button>
              </Box>
            }
          >
            <ListItemText
              primary={d.filename}
              secondary={`kind: ${d.kind} • sha256: ${d.sha256.slice(0,12)}… • ${new Date(d.createdAt).toLocaleString()}`}
            />
          </ListItem>
        ))}
        {docs.length === 0 && (
          <ListItem><ListItemText primary="No documents yet." /></ListItem>
        )}
      </List>
    </Box>
  );
}
