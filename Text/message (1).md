create a detailed system prompt for a deep research with these things in mind: 

# Coffee Traceability Web App — Detailed Product & Technical Plan

## 0) One‑line Vision

Give every bag of coffee a **living digital passport**—from farm lot to roast to cup—so consumers see provenance and producers/distributors control and share trustworthy traceability data.

---

## 1) Problem & Value

**Problems today**

* Disconnected data between farm, mill, exporter, importer, roaster, retailer.
* Batch/lot IDs and paperwork don’t map cleanly to a consumer‑friendly experience.
* Certifications and quality data are hard to verify or are siloed.

**Value we provide**

* **For consumers:** scan once → origin map, timeline, certifications, roast/freshness, brewing notes.
* **For roasters/importers:** a turnkey **Digital Product Passport (DPP‑ready)** and analytics on scans, geography, and repeat purchases.
* **For producers:** controlled storytelling (farm practices, varietals, process), verified credentials, and buyer discovery.

---

## 2) Primary Personas

* **Consumer (Anna):** scans QR on bag; wants origin, roast date, tasting, sustainability.
* **Roaster (Ravi):** uploads roast batches, links to green lots; needs an easy portal and per‑SKU analytics.
* **Importer/Distributor (Dina):** ingests shipping/receiving events and certificates at the lot level.
* **Producer/Co‑op (Mateo):** records farm lot characteristics and proof docs; wants simple mobile capture and offline support.

---

## 3) Core Use Cases (MVP → V2)

1. **Scan-to-Passport (MVP)**

   * Consumer scans QR → dynamic page shows product card, origin map, lot timeline, roast info, certifications.
2. **Lot & Batch Linking (MVP)**

   * Importer creates **green lot**; roaster creates **roast batch**; system links via transformation events.
3. **Evidence & Certificates (MVP)**

   * Attach PDFs/images (e.g., organic, RA, Fairtrade audit summaries) to a lot or facility, with validity windows.
4. **Contributor Console (MVP)**

   * Producer, distributor, roaster manage facilities, lots, batches; upload CSV/JSON; view data quality checks.
5. **Scan Analytics (MVP)**

   * Roaster dashboard: scans by SKU, location, time, device; UTM and campaign tags.
6. **Recall & Alert (V2)**

   * Flag affected lots; consumer page shows recall banner; distributor notifications.
7. **Recipe & Freshness (V2)**

   * Dynamic brew recipes by roast age; subscription links.
8. **Sustainability Claims (V2)**

   * Emissions estimation per kg; water footprint; transport legs.

---

## 4) Standards Alignment (what we support)

* **Identifiers**: GTIN (product), Lot/Batch, Serial, GLN (locations), SSCC (logistics).
* **Events**: EPCIS 2.0 (Transformation, Commissioning, Aggregation, Shipping/Receiving, Observation).
* **QR**: GS1 Digital Link (single 2D code → scan context routing; POS‑safe).
* **DPP‑ready**: data model designed so fields can populate EU Digital Product Passport domains when/if required.

---

## 5) Data Model (high‑level)

**Entities**

* `Organization` (producer, exporter, importer, roaster, retailer)
* `Facility` (linked to GLN; address; geo)
* `Product` (SKU; GTIN; label text; images)
* `Lot` (green coffee lot; attributes: harvest year, farm block, varietals, process, altitude)
* `Batch` (roast batch; roast date, profile, machine)
* `Event` (EPCIS 2.0 JSON‑LD document; immutable)
* `Certificate` (type, issuer, validity, attachments)
* `ActorUser` (RBAC; org memberships; keys)

**Key relationships**

* `Lot` *transforms into* `Batch` (1→N or many‑to‑many via TransformationEvent).
* `Event` references `readPoint` and `bizLocation` (Facilities) + `bizStep`.
* `Product` *aggregates* `Batch` → consumer unit packs via AggregationEvent.

---

## 6) QR / Identifier Strategy

* 1 QR per **consumer unit** (or per batch for small/wholesale), encoded as **GS1 Digital Link**.
* Encodes at minimum **GTIN (01)** and **Lot (10)**; optionally **Serial (21)** for item‑level.
* The resolver routes scan context (mobile vs retail scanner) to:

  * Consumer passport page
  * POS price lookup (GTIN extraction)
  * API/JSON for partners

**Example Digital Link URI**

```text
https://id.yourbrand.com/01/09506000134352/10/L2305/21/000123?linkType=product&ctx=mobile
```

---

## 7) Event Model (EPCIS 2.0 mapping for coffee)

**Typical flow**

1. **Harvest lot created** → `CommissioningEvent` (farm/co‑op)
2. **Milling (washing/drying)** → `TransformationEvent` (lot → processed lot)
3. **Export shipment** → `AggregationEvent` + `ShippingEvent` (bags into container)
4. **Import receipt** → `ReceivingEvent` (importer warehouse)
5. **Roasting** → `TransformationEvent` (green lot qty → roasted batch)
6. **Packaging** → `AggregationEvent` (roasted batch → consumer units)
7. **Distribution** → `Shipping/Receiving` (to retailers or DTC)

**Sample TransformationEvent (roasting)**

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    {"ext": "https://yourbrand.example/epcis/ext#"}
  ],
  "type": "TransformationEvent",
  "eventTime": "2025-08-01T10:00:00-05:00",
  "eventTimeZoneOffset": "-05:00",
  "inputQuantityList": [
    { "epcClass": "urn:epc:class:lgtin:0950600.134352.L2305", "quantity": 120.0, "uom": "KG" }
  ],
  "outputEPCList": ["urn:epc:id:sgtin:0950600.134352.000999"],
  "bizStep": "urn:epcglobal:cbv:bizstep:transforming",
  "disposition": "urn:epcglobal:cbv:disp:in_progress",
  "readPoint": { "id": "urn:epc:id:sgln:0950600.00001.0" },
  "bizLocation": { "id": "urn:epc:id:sgln:0950600.00001.0" },
  "ilmd": {
    "ext:roastDate": "2025-08-01",
    "ext:roastProfile": "City+",
    "ext:machine": "Loring S15",
    "ext:chargeTempC": 180,
    "ext:dropTempC": 203
  }
}
```

---

## 8) Public Experience (UX)

**Passport page sections**

* Hero: bag photo, roast/brew info, freshness meter, share link.
* Origin: farm/facility map, varietals, process, altitude, harvest year.
* Timeline: event cards (who/what/when/where) with signed provenance badges.
* Certifications: badges → modal with issuer, validity, PDF.
* Environmental: transport legs, estimated kg CO₂/kg coffee (V2).
* Recipes: recommended ratios & modes (espresso/filter) by roast age.
* Retailer CTA: where to buy more; subscription; reorder.

## **Accessibility & performance goals**

* FCP < 1.5s, TTI < 2.5s on 4G; page < 150KB critical CSS/JS.
* WCAG 2.1 AA; semantic landmarks; locale & units support.

---

## 9) Contributor Console (Producer/Distributor/Roaster)

* **Facility setup** (GLN optional), team invites, roles (Admin, Operator, Viewer).
* **Data capture**: CSV templates, manual forms, API keys, mobile app (offline capture, photo upload, QR scanning).
* **Quality gates**: schema validation, dedupe, lot/batch linkage hints, missing‑field checklists.
* **Document locker**: upload certs; set validity; assign to lots/facilities.
* **Webhooks**: on new event, lot linked, passport published.

---

## 10) API Design (external & public)

**B2B ingestion**

* `POST /api/epcis/capture` — accepts EPCIS 2.0 JSON‑LD document (batch or single events).

  * Auth: OAuth2 client‑credentials **+** HMAC request signature; optional mTLS.
  * Validation: JSON Schema + SHACL; per‑org RBAC.

**Public queries**

* `GET /r/{digital-link-path}` — context‑aware resolution (consumer vs POS vs API JSON).
* `GET /api/public/passport?dl={encodedDigitalLink}` — JSON model for consumer apps.
* GraphQL (read‑only): `productPassport(digitalLink)` with nested objects.

**Admin/Partner**

* Facilities, lots, batches CRUD; presigned uploads; webhook subscriptions; API keys.

**Sample GraphQL**

```graphql
query ProductPassport($digitalLink: String!) {
  productPassport(digitalLink: $digitalLink) {
    product { name brand images { url alt } }
    lot { code harvestYear originCountry varietals process altitudeMasl }
    batch { roastDate roastProfile machine }
    timeline { eventTime bizStep summary actor { name role location } }
    certifications { type issuer validFrom validTo url }
  }
}
```

---

## 11) Architecture

**MVP (straightforward, robust)**

* **Frontend**: Next.js (App Router), TypeScript, Tailwind, React Query.
* **Gateway/Backend**: NestJS + Fastify; REST & GraphQL.
* **DB**: PostgreSQL (JSONB for EPCIS events), Prisma ORM.
* **Search**: OpenSearch (timeline search & filters).
* **Object store**: S3/MinIO for documents & images.
* **Cache/Jobs**: Redis for caching + BullMQ queues (validation, enrichment, PDF processing, map tiles cache).
* **QR Resolver**: Cloudflare Workers (edge redirects + linkType negotiation).
* **Analytics**: ClickHouse (scan events) + Metabase dashboards.

**Scale‑out (Phase 2+)**

* Event bus (NATS/Kafka) for high‑volume EPCIS capture and async enrichment.
* TimescaleDB for time‑series events; or partitioned Postgres + logical replication.
* Multi‑tenant KMS (per‑org keys), column‑level encryption for sensitive fields.
* Optional: OpenEPCIS repository for conformance and interchange.

**Observability & ops**

* OpenTelemetry traces/metrics/logs → Grafana/Tempo/Loki.
* Canary URLs for resolver; synthetic scans; SLOs (99.9% scan page availability).

---

## 12) Security & Trust

* **AuthN/Z**: OAuth2 (client‑cred for systems, PKCE for users), JWT with short TTL, JTI replay protection; role‑based + row‑level security per org.
* **Transport**: TLS 1.3; optional mTLS for ingestion.
* **Integrity**: HMAC signed requests; event digests; append‑only event store; audit log.
* **Privacy**: no end‑user PII required for scans; GDPR/CPRA compliant; data residency by region.
* **Verification**: optional W3C Verifiable Credentials for certificates; issuer registry.

---

## 13) Data Quality & Governance

* Strict schemas + reference data (varietals, processes, countries).
* Confidence scoring: green ↔ red badges based on completeness & verification.
* Human‑in‑the‑loop review queues for anomalies (e.g., impossible harvest dates).
* Versioning of entities and **non‑destructive** edits.

---

## 14) Onboarding & Imports

* Quick start: spreadsheet templates (Facilities, Lots, Batches, Events).
* Bulk importers for common ERPs/roast tools (CSV/JSON via S3 drop or API).
* Assisted linking: suggest which lots feed which batches by date/quantity match.
* Labeling: generate GS1 Digital Link QR SVG/PNG; print‑ready exports.

---

## 15) Front‑End Components (reusable)

* `PassportHeader` (image, title, roast/freshness, share)
* `OriginMap` (MapLibre + static tiles fallback)
* `Timeline` (event chips → detail drawer)
* `CertBadge` (with verification status)
* `ScanAnalytics` (heatmap, device mix)

---

## 16) Tech Choices

* **Frontend**: Next.js, Tailwind, TanStack Query, Zod, MapLibre GL.
* **Backend**: NestJS, Prisma, PostgreSQL, Redis, OpenSearch, ClickHouse.
* **QR/Barcodes**: node‑qrcode or bwip‑js; GS1 Digital Link helpers.
* **Infra**: Docker + Terraform; deploy on AWS (ALB → ECS Fargate), or Fly.io for MVP.
* **CI/CD**: GitHub Actions; test, lint, typecheck, DB migrations, e2e smoke scans.

---

## 17) Analytics & KPIs

* Scan → view rate; unique scanners; repeat scanners; geography.
* Time from roast to first scan; scans per batch; per‑SKU uplift after launch.
* Data quality score per org/lot; certificate coverage.

---

## 18) Business Model

* **Free**: public passports for ≤ N SKUs, basic analytics.
* **Pro (roasters/importers)**: per‑SKU/month or per‑scan; advanced analytics; white‑label; webhooks; priority support.
* **Enterprise (chains/retailers)**: SSO, data contracts, SLA, multi‑region.

---

## 19) Risks & Mitigations

* **Low data availability** → provide CSV templates, mobile capture, and light‑touch APIs; progressive disclosure on consumer pages.
* **Messy IDs** → normalized identifier service and dedupe rules; manual override tools.
* **QR maintenance** → edge resolver with canary tests and fallback link.
* **Greenwashing concerns** → verification badges & audit trails; clearly separate claims vs. verified facts.

---

## 20) Roadmap (Phased)

**Phase 0 – Prototype (internal)**: QR resolver, minimal passport page, hardcoded sample events.
**Phase 1 – MVP (pilot roaster/importer)**: EPCIS capture + console, lot↔batch linking, docs locker, analytics basics.
**Phase 2 – Scale**: event bus, OpenEPCIS interop, advanced analytics, recall banners, sustainability estimates.
**Phase 3 – Ecosystem**: partner marketplace (certifiers, LCA tools), retailer apps.

---

## 21) Sample Contracts & Schemas (snippets)

**Lot (green coffee)**

```json
{
  "code": "L2305",
  "harvestYear": 2024,
  "origin": {"country": "Colombia", "region": "Huila", "cooperative": "La Esperanza"},
  "varietals": ["Caturra", "Castillo"],
  "process": "Washed",
  "altitudeMasl": 1650
}
```

**Batch (roast)**

```json
{
  "code": "RB-2025-08-01-01",
  "roastDate": "2025-08-01",
  "profile": "City+",
  "machine": "Loring S15",
  "inputLotCodes": ["L2305"],
  "netOutputKg": 102.4
}
```

**Public Passport (response)**

```json
{
  "product": {"gtin": "09506000134352", "name": "Huila Colombia"},
  "lot": {"code": "L2305", "harvestYear": 2024, "originCountry": "CO"},
  "batch": {"roastDate": "2025-08-01", "profile": "City+"},
  "timeline": [
    {"eventTime": "2025-05-12T09:00:00Z", "bizStep": "commissioning", "actor": {"name": "Co-op La Esperanza"}},
    {"eventTime": "2025-06-03T16:40:00Z", "bizStep": "shipping", "actor": {"name": "Exporter Andina"}}
  ]
}
```

---

## 22) Build vs Buy (strategic options)

* **Build**: full control; adopt EPCIS 2.0 natively; run QR resolver; best for product DNA.
* **Buy/Partner**: use an EPCIS repository (e.g., OpenEPCIS) and focus on UX, onboarding, and analytics.
* **Hybrid**: own the resolver + consumer UX; plug vendor for capture/interop if needed.

---

## 23) Implementation Notes

* Start batch‑level (01+10) before item‑level (01+21) to keep labeling simple.
* Offer **vanity QR** (brand domain) with default deep‑links; preserve POS compatibility.
* Provide a **sandbox org** with sample data for sales demos.
* Ship a public **spec & playground** so partners can test EPCIS capture and passport queries.

---

## 24) Glossary

* **GTIN**: Global Trade Item Number (SKU identifier).
* **GLN**: Global Location Number (facility/party).
* **SSCC**: Serial Shipping Container Code (logistics unit).
* **EPCIS 2.0**: Event model & APIs for supply‑chain visibility.
* **GS1 Digital Link**: Web‑native way to encode GS1 identifiers in a QR.
* **DPP**: Digital Product Passport (emerging EU framework for lifecycle transparency).
--

i want you to do research on:

what frameworks or apis exist for this problem

what are the best practices

what architecture makes the most sense

any specific libraries or services that could make our job easier