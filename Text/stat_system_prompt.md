<xml>
  <overview>
    <what>Build an MVP "Coffee Digital Passport" web app that is standards-first and production-ready.</what>
    <problem>Consumers can’t see trustworthy provenance for a bag of coffee; producers/importers/roasters have fragmented data. We will ingest trusted EPCIS 2.0 events, bind green lots → roast batches, and expose a fast scan-to-passport UX via GS1 Digital Link QR.</problem>
    <promise>
      <consumer>Scan a QR → get a signed timeline (farm → mill → exporter → importer → roaster → retailer), roast info, certificates, and a map—no PII collected.</consumer>
      <roaster>Upload batches, link to lots, attach certificates, and see scan analytics.</roaster>
      <importer_producer>Capture EPCIS events securely (OAuth2 + HMAC), upload evidence, and manage facilities.</importer_producer>
    </promise>
    <constraints>
      <standards>EPCIS 2.0 + CBV 2.0 events; GS1 Digital Link QR (01 GTIN, 10 Lot, optional 21 Serial); DPP-ready model.</standards>
      <stack>Next.js (App Router, TypeScript) + NestJS (Fastify) + PostgreSQL (JSONB) + Prisma + Redis + BullMQ + OpenSearch + ClickHouse + S3/MinIO + Cloudflare Workers (edge resolver).</stack>
      <security>OAuth2 client-credentials (+ HMAC on ingestion), TLS 1.3, short-TTL JWTs with JTI, audit logs, optional mTLS; RBAC + RLS; region residency.</security>
      <pos>POS-safe GS1 Digital Link; coexist with UPC; item-level serial optional later.</pos>
      <privacy>No consumer PII collected for scans; analytics are privacy-preserving.</privacy>
    </constraints>
  </overview>

  <repo-structure>
    <monorepo name="coffee-passport">
      <dir>apps/api (NestJS/Fastify; EPCIS capture, public read API, GraphQL)</dir>
      <dir>apps/web (Next.js; Passport UI + Contributor Console)</dir>
      <dir>apps/resolver (Cloudflare Worker; GS1 Digital Link resolver)</dir>
      <dir>apps/jobs (Node process; BullMQ consumers for validation/linking/read-model builds)</dir>
      <dir>packages/shared (TS types: identifiers, EPCIS, GraphQL types, logging utils)</dir>
      <dir>packages/config (eslint, tsconfig, jest shared)</dir>
      <dir>infra (docker-compose.dev.yml, Terraform for cloud if needed)</dir>
      <dir>migrations (Prisma schema & SQL)</dir>
    </monorepo>
  </repo-structure>

  <packages>
    <manager>pnpm</manager>
    <install>
      <![CDATA[
# root
pnpm dlx create-turbo@latest coffee-passport
cd coffee-passport

# shared deps versions are indicative; pin as needed

pnpm add -w typescript ts-node zod dotenv pino pino-pretty uuid

# apps/api

cd apps/api
pnpm add @nestjs/core @nestjs/common @nestjs/platform-fastify fastify fastify-plugin fastify-rate-limit fastify-helmet fastify-compress
pnpm add @nestjs/config @nestjs/jwt jose
pnpm add @nestjs/passport passport passport-http-bearer
pnpm add @prisma/client prisma
pnpm add ajv ajv-formats jsonld rdf-validate-shacl
pnpm add ioredis bullmq
pnpm add pg pg-format
pnpm add @opensearch-project/opensearch
pnpm add @clickhouse/client
pnpm add aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner  # choose v3 (@aws-sdk/\*) in implementation
pnpm add opentelemetry-api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node pino-std-serializers

# apps/web

cd ../web
pnpm add next react react-dom next-seo zod @tanstack/react-query axios
pnpm add maplibre-gl
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu class-variance-authority tailwindcss postcss autoprefixer
pnpm add graphql @apollo/client

# apps/resolver

cd ../resolver
pnpm add itty-router\@4 undici\@6

# apps/jobs

cd ../jobs
pnpm add bullmq ioredis pino ajv rdf-validate-shacl @prisma/client

# dev tooling (workspace)

cd ../..
pnpm add -D -w tsx eslint @types/node @types/express @types/jsonwebtoken @types/aws-lambda
pnpm add -D -w wrangler # for Cloudflare Worker
]]> </install> </packages>

  <env-variables>
    <vars>
      <var>DATABASE_URL=postgres://user:pass@host:5432/coffee</var>
      <var>REDIS_URL=redis://host:6379/0</var>
      <var>S3_ENDPOINT=https://s3.example.com</var>
      <var>S3_BUCKET=coffee-passport</var>
      <var>S3_REGION=us-east-1</var>
      <var>OPENSEARCH_URL=https://opensearch.example.com</var>
      <var>CLICKHOUSE_URL=http://clickhouse:8123</var>
      <var>JWT_ISSUER=https://auth.coffee.example</var>
      <var>JWT_AUDIENCE=coffee-api</var>
      <var>JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...</var>
      <var>HMAC_REQUIRED=true</var>
      <var>HMAC_SECRET=supersecret-per-tenant (stored per org in DB; fallback only)</var>
      <var>WORKER_PUBLIC_API=https://api.example.com</var>
      <var>WORKER_WEB_ORIGIN=https://www.example.com</var>
      <var>REGION=ca-central-1 (for residency decisions)</var>
    </vars>
  </env-variables>

  <interface-first-definitions>
    <ts-types>
      <![CDATA[
/** GS1 identifiers */
export type GTIN = string;  // 14-digit, may include leading zeros
export type LotCode = string;
export type Serial = string;
export type GLN = string;

/\*\* Digital Link keys resolved from path /01/\:gtin/10/\:lot \*/
export interface DigitalLinkKeys { gtin: GTIN; lot?: LotCode; serial?: Serial; }

/\*\* Organization & RBAC \*/
export interface Organization { id: string; name: string; region: string; }
export type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER';
export interface ActorUser { id: string; email: string; orgId: string; role: Role; }

/\*\* Product, Facility, Lot, Batch \*/
export interface Product { id: string; orgId: string; gtin: GTIN; name: string; brand: string; images: string\[]; }
export interface Facility { id: string; orgId: string; gln?: GLN; name: string; address?: string; lat?: number; lon?: number; }
export interface Lot {
id: string; orgId: string; code: LotCode; harvestYear?: number;
origin?: { country: string; region?: string; cooperative?: string };
varietals?: string\[]; process?: 'Washed' | 'Natural' | 'Honey' | string; altitudeMasl?: number;
}
export interface Batch {
id: string; orgId: string; code: string; roastDate?: string; profile?: string; machine?: string;
inputLotCodes: LotCode\[]; netOutputKg?: number;
}

/\*\* Certificate metadata \*/
export interface Certificate {
id: string; orgId: string; type: string; issuer: string; validFrom?: string; validTo?: string;
url?: string; vcJwt?: string; fileKey?: string; // S3 object
}

/\*\* EPCIS Event wrapper stored in DB \*/
export interface EpcisEventRecord {
id: string;
orgId: string;
eventType: 'ObjectEvent'|'AggregationEvent'|'TransformationEvent'|'TransactionEvent';
doc: any;                           // raw EPCIS JSON-LD
eventTime: string;                  // ISO
readPoint?: string; bizLocation?: string; // SGLN URNs
hash: string;                       // content address
signature?: string;                 // HMAC/Detached JWS
createdAt: string;
}

/\*\* Public Passport read model \*/
export interface Passport {
product: { gtin: GTIN; name: string; brand: string; images: { url: string; alt?: string }\[] };
lot?: { code: LotCode; harvestYear?: number; originCountry?: string; varietals?: string\[]; process?: string; altitudeMasl?: number };
batch?: { roastDate?: string; profile?: string; machine?: string };
timeline: { eventTime: string; bizStep: string; summary: string; actor: { name: string; role?: string; location?: string } }\[];
certifications: { type: string; issuer: string; validFrom?: string; validTo?: string; url?: string; status?: 'valid'|'expired'|'unknown' }\[];
}
]]> </ts-types> </interface-first-definitions>

  <db-schema-prisma>
    <![CDATA[
model Organization {
  id        String @id @default(cuid())
  name      String
  region    String
  hmacKey   String?  // per-tenant HMAC shared secret (MVP)
  createdAt DateTime @default(now())
  Users     ActorUser[]
  Products  Product[]
  Facilities Facility[]
  Lots      Lot[]
  Batches   Batch[]
  Certificates Certificate[]
  Events    EpcisEventRecord[]
}

model ActorUser {
id        String @id @default(cuid())
email     String @unique
role      String
orgId     String
Organization Organization @relation(fields: \[orgId], references: \[id])
}

model Product {
id      String @id @default(cuid())
orgId   String
gtin    String @index
name    String
brand   String
images  Json
Organization Organization @relation(fields: \[orgId], references: \[id])
}

model Facility {
id      String @id @default(cuid())
orgId   String
gln     String?
name    String
address String?
lat     Float?
lon     Float?
Organization Organization @relation(fields: \[orgId], references: \[id])
}

model Lot {
id        String @id @default(cuid())
orgId     String
code      String @index
metadata  Json
Organization Organization @relation(fields: \[orgId], references: \[id])
}

model Batch {
id        String @id @default(cuid())
orgId     String
code      String @index
metadata  Json
inputLotCodes String\[] // denormalized helper
Organization Organization @relation(fields: \[orgId], references: \[id])
}

model Certificate {
id        String @id @default(cuid())
orgId     String
type      String
issuer    String
validFrom DateTime?
validTo   DateTime?
url       String?
vcJwt     String?
fileKey   String?
Organization Organization @relation(fields: \[orgId], references: \[id])
}

model EpcisEventRecord {
id        String @id @default(cuid())
orgId     String @index
eventType String
eventTime DateTime @index
readPoint String?
bizLocation String?
hash      String @unique
signature String?
doc       Json   // raw EPCIS JSON-LD
createdAt DateTime @default(now())
Organization Organization @relation(fields: \[orgId], references: \[id])
}
]]> </db-schema-prisma>

  <api-contracts>
    <capture-endpoint>
      <route>POST /api/epcis/capture</route>
      <auth>OAuth2 Client Credentials (Authorization: Bearer &lt;JWT&gt;) + HMAC header</auth>
      <headers>
        <header>X-Idempotency-Key (UUIDv4)</header>
        <header>X-Signature: sha256=&lt;hex HMAC of body with org’s secret&gt;</header>
        <header>Date (RFC1123)</header>
      </headers>
      <input-json-schema>
        <![CDATA[
{
  "type":"object",
  "required":["events"],
  "properties":{
    "events":{
      "type":"array",
      "items":{"type":"object"}  // EPCIS JSON-LD event(s) per GS1 artefacts
    }
  }
}
        ]]>
      </input-json-schema>
      <output>
        <![CDATA[
200 OK
{
  "accepted": true,
  "ingestedCount": 3,
  "ids": ["evt_...","evt_..."],
  "warnings": ["...optional..."]
}

4xx/5xx with error codes:
{
"error": "HMAC\_MISMATCH" | "SCHEMA\_INVALID" | "SHACL\_INVALID" | "IDEMPOTENT\_REPLAY" | "UNAUTHORIZED" | "FORBIDDEN",
"detail": "human-readable message"
}
]]> </output> </capture-endpoint>

```
<public-passport-endpoint>
  <route>GET /api/public/passport?dl=/01/:gtin/10/:lot[/21/:serial]</route>
  <output>Returns <code>Passport</code> JSON (see Interface defs).</output>
</public-passport-endpoint>

<graphql>
  <schema>
    <![CDATA[
```

type Query { productPassport(digitalLink: String!): Passport! }
type Passport {
product: Product!
lot: Lot
batch: Batch
timeline: \[TimelineEvent!]!
certifications: \[Certificate!]!
}
]]> </schema> </graphql>

```
<resolver>
  <route>GET https://id.example.com/01/:gtin/10/:lot[/21/:serial]?linkType=product|json|epcis</route>
  <behavior>Cloudflare Worker parses path AIs; routes by linkType or Accept header to WEB_ORIGIN (HTML) or PUBLIC_API (JSON/EPCIS).</behavior>
</resolver>

<webhook-outbound>
  <event>scan.performed</event>
  <payload>
    <![CDATA[
```

{
"id": "evt\_scan\_...",
"ts": "2025-08-14T15:01:22Z",
"gtin": "09506000134352",
"lot": "L2305",
"serial": "000123",
"country": "CA",
"city": "Toronto",
"ua": "Mozilla/5.0 ...",
"resolverLatencyMs": 42
}
]]> </payload> <security>HMAC-SHA256 signature header: X-Signature</security> </webhook-outbound> </api-contracts>

  <state-diagrams>
    <ingestion-pipeline>
      <![CDATA[
[RECEIVED] ->(Auth OK) -> [HMAC VERIFIED] ->(Idempotency OK)-> [JSON SCHEMA VALID]
      ->(SHACL OK)-> [PERSISTED] -> [ENQUEUE-LINKER] -> [LINKED LOT↔BATCH]
      -> [READ-MODEL UPDATED] -> [DONE]
    Failure edges: any state -> [ERROR:{CODE}] + audit log
      ]]>
    </ingestion-pipeline>

```
<resolver-scan>
  <![CDATA[
```

\[SCAN] -> \[Worker Parse DL] -> (linkType=json) -> \[Fetch Public API JSON] -> \[Return JSON]
-> (default/product) -> \[Fetch WEB page] -> \[Return HTML]
-> \[Emit clickhouse.scan\_event] (fire and forget; retries out-of-band)
]]> </resolver-scan>

```
<certificate-lifecycle>
  <![CDATA[
```

\[UPLOADED] -> \[METADATA SET] -> (optional) \[VC ISSUED] -> \[VERIFIED] -> (time passes) -> \[EXPIRED]
]]> </certificate-lifecycle> </state-diagrams>

  <pseudocode-instructions>
    <cloudflare-worker>
      <![CDATA[
onFetch(request):
  url = new URL(request.url)
  keys = parseDL(url.pathname) // /01/:gtin/10/:lot[/21/:serial]
  linkType = url.searchParams.get('linkType') || inferFromAccept(request.headers)
  log.info({ keys, linkType }, 'resolver.request')

// telemetry (non-blocking)
fireAndForget POST CLICKHOUSE\_URL/scan\_event with { ts, keys, cf.geo, ua }

if linkType == 'json':
return fetch(`${PUBLIC_API}/api/public/passport?dl=${encodeURIComponent(url.pathname)}`)
if linkType == 'epcis':
return fetch(`${PUBLIC_API}/api/public/epcis?dl=${encodeURIComponent(url.pathname)}`)
else:
return fetch(`${WEB_ORIGIN}/passport${url.pathname}${url.search}`)
]]> </cloudflare-worker>

```
<capture-controller>
  <![CDATA[
```

POST /api/epcis/capture:
// 1) Authenticate
token = bearerToken(req)
org = verifyJWT(token); assert(org.active)

// 2) Verify HMAC
sig = req.header('X-Signature'); date = req.header('Date')
assert clockSkewOK(date)
assert verifyHmac(sig, req.body, org.hmacKey)

// 3) Idempotency
idemKey = req.header('X-Idempotency-Key')
if seen(idemKey): return previousResponse

// 4) Validate EPCIS JSON-LD
assert validateJsonSchema(events)  // Ajv
assert validateShacl(events)       // rdf-validate-shacl

// 5) Persist each event
for ev in events:
hash = sha256(canonicalize(ev))
if exists(hash): continue
save(EpcisEventRecord{ orgId, eventType, eventTime, hash, doc: ev })

// 6) Enqueue linking job
enqueue('linker', { orgId, idemKey })

// 7) Respond
return 200 { accepted: true, ingestedCount: n, ids: \[...] }
]]> </capture-controller>

```
<linker-job>
  <![CDATA[
```

job linker(payload):
events = loadNewEvents(payload.orgId)
// map EPCIS TransformationEvents -> Lot↔Batch
for e in events where e.type == 'TransformationEvent':
inputLots = extractLotCodes(e.doc)
batchCode = deriveRoastBatchCode(e.doc)
upsertBatch(orgId, batchCode, { inputLotCodes, metadata: e.doc.ilmd })
// update read-model tables/materialized views
rebuildPassportViews(orgId)
]]> </linker-job>

```
<read-model-service>
  <![CDATA[
```

getPassport(digitalLink):
keys = parseDL(digitalLink)
product = findProductByGTIN(keys.gtin)
lot = findLotByCode(keys.lot)
batch = findBatchByLot(keys.lot)
timeline = queryTimeline(keys) // OpenSearch or Postgres by keys
certs = listCertificates(product, lot, batch)
return { product, lot, batch, timeline, certifications: certs }
]]> </read-model-service> </pseudocode-instructions>

  <snippets>
    <gs1-digital-link>
      <![CDATA[
export function buildDL({ gtin, lot, serial }: {gtin:string; lot?:string; serial?:string}, base="https://id.example.com") {
  const seg = ['01', encodeURIComponent(gtin)];
  if (lot) { seg.push('10', encodeURIComponent(lot)); }
  if (serial) { seg.push('21', encodeURIComponent(serial)); }
  return `${base}/${seg.join('/')}`;
}
export function parseDL(pathname: string) {
  const seg = pathname.split('/').filter(Boolean);
  const map: Record<string,string> = {};
  for (let i=0;i<seg.length;i+=2) map[seg[i]] = decodeURIComponent(seg[i+1]||'');
  return { gtin: map['01'], lot: map['10'], serial: map['21'] };
}
      ]]>
    </gs1-digital-link>

```
<worker-code>
  <![CDATA[
```

// apps/resolver/src/index.ts
import { Router } from 'itty-router';
const router = Router();

function parseDL(pathname: string){ /\* as above \*/ }

router.get('\*', async (request: Request, env: any) => {
const url = new URL(request.url);
const keys = parseDL(url.pathname);
const linkType = url.searchParams.get('linkType') || (request.headers.get('accept')?.includes('json') ? 'json' : 'product');

// VITAL LOGGING
console.log(JSON.stringify({ at:'resolver.request', linkType, keys, cf: (request as any).cf }, null, 0));

// Fire-and-forget telemetry (don’t await)
fetch(`${env.WORKER_PUBLIC_API}/api/telemetry/scan`, {
method:'POST',
headers:{'content-type':'application/json'},
body: JSON.stringify({ keys, ua: request.headers.get('user-agent'), cf: (request as any).cf })
});

if (linkType === 'json') return fetch(`${env.WORKER_PUBLIC_API}/api/public/passport?dl=${encodeURIComponent(url.pathname)}`);
if (linkType === 'epcis') return fetch(`${env.WORKER_PUBLIC_API}/api/public/epcis?dl=${encodeURIComponent(url.pathname)}`);
return fetch(`${env.WORKER_WEB_ORIGIN}/passport${url.pathname}${url.search}`);
});

export default { fetch: (req: Request, env: any, ctx: ExecutionContext) => router.handle(req, env, ctx) };
]]> </worker-code>

```
<hmac-utils>
  <![CDATA[
```

import crypto from 'crypto';

export function signHmacSHA256(bodyRaw: string, secret: string) {
return 'sha256=' + crypto.createHmac('sha256', secret).update(bodyRaw, 'utf8').digest('hex');
}

export function verifyHmac(signatureHeader: string, bodyRaw: string, secret: string) {
const expected = signHmacSHA256(bodyRaw, secret);
const a = Buffer.from(signatureHeader || '');
const b = Buffer.from(expected);
return a.length === b.length && crypto.timingSafeEqual(a, b);
}
]]> </hmac-utils>

```
<nest-capture-controller>
  <![CDATA[
```

@Post('/epcis/capture')
async capture(@Headers() h: any, @Body() body: any, @Req() req: FastifyRequest) {
this.log.info({at:'capture.req', orgId: req.user.orgId, idem\:h}, 'capture\:received');
// HMAC
const ok = verifyHmac(h\['x-signature'], req.rawBody.toString('utf8'), await this.orgService.getHmacKey(req.user.orgId));
if (!ok) { this.log.warn({at:'capture.hmac\_fail'}, 'HMAC mismatch'); throw new ForbiddenException('HMAC\_MISMATCH'); }

// Idempotency
if (await this.idemService.seen(h\['x-idempotency-key'])) return this.idemService.previous(h\['x-idempotency-key']);

// JSON Schema validate (Ajv) + SHACL
await this.validationService.validateEpcis(body.events);

// Persist & enqueue
const ids = await this.eventsService.persist(req.user.orgId, body.events);
await this.queue.add('linker', { orgId: req.user.orgId, ids });

this.log.info({at:'capture.queued', count: ids.length}, 'capture\:queued');
return { accepted: true, ingestedCount: ids.length, ids };
}
]]> </nest-capture-controller>

```
<ajv-validation>
  <![CDATA[
```

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const ajv = new Ajv({allErrors\:true, strict\:false}); addFormats(ajv);

// For MVP, enforce core fields; later, load GS1 artefact schemas
const schema = { type:'object', required:\['type','eventTime'], properties:{
type: { enum:\['ObjectEvent','AggregationEvent','TransformationEvent','TransactionEvent'] },
eventTime: { type:'string', format:'date-time' }
}};

export function validateEvent(ev: any){
const ok = ajv.validate(schema, ev);
if (!ok) throw new Error('SCHEMA\_INVALID:'+ajv.errorsText());
}
]]> </ajv-validation>

```
<clickhouse-insert>
  <![CDATA[
```

import { createClient } from '@clickhouse/client';
const ch = createClient({ url: process.env.CLICKHOUSE\_URL! });

export async function logScan(ev:{ts\:string, gtin\:string, lot?\:string, serial?\:string, country?\:string, city?\:string, device?\:string, ua?\:string, latency?\:number}) {
console.info({at:'scan.log', ev});
await ch.insert({
table: 'scan\_events',
values: \[ev],
format: 'JSONEachRow'
});
}
]]> </clickhouse-insert>

```
<opensearch-index>
  <![CDATA[
```

import { Client } from '@opensearch-project/opensearch';
const os = new Client({ node: process.env.OPENSEARCH\_URL! });

export async function indexTimelineEvent(doc: any) {
await os.index({ index: 'timeline', id: doc.id, body: doc, refresh: 'true' });
}
]]> </opensearch-index>

```
<maplibre>
  <![CDATA[
```

'use client';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';

export default function OriginMap({lat, lon}:{lat\:number; lon\:number}) {
const ref = useRef<HTMLDivElement>(null);
useEffect(()=> {
const map = new maplibregl.Map({
container: ref.current!,
style: '[https://demotiles.maplibre.org/style.json](https://demotiles.maplibre.org/style.json)',
center: \[lon, lat],
zoom: 8
});
new maplibregl.Marker().setLngLat(\[lon, lat]).addTo(map);
return ()=> map.remove();
}, \[lat, lon]);
return <div className="h-64 w-full rounded-2xl" ref={ref} />;
}
]]> </maplibre> </snippets>

  <logging>
    <pattern>
      <![CDATA[
Use pino at INFO for normal path; WARN for recoverable issues (retries, validation warnings); ERROR for failures.
Include correlation: req.id, orgId, idemKey. Always log "at" (stable waypoint key).

Examples:
log.info({at:'resolver.request', linkType, keys, cfCountry}, 'resolver\:request')
log.info({at:'capture.received', orgId, idemKey}, 'capture\:received')
log.warn({at:'capture.schema\_warn', err}, 'capture\:validation\_warning')
log.error({at:'linker.fail', jobId, err}, 'linker\:error')
]]> </pattern> </logging>

  <coder-steps>
    <step order="1">Initialize monorepo; add packages; set up shared tsconfig and eslint. Ensure <code>apps/*</code> build independently via Turborepo.</step>
    <step order="2">Implement Prisma schema (above), run <code>pnpm prisma migrate dev</code>, and seed an Organization with an <code>hmacKey</code>.</step>
    <step order="3">In <code>apps/api</code>, scaffold NestJS modules: <code>AuthModule</code> (Bearer + JTI), <code>CaptureModule</code> (controller/service), <code>ValidationModule</code> (Ajv + SHACL wrappers), <code>EventsModule</code> (Prisma persistence), <code>QueueModule</code> (BullMQ with Redis), <code>PublicModule</code> (REST + GraphQL resolvers).</step>
    <step order="4">Wire Fastify rawBody for HMAC: in bootstrap, set <code>fastify.addHook('onRequest', rawBody)</code> equivalent or Fastify option <code>bodyLimit</code> + <code>onSend</code> capture.</step>
    <step order="5">Implement <code>POST /api/epcis/capture</code> with HMAC verification and idempotency (Redis SETNX on <code>X-Idempotency-Key</code> → TTL 24h).</step>
    <step order="6">Create BullMQ <code>linker</code> worker in <code>apps/jobs</code> (see pseudocode). Extract lot codes from EPCIS events and upsert Batch and Lot links.</step>
    <step order="7">Build read model and GraphQL <code>productPassport(digitalLink)</code> using DL parser. Add REST mirror at <code>/api/public/passport</code>.</step>
    <step order="8">Implement Cloudflare Worker in <code>apps/resolver</code>, add <code>wrangler.toml</code> with KV/env bindings to <code>WORKER_PUBLIC_API</code> and <code>WORKER_WEB_ORIGIN</code>. Deploy to vanity domain <code>id.&lt;brand&gt;.com</code>.</step>
    <step order="9">Create Next.js routes: <code>/passport/01/[gtin]/10/[lot]/page.tsx</code> which fetches the JSON model and renders the passport (Hero, OriginMap, Timeline, Certificates).</step>
    <step order="10">Add ClickHouse table <code>scan_events</code> and POST handler <code>/api/telemetry/scan</code> to receive resolver fire-and-forget events and insert.</step>
    <step order="11">Add OpenSearch index <code>timeline</code>; index EPCIS events on persist; enable filters by <code>gtin/lot/serial</code>.</step>
    <step order="12">Implement certificate uploads to S3/MinIO with presigned URLs; store metadata and optional VC JWT string; render verification status badge in UI.</step>
    <step order="13">Add RLS (Row Level Security) constraints via Prisma raw SQL to scope rows by <code>orgId</code>; ensure JWT <code>orgId</code> is propagated through services.</step>
    <step order="14">Instrument with OpenTelemetry SDK Node; export traces to stdout/OTLP; wrap request handlers and queue jobs; include <code>trace_id</code> in logs.</step>
    <step order="15">Ship a sample dataset: seed a GTIN, a lot L2305, a roast batch, and 5 EPCIS events; generate a QR with Digital Link path and verify end-to-end scan.</step>
  </coder-steps>

  <acceptance-tests>
    <curl>
      <![CDATA[
# 1) Ingest events
BODY=events.json
DATE=$(date -Ru)
SIG=$(node -e "console.log(require('./sign.js').signHmacSHA256(require('fs').readFileSync('$BODY','utf8'),'$HMAC_SECRET'))")
curl -i -X POST https://api.example.com/api/epcis/capture \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -H "Date: $DATE" \
  -H "X-Idempotency-Key: $(uuidgen)" \
  -H "X-Signature: $SIG" \
  --data @$BODY

# 2) Query passport JSON

curl "[https://api.example.com/api/public/passport?dl=/01/09506000134352/10/L2305](https://api.example.com/api/public/passport?dl=/01/09506000134352/10/L2305)"

# 3) Open resolver HTML

open "[https://id.example.com/01/09506000134352/10/L2305?linkType=product](https://id.example.com/01/09506000134352/10/L2305?linkType=product)"
]]> </curl> <done-criteria> <item>Scan of QR resolves to a passport page < 300ms TTFB (edge cached) for repeating hits.</item> <item>EPCIS events pass schema + SHACL, persist, link to batch, and appear in timeline.</item> <item>ClickHouse shows scan events; OpenSearch can text-filter timeline.</item> <item>Certificates upload and render with validity windows and verification status.</item> <item>Logs contain INFO waypoints with correlation IDs; errors are surfaced with codes.</item> </done-criteria> </acceptance-tests> </xml>
