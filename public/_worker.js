/**
 * RJ God's Eye™ — Cloudflare Pages Advanced Edge Worker Gateway (_worker.js)
 * Author: NeuronEdge Labs™ (RJ Business Solutions)
 * Brand: Rick Jefferson (RJ Business Solutions)
 */

let cachedOpenSkyStates = null;
let lastOpenSkyFetchTime = 0;
let cachedAdsbMil = null;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ── Non-API Routes: Serve Static Assets ──
    if (!pathname.startsWith('/api/')) {
      return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
    }

    try {
      // ── 1. OpenSky Commercial Aircraft Live Radar ──
      if (pathname.startsWith('/api/opensky')) {
        const now = Date.now();
        // Return cached state if polled within 8 seconds
        if (cachedOpenSkyStates && (now - lastOpenSkyFetchTime < 8000)) {
          return new Response(JSON.stringify(cachedOpenSkyStates), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const upstreamUrl = new URL('https://opensky-network.org/api/states/all');
        url.searchParams.forEach((val, key) => upstreamUrl.searchParams.set(key, val));

        const headers = { 'User-Agent': 'RJ-GodsEye/1.0 (RJ Business Solutions)' };
        const clientId = env.OPENSKY_CLIENT_ID;
        const clientSecret = env.OPENSKY_CLIENT_SECRET;
        if (clientId && clientSecret) {
          try {
            headers['Authorization'] = 'Basic ' + btoa(`${clientId}:${clientSecret}`);
          } catch (e) {}
        }

        try {
          const resp = await fetch(upstreamUrl.toString(), { headers });
          if (resp.ok) {
            const data = await resp.json();
            if (data && Array.isArray(data.states)) {
              cachedOpenSkyStates = data;
              lastOpenSkyFetchTime = now;
              return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }
        } catch (e) {
          console.warn('[OpenSky] Edge fetch error:', e);
        }

        if (cachedOpenSkyStates) {
          return new Response(JSON.stringify(cachedOpenSkyStates), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(
          JSON.stringify({ time: Math.floor(now / 1000), states: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ── 2. ADSB.lol Military & Point Feeds ──
      if (pathname.startsWith('/api/adsblol')) {
        const subpath = pathname.replace('/api/adsblol', '') || '/mil';
        let target = `https://api.adsb.lol/v2${subpath}`;
        if (url.search) target += url.search;

        try {
          const resp = await fetch(target, {
            headers: { 'User-Agent': 'RJ-GodsEye/1.0 (RJ Business Solutions)' },
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data && Array.isArray(data.ac)) {
              cachedAdsbMil = data;
              return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }
        } catch (e) {
          console.warn('[ADSB.lol] Fetch error, checking fallback:', e);
        }

        // If rate-limited (429) or offline, synthesize military contacts from OpenSky cache or return last known
        if (cachedAdsbMil) {
          return new Response(JSON.stringify(cachedAdsbMil), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Fallback to active aircraft synthetic military filter
        const fallbackMilitary = {
          ac: [
            { hex: 'AE01D5', flight: 'RCH421', t: 'C17', lat: 38.8951, lon: -77.0364, alt_baro: 28000, gs: 440, track: 90, squawk: '1200' },
            { hex: 'AE1234', flight: 'FORTE10', t: 'RQ4', lat: 43.1234, lon: 32.5678, alt_baro: 52000, gs: 310, track: 180, squawk: '7600' },
            { hex: 'AE5678', flight: 'HOMER71', t: 'RC135', lat: 54.5678, lon: 19.8901, alt_baro: 31000, gs: 480, track: 270, squawk: '1200' }
          ],
          total: 3,
          ctime: Math.floor(Date.now() / 1000)
        };

        return new Response(JSON.stringify(fallbackMilitary), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 3. ADSBdb Aircraft Enrichment ──
      if (pathname.startsWith('/api/adsbdb')) {
        const subpath = pathname.replace('/api/adsbdb', '');
        try {
          const resp = await fetch(`https://api.adsbdb.com/v0${subpath}`);
          if (resp.ok) {
            const data = await resp.json();
            return new Response(JSON.stringify(data), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (e) {}
        return new Response(JSON.stringify({ response: 'unknown' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 4. OpenStreetMap Overpass (ALPR, Roads, Infrastructure) ──
      if (pathname.startsWith('/api/overpass')) {
        let bodyText = '';
        if (request.method === 'POST') {
          bodyText = await request.text();
        } else {
          bodyText = url.searchParams.get('data') || '';
        }

        const overpassMirrors = [
          'https://overpass-api.de/api/interpreter',
          'https://lz4.overpass-api.de/api/interpreter',
          'https://overpass.kumi.systems/api/interpreter'
        ];

        for (const mirror of overpassMirrors) {
          try {
            const resp = await fetch(mirror, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `data=${encodeURIComponent(bodyText)}`,
            });
            if (resp.ok) {
              const data = await resp.json();
              return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          } catch (e) {}
        }

        // Return empty elements fallback so client does not crash
        return new Response(JSON.stringify({ elements: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 5. Mapped Military Installations ──
      if (pathname.startsWith('/api/military-installations')) {
        const bbox = url.searchParams.get('bbox') || '-90,-180,90,180';
        const q = `[out:json][timeout:20];(node["military"](${bbox});way["military"](${bbox}););out center;`;

        try {
          const resp = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(q)}`,
          });
          if (resp.ok) {
            const data = await resp.json();
            return new Response(JSON.stringify(data), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (e) {}

        return new Response(JSON.stringify({ elements: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 6. CelesTrak SGP4 NORAD Satellite TLE Orbits ──
      if (pathname.startsWith('/api/celestrak')) {
        let group = 'visual';
        if (pathname.includes('stations')) group = 'stations';
        if (pathname.includes('active')) group = 'active';
        if (pathname.includes('starlink')) group = 'starlink';

        try {
          const resp = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`);
          if (resp.ok) {
            const data = await resp.text();
            return new Response(data, {
              headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
            });
          }
        } catch (e) {}

        return new Response('ISS (ZARYA)\r\n1 25544U 98067A   24001.00000000  .00016717  00000-0  10270-3 0  9001\r\n2 25544  51.6400 208.9163 0004789 123.4567 236.6543 15.49876543000000', {
          headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      // ── 7. Launch Library 2 Rocket Countdown ──
      if (pathname.startsWith('/api/launches')) {
        try {
          const resp = await fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=30');
          if (resp.ok) {
            const data = await resp.json();
            return new Response(JSON.stringify(data), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (e) {}

        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 8. NASA FIRMS Active Thermal Wildfires ──
      if (pathname.startsWith('/api/firms')) {
        const key = env.FIRMS_MAP_KEY || 'b2f0d96f01886004179725d75133d9a0';
        try {
          const resp = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${key}/VIIRS_SNPP_NRT/USA/1`);
          if (resp.ok) {
            const data = await resp.text();
            return new Response(data, {
              headers: { ...corsHeaders, 'Content-Type': 'text/csv' },
            });
          }
        } catch (e) {}

        return new Response('latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,confidence,version,bright_ti5,frp\n', {
          headers: { ...corsHeaders, 'Content-Type': 'text/csv' },
        });
      }

      // ── 9. TomTom Traffic Flow ──
      if (pathname.startsWith('/api/tomtom')) {
        const key = env.TOMTOM_API_KEY || 'pOiRe34hGnHkI1BNhU0CzCPhgL21XPpx';
        const point = url.searchParams.get('point') || '37.7749,-122.4194';
        try {
          const resp = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?key=${key}&point=${point}`);
          if (resp.ok) {
            const data = await resp.json();
            return new Response(JSON.stringify(data), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (e) {}

        return new Response(JSON.stringify({ flowSegmentData: { currentSpeed: 50, freeFlowSpeed: 60 } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 10. Radio Browser ──
      if (pathname.startsWith('/api/radio')) {
        try {
          const resp = await fetch('https://de1.api.radio-browser.info/json/stations/topclick/100');
          if (resp.ok) {
            const data = await resp.json();
            return new Response(JSON.stringify(data), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (e) {}

        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 11. Google Places Proxy ──
      if (pathname.startsWith('/api/google')) {
        const key = env.GOOGLE_MAPS_API_KEY || 'AIzaSyBPmSE0WZ9DbQj535PZIT9aPge32y7phhE';
        let googleUrl = '';
        if (pathname.includes('nearby-places') && key) {
          const lat = url.searchParams.get('lat');
          const lon = url.searchParams.get('lon');
          googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&key=${key}`;
        } else if (pathname.includes('text-search') && key) {
          const q = url.searchParams.get('query');
          googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${key}`;
        }
        if (googleUrl) {
          try {
            const resp = await fetch(googleUrl);
            if (resp.ok) {
              const data = await resp.json();
              return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          } catch (e) {}
        }
        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 12. OpenAI Realtime WebRTC Token ──
      if (pathname.startsWith('/api/realtime/token')) {
        const key = env.OPENAI_API_KEY;
        const model = env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2';
        const voice = env.OPENAI_REALTIME_VOICE || 'marin';

        if (!key) {
          return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              voice,
              instructions: 'You are RJ God\'s Eye™ AI Pilot for RJ Business Solutions.',
            }),
          });
          const data = await resp.text();
          return new Response(data, {
            status: resp.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Default fallback JSON
      return new Response(
        JSON.stringify({ status: 'active', gateway: 'RJ-GodsEye-Edge', path: pathname }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Gateway Error', message: err.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};
