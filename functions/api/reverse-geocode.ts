import { PagesContext, json, readJson, requiredEnv } from '../_shared';

function readComponent(result: any, types: string[]): string {
  const component = (result?.address_components || []).find((item: any) =>
    types.some((type) => Array.isArray(item?.types) && item.types.includes(type)),
  );
  return typeof component?.long_name === 'string' ? component.long_name : '';
}

function validateCoordinate(value: unknown, minimum: number, maximum: number): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    throw new Error('Coordinate GPS non valide');
  }
  return Number(number.toFixed(7));
}

function buildAddress(result: any): {
  address: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
} {
  const street = readComponent(result, ['route', 'street_address']);
  const houseNumber = readComponent(result, ['street_number', 'premise']);
  const postalCode = readComponent(result, ['postal_code']);
  const city = readComponent(result, ['locality', 'postal_town', 'administrative_area_level_3', 'administrative_area_level_2']);
  const streetLine = [street, houseNumber].filter(Boolean).join(' ');
  const localityLine = [postalCode, city].filter(Boolean).join(' ');
  const address = [streetLine, localityLine].filter(Boolean).join(', ') || String(result?.formatted_address || '').trim();

  return { address, street, houseNumber, postalCode, city };
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  try {
    const body = await readJson(context.request);
    const latitude = validateCoordinate(body.latitude, -90, 90);
    const longitude = validateCoordinate(body.longitude, -180, 180);
    const apiKey = requiredEnv(context.env, 'GOOGLE_MAPS_API_KEY');
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${latitude},${longitude}`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('language', 'it');
    url.searchParams.set('region', 'it');

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status !== 'OK' || !Array.isArray(data.results) || data.results.length === 0) {
      const providerMessage = data.error_message || data.status || 'indirizzo non trovato';
      throw new Error(`Non è stato possibile trovare una strada per questa posizione (${providerMessage}).`);
    }

    const result = data.results.find((candidate: any) =>
      Array.isArray(candidate?.types) && candidate.types.some((type: string) => ['street_address', 'premise', 'route'].includes(type)),
    ) || data.results[0];
    const address = buildAddress(result);
    if (!address.address) throw new Error('La posizione non corrisponde a un indirizzo stradale riconoscibile.');

    return json({ ...address, latitude, longitude });
  } catch (error: any) {
    console.error('Reverse geocode error:', error);
    const rawMessage = error?.message || 'Impossibile ottenere l’indirizzo della posizione';
    const missingConfiguration = rawMessage.startsWith('Configurazione server mancante');
    const message = missingConfiguration
      ? 'Il rilevamento automatico degli indirizzi non è ancora configurato. Inserisci via, numero civico e città manualmente.'
      : rawMessage;
    const status = missingConfiguration ? 503 : 400;
    return json({ error: message }, status);
  }
}
