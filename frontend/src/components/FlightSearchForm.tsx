import React, { useState } from 'react';
import { searchAirports } from '../api';

interface Props {
  onSearch: (params: any) => void;
}

const today = new Date().toISOString().split('T')[0];

export default function FlightSearchForm({ onSearch }: Props) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originOptions, setOriginOptions] = useState<any[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<any[]>([]);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [currency, setCurrency] = useState('USD');
  const [nonStop, setNonStop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAirportSearch = async (query: string, setOptions: (opts: any[]) => void) => {
    setLoading(true);
    try {
      const data = await searchAirports(query);
      setOptions(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!origin || !destination || !departureDate) return false;
    if (departureDate < today) return false;
    if (returnDate && returnDate < departureDate) return false;
    return true;
  };

  return (
    <form className="flight-search-form bg-white p-8 rounded-lg shadow-md flex flex-col gap-4 max-w-md mx-auto" onSubmit={e => {
      e.preventDefault();
      if (!validate()) {
        setError('Please check your input. Dates must be valid and not in the past.');
        return;
      }
      if (!departureDate) {
        setError('Departure date is required.');
        return;
      }
      setError(null);
      onSearch({ origin, destination, date: departureDate, returnDate, adults, currency, nonStop });
    }}>
      <div>
        <label className="font-semibold block mb-1">Departure Airport or City</label>
        <input
          type="text"
          value={origin}
          onChange={e => {
            setOrigin(e.target.value);
            if (e.target.value.length > 1) handleAirportSearch(e.target.value, setOriginOptions);
          }}
          list="origin-airports"
          required
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <datalist id="origin-airports">
          {originOptions.map((a: any) => (
            <option key={a.id} value={a.iataCode}>
              {a.name} ({a.iataCode}){a.subType === 'CITY' ? ' [City]' : ''}
            </option>
          ))}
        </datalist>
      </div>
      <div>
        <label className="font-semibold block mb-1">Arrival Airport or City</label>
        <input
          type="text"
          value={destination}
          onChange={e => {
            setDestination(e.target.value);
            if (e.target.value.length > 1) handleAirportSearch(e.target.value, setDestinationOptions);
          }}
          list="destination-airports"
          required
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <datalist id="destination-airports">
          {destinationOptions.map((a: any) => (
            <option key={a.id} value={a.iataCode}>
              {a.name} ({a.iataCode}){a.subType === 'CITY' ? ' [City]' : ''}
            </option>
          ))}
        </datalist>
      </div>
      <div>
        <label className="font-semibold block mb-1">Departure Date</label>
        <input type="date" value={departureDate} min={today} onChange={e => setDepartureDate(e.target.value)} required className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div>
        <label className="font-semibold block mb-1">Return Date</label>
        <input type="date" value={returnDate} min={departureDate || today} onChange={e => setReturnDate(e.target.value)} className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div>
        <label className="font-semibold block mb-1">Currency</label>
        <select value={currency} onChange={e => setCurrency(e.target.value)} className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="USD">USD</option>
          <option value="MXN">MXN</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <div>
        <label className="font-semibold block mb-1">Adults</label>
        <input type="number" min={1} value={adults} onChange={e => setAdults(Number(e.target.value))} required className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div>
        <label className="inline-flex items-center">
          <input type="checkbox" checked={nonStop} onChange={e => setNonStop(e.target.checked)} className="mr-2" /> Non-stop
        </label>
      </div>
      {error && <div className="text-red-600 font-semibold">{error}</div>}
      <button type="submit" disabled={loading || !validate()} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">Search</button>
    </form>
  );
}
