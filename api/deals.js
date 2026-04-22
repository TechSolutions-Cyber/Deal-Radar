export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const apiKey = process.env.MARKTGURU_API_KEY;
    const clientKey = process.env.MARKTGURU_CLIENT_KEY;

    const response = await fetch('https://api.marktguru.de/api/v1/offers?limit=100&offset=0', {
      headers: {
        'x-apikey': apiKey,
        'x-clientkey': clientKey,
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`API returned status ${response.status}`);

    const data = await response.json();

    const raw = Array.isArray(data.results) ? data.results
               : Array.isArray(data.offers)  ? data.offers
               : Array.isArray(data)          ? data
               : [];

    const offers = raw.map(item => ({
      title:         item.name ?? '',
      price:         item.price?.amount ?? 0,
      originalPrice: item.originalPrice?.amount ?? null,
      store:         item.retailer?.name ?? 'unbekannt',
      validFrom:     item.validFrom ?? null,
      validUntil:    item.validUntil ?? null,
      image:         item.imageUrl ?? item.image ?? null
    }));

    res.status(200).json({ success: true, offers });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
