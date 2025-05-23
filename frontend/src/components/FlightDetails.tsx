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
    <div className="flight-details max-w-4xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&lt; Back to Results</button>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {flight.itineraries?.map((itin: any, itinIdx: number) => (
            itin.segments?.map((seg: any, segIdx: number) => (
              <div key={`itin${itinIdx}-seg${segIdx}`} className="mb-6 p-4 border-b last:border-b-0">
                <div className="font-bold text-lg mb-1">Segment {segIdx + 1}</div>
                <div className="text-gray-700 mb-1">{formatTime(seg.departure?.at)} - {formatTime(seg.arrival?.at)}</div>
                <div className="mb-1">{seg.departure?.iataCode} - {seg.arrival?.iataCode}</div>
                <div className="mb-1">{airlineNames[String(seg.carrierCode)] || seg.carrierCode} {seg.number} {seg.operating && seg.operating.carrierCode !== seg.carrierCode ? `(Operated by ${airlineNames[String(seg.operating.carrierCode)] || seg.operating.carrierCode})` : ''}</div>
                <div className="mb-1 text-sm text-gray-500">Aircraft: {seg.aircraft?.code}</div>
                <div className="mt-2">
                  <div className="font-semibold">Travelers fare details</div>
                  {flight.travelerPricings?.map((tp: any, tIdx: number) => {
                    // Try to match fare by segmentId, but fallback to first fare if not found
                    let fare = tp.fareDetailsBySegment?.find((f: any) => f.segmentId === seg.id);
                    if (!fare && Array.isArray(tp.fareDetailsBySegment) && tp.fareDetailsBySegment.length === 1) {
                      fare = tp.fareDetailsBySegment[0];
                    }
                    // Debug: log segmentId and fare
                    // console.log('Segment', seg.id, 'Fare', fare);
                    return (
                      <div key={tIdx} className="mb-2 text-sm">
                        <span className="font-medium">Traveler {tIdx + 1}:</span> {fare?.cabin || 'N/A'} / {fare?.class || 'N/A'}
                        <br />Amenities: {Array.isArray(fare?.amenities) && fare.amenities.length > 0
                          ? fare.amenities.map((a: any, i: number) =>
                              a?.description
                                ? `${a.description}${a.isChargeable ? ' (chargeable)' : ''}`
                                : null
                            ).filter(Boolean).join(', ')
                          : 'None'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ))}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="font-bold mb-2">Price Breakdown</div>
            <div>Base: {flight.price?.base} {flight.price?.currency}</div>
            <div>
              Estimated Fees: {flight.price?.fees && flight.price.fees.length > 0
                ? flight.price.fees.map((f: any, i: number) => (
                    <span key={i}>{f.amount} {flight.price?.currency}{i < flight.price.fees.length - 1 ? ', ' : ''}</span>
                  ))
                : '0.00'}
            </div>
            <div className="font-semibold">Total: {flight.price?.total} {flight.price?.currency}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-bold mb-2">Per Traveler</div>
            {flight.travelerPricings?.map((tp: any, tIdx: number) => (
              <div key={tIdx} className="mb-1">
                Traveler {tIdx + 1}: {tp.price?.total} {flight.price?.currency}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
