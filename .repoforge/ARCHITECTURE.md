# Technical Architecture: RJ God's Eye™

```text
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT TIER (Vite 6)                   │
│  - CesiumJS 1.124 Photorealistic 3D Engine                  │
│  - RJ Brand Kit Design System (tokens.css / brand.css)      │
│  - Voice Mission Controller (OpenAI Realtime WebRTC)        │
│  - HUD & Spatial Layer Controllers                          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Authenticated WS / REST
┌──────────────────────────────▼──────────────────────────────┐
│             EDGE API & PROXY TIER (Node / Cloudflare)       │
│  - Per-User Rate Limiting & Token Auth                      │
│  - Provider Connectors (ADS-B, AISStream, CelesTrak, USGS)   │
│  - Secret Vault (Google Maps API, Cesium ion, TomTom)       │
│  - Strip-Key Sanitizer (Never exposes provider secrets)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Entitlement Sync
┌──────────────────────────────▼──────────────────────────────┐
│                    COMMERCIAL BACKEND                       │
│  - Stripe Billing Engine (Webhooks, Subscriptions, Invoices)│
│  - Supabase Auth & Multi-Tenant Workspaces                  │
│  - Telemetry Event Dispatcher (Webhooks, SMS, Email Alerts) │
└─────────────────────────────────────────────────────────────┘
```

## Security & Proxy Invariants
1. **Zero Client Secrets:** All third-party tile queries route through `/api/proxy/tiles` or signed ephemeral session tokens.
2. **Isolated Workspaces:** Enterprise customer assets (private trackers) are encrypted at rest with AES-256.
3. **Resilient Failover:** If OpenSky or adsb.lol experiences upstream downtime, automatic failover routes to backup telemetry feeds.
