// src/api.js

// Base URL comes from env when deployed, or falls back to local dev
const API_ORIGIN =
  process.env.REACT_APP_API_ORIGIN || 'http://localhost:8000';

// Small helper to prefix all API paths and keep cookies
const url = (path) => `${API_ORIGIN}${path}`;
const withCreds = (extra = {}) => ({
  credentials: 'include',
  ...extra,
});

/* ---------- AI / Progress ---------- */

export async function sendPromptToAI(prompt) {
  try {
    const response = await fetch(url('/api/disclosure/ai'), withCreds({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    }));
    if (!response.ok) throw new Error('AI response failed');
    const data = await response.json();
    return data.reply; // backend returns { reply }
  } catch (error) {
    console.error(error);
    return "Sorry, I'm having trouble responding right now.";
  }
}

export async function fetchProgress(token) {
  try {
    const response = await fetch(url('/api/disclosure/progress'), withCreds({
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }));
    if (!response.ok) throw new Error('Progress fetch failed');
    return await response.json();
  } catch (error) {
    console.error(error);
    return { completed: 0, total: 3 };
  }
}

/* ---------- Properties ---------- */

export async function listProperties() {
  const r = await fetch(url('/api/properties'), withCreds());
  if (!r.ok) throw new Error('listProperties failed');
  return r.json();
}

export async function getProperty(id) {
  const r = await fetch(url(`/api/properties/${id}`), withCreds());
  if (!r.ok) throw new Error('getProperty failed');
  return r.json();
}

export async function createProperty(payload) {
  const r = await fetch(url('/api/properties'), withCreds({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`createProperty failed: ${r.status} ${t}`);
  }
  return r.json();
}

export async function deleteProperty(id) {
  const r = await fetch(url(`/api/properties/${id}`), withCreds({
    method: 'DELETE',
  }));
  if (!r.ok) {
    const t = await r.text().catch(()=> '');
    throw new Error(`deleteProperty failed: ${r.status} ${t}`);
  }
  return r.json();
}

/* ---------- Documents ---------- */

export async function listDocuments(propertyId) {
  const r = await fetch(url(`/api/properties/${propertyId}/documents`), withCreds());
  if (!r.ok) throw new Error('listDocuments failed');
  return r.json();
}

export async function presignUpload(propertyId, { filename, kind, size }) {
  const r = await fetch(url(`/api/properties/${propertyId}/documents/presign`), withCreds({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, kind, size }),
  }));
  if (!r.ok) throw new Error('presignUpload failed');
  return r.json(); // { uploadUrl, key, contentType }
}

export async function completeUpload(propertyId, { key, filename, kind, sha256 }) {
  const r = await fetch(url(`/api/properties/${propertyId}/documents/complete`), withCreds({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, filename, kind, sha256 }),
  }));
  if (!r.ok) throw new Error('completeUpload failed');
  return r.json();
}

export async function getDocumentUrl(propertyId, docId) {
  const r = await fetch(url(`/api/properties/${propertyId}/documents/${docId}/url`), withCreds());
  if (!r.ok) throw new Error('getDocumentUrl failed');
  return r.json(); // -> { url: "https://..." }
}

export async function deleteDocument(propertyId, docId) {
  const r = await fetch(url(`/api/properties/${propertyId}/documents/${docId}`), withCreds({
    method: 'DELETE',
  }));
  if (!r.ok) throw new Error('deleteDocument failed');
  return true;
}

/* ---------- Dashboard ---------- */

export async function getDashboardSummary() {
  const res = await fetch(url('/api/dashboard/summary'), withCreds());
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`dashboard fetch failed: ${res.status} ${text}`);
  }
  return res.json();
}

/* ---------- Upload via server proxy ---------- */

export async function uploadViaProxy(propertyId, file, kind = 'supporting') {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);

  const r = await fetch(url(`/api/properties/${propertyId}/upload`), withCreds({
    method: 'POST',
    body: form,
  }));

  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`Upload failed: ${r.status} ${t}`);
  }
  return r.json();
}
export const uploadDocument = uploadViaProxy;

/* ---------- Auth/me ---------- */

export async function getMe() {
  const r = await fetch(url('/api/me'), withCreds());
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ---------- Form 2 ---------- */

export async function buildForm2(propertyId) {
  const r = await fetch(url(`/api/properties/${propertyId}/form2/build`), withCreds({
    method: 'POST',
  }));
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { id, version, pdfKey, ... }
}

export async function getLatestForm2(propertyId) {
  const r = await fetch(url(`/api/properties/${propertyId}/form2/latest`), withCreds());
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ---------- Serve pack ---------- */

export async function buildServePack(propertyId) {
  const r = await fetch(url(`/api/properties/${propertyId}/serve/build`), withCreds({
    method: 'POST'
  }));
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { id, version, zipKey, ... }
}

export async function getLatestServePack(propertyId) {
  const r = await fetch(url(`/api/properties/${propertyId}/serve/latest`), withCreds());
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ---------- Invites ---------- */

export async function createInvite(propertyId, payload) {
  const r = await fetch(url(`/api/properties/${propertyId}/invite`), withCreds({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { ..., link }
}

export async function getInvite(token) {
  const r = await fetch(url(`/api/invites/${token}`), withCreds());
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function acceptInvite(token) {
  const r = await fetch(url(`/api/invites/${token}/accept`), withCreds({
    method: 'POST',
  }));
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
