/**
 * dari-push — free chat push notifications for the Dari app
 *
 * Runs on a Cloudflare Worker cron (every 5 minutes). It scans Firestore for
 * chat messages not yet pushed (pushSent == false) and delivers a free push
 * to the recipient through Expo's public push API — no Firebase billing, no
 * credit card, no Cloud Functions.
 *
 * Environment variables (set in the Cloudflare dashboard or via wrangler):
 *   PROJECT_ID            Firebase project id (dari-app-70704)
 *   SERVICE_ACCOUNT_JSON  Contents of the Firebase service-account JSON:
 *                         Firebase console -> Project settings -> Service
 *                         accounts -> "Generate new private key"
 */

const SCOPE = 'https://www.googleapis.com/auth/datastore';
const FIRESTORE_API = 'https://firestore.googleapis.com/v1';

export default {
  async scheduled(event, env, ctx) {
    const result = await sendPendingPushes(env);
    console.log(JSON.stringify(result));
  },

  async fetch(request, env) {
    if (request.method !== 'GET' || new URL(request.url).pathname !== '/__ping') {
      return new Response('Not found', { status: 404 });
    }
    const result = await sendPendingPushes(env);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

// ── Main ─────────────────────────────────────────────────────────────────────

async function sendPendingPushes(env) {
  try {
    const token = await getAccessToken(env);
    const messages = await fetchUnpushedMessages(env, token);
    if (!messages.length) return { processed: 0, pushed: 0 };

    let pushed = 0;
    for (const msg of messages) {
      try {
        const { recipients, senderName } = await getRecipients(env, token, msg);
        if (recipients.length) {
          pushed += await sendExpoPush(recipients, msg, senderName);
        }
        await markSent(env, token, msg.docPath);
      } catch (err) {
        console.error('message failed:', msg.docPath, err);
      }
    }
    return { processed: messages.length, pushed };
  } catch (err) {
    console.error('sendPendingPushes failed:', err);
    return { error: String(err) };
  }
}

// ── Firestore reads ──────────────────────────────────────────────────────────

async function fetchUnpushedMessages(env, token) {
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'messages', allDescendants: true }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'pushSent' },
          op: 'EQUAL',
          value: { booleanValue: false },
        },
      },
      limit: 30,
    },
  };

  const res = await fetch(
    `${FIRESTORE_API}/projects/${env.PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`runQuery failed: ${res.status} ${await res.text()}`);

  const rows = await res.json();
  return rows
    .filter((row) => row.document)
    .map((row) => {
      const name = row.document.name; // .../documents/conversations/{c}/messages/{m}
      const parts = name.split('/documents/')[1].split('/');
      const fields = row.document.fields || {};
      return {
        docPath: `${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}`,
        conversationId: parts[1],
        messageId: parts[3],
        text: fields.text?.stringValue || '',
        senderId: fields.senderId?.stringValue || '',
      };
    });
}

async function getRecipients(env, token, msg) {
  const conv = await getDocument(env, token, `conversations/${msg.conversationId}`);
  if (!conv) return { recipients: [], senderName: 'Dari' };

  const participants = (conv.participants?.arrayValue?.values || []).map((v) => v.stringValue);
  const others = participants.filter((uid) => uid && uid !== msg.senderId);

  const sender = await getDocument(env, token, `users/${msg.senderId}`);
  const senderName = sender?.name?.stringValue || sender?.username?.stringValue || 'Dari';

  const recipients = [];
  for (const uid of others) {
    const user = await getDocument(env, token, `users/${uid}`);
    if (user?.expoPushToken?.stringValue) {
      recipients.push({ token: user.expoPushToken.stringValue });
    }
  }
  return { recipients, senderName };
}

async function getDocument(env, token, path) {
  const res = await fetch(
    `${FIRESTORE_API}/projects/${env.PROJECT_ID}/databases/(default)/documents/${path}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getDocument ${path} failed: ${res.status}`);
  const data = await res.json();
  return data.fields || {};
}

async function markSent(env, token, docPath) {
  const url = `${FIRESTORE_API}/projects/${env.PROJECT_ID}/databases/(default)/documents/${docPath}?updateMask.fieldPaths=pushSent`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { pushSent: { booleanValue: true } } }),
  });
  if (!res.ok) throw new Error(`markSent failed: ${res.status} ${await res.text()}`);
}

// ── Expo push API (free) ─────────────────────────────────────────────────────

async function sendExpoPush(recipients, msg, senderName) {
  const payload = recipients.map((r) => ({
    to: r.token,
    title: senderName,
    body: msg.text.length > 140 ? `${msg.text.slice(0, 140)}…` : msg.text,
    data: {
      type: 'chat',
      conversationId: msg.conversationId,
      messageId: msg.messageId,
      senderId: msg.senderId,
    },
  }));

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`expo push failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  if (Array.isArray(json) && json.some((t) => t.status === 'error')) {
    const bad = json.filter((t) => t.status === 'error').map((t) => t.message).join('; ');
    console.warn('expo push errors:', bad);
  }
  return json.length;
}

// ── Service account auth (JWT -> OAuth token) ────────────────────────────────

let cachedToken = null;
let cachedExpiry = 0;

async function getAccessToken(env) {
  if (cachedToken && Date.now() < cachedExpiry - 60000) return cachedToken;

  const sa = JSON.parse(env.SERVICE_ACCOUNT_JSON);
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64UrlEncode(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  );
  const signature = await signRSA256(`${header}.${claims}`, sa.private_key);
  const jwt = `${header}.${claims}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json();

  cachedToken = data.access_token;
  cachedExpiry = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signRSA256(input, privateKeyPem) {
  const pem = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(input));
  return bytesToBase64Url(new Uint8Array(sig));
}

function bytesToBase64Url(bytes) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
