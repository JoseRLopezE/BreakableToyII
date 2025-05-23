import React from 'react';

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
  return (
    <div className="flight-results">
      <button onClick={onBack}>&lt; Return to Search</button>
      {results.length === 0 && <div>No flights found.</div>}
      {results.map((flight, idx) => {
        const itin = flight.itineraries?.[0];
        const segs = itin?.segments || [];
        const stops = segs.length - 1;
        const airline = segs[0]?.carrierCode;
        return (
          <div key={idx} className="flight-result-card" onClick={() => onSelect(flight)}>
            <div>
              <strong>{formatTime(segs[0]?.departure?.at)} - {formatTime(segs.at(-1)?.arrival?.at)}</strong><br />
              {segs[0]?.departure?.iataCode} - {segs.at(-1)?.arrival?.iataCode}
            </div>
            <div>
              {formatDuration(itin?.duration)} {stops > 0 ? `(${stops} stop${stops > 1 ? 's' : ''})` : '(Nonstop)'}
              {stops > 0 && segs.slice(1).map((s: any, i: number) => (
                <div key={i} style={{ fontSize: '0.9em', color: '#555' }}>{formatDuration(s.duration)} in {s.departure?.iataCode}</div>
              ))}
            </div>
            <div>
              {airline && <div>{airline}</div>}
            </div>
            <div className="price">
              <div><strong>{flight.price?.total} {flight.price?.currency}</strong> total</div>
              <div>{flight.price?.grandTotal || flight.price?.total} {flight.price?.currency} per Traveler</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
