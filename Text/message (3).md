Here’s a clean, drop-in prompt you can paste into ChatGPT (or any LLM) that swaps the voice-AI context for your coffee traceability platform:

---

**Prompt: Coffee “Digital Passport” Traceability Web App**

How would you create a production-ready **coffee traceability (“digital passport”) web app** that lets any consumer scan a QR on a bag and see a signed, end-to-end provenance—from **farm lot → mill → exporter → importer → roaster → retailer**—while producers/distributors upload trusted EPCIS events?

**Constraints & pillars (must follow):**

* **Standards-first:** **EPCIS 2.0 + CBV 2.0** for events; **GS1 Digital Link** QR (GTIN (01), Lot (10), optional Serial (21)); **DPP-ready** data model.
* **MVP scope:** scan-to-passport page; lot↔roast batch linkage via TransformationEvent; evidence/certificates locker; contributor console; scan analytics.
* **Baseline stack:** **Next.js** (App Router, TS) + **NestJS** (Fastify), **PostgreSQL** (JSONB for EPCIS events via Prisma), **Redis + BullMQ** (jobs/cache), **OpenSearch** (search), **ClickHouse** (telemetry), **S3/MinIO** (docs/images), **Cloudflare Workers** (edge resolver). Consider **OpenEPCIS** repo vs custom store; justify.
* **Security:** OAuth2 client-cred (+ **HMAC** on ingestion), TLS 1.3, short-TTL JWTs (JTI), audit logs, optional **mTLS**; RBAC + RLS; region residency.
* **QR/2D at retail:** POS-safe GS1 Digital Link; coexist with UPC during transition (Sunrise 2027); item-level serial optional later.
* **Privacy:** no consumer PII for scans; privacy-preserving analytics.

**Deliverables (be concrete, with examples):**

1. **Architecture plan** (MVP → Scale): component diagram, data flow, and a brief comparison of **A) Build (Postgres JSONB)** vs **B) OpenEPCIS-centric** vs **C) SaaS traceability** vs **D) Hybrid/Kafka**—with pros/cons, ops cost, migration path, and a recommendation for MVP.
2. **Data model & standards mapping:** entities (Organization, Facility, Product/GTIN, Lot, Batch, Event, Certificate); EPCIS event flow for coffee (commission → transform/roast → aggregate/pack → ship/receive); ILMD fields for roast profile/date/machine; GS1 Digital Link URI patterns for **(01)+(10)+\[21]**; DPP readiness gaps.
3. **APIs & resolver:**

   * B2B **/api/epcis/capture** (auth, idempotency keys, JSON Schema/SHACL validation).
   * Public **/r/{digital-link-path}** resolver (Cloudflare Worker) with `linkType` routing (display vs JSON/EPCIS), POS-safe behavior.
   * Read model: REST/GraphQL (`productPassport(digitalLink)`), pagination, filtering, caching.
4. **Best-practice playbooks:** ingestion security (OAuth2+HMAC, replay protection), QR/labeling guidance, data-quality scorecards & anomaly checks, VC signing for certificates (W3C Verifiable Credentials), recall banner flow, analytics KPIs.
5. **Libraries/services shortlist:** exact npm/packages and services for: EPCIS repo (**OpenEPCIS**), GS1 Digital Link encode/decode, QR/GS1 DataMatrix generation, web/native scanning (open-source first; note Scandit/Scanbot tradeoffs), JSON-LD/SHACL validation, MapLibre + tiles, OpenTelemetry.
6. **TypeScript snippets (minimal, runnable patterns):**

   * Valid **EPCIS 2.0 TransformationEvent** (roast) JSON-LD + AJV validation.
   * **GS1 Digital Link** builder/parser for (01)+(10)+\[21].
   * **Cloudflare Worker** resolver routing by `linkType` & `Accept`.
   * **GraphQL** passport query + resolvers over a denormalized read model.
   * **Webhook** HMAC signing & verification.
7. **Risk register & mitigations:** low data availability, messy IDs, resolver downtime, greenwashing claims, recall handling—each with playbooks.
8. **Cost & licensing:** OSS licenses, infra est. (Postgres/Redis/OpenSearch/ClickHouse/Workers), and notes if choosing OpenEPCIS or a SaaS.

**Evidence rules (important):** Use **primary sources** and give **permalinks** (GS1 EPCIS/CBV & Digital Link specs, GS1 2D at POS guidance, OpenEPCIS docs, EU DPP/ESPR pages, W3C VC 2.0). Prefer sources updated ≤18 months. If a claim is uncertain, say so and suggest how to verify.

**Output format:**

* `/report/landscape.md`, `/report/architecture-options.md`, `/report/standards-mapping.md`
* `/matrices/comparison.csv` (scoring rubric included)
* `/snippets/*.ts` (the five snippets above)
* `/appendix/evidence.csv` (Claim, ≤25-word quote, Source, Org, Date, Permalink) and `/appendix/search-queries.md`

**Context to keep in mind:** Personas = Consumer (scan), Roaster (batches/analytics), Importer (events/certs), Producer (mobile capture/offline). UX: fast, WCAG AA, global locales/units.

Today’s date & timezone: **America/Toronto** (use current date).
