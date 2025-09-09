// src/api.js
export async function sendPromptToAI(prompt) {
  try {
    const response = await fetch('/api/disclosure/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error('AI response failed');
    const data = await response.json();
    return data.reply; // backend now returns { reply }
  } catch (error) {
    console.error(error);
    return "Sorry, I'm having trouble responding right now.";
  }
}

export async function fetchProgress(token) {
  try {
    // Token not required by backend; keep header only if you want it later
    const response = await fetch('/api/disclosure/progress', {
      credentials: 'include',  
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('Progress fetch failed');
    return await response.json();
  } catch (error) {
    console.error(error);
    return { completed: 0, total: 3 };
  }
}


export async function listProperties() {
  const r = await fetch('/api/properties', { credentials: 'include' });
  if (!r.ok) throw new Error('listProperties failed');
  return r.json();
}

export async function getProperty(id) {
  const r = await fetch(`/api/properties/${id}`, { credentials: 'include' });
  if (!r.ok) throw new Error('getProperty failed');
  return r.json();
}

export async function createProperty(payload) {
  const r = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`createProperty failed: ${r.status} ${t}`);
  }
  return r.json();
}



export async function listDocuments(propertyId) {
  const r = await fetch(`/api/properties/${propertyId}/documents`, { credentials: 'include' });
  if (!r.ok) throw new Error('listDocuments failed');
  return r.json();
}

export async function presignUpload(propertyId, { filename, kind, size }) {
  const r = await fetch(`/api/properties/${propertyId}/documents/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ filename, kind, size }),
  });
  if (!r.ok) throw new Error('presignUpload failed');
  return r.json(); // { uploadUrl, key, contentType }
}


export async function completeUpload(propertyId, { key, filename, kind, sha256 }) {
  const r = await fetch(`/api/properties/${propertyId}/documents/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ key, filename, kind, sha256 }),
  });
  if (!r.ok) throw new Error('completeUpload failed');
  return r.json();
}

// get only the agent's/dashboard summary (scoped on the server)
export async function getDashboardSummary() {
  const res = await fetch('/api/dashboard/summary', { credentials: 'include' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`dashboard fetch failed: ${res.status} ${text}`);
  }
  return res.json();
}


export async function uploadViaProxy(propertyId, file, kind = 'supporting') {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);

  const r = await fetch(`/api/properties/${propertyId}/upload`, {
    method: 'POST',
    credentials: 'include',   // 👈 required or you'll get 401
    body: form,
  });

  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`Upload failed: ${r.status} ${t}`);
  }
  return r.json();
}

// (optional simple alias if your component imports uploadDocument)
export const uploadDocument = uploadViaProxy;


// Get a signed URL to view/download a document
export async function getDocumentUrl(propertyId, docId) {
  const r = await fetch(`/api/properties/${propertyId}/documents/${docId}/url`, {
    credentials: 'include',
  });
  if (!r.ok) throw new Error('getDocumentUrl failed');
  return r.json(); // -> { url: "https://..." }
}

// Delete a document
export async function deleteDocument(propertyId, docId) {
  const r = await fetch(`/api/properties/${propertyId}/documents/${docId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!r.ok) throw new Error('deleteDocument failed');
  return true;
}

export async function getMe() {
  const r = await fetch('/api/me', { credentials: 'include' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function buildForm2(propertyId) {
  const r = await fetch(`/api/properties/${propertyId}/form2/build`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { id, version, pdfKey, ... }
}

export async function getLatestForm2(propertyId) {
  const r = await fetch(`/api/properties/${propertyId}/form2/latest`, {
    credentials: 'include',
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function buildServePack(propertyId) {
  const r = await fetch(`/api/properties/${propertyId}/serve/build`, {
    method: 'POST', credentials: 'include'
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { id, version, zipKey, ... }
}

export async function getLatestServePack(propertyId) {
  const r = await fetch(`/api/properties/${propertyId}/serve/latest`, {
    credentials: 'include'
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteProperty(id) {
  const r = await fetch(`/api/properties/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!r.ok) {
    const t = await r.text().catch(()=> '');
    throw new Error(`deleteProperty failed: ${r.status} ${t}`);
  }
  return r.json();
}

export async function createInvite(propertyId, payload) {
  const r = await fetch(`/api/properties/${propertyId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { ..., link }
}

export async function getInvite(token) {
  const r = await fetch(`/api/invites/${token}`, { credentials: 'include' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function acceptInvite(token) {
  const r = await fetch(`/api/invites/${token}/accept`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

