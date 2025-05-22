import React, { useState } from 'react';
import './App.css';
import { searchAirports, searchFlights } from './api';

function App() {
  const [airportQuery, setAirportQuery] = useState('');
  const [airportResults, setAirportResults] = useState<any[]>([]);
  const [flightParams, setFlightParams] = useState({
    origin: '',
    destination: '',
    date: '',
    adults: 1,
    currency: 'USD',
    nonStop: false,
  });
  const [flightResults, setFlightResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Airport search handler
  const handleAirportSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchAirports(airportQuery);
      setAirportResults(data.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Flight search handler
  const handleFlightSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await searchFlights(flightParams);
      setFlightResults(data.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Flight Search</h1>
      <section>
        <h2>Find Airport Codes</h2>
        <input
          type="text"
          value={airportQuery}
          onChange={e => setAirportQuery(e.target.value)}
          placeholder="Enter airport name or city"
        />
        <button onClick={handleAirportSearch} disabled={loading}>Search Airports</button>
        <ul>
          {airportResults.map((a: any) => (
            <li key={a.id}>{a.name} ({a.iataCode})</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Search Flights</h2>
        <form onSubmit={handleFlightSearch}>
          <input
            type="text"
            placeholder="Origin IATA code"
            value={flightParams.origin}
            onChange={e => setFlightParams({ ...flightParams, origin: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Destination IATA code"
            value={flightParams.destination}
            onChange={e => setFlightParams({ ...flightParams, destination: e.target.value })}
            required
          />
          <input
            type="date"
            value={flightParams.date}
            onChange={e => setFlightParams({ ...flightParams, date: e.target.value })}
            required
          />
          <input
            type="number"
            min={1}
            value={flightParams.adults}
            onChange={e => setFlightParams({ ...flightParams, adults: Number(e.target.value) })}
            required
          />
          <select
            value={flightParams.currency}
            onChange={e => setFlightParams({ ...flightParams, currency: e.target.value })}
          >
            <option value="USD">USD</option>
            <option value="MXN">MXN</option>
            <option value="EUR">EUR</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={flightParams.nonStop}
              onChange={e => setFlightParams({ ...flightParams, nonStop: e.target.checked })}
            />
            Non-stop only
          </label>
          <button type="submit" disabled={loading}>Search Flights</button>
        </form>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <ul>
          {flightResults && flightResults.length > 0 && flightResults.map((f: any, idx: number) => (
            <li key={idx}>
              <pre>{JSON.stringify(f, null, 2)}</pre>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
