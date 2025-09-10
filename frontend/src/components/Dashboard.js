// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, List, ListItem, ListItemText, Link as MLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../api';

export default function Dashboard() {
  const [summary, setSummary] = useState({ overall: { completed: 0, total: 0 }, properties: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        if (!alive) return;
        setSummary({
          overall: data?.overall ?? { completed: 0, total: 0 },
          properties: Array.isArray(data?.properties) ? data.properties : [],
        });
      } catch (e) {
        if (alive) setErr(e.message || 'Load failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const overall = summary?.overall ?? { completed: 0, total: 0 };
  const pct = overall.total ? (overall.completed / overall.total) * 100 : 0;

  return (
    <Box maxWidth={800} mx="auto" mt={4} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h4" gutterBottom>Seller Disclosure Dashboard</Typography>

      {err && <Typography color="error" sx={{ mb: 2 }}>{err}</Typography>}

      {loading ? (
        <Typography>Loading…</Typography>
      ) : (
        <>
          <Typography>Overall progress: {overall.completed} of {overall.total} steps complete</Typography>
          <LinearProgress variant="determinate" value={pct} sx={{ height: 10, mb: 2, borderRadius: 1 }} />

          <Typography variant="h6" sx={{ mt: 2 }}>Properties</Typography>
          <List>
            {summary.properties.map(p => {
              const c = p?.progress?.completed ?? 0;
              const t = p?.progress?.total ?? 0;
              const itemPct = t ? (c / t) * 100 : 0;
              return (
                <ListItem
                  key={p.id}
                  divider
                  secondaryAction={<MLink component={Link} to={`/properties/${p.id}`}>OPEN</MLink>}
                >
                  <ListItemText primary={`${p.title} — ${p.address}`} secondary={`Progress: ${c}/${t}`} />
                  <Box sx={{ width: 200, ml: 2 }}>
                    <LinearProgress variant="determinate" value={itemPct} />
                  </Box>
                </ListItem>
              );
            })}
            {summary.properties.length === 0 && (
              <ListItem><ListItemText primary="No properties yet." /></ListItem>
            )}
          </List>
        </>
      )}
    </Box>
  );
}
