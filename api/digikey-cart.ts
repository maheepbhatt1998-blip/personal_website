import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PartRequest {
  requestedPartNumber: string;
  quantities: { quantity: number }[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const parts: PartRequest[] = req.body;

    if (!Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ error: 'Invalid request: expected array of parts' });
    }

    // Call DigiKey's MyLists Third-Party API
    const response = await fetch('https://www.digikey.com/mylists/api/thirdparty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(parts)
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
