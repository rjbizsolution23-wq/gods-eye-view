# Monetization & Pricing Architecture

**Monetization Architect:** `monetization-architect`  
**Payment Engine:** Stripe Subscriptions + Metered Overages  

---

## 1. Plan Structure & Pricing Matrix

| Tier | Price | Target ICP | Core Entitlements | Limits |
|---|---|---|---|---|
| **Free Sandbox** | $0 | Casual visitors & evaluation | 15-min session, low-res 3D globe, basic flight tracking | 1 concurrent session |
| **Starter Operator** | **$49 / mo** | Independent analysts & hobbyists | High-res 3D globe, full ADS-B + AIS maritime feeds, earthquake/fire alerts | 3 saved workspaces, 1 seat |
| **Professional Intel** | **$149 / mo** | Security consultants & logistics teams | Satellite orbit passes, live CCTV streams, voice mission AI, custom filters | 10 workspaces, 3 seats |
| **Mission Command** | **$499 / mo** | Corporate security & fleet operations | Custom asset tracking, team sharing, SMS/Webhook geofence alerts, priority bandwidth | Unlimited workspaces, 10 seats |
| **Enterprise Dedicated** | **$2,500+ / mo** | Defense contractors & financial institutions | Dedicated Cloudflare edge instance, custom telemetry connectors, SLA guarantee | Dedicated cluster |

---

## 2. Upgrade Triggers & Entitlement Barriers
- Accessing orbital satellite footprints or real-time CCTV feeds → Prompts **Professional Intel** upgrade.
- Creating private geofencing boundaries or automated SMS triggers → Prompts **Mission Command** upgrade.
- Adding team members or inviting collaborator analysts → Triggers per-seat subscription expansion.
