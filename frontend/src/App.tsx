import React, { useState } from 'react';
import './App.css';
import FlightSearchForm from './components/FlightSearchForm';
import FlightResults from './components/FlightResults';
import FlightDetails from './components/FlightDetails';
import { searchFlights } from './api';

function App() {
  const [page, setPage] = useState<'search' | 'results' | 'details'>('search');
  const [flightResults, setFlightResults] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchFlights(params);
      setFlightResults(data.data || []);
      setPage('results');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight: any) => {
    setSelectedFlight(flight);
    setPage('details');
  };

  const handleBackToResults = () => setPage('results');
  const handleBackToSearch = () => setPage('search');

  return (
    <div className="App">
      <h1>Flight Search</h1>
      {page === 'search' && <FlightSearchForm onSearch={handleSearch} />}
      {page === 'results' && (
        <FlightResults results={flightResults} onSelect={handleSelectFlight} onBack={handleBackToSearch} />
      )}
      {page === 'details' && selectedFlight && (
        <FlightDetails flight={selectedFlight} onBack={handleBackToResults} />
      )}
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default App;
