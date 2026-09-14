# Commercial License & IP Audit

**Repository:** `gods-eye-view` (fork of upstream `bilawalsidhu/gods-eye-view`)  
**Auditor:** `license-auditor`  
**Date:** 2026-09-14  
**Verdict:** 🟡 **YELLOW — COMMERCIALIZATION PERMITTED WITH SPECIFIC DATA/ASSET REMOVALS & NOTICES**

---

# Verdict
**YELLOW**: Source code is under a permissive **MIT License (Copyright 2026 Bilawal Sidhu)**. Commercial redistribution, SaaS hosting, modification, and proprietary extension are fully authorized. However, **bundled third-party datasets and live API feeds have non-commercial restrictions** that must be surgically pruned or replaced before commercial release.

---

# Licenses Found
1. **Core Source Code:** MIT License (Bilawal Sidhu).
2. **Submarine Cables Dataset (`src/data/local_data/telegeography_submarine_cables/`):** `CC BY-NC-SA 3.0` (TeleGeography) — **NON-COMMERCIAL**.
3. **Datacenters & Dams (`src/data/local_data/`):** Open Database License (`ODbL 1.0`) — Requires attribution and Open Database share-alike on derived datasets.
4. **NASA FIRMS Wildfire Snapshot:** `CC0 / Public Domain` (US Gov).
5. **3D Models (`public/models/`):** Individual Creative Commons licenses (CC-BY, CC-BY-SA, Sketchfab individual licenses detailed in `public/models/README.md`).
6. **Live Runtime Feeds:**
   - Google Maps Photorealistic 3D Tiles (Google Maps Platform Terms of Service — Requires BYOK or Enterprise Google Cloud API billing).
   - OpenSky Network (Restricted for commercial use without enterprise agreement).
   - adsb.lol / AISStream / CelesTrak / USGS / Overpass API (Varying terms; commercial SaaS requires self-hosted relays or commercial feeds).

---

# What We May Do
- Host a managed, multi-tenant commercial SaaS platform built on the core codebase.
- Rebrand the user interface, design system, and product tiering under **RJ Business Solutions**.
- Build proprietary enterprise modules (collaborative threat mapping, private asset tracking, custom webhook alerting, multi-user workspaces).
- Monetize via Stripe subscription tiers, API access, and private edge deployments.

---

# Obligations & Removals Required
1. **Remove TeleGeography Submarine Cables dataset:** Because it is licensed under `CC BY-NC-SA 3.0`, this folder must be removed from commercial distributions or replaced with public domain / commercial cable datasets.
2. **Preserve Upstream MIT Copyright Notice:** Retain `Copyright (c) 2026 Bilawal Sidhu` in source headers / compliance notices.
3. **ODbL Compliance:** Provide visible attribution link to OpenStreetMap contributors for datacenter and dam layers.
4. **BYOK / Commercial Provider Credentials:** Implement secure server-side proxying and Bring-Your-Own-Key (BYOK) architecture for Google Maps, OpenSky, and TomTom API keys.

---

# Commercialization Recommendation
**PROCEED WITH PRUNING**: Prune the `CC BY-NC-SA` dataset, implement enterprise data proxies for real-time ADS-B / AIS feeds, wire RJ Business Solutions branding, and position as a high-margin enterprise Spatial Intelligence Command Center.
