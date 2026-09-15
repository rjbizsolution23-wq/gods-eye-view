/**
 * RJ God's Eye™ — Cloudflare Pages Advanced Edge Worker Gateway (_worker.js)
 * Author: NeuronEdge Labs™ (RJ Business Solutions)
 * Brand: Rick Jefferson (RJ Business Solutions)
 */

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
      // ── 1. OpenSky Network ADS-B Flight Radar ──
      if (pathname.startsWith('/api/opensky')) {
        const upstreamUrl = new URL('https://opensky-network.org/api/states/all');
        url.searchParams.forEach((val, key) => upstreamUrl.searchParams.set(key, val));

        const headers = { 'User-Agent': 'RJ-GodsEye/1.0 (RJ Business Solutions)' };

        const clientId = env.OPENSKY_CLIENT_ID || 'support@rjbizsolution.com-api-client';
        const clientSecret = env.OPENSKY_CLIENT_SECRET || 'gaTceaqJqBAcqw9scednJ6055E8ro7Zb';

        if (clientId && clientSecret) {
          try {
            headers['Authorization'] = 'Basic ' + btoa(`${clientId}:${clientSecret}`);
          } catch (e) {}
        }

        try {
          const resp = await fetch(upstreamUrl.toString(), { headers });
          if (resp.ok) {
            const data = await resp.json();
            return new Response(JSON.stringify(data), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (err) {
          console.warn('[OpenSky] Upstream error, falling back to adsb.lol:', err);
        }

        // Fallback to adsb.lol if OpenSky is rate-limited or unavailable
        const fallbackResp = await fetch('https://api.adsb.lol/v2/mil');
        if (fallbackResp.ok) {
          const lolData = await fallbackResp.json();
          const states = (lolData.ac || []).map((ac) => [
            ac.hex || '',
            (ac.flight || ac.r || '').trim(),
            ac.t || 'Unknown',
            ac.seen_pos || 0,
            ac.seen || 0,
            ac.lon || 0,
            ac.lat || 0,
            ac.alt_baro != null ? Number(ac.alt_baro) * 0.3048 : 0,
            ac.alt_baro === 'ground',
            ac.gs != null ? Number(ac.gs) * 0.514444 : 0,
            ac.track || 0,
            0,
            null,
            ac.alt_geom != null ? Number(ac.alt_geom) * 0.3048 : null,
            ac.squawk || null,
            false,
            0,
          ]);
          return new Response(
            JSON.stringify({ time: Math.floor(Date.now() / 1000), states }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // ── 2. ADSB.lol Military & Civilian Air Feeds ──
      if (pathname.startsWith('/api/adsblol')) {
        const subpath = pathname.replace('/api/adsblol', '');
        let target = `https://api.adsb.lol/v2${subpath || '/mil'}`;
        if (url.search) target += url.search;

        const resp = await fetch(target, {
          headers: { 'User-Agent': 'RJ-GodsEye/1.0 (RJ Business Solutions)' },
        });
        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 3. ADSBdb Aircraft Enrichment Metadata ──
      if (pathname.startsWith('/api/adsbdb')) {
        const subpath = pathname.replace('/api/adsbdb', '');
        const resp = await fetch(`https://api.adsbdb.com/v0${subpath}`);
        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 4. OpenStreetMap Overpass (ALPR, Infrastructure, Roads) ──
      if (pathname.startsWith('/api/overpass')) {
        let bodyText = '';
        if (request.method === 'POST') {
          bodyText = await request.text();
        } else {
          bodyText = url.searchParams.get('data') || '';
        }

        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const resp = await fetch(overpassUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(bodyText)}`,
        });

        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 5. Mapped Military Installations (Overpass proxy) ──
      if (pathname.startsWith('/api/military-installations')) {
        const bbox = url.searchParams.get('bbox') || '-90,-180,90,180';
        const q = `[out:json][timeout:25];(node["military"](${bbox});way["military"](${bbox}););out center;`;
        const resp = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(q)}`,
        });
        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 6. CelesTrak SGP4 NORAD Satellite TLE Orbits ──
      if (pathname.startsWith('/api/celestrak')) {
        let group = 'visual';
        if (pathname.includes('stations')) group = 'stations';
        if (pathname.includes('active')) group = 'active';
        if (pathname.includes('starlink')) group = 'starlink';

        const resp = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`);
        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      // ── 7. Launch Library 2 Rocket Countdown Missions ──
      if (pathname.startsWith('/api/launches')) {
        const resp = await fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=30');
        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 8. NASA FIRMS Active Thermal Wildfires ──
      if (pathname.startsWith('/api/firms')) {
        const key = env.FIRMS_MAP_KEY || 'b2f0d96f01886004179725d75133d9a0';
        const resp = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${key}/VIIRS_SNPP_NRT/USA/1`);
        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'text/csv' },
        });
      }

      // ── 9. TomTom Traffic Flow Vector Feeds ──
      if (pathname.startsWith('/api/tomtom')) {
        const key = env.TOMTOM_API_KEY || 'pOiRe34hGnHkI1BNhU0CzCPhgL21XPpx';
        const point = url.searchParams.get('point') || '37.7749,-122.4194';
        const resp = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?key=${key}&point=${point}`);
        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 10. Radio Browser Worldwide Audio Feeds ──
      if (pathname.startsWith('/api/radio')) {
        const resp = await fetch('https://de1.api.radio-browser.info/json/stations/topclick/100');
        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 11. Google Places & Geocoding Proxy ──
      if (pathname.startsWith('/api/google')) {
        const key = env.GOOGLE_MAPS_API_KEY || 'AIzaSyBPmSE0WZ9DbQj535PZIT9aPge32y7phhE';
        let googleUrl = '';
        if (pathname.includes('nearby-places')) {
          const lat = url.searchParams.get('lat');
          const lon = url.searchParams.get('lon');
          googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&key=${key}`;
        } else if (pathname.includes('text-search')) {
          const q = url.searchParams.get('query');
          googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${key}`;
        }
        if (googleUrl) {
          const resp = await fetch(googleUrl);
          const data = await resp.text();
          return new Response(data, {
            status: resp.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // ── 12. OpenAI Realtime WebRTC Token Endpoint ──
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

        const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            voice,
            instructions: 'You are RJ God\'s Eye™ AI Pilot for RJ Business Solutions. Assist the operator with 3D planetary tracking and tactical navigation.',
          }),
        });

        const data = await resp.text();
        return new Response(data, {
          status: resp.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 13. Default JSON response for unknown API routes ──
      return new Response(
        JSON.stringify({ status: 'active', gateway: 'RJ-GodsEye-Edge', path: pathname }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Gateway Error', message: err.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};
