import React, { useEffect, useState } from 'react';
import { lookupAirline } from '../api';

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
  const [airlineNames, setAirlineNames] = useState<Record<string, string>>({});

  useEffect(() => {
    // Collect all unique carrier codes from all segments
    const codes = Array.from(new Set(
      (flight.itineraries || []).flatMap((itin: any) =>
        (itin.segments || []).map((seg: any) => String(seg.carrierCode))
      )
    ));
    codes.forEach(code => {
      if (code && typeof code === 'string' && !(code in airlineNames)) {
        lookupAirline(code).then(data => {
          const name = data?.data?.[0]?.businessName || data?.data?.[0]?.commonName || data?.data?.[0]?.name || code;
          setAirlineNames(prev => ({ ...prev, [code]: name }));
        }).catch(() => {
          setAirlineNames(prev => ({ ...prev, [code]: code }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight]);

  return (
    <div className="flight-details">
      <button onClick={onBack}>&lt; Back to Results</button>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 2 }}>
          {flight.itineraries?.map((itin: any, itinIdx: number) => (
            itin.segments?.map((seg: any, segIdx: number) => (
              <div key={`itin${itinIdx}-seg${segIdx}`} className="segment-box">
                <div className="segment-info">
                  <div><strong>Segment {segIdx + 1}</strong></div>
                  {formatTime(seg.departure?.at)} - {formatTime(seg.arrival?.at)}<br />
                  {seg.departure?.iataCode} - {seg.arrival?.iataCode}<br />
                  {airlineNames[String(seg.carrierCode)] || seg.carrierCode} {seg.number} {seg.operating && seg.operating.carrierCode !== seg.carrierCode ? `(Operated by ${airlineNames[String(seg.operating.carrierCode)] || seg.operating.carrierCode})` : ''}<br />
                  Aircraft: {seg.aircraft?.code}<br />
                </div>
                <div className="fare-details">
                  <div><strong>Travelers fare details</strong></div>
                  {flight.travelerPricings?.map((tp: any, tIdx: number) => {
                    const fare = tp.fareDetailsBySegment?.find((f: any) => f.segmentId === seg.id);
                    return (
                      <div key={tIdx} style={{ marginBottom: 8 }}>
                        Traveler {tIdx + 1}: {fare?.cabin || 'N/A'} / {fare?.class || 'N/A'}
                        <br />Amenities: {Array.isArray(fare?.amenities) && fare.amenities.length > 0 ? fare.amenities.map((a: any) => a?.name ? `${a.name}${a.chargeable ? ' (chargeable)' : ''}` : null).filter(Boolean).join(', ') : 'None'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
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
