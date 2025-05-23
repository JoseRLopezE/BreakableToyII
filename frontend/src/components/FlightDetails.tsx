import React from 'react';

interface Props {
  flight: any;
  onBack: () => void;
}

function formatTime(dt: string) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function FlightDetails({ flight, onBack }: Props) {
  return (
    <div className="flight-details">
      <button onClick={onBack}>&lt; Back to Results</button>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 2 }}>
          {flight.itineraries?.map((itin: any, i: number) => (
            <div key={i} className="segment-box">
              <div className="segment-info">
                <div><strong>Segment {i + 1}</strong></div>
                {itin.segments?.map((seg: any, j: number) => (
                  <div key={j} style={{ marginBottom: 8 }}>
                    {formatTime(seg.departure?.at)} - {formatTime(seg.arrival?.at)}<br />
                    {seg.departure?.iataCode} - {seg.arrival?.iataCode}<br />
                    {seg.carrierCode} {seg.number} {seg.operating && seg.operating.carrierCode !== seg.carrierCode ? `(Operated by ${seg.operating.carrierCode})` : ''}<br />
                    Aircraft: {seg.aircraft?.code}<br />
                  </div>
                ))}
              </div>
              <div className="fare-details">
                <div><strong>Travelers fare details</strong></div>
                {/* Add traveler fare details per segment if available */}
                {flight.travelerPricings?.map((tp: any, tIdx: number) => (
                  <div key={tIdx} style={{ marginBottom: 8 }}>
                    Traveler {tIdx + 1}: {tp.fareDetailsBySegment?.[i]?.cabin} / {tp.fareDetailsBySegment?.[i]?.class}
                    <br />Amenities: {tp.fareDetailsBySegment?.[i]?.amenities?.map((a: any) => `${a.name}${a.chargeable ? ' (chargeable)' : ''}`).join(', ')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div className="price-breakdown">
            <div><strong>Price Breakdown</strong></div>
            <div>Base: {flight.price?.base} {flight.price?.currency}</div>
            <div>Fees: {flight.price?.fees?.map((f: any) => `${f.amount} ${flight.price?.currency}`).join(', ')}</div>
            <div>Total: {flight.price?.total} {flight.price?.currency}</div>
          </div>
          <div className="per-traveler">
            <div><strong>Per Traveler</strong></div>
            {flight.travelerPricings?.map((tp: any, tIdx: number) => (
              <div key={tIdx}>
                Traveler {tIdx + 1}: {tp.price?.total} {flight.price?.currency}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
