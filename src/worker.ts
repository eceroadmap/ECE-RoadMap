/**
 * Cloudflare Worker for ECE RoadMap
 * Handles Server-Side Student Authentication & Serves SPA Static Assets
 */

interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  FIREBASE_SERVICE_ACCOUNT?: string; // Encrypted Cloudflare Secret (JSON string)
}

interface ServiceAccountCredentials {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

const PROJECT_ID = 'eceroadmap2027';
const DATABASE_ID = 'ai-studio-eceroadmap-92942c14-153e-4944-ad7d-20e5ea4add92';

/**
 * Base64URL encoder
 */
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts PEM private key to CryptoKey
 */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');

  const binaryDerString = atob(cleanPem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
}

/**
 * Generates an OAuth2 access token for Google Firestore REST API
 */
async function getGoogleOAuthToken(credentials: ServiceAccountCredentials): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const cryptoKey = await importPrivateKey(credentials.private_key || '');
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  const jwt = `${dataToSign}.${encodedSignature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenRes.ok) {
    throw new Error(`Failed to obtain Google OAuth token`);
  }

  const tokenData = await tokenRes.json() as { access_token: string };
  return tokenData.access_token;
}

/**
 * Parses Firestore REST API field value
 */
function parseFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = parseFirestoreValue(v);
    }
    return res;
  }
  if ('arrayValue' in val) {
    const values = val.arrayValue.values || [];
    return values.map((item: any) => parseFirestoreValue(item));
  }
  return null;
}

/**
 * Parses raw Firestore document fields
 */
function parseFirestoreDoc(doc: any): { uid: string; data: Record<string, any> } | null {
  if (!doc || !doc.fields) return null;
  const nameParts = (doc.name || '').split('/');
  const uid = nameParts[nameParts.length - 1] || '';
  const data: Record<string, any> = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    data[key] = parseFirestoreValue(val);
  }
  return { uid, data };
}

/**
 * Rate Limiting Tracker (in-memory per worker edge)
 */
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 60000 }); // 1 min window
    return false;
  }
  entry.count++;
  return entry.count > 15; // Max 15 login attempts per minute per IP
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. API Route: POST /api/auth/student-login
    if (url.pathname === '/api/auth/student-login') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, code: 'METHOD_NOT_ALLOWED' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Security: Validate content type
      const contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return new Response(JSON.stringify({ success: false, code: 'INVALID_REQUEST' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Security: Rate Limiting
      const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
      if (isRateLimited(clientIp)) {
        return new Response(JSON.stringify({ success: false, code: 'TOO_MANY_REQUESTS' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
        });
      }

      // Security: Request size limit (< 4KB)
      const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
      if (contentLength > 4096) {
        return new Response(JSON.stringify({ success: false, code: 'PAYLOAD_TOO_LARGE' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const body = await request.json() as any;
        const username = typeof body?.username === 'string' ? body.username.trim() : '';
        const password = typeof body?.password === 'string' ? body.password.trim() : '';

        if (!username || !password) {
          return new Response(JSON.stringify({ success: false, code: 'INVALID_CREDENTIALS' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Parse Service Account Secret
        let serviceAccount: ServiceAccountCredentials | null = null;
        if (env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
          } catch {
            serviceAccount = null;
          }
        }

        if (!serviceAccount || !serviceAccount.private_key || !serviceAccount.client_email) {
          // Worker secret is pending setup in Cloudflare Environment
          return new Response(JSON.stringify({ 
            success: false, 
            code: 'SERVICE_UNAVAILABLE',
            message: 'Authentication service configuration pending.' 
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Fetch Google OAuth2 Token
        const accessToken = await getGoogleOAuthToken(serviceAccount);

        // Run structured query against Firestore 'students' collection server-to-server
        const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents:runQuery`;
        const firestoreRes = await fetch(queryUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: 'students' }],
              where: {
                fieldFilter: {
                  field: { fieldPath: 'username' },
                  op: 'EQUAL',
                  value: { stringValue: username }
                }
              },
              limit: 1
            }
          })
        });

        if (!firestoreRes.ok) {
          return new Response(JSON.stringify({ success: false, code: 'INVALID_CREDENTIALS' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const queryResults = await firestoreRes.json() as any[];
        let matchedDoc: { uid: string; data: Record<string, any> } | null = null;

        if (Array.isArray(queryResults)) {
          for (const item of queryResults) {
            if (item.document) {
              matchedDoc = parseFirestoreDoc(item.document);
              break;
            }
          }
        }

        if (!matchedDoc) {
          return new Response(JSON.stringify({ success: false, code: 'INVALID_CREDENTIALS' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Secure password comparison inside Worker
        const storedPassword = (matchedDoc.data.accountPassword || '').trim();
        if (storedPassword !== password) {
          return new Response(JSON.stringify({ success: false, code: 'INVALID_CREDENTIALS' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Build STRICT safe DTO - NEVER include accountPassword in response
        const safeStudentDTO = {
          uid: matchedDoc.uid,
          displayName: matchedDoc.data.displayName || matchedDoc.data.name || matchedDoc.data.username || 'طالب',
          username: matchedDoc.data.username || username,
          academicYear: matchedDoc.data.academicYear || 3,
          currentYear: matchedDoc.data.currentYear || matchedDoc.data.academicYear || 3,
          academicSemester: matchedDoc.data.academicSemester || 1,
          role: matchedDoc.data.role || 'current',
          roleLabelAr: matchedDoc.data.roleLabelAr || 'طالب حالي',
          targetFocusTrack: matchedDoc.data.targetFocusTrack || null,
          onboardingCompleted: matchedDoc.data.onboardingCompleted ?? true,
          coursesProgress: matchedDoc.data.coursesProgress || {},
          academicGrades: matchedDoc.data.academicGrades || {},
          graduationWorkspace: matchedDoc.data.graduationWorkspace || {},
          savedLaptop: matchedDoc.data.savedLaptop || null,
          updatedAt: matchedDoc.data.updatedAt || new Date().toISOString()
        };

        return new Response(JSON.stringify({
          success: true,
          student: safeStudentDTO
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ success: false, code: 'INVALID_CREDENTIALS' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. Serve Static SPA Assets
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
