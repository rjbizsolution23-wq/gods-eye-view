# RepoForge Decision Ledger

Record significant commercial, product, architecture, licensing, pricing, and launch decisions here.

---

## Decision Template

DATE:

DECISION:

WHY:

EVIDENCE:

ALTERNATIVES CONSIDERED:

RISKS:

REVERSIBLE:
YES / NO

OWNER:

---

## Decision 001: Initial Due Diligence & Commercial Greenlight
DATE: 2026-09-14
DECISION: Approved `gods-eye-view` for commercial productization as **RJ God's Eye™** with an Opportunity Score of 90/100 (Priority Build).
WHY: Exceptional product-market fit, strong visual defensibility, high customer willingness to pay in B2B security/logistics, and permissive MIT core licensing.
EVIDENCE: Detailed audits in LICENSE_AUDIT.md, REPO_AUDIT.md, and MARKET_RESEARCH.md.
ALTERNATIVES CONSIDERED: PASS or simple developer tool wrapper (rejected due to massive commercial potential as standalone SaaS).
RISKS: API provider rate limits (mitigated by server-side caching and BYOK architecture).
REVERSIBLE: YES
OWNER: repoforge-commander

---

## Decision 002: Licensing Compliance & Dataset Pruning
DATE: 2026-09-14
DECISION: Prune `src/data/local_data/telegeography_submarine_cables/` (CC BY-NC-SA 3.0) to maintain 100% commercial license compliance.
WHY: Upstream data license restricts commercial SaaS exploitation.
EVIDENCE: Verified in LICENSE_AUDIT.md.
ALTERNATIVES CONSIDERED: Retaining dataset (rejected - violates commercial integrity rules).
RISKS: Temporary absence of submarine cable layer until public domain replacement is linked.
REVERSIBLE: YES
OWNER: license-auditor

---

## Decision 003: Brand HUD Wiring & Production Build Verification
DATE: 2026-09-14
DECISION: Integrated RJ Mission Command HUD header, live UTC clock, glassmorphic tier pricing modal, and verified full production Vite build (`dist/`).
WHY: Elevates developer prototype into a branded, enterprise-ready commercial SaaS experience with direct monetization paths.
EVIDENCE: Successful compilation via `npm run build` (459 modules bundled, 0 errors, QA_REPORT.md passed).
ALTERNATIVES CONSIDERED: External landing page only (rejected - in-app upgrade conversion is significantly higher).
RISKS: None.
REVERSIBLE: YES
OWNER: ui-ux-engineer / product-engineer
