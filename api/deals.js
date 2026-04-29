// Vercel Edge Function – Marktguru API Proxy
// Ruft automatisch API-Keys von der Marktguru-Website ab und leitet
// Suchanfragen an die Marktguru-API weiter.

export const config = { runtime: 'edge' };

// --- Memory-Cache für API-Keys (6 Stunden) ---
let cachedKeys = null;
let cacheTime = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 Stunden in Millisekunden

/**
 * Lädt die Marktguru-Startseite und extrahiert x-apikey und x-clientkey
 * per Regex aus dem HTML-Quelltext.
 * Keys werden 6 Stunden im Modul-Scope gecacht.
 *
 * @returns {{ apiKey: string, clientKey: string }}
 */
async function fetchKeys() {
  const jetzt = Date.now();

  // Cache noch gültig – Keys direkt zurückgeben
  if (cachedKeys && jetzt - cacheTime < CACHE_TTL_MS) {
    return cachedKeys;
  }

  // Startseite laden
  const response = await fetch('https://www.marktguru.de/', {
    headers: {
      // Browser-User-Agent, um Blockierungen zu vermeiden
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Marktguru-Startseite nicht erreichbar (HTTP ${response.status})`
    );
  }

  const html = await response.text();

  // Regex-Suche nach den eingebetteten Keys
  const apiKeyMatch = html.match(/x-apikey"\s*:\s*"([^"]+)"/);
  const clientKeyMatch = html.match(/x-clientkey"\s*:\s*"([^"]+)"/);

  if (!apiKeyMatch || !clientKeyMatch) {
    throw new Error(
      'API-Keys konnten nicht aus dem HTML der Marktguru-Startseite extrahiert werden. ' +
        'Möglicherweise hat sich das Seitenformat geändert.'
    );
  }

  // Keys cachen und Zeitstempel setzen
  cachedKeys = {
    apiKey: apiKeyMatch[1],
    clientKey: clientKeyMatch[1],
  };
  cacheTime = jetzt;

  return cachedKeys;
}

/**
 * Haupt-Handler der Vercel Edge Function.
 * Liest Query-Parameter q und zipCode aus der Anfrage,
 * holt die API-Keys und fragt die Marktguru-Such-API ab.
 *
 * @param {Request} request
 * @returns {Response}
 */
export default async function handler(request) {
  // CORS-Preflight-Anfragen direkt beantworten
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    // Query-Parameter auslesen
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? 'milch';
    const zip = searchParams.get('zipCode') ?? '68159'; // Standard: Mannheim

    // API-Keys holen (aus Cache oder frisch von der Website)
    const { apiKey, clientKey } = await fetchKeys();

    // Marktguru Such-API aufrufen
    const apiUrl =
      `https://api.marktguru.de/api/v1/offers/search` +
      `?as=web&limit=50&offset=0` +
      `&q=${encodeURIComponent(q)}` +
      `&zipCode=${encodeURIComponent(zip)}`;

    const apiResponse = await fetch(apiUrl, {
      headers: {
        'x-apikey': apiKey,
        'x-clientkey': clientKey,
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (!apiResponse.ok) {
      throw new Error(
        `Marktguru-API antwortete mit HTTP ${apiResponse.status}`
      );
    }

    const data = await apiResponse.json();

    // Erfolgreiche Antwort mit CORS-Header zurückgeben
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  } catch (err) {
    // Fehlermeldung als strukturiertes JSON zurückgeben
    return new Response(
      JSON.stringify({ error: err.message ?? 'Unbekannter Fehler' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(),
        },
      }
    );
  }
}

/**
 * Gibt die CORS-Header als Objekt zurück.
 * @returns {Record<string, string>}
 */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
