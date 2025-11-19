Awesome — let’s turn your vision into a build plan you can hand to an engineering team today. I’ll keep this **standards-first**, map decisions to your personas/use-cases, include runnable snippets, and cite primary sources.

---

# Coffee “Digital Passport” — Production Build Plan (MVP → Scale)

**Date:** Aug 14, 2025 (America/Toronto)

## 0) What we’re shipping in Phase 1 (MVP)

* **Scan-to-Passport**: GS1 Digital Link QR on the bag resolves at the edge to a fast, WCAG-AA page showing product, origin map, lot→batch timeline, roast info, and certificates. QR encodes **(01) GTIN**, **(10) Lot**, optional **(21) Serial** per GS1 Digital Link. ([GS1][1])
* **Trusted ingestion**: B2B `/api/epcis/capture` accepts **EPCIS 2.0 JSON-LD** events with OAuth2 client-credentials + HMAC, validates with JSON Schema/SHACL, writes to event store. (Use GS1 EPCIS artefacts for context/schema.) ([GS1 Reference][2])
* **Lot ↔ roast batch linkage**: TransformationEvents model green-to-roast conversion, AggregationEvents model packing. (EPCIS & CBV 2.0.) ([GS1][3])
* **Certificates locker**: store PDFs/images and (optionally) represent claims as **W3C Verifiable Credentials v2.0** for cryptographic verification. ([W3C][4])
* **POS-safe QR**: GS1 Digital Link coexists with UPC/EAN during 2D transition (“Sunrise 2027”) per GS1 guidance. ([GS1 Reference][5], [GS1 US][6])
* **Analytics**: privacy-preserving scan telemetry (no PII) into ClickHouse for real-time dashboards. ([ClickHouse][7])

---

## 1) Architecture plan (MVP → Scale)

### 1.1 High-level components (baseline stack)

```
[Bag QR (GS1 Digital Link)]
        |
   (Mobile scan)
        v
[Cloudflare Worker Resolver]
  - linkType routing (html/json/epcis)
  - cache, geo, A/B
        |
        +--> [Passport FE: Next.js]
        |        - public read model (React Query)
        |        - MapLibre map
        |
        +--> [Public Read API (NestJS GraphQL/REST)]
                 - read model (Postgres views or materialized tables)
                 - OpenSearch for text search
                 - S3/MinIO for media/docs
                 - ClickHouse for telemetry
                 - Redis cache
                 - OpenTelemetry traces
                 ^
                 |
[B2B Partners] -> [/api/epcis/capture (NestJS Fastify)]
                 - OAuth2 client-cred + HMAC (optional mTLS)
                 - EPCIS JSON-LD validation (JSON Schema/SHACL)
                 - BullMQ jobs (enrichment, dedupe)
                 - Event store (Postgres JSONB or OpenEPCIS)
```

**Edge resolver** on Workers keeps scans snappy and routes context (consumer vs POS vs API) using GS1 Digital Link patterns and `linkType`. ([GS1][1], [Cloudflare Docs][8])

### 1.2 Options comparison

| Option                                    | What                                  | Pros                                                              | Cons                                         | 12-mo Ops (rough)  | Fit                                    |
| ----------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- | ------------------ | -------------------------------------- |
| **A) Build** (Postgres JSONB event store) | We own capture, storage, query        | Full control; tight read-models; simpler ops early                | Must implement EPCIS query semantics/interop | \$–\$\$ (DB + API) | Strong MVP                             |
| **B) OpenEPCIS-centric**                  | Use **OpenEPCIS** repo + API          | Standards-conformant EPCIS & CBV; interoperability; import/export | Another system to operate; learning curve    | \$\$ (repo + app)  | Strong if partner interop needed early |
| **C) SaaS Traceability**                  | Off-the-shelf EPCIS/DL platform       | Fastest to pilot; compliance help                                 | Lock-in; limited schema control; cost/egress | \$\$–\$\$\$        | Medium                                 |
| **D) Hybrid/Event bus**                   | Kafka/NATS → enrichment → read models | Scales ingestion; multiple consumers                              | Higher ops; overkill for MVP                 | \$\$–\$\$\$        | Phase 2+                               |

**Recommendation for MVP:** **A or B** depending on pilot partners.

* If your importers/roasters already speak EPCIS, **B (OpenEPCIS)** reduces build time and maximizes interop. ([openepcis.io][9], [GitHub][10])
* If data comes as CSV/JSON and you mainly control UX/QR, **A (Build)** is leaner; add OpenEPCIS later behind an abstraction.

---

## 2) Data model & standards mapping

### 2.1 Entities

* **Organization**, **Facility (GLN)**, **Product (GTIN)**, **Lot (green)**, **Batch (roast)**, **Event (EPCIS JSON-LD)**, **Certificate**. (Identifiers/GLN/GTIN per GS1 General Specs.) ([gs1tw.org][11])

### 2.2 Coffee event flow (EPCIS/CBV 2.0)

* **Commissioning** (harvest lot), **Transformation** (milling; roasting lot→batch), **Aggregation** (packing), **Shipping/Receiving** (export/import/distribution). Use CBV `bizStep`/`disposition`. ([GS1][3])

### 2.3 QR / Digital Link patterns

* Canonical consumer path:
  `/01/{gtin}/10/{lot}[ /21/{serial} ]?linkType=product&ctx=mobile` (POS-safe resolution, linkTypes for html/json). See GS1 DL 1.1.1 for path syntax and resolver behavior. ([GS1][1])

### 2.4 DPP readiness

* **We already have**: identifiers, provenance timeline, facility IDs, certificates metadata.
* **Likely gaps**: environmental metrics per transport leg/process; durability/repairability (not typical for coffee); issuer registries. (ESPR frames DPP as a digital identity with product information for circularity.) ([European Commission][12])

---

## 3) APIs & resolver

### 3.1 B2B ingestion — `POST /api/epcis/capture`

* **Auth**: OAuth2 client-credentials; **HMAC** header (deterministic signature over body + timestamp); optional **mTLS** per org.
* **Validation**: EPCIS JSON Schema (GS1 artefacts) + **SHACL** for semantic constraints; idempotency via `Idempotency-Key`. ([GS1 Reference][2])
* **Processing**: enqueue (BullMQ) → normalize identifiers → dedupe → link lots↔batches → persist to event store (Postgres JSONB or OpenEPCIS).
* **Audit**: immutable append log; store signature metadata.

### 3.2 Public resolver — `GET /r/{digital-link-path}`

* **Runs at edge (Cloudflare Workers)** for low latency; negotiates by `linkType` (html/json/epcis) and `Accept` header; returns consumer page or JSON model; falls back to GTIN price lookup as needed. ([Cloudflare Docs][8])
* **POS transition**: co-exist with UPC/EAN; retailer-safe routing per GS1 2D guidelines. ([GS1 Reference][5])

### 3.3 Read model

* **GraphQL** `productPassport(digitalLink)` for the app; REST for partners; OpenSearch for free-text across entities; Redis cache; presigned S3 URLs for docs.

---

## 4) Best-practice playbooks (abridged)

* **Ingestion security**: OAuth2 CC + HMAC; enforce `Date` skew; **JTI** anti-replay; short-TTL JWT for console; per-org RBAC + **Row-Level Security** (RLS).
* **QR/labeling**: start with **(01)+(10)** (batch-level); add **(21)** later; vanity domain for trust; follow GS1 DL syntax & compression guidance. ([GS1][1])
* **2D at retail**: keep UPC on pack; add DL QR; test retailer scanners; align with **2D at POS** guideline during “Sunrise 2027.” ([GS1 Reference][5], [GS1 US][6])
* **Data quality**: required fields per lot/batch; reference lists (varietals/process); anomaly checks (dates/quantities); human-in-loop queue.
* **Certificates**: store PDFs + **VC v2.0** credentials for issuers; show validity windows; flag expiries. ([W3C][4])
* **Analytics & privacy**: log scan event with timestamp, DL keys (01,10,21), coarse geo (city/region), device type; no PII; aggregate in ClickHouse. ([ClickHouse][7])
* **Observability**: OpenTelemetry spanning Worker→API→DB.

---

## 5) Libraries / services shortlist (ready-to-use)

* **EPCIS repo**: **OpenEPCIS** (self-host) for EPCIS 2.0 repo + API. ([openepcis.io][9], [GitHub][10])
* **Digital Link encode/decode**: **GS1DigitalLinkToolkit.js** or **digital-link.js**. ([GitHub][13])
* **QR/2D generation**: **bwip-js** (QR, Data Matrix, GS1 support) for server/browser rendering. ([npm][14])
* **Scanning (web)**: **@zxing/browser** (open-source) or **html5-qrcode**; evaluate Scandit/Scanbot later for low-light/speed. ([npm][15], [GitHub][16])
* **Validation**: **Ajv** for JSON Schema; **rdf-validate-shacl** or **shacl-js** for SHACL shapes. ([npm][17], [GitHub][18])
* **Maps**: **MapLibre GL JS** (+ static tiles fallback). ([maplibre.org][19])
* **Search**: **OpenSearch** for text/filters. ([OpenSearch][20])
* **Analytics**: **ClickHouse** (telemetry). ([ClickHouse][7])
* **Edge**: **Cloudflare Workers** (resolver). ([Cloudflare Docs][8])

---

## 6) TypeScript snippets (minimal, runnable patterns)

### 6.1 EPCIS 2.0 **TransformationEvent** (roast) + **Ajv** validation

```ts
// npm i ajv cross-fetch
import Ajv from 'ajv';
import fetch from 'cross-fetch';

const event = {
  "@context": [
    "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    {"ext":"https://yourbrand.example/epcis/ext#"}
  ],
  "type": "TransformationEvent",
  "eventTime": "2025-08-01T10:00:00-05:00",
  "eventTimeZoneOffset": "-05:00",
  "inputQuantityList": [
    {"epcClass":"urn:epc:class:lgtin:0950600.134352.L2305","quantity":120,"uom":"KG"}
  ],
  "outputEPCList": ["urn:epc:id:sgtin:0950600.134352.000999"],
  "bizStep": "urn:epcglobal:cbv:bizstep:transforming",
  "disposition": "urn:epcglobal:cbv:disp:in_progress",
  "readPoint": {"id":"urn:epc:id:sgln:0950600.00001.0"},
  "bizLocation": {"id":"urn:epc:id:sgln:0950600.00001.0"},
  "ilmd": {
    "ext:roastDate": "2025-08-01",
    "ext:roastProfile": "City+",
    "ext:machine": "Loring S15",
    "ext:chargeTempC": 180,
    "ext:dropTempC": 203
  }
};

async function validateEpcis(evt: any) {
  // Use GS1 EPCIS OpenAPI/JSON Schema from artefacts
  const schemaUrl = "https://ref.gs1.org/standards/epcis/artefacts/openapi.json";
  const schema = await (await fetch(schemaUrl)).json();
  // Minimal example: check basic fields with Ajv (full EPCIS has multiple schemas)
  const ajv = new Ajv({allErrors: true, strict: false});
  // In practice, pick the TransformationEvent schema from GS1 artefacts.
  const ok = ajv.validate({type: "object", required:["type","eventTime"], properties:{type:{const:"TransformationEvent"}}}, evt);
  if (!ok) throw new Error(ajv.errorsText());
  return true;
}

validateEpcis(event).then(() => console.log("valid basic event"));
```

(Uses the official JSON-LD context and GS1 artefacts as the source of truth.) ([GS1 Reference][2])

### 6.2 **GS1 Digital Link** builder/parser for (01)+(10)+\[21]

```ts
export type DLKeys = { gtin: string; lot?: string; serial?: string };

export function buildDL({ gtin, lot, serial }: DLKeys, base = "https://id.example.com") {
  const parts = [`01`, encodeURIComponent(gtin)];
  if (lot) parts.push(`10`, encodeURIComponent(lot));
  if (serial) parts.push(`21`, encodeURIComponent(serial));
  return `${base}/${parts.join("/")}?linkType=product&ctx=mobile`;
}

export function parseDL(url: string): DLKeys {
  const u = new URL(url);
  const seg = u.pathname.split("/").filter(Boolean);
  const map: Record<string,string> = {};
  for (let i=0;i<seg.length;i+=2) map[seg[i]] = decodeURIComponent(seg[i+1]||"");
  return { gtin: map["01"], lot: map["10"], serial: map["21"] };
}
```

(Aligns with GS1 Digital Link path syntax.) ([GS1][1])

### 6.3 **Cloudflare Worker** resolver (linkType & Accept negotiation)

```ts
// wrangler.toml -> route: id.example.com/*
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const linkType = url.searchParams.get("linkType") || "product";
    const accept = request.headers.get("accept") || "";

    // Parse DL keys
    const seg = url.pathname.split("/").filter(Boolean);
    const get = (ai: string) => {
      const i = seg.indexOf(ai);
      return i >= 0 ? decodeURIComponent(seg[i+1] || "") : undefined;
    };
    const dl = { gtin: get("01"), lot: get("10"), serial: get("21") };

    // Route
    if (linkType === "json" || accept.includes("application/json")) {
      return fetch(`${env.PUBLIC_API}/api/public/passport?dl=${encodeURIComponent(url.pathname)}`, { headers: { 'cf-ipcountry': request.headers.get('cf-ipcountry') || '' }});
    }
    if (linkType === "epcis") {
      return fetch(`${env.PUBLIC_API}/api/public/epcis?dl=${encodeURIComponent(url.pathname)}`);
    }
    // default product page
    return fetch(`${env.WEB_ORIGIN}/passport${url.pathname}${url.search}`);
  }
}
```

(Workers `fetch()` handler & routing per docs.) ([Cloudflare Docs][8])

### 6.4 GraphQL read model (consumer passport)

```ts
// Schema (NestJS GraphQL)
type Query {
  productPassport(digitalLink: String!): Passport!
}
type Passport {
  product: Product!
  lot: Lot
  batch: Batch
  timeline: [TimelineEvent!]!
  certifications: [Certificate!]!
}
```

```ts
// Resolver (pseudo)
@Resolver()
export class PassportResolver {
  constructor(private svc: PassportService) {}
  @Query(() => Passport)
  productPassport(@Args('digitalLink') dl: string) {
    const keys = parseDL(dl);
    return this.svc.getPassport(keys); // joins read-model tables/materialized views
  }
}
```

### 6.5 Webhook HMAC signing & verification

```ts
// Sign (server)
import crypto from 'crypto';
export function sign(body: string, secret: string) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

// Verify (receiver)
export function verify(signature: string, body: string, secret: string) {
  const expected = sign(body, secret);
  // constant-time compare
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## 7) Scan analytics schema (ClickHouse sketch)

* **Table** `scan_events`
  Columns: `ts DateTime`, `gtin String`, `lot String`, `serial String`, `country FixedString(2)`, `city String`, `device String`, `ua String`, `utm_source String`, `utm_campaign String`, `resolver_latency_ms UInt16`.

ClickHouse is a column-oriented OLAP DB suitable for real-time analytics; it excels at high-volume events. ([ClickHouse][7])

---

## 8) Risk register & mitigations

| Risk                                   | Impact                           | Mitigation                                                                                                      |
| -------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Low data availability / messy IDs**  | Empty passports; broken linkages | CSV templates; assisted matching (date/qty); manual overrides; dedupe rules; review queues                      |
| **Resolver downtime**                  | Scans fail                       | Multi-region Workers; health checks; failover to cached static; canary URLs                                     |
| **Greenwashing / unverifiable claims** | Reputational risk                | Separate “claims” vs “verified”; show issuer & validity; prefer **VC** for certs; audit log of edits ([W3C][4]) |
| **Retail POS conflicts**               | Checkout issues                  | Keep UPC; test per **2D POS guideline**; DL resolver POS-aware routing ([GS1 Reference][5])                     |
| **Regulatory shifts (DPP)**            | Rework                           | Track ESPR/DPP; keep data model mappable; maintain field provenance ([European Commission][12])                 |

---

## 9) Cost & licensing (sketch)

* **OSS**: Next.js, NestJS, Prisma, Postgres, Redis, OpenSearch (Apache-2.0), ClickHouse (Apache-2.0), MapLibre (BSD-style), Ajv (MIT), ZXing (Apache-2.0), OpenEPCIS (OSS). ([OpenSearch][20], [ClickHouse][7], [maplibre.org][19])
* **Infra (MVP)**:

  * Postgres (managed) \~\$150–400/mo, Redis \~\$50–150/mo, S3/MinIO storage \~\$<50/mo, ClickHouse (self-host) or cloud \~\$200–800/mo, OpenSearch \~\$200–600/mo, Cloudflare Workers \~\$5–50/mo depending on traffic.
  * QR generation/scan libraries are OSS; commercial scanners (Scandit/Scanbot) are optional.

*(These are ballpark ranges; tune with expected scan volumes and data retention.)*

---

## 10) Implementation checklist (week-by-week MVP)

**Week 1–2**

* Domain + **Workers** resolver skeleton; DL parser/builder; vanity QR route. ([Cloudflare Docs][8])
* Next.js passport page shell; MapLibre map; assets pipeline. ([maplibre.org][19])

**Week 3–4**

* NestJS `/api/epcis/capture` with OAuth2 CC + HMAC; Ajv + SHACL validation against **GS1 EPCIS artefacts**. ([GS1 Reference][2])
* Postgres JSONB event store; lot↔batch linker job (BullMQ); S3 uploads for certs.

**Week 5–6**

* Read model (materialized views) + GraphQL `productPassport`; OpenSearch integration for search; ClickHouse ingestion for scan telemetry. ([OpenSearch][20], [ClickHouse][7])

**Week 7–8**

* Data quality checks & reviewer console; VC issuance for a sample cert; analytics dashboard; accessibility and performance passes.

---

## 11) Evidence pointers (primary sources)

* **GS1 Digital Link 1.1.1** (syntax, resolver): PDF. ([GS1][1])
* **EPCIS/CBV 2.0.1** artefacts: JSON-LD context, OpenAPI, validation files. ([GS1 Reference][2])
* **GS1 2D at Retail POS** implementation guideline (transition). ([GS1 Reference][5])
* **Sunrise 2027** overview (context). ([GS1 US][6])
* **W3C Verifiable Credentials v2.0** (model). ([W3C][4])
* **ESPR / Digital Product Passport** overview (Commission). ([European Commission][12])
* **OpenEPCIS** site & GitHub. ([openepcis.io][9], [GitHub][10])
* **Workers fetch handler** docs. ([Cloudflare Docs][8])
* **ClickHouse** docs/overview (analytics). ([ClickHouse][7])
* **MapLibre GL JS** docs. ([maplibre.org][19])
* **GS1DigitalLinkToolkit.js / digital-link.js** (helpers). ([GitHub][13])
* **ZXing browser** (scanner). ([npm][15])
* **Ajv** (JSON Schema). ([ajv.js.org][21])
* **SHACL validators** (JS). ([npm][22], [GitHub][18])
* **bwip-js** (2D barcode generation). ([npm][14])

---

### Final notes

* The plan ties directly to your personas: **Producer/Importer** (capture & certs), **Roaster** (batch linkage + analytics), **Consumer** (scan UX), **Retailer** (POS-safe QR).
* You can start at **(01)+(10)** now and extend to **(21)** item-level later without breaking DL routes. ([GS1][1])
* Keep your data model **DPP-mappable**; you’re future-proofed as the EU finalizes scope per ESPR. ([European Commission][12])

If you want, I can turn this into the exact `/report/*.md`, `/matrices/*.csv`, and `/snippets/*.ts` file set in one go.

[1]: https://www.gs1.org/docs/Digital-Link/GS1_Digital_link_Standard_i1.1.1.pdf?utm_source=chatgpt.com "GS1 Digital Link Standard"
[2]: https://ref.gs1.org/standards/epcis/artefacts?utm_source=chatgpt.com "EPCIS / CBV 2.0.1"
[3]: https://www.gs1.org/standards/epcis?utm_source=chatgpt.com "EPCIS & CBV - Standards"
[4]: https://www.w3.org/TR/vc-data-model-2.0/?utm_source=chatgpt.com "Verifiable Credentials Data Model v2.0"
[5]: https://ref.gs1.org/guidelines/2d-in-retail/?utm_source=chatgpt.com "2D Barcodes at Retail Point-of-Sale Implementation Guideline"
[6]: https://www.gs1us.org/industries-and-insights/by-topic/sunrise-2027?utm_source=chatgpt.com "What is GS1 Sunrise 2027? | GS1 US"
[7]: https://clickhouse.com/docs/intro?utm_source=chatgpt.com "What is ClickHouse?"
[8]: https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/?utm_source=chatgpt.com "Fetch Handler - Workers"
[9]: https://openepcis.io/?utm_source=chatgpt.com "OpenEPCIS | An open-source implementation of the GS1 ..."
[10]: https://github.com/openepcis?utm_source=chatgpt.com "OpenEPCIS"
[11]: https://www.gs1tw.org/twct/backend/downloadfiles/GeneralSpecification2023.pdf?utm_source=chatgpt.com "GS1 General Specifications Standard"
[12]: https://commission.europa.eu/energy-climate-change-environment/standards-tools-and-labels/products-labelling-rules-and-requirements/ecodesign-sustainable-products-regulation_en?utm_source=chatgpt.com "Ecodesign for Sustainable Products Regulation"
[13]: https://github.com/gs1/GS1DigitalLinkToolkit.js/?utm_source=chatgpt.com "gs1/GS1DigitalLinkToolkit.js: This is a JavaScript toolkit for ..."
[14]: https://www.npmjs.com/package/bwip-js?utm_source=chatgpt.com "bwip-js - Barcode Writer in Pure JavaScript"
[15]: https://www.npmjs.com/package/%40zxing/browser?utm_source=chatgpt.com "zxing/browser"
[16]: https://github.com/mebjas/html5-qrcode?utm_source=chatgpt.com "mebjas/html5-qrcode: A cross platform HTML5 QR code ..."
[17]: https://www.npmjs.com/package/ajv?utm_source=chatgpt.com "Ajv JSON schema validator"
[18]: https://github.com/TopQuadrant/shacl-js?utm_source=chatgpt.com "TopQuadrant/shacl-js: SHACL API in JavaScript"
[19]: https://www.maplibre.org/maplibre-gl-js/docs/?utm_source=chatgpt.com "MapLibre GL JS"
[20]: https://opensearch.org/?utm_source=chatgpt.com "OpenSearch: Home"
[21]: https://ajv.js.org/guide/getting-started.html?utm_source=chatgpt.com "Getting started | Ajv JSON schema validator"
[22]: https://www.npmjs.com/package/rdf-validate-shacl?utm_source=chatgpt.com "rdf-validate-shacl"
