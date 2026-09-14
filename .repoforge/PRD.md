# Product Requirements Document (PRD): RJ God's Eye™

**Document Owner:** `technical-architect` / `product-strategist`  
**Target Release:** v1.0.0 Commercial Edition  

---

## 1. Objectives & Success Metrics
- **Activation Metric:** New user initiates 3D globe and executes first entity track in < 45 seconds.
- **Conversion Goal:** 4.5% free-sandbox to paid tier conversion.
- **Performance:** Steady 60 FPS 3D rendering on standard desktop browsers with < 250ms feed latency.

## 2. Feature Specifications

### Epic 1: Brand & User Interface
- **HUD Shell:** RJ Mission Command header bar with live GMT/MST clock, feed status indicators, and founder attribution.
- **Color System:** Full alignment with `tokens.css` (`#0A66FF` primary, `#003B8F` dark container, `#F8FBFF` surface).
- **Control Overlay:** Collapsible spatial layer drawer (Aviation, Maritime, Orbital, CCTV, Environment).

### Epic 2: Live Data Telemetry Engine
- **Aviation (ADS-B):** Filter by altitude, ground speed, callsign, and squawk code.
- **Maritime (AIS):** Filter by vessel type (cargo, tanker, passenger), draft, and destination.
- **Orbital (Satellites):** Real-time SGP4 orbital propagation with visual footprints.
- **Ground & Hazard (CCTV / FIRMS / USGS):** Clustered pin visualizers with real-time video stream modal.

### Epic 3: Monetization & Entitlements
- **Server-Side Gatekeeper:** Strict server token checks on high-bandwidth satellite and CCTV streams.
- **Stripe Checkout & Billing Portal:** Self-serve plan upgrades, usage metering, and team seat management.
- **Sandbox Mode:** 15-minute unauthenticated preview with automatic upgrade modal.

### Epic 4: Security & Compliance
- **API Key Proxy:** Zero client-side leakage of Google Maps, Cesium ion, or TomTom secrets.
- **License Integrity:** Non-commercial data folders completely excised from production builds.
