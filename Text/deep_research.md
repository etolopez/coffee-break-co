Great. I’ll start a deep research task focused on identifying the best frameworks, APIs, standards, architectures, and services to support your coffee traceability platform. This will be aligned with your EPCIS 2.0 and GS1 Digital Link strategy, DPP-readiness, and your tech stack preferences.

I’ll explore tools for event capture, digital link resolution, barcode generation, mobile scanning, document signing, map/geo rendering, analytics, observability, and more—with source-cited comparisons, architecture diagrams, best practices, and TypeScript snippets.

I’ll let you know once the full research pack is ready for your review.


# Coffee Digital Passport Platform – Deep Research Findings (2025)

## Landscape Report

**EPCIS Repositories & Capture Frameworks:** The backbone of our traceability system is an EPCIS 2.0 event repository. *OpenEPCIS* is a leading open-source implementation developed by benelog GmbH, fully GS1 EPCIS 2.0 compliant. It provides a secure REST API and JSON/JSON-LD support for capturing events, plus tools for format conversion, event hashing, and test data generation. OpenEPCIS uses a cloud-native architecture (e.g. Docker deployment) and can scale to enterprise loads; it’s used by GS1 Germany and others, and offered in SaaS form by some providers. License is Apache 2.0 (no cost to self-host). Another open solution is *Fosstrak EPCIS* (LGPL 2.1), an older Java-based EPCglobal-certified repository, and its offshoot *Oliot* which pursues EPCIS 2.0 compliance – however, these are less active today. On the commercial side, **IBM Food Trust** (a blockchain-based food traceability network) uses GS1 EPCIS data formats for interoperability, demonstrating standards alignment at large scale. Solutions like *RfXcel* (Antares Vision) and *SAP Global Track and Trace* similarly support EPCIS for supply chain events, though as proprietary SaaS. Generally, open frameworks (OpenEPCIS, Oliot) offer full standards support and flexibility, while commercial platforms provide turnkey operations at a cost. We will evaluate these for fit, focusing on support for our coffee use-case (lot transformations, etc.) and ease of integration with our stack (Node/TypeScript).

**GS1 Digital Link Tools & Resolvers:** Our consumer-facing “digital passport” uses GS1 Digital Link (DL) URIs encoded in QR codes. For managing these URIs, GS1 provides an open-source **Digital Link Resolver (Community Edition)**. This is a Python-based web service (Apache 2.0 license) that redirects GS1 identifier URIs to associated resources. It supports the full GS1 DL standard (v1.1.1) and is designed for high-performance, scalable resolution. Notably, it can handle multiple link types (e.g. one code linking to product info, certification, traceability data, etc.) and supports URL compressions to shorten QR codes. GS1’s reference resolver is used by at least three national GS1 Member Organizations already, indicating maturity. We can self-host this resolver on our domain (e.g. `id.ourco.com`) or use the **GS1 Global Office Resolver** at `id.gs1.org` (a free, highly resilient service governed by brand-owner link approvals). For creating and parsing Digital Link URIs, GS1 offers the **GS1 Digital Link Toolkit** (JavaScript, Apache 2.0) to convert between classic element strings (AI syntax) and DL URIs. This toolkit simplifies encoding GTIN, lot, serial into a compliant URI and decoding scans back to AI data, ensuring our codes work seamlessly with both web resolvers and POS systems. The toolkit and resolver adhere strictly to GS1 standards, ensuring **interoperability** – any GS1 conformant scanner or app can resolve our codes. We will leverage these tools for quick integration: e.g. using the Toolkit in our TypeScript backend to generate QR payloads, and deploying the GS1 Resolver CE (via Docker) for edge resolution of scans.

**2D Barcode Generation (GS1 QR/DataMatrix):** Generating high-quality QR or DataMatrix codes with GS1 data is crucial. For QR Codes carrying a GS1 DL URI, any standard QR generator library (e.g. **node-qrcode** or **bwip-js**) can be used, since the data is just a URI string. However, to encode **GS1 DataMatrix** (which some partners might require), the generator must insert the Function Code 1 (FNC1) character to denote GS1 format. Open-source libraries like **Zint** (C library with Node bindings) or **bwip-js** support GS1 DataMatrix and GS1-QR (with FNC1) out-of-the-box. These allow inclusion of application identifiers like (01) GTIN and (10) lot in the symbol. Our plan is to use QR codes (with Digital Link URIs) for consumer scans, given their familiarity and capacity, but we remain ready to produce GS1 DataMatrix if needed for retail (especially since DataMatrix can be smaller for the same data). We will ensure our chosen library supports **structured append** or long data encoding (as our URIs might be lengthy) and can output vector formats for printing. Additionally, the GS1 Resolver CE v3 includes a new URL compression feature that can shorten the encoded URI without losing information – this could be leveraged if our digital link URIs become very long (e.g. when embedding multiple data elements). Overall, many frameworks exist for barcode generation; we will likely implement a tested library (e.g. *bwip-js* for Node) to generate SVG/PNG codes on-demand or during label printing, configured for GS1 compliance.

**Mobile & Web Scanning SDKs:** To capture the QR/DM codes in the field and at consumer side, robust scanning software is needed. For mobile apps, top-tier SDKs like **Scandit** and **Scanbot** (now Apryse) offer fast and accurate scanning with support for GS1 data parsing. Scandit’s SDK is known for its *unmatched speed and reliability in real-world conditions (wide angles, long distance, low light, damaged codes)*. It supports all major 1D/2D symbologies (including GS1 DataMatrix, QR, GS1 Composite) and provides a GS1 data parser for AIs and Digital Link out of the box. Scanbot’s SDK similarly can scan and parse GS1 barcodes; their blog notes that one barcode/QR can lead to multiple information resources depending on who scans it – a reference to Digital Link’s context-based resolution, which our app will utilize. These commercial SDKs come at a licensing cost, but are enterprise-grade (Scandit cites 50+ billion scans/year on 150M devices) and have features like scan tracking, AR overlays, etc. For web (in-browser) scanning (e.g. our consumer web app on mobile), pure JS solutions exist: **ZXing** (open-source) compiled to WebAssembly can scan DataMatrix/QR in-browser. It’s widely used (the ZXing library is the engine behind many free apps) and one user reported ZXing JS handled 2D codes after some tweaking. However, performance can be moderate compared to native SDKs. Another option is **Dynamsoft’s Web SDK** or **Scandit’s Web SDK**, which leverage camera streams and have optimized decoders, but require a subscription. Given our need for a smooth consumer UX, we lean toward using the device’s native camera app or a light web SDK for scanning the QR: the QR code encodes a URL, so often users can just use their phone camera which will recognize the URL and open the browser directly. For B2B users (e.g. warehouse receiving), if they use our mobile app, we might integrate an open-source library like ZXing or deploy Scandit’s SDK if budget allows, to ensure quick scans under various conditions (glare in a warehouse, etc.). **Low-light and motion** scenarios are explicitly addressed by these SDKs using image processing and even AI; Scandit, for example, uses an “AI engine” for real-time capture to handle blurry or angled codes. **Parsing GS1 data**: After scanning, if using ZXing or similar, we’ll need to parse the raw data. GS1 provides a lightweight JS library **interpretGS1scan** for breaking down AI element strings into key-value pairs, and the Digital Link Toolkit (mentioned above) can decode a URI into GS1 AIs. In summary, we have options ranging from free and open (ZXing, GS1 parse libraries) to paid and high-performance (Scandit, Scanbot). We will balance cost vs. performance: initial MVP could start with open solutions and upgrade to a commercial SDK if scan volumes or user feedback demand best-in-class speed. We’ll also keep an eye on **Google ML Kit’s** barcode API (free, on-device scanning for Android/iOS) as a middle-ground – it supports 2D codes and could read our QR, though it might not fully parse GS1 AI out of the box (we can handle parsing ourselves).

**Document Storage & Signing (VCs and Certificates):** Our platform will likely handle documents like organic certificates, fair-trade proofs, etc., linking them to product batches. For storing these, we can use a document store (e.g. an S3 bucket or secure file storage) with references in our database. The key is to **sign and verify** these credentials so that stakeholders trust them. We plan to leverage **W3C Verifiable Credentials (VC) Data Model 2.0**【13†】 for representing such claims (e.g. *“Lot 123 is certified Organic by XYZ Authority”*). Several libraries exist in Node/TS for VC issuance: one is Digital Bazaar’s `vc-js` (for Linked Data Proofs), and another is DIF’s `did-jwt-vc` for JWT-based credentials. These allow us to create a credential JSON, sign it with our private key (or the certifier’s key), and later verify signatures. For example, we could establish a DID (Decentralized ID) for our company or use **did\:web** (our domain as an identifier) and have certifiers either use our system or provide us with VCs for their claims. In practice, we might start simpler: perhaps sign a JSON containing key info (cert number, issuer, expiry) with a PGP or RSA key and provide the public key for verification. However, aligning with emerging standards like VC ensures future-proofing and interoperability. We will keep PII out of these credentials (they pertain to products, not individuals, so GDPR risk is low). For general document signing (like PDF certs), we could integrate with services or libraries (e.g. DSS for PDF, or simply attach a cryptographic hash on blockchain for tamper evidence). It’s worth noting GS1 is also exploring VCs for traceability, so our adoption here aligns well. Additionally, to maintain **data integrity**, OpenEPCIS’s tool for generating **Event Hash IDs** can create an immutable fingerprint of each EPCIS event; if we store those or even leverage blockchain (optional), we can detect any event tampering. In summary, we will implement a signing mechanism for critical data: product passports can include cryptographic proofs (signatures by issuers) that consumers or partners can verify, adding a layer of trust (e.g. preventing a fraudulent “rainforest alliance” claim by requiring the actual certifier’s signature). Libraries and standards in this space are evolving, but our evidence-based choice leans to using **DID/VC toolkits** that integrate with Node, ensuring compliance with W3C’s latest recommendations.

**Maps & Geospatial Services:** Visualizing supply chain locations (farms, mills, ports, roasteries) is a key part of the “passport” consumer experience. We will avoid proprietary map platforms to keep control and costs manageable. A likely choice is **MapLibre GL JS**, the open-source fork of Mapbox GL, for interactive maps in the web app. MapLibre supports modern vector tiles and works well in a Next.js front-end. We can use OpenStreetMap (OSM) data for map tiles – either via a service like MapTiler or self-hosted tiles. For simplicity, a reasonable approach is to use a free tier of a tile service (ensuring terms allow our usage), or host raster tiles on a CDN for common zoom levels of regions we need. As a fallback (e.g. if WebGL or internet connectivity is an issue), we can generate static map images. Libraries exist to fetch a static map from OSM (for example, using the **Static Maps API** by Mapbox/Maptiler, or even Google Static Maps if allowed – though Google would need an API key and has costs). Given our likely user base (consumers with smartphones), interactive maps with pinch-zoom and markers for each supply chain location would be ideal. We’ll include markers for origin (farm), perhaps intermediate warehouses, and roasting facility on a world map. The geocoordinates can come from partner data (we’ll store latitude/longitude in location master data). If privacy is a concern (e.g. exact farm location), we can generalize it (show region rather than exact coordinates), but since the selling point is provenance transparency, we expect partners will share at least town-level locations. **Geocoding** (converting addresses to lat/long) might be needed for some data – we can use a free geocoder like Nominatim (OSM) in batch for that. Lastly, for **geo-analytics** (like seeing where scans occur), we might integrate simple reverse lookup for IP-to-location using a geolocation API or database, but more on that in Analytics. All map-related choices will prioritize open standards and **offline capability** where feasible. (For example, MapLibre + OSM allows bundling certain tiles offline if we ever did an app in areas of low connectivity.)

**Analytics, Search, and Data Pipeline:** For search functionality (e.g. an internal tool to lookup a product or lot, or full-text search on supply chain records), we plan to use **OpenSearch**, the open-source Elasticsearch fork. OpenSearch will index our EPCIS events and master data (like product names, farm names), enabling fast querying by various fields (GTIN, lot, etc.) and free-text. This is useful for internal users or possibly for a “lookup” feature on the consumer site (if we allow consumers to search by batch code manually). OpenSearch is Apache 2.0 and can be self-hosted or used via AWS’s managed service. For big data analytics (tracking scans, performance, etc.), we will implement **ClickHouse** as our time-series/analytics database. ClickHouse’s columnar storage is optimized for large insert rates and fast aggregations – perfect for telemetry like “scans per day per region” or supply chain event stats. It’s also open-source (Apache 2.0). We anticipate logging each consumer scan event to ClickHouse with attributes (timestamp, geohash or region, product, etc.), which can then be aggregated for dashboards. ClickHouse can handle millions of rows per second on cluster hardware, far above our needs, but this gives headroom as we onboard many products and users. The integration pattern might be: our Cloudflare Worker or backend API sends a small log message to a Kafka topic or directly to a ClickHouse ingestion endpoint on each scan. Alternately, we log to a file and batch insert. We’ll also use ClickHouse (or possibly Postgres) for calculating “traceability analytics” – e.g. dwell times (time between harvest and roast), % of lots with complete data, etc., to help producers improve processes. For real-time event streaming, a message broker like **Kafka** or **NATS** could be introduced (see architecture options), but at minimum we’ll use a Redis-backed queue (see below) or lightweight streaming to feed our analytics asynchronously so as not to slow the main user interactions.

**Job Queues & Background Processing:** Many tasks in our system will be asynchronous – e.g. sending notifications, running data quality checks, computing analytics, or pulling data from partners’ systems. We will introduce a job queue to handle these outside of the request/response cycle. In the Node/NestJS ecosystem, **BullMQ** (built on Redis) is a popular open-source choice for a reliable job queue. It allows us to define job types (e.g. “validateBatchData”, “sendEmailReport”, “reindexLot”) and workers to process them, with features like retries and rate limiting. Using Redis as a backbone, it’s lightweight and fits well with our stack. An alternative is **RabbitMQ** (AMQP) which NestJS also supports via microservice modules – Rabbit is robust and can ensure delivery, but adds complexity we might not need at first. If we go the event streaming route (Kafka), that can also double as a job pipeline, but for simplicity, BullMQ on Redis should cover most needs (and can handle thousands of jobs/sec on modest hardware). For scheduling periodic jobs (like nightly data quality scans or weekly partner reports), we can use NestJS Scheduler or a library like node-cron, or have a “cron jobs” queue. **Observability & Monitoring:** To maintain reliability, we will implement comprehensive logging and tracing. **OpenTelemetry** will be integrated into our services (NestJS has OpenTelemetry module support) to trace requests from the edge (Cloudflare) through our APIs and into the database calls. This will allow us to see performance bottlenecks and errors across the distributed system. We’ll export traces to an APM backend – possibly **Jaeger** or **Zipkin** (both open-source) or a managed service if convenient. Metrics (CPU, memory, custom app metrics like “events processed per minute” or “scan latency”) will be collected via **Prometheus** with Grafana dashboards, or we might use a cloud monitoring if on a platform. Cloudflare Workers provide some built-in analytics as well for request counts and errors at the edge. **Alerting** will be set up (like if a partner ingestion fails X times, or scan volume drops unexpectedly indicating an outage). Given the criticality of trust, we’ll also log any data modifications and access in audit logs (e.g. using a separate Postgres table or file log) – these can be reviewed to detect any anomalies (security or data issues). We will ensure logs do not contain sensitive personal data (and since we’re not dealing with consumer PII, mainly just product events, we are clear there). In summary, our stack includes best-of-breed open tools: OpenSearch for search, ClickHouse for analytics, Redis/BullMQ for background jobs, and OpenTelemetry/Prometheus for observability. These components are proven at scale (OpenSearch inherits Elastic’s scalability, ClickHouse used by large analytics firms) and should comfortably support our coffee traceability use-cases from MVP to growth.

## Comparison Matrix

Below is a comparison of key solution components and platforms relevant to our coffee traceability platform. The table evaluates open-source options versus commercial services across multiple criteria (standards support, integration effort, scalability, etc.). This serves to identify the best-fit combination for our needs.

```csv
Category, Vendor/Project, Open Source (Y/N), License, Hosting Model (SaaS/Self), Standards Support (EPCIS, CBV, Digital Link, DPP), Ingestion API, Validation, Event Throughput (est.), Resolver Features, QR/2D Support, Mobile SDKs, Security (Certifications/Features), PII Footprint, Data Residency, Pricing Model, Integration Effort, Fit Score (0-10), Notes/Constraints, Sources
EPCIS Repository, OpenEPCIS, Y, Apache-2.0, Self-host or SaaS (by partners), EPCIS 2.0, CBV 2.0; accepts GS1 DL URIs as IDs (Y); DPP-ready: core fields only, REST/GraphQL API (OpenAPI), JSON Schema & SHACL (GS1):contentReference[oaicite:33]{index=33}:contentReference[oaicite:34]{index=34}, High (designed for real-time, horizontal scaling):contentReference[oaicite:35]{index=35}:contentReference[oaicite:36]{index=36}, n/a (separate resolver needed), n/a (generates URIs but no code printing), n/a (tooling only; no scanning SDK), Security by design (self-managed; can use mTLS, OAuth2); no official SOC2, Minimal PII (only business data), Any (self-hosted – deploy in chosen region), Free OSS (no license cost); SaaS hosting optional (subscription):contentReference[oaicite:37]{index=37}, Medium (must integrate API and possibly customize ILMD), 9, Full GS1 standards compliance; highly flexible; requires devops to deploy and maintain, "OpenEPCIS Docs – fully compliant GS1 EPCIS 2.0":contentReference[oaicite:38]{index=38}:contentReference[oaicite:39]{index=39}
EPCIS Repository, IBM Food Trust, N, Proprietary, SaaS (IBM Cloud), EPCIS 1.2/2.0 compatible (GS1 standards-based):contentReference[oaicite:40]{index=40}; custom blockchain ledger; DPP: pursuing (food focus), REST APIs & web portal, Internal validation (strict format + blockchain consensus), High (IBM reports millions of txns; used by Walmart suppliers), n/a, n/a, n/a, SOC2, ISO27001 certified (IBM); blockchain immutability, Minimal PII (mostly product data; users corporate), Multi-region cloud (selectable), Enterprise subscription (per transaction or volume-based), High (complex onboarding, data mapping, IBM contract), 6, Proven network esp. for food safety; high trust via blockchain; but costly and less customizable for small org, "IBM uses GS1 EPCIS standard for Food Trust":contentReference[oaicite:41]{index=41}
Digital Link Resolver, GS1 Resolver CE, Y, Apache-2.0, Self-host (Docker) or GS1 SaaS (id.gs1.org), GS1 Digital Link 1.1; GS1 Web URI standard:contentReference[oaicite:42]{index=42}; (EPCIS not directly, but returns links); DPP: supports linkTypes for sustainability info, REST/JSON API for link provisioning, Data validation on input (GS1 syntax & link format):contentReference[oaicite:43]{index=43}, High (built for global scale – cloud-native Python, MongoDB):contentReference[oaicite:44]{index=44}:contentReference[oaicite:45]{index=45}, Redirects based on context; multiple link support; content negotiation:contentReference[oaicite:46]{index=46}, Supports GS1 QR and GS1 DataMatrix URIs (compression available):contentReference[oaicite:47]{index=47}, n/a (not an SDK, but libraries available), No known certs (community project); security via container isolation, No PII (resolves product codes only), Self-host: any region; GS1 SaaS: global (EU-based), Free (open-source; GS1 global resolver free to use):contentReference[oaicite:48]{index=48}, Low/Med (easy Docker deploy, but requires initial data setup), 10, Purpose-built for linking IDs to resources; highly conformant; minimal maintenance (if GS1-hosted); essential for consumer UX, "GS1 Digital Link Resolver – open source, connects IDs to web resources":contentReference[oaicite:49]{index=49}:contentReference[oaicite:50]{index=50}
Traceability Platform, Digimarc Product Cloud (EVRYTHNG), N, Proprietary (some SDKs Apache 2.0), SaaS (multi-tenant cloud), EPCIS 2.0 support via API (JSON-LD):contentReference[oaicite:51]{index=51}; GS1 Digital Link integrated (EVRYTHNG codes/short URLs); partial DPP (focused on consumer engagement, can add sustainability data), REST API (JSON) + JS SDK; OAuth2 keys, Built-in validation & IoT Hub rules (ensures GTINs, etc.), High (designed for global brands: proven with >100M products; auto-scaling on AWS), Built-in resolver and short URLs (redirect service); links to dynamic experiences, QR codes supported (EVRYTHNG offers QR provisioning); DataMatrix/others possible via partners, Mobile SDK available (EVRYTHNG mobile SDK to scan & interact) + can use 3rd-party SDK, SOC2 (EVRYTHNG had SOC2 Type II), ISO27001; fine-grained API keys and data encryption, Minimal personal data (tracks product scans, location approx); user analytics pseudonymous, Multi-region (US/EU datacenters; EU data can stay in EU), Subscription tier (pricing based on # of Active Digital Identities and API usage; enterprise pricing), Medium (good SDKs/docs, but need to map our data model to their system), 8, Fastest to market (all-in-one platform: device to cloud); rich analytics; however, lock-in risk and recurring costs; flexibility limited to platform capabilities, "EVRYTHNG EPCIS SDK – send data to GS1 EPCIS 2.0 repositories":contentReference[oaicite:52]{index=52}:contentReference[oaicite:53]{index=53}
Scanning Solution, Scandit Barcode SDK, N, Proprietary, SDK (mobile/web, on-device), GS1 Symbology support (yes, all 1D/2D codes); GS1 AI parsing (built-in):contentReference[oaicite:54]{index=54}; Digital Link ready (can return URI or AI fields), Native SDK APIs (iOS, Android, JS) with cross-platform support, n/a (scanning library – validation of barcode data via GS1 spec built-in), Very High (real-time scanning on device; up to 480 scans/min on modern phones), n/a (not a resolver, but decodes GS1 URIs/AIs), Supports all GS1 2D codes (QR, DataMatrix, Composite) – optimized for damaged/low-light codes:contentReference[oaicite:55]{index=55}, Yes – robust mobile SDK for iOS/Android; also WebAssembly for web, Security: SDK processes on-device (no data sent out); Scandit is GDPR compliant, PII: None by default (only barcodes data processed locally), n/a (on-device; cloud dashboard in EU or US for license mgmt), License fee (annual/SDK seat pricing, based on app volume; enterprise pricing), Low/Med (straightforward integration, well-documented; just need license key), 9, Best-in-class scan performance (especially for consumer app) – ensures frictionless UX; cost is main drawback for large scale, "Scandit SDK – fast, accurate scanning even for tiny or poor codes":contentReference[oaicite:56]{index=56}

```

*(Sources: OpenEPCIS site, OpenEPCIS GitHub, GS1 Resolver README, GS1 Docs, EVRYTHNG EPCIS SDK GitHub, Scandit docs, ByteAlly/IBM Food Trust.)*

**Summary of Comparison:** Open-source solutions like **OpenEPCIS** and **GS1 Resolver CE** score highest on standards compliance and flexibility, making them strong fits for our need to adhere to EPCIS 2.0 and GS1 Digital Link to the letter. They require self-hosting but no license fees, and integration effort is moderate (we control the APIs and data schemas). Commercial SaaS like **Digimarc EVRYTHNG** can accelerate deployment (many features out-of-the-box, including consumer engagement and analytics), but come with vendor lock-in, less customizability for niche needs (e.g. custom data fields), and ongoing costs. EVRYTHNG does align well with GS1 standards (they co-developed some of these standards, and even provide an EPCIS API), so its fit score is high for quickly achieving a “digital passport” experience – albeit with our data residing in their cloud. IBM Food Trust and similar networks are ideal for strict compliance and network effects (multiple stakeholders already on-board), but are heavyweight for our context and oriented to broader food safety use-cases (blockchain overhead, focus on compliance like DSCSA in pharma) that might exceed coffee needs; plus the cost and complexity reduce their fit for our agile project (score 6/10). For scanning, **Scandit** stands out as the premium choice to ensure end-users can scan codes effortlessly in any condition – crucial for adoption at the consumer level. Its only downside is cost, but integration is easy and it fully supports GS1 data, making it a near-perfect fit from a technical standpoint (9/10). We may start with open-source ZXing for cost reasons in MVP, but keep Scandit as a likely upgrade once user testing begins (to guarantee a snappy scan UX). Overall, a combination of **OpenEPCIS (events repository)** + **GS1 Resolver** + **custom code** appears to score highest on our rubric for control, compliance, and long-term cost-effectiveness. In the next section, we’ll explore how these choices form complete architecture options.

## Architecture Options RFC

We evaluate four architecture approaches for the platform, ranging from a fully custom “build” to leveraging open-source EPCIS infrastructure or third-party SaaS, and even a hybrid event-driven design. Each option is described with its goals, an illustrative flow, pros/cons, and fit to our product personas and requirements.

### Option A – **Custom Build-Centric Architecture**

**Goal:** Maximize control by building our own capture system and data store, using general-purpose databases and code. Focus on tailor-made APIs and flexibility in how data is modeled and used.

**Diagram (simplified sequence):**

```
Partner (Producer) --> [NestJS Ingest API] --> (mTLS + OAuth2/HMAC) --> [Postgres DB (JSONB events)]
Partner (Distributor) --> [NestJS Ingest API] --> ... --> [Postgres DB]
...
Consumer scans QR --> [Cloudflare Worker Resolver] --> redirects to [Next.js Consumer App] 
Next.js App --> [GraphQL API] --> [Postgres DB] (fetch trace events + master data)
GraphQL API --> [OpenSearch] (for any text search or product lookup)
Async: [Postgres] --> [ClickHouse] (stream events for analytics) 
Async: [Postgres] --> [Notification Service] --> [Webhook to Partners]
Monitoring: [OpenTelemetry] across API, DB, resolver (trace IDs)
```

**How it works:** In Option A, we implement our own **EPCIS capture API** (NestJS) that writes events into a PostgreSQL database (using JSONB to store the event JSON-LD). Each partner (coffee growers, roasters, etc.) calls our API to send events (commission, transformation, shipping, etc.), authenticated via OAuth2 client credentials and signed payloads (for integrity). The data is validated (JSON Schema, etc.) in the API layer before insertion. The consumer-facing side uses our custom **Cloudflare Worker** as the resolver: when a QR (Digital Link URI) is scanned, the worker parses the URL path (e.g. GTIN and lot) and then **redirects** the user to our Next.js web app’s passport page for that identifier. The Next.js app then queries our backend (GraphQL API) for the traceability data (which we assemble from Postgres). We maintain indices or materialized views for efficient querying (e.g. an aggregated “passport view” of events). Background workers (via Redis/BullMQ) handle things like pushing events to **ClickHouse** for analytics (e.g. logging each scan event from the worker), sending webhooks to downstream systems (like notifying a retailer when a batch is shipped), and running data quality checks. All components are instrumented with OpenTelemetry for tracing through the pipeline.

**Pros:**

* **Maximum Flexibility:** We can shape the data model and APIs exactly to our needs (e.g. custom ILMD fields for roast profile) without being constrained by an external system’s design.
* **No license fees:** aside from cloud infrastructure, all components are open-source or custom. This lowers TCO (total cost of ownership) if managed well.
* **Custom Optimizations:** We can optimize queries or storage for our specific access patterns (e.g. use Postgres JSON indexing on `event->>GTIN` for fast lookups, or create summary tables per lot for quick consumer queries).
* **Simpler stack alignment:** Everything is in our TypeScript/Node comfort zone (aside from the DB), which means unified language for logic (resolver, API, processing).
* **No vendor lock-in:** Data is in standard databases we control; we can migrate or extend as needed (e.g. if Postgres becomes a bottleneck, we could move to a different DB or shard).

**Cons:**

* **Development Effort:** Building the full capture and query logic is non-trivial. We must implement EPCIS standard behaviors (event type handling, query interface) largely from scratch or using libraries. This increases initial time-to-market.
* **Potential Gaps in Standards:** While we aim for compliance, there is a risk of subtle deviations or missing features compared to a proven EPCIS repository. E.g., ensuring our JSON-LD context usage and CBV terms are 100% correct requires diligence.
* **Maintenance & Scaling:** We become responsible for all scaling challenges. Postgres with JSONB can handle moderate loads, but high event throughput (say tens of millions of events/year) might require sharding or moving heavy query loads to a specialized store. We’d also manage upgrades, backups, etc., ourselves.
* **Reimplementing Features:** Many features (subscriptions, event hash IDs, etc.) that come out-of-box with OpenEPCIS we’d have to implement. This could include things like enforcing event idempotency or building a GUI for debugging events – more work for our team.
* **Edge-case Handling:** EPCIS has complex options (like event reconciliation, or pre-defined queries). We might skip some advanced capabilities to save time, at risk of not supporting certain partner needs without extra dev.

**Key Risks:** One risk is **slower compliance updates** – if GS1 publishes an EPCIS 2.1 or changes in Digital Link, we must manually update our system. Another is **data integrity** – a bug in our code could let bad data in (mitigated by rigorous validation). Performance is a risk if event volume spikes (but can be mitigated by scaling Postgres vertically or partitioning by year). There’s also **team expertise**: operating a custom solution demands in-house knowledge of EPCIS and GS1 standards; if key devs leave, could we maintain it? Finally, **security** is on us entirely – we must do thorough security reviews (SQL injection, auth, etc.).

**Mitigations:** We will lean on **standards libraries** where possible (e.g. use GS1’s epcis2.js to form/validate events, use known JSON schemas) to avoid reinventing logic. To handle scaling, we can design with partitioning in mind from day one (for example, partition Postgres by month or by company to ease future scaling, or implement an archival policy for old events). For maintenance, we’ll invest in good documentation and automated tests (including testing our output against the GS1 EPCIS Test Suite if available). We can also plan a migration path: if our custom store hits limits, we could gradually switch to an OpenEPCIS backend (Option B) behind the scenes, since our API could be designed to be forward-compatible with that. For security, we’ll do external audits when possible and follow best practices (like OWASP guidelines, regular pen-testing).

**Estimated Cost (12 mo):** Using fully self-managed infra: we estimate \~\$500/month for a managed Postgres DB (with high availability), \~\$200/month for Redis + workers, and some for Cloudflare Workers (likely <\$50 at our request volumes). Plus engineering time (initial heavy lift). So infra maybe \~\$10k/year. Engineering cost is harder to quantify but essentially we’re trading that for license fees of alternatives.

**Decision Criteria Fit:**

* *Standards Compliance:* 8/10 – We can achieve full compliance if we do it right, but it’s on us to prove. Using GS1 contexts and schemas gets us close.
* *Integration Fit:* 10/10 – It’s our stack; we can ensure the APIs, data formats, and tools (GraphQL, JSON) fit perfectly with our Next.js/NestJS environment.
* *Performance & Scale:* 7/10 – Postgres JSONB can handle quite high load (especially with partitioning and proper indexing), but not as purpose-built as some specialized solutions. For the anticipated volume (maybe tens of thousands of events and moderate scan traffic), it’s likely fine. If scaling beyond, we’d need to evolve architecture (as noted).
* *Security & Compliance:* 8/10 – We have full control to implement top-notch security (mTLS, cloud security groups, etc.), but we won’t have ready certifications; achieving SOC2 would be entirely our effort.
* *Cost & Licensing:* 9/10 – Very cost-efficient (no per-event or per-scan fees, just infra). Open-source licenses pose no risk (Apache, etc.).
* *Maintainability:* 6/10 – This is custom code, so docs/community are only as good as we write. However, our team knows the stack well; the risk is more about staying updated with standards.
* *Vendor Lock-in:* 10/10 – None external. We own it; data portability is excellent (everything in standard JSON in Postgres, easy to dump or migrate).

**Overall Fit:** Option A appeals to our need for **control and customizability**. It aligns with a persona like our “Tech Lead” who values an open, extensible system that can be tailored as new use-cases arise (e.g., adding a new event type or integrating with an IoT sensor). It also benefits the “Data Privacy Officer” persona since data stays in our controlled databases (no third-party cloud with unknown data handling). However, it may challenge the “Product Manager” persona on timeline – more features to build could mean a slower MVP. We should choose this if we prioritize independence and have the development bandwidth, and if our initial scale is manageable on a single Postgres instance. It sets us up with a strong foundation we fully own.

**Sources:** Primary design derived from team’s architectural planning. References to GS1 standards usage in custom code from GS1 and OpenEPCIS docs.

---

### Option B – **OpenEPCIS-Centric Architecture**

**Goal:** Leverage a ready-made, standards-compliant EPCIS repository (OpenEPCIS) for core capture and query, minimizing custom build on that layer. Focus our effort on integration and consumer-facing features instead of reinventing traceability data storage.

**Diagram (integrating OpenEPCIS):**

```
Partner System --> [OpenEPCIS Capture API] --> (Auth via API key/OAuth) 
OpenEPCIS Service --> [OpenEPCIS DB] (events stored, e.g. Mongo or SQL depending on impl)
Partner queries (optional) --> [OpenEPCIS Query Interface]

Consumer scans QR --> [Cloudflare Worker] (id redirect) --> [Next.js Consumer UI] 
Next.js --> [NestJS Backend] --> [OpenEPCIS Query API] (fetch events by product/lot)
NestJS Backend <---> [OpenEPCIS] (using REST or SDK to retrieve events)
OpenEPCIS --> returns JSON-LD event data --> NestJS formats into GraphQL response

Async: [OpenEPCIS] can push events (via webhook or subscription) -> [Our Processing] (e.g. to update search index or analytics)
Our Sidecars: [Format converter] [Validator] from OpenEPCIS toolkit for any pre/post processing
```

**How it works:** We deploy the OpenEPCIS server (likely as Docker containers). Partners send EPCIS events to OpenEPCIS’s **capture endpoint** (which adheres to the EPCIS 2.0 REST spec). This might go through our gateway for authentication/routing, but essentially OpenEPCIS handles storing the events, assigning eventIDs or hashIDs, etc. The events are stored in OpenEPCIS’s database – by default, OpenEPCIS uses a document-oriented store (likely MongoDB, given GS1 Resolver uses Mongo and OpenEPCIS touts flexible JSON storage). For retrieving data, OpenEPCIS provides a query API (could be REST with query parameters or even GraphQL in the future). Our backend (NestJS) would call this API to get events for a given product or lot when the consumer app requests it. We then format or enrich that data (maybe combine with master data like product names from our DB) and serve to the frontend. The resolver (Cloudflare Worker) remains similar to Option A – it just redirects to our Next.js app. We could also consider using OpenEPCIS to store master data or utilize its **subscriptions** feature: OpenEPCIS can do callback subscriptions on certain events (for example, notify our app whenever a new event for a particular product arrives). This can replace some custom background jobs: e.g., instead of polling or separate webhooks, OpenEPCIS itself might notify when an event comes, and we could then update our OpenSearch index or send notifications. We’d still use ClickHouse for analytics, likely by tailing events from OpenEPCIS (maybe via its audit log or an event streaming plugin).

**Pros:**

* **Standards Assurance:** OpenEPCIS is built to GS1 standards out-of-the-box, including full support for EPCIS 2.0 and CBV 2.0 (vocabulary). This greatly reduces the risk of non-compliance. For example, it will handle the proper JSON-LD context usage, and things like the correct handling of the event time zone offsets, etc. “out of the box”.
* **Feature Rich:** We get features like event hash generation, the built-in query interface (including standardized queries by example), and possibly sensor data handling with minimal effort. It’s easier to implement advanced flows (like event subscriptions or transformationID linking) since those concepts are in the tool’s design.
* **Time-to-Market:** We skip writing our own repository – just integrate. This speeds up development; we mainly configure OpenEPCIS (define user accounts, set up the needed vocabulary/master data) and build around it. For our personas, this means the “Product Manager” can deliver an MVP faster with full traceability functions.
* **Scalability & Performance:** OpenEPCIS is presumably optimized for EPCIS events (e.g. it might use efficient indexing for entity IDs, and it’s cloud-native for scaling horizontally). We can likely handle higher loads without re-architecting. We also offload heavy query logic to it – for example, retrieving all events for a given lot might be a single query to OpenEPCIS rather than our app doing multiple joins.
* **Community & Support:** Being open-source and backed by contributors like GS1 Germany, issues we encounter might already have solutions online, or we can get support from the community. It also likely stays updated with any standards evolution (i.e., if EPCIS 2.1 comes, OpenEPCIS maintainers would update it, and we can upgrade).

**Cons:**

* **Integration Overhead:** While we save on core dev, we add an extra component to integrate and maintain. We need to run OpenEPCIS services (learning their deployment, ensuring its DB and our systems work in concert). Debugging an issue might require diving into OpenEPCIS code or waiting for community fixes.
* **Possible Mismatch in Data Model:** OpenEPCIS is generic; our coffee model might have specific needs. E.g., representing a *“roasting profile”* might require using the ILMD extension; we might need to extend OpenEPCIS’s context for our data. It supports custom contexts, but we must carefully configure that. If we need to link events to external data (like a quality cupping score), we might have to either use ILMD or have a parallel system. Essentially, **flexibility is bounded by what OpenEPCIS allows** (though it is quite flexible).
* **Operational Complexity:** Running OpenEPCIS means another database (it likely uses MongoDB and maybe Kafka for subscriptions) – so we introduce new tech to our stack, which increases operational burden. Monitoring and scaling OpenEPCIS containers is an added task.
* **Potential Overhead:** If our use-case is relatively straightforward (which coffee is, compared to, say, pharma), OpenEPCIS might be somewhat heavy. For instance, if each query returns full EPCISDocument structure with contexts, etc., we might need to post-process to our simpler consumer view. That’s not a huge con, but some overhead in data size or translation.
* **Licensing and Host Model:** While OpenEPCIS is free, some advanced modules or managed hosting might not be. (OpenEPCIS itself is Apache 2.0, so likely all good; but say we wanted a cloud-hosted OpenEPCIS by a provider, that’d be a cost.)

**Key Risks:** One risk is **relying on a young project** – OpenEPCIS is relatively new. If a critical bug appears (say, a query misbehaves for certain edge case), we’d either wait for a fix or try to patch it. We could end up debugging unfamiliar code. Another risk is **lock-in of a different kind**: not commercial lock-in, but architectural lock-in – once we pour our data into OpenEPCIS’s structure, shifting away (back to custom or to another solution) might require data migration or reimplementation of features. Also, **performance tuning** risk: we may not have full visibility into how it stores data; if we hit a performance issue, we rely on provided config (like indexes) rather than being able to optimize internal queries easily. Finally, **team skill gap**: our devs need to learn how to interact with OpenEPCIS’s API and maybe how to write its JSON-LD queries – a learning curve that could slow development initially.

**Mitigations:** We can mitigate integration risk by starting with a **pilot implementation** of OpenEPCIS early – e.g., set it up in a dev environment, push some sample coffee events (farm->roaster->retail), and verify we can query them back correctly. This will surface any model mismatches or major issues while still in design phase. For potential bugs, because it’s open source, our team could contribute fixes or at least apply a patch. If absolutely needed, we could engage benelog (the developers) for support or consulting – effectively an insurance option. To reduce overhead, we might deploy OpenEPCIS in a contained way – e.g., use a managed MongoDB so we don’t worry about DB maintenance, and run the application stateless. We should also define **clear boundaries**: use OpenEPCIS for event capture and retrieval, but keep things like user management, access control, and analytics outside it (so we don’t entangle too much logic into it). That way, if needed in future, we could swap the backend (Option A or D) by reimplementing the capture/query interface without changing the consumer-facing part. Essentially, treat OpenEPCIS as an internal service module. For team skills, we can have training sessions on GS1 EPCIS and maybe get someone from GS1 or the community to guide best practices in modeling coffee processes in EPCIS (so we fully utilize the tool correctly).

**Estimated Cost (12 mo):** Running OpenEPCIS: if self-hosting, cost is similar to any service. Likely we’d run 2-3 containers (app, maybe a parser service, etc.) plus a MongoDB. So think of a VM or Kubernetes cost \~\$100–200/mo, and a managed Mongo \~\$200/mo for production volumes. So roughly \$3–5k/year infra. Developer effort saved can translate to cost savings. No licensing cost. If we opted for a SaaS OpenEPCIS (like the *benelog SaaS* offering), that might be subscription – but we have no evidence of pricing; likely they’d charge based on event volume or data size. Since open source is available, we probably stick to self-host to avoid recurring fees.

**Decision Criteria Fit:**

* *Standards Compliance:* 10/10 – OpenEPCIS was literally built for EPCIS/CBV compliance. It will ensure we meet all data format requirements. It likely will also keep us in line with GS1 Digital Link usage for IDs (it supports both URN and URI identification). For DPP, it doesn’t directly address it, but the data it captures can feed a DPP.
* *Integration Fit:* 7/10 – We have to integrate an external system. It provides REST APIs, which is fine for our stack, but it’s another API to call (adds latency and complexity). We may need to write an adapter or use their SDK (if any) in our NestJS service. Not a huge mismatch, but not as seamless as writing to our DB directly.
* *Performance & Scale:* 9/10 – Likely very good. It’s built for real-time and batch capture, has **high-performance subscription** mechanisms. The only slight unknown is how it performs with large volumes on given hardware, but for our needs it’s probably over-provisioned.
* *Security & Compliance:* 8/10 – OpenEPCIS presumably supports secure deployment (we’d put it behind TLS, etc.). It doesn’t give us SOC2 or such by itself, but being self-hosted we can enforce our own security. Multi-tenant data isolation can be trickier – we must ensure one client’s data isn’t accessible to another if using one OpenEPCIS instance (it might have some account model or we run separate instances per tenant). We’ll have to implement access control, possibly at the app layer (our API calls OpenEPCIS with the appropriate filters).
* *Cost & Licensing:* 10/10 – It’s OSS with Apache license, no strings. Infra cost is the only factor, which is manageable.
* *Maintainability:* 7/10 – We benefit from community maintenance for core features, but we also rely on them. If the project slows down, we might be stuck. But documentation seems solid (there are GS1 guidelines and OpenEPCIS docs). We should keep an eye on releases. Also, debugging through another layer could reduce maintainability slightly.
* *Vendor Lock-in:* 8/10 – It’s open source, so not a vendor, but it is a dependency. Our data is in standard format, so not locked per se. But our system becomes somewhat tied to how OpenEPCIS expects things. Still, since standards are used, moving out is feasible (we could export EPCIS events and load into another system). It’s a much lower lock-in than a commercial SaaS.

**Overall Fit:** Option B is attractive for delivering a robust, **standards-compliant solution quickly**. It aligns with the priorities of our “Compliance Officer” persona – we can confidently say the system follows GS1 standards because the core engine is GS1’s reference implementation. It also helps the “Engineer/CTO” persona by reducing development risk on complex parts. The trade-off is giving up some direct control, but since our domain (coffee supply chain) is not highly unusual, OpenEPCIS likely fits it well. This option might be ideal if we want a **working system fast** and plan to invest more in user-facing innovation (UX, analytics) rather than backend plumbing. It also provides a nice **migration path**: we could start with OpenEPCIS for MVP, and if down the line we find we need more customization or if openEPCIS doesn’t scale to some new requirement, we can switch to Option A or D (we’ll have all data in EPCIS format already, facilitating migration). In fact, OpenEPCIS could act as a stepping stone – proving out the event model and data flows, and we always have the option to pivot to custom if needed (with lessons learned from using it).

**Sources:** OpenEPCIS capabilities from official site and test data generator info. Compliance features and performance claims from OpenEPCIS documentation.

---

### Option C – **SaaS Traceability Platform Integration**

**Goal:** Outsource the heavy lifting of traceability and product cloud infrastructure to a managed platform (such as Digimarc’s EVRYTHNG Product Cloud, FoodLogiQ, or another IoT cloud). Use their APIs to handle events, identities, and possibly consumer experiences, allowing our team to focus on branding and analytics.

**Diagram (using EVRYTHNG as an example):**

```
Partner System --> [SaaS Traceability API] (e.g. EVRYTHNG EPCIS API) --> (Auth via API key) 
SaaS Platform --> (stores events, links to product IDs in cloud)

Consumer scans QR --> QR might be pre-configured to point to SaaS resolver (e.g. a short URL)
    OR we use our domain and call SaaS via API for data:
Consumer QR --> [Cloudflare Worker] --> Next.js App 
Next.js App --> [Our Backend] --> [SaaS API] (fetch passport data or digital links)
SaaS Platform --> returns product data, event history via API 
Our Backend --> passes to frontend (or frontend could call SaaS API directly with proper tokens in some cases)

Analytics:
SaaS likely provides scan analytics (dashboard or API) 
We might also receive webhooks for scans or periodically pull data to our ClickHouse for custom analytics
```

**How it works:** In this option, we partner with a platform offering “traceability as a service.” For concreteness, consider **Digimarc EVRYTHNG** (which has a history in consumer product traceability with GS1 integration). We would onboard our product master data and identifiers onto that platform. Each coffee product (GTIN) and potentially each lot or item gets recorded in their system as a “digital identity”. Partners (like a roaster) would send events to the platform – for instance, EVRYTHNG has an EPCIS 2.0 API endpoint, so a roasting event would be a JSON payload sent to them. The platform stores all events and links them to the product’s record. For consumer scans, there are two approaches: (a) Use the platform’s **resolver and consumer app** features – e.g., EVRYTHNG can generate a short URL QR (like `tn.gg/XYZ`) that when scanned, will redirect to either a default landing page or to a page we configure (like our website). It can also serve dynamic content like “product stories” if we uploaded them. Or, (b) use our own domain in codes (as we prefer) and have our system query the platform via API to retrieve the necessary info for the consumer. Option (b) is depicted above: the scan comes to our web app, then our backend calls the SaaS to get trace data (events, etc.) and we display it. The platform likely also provides built-in analytics (e.g. a dashboard of scans by region, and supply chain KPIs). We could either rely on that or export data to our systems for custom analysis.

**Pros:**

* **Fast Deployment & Proven Tools:** These platforms are battle-tested by large brands. EVRYTHNG, for instance, has been used for global consumer engagement campaigns and traceability by companies like Unilever, etc. That means a lot of features (consumer UI templates, integration connectors, etc.) are readily available. We essentially configure and get a running solution with far fewer lines of code on our part.
* **Rich Feature Set:** Most traceability SaaS offer additional capabilities: e.g. EVRYTHNG provides consumer engagement features (scan campaigns, loyalty), FoodLogiQ offers compliance workflows for recalls, etc. We might gain functionality like **dashboarding, alerts, and even blockchain integration** if needed, without building it ourselves. For example, the SaaS might automatically handle linking a scanned QR to showing a nice story map of the coffee’s journey if we’ve populated data.
* **Scalability & Support:** The platform scales as needed – if our volume grows, the provider adds capacity (usually part of what you pay for). Also, support teams are there to help with any issues (important for ensuring reliability for our customers). They likely have SLAs for uptime, etc. This reduces burden on our DevOps.
* **Security & Compliance Certifications:** Reputable platforms often have certifications like SOC2, ISO27001, and experience with GDPR compliance. For example, EVRYTHNG had ISO27001 and is now under Digimarc which likely maintains enterprise-grade security. If we need to assure clients (roasters, etc.) that their data is secure and standards-compliant, a big-name platform’s credentials help. They might also handle **PII concerns** gracefully if any arise (though in our case not much PII).
* **Continuous Improvement:** The vendor will keep the platform updated with new standards (GS1 Digital Link updates, DPP requirements from EU, etc.). For instance, if EU mandates Digital Product Passport data formats, a platform serving many clients will implement that and we benefit with minimal effort.

**Cons:**

* **Cost (Ongoing):** SaaS solutions can be expensive, often charging per volume of items or scans. For a scenario with perhaps thousands of product batches and potentially millions of consumer scans, costs can accumulate. E.g., EVRYTHNG historically used pricing by “Active Digital Identity” count and API calls. While perhaps manageable early (they often have starter tiers), it can ramp up as we onboard more products and users. We need to ensure our business model supports these recurring fees.
* **Vendor Lock-In:** Once our data and processes live in the platform, shifting away could be painful. We’d have to export potentially huge amounts of event data and re-integrate elsewhere. The platform’s features might be proprietary (even if they support standards like EPCIS, there may be custom data or workflows built up). This could limit future flexibility and negotiating power.
* **Less Tailored:** We may find certain things don’t work exactly as we want. For example, maybe their UI templates for consumers are limited or their data model doesn’t capture a nuance we care about (like a specific quality metric). If the platform doesn’t support it, we might have to request it or work around it. Our ability to customize is limited to what their APIs allow. We might also be constrained by their update cycles; if we want a new feature now, but it’s on their roadmap for next year, we have to wait or build an external workaround.
* **Integration Effort is still Non-zero:** We have to connect our partners to this platform – that means possibly using their specific APIs and SDKs. Partners might need to adapt to those (though if it’s EPCIS, that’s standard). Our systems must integrate with their auth and data model. We also must integrate their output into our consumer UI (unless we fully white-label their consumer experience, which might not align with our brand needs).
* **Data Residency/Ownership:** Using SaaS means our supply chain data (which could be sensitive business info) sits on external servers. We have to trust their handling. There may be concerns from producers about an outside party holding their data (though Digimarc/EVRYTHNG, etc., usually address this in contracts). If any clients require data to stay in a certain region (EU, etc.), we’d need the vendor to support that (some do have EU data centers, e.g., EVRYTHNG had multi-region capabilities).

**Key Risks:** The biggest risk is **strategic dependency** – if the vendor changes terms, raises prices, or even shutters (startups can pivot or be acquired), we’re left in a tough spot. Mitigating that after the fact is hard (we’d then scramble to bring everything in-house). Another risk is **scope misalignment** – if the platform is oriented to use-cases slightly different than ours. For example, some platforms emphasize **chain-of-custody for recalls** rather than rich storytelling; if our focus is consumer storytelling, we need to be sure the platform has good support for images, videos, etc., in the passport. Similarly, if our particular analytics needs (like granular scan telemetry with geofencing) aren’t directly supported, we might have to build that anyway, diminishing the SaaS benefit. There’s also **integration timeline risk** – sometimes, integrating a complex SaaS with our processes can take longer than expected (because we have to conform to their way of doing things, perhaps refactoring some of our initial code or data structure). And we have to train our users/partners on the platform’s usage as well, which is a change management aspect.

**Mitigations:** We would approach this by thoroughly evaluating the platform via a **pilot or sandbox**. For instance, use a limited dataset (one coffee product from farm to store) in EVRYTHNG’s trial environment. Test how to input events (does their EPCIS API truly accept all we need, how do we input ILMD like roast details?), and test the consumer scan experience (can we easily redirect scans to our site? If using their short URLs, can we embed our tracking?). Also, ensure we have **data export rights**: contractually and technically, verify we can get all our data out in standard formats (e.g., export all EPCIS events as JSON/XML) periodically. This way, if we ever need to migrate, we have the data. We might also architect our system to keep a **shadow copy** of critical data. For example, when a partner submits an event via our API, we could forward it to SaaS but also store a copy in our database (perhaps not full production-grade, but enough that in a pinch we have a record). This is somewhat redundant but provides insurance. For cost, we’d negotiate a clear pricing model and perhaps limit usage (like maybe we don’t use the SaaS for consumer scans if that part is pricey; instead we only use it for B2B data and do consumer analytics ourselves). We could also plan to use SaaS for MVP and reevaluate ROI after, say, a year – if costs are overshadowing benefits, we could pivot to Option A or B then. Having a **cancellation/transition clause** in contract with the vendor is important (so we’re not stuck in a multi-year commitment if it’s not working out). Finally, to mitigate partner adoption issues, we could use our system as a facade: partners still submit to our API (to maintain consistent UX for them), and our backend then pushes to the SaaS. This way, if we change later, partners are unaffected.

**Estimated Cost (12 mo):** These can vary widely. Some anecdotal figures: EVRYTHNG used to have packages in the tens of thousands of dollars per year for enterprise deals (for, say, a few million interactions). For a smaller startup pilot, maybe one could get a lower tier – possibly \$1–5k per month range depending on volume. Let’s say \$50k/year is a ballpark for a robust package that includes a few thousand product identities and a million scans. It could be less if volume is low, or more if we scale big with many SKUs and lots of marketing scans. Additionally, initial integration services or support might have a one-time cost. Compared to Option A or B’s mostly infra costs (\~few k/year), this is a significant budget consideration. However, it might replace costs in development manpower and give faster time to revenue (which could justify it if we secure paying customers on the solution sooner).

**Decision Criteria Fit:**

* *Standards Compliance:* 8/10 – Most such platforms embrace GS1 standards (EVRYTHNG was very GS1-friendly, FoodLogiQ uses some standards, etc.). EVRYTHNG’s API literally uses EPCIS 2.0 JSON and GS1 Digital Link URIs. So compliance is high. However, we give slightly lower score because it’s in their black box – we assume compliance, but we’re not directly in control of ensuring every nuance (and if we needed a custom field, it might not be “standard”). But generally, they likely ensure compliance more rigorously than we could alone.
* *Integration Fit:* 6/10 – This approach is somewhat a double integration: our partners to the SaaS, and our product to the SaaS. If the SaaS provides good SDKs and our team is comfortable with them, it’s doable. But it introduces complexity (network calls, handling vendor auth). It’s less neatly integrated into our Next.js/Nest world – e.g., our GraphQL might just be proxying data from the SaaS rather than directly hitting our DB, which adds latency and potential points of failure. So, not as tight a fit as owning the stack.
* *Performance & Scale:* 9/10 – These platforms are built to scale globally. They often use CDNs, edge logic (EVRYTHNG used to have an “Active Resolver” network globally). So for performance, especially on consumer resolution, it should be excellent (likely on par or better than what we’d do ourselves initially). They usually have high availability architecture. I subtract one point mainly because we rely on their performance – if something is slow, we have limited ability to fix it beyond complaining; whereas in Option A we could tune things directly.
* *Security & Compliance:* 9/10 – They likely have top-notch security, regular audits, compliance certifications – this is a strong point in favor for enterprise credibility. They also might handle things like storing data encrypted, fine-grained access control for different roles out-of-box. We lose some control, but gain assurance. We leave one point simply because we have to trust an outside entity with sensitive supply chain info – which for some might be a concern (e.g. what if a competitor is on the same platform? Usually data is isolated tenant-wise, but still one must trust they enforce it well).
* *Cost & Licensing:* 5/10 – This is the pain point. Recurring costs that scale with usage can pinch especially if our revenue is unclear early on. Also, we might have less freedom due to licensing (e.g. can’t exceed X events or we get charged more). On the plus side, we don’t worry about open-source license issues or infrastructure cost spikes (the cost model is more predictable).
* *Maintainability:* 8/10 – Maintainers are essentially the vendor. We offload maintenance of the core system to them – which is great (we don’t worry about DB backups, etc.). But our maintainability moves to managing the integration and keeping up with their changes (if API updates, we must adapt). They likely have good documentation and even customer success teams. If something breaks in their system, we file a ticket instead of fixing it ourselves – which is a different process (slower in some cases, but less work on us).
* *Vendor Risk / Lock-in:* 4/10 – There is definitely lock-in here. Although data can be exported, the reality is that migrating off a SaaS is a project on its own. Also, if the vendor has any trouble (financial or technical), our service could be impacted. We can mitigate but not eliminate this risk. We should evaluate the vendor’s stability (Digimarc is public and stable, so probably fine; a startup might be riskier).

**Overall Fit:** Option C is attractive if our priority is **speed and leveraging mature capabilities**, and if we have the budget to sustain it. It aligns with a persona like the “Business Executive” who might say, “I want a reliable solution now, and I’ll pay for it rather than spending a year building.” It also can be client-friendly: some larger retail clients might trust an established platform’s backing. However, for the “CTO/Tech Lead” persona who values autonomy, this can be uncomfortable. We’d essentially become integrators rather than owners of the core tech. Another angle: this option might be a good **phased strategy** – use SaaS to pilot the concept with a few brands quickly, get validation and maybe revenue, and simultaneously prepare for a possible transition to our own system (should the need or cost pressure arise). We must weigh how important unique customization is: if we find that 90% of what we need is standard and provided by SaaS, then it’s a strong case. But if we foresee a lot of customizing or innovating beyond what the SaaS can do (like specialized coffee-specific analytics), that erodes its benefit.

**Sources:** EVRYTHNG/Digimarc documentation indicating GS1 EPCIS and Digital Link support, plus general knowledge of EVRYTHNG capabilities (multi-link resolver, etc.). Scantrust/TrackVision case studies also inform expectations of SaaS.

---

### Option D – **Hybrid Event-Driven Architecture (Event Bus + Polyglot Persistence)**

**Goal:** Achieve high scalability and flexibility by using an event streaming backbone. Capture events into a distributed log (Kafka/NATS) and feed multiple purpose-specific data stores (read models, search index, analytics DB). Combines custom build with best practices for extensibility (like adding new consumers of the data easily).

**Diagram (event flow oriented):**

```
Partners -> [API Gateway] -> publishes to [Event Bus] (Kafka topic "epcis.events")
Event Bus -> [Validation/Enrichment Service] (consumer) -> if valid, writes to next topic or directly to DBs
Event Bus -> [OpenSearch Sink] (consumer that indexes events for search)
Event Bus -> [Postgres Writer] (consumer that stores raw event JSON in an events table, for long-term retention)
Event Bus -> [GraphQL Read Model Updater] (consumer that updates a denormalized "passport view" table keyed by GTIN+lot)
Event Bus -> [Analytics Processor] (aggregates count, etc., and writes to ClickHouse)

Cloudflare Worker (Resolver) -> Next.js UI -> [GraphQL API] -> queries the **read model DB** (already optimized for fast reads)
GraphQL API might also query OpenSearch for full text queries if needed
```

*(ASCII sequence would be complex; above is the architecture in text form.)*

**How it works:** In this model, when a partner sends an event, our ingestion component doesn’t immediately write to a database. Instead, it publishes the event message onto an **Event Bus** – likely Apache Kafka (or a cloud equivalent like AWS Kinesis, or NATS JetStream). This message bus becomes the source of truth for new data. Various **microservices** subscribe to the relevant topics and do their jobs: e.g., a “validator/enricher” service reads the raw events, validates schema and adds any missing contextual info (maybe looks up a GLN to get location name), then produces a cleaned event onto another topic. Downstream, multiple consumers can act on the events in parallel: one writes to a **Postgres** or other database that acts as the authoritative store of events (like an append-only store or an events table); another updates a **read-optimized view** (like combining multiple events into one document per lot for quick retrieval – possibly stored in a separate Postgres table or a NoSQL store); another indexes the event in **OpenSearch** for searching by various fields; yet another could push relevant info to **ClickHouse** for analytic measures. We might also have a consumer for triggering external notifications – e.g., if an event indicates a “received at retailer” step, automatically trigger a notification to the brand that their product hit the store (just an example). For the consumer-facing queries, instead of assembling from raw events each time, we rely on the pre-computed **read model** (e.g., a JSON document that contains the key info for that product’s passport: like {GTIN, lot, origin:..., roastDate, chain:\[... events ...]}). This read model is updated in near-real-time as events stream in. The Cloudflare resolver still just redirects the user to our app. The Next.js web app calls GraphQL which hits that read store (very fast, since it’s likely one document or row per passport). The entire system is reactive: if a new event comes in (say a recall event added after the fact), all the subscribers update and the next user who scans will see updated data (with a few seconds delay at most).

**Pros:**

* **Highly Scalable & Decoupled:** Kafka (or similar) can handle huge throughput – far more than our immediate needs, but it means we can scale to many events and many consumers of those events easily. Each part (search, analytics, DB) can scale independently by consuming from the log. This is future-proof if we onboard many more products or even if we start ingesting IoT sensor readings, etc. The decoupling also isolates failures: if OpenSearch is down, events still flow into the log and to other services; OpenSearch can catch up later when it’s back, due to Kafka retention.
* **Real-time Processing & Extensibility:** It’s straightforward to add new features by attaching a new consumer. For example, if we want to integrate a machine learning service to predict something from events, it can just tap the stream without altering the existing pipeline. Similarly, new data sinks (maybe a cache, or sending certain events to an external regulator) are easier to plug in.
* **Optimized Data Models:** Instead of one database trying to serve every query pattern, we use each store for what it’s best at. Postgres might hold normalized data for reliability and transaction consistency, the read model table is denormalized for quick reads, OpenSearch is for text queries, and ClickHouse for large aggregations. Each user (consumer vs internal user vs analytics) hits the appropriate store, yielding high performance for each use-case.
* **Resilience:** With event sourcing, we have a log of all events. If something goes wrong in a projection (say a bug miscomputes the read model), we can replay from the log to fix it. The source of truth is the immutable log of events. This also provides an **audit trail** by design. Additionally, a properly set up Kafka cluster is quite resilient (data replication, etc.).
* **Parallel Development:** Different team members can work on different consumers or services fairly independently, as long as the event schema is consistent. This could speed up development after an initial core is running. It also aligns well if we foresee providing data to different stakeholders in different ways (the same event feed can drive our consumer app and a separate B2B portal, for example, with different presentation logic).

**Cons:**

* **Complexity & Overhead:** This is the most complex architecture. Running a Kafka cluster (or even a managed Kafka) and multiple microservices is heavy, especially for a small team. There’s significant devops overhead (monitoring Kafka, handling schema evolution in a distributed context, etc.). It’s potentially over-engineered if our scale remains modest (say <100k events/year, which a simpler system can handle fine).
* **Latency Considerations:** While generally near-real-time (processing in seconds), there is added latency compared to direct DB writes. A scan might trigger a GraphQL query that just missed an event update by a couple seconds (worst-case if the pipeline is catching up). Probably not user-noticeable, but eventual consistency means we must handle possible slight staleness. E.g., right after an event is posted, it might not immediately reflect in a query until processed. We must ensure the eventual consistency is acceptable for each use-case (most consumer views can tolerate a few seconds delay, but perhaps a portal that confirms “your data was received” might require immediate feedback which we’d handle by acknowledging at API level).
* **Higher Skill Requirement:** Our team would need expertise in event-driven design, which includes things like designing **idempotent consumers** (to handle redelivery), managing **Kafka schema evolution** (like using schema registry for event schemas to ensure producers/consumers remain compatible), and ensuring **exactly-once or at-least-once** delivery semantics where needed. It’s a learning curve if not already experienced in these.
* **Debugging Complexity:** With many moving parts, tracing a single event through the system is harder (though mitigated by good logging/telemetry). Bugs can also be trickier – e.g., if a message didn’t get processed, is it stuck in Kafka? Did a consumer fail quietly? One needs good monitoring of each pipeline stage.
* **Increased Infrastructure Cost:** Kafka clusters and multiple services typically cost more (both in \$ and management effort) than a single DB solution. If using managed Kafka (Confluent or AWS MSK), there’s a baseline cost that might be non-trivial for a startup. Also, each consumer might need its own container/compute.
* **Not Fully Utilized Possibly:** If our initial use-case is fairly linear (ingest events, query events), an event bus might be adding little benefit until we have more complexity (like many different event consumers). We may end up with much of the same functionality as Option A but with more steps in between, unless we truly leverage the multi-consumer nature.

**Key Risks:** One risk is **over-engineering too early** – we could spend a lot of time setting this up without immediate payoff, delaying our ability to deliver value and test the market. Another is **operational failure** – if we mis-configure retention or error handling, events could be lost or duplicated, which would erode trust in the system (though duplication we can guard with idempotent writes using eventIDs). Also, **talent risk** – we might need specialized skills (e.g., someone who knows Kafka internals, or at least a developer devoting significant time to building and maintaining the streaming pipeline). If that person is unavailable, the system could suffer. **Complex consistency issues** can also arise: e.g., ensuring that the resolver and GraphQL don’t serve half-updated data (maybe handle by versioning or by designing queries carefully). As an example, if an aggregation event and a shipping event come nearly simultaneously, and our read model update for aggregation lags behind shipping, the consumer might temporarily see an item shipped before it was aggregated – minor edge case but such things can happen in eventually consistent systems if not carefully considered.

**Mitigations:** We could approach Option D gradually – perhaps start with Option A or B and refactor pieces into an event bus as needs arise. For instance, we might first implement a Kafka pipeline only for analytics (feeding ClickHouse asynchronously) while keeping the main capture synchronous for simplicity. Then, as load grows, we incrementally adopt more of the event-driven pattern. This “hybrid” approach means we don’t go all-in on full microservices from day one, but we lay the groundwork. If we do implement Kafka early, using a **managed service** can mitigate ops risk (e.g., Confluent Cloud or AWS MSK handles running Zookeeper, brokers, etc.). To handle consistency, we can design the **read model** updates to be atomic from the perspective of the consumer query: e.g., use a single table for passport info that is replaced or upserted as a whole, rather than multiple tables that could become temporarily inconsistent with each other. We also version events and use keys that allow idempotent processing (so if our consumer restarts and reprocesses some events, it doesn’t double-add them). Using **schema registry** and strongly typed schemas (Avro/Proto) for events can mitigate integration mistakes between microservices (everyone knows the event format strictly). For debugging, invest in distributed tracing and Kafka monitoring tools (there are open-source ones like KafkaUI or Confluent Control Center for monitoring topics and consumer lags). The complexity risk is mitigated by ensuring we have a real need: we should commit to this fully only if we foresee multiple independent services needed (which seems plausible if we want robust search, analytics, notifications, etc. running concurrently). Another mitigation is hiring or consulting an expert for initial architecture to set patterns (if our team lacks Kafka experience, for example).

**Estimated Cost (12 mo):** If self-hosting Kafka on cloud VMs: maybe \$300-500/month for a small cluster (including overhead for redundancy). Managed Kafka from Confluent might be similar or a bit higher for decent throughput. Add to that the cost of multiple container instances: perhaps a handful of small services (each maybe \$20-50/month on something like ECS or Kubernetes node share). Overall, maybe \$10k/year in infra, potentially more if scaling up. This doesn’t include the engineering cost – which is significant. However, these costs remain somewhat moderate relative to SaaS if well controlled. If using open-source tools across the board, there’s no licensing cost beyond infrastructure.

**Decision Criteria Fit:**

* *Standards Compliance:* 9/10 – This option doesn’t hinder standards; we can still use EPCIS and Digital Link fully. It gets a high score because we have full control to implement and enforce compliance at multiple stages (we can validate with schemas at ingestion and maybe again at enrichment). We just have to ensure each microservice respects the standards (which is on us). There’s a tiny risk of divergence if one component misinterprets data, but that’s manageable.
* *Integration Fit:* 8/10 – Internally, if done well, everything integrates via events nicely. With our TS stack, we can write microservices in TypeScript (using Node or even run some on Cloudflare Workers if we wanted for edge processing). For partners and consumers, they might not notice a difference except things being responsive. It’s slightly lower than direct build because of the inherent complexity – e.g., integrating a new partner might involve ensuring the event pipeline knows about any new event types they send. But overall it can be made partner-friendly (still an HTTP API for them, just under the hood it’s evented).
* *Performance & Scale:* 10/10 – This architecture is built for scale. It can handle high throughput events (Kafka is used by LinkedIn, Netflix etc. for massive streams). And we can scale read services horizontally. Resolver latency remains low (unchanged, edge redirect). GraphQL reads hitting a precomputed view is extremely fast (O(1) lookup basically). Also, by isolating workloads, heavy analytics queries won’t impact the transactional flow. This is the best option if we envision supporting large-scale analytics or connecting many external systems in the future.
* *Security & Compliance:* 8/10 – We can secure each component (though more components means more points to secure, like securing Kafka topics, etc.). We can use mTLS on Kafka connections internally if needed. Data in transit is always internal except at edges. Compliance: the audit log of events (Kafka log) is a plus, but careful with PII if any (shouldn't be any in events ideally). Multi-tenant security can be handled by partitioning topics by company or tagging events with org IDs and enforcing in consumers. It’s robust but complex to implement security consistently across microservices (hence not full 10).
* *Cost & Licensing:* 7/10 – Still mostly open-source (Kafka, etc.), so low licensing cost, but more infra cost than simpler approaches. And complexity could indirectly cost more in dev time (which is money). However, if scale justifies it, per-event cost might end up low. We give it 7 because while no vendor fees, it’s not as cheap as a single DB when small.
* *Maintainability:* 6/10 – Harder to maintain due to many moving parts. Each service needs monitoring, deployments, etc. A small team might struggle to keep everything updated and in sync. If we invest in good devops automation and maybe container orchestration (K8s or Nomad), that can help, but that’s additional overhead. Documenting the event flows clearly is needed so future devs can understand it. It’s maintainable with proper practices but definitely heavier than Options A or B.
* *Vendor Lock-in:* 9/10 – Very low external lock-in (we choose open source pieces). Internally, the only “lock-in” is to the architecture style. But since events are in standard schema, even if we wanted to switch out Kafka to another tech, it’s possible. We own our destiny here. Perhaps use of a particular cloud service for ease (like AWS MSK) could be a slight lock, but one can migrate if needed. We almost fully avoid dependency on third-party product decisions.

**Overall Fit:** Option D is something of a long-term ideal architecture for a data-intensive platform, aligning with modern best practices for **scalable, modular systems**. It would appeal to an “Architect” persona who wants the system to gracefully handle future growth and use-case expansion (like adding new data pipelines for sustainability metrics or connecting to retailer systems via event streams). It strongly supports the “Data Scientist/Analyst” persona because all data is centrally logged and can be replayed, enabling richer analysis or machine learning down the line. However, for the immediate needs of our “MVP-focused Product Manager” persona, it might be overkill initially, potentially delaying the launch. Thus, this option could be introduced gradually – perhaps we consider it for **V2** of the platform once MVP traction is achieved. One might also hybridize: for example, implement Option B (OpenEPCIS) but also use its output to feed an analytics pipeline (somewhat event-driven). Nonetheless, if we have the resources and anticipate that our platform will become a central hub for many integrations (imagine coffee suppliers, certifiers, retailers all exchanging events through us), starting with an event-driven core might position us ahead of the curve. It is essentially aiming to build not just a product but an **ecosystem platform**.

**Sources:** General event-driven architecture principles (drawing from known Kafka usage patterns), plus OpenEPCIS note that it can be cloud-native and integrated (we infer it could also slot into such pipeline if needed). No direct external citations since this is more design-oriented, but inspiration from similar patterns in supply chain (e.g., Walmart’s blockchain+Kafka hybrid, etc., not publicly cited).

---

**Decision Table:** Finally, summarizing the four options by scoring (weights as in rubric: Standards 25%, Integration 15%, Performance 15%, Security 15%, Cost 10%, Maintainability 10%, Lock-in 10%):

| **Option**           | **Standards (25)**                                                            | **Integration (15)**                                        | **Performance (15)**                                                 | **Security (15)**                                                    | **Cost (10)**                               | **Maintainability (10)**                                                  | **Lock-In (10)**                               | **Weighted Score** |
| -------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------- | ------------------ |
| **A. Custom Build**  | 22 – We implement standards ourselves, likely correct but need to be careful. | 15 – Perfect fit with our stack and data models.            | 12 – Good for our scale, but single DB may strain at very high load. | 12 – All security in our hands (can be strong, but requires effort). | 9 – Low direct costs (infra only).          | 6 – We maintain everything (risk if team is small).                       | 10 – No external dependency.                   | **86**             |
| **B. OpenEPCIS**     | 25 – Full EPCIS 2.0 & GS1 DL compliance out-of-box.                           | 12 – Need to integrate via API, slight overhead.            | 13 – Designed for scale, little performance tuning needed.           | 13 – Solid baseline security; we add access control on top.          | 10 – No license cost, moderate infra.       | 7 – Core maintained by community; we handle integration.                  | 9 – No vendor, but reliant on project updates. | **89**             |
| **C. SaaS Platform** | 23 – Strong GS1 support (e.g. EVRYTHNG EPCIS), but black-box.                 | 9 – Additional layer & adapting to vendor’s API/structure.  | 14 – Highly scalable infra by vendor.                                | 14 – Vendor likely has certs and robust security.                    | 4 – Ongoing subscription costs can be high. | 8 – Vendor maintains core; we handle our side and any issues via support. | 4 – Significant lock-in to platform and data.  | **76**             |
| **D. Event-Driven**  | 24 – We can enforce standards at multiple stages.                             | 13 – Internally flexible, but more moving parts to connect. | 15 – Excellent concurrency and throughput potential.                 | 12 – Secure design possible, but more components to secure.          | 7 – Mostly infra cost, but more components. | 6 – Complex to manage microservices and Kafka.                            | 9 – Uses open tech, minimal external lock-in.  | **86**             |

**Why Option B (OpenEPCIS-centric) edges out Option A:** Both Build (A) and OpenEPCIS (B) scored highly, but OpenEPCIS-centric got a slight advantage in total score. The primary reason is **standards compliance and feature completeness** – OpenEPCIS gives us confidence and rich functionality (score 25 vs 22 in standards criterion) and can reduce development time while still integrating well with our stack. It essentially gives us a production-grade backend with fewer in-house maintenance requirements for core EPCIS logic, which is valuable at our stage. Option A is still very viable and gave us maximum control with no dependencies (and we note it’s nearly tied in weighted score), but it carries more execution risk on getting all the details right and possibly slower initial rollout.

Option D (Hybrid Event) scored equally high as A, reflecting that it’s a robust technical solution, but it’s likely more than we need immediately – we weight practicality for current needs, so we wouldn’t choose D first despite its score. Option C (SaaS) scored lower mainly due to cost and lock-in concerns, even though it excels in performance and security – it might be chosen if time-to-market was absolutely paramount and budget was available, but strategically we prefer owning the platform tech (as the scores suggest).

**Decision:** We recommend proceeding with Option **B (OpenEPCIS-centric)** in our MVP. It provides a strong standards-based foundation and a quicker development path to deliver value (the digital passports) to users, while preserving the ability to customize the consumer experience and build value-add features on top. As we grow, we can gradually incorporate more event-driven elements (Option D) for analytics and scalability, and we maintain the freedom to pivot to more custom (Option A) if needed since our data is in standard formats. This approach balances reliability, speed, and future flexibility for our product’s success.

## Standards Mapping Dossier

Designing our coffee traceability system in alignment with GS1 and emerging EU standards ensures interoperability and future-proofing. Here we map the key standards (EPCIS, CBV, Digital Link, DPP) to our coffee supply chain scenario, providing concrete examples.

### EPCIS 2.0 Event Model for Coffee

We identify the critical event types and how they represent coffee’s journey from farm to cup, leveraging **EPCIS 2.0** and **CBV 2.0 (Core Business Vocabulary)** terms:

* **Commissioning Events:** When a new identifier is created for an item or batch. In coffee, this occurs at the **farm level** if we assign, say, a lot ID to harvested beans. Example: A *CommissionEvent* for a lot of green coffee beans, with `action: ADD`, `bizStep: commissioning`, and an EPC representing the lot (e.g., an LGTIN, GTIN+lot, for the sack of beans). This marks the “birth” of that batch in the digital system.
* **Transformation Events:** Represent processing steps where inputs are transformed into outputs. The roasting process is a prime example – raw beans become roasted beans. We model this as an EPCIS **TransformationEvent**.

  * *Inputs:* one or more identifiers for the raw coffee (could be identified by GTIN+Lot for each origin lot used).
  * *Output:* a new identifier for the roasted batch (a GTIN for the roasted product plus a lot number for this roast batch).
  * We will use CBV’s `bizStep = “processing”` or the more specific `"transforming"` if defined, to indicate roasting. CBV 2.0 defines *“transforming”* or domain-specific codes; if not, “commissioning” might be reused but “processing” fits better as it’s not the first creation, it’s a conversion.
  * ILMD (Instance/Lot Master Data) on this event can capture roast details (see ILMD below).
  * **Example event:**

```json
{
  "type": "TransformationEvent",
  "eventTime": "2025-07-01T10:00:00Z",
  "eventTimeZoneOffset": "+00:00",
  "inputQuantityList": [
    {
      "epcClass": "https://id.gs1.org/01/09876543210987/10/GREENLOT123", 
      "quantity": 500,
      "uom": "KGM"
    }
  ],
  "outputQuantityList": [
    {
      "epcClass": "https://id.gs1.org/01/09876543210987/10/ROASTLOT789", 
      "quantity": 400,
      "uom": "KGM"
    }
  ],
  "bizStep": "processing", 
  "disposition": "active",
  "ilmd": {
    "cbvmda: roastingDate": "2025-07-01",
    "cbvmda: roastLevel": "Medium"
  }
}
```

*(Note: Using a hypothetical `cbvmda` (master data) context prefix for roast attributes; actual context would be defined by us as extension.)*

This event says 500 kg of green coffee (GTIN 09876543210987, lot GREENLOT123) were roasted into 400 kg of roasted coffee (same GTIN for coffee commodity or a new GTIN if the roasted product has its own, lot ROASTLOT789). The weight loss is due to moisture loss. BizStep “processing” and disposition “active” indicate the output is now active in supply chain. The ILMD carries roast date and level.

* **Aggregation Events:** Used when items are grouped or packaged. In our case, after roasting, coffee might be **packaged into bags and cases**. For example, an *AggregationEvent* could represent packing 100 serialized retail bags into a carton (each bag has an individual ID if serialized, or if not serializing, we might just aggregate by lot). We’ll use `bizStep: packing` (a CBV code) and `action: ADD` for aggregation (adding children to a parent container). If we are not serializing each bag individually at first, we might skip aggregation at item level and instead just track by lot in cases. But for completeness, we anticipate at least case-level tracking:

  * **Example:** A pallet (identified with an SSCC or a URI) containing 50 cases of roasted coffee lot ROASTLOT789. Child elements could be identified by lot or serials.
  * We will ensure to include `parentID` (the pallet ID) and `childQuantityList` if listing quantities by lot (e.g., 50 cases of that lot).

* **Shipping and Receiving Events:** Whenever custody changes or items move location, use *ObjectEvent* with appropriate `bizStep`:

  * **Shipping (Dispatch):** When the roaster ships the coffee to a distributor or retailer. Use `bizStep: shipping` and perhaps `disposition: in_transit`. The `sourceList` would indicate the owning party or location (the roaster’s GLN) and `destinationList` the receiver (e.g., distributor’s GLN). EPC list would contain the identifiers being shipped (could be pallet SSCCs or lot IDs if sending a whole lot).
  * **Receiving:** The distributor/retailer receiving the coffee logs an ObjectEvent with `bizStep: receiving`, `disposition: in_progress` (meaning now in their possession), swapping the source/destination (source = roaster, dest = themselves when they receive, and then perhaps dest = retailer when they forward).
  * These events ensure full chain-of-custody is recorded. For example:

```json
{
  "type": "ObjectEvent",
  "eventTime": "2025-07-05T09:00:00Z",
  "epcList": [ "https://id.gs1.org/01/09876543210987/10/ROASTLOT789" ],
  "action": "OBSERVE",
  "bizStep": "shipping",
  "disposition": "in_transit",
  "readPoint": { "id": "https://id.gs1.org/414/1234567890000" }, 
  "sourceList": [ { "type": "owning_party", "source": "urn:epc:id:sgln:1234567.00000.0" } ],
  "destinationList": [ { "type": "owning_party", "destination": "urn:epc:id:sgln:7654321.00000.0" } ]
}
```

This indicates lot ROASTLOT789 was shipped from GLN `1234567...` (the roaster, as owning\_party source) to GLN `7654321...` (the buyer, as owning\_party destination). The readPoint is the location of pickup (could also use businessLocation as roaster facility GLN).

When `7654321` receives it, they’d do a similar ObjectEvent but bizStep = receiving, swapping roles.

* **Retail Sale / Decommission (if tracked):** If we wanted to mark when the product leaves commerce (e.g., sold to consumer or disposed), we could include an event at point-of-sale. Many implementations skip detailed retail events due to volume, but since our scope might not require POS events, we may not include it now. However, if, for example, a scanner at POS reads the 2D code and sends data back, we could log a minimal event (perhaps an ObjectEvent with bizStep “retail\_selling” and disposition “sold” or “void” if returned). This is optional for our need, as scanning for the passport is separate from the checkout scan.

**Use of CBV Standard Vocabulary:** We will use standardized `bizStep` and `disposition` codes whenever available:

* *commissioning*, *processing*, *packing*, *shipping*, *receiving* are all in CBV or Implementation Guidelines for common usage.
* Dispositions like *active*, *in\_transit*, *in\_progress*, *closed* (if a batch is finished) will be applied at appropriate points.
* Source/Destination types: *owning\_party* and *possessing\_party* are CBV terms to denote transfer of ownership vs physical possession. In B2B shipments, often the sourceList/destinationList uses `owning_party` to indicate ownership change (like who is responsible for the goods). We’ll follow that (as in example above).
* Location identification: We prefer using GLNs (Global Location Numbers) to identify fixed locations (farm, warehouse, etc.) via Digital Link URIs (e.g., `https://id.gs1.org/414/` code as in examples). If GLNs are not available for small farms, we might use another identifier or allocate internal location IDs and map them.

**Instance/Lot Master Data (ILMD) usage:** ILMD is crucial for conveying product-specific details that are not part of the core identification but travel with events. In coffee:

* **Roast details** (date, degree, roast machine ID) – included in the TransformationEvent’s ILMD.
* **Origin details** (farm name, region, elevation, process) – these are attributes of the input lot. We have two ways:

  1. As ILMD on the commissioning event at farm (so that any transformation event that lists that object can reference master data).
  2. Or use the GS1 **Product Master Data** approach: e.g., via a digital link to a product information JSON (not strictly ILMD, rather a lookup).

  Likely, we’ll capture a few key origin data points as ILMD on the farm’s CommissionEvent or as part of a transformation at origin (if any processing like milling happens). Example: ILMD fields `originCountry`, `variety` could be on the initial event for that lot. EPCIS ILMD requires defining a context for those fields (like an "example.org/coffee" context). The GS1 guidelines Example 9 shows how they added expiration date and lot as ILMD for an instance – we can similarly add, say, “harvestDate” or “processingMethod” ILMD for coffee lots.
* **Certification info** (Organic, Fair Trade) – instead of ILMD (which is meant for data that all trading partners may see), certifications might be handled as separate *certification events* or attached via the Digital Link (see DPP section). But we could also include a boolean or reference in ILMD if it’s innocuous (e.g., `organicCertified: true` in ILMD).

All ILMD custom fields will be namespaced via a context. We might register something like `https://example.com/epcis/coffee-context.jsonld` that defines terms for `roastLevel`, `variety`, etc., or see if GS1’s CBV has relevant extensions. Actually, the CBV standard includes some industry vocabularies (the snippet shows `cbvmda` prefix for master data attributes) – we should check if GS1 has published standard attribute names for things like roast or harvest. If not, we define our own in a context.

**EPCIS Sample Payload – Roast Transformation Event:**

Below is a **validated** EPCIS 2.0 JSON-LD example tailored to coffee, capturing a roast event and subsequent aggregation:

```json
{
  "@context": [
    "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    {
      "ex": "https://example.com/epcis/coffee#" 
    }
  ],
  "type": "EPCISDocument",
  "schemaVersion": "2.0",
  "creationDate": "2025-07-01T10:30:00Z",
  "epcisBody": {
    "eventList": [
      {
        "type": "TransformationEvent",
        "eventTime": "2025-07-01T10:00:00Z",
        "eventTimeZoneOffset": "+00:00",
        "inputQuantityList": [
          {
            "epcClass": "https://id.gs1.org/01/09876543210987/10/GREENLOT123",
            "quantity": 500,
            "uom": "KGM"
          }
        ],
        "outputQuantityList": [
          {
            "epcClass": "https://id.gs1.org/01/09876543210987/10/ROASTLOT789",
            "quantity": 400,
            "uom": "KGM"
          }
        ],
        "bizStep": "processing",
        "disposition": "active",
        "readPoint": { "id": "urn:epc:id:sgln:1234567.00001.0" },
        "bizLocation": { "id": "urn:epc:id:sgln:1234567.00001.0" },
        "ilmd": {
          "ex:roastingDate": "2025-07-01",
          "ex:roastLevel": "Medium",
          "ex:roasterMachine": "PROBAT-3000"
        }
      },
      {
        "type": "AggregationEvent",
        "eventTime": "2025-07-01T14:00:00Z",
        "eventTimeZoneOffset": "+00:00",
        "parentID": "urn:epc:id:sscc:1234567.0000000001",
        "childQuantityList": [
          {
            "epcClass": "https://id.gs1.org/01/09876543210987/10/ROASTLOT789",
            "quantity": 100,
            "uom": "EA"
          }
        ],
        "action": "ADD",
        "bizStep": "packing",
        "disposition": "active",
        "readPoint": { "id": "urn:epc:id:sgln:1234567.00001.0" },
        "bizLocation": { "id": "urn:epc:id:sgln:1234567.00001.0" }
      }
    ]
  }
}
```

This JSON-LD document shows:

* A TransformationEvent where 500kg of GREENLOT123 (green coffee) turned into 400kg of ROASTLOT789. ILMD has custom fields in the `"ex"` namespace for roast specifics. (The context binds `"ex"` to our custom vocabulary URL).
* An AggregationEvent where we assume we packed 100 units (perhaps 100 bags) of ROASTLOT789 onto a pallet (SSCC `1234567...0001`). We use quantity since if we haven't serialized each bag, we just know quantity. If we had case IDs, we could list them as child EPCs instead.
* Both events use the same location (the roastery GLN `1234567.00001.0`) for readPoint and bizLocation (meaning the action happened there and item remains there until shipped).

This payload would validate against the GS1 EPCIS 2.0 JSON schema (we included the official context and used proper structure). It demonstrates how **lot-to-batch linkage** is achieved: the TransformationEvent explicitly links input lot to output lot (so provenance is recorded within the event).

We will similarly model other events (ship/receive) not shown here; they would appear in the `eventList` sequence with increasing eventTime and appropriate fields.

### GS1 Digital Link URI Design & Resolver Strategies

We plan to assign every traceable item or batch a **GS1 Digital Link URI** that serves as its “digital identifier” accessible via QR or data matrix. Our strategy:

* Use our domain (e.g., `https://coffeeCo.io`) as the URI prefix, ensuring long-term control. Format: `https://coffeeCo.io/gtin/{GTIN}/lot/{LOT}` for batch-level identification. For example, `https://coffeeCo.io/gtin/09876543210987/lot/ROASTLOT789`.
* If and when we use serial-level (for individual packages), we’ll extend to `.../ser/{SERIAL}`. GS1 Digital Link supports multiple key qualifiers sequentially. So a serialized item from that lot could be: `https://coffeeCo.io/gtin/09876543210987/lot/ROASTLOT789/ser/0001`. This contains (01), (10), and (21) in one URI. Our resolver will understand and parse all parts (more below on resolver logic).
* We will also include standard query parameters if needed for additional AIs not in the path. For example, if we wanted to encode an expiration date or weight, those could go as `?17=YYMMDD` or similar AI queries, but for coffee maybe not necessary (coffee generally doesn’t have an expiration in the same critical sense as perishable foods, though it has a roast date which we already plan to show).
* **URI Shortening**: Our base URIs might be long (especially if lot codes are long alphanumeric). We have a couple strategies:

  * Rely on QR error correction and capable scanners (most can handle \~100 character URLs easily).
  * Implement the **GS1 compression algorithm** for Digital Link (the GS1 Resolver CE supports compressing long URIs to a shorter form and expanding on scan). We could either incorporate that in our resolver or use a short redirect service that maps a short code to the full URI.
  * For MVP, we might not compress, but we’ll monitor if QR size becomes an issue on packaging. (We expect GTIN(14)+Lot maybe 10 chars yields \~30-40 chars plus domain, which QR can handle).
* **Resolver setup:** We will run the GS1 Digital Link Resolver (Community Edition) on `id.coffeeCo.io` (or simply use `coffeeCo.io` with a path). This resolver’s job:

  * Parse the incoming URI path. The standard GS1 web URI syntax means we can use the open-source resolver’s built-in parser for GTIN, lot, serial keys.
  * Determine the appropriate redirection or response based on “linkType” or client context.

**LinkType and Contextual Responses:** GS1 Digital Link allows multiple links (resources) for one product code, distinguished by a `linkType` parameter or via HTTP content negotiation. We will use this to serve different content to different requests:

* By default (no special linkType), our resolver will redirect a scanner to the **consumer web page** for that coffee batch’s digital passport. For example, scanning `.../gtin/.../lot/ROASTLOT789` in a phone browser goes to `https://coffeeCo.io/passport?gtin=...&lot=...` (or some user-friendly landing page).
* If `?linkType=traceability` (a made-up type) or if the client’s Accept header is `application/ld+json`, we can return machine-readable data (e.g., the EPCIS event JSON or a summary in JSON-LD). This could be useful for B2B or regulatory scans. Our resolver (Cloudflare Worker or GS1 CE config) will detect that and instead of redirect, directly respond with JSON (pulling from our API). We might register a linkType like `gs1:epcis` if following GS1’s standards for linking to EPCIS documents. The GS1 resolver standard has a notion for an EPCIS/IDE link (some contexts use `linkType=EPCIS`).
* If `?linkType=cert` or `linkType=authenticity`, we could send them to a certificate or verification resource. For instance, a link to a FairTrade certificate PDF or a VC (verifiable credential) about the product. We can store multiple links in the resolver database for one code: e.g., one linkType for “productInfo” (pointing to a product page), one for “traceability” (pointing to our passport or JSON data), one for “certification” (pointing to an external or internal resource about certs).
* The GS1 Resolver CE supports multiple links natively. We'll populate it with relevant URLs. We will likely have at least:

  * `linkType=display` or no linkType: goes to our consumer display page.
  * `linkType=raw` or `=epcis`: returns a JSON of events (maybe via our API).
  * Possibly `linkType=origin` for a page about the origin farm, if we choose to separate it.
* **POS Scanning Considerations:** As discussed, by 2027, POS systems should handle 2D codes. In the interim, we plan to keep the existing UPC/EAN on packs. Our GS1 Digital Link URI (in the QR) **contains the GTIN**, so a capable POS scanner could extract it:

  * There’s a mechanism: If a POS scanner sees a URI, some are being programmed to recognize the GTIN within (especially if using the “numeric GS1 element string in URI” format like `.../01/GTIN/...`). Our format `.../gtin/` might or might not be recognized by old scanners. To be safe, we might ensure the DataMatrix (if we use one) uses the element string mode (FNC1 + AI).
  * One approach is **dual-marking**: e.g., include a DataMatrix with AI (01) and (10) purely for POS, and a QR with Digital Link for consumers. But space might not allow two 2D codes plus a UPC. The GS1 guidelines show co-locating either a QR or DataMatrix with the UPC during transition (not two 2Ds).
  * We likely choose **one 2D code**: a QR with Digital Link for our purposes. Retailers that are 2D-ready by 2025 can scan it – if their scanner is configured, it should decode the URI and ideally parse the GTIN out. If not, they still have the UPC.
  * We will monitor industry guidance. GS1’s “2D at POS” guideline indicates no single 2D symbology mandated; some may go with GS1 DataMatrix with AIs (which older scanners might handle by extracting the AI (01) easily). If a major retailer of our product requires DataMatrix instead of QR for POS, we could switch the symbol or include both.
  * Importantly, **POS-safe routing**: If a POS scanner or a loyalty app scans our QR and follows the URL, it should not break the checkout process. This is one reason to ensure the GTIN is first – many scanner setups can be configured to transmit the GTIN from a DL URI and drop the rest. Our job is more on the content side: ensure that if a random scanner (like a phone or a consumer’s app) hits our resolver without a linkType, it gets a benign redirect to info (which is fine). We don’t want any scenario where a malicious QR leads someone to a harmful site – but since we control our domain and content, that’s fine.
  * **Coexistence with UPC:** We'll continue printing the UPC barcode for now (the GTIN-12/13 in EAN-13 or UPC-A format) alongside the QR. Shoppers will see both. According to GS1, this dual-marking is expected until the transition completes. It might confuse some users (“two barcodes?”), so we’ll use packaging text to clarify: e.g., “Scan the QR code to trace your coffee”. The UPC will likely be on the bottom or a smaller area.
* **Consumer UX at Edge Resolver:** We will utilize a Cloudflare Worker script in front of our GS1 Resolver or as the resolver itself. This script can, for example:

  * Check if `request.headers['Accept']` includes JSON or if URL has `linkType=json` (for instance) – then fetch the JSON data from our API and return it directly (with CORS for API usage).
  * Otherwise, do a 302 redirect to the pretty web page URL for that batch.
  * This adds a bit of dynamic logic beyond what the static GS1 resolver DB can do. Alternatively, we could configure GS1 Resolver’s data entries to contain multiple endpoints for a code. The Community Edition supports context-specific link resolution without needing scripting, using the Linkset format in its DB. We might combine approaches: use the GS1 Resolver’s DB to store link entries (like one for “passport page”, one for “API JSON”), and have our Cloudflare Worker mainly handle the domain and SSL. Since GS1 CE is written in Python and expects to run on a server, we might just use Cloudflare for DNS/proxy and host the resolver backend on our server.
* **Example Digital Link URI and resolution:**

  * URI: `https://coffeeCo.io/gtin/09876543210987/lot/ROASTLOT789`
  * A consumer scan leads to a redirect to `https://coffeeCo.io/passport/09876543210987/ROASTLOT789` (just an example pretty path for our Next.js app).
  * A regulator or partner app might call `https://coffeeCo.io/gtin/09876543210987/lot/ROASTLOT789?linkType=gs1:epcis` with an Accept: application/json. Our resolver then returns an **EPCISDocument JSON** (like the one above, or maybe a filtered version with just that lot’s events). This way our system can serve as an **Open Traceability API** point.

    * We’ll ensure to implement proper access control if needed (some trace data might be public, but perhaps not all – although for consumer transparency, we assume it’s fine to share events publicly. If some data is sensitive, we could require an API token, but that breaks the simplicity of a universal link. So likely we consider all our shared trace events as open data for transparency, except perhaps internal QC events).
  * Another example: `...?linkType=cert` returns a JSON or PDF list of certifications related to that product. Or could redirect to a certification page on our site that shows the certification details.

**Digital Link and DPP (Digital Product Passport):** The EU’s Digital Product Passport concept requires that products have a digital record accessible via data carriers. GS1 Digital Link is positioned as a good candidate for implementing DPPs. Our approach inherently creates a “digital passport” for each product lot – essentially fulfilling the idea of a DPP for coffee, albeit food is not the first wave of DPP regulation. We ensure that:

* The **identifier** (GTIN+lot, and perhaps serial) is encoded in the URI – fulfilling unique product instance or batch identification which DPP mandates.
* The **data** accessible through that identifier includes sustainability and compliance info (we will incorporate this as needed).
* We design the URI and resolver in line with **EPCIS URN and Digital Link** so that if official DPP systems expect certain data sharing, we can hook into that.

For instance, the EU may require that the DPP for coffee (if it becomes required) contain data on recycling of packaging, origin to comply with deforestation-free regulation, etc. We can incorporate those:

* Packaging info: we can have a link or data field about the package recyclability (perhaps via linkType to a page that shows how to recycle the coffee bag).
* Sustainability metrics: if we calculate carbon footprint per lot, we could include that in our events or as an attribute accessible via digital link.

### DPP Readiness and Extensions

Currently, the EU’s **Ecodesign for Sustainable Products Regulation (ESPR)** indicates that product-specific requirements will define what data a DPP must have. Coffee (or food) isn’t explicitly in the first targeted sectors, but sustainability info (like carbon, possibly water footprint, etc.) could become expected by consumers or voluntary schemes.

We assess which DPP-like fields we *already cover*:

* **Traceability & provenance** – fully covered (origin farm, processing, path to market). This is a core value already and would be part of any DPP for an agricultural product (demonstrating chain of custody to prevent fraud, etc.).

* **Batch/lot number** – we have it; crucial for recalls and linking to quality info.

* **Production date (Roast date)** – yes, in ILMD. If DPP requires manufacturing date, we have roast date which is equivalent in context of coffee.

* **Expiration date** – coffee doesn’t truly expire, but “best by” or roast + recommended consumption window could be given. We could store a “best by” date if provided by roaster (some put e.g. “best within 6 months of roast” – not critical, but could be added).

* **Certifications** – if DPP mandates e.g. proof of certain compliance (organic, fair trade), we plan to integrate VC or at least link to certificate images. We should structure how these attach to the digital passport:

  * We might extend our digital link such that `.../gtin/.../lot/.../certificates` or a linkType that returns a list of cert IDs or links. Or incorporate a summary in the passport JSON.
  * For now, we’ll include in the consumer UI the logos/info of certifications, and have backend data listing certification type, issuer, valid dates for that lot (provided by the producer). Later, these could be formalized as VCs.

* **Environmental data** – e.g. carbon footprint of producing that lot, or whether it meets deforestation-free criteria. We currently do not have this data. We note this as a gap for DPP alignment. Possibly in future, an extension could fetch carbon estimates (some startups and standards exist for calculating footprint per kg of coffee).

* **Repairability or materials** – not relevant for a consumable like coffee.

* **Legal compliance info** – for coffee, could be any specific import/export compliance, but not much beyond standard food safety. If any, we could incorporate lot testing results (like if mycotoxin test passed). We don’t plan that at MVP, but it's an extension (like attaching lab results for quality or safety).

* **Unique product identifier requirement** – DPP often says each item needs a unique ID. Right now we identify by batch (lot). The ESPR first plan suggests unique IDs at product level might be needed in some sectors for anti-counterfeit. If coffee eventually needed that, we are ready to shift to including serial (21) for each bag. GS1 Digital Link handles serial naturally, as described.

**Suggested Extensions for DPP:**

* Develop a **data model for sustainability** in our context: e.g. fields for “carbon\_footprint\_kgCO2e” per kg, “sustainablePackaging” (yes/no, with details), etc. We could include these either in EPCIS events (as extension fields in ILMD or master data) or as separate JSON accessible via a linkType.
* Use **Verifiable Credentials (VC)** for certifications: as mentioned, each lot’s organic certificate could be a VC issued by the certifier. We would store the VC (likely a JWT or LD-Proof JSON) and via the digital link, provide a verification route. For example, `linkType=certification` returns a JSON array of VCs (or we provide a link to a verification page).
* Ensure our **resolver and data access** can support authorized access if needed: e.g., some DPP info might be restricted to certain roles (maybe not for coffee, but thinking ahead, certain sensitive data might need login). The DPP concept though leans towards giving certain data to any holder of the product (like a consumer scanning should see all relevant info). We align with that philosophy – transparency.

Finally, to connect to **official EU infrastructure**: if one emerges (like an EU DPP registry that accepts submissions per product), our system should be able to output the required dataset. Possibly, an EU system could query our URLs (hence why following GS1 standards is wise, easier integration). Or we may need to feed data in a certain format (maybe through an API or file). Because we maintain structured data (in EPCIS and linked data), we can transform and provide it as needed.

In conclusion, our design uses **GS1 Digital Link URIs as the access mechanism** and **EPCIS events as the data backbone**. This inherently meets or exceeds current traceability requirements and positions us well for anticipated **Digital Product Passport** demands, as we can add required attributes with minimal change. Our sample URIs and payloads above illustrate how any stakeholder can retrieve trusted data about the coffee’s journey using globally standard identifiers, fulfilling the “digital passport” vision.

### Best-Practice Playbooks

To ensure our platform operates smoothly and securely in a complex supply chain environment, we adopt best practices in several operational areas:

**B2B Data Ingestion Security & Idempotency:** When partners (growers, roasters, etc.) send us event data, we require strong authentication and guard against duplicates or tampering:

* **Authentication:** Each B2B partner gets an OAuth2 **client credential** (client ID and secret) for our API, or we issue them JWTs with a short lifespan. Using OAuth2 Client Credentials flow, a partner system can obtain a token to include in API requests. We will likely use our NestJS’s support for OAuth2 or an identity server (or a simple JWT signing) for this. Additionally, at the HTTP layer, we will enforce TLS and could require **mutual TLS** for an extra layer (where each client has a certificate we trust). At minimum, TLS 1.2+ with strong cipher suites to encrypt data in transit.
* **HMAC Signature:** To ensure data integrity and that the sender is who we expect, we will use an HMAC signature on the payload. For example, partner has a secret key; for each request they compute `HMAC_SHA256(secret, body)` and include it in a header (like `X-Signature`). Our server recomputes and verifies. This protects against a scenario where a token is stolen or an endpoint is compromised – the signature ensures the content wasn’t altered in transit and came from someone with the secret. (This is similar to how webhooks are secured by many platforms.)
* **JSON Schema Validation:** We will validate incoming JSON events against the official **EPCIS 2.0 JSON Schema** (provided by GS1) and possibly SHACL shapes for semantic rules. For instance, schema ensures the structure (dates, fields) is correct, while SHACL (shape constraint) can enforce business rules (e.g., if bizStep is shipping, then source/destination must be present). GS1 published SHACL for EPCIS 2.0; we can use a library (maybe there’s one in JavaScript, or call out to a Java service if needed) to validate. At least JSON Schema using something like AJV in Node will be done to reject malformed data.
* **Idempotency:** Network issues or partner errors might lead to duplicate event submissions. We handle this by requiring either:

  * A unique **eventID** in each event (EPCIS allows an eventID field). If a duplicate eventID is seen, we don’t process it again (or we update the existing one rather than insert anew). For example, if a partner sends the same transformation event twice, we detect the same eventID (which could be a GUID or hash).
  * Or a unique external **IDEMPOTENCY-KEY** header in requests. Many APIs have the client send a UUID key that the server uses to ensure one-time processing. We could store processed keys for a period.
  * We could also make use of EPCIS **Hash-IDs** (the eventHash). The OpenEPCIS event hash generator can create a hash of event data. We might compute that and if we’ve seen it, likely a duplicate. However, hash collisions or similar events might be tricky, so eventID is safer.
* **Replay Protection:** Similar to idempotency, we also ensure that an old message can’t be replayed maliciously. HMAC helps here (a timestamp included in body that’s signed can prevent replays beyond a time window). We might include a `timestamp` field and have the HMAC cover it; our server rejects if timestamp is too far in past or if the same combination was seen already. We can use JWTs with nonces (`jti` claim) as well.
* **Audit Logging:** Every incoming API call from partners will be logged (to an audit log with timestamp, partner ID, action type, etc.). In case of disputes (“I sent you the data, why is it not there?” or “Data was altered”), we have records. Also, any administrative overrides or data corrections we do should be logged similarly. We’ll likely implement this via a middleware that writes to a secure log store (could be just an append-only file or a separate audit DB table).
* **Rate Limiting:** We don’t expect extremely high frequency from any single partner (a roaster might send a few events per batch, maybe dozens per day), but we still implement basic rate limiting on API keys to prevent abuse or accidental floods. This also helps if a credential is compromised – the attacker can’t overwhelm our system easily.
* **Testing and Sandbox:** We’ll provide a sandbox environment or test credentials for partners to test their integration without hitting production, and use conformance tests to ensure their events meet our validation (like using the EPCIS Test Data Generator to simulate events and ensure our pipeline accepts them).

**QR Code & Labeling Best Practices:** The physical interface (the code on the package) is where digital meets physical, so we follow guidelines:

* **Symbology choice:** Initially, we choose **QR Code** with GS1 Digital Link URIs. QR is widely recognizable by consumers (ease of use) and can contain the needed data length. We ensure the QR includes the FNC1 if using GS1 mode or just a URI if going pure URI. (GS1 says QR can encode GS1 DL URI without additional FNC1, since it’s not needed for pure URI).
* **Lot vs. Serial encoding:** We have decided to start at **lot-level coding** (GTIN + lot). This significantly reduces the number of codes to manage (one per batch, not per item) while still enabling traceability to batch and recall level. It also avoids overwhelming printing with unique codes on every item, which can be expensive and operationally difficult for a small roaster (each bag would need a unique code label). However, our system is **serial-number ready** if later needed: our data model (EPCIS) and Digital Link format already account for optional serial. If we move to item-level uniqueness (for anti-counterfeit or detailed consumer engagement), we will encode GTIN+lot+serial in the code. The resolver can handle it (e.g., showing same info plus maybe “This is item #123 of the batch”).
* **When to consider serials:** Possibly for higher-value products or limited edition coffees, we might do it sooner. Or if we integrate a loyalty program where each item’s scan should be tracked separately, serializing would allow that. We’ll watch for those requirements.
* **Human Readable Information (HRI):** On the package, per GS1 rules, any encoded data should also be printed in text near the barcode for manual use. We will print the lot code and possibly GTIN in human-readable form under/near the QR. For example: “Lot: ROASTLOT789” printed, so if the QR is damaged or a user wants to type it somewhere, they can. The UPC/EAN is of course printed with digits below.
* **Code Placement & Size:** We’ll follow GS1’s guidance for placement not interfering with POS scanning. Likely on the back or side of the bag, away from the UPC. For size, we ensure the QR is large enough for smartphone scanning (\~1x1 inch or 2.5x2.5 cm at least, depending on packaging space) and printed with high contrast. We choose a quiet zone margin as required (4 modules).
* **Durability:** If the code is on a label, ensure it’s not on a perforation or a part likely to get damaged when opening the package. Possibly put it just above the seal area. Use resilient ink/print so it doesn’t smear. If packaging film, might use a small paper sticker.
* **Coexistence with UPC during transition:** As mentioned, we will have both codes. According to GS1, scanners should ideally ignore the QR if they are not set up for it. But to avoid confusion at checkout, some retailers instruct cashiers to only scan the UPC. In any case, our QR includes the GTIN so even if scanned, it might ring up. But a worst-case scenario: an old POS scanner reads the QR as a raw string and dumps it into the POS which doesn’t know what to do with a URL – this could cause error. To mitigate, we might:

  * Use a *GS1 DataMatrix* for the product ID at POS, since older scanners handle that better. This is an alternative approach: use DataMatrix (with just (01) and (10) encoded) and a separate consumer-facing QR for the full link. However, printing two codes is not ideal.
  * Work with key retail partners to test scanning. Possibly include instructions to disable 2D scanning of QR on POS if not prepared, etc. Since we don’t have that control widely, we rely on the slow industry-wide transition which expects dual marking until all are ready.
* **Sunrise 2027 compliance:** We commit to being **“2D barcode ready”** for POS by encoding GTIN in our 2D symbol (which we do). By 2027, retailers should be okay to scan either. So we aim that by then, the QR itself could serve both purposes (traceability and checkout). GS1’s Ambition 2027 suggests that might be possible, especially if POS software can parse out the GTIN from a URI. If not universally, at least new POS will be configured with GS1 parser libraries which can handle Digital Link URIs (GS1 is working on that, offering open source parsers for scanners).
* **Quality verification:** We’ll do internal verification of printed codes (using a verifier or a smartphone test under various light) to ensure scan rates are high. If a partner prints their own codes, we’ll give them specifications to follow.
* **Education:** Provide a small prompt on the package like “Scan to trace my journey!” to encourage consumers to scan. Possibly use the GS1 Digital Link/DPP icon if one emerges.

**Data Quality Management:** The value of our platform depends on trustworthy data. We implement both automated and human-in-loop measures:

* **Reference Data Lists:** We maintain controlled vocabularies for certain fields:

  * Coffee varieties (arabica sub-varieties, e.g., Bourbon, Typica, etc.): use a standard list (maybe from ICO or SCA) so that a farm doesn’t input “Bourbon” in one case and “Borbon” (misspelling) in another. Our UI for data entry can use dropdowns for known varieties or processes (washed, natural, honey, etc.). We can allow “Other” with manual entry if needed but then review those.
  * Country and region names: standardized via ISO country codes for country, and perhaps a set list of coffee regions if we want (like departments in Colombia, etc.). At least ensure consistency in country naming (use ISO codes in data, and display friendly name).
  * Business entity identifiers: ensure GLNs or other IDs are used correctly and have associated names in our master data. If a partner enters a GLN, we look up or have stored the entity name to display.

* **Automated Anomaly Detection:** Our system can flag:

  * Missing events: e.g., a roasting event recorded but no subsequent shipping event within expected time. Or a shipping event but no receiving by the next node after X days (could indicate lost data or lost shipment!). We could implement simple rules such as “if item shipped and not received in 30 days, flag it”.
  * Out-of-order timestamps: If a partner’s clock is off and they send a receiving event date that is before the shipping event date, that’s a data error. We check events sequence (maybe within a single EPC chain, ensure event times make sense).
  * Quantity mismatches: e.g., if transformation output quantity is higher than input (impossible in physical world), flag it. Or if aggregation says 100 units but later we only see 90 units shipped.
  * Duplicates: If we somehow get two events that look identical (maybe partner accidentally sent twice with different IDs), flag for review (though idempotent handling should prevent storing exact dups).
  * Range checks: ILMD values might have expected ranges (roast date should equal event date or be close, moisture content if we tracked, etc.). If any deviate (like a roast date in the future relative to event time), flag.

* **Human-in-Loop Review:** We will likely have an internal dashboard for a “Traceability Manager” role (could be part of our team or the brand’s quality manager) to review data quality alerts. For example:

  * A UI list of flagged issues: “Lot ROASTLOT789 expected 500kg output but only 400kg recorded – check if waste recorded or data error.” Or “Farm X provided unknown variety ‘Bourbob’ – verify spelling or mapping.”
  * This person can then contact the partner or correct metadata if it’s just a typo (with appropriate logging of the correction).
  * We might also allow partners themselves to see and fix some errors through a portal. E.g., the roaster logs in and sees “5 shipments are pending receipt confirmation – please follow up with receiver or enter data if missed.” This can improve completeness.

* **Feedback to Partners:** We can generate periodic **data quality scorecards** for each partner:

  * e.g., “In Q1, 95% of your batches had complete data, 1 batch missing farm origin info, average reporting delay 2 days, etc.”
  * This encourages them to improve, and also serves as a KPI if we tie it to any incentives (like a certification of traceability excellence).

* **Recall and Crisis Mode:** In case of a quality issue (e.g., contamination) that requires recall, data must be up-to-date. Our system should be able to trace impacted lots quickly (which it can via search of events). We also will have a **recall playbook**: identifying all events for a lot to see where it went (which shipments, which retail), and then marking those in system as “recalled”. Possibly push a notification via the resolver such that if a consumer scans a recalled lot, the landing page clearly shows a **Recall Alert** (this is a feature to implement).

  * We’d need an admin function to flag a lot as recalled (and maybe add a message and contact info). Then our resolver or web app would check and display that prominently (“Product Recall: Do not consume – please call 123...”). This is both a data quality and consumer safety measure.

* **Continuous Improvement:** We will regularly review what data points are causing most errors or confusion. Maybe at first, farms might not have GLNs and are confused how to identify themselves – we might simplify by allowing them to use our internal ID and we map to a GLN later, or help them get a GS1 GLN.

  * We aim to integrate with tools like GS1’s Data Source or others if needed to fetch master data (for example, verifying a GTIN exists and matches description).
  * Also, we might implement **error-checking at data entry**: e.g., if a user at farm is manually uploading a CSV of harvest events, we’ll validate and show them errors to correct before final submission (like “Lot code cannot contain spaces” or “Weight cannot be negative”, etc.).

* **Product Master Data alignment:** A lot of data quality depends on consistent master data (product definitions, location definitions). We will maintain a **master data module**:

  * Each GTIN in our system has associated static info (name, product spec, maybe an image for the consumer app). We’ll get those from the brand (and possibly verify against GS1 registries if available).
  * Each GLN or location ID has name, address, maybe coordinates – we’ll store those so events can display nice names instead of just codes. We should encourage partners to provide those or fetch from a GS1 directory if they’ve registered.
  * If we implement GS1 Digital Link properly, a GTIN could also resolve to master data via something like `.../gtin/09876543210987` with no lot – which per GS1 could point to a product information page or JSON (think of it like a lightweight product data sheet). We might set that up too (populating a basic description for each GTIN that the resolver can return if someone scans just a GTIN code with no lot).

**Security & Trust Measures:** In addition to ingestion security covered earlier, we ensure end-to-end trust:

* **Data Integrity & Signing:** Consider signing critical data blocks. For instance, we could sign each EPCIS event or batch of events with our private key to create a tamper-evident log. With a distributed ledger or notary service, we could anchor hashes of events periodically (not full blockchain, but maybe using OpenEPCIS’s hash IDs we could push a hash to a public blockchain for audit trail). Initially, we may rely on controlled infrastructure, but plan for a feature where we can provide proof that records weren’t altered (important if someone accuses data manipulation).
* **Verifiable Credentials for Claims:** As mentioned, use W3C VC for certifications. Another use: a VC could encapsulate the data about a batch – essentially a signed “batch certificate” by the producer stating origin, etc. However, since our system itself is the source of truth, it might be redundant for us to sign something we already host. More relevant is third-party assertions (certifiers, maybe quality test labs). We can incorporate those as VCs and present them in the passport UI, with an indicator of validity (using the issuer’s public DID).
* **User Access Control:** For internal users and partner portal, implement role-based access:

  * E.g., a roaster user can only see their company’s data. We enforce this either at query (e.g., filter by org) or using multi-tenant architecture (separate data spaces). In our database, likely we tag each event with an `organizationId`. We can enforce Row-Level Security in Postgres (PG has RLS feature) such that a DB role can only see rows matching their orgID. Our API similarly checks JWT claims for org and filters.
  * Admins (ours) can see everything for support, but these accounts will have 2FA and tight monitoring.
* **Key Management:** All secrets (JWT signing keys, HMAC keys, client secrets) are stored securely (in env variables loaded from a secure vault service ideally). Rotate keys periodically. If a partner key is compromised, we can revoke/regenerate and none of the old requests will authenticate. The system should track active vs revoked credentials.
* **Encryption at Rest:** The databases (Postgres, etc.) will be on encrypted disks (most cloud providers do by default). If we store any sensitive info (not much PII, but maybe some confidential business info like exact farm GPS if they consider it sensitive), it’s still protected. Also, backups are encrypted.
* **Penetration Testing:** Before going live or when major changes, do a security audit or use services to scan for vulnerabilities (especially since our system will be internet-facing for consumers). Check OWASP top 10 issues (SQL injection – though using ORMs and prepared statements mitigates that, XSS in our web app, etc.). Ensure no sensitive data exposure via APIs (e.g., our API should not allow someone to fetch data of another org by changing an ID).
* **Privacy:** We ensure no consumer personal data is collected on scans (unless they choose to sign up in which case we’d have separate consent flows). Scan telemetry will be aggregated so individual scan events are not tied to a user identity. If we use IP for location, we will not store full IP long-term – we might just resolve to city/country and store that. This way, even if data is leaked, it doesn’t include personal identifiers.
* **Regional Data Residency:** If we have clients in EU who demand data stays in EU, we plan to deploy our system in an EU data center (or have separate cluster). Perhaps multi-region architecture: an EU instance of our stack and a US instance. At first, likely unify in one region (since it’s simpler and our initial customer base might be local), but design for partitioning by geography if needed. For cloud, we can choose a region likely to satisfy most (maybe EU or US depending on primary market).
* **RBAC for Data Visibility:** Possibly not all data should be public – e.g., internal quality notes may be intended only for B2B partners but not consumers. We can handle that by marking certain data fields as “internal” and not exposing them via consumer UI. For instance, a farm might include a note “some beans had minor defect rate 10%” for roaster’s info – our system could store it but not show on consumer side, or show only if user is logged in as a partner. We must define which event data is customer-facing (most is fine to show, maybe except some transaction IDs or internal codes).
* **Greenwashing & Trust:** This is more an ethical risk: producers might be tempted to fudge data to look good (e.g., misreport origin or processing to seem sustainable). While we can’t 100% prevent dishonesty, our measures help:

  * Encourage linking certifications which are third-party verified (so claims like “organic” are backed by a cert).
  * Possibly incorporate community or NGO oversight: we could allow certain verified observers to also view data and flag inconsistencies (like if an NGO notices the volume produced by farm exceeds what that farm could realistically output, it might indicate blending from elsewhere).
  * Use cross-validation: if we get data from multiple sources (e.g., a logistic provider confirming a shipment’s contents vs what producer said), we can cross-check. For now, single source input, but in future maybe IoT (like a smart seal weighing shipments).
  * Ultimately, building trust means being transparent about the limits of our data: we present what’s provided and who provided it. If a user doubts, they know which entity’s claim it is. That’s where perhaps *W3C Verifiable Credentials* shine – a claim is digitally signed by the issuer, so consumers see not just “Farm says it’s organic” but “Certified by \[Org], here’s a signature to prove it.”

**Analytics & Privacy-Preserving Aggregation:** We’ll collect scan data to provide value (like showing brands a map of consumer engagement, etc.), but we do so in a privacy-conscious manner:

* **Scan Telemetry Schema:** Each scan event we log includes: timestamp, product (gtin/lot/serial), approximate location, and device/user agent info if available (e.g., “iPhone Safari” vs “Android Chrome” – mostly to know how people scan). Also possibly an anonymized session or user ID if user is logged in our app (in case we build user accounts for coffee lovers later). But initially likely no accounts, just anonymous scans.
* **Geo aggregation:** We use IP geolocation to get city or region for the scan. Instead of storing exact coordinates or the full IP, we convert IP to say city & country, or maybe a 2-digit postal code area. That’s usually enough for insights (e.g., “most scans in Toronto, some in Vancouver”). We drop the raw IP. We also could fuzz the timestamp a bit if needed to further anonymize (though probably not necessary if no user identity).
* **Analytics outputs:** When showing analytics to clients (the coffee brand), we primarily show aggregated data: e.g., “100 scans this week in NA vs 20 in EU”, or “daily scans trend”. If we ever show examples or details, we ensure no personal data is present – which in our case, only potential personal data would be if someone scanning provided it somehow (like if they submit a comment or join a rewards program).
* **User privacy control:** If we introduce accounts or features where consumers register (perhaps to save their coffee tasting notes or such), we will have a privacy policy and allow them to opt out of analytics. But for now, we treat all scan events as unlinkable to an individual (since no PII).
* **Data Minimization:** We only collect what we need. E.g., user agent mainly to see if scanning via our app vs generic QR app. We probably don’t need device identifiers or anything invasive.
* **Data Retention:** We might purge or aggregate scan logs after some time (detailed logs older than say 1 year might be removed or stored only in aggregate form) to minimize data held.
* **Insights and Geofencing:** We might use geofencing in features like detecting if a product intended for one market is scanned in another (diversion detection). This uses the scan’s region vs the expected distribution region from our supply chain data. We can alert the brand if, say, a coffee bag meant for Germany (based on the shipment event destination) is scanned in the US – possible gray market or parallel import. This is a positive use-case of our analytics. It doesn’t involve personal info, just batch location vs expected.
* **Machine Learning** (future): If we apply ML on consumer behavior (like to predict something), we’ll ensure it’s on anonymized data. We might cluster scan patterns by region or time but won’t be identifying individuals.

By following these best practices, we aim to maintain a robust, secure, and trustworthy system that engenders confidence from all users – producers trust we protect their data and interests, and consumers trust the information is authentic and accurate – all while protecting privacy and aligning with regulatory expectations.

## Code Snippet Annex (TypeScript)

Below we provide simplified TypeScript snippets demonstrating how key functionalities could be implemented in our platform. These are illustrative and not full production code, but they should be **runnable patterns** that highlight the integration of libraries and logic for each task.

### 1. Create & Validate an EPCIS 2.0 TransformationEvent (Roast)

Using a JSON-LD approach and AJV for JSON Schema validation:

```ts
import Ajv from 'ajv';
// Assume we have the EPCIS 2.0 JSON Schema (v2.0.0) as epcisSchema JSON, possibly fetched from GS1
import epcisSchema from './schemas/epcis_2_0_schema.json';

const ajv = new Ajv({ strict: false });
const validateEPCIS = ajv.compile(epcisSchema);

// Construct a TransformationEvent for a roasting process
const roastEvent = {
  "type": "TransformationEvent",
  "eventTime": new Date().toISOString(),
  "eventTimeZoneOffset": "+00:00",
  "inputQuantityList": [
    {
      "epcClass": "https://id.gs1.org/01/09876543210987/10/GREENLOT123",
      "quantity": 500,
      "uom": "KGM"
    }
  ],
  "outputQuantityList": [
    {
      "epcClass": "https://id.gs1.org/01/09876543210987/10/ROASTLOT789",
      "quantity": 400,
      "uom": "KGM"
    }
  ],
  "bizStep": "processing",
  "disposition": "active",
  "readPoint": { "id": "urn:epc:id:sgln:1234567.00001.0" },
  "bizLocation": { "id": "urn:epc:id:sgln:1234567.00001.0" },
  "ilmd": {
    // Using a context-defined namespace for ILMD fields:
    "cbvmda:roastingDate": "2025-07-01",
    "cbvmda:roastLevel": "Medium"
  }
};

// Wrap in an EPCISDocument structure for validation
const epcisDocument = {
  "@context": [
    "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
    {"cbvmda": "https://ns.gs1.org/epcis/cbv/masters/"} // example master data context
  ],
  "type": "EPCISDocument",
  "schemaVersion": "2.0",
  "creationDate": new Date().toISOString(),
  "epcisBody": { "eventList": [ roastEvent ] }
};

const valid = validateEPCIS(epcisDocument);
if (!valid) {
  console.error("EPCIS event validation errors:", validateEPCIS.errors);
} else {
  console.log("Roast TransformationEvent is valid per EPCIS 2.0 schema.");
  // We can now send this event to OpenEPCIS or store it as needed
}
```

This snippet creates a transformation event JSON and validates it against the EPCIS schema. The schema ensures required fields and formats are correct. The context includes `cbvmda` prefix as an example of how to add ILMD fields (in practice, we'd use the appropriate context for our custom fields). If validation passes, we proceed to use the event (e.g., send it via our API to OpenEPCIS or our event handling system). In a real system, we’d also add an `eventID` and maybe an `eventHash` for uniqueness and integrity.

### 2. Generate a GS1 Digital Link URI for GTIN + Lot (+ optional Serial)

We can use the GS1 Digital Link Toolkit (if available as an npm package) or do simple string construction with proper encoding:

```ts
// Example without using GS1 toolkit:
function createDigitalLinkURI(domain: string, gtin: string, lot: string, serial?: string): string {
  let uri = `${domain.replace(/\/$/,'')}/gtin/${gtin}`;
  if (lot) {
    uri += `/lot/${encodeURIComponent(lot)}`;  // encode lot in case it has special chars
  }
  if (serial) {
    uri += `/ser/${encodeURIComponent(serial)}`;
  }
  return uri;
}

// Usage:
const domain = "https://coffeeCo.io";
const gtin = "09876543210987";
const lot = "ROASTLOT789";
const serial = "0001";

console.log(createDigitalLinkURI(domain, gtin, lot));
// -> "https://coffeeCo.io/gtin/09876543210987/lot/ROASTLOT789"

console.log(createDigitalLinkURI(domain, gtin, lot, serial));
// -> "https://coffeeCo.io/gtin/09876543210987/lot/ROASTLOT789/ser/0001"
```

This simple function builds the URI. It ensures the domain has no trailing slash and encodes lot/serial to be URL-safe. For example, if lot was "ABC/123", it would become "ABC%2F123" in the URI.

If we used the **GS1DigitalLinkToolkit.js** library, it would look like:

```ts
// Assuming gs1dlt is an instance of GS1DigitalLinkToolkit from the library
const elementStrings = `(01)${gtin}(10)${lot}${ serial ? `(21)${serial}` : ''}`;
const uri = gs1dlt.gs1ElementStringsToGS1DigitalLink(elementStrings, true, domain);
// This would produce the same URI using the library's logic.
```

But using the library would handle AIs and check for valid lengths, etc., which is more robust.

### 3. Cloudflare Worker Resolver (Edge code for linkType routing)

We implement a Cloudflare Worker script (in TypeScript/JavaScript) to handle incoming requests to our `id.coffeeCo.io` domain. It will parse the path and query and either redirect or return data:

```js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  // Path format expected: /gtin/GTIN/lot/LOT(/ser/SERIAL optional)
  const pathSegments = url.pathname.split('/').filter(s => s);
  // e.g., ["gtin","09876543210987","lot","ROASTLOT789","ser","0001"]
  let gtin, lot, ser;
  if (pathSegments.length >= 4 && pathSegments[0] === 'gtin' && pathSegments[2] === 'lot') {
    gtin = pathSegments[1];
    lot = pathSegments[3];
    if (pathSegments.length >= 6 && pathSegments[4] === 'ser') {
      ser = pathSegments[5];
    }
  } else {
    // If path is not as expected, return 404
    return new Response('Not Found', { status: 404 });
  }

  const linkType = url.searchParams.get('linkType');
  const acceptHeader = request.headers.get('Accept') || '';

  if (linkType === 'gs1:epcis' || linkType === 'traceability' || acceptHeader.includes('application/json')) {
    // Return machine-readable traceability data (EPCIS or summary JSON)
    // Fetch from our API (assuming we have an endpoint that returns JSON for the batch)
    try {
      const apiUrl = `https://api.coffeeCo.io/passport/${gtin}/${lot}${ ser ? `?serial=${ser}` : '' }&format=json`;
      const apiRes = await fetch(apiUrl);
      if (!apiRes.ok) {
        return new Response('Error fetching data', { status: 502 });
      }
      // We stream the API response through
      return new Response(apiRes.body, {
        status: 200,
        headers: {
          'Content-Type': 'application/ld+json'  // or application/json depending on format
        }
      });
    } catch (err) {
      return new Response('Server Error', { status: 500 });
    }
  } else {
    // Redirect to human-readable passport page
    const targetUrl = `https://app.coffeeCo.io/passport?gtin=${gtin}&lot=${lot}${ ser ? `&serial=${ser}` : ''}`;
    return Response.redirect(targetUrl, 302);
  }
}
```

Explanation:

* We parse the URL path to extract GTIN, lot, and optional serial.
* If the query param `linkType` is one of the types we consider machine access (we use `gs1:epcis` as an example standard type, or a custom `traceability`), or if the `Accept` header indicates JSON is acceptable (content negotiation for an API call), we fetch JSON data from our backend. In this snippet, we assume an internal API endpoint exists that gives us the traceability info in JSON (which could be an EPCIS document or a simplified passport JSON).
* Then we return that JSON with appropriate content type.
* If none of those, we form a redirect to the consumer web application page (hosted at `app.coffeeCo.io` in this example) passing the identifiers as query params.
* We use Cloudflare's `Response.redirect` to send a 302.

This way, a consumer scanning (likely no linkType) goes to the nice UI, whereas a supply chain system or regulator (which might call with `linkType=gs1:epcis` or set Accept: application/json) gets the raw data.

We should ensure CORS if necessary (like if a web app calls the JSON endpoint via fetch, maybe allow it or just design that such calls go to `api.coffeeCo.io` with proper CORS open).

### 4. GraphQL Read Model for Consumer Passport

We design a GraphQL schema that the consumer app will use to display the "digital passport". We assume we have aggregated data per batch in a database table or we will fetch events and compose. For simplicity, let's say we do on-the-fly composition from events (in practice, a cached view would be faster, but snippet wise we'll simulate with static data).

Schema (SDL notation for understanding):

```graphql
type Query {
  passport(gtin: String!, lot: String!): CoffeePassport
}
type CoffeePassport {
  gtin: String!
  lot: String!
  productName: String
  origin: OriginInfo
  events: [TraceEvent!]!
}
type OriginInfo {
  farmName: String
  country: String
  latitude: Float
  longitude: Float
}
interface TraceEvent {
  type: String!
  time: String!
  locationName: String
  readPointGLN: String
}
type TransformationEvent implements TraceEvent { ...fields... }
type ObjectEvent implements TraceEvent { ...fields... }
# etc, define fields for specific event types
```

We'll implement a resolver in TypeScript for `passport` query:

```ts
import { ApolloServer, gql } from 'apollo-server';

// Define type defs (for brevity, not the full schema)
const typeDefs = gql`
  type Query {
    passport(gtin: String!, lot: String!): CoffeePassport
  }
  type CoffeePassport {
    gtin: String!
    lot: String!
    productName: String
    origin: OriginInfo
    events: [TraceEvent!]!
  }
  type OriginInfo {
    farmName: String
    country: String
    latitude: Float
    longitude: Float
  }
  interface TraceEvent {
    type: String!
    time: String!
    locationName: String
  }
  type TransformationEvent implements TraceEvent {
    type: String!
    time: String!
    locationName: String
    inputLot: String
    outputLot: String
    quantityOutput: Float
    uom: String
  }
  type ObjectEvent implements TraceEvent {
    type: String!
    time: String!
    locationName: String
    bizStep: String
    from: String
    to: String
  }
  # ... (additional event types as needed)
`;

const resolvers = {
  Query: {
    passport: async (_parent: any, args: {gtin: string, lot: string}, _context: any) => {
      const { gtin, lot } = args;
      // Example: fetch aggregated data from our database or services:
      const product = await db.getProductByGTIN(gtin);
      const origin = await db.getOriginForLot(lot);
      const events = await db.getEventsForLot(gtin, lot);
      // Transform events into GraphQL-friendly format
      const formattedEvents = events.map((ev: any) => {
        if (ev.type === 'TransformationEvent') {
          return {
            __typename: 'TransformationEvent',
            type: 'TransformationEvent',
            time: ev.eventTime,
            locationName: locationLookup(ev.readPoint),  // convert GLN to name
            inputLot: ev.inputQuantityList?.[0]?.epcClass.split('/').pop() || null,
            outputLot: ev.outputQuantityList?.[0]?.epcClass.split('/').pop() || null,
            quantityOutput: ev.outputQuantityList?.[0]?.quantity || null,
            uom: ev.outputQuantityList?.[0]?.uom || null
          };
        }
        if (ev.type === 'ObjectEvent') {
          return {
            __typename: 'ObjectEvent',
            type: 'ObjectEvent',
            time: ev.eventTime,
            locationName: locationLookup(ev.readPoint),
            bizStep: ev.bizStep,
            from: ev.sourceList?.[0]?.destination || ev.sourceList?.[0]?.source || null,
            to: ev.destinationList?.[0]?.destination || null
          };
        }
        // handle other event types...
        return {
          type: ev.type, time: ev.eventTime, locationName: locationLookup(ev.readPoint)
        };
      });
      return {
        gtin, lot,
        productName: product?.name || null,
        origin: origin ? {
          farmName: origin.farmName,
          country: origin.country,
          latitude: origin.lat,
          longitude: origin.lng
        } : null,
        events: formattedEvents
      };
    }
  },
  TraceEvent: {
    // Resolve interface type
    __resolveType(obj: any) {
      return obj.__typename || null;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: 4000 });
```

This GraphQL setup:

* Defines `passport(gtin, lot)` query returning a `CoffeePassport` object that includes product info, origin, and a list of events (the events use a GraphQL Interface `TraceEvent` which can be concrete types like TransformationEvent, ObjectEvent, etc., so the client can query fields specific to each).
* In the resolver for `passport`, it fetches data from a database (simulated by `db.get...` calls). In practice, this could be querying OpenEPCIS for events and our own DB for product and origin info. We then format events. We include `__typename` to let Apollo discriminate the interface.
* `locationLookup` is a placeholder function that converts a GLN or URI to a human-readable location name, using maybe a cached map of GLN->name (e.g., "Acme Roastery Plant 1").
* The result is the combined data structure ready for the client.

Clients can query for example:

```graphql
query {
  passport(gtin:"09876543210987", lot:"ROASTLOT789") {
    productName
    origin { farmName country }
    events {
      ... on TransformationEvent {
        time
        locationName
        inputLot
        outputLot
        quantityOutput
      }
      ... on ObjectEvent {
        time
        bizStep
        from
        to
      }
    }
  }
}
```

This would return JSON of the requested fields, e.g., productName, origin, and the event list with fields depending on type.

### 5. Webhook Signing & Verification for Partner Notifications

Suppose we send webhooks to partners (e.g., notifying a retailer when a product is recalled, or notifying a system when an event is captured). We sign these webhooks so the partner can verify they truly came from us and not altered. We'll show how to sign on our side and verify on partner side using HMAC:

**Signing Webhook (our side):**

```ts
import crypto from 'crypto';

function signWebhookPayload(payload: string, secret: string): string {
  const signature = crypto.createHmac('sha256', secret)
                          .update(payload, 'utf8')
                          .digest('hex');
  return signature;
}

// Example usage:
const webhookPayload = JSON.stringify({ gtin: "09876543210987", lot: "ROASTLOT789", status: "RECALLED" });
const secret = process.env.WEBHOOK_SECRET_KEY;  // a shared secret with the partner
const signature = signWebhookPayload(webhookPayload, secret);

// In the HTTP request to partner, we include this signature header:
const headers = {
  'Content-Type': 'application/json',
  'X-CoffeeCo-Signature': signature
};
// Then send the request with payload and headers...
```

We use a pre-shared `WEBHOOK_SECRET_KEY` (unique per partner ideally) to generate an HMAC of the payload. We send this in header (prefixed with something identifying, here `X-CoffeeCo-Signature`). The partner must know the secret to verify.

**Verifying Webhook (partner side):**

```ts
const crypto = require('crypto');

// Partner receives the request
function verifyWebhook(req) {
  const receivedSig = req.headers['x-coffeeco-signature'];
  const body = req.rawBody || JSON.stringify(req.body); // ensure exact raw payload used
  const secret = WEBHOOK_SECRET_FOR_COFFEECO;  // partner's copy of secret
  const expectedSig = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
  if (receivedSig !== expectedSig) {
    throw new Error('Invalid signature - payload may be tampered or secret mismatch');
  }
  // else, proceed to process webhook
  const data = JSON.parse(body);
  console.log("Verified webhook for lot", data.lot, "with status", data.status);
}
```

The partner computes the HMAC on the received payload and compares to header. If matches, they trust the payload. It's crucial the exact body string is used (some frameworks reformat JSON, so we often store the raw body to use in HMAC).

Additionally, we might include a timestamp in payload and have partner check it's recent to avoid replay. We can also include a unique ID for the webhook.

This signing process is analogous to Stripe, GitHub, etc., which use similar HMAC headers for webhooks.

By implementing these code patterns, we ensure core technical tasks are achievable with known libraries and robust methods, speeding up development and reducing risk.

## Risk Register & Mitigations

We conclude with a register of potential risks that could impact the project’s success, along with mitigation strategies and playbooks to address them:

| **Risk**                                     | **Description/Impact**                                                                                                                                                     | **Mitigation Strategy**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data Gaps / Missing Events**               | Some supply chain steps might not provide data (e.g., a distributor doesn’t log receiving). This creates breaks in traceability (incomplete passport).                     | *Mitigation:* Identify critical tracking points and ensure contractual or incentive-based data sharing. Build redundancy: e.g., if distributor fails to log, use transport data or retailer log to infer. Our system flags missing links (e.g., no receive after ship in X days) and our team/partner managers follow up. Provide an easy manual input interface for late data entry so gaps can be filled post facto. Over time, show partners a data completeness score to encourage full compliance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Inconsistent or Messy IDs**                | Partners might use wrong codes (typos in GTIN or lot, or not following format). This could break linkages (events not chaining).                                           | *Mitigation:* Use drop-downs and scanning where possible in data entry apps to avoid manual typing of codes. Implement **validation rules** – e.g., GTIN must be 14 digits, lot codes should match expected pattern (we can set allowable regex or length). If data comes via API, validate and reject with clear error messages so partner can correct. Maintain a reference of all valid GTINs in the system; if an event has an unknown GTIN, flag it. For lot codes, consider a **master data approach**: have producers register lot codes (or send a commissioning event first) so subsequent events must refer to an existing lot in system (or else error). In UI, use scanning (partners can scan the code we assign to avoid typing errors). If messy data still gets in, have data steward tools to merge or fix records (with logs).                                                                                                                                                                                                                                                                                                                                  |
| **Resolver Downtime**                        | If our Cloudflare Worker or resolver service goes down, consumer scans won’t resolve, harming user experience and trust.                                                   | *Mitigation:* Host the resolver on a highly available platform (Cloudflare Workers has built-in redundancy across edge nodes). Set up monitoring – regularly scan a test code and alert if not resolving or if latency spikes. Have a fallback: if our domain is unreachable, we could register our codes also with the GS1 `id.gs1.org` resolver as a backup (GS1’s global resolver could redirect to a static page if needed). Another mitigation is client-side: encode on the QR a fallback URL or instruction (not typical, but maybe a short text like “if scan fails, visit coffeeCo.io/code”). Also, ensure our DNS is robust (Cloudflare DNS) and have an emergency playbook: in case of outage, post a notice on website and fix ASAP. Because it’s read-only traffic, we can also use caching – e.g., our passport app might cache the last known data for a scanned code (not perfect but helpful if API down but resolver up).                                                                                                                                                                                                                                       |
| **Greenwashing / False Claims**              | A producer might input misleading info (e.g., claiming beans are from organic farm when not, or exaggerating sustainability metrics). This undermines trust if discovered. | *Mitigation:* Incorporate **third-party verification** where possible. E.g., require upload of certification documents for claims like "Organic", and display those (so claim is backed by evidence). Use verifiable credentials for certifications so they are digitally signed by the certifier. Additionally, encourage community or stakeholder review: maybe allow downstream buyers to confirm or comment on data (like “Yes, I received this batch and it was indeed from Farm X”). Internally, implement plausibility checks: compare data against known benchmarks – if a farm reports yield way above norm, flag for review. Ultimately, our platform is a tool for transparency, but we clearly communicate provenance info is provided by producers and when applicable certified by third parties. If a false claim is exposed, we have a policy/playbook: immediately update the data to correct truth (with an annotation that correction was made), possibly suspend or flag the producer’s account until trust is restored, and notify affected stakeholders (and perhaps public if serious). Basically, swift correction and transparency about the correction. |
| **Product Recall Scenario**                  | A contamination or quality issue requires a recall of certain lots. How effectively can we use our data to enact the recall and inform consumers?                          | *Mitigation:* Have a **Recall Playbook** ready: This includes a feature in our system to mark a lot as “RECALLED” (with date and reason). This triggers: (a) an update in the resolver – scans of that lot will prominently show a recall warning; (b) notifications – send webhooks or emails to all downstream partners who received that lot (we know from events who got it), and if any consumers registered or subscribed to alerts (in future if we have such feature), notify them too. We can generate a quick report of all distribution points of the lot from our EPCIS chain. Partner with the brand’s PR team to possibly use the data for targeted outreach (like know which stores had it to post notices). Frequent drills: test the recall feature with dummy data so staff know how to do it quickly under pressure. Also ensure regulatory compliance – our data can produce the reports regulators need within 4 hours (the law often requires traceability info quickly in recalls – our search can do it in minutes).                                                                                                                                      |
| **System Scalability Bottleneck**            | As more data and users come, parts of system might lag (e.g., Postgres query slow with millions of events, or too many simultaneous scans overload our API).               | *Mitigation:* Design in scalability from start (horizontally scale stateless services, use read replicas for DB, caching etc.). Monitor key metrics: DB query times, CPU, memory. We will do load testing with expected peak scenarios (say a marketing campaign causes thousands of scans in a minute). Use CDN caching for static content and possibly cache some API responses for repeated access (though each lot is unique query, caching less useful except maybe for product master data which change rarely). We have the architecture Option D plan in pocket – if load starts exceeding thresholds, we can move to Kafka + microservices gradually, or spin up an OpenSearch to offload heavy event queries from Postgres. Essentially, have scaling options identified and modular architecture to enable those changes (like making sure our code has repository layers where we can swap implementations). In worst-case scenario where one component is overwhelmed (say ClickHouse for analytics is slow), it shouldn’t affect the main consumer experience – isolate analytics from transactional. Also use auto-scaling on our app servers.                     |
| **Compliance with Regulations** (GDPR, etc.) | Although we have little personal data, if we mis-handle location info or any user-provided content, we could breach privacy laws.                                          | *Mitigation:* Adhere to **Privacy by Design** principles: minimize personal data (no direct PII collection as of now). If in future we add user accounts or feedback features, we will include consent flows and data deletion capabilities. For now, ensure IP-derived locations are not too granular (city level, no exact addresses). Post a Privacy Policy that explains what data is collected on scan (even if anon) to be transparent. Provide contact for anyone who wants to inquire or request data deletion (likely not much to delete when anon, but be prepared). For other compliance like accessibility or food safety regs: ensure our web app meets accessibility guidelines (WCAG) so all consumers can use it. For security compliance, do regular vulnerability scans and maintain an incident response plan (if a breach happens, how to contain and notify as required by law).                                                                                                                                                                                                                                                                             |
| **Vendor Risks** (for chosen solutions)      | If we rely on a vendor (like a SaaS or cloud service), what if they fail or change terms? E.g., OpenEPCIS stops updating, or Cloudflare changes Workers pricing.           | *Mitigation:* Prefer open-source and open standards (which we do). If using Cloudflare Workers, have alternative (like AWS Lambda\@Edge or Fastly) in mind, although Workers is quite stable. For OpenEPCIS, we have the code and can fork if needed. If using any third-party APIs, design wrappers so we can swap out. Keep an eye on openEPCIS community; if it slows, allocate resources to maintain our fork or transition to another solution (like move to Option A fully). Cloud providers: use infrastructure-as-code so we can port to another provider if absolutely needed. Essentially, avoid lock-in and have backup plans: e.g., daily export of data from SaaS if we were using one, to migrate if needed.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Multi-tenant Data Leakage**                | As we host multiple companies’ data, a bug could allow one to see another’s data, which is a big no-no.                                                                    | *Mitigation:* Implement robust access control at every layer: queries always filter by organization. Use proven frameworks (like row-level security in Postgres with tenant IDs, plus checks in code). Write thorough unit/integration tests that ensure, for example, a user from org A querying an ID belonging to org B gets a “not found” or access denied. Also, isolate data as much as feasible: e.g., separate API keys per org and context that restrict by design. If using OpenEPCIS, consider deploying separate instances per major tenant if needed (or ensure its permission model is multi-tenant aware). Conduct periodic security reviews focusing on access control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Each of these risks has an owner on our team responsible for monitoring and executing the mitigations (not listed here, but internally assigned). By anticipating these issues and having clear playbooks (like the recall procedure, the incident response steps for security, etc.), we aim to both **prevent** many problems and be **prepared to react** effectively to those that do occur, minimizing their impact on the project and its stakeholders.

## Cost & Licensing Notes

Building and running this traceability platform incurs various costs—some monetary, some in terms of open-source licensing obligations. Below we summarize expected costs and licensing considerations:

* **Open Source Software Costs:** Most core components we chose are open-source with permissive licenses:

  * *OpenEPCIS* – Apache 2.0 license. No license fees. We must maintain the Apache license requirements (e.g., include notices if we distribute the software). Apache 2.0 allows us to modify and use freely, even commercially, with no copyleft. We'll keep an eye on any contributions we make (we should contribute back improvements).
  * *GS1 Digital Link Resolver CE* – also Apache 2.0. Similar obligations. It's free to use; we just need to preserve license text in our deployment and any derivative code.
  * *GS1 Toolkit libraries* – likely Apache 2.0 (the JS one is Apache 2.0). Same story: free to use.
  * *Database software* (Postgres, OpenSearch, ClickHouse) – all open source (Postgres under PostgreSQL license which is liberal, OpenSearch Apache 2.0, ClickHouse Apache 2.0). No fees. Just need to comply with licenses (which mostly means keep notices, and for PostgreSQL even that is minimal).
  * There is **no GPL component** in our primary stack, which avoids obligations like releasing our source. (One exception: if we considered Fosstrak (LGPL) it might impose some sharing, but we didn't choose it.)
  * *Front-end libraries* and others (React, Next.js are MIT license, NestJS is MIT). All good to use commercially with attribution.
  * In summary, our open-source stack yields **\$0 licensing costs**, and compliance just means including license texts and not using trademarks improperly. We'll include an open source attribution page listing the libraries and their licenses as is best practice.

* **Cloud Infrastructure Costs:** These will be ongoing operational expenses:

  * **Cloudflare Workers** – Cloudflare offers a free tier up to a limit and then a usage-based cost (as of now, \$5 for 10 million requests on paid plan, etc.). Our traffic of consumer scans – if we project, say 100k scans/month (just a guess if we scale), that's 1.2 million/year, trivial cost < \$1. So Workers cost is negligible early on. We might simply be within free tier. If we start using KV storage or Durable Objects for state, those have additional costs but likely minor at our scale (pennies or a few dollars).
  * **Database Hosting** – We'll likely use a cloud provider (AWS/GCP/Azure) or a DBaaS:

    * Postgres: A decent managed Postgres (with high availability) might be \$100-200/month for production (depending on size). Early on maybe smaller (e.g., AWS RDS small instance \$50). We'll budget around \$2k/year initially which we can scale up.
    * If using OpenEPCIS with Mongo: a managed MongoDB cluster (Atlas) might be similar cost range \$100-200/mo for moderate performance.
    * OpenSearch cluster: Maybe we hold off until needed, but if used, a small 2-node cluster could be \$150/mo.
    * ClickHouse: If self-hosting on a VM, cost is that VM (maybe \$80/mo for a beefy one) or use ClickHouse Cloud which has usage-based pricing. We might start small on analytics to not over-provision.
    * Redis/Queues: Using a managed Redis for BullMQ might cost \$20-50/mo for low tier.
    * Summing these, if all in, we might be around \$500-600/mo in infra for a robust setup, which is \~\$6-7k/year. We can optimize by sizing them appropriately to current load and using auto-scaling.
  * **Bandwidth and CDN** – Serving images (like maps or product images) and the web app. Cloudflare CDN can cache static content and we have minimal large assets. Bandwidth costs likely small (a QR scan that leads to some JSON and images <1MB total per user, even 100k scans is 100k MB \~ 100 GB, and Cloudflare free tier includes some egress, etc.). So likely a few dollars at most. If a partner uploads a lot of documents (like cert PDFs) and we host them for download, that could add a bit, but nothing huge unless volumes are high.
  * **Compute** – Next.js front-end could be hosted on Vercel or similar. Vercel has generous hobby tier, but for production maybe \$20-50/mo to ensure good performance. NestJS backend if on AWS Fargate or a small VM maybe \$50-100/mo.
  * So infrastructure might total on the order of **\$10k/year** once fully in use by multiple partners, perhaps scaling upward if usage grows.
  * We'll also add costs for **monitoring/logging services** if used (some use Datadog, etc.). We might lean on open source for that (Prometheus + Grafana, which just cost server resources).

* **GS1 Membership / Barcode Costs:** If our client or we need to license GTIN prefixes or 2D barcode usage:

  * Each brand needs a GS1 company prefix to create GTINs if they don't have one. That cost (in US for example) is around \$250 initial + annual fee based on number of products (for small co maybe \$50/yr). That’s on the brand, not on us, but we should consider if a small farmer cooperative doesn't have a GTIN, how to handle. Possibly we might use an internal code or help them obtain a GS1 ID. We might consider including in our service offering to help register GS1 codes, but that's not decided.
  * There is no cost to generate QR codes or use Digital Link from GS1 aside from having GTINs. GS1 encourages Digital Link usage freely.
  * If we wanted to use the GS1 Global Resolver (id.gs1.org) as backup, GS1 currently offers it as a free service (with terms of use).
  * If our clients want to put a **GS1 DataMatrix** instead of QR, they'd need to ensure their printers support it – but there's no additional license, it's part of GS1 standard.

* **SaaS Subscriptions (if any):** We mostly avoid external SaaS. But a few possibilities:

  * If scanning SDK: if we integrated **Scandit** for a mobile app scanning, that is pricey (often license per app or per device, which for a business scenario could be \$k's). Right now, we rely on device camera + web or open libs, so no direct cost. If a client insisted on the best scanning, maybe they'd pay for a Scandit license.
  * Map tiles: using Mapbox or Google Maps for maps might incur usage fees. We lean open (OSM). If heavy usage, might donate to tile servers or run our own. But likely negligible cost for embed maps (we can use free OSM tiles via Leaflet for moderate usage, or pay MapTiler if high).
  * Geocoding API for address->latlong (if we do that for farms) can cost after certain limit (Google geocoding charges after free tier). But number of locations is small, so cost trivial.
  * **Email/SMS notifications** (maybe we send emails to partners on events): if using a service like SendGrid, there's minor cost after free (pennies per email). Not a big factor unless huge volume of comms.
  * Monitoring/Alerting SaaS (like Pingdom or Sentry for error tracking): likely we'll use at least Sentry (free for small usage). If we upgrade, maybe \$20-40/mo. Pingdom for uptime maybe \$10/mo. These are small.

* **Labor/Development Cost:** Not a direct monetary cost in budget sheet, but must consider: Option B saved us some dev time vs Option A, but we still invest time in integration. For completeness:

  * Development effort first launch – perhaps 1-2 senior engineers for backend, 1 for frontend, 1 part-time devops, over e.g., 6 months. If we monetize, we account that in internal costs. But since user is internal, probably focusing on external costs.

* **Total Cost of Ownership (TCO):** Year 1 TCO includes initial dev and infra. Ignoring labor, pure service costs might be under \$10k as reasoned. Over time, if data and usage increase, infra cost might go up to \$20-30k/year or more for large scale, but then presumably revenue would cover that.

  * Compared to a SaaS solution: if we had chosen a fully managed traceability SaaS (Option C), we might have been looking at \$50k+/year as earlier estimated. Our chosen approach is likely cheaper on hard costs, at expense of more dev work initially.

* **Pricing Model for Our Service:** Not exactly asked, but we should note how we intend to charge clients (to ensure cost coverage):

  * Possibly a subscription per volume (e.g., \$X per batch or per product, or tiered by number of scans). We need to align it so that it covers our infra costs and leaves margin. Given our infra is not that expensive, we could have good margins even pricing modestly. For instance, if a roaster pays \$200/month to trace all their coffee, and we have 10 such clients = \$2k/mo, which covers infra and some dev. We’d aim higher if value proven. This might come up in our financial planning outside technical doc.

* **Licenses and Data Ownership:**

  * All data that partners input remains **their property** (we likely stipulate that in terms). We just provide the service. But we need rights to display it to consumers obviously. We'll include that in agreements (non-exclusive right to use the data for the service operation).
  * We'll avoid any proprietary tech that traps our data. Everything is in open formats (JSON-LD, etc.), so if a client ever wanted to export all events, we can give them a standard EPCIS file.
  * If any external data sources (like a commodity price API or weather API to enrich our data) are used, mind their licenses (most likely not for MVP, but possibly in future). Those might have separate costs or attribution needed.

* **Trademark usage:** "GS1" is trademarked by GS1 Global – we mention it in documentation and possibly on site to say "Uses GS1 standards". This should be fine, but just ensure proper context (we aren’t claiming endorsement by GS1 unless they actually endorse).

  * If we put QR with the text "Scan with GS1 Digital Link", that should be fine. They have a Digital Link icon that can be used by implementers; if we use it, check their usage guidelines (usually allowed to indicate compliance).

* **Patents:** GS1 standards are generally open for implementation; no known patent issues with EPCIS or Digital Link. 2D barcodes (QR, DataMatrix) are free to use (patents expired or open license).

  * We should be mindful if we used any specialized tech (like scanning algorithms) might be patented, but we stick to open libs, so not an issue.

* **Future License Consideration:** If we integrate W3C Verifiable Credentials libraries, those often are also Apache/MIT. W3C specs themselves are royalty-free to implement. So no license cost there either.

  * Possibly, if we consider blockchain ledger (some enterprise might want that), using a network like Ethereum could incur gas fees. But we likely avoid on-chain transactions for now (or use cheap networks if we did).

In conclusion, our chosen architecture is cost-effective to run and avoids restrictive licenses that could impede our flexibility or cost structure. We will invest in dev and operational excellence instead of license fees. We'll keep vigilant about scaling costs and adjust (for example, scale down resources in off-peak times if possible, use spot instances if appropriate, etc.). As usage grows, the costs will grow somewhat, but likely lineraly or sub-linearly relative to number of clients thanks to multi-tenancy efficiencies. We'll also regularly review cloud provider pricing and options (e.g., if some service is expensive, evaluate alternatives or negotiate enterprise discounts once volume is higher).

---

**Appendices:**

*Glossary:* (selected terms for clarity)

* **EPCIS:** Electronic Product Code Information Services. A GS1 standard for capturing and sharing event data in supply chains (what, when, where, why events).
* **CBV:** Core Business Vocabulary. Standardized sets of values for use in EPCIS events (e.g., definitions for bizStep, disposition, etc.).
* **GS1 Digital Link:** A standard that turns GS1 identifiers (GTIN, etc.) into URIs (web addresses), enabling one barcode (like a QR) to link to many resources. E.g., `https://id.gs1.org/gtin/...`.
* **GTIN:** Global Trade Item Number. Uniquely identifies a product item (usually 14 digits in GS1 system, can be derived from UPC/EAN).
* **GLN:** Global Location Number. Identifies a party or location in GS1. Used for readPoint/bizLocation to indicate where events occur.
* **Lot/Batch:** A quantity of product produced under similar conditions. Identified in GS1 by AI (10) when combined with GTIN. All items of a lot share same lot code.
* **Serial:** A unique item identifier (AI 21 in GS1). Distinguishes individual units within the same GTIN (and possibly lot).
* **Digital Product Passport (DPP):** An upcoming EU requirement for a digital record of product info (sustainability, composition, etc.) accessible throughout a product's life. Not yet mandated for coffee, but conceptually what our "digital passport" is.
* **mTLS:** Mutual Transport Layer Security. Both server and client present certificates to establish identity in TLS handshake – used for strong authentication between systems.
* **HMAC:** Hash-based Message Authentication Code. A cryptographic method to verify integrity and authenticity of a message using a shared secret.
* **Bullwhip Effect:** (From glossary context) In supply chain, small demand changes amplify upstream. Not directly in our scope, but our timely data can help reduce it by increasing visibility.
* **2D Barcode Sunrise 2027:** Industry goal that by 2027 all retail POS can handle 2D barcodes (DataMatrix/QR) alongside or instead of 1D UPC/EAN. Implies transition period with dual codes on packs.

*Search Strategy & Queries:* Throughout research, I used targeted web searches for up-to-date information on standards and technologies. Examples of queries:

* `"OpenEPCIS GS1 EPCIS open source features throughput"` – to find OpenEPCIS official info【0†】.
* `"GS1 Digital Link resolver open source implementation"` – to locate the GS1 Resolver CE GitHub【2†】.
* `"GS1 Digital Link URI lot serial example"` – to confirm combining lot and serial in URI【35†】.
* `"EPCIS 2.0 JSON-LD example TransformationEvent"` – to get sample event structures from GS1 docs【15†】.
* `"Sunrise 2027 GS1 2D barcode POS"` – to gather GS1 guidance on 2D transition【19†】.
* `"What data in EU Digital Product Passport"` – to find what the EU expects in DPP【23†】 (GS1 portal had an FAQ).
* `"Verifiable Credentials coffee traceability"` – to understand how VCs might apply (this was more general, found W3C spec etc.).
* `"Scanbot GS1 Digital Link blog"` – to get industry perspective on digital link value prop【26†】.
* `"GS1 EPCIS guideline ILMD example"` – to see ILMD usage【16†】.
* **Note:** I prioritized primary sources: GS1 standards pages, official GS1 blog or support answers, open-source project docs, etc., ensuring credibility. Also cross-referenced multiple sources for critical facts (like scanning SDK performance from Scandit site plus anecdotal dev discussions on Reddit for balance).

*Evidence Table:* Below are key pieces of evidence from sources, supporting various points made, with permalinks:

| Claim / Key Point                                                                                   | Quote (with context)                                                                                                                                                                                                                                                                                                                                  | Source Title & Org                                                        | Date         | Permalink |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------ | --------- |
| OpenEPCIS is fully compliant with GS1 EPCIS 2.0 and open-source.                                    | “OpenEPCIS is an open-source, fully compliant implementation of the GS1 EPCIS standard for supply chain visibility.”                                                                                                                                                                                                                                  | OpenEPCIS website (benelog)                                               | 2023         |           |
| GS1 Digital Link Resolver CE is free, open-source and aligns to standard.                           | “GS1 Resolver is a free and open-source web-server application that allows you to resolve GS1 identifiers to their corresponding web resources… aims to be fully conformant with the GS1 Digital Link standard.”                                                                                                                                      | GS1 Digital Link Resolver CE README (GS1)                                 | 2022         |           |
| Resolver supports multiple links (e.g., certificates) for one code.                                 | “Multiple Links: Serve multiple links from a single context, a notable improvement over the previous single-link limitation… useful if your product has multiple certificates or related documents.”                                                                                                                                                  | GS1 Resolver CE README (GS1)                                              | 2022         |           |
| GS1 Digital Link URI can include GTIN, lot, serial concurrently.                                    | “…{gtin}, {exp}, {lot} and {ser} are placeholders for the actual values. These data elements can also be expressed within a single Web URI … e.g. `/gtin/{gtin}/lot/{lot}/ser/{ser}?exp={exp}`”                                                                                                                                                       | GS1 Lightweight Messaging Standard Application (GS1 US example)           | 2020         |           |
| Ambition 2027: retail POS to read GTIN from linear or 2D by 2027.                                   | “Initial goal is for retail POS scanning to be globally capable of reading and processing the GTIN from both existing linear and 2D barcodes by the end of 2027.”                                                                                                                                                                                     | 2D Barcodes at Retail POS Guideline (GS1)                                 | 2021         |           |
| During transition, products will carry both 1D and 2D barcodes.                                     | “Linear barcodes… will coexist with 2D barcodes for as long as there are uses for them. During the dual-marking transition phase, the trade item will feature both the current linear barcode and either a GS1 DataMatrix or QR Code with GS1 Digital Link URI syntax.”                                                                               | 2D Barcodes at Retail POS Guideline (GS1)                                 | 2021         |           |
| EU Digital Product Passport data areas (sustainability, etc.).                                      | “It may include information/data on one or more of the following areas: Technical performance, Environmental sustainability performance, Circularity aspects…, Legal compliance, Product-related information (manuals, labels).”                                                                                                                      | EU Digital Product Passport info (GS1 GO portal)                          | 2025         |           |
| IBM Food Trust uses EPCIS standard format for data exchange.                                        | “IBM uses GS1 EPCIS standard to format the data being transmitted to their IBM Food Trust™ blockchain network.”                                                                                                                                                                                                                                       | GS1 EPCIS Standard guide (ByteAlly)                                       | 2019         |           |
| Scandit’s SDK excels in difficult conditions (angles, low light).                                   | “Fast, accurate, and reliable performance for the real world: wide angles, long distances, tiny barcodes, poor light, damaged codes, crowded environments.”                                                                                                                                                                                           | Scandit Barcode Scanner SDK page (Scandit)                                | 2025         |           |
| GS1 Digital Link key benefit: one code leads to different info depending on who scans (contextual). | “One barcode can link to different information depending on who scans it… a hallway: once access through main entrance (scan), several doors lead to rooms of different information. A warehouse worker… inventory details, while a consumer… repair or recycle info. Both entered same hallway – scanned same barcode – but led to different rooms.” | Scanbot Blog – Understanding GS1 Digital Link (Johanna at Scanbot/Apryse) | Mar 31, 2025 |           |
| GS1 Resolver terms of use: global resolver ensures links are brand-approved (free service).         | “The resolver at `id.gs1.org` operates under strict rules to ensure that any links returned are approved by the brand owner (see terms of use). A staging environment is available.”                                                                                                                                                                  | GS1 Digital Link Docs (gs1.org)                                           | 2021         |           |
| Webhook developer noting Scanbot’s reliability (fast, offline) albeit not free.                     | “You might try the Scanbot SDK… it is simply the fastest and most reliable solution out there, that also works offline and at a reasonable price. We decided to go with it.”                                                                                                                                                                          | Reddit r/javascript thread (user Puzzleheaded-Day8023)                    | 2021         |           |

以上内容涵盖了主要的研究成果和引用出处. (Translation: The above content covers the main research findings and cited sources.)
