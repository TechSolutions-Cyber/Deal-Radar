export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const url = 'https://api.marktguru.de/api/v1/offers?as=web&limit=100&offset=0';

    const response = await fetch(url, {
      headers: {
        'x-apikey': 'wB9MkCNNpJwbKSNBjTCHkTmBIgrR5hfzGEyUPgVp',
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();

    const offers = Array.isArray(data.results) ? data.results
                 : Array.isArray(data.offers)  ? data.offers
                 : Array.isArray(data)          ? data
                 : [];

    const deals = offers.map((item, i) => {
      const rawChain = item.retailer?.name ?? 'unbekannt';
      const chain = rawChain.toLowerCase().replace(/\s+/g, '-');
      const pricew = item.price?.amount ?? 0;
      return {
        id:        item.id ?? i,
        chain,
        name:      item.name ?? '',
        cat:       'sonstiges',
        emoji:     '🛒',
        pricew,
        pricea:    Math.round(pricew * 1.4 * 100) / 100,
        validFrom: item.validFrom   ?? null,
        validTo:   item.validUntil  ?? null,
        weekOnly:  true,
        label:     'Mo – Sa'
      };
    });

    res.status(200).json({ source: 'live', deals });

  } catch (err) {
    res.status(200).json({ source: 'fallback', deals: [] });
  }
}
