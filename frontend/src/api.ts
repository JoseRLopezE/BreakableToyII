// API utility for frontend to call backend endpoints
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export async function searchAirports(keyword: string) {
  const res = await fetch(`${API_URL}/airports?keyword=${encodeURIComponent(keyword)}`);
  if (!res.ok) throw new Error('Failed to fetch airports');
  return res.json();
}

export async function searchFlights(params: {
  origin: string;
  destination: string;
  date: string;
  adults: number;
  currency: string;
  nonStop: boolean;
}) {
  const query = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    adults: params.adults.toString(),
    currency: params.currency,
    nonStop: params.nonStop ? 'true' : 'false',
  });
  const res = await fetch(`${API_URL}/flights?${query}`);
  if (!res.ok) throw new Error('Failed to fetch flights');
  return res.json();
}

export async function lookupAirline(code: string) {
  const res = await fetch(`${API_URL}/airline?code=${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('Failed to fetch airline info');
  return res.json();
}
