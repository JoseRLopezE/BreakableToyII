import React, { useEffect, useState } from 'react';
import { lookupAirline } from '../api';

interface Props {
  results: any[];
  onSelect: (flight: any) => void;
  onBack: () => void;
}

function formatTime(dt: string) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(duration: string) {
  // e.g. PT5H57M
  if (!duration) return '';
  const match = duration.match(/PT(\d+)H(\d+)M/);
  if (!match) return duration;
  const [, h, m] = match;
  return `${h}h ${m}m`;
}

export default function FlightResults({ results, onSelect, onBack }: Props) {
  const [airlineNames, setAirlineNames] = useState<{ [code: string]: string }>({});
  const [sortBy, setSortBy] = useState<'price' | 'duration' | ''>('');

  useEffect(() => {
    // Find all unique airline codes in results
    const codes = Array.from(new Set(results.flatMap(f => (f.itineraries?.[0]?.segments?.[0]?.carrierCode ? [f.itineraries[0].segments[0].carrierCode] : []))));
    codes.forEach(code => {
      if (!airlineNames[code]) {
        lookupAirline(code).then(data => {
          const name = data?.data?.[0]?.businessName || data?.data?.[0]?.commonName || data?.data?.[0]?.name || code;
          setAirlineNames(prev => ({ ...prev, [code]: name }));
        }).catch(() => {
          setAirlineNames(prev => ({ ...prev, [code]: code }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Sorting logic
  let sortedResults = [...results];
  if (sortBy === 'price') {
    sortedResults.sort((a, b) => parseFloat(a.price?.total || '0') - parseFloat(b.price?.total || '0'));
  } else if (sortBy === 'duration') {
    sortedResults.sort((a, b) => {
      const durA = a.itineraries?.[0]?.duration || '';
      const durB = b.itineraries?.[0]?.duration || '';
      // Convert PT#H#M to minutes
      const toMinutes = (d: string) => {
        const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (!m) return 0;
        return (parseInt(m[1] || '0') * 60) + parseInt(m[2] || '0');
      };
      return toMinutes(durA) - toMinutes(durB);
    });
  }

  return (
    <div className="flight-results max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&lt; Return to Search</button>
      <div className="mb-4 flex items-center gap-2">
        <label className="font-semibold">Sort by:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'price' | 'duration' | '')} className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">None</option>
          <option value="price">Price</option>
          <option value="duration">Duration</option>
        </select>
      </div>
      {sortedResults.length === 0 && <div className="text-gray-500">No flights found.</div>}
      <div className="flex flex-col gap-4">
      {sortedResults.map((flight, idx) => {
        const itin = flight.itineraries?.[0];
        const segs = itin?.segments || [];
        const stops = segs.length - 1;
        const airline = segs[0]?.carrierCode;
        return (
          <div key={idx} className="flight-result-card bg-white rounded-lg shadow p-4 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition" onClick={() => onSelect(flight)}>
            <div className="flex justify-between items-center">
              <div>
                <strong>{formatTime(segs[0]?.departure?.at)} - {formatTime(segs.at(-1)?.arrival?.at)}</strong><br />
                {segs[0]?.departure?.iataCode} - {segs.at(-1)?.arrival?.iataCode}
              </div>
              <div className="text-right">
                {airline && <div className="font-semibold text-blue-700">{airlineNames[airline] || airline}</div>}
                <div className="text-lg font-bold">{flight.price?.total} {flight.price?.currency}</div>
                <div className="text-xs text-gray-500">{flight.price?.grandTotal || flight.price?.total} {flight.price?.currency} per Traveler</div>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              {formatDuration(itin?.duration)} {stops > 0 ? `(${stops} stop${stops > 1 ? 's' : ''})` : '(Nonstop)'}
              {stops > 0 && segs.slice(1).map((s: any, i: number) => (
                <div key={i} className="text-xs text-gray-500">{formatDuration(s.duration)} in {s.departure?.iataCode}</div>
              ))}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
