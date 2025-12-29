import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PartRequest {
  requestedPartNumber: string;
  manufacturerName?: string;
  referenceDesignator?: string;
  customerReference?: string;
  notes?: string;
  quantities: { quantity: number }[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parts: PartRequest[] = req.body;

    if (!Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ error: 'Invalid request: expected array of parts' });
    }

    // Format parts with all optional fields
    const formattedParts = parts.map(part => ({
      requestedPartNumber: part.requestedPartNumber,
      manufacturerName: part.manufacturerName || '',
      referenceDesignator: part.referenceDesignator || '',
      customerReference: part.customerReference || '',
      notes: part.notes || '',
      quantities: part.quantities
    }));

    // Create list name with timestamp
    const listName = `BOM_Import_${new Date().toISOString().slice(0, 10)}`;

    // Call DigiKey's MyLists Third-Party API with required listName parameter
    const apiUrl = `https://www.digikey.com/mylists/api/thirdparty?listName=${encodeURIComponent(listName)}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(formattedParts)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DigiKey API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `DigiKey API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Failed to create DigiKey cart',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
