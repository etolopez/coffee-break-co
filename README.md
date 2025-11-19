# Coffee Digital Passport

A standards-first traceability platform for coffee supply chains, implementing GS1 Digital Link, EPCIS 2.0, and W3C Verifiable Credentials.

## 🚀 Features

- **GS1 Digital Link QR Codes**: Scan-to-passport experience with mobile-optimized URLs
- **EPCIS 2.0 Event Capture**: Standards-compliant event ingestion with HMAC verification
- **Supply Chain Traceability**: Farm-to-cup journey tracking with timeline visualization
- **Certificate Management**: Digital certificates with optional W3C Verifiable Credentials
- **Edge Resolution**: Cloudflare Worker-based resolver for global performance
- **Privacy-Preserving Analytics**: Scan telemetry without PII collection

## 🏗️ Architecture

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
                 - read model (Postgres views)
                 - OpenSearch for text search
                 - S3/MinIO for media/docs
                 - ClickHouse for telemetry
                 - Redis cache
                 - OpenTelemetry traces
                 ^
                 |
[B2B Partners] -> [/api/epcis/capture (NestJS Fastify)]
                 - OAuth2 client-cred + HMAC
                 - EPCIS JSON-LD validation
                 - BullMQ jobs (enrichment, dedupe)
                 - Event store (Postgres JSONB)
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, MapLibre GL JS
- **Backend**: NestJS, Fastify, Prisma, PostgreSQL, Redis, BullMQ
- **Search**: OpenSearch
- **Analytics**: ClickHouse
- **Storage**: S3/MinIO
- **Edge**: Cloudflare Workers
- **Standards**: GS1 Digital Link, EPCIS 2.0, CBV 2.0, W3C VC v2.0

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (for local development)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd coffee-passport

# Install dependencies
npm install

# Build shared packages
cd packages/shared && npm run build && cd ../..
```

### 2. Environment Configuration

Create `.env` files in each app directory:

```bash
# apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/coffee_passport"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"
JWT_ISSUER="https://auth.coffee.example"
JWT_AUDIENCE="coffee-api"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
HMAC_REQUIRED="true"
HMAC_SECRET="your-hmac-secret"
OPENSEARCH_URL="http://localhost:9200"
CLICKHOUSE_URL="http://localhost:8123"
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="coffee-passport"
S3_REGION="us-east-1"

# apps/resolver/.env
WORKER_PUBLIC_API="http://localhost:3000"
WORKER_WEB_ORIGIN="http://localhost:3001"
```

### 3. Database Setup

```bash
# Run database migrations
cd apps/api
npm run prisma:migrate

# Seed initial data
npm run db:seed
```

### 4. Start Services

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Web App
cd apps/web
npm run dev

# Terminal 3: Start Worker (development)
cd apps/resolver
npm run dev
```

## 🔧 Development

### Project Structure

```
coffee-passport/
├── apps/
│   ├── api/                 # NestJS API server
│   ├── web/                 # Next.js web application
│   ├── resolver/            # Cloudflare Worker resolver
│   └── jobs/                # Background job processors
├── packages/
│   ├── shared/              # Shared types and utilities
│   └── config/              # Shared configuration
├── infra/                   # Infrastructure as code
└── migrations/              # Database migrations
```

### Key Commands

```bash
# Build all packages
npm run build

# Run development servers
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Database operations
npm run db:migrate
npm run db:seed
```

## 📱 Usage

### 1. Generate Digital Link QR Code

```typescript
import { buildDigitalLink } from '@coffee-passport/shared';

const digitalLink = buildDigitalLink({
  gtin: '09506000134352',
  lot: 'L2305',
  serial: '000123'
}, 'https://id.example.com');

console.log(digitalLink);
// Output: https://id.example.com/01/09506000134352/10/L2305/21/000123?linkType=product&ctx=mobile
```

### 2. Ingest EPCIS Events

```bash
curl -X POST http://localhost:3000/api/epcis/capture \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Date: $(date -Ru)" \
  -H "X-Idempotency-Key: $(uuidgen)" \
  -H "X-Signature: sha256=YOUR_HMAC_SIGNATURE" \
  -d '{
    "events": [
      {
        "@context": ["https://ref.gs1.org/standards/epcis/epcis-context.jsonld"],
        "type": "TransformationEvent",
        "eventTime": "2025-08-14T10:00:00-05:00",
        "inputQuantityList": [
          {"epcClass":"urn:epc:class:lgtin:0950600.134352.L2305","quantity":120,"uom":"KG"}
        ],
        "outputEPCList": ["urn:epc:id:sgtin:0950600.134352.000999"],
        "bizStep": "urn:epcglobal:cbv:bizstep:transforming"
      }
    ]
  }'
```

### 3. Access Passport

- **HTML**: `https://id.example.com/01/09506000134352/10/L2305`
- **JSON**: `https://id.example.com/01/09506000134352/10/L2305?linkType=json`
- **EPCIS**: `https://id.example.com/01/09506000134352/10/L2305?linkType=epcis`

## 🔐 Security Features

- **OAuth2 Client Credentials**: JWT-based authentication
- **HMAC Verification**: Request signature validation
- **Idempotency**: Duplicate request prevention
- **Rate Limiting**: Per-organization request throttling
- **CORS Protection**: Cross-origin request control
- **Input Validation**: JSON Schema + SHACL validation

## 📊 Monitoring & Observability

- **Structured Logging**: Winston with correlation IDs
- **Performance Metrics**: Request duration tracking
- **Health Checks**: Service health endpoints
- **OpenTelemetry**: Distributed tracing support
- **Scan Analytics**: Privacy-preserving telemetry

## 🚀 Deployment

### Production Deployment

1. **Build Applications**
   ```bash
   npm run build
   ```

2. **Deploy API**
   ```bash
   cd apps/api
   npm run start:prod
   ```

3. **Deploy Worker**
   ```bash
   cd apps/resolver
   npm run deploy
   ```

4. **Deploy Web App**
   ```bash
   cd apps/web
   npm run start
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f infra/docker-compose.prod.yml up -d
```

## 🧪 Testing

### API Tests

```bash
cd apps/api
npm run test
npm run test:e2e
```

### Web App Tests

```bash
cd apps/web
npm run test
```

### Integration Tests

```bash
# Run full integration test suite
npm run test:integration
```

## 📚 API Documentation

- **Swagger UI**: `http://localhost:3000/docs`
- **GraphQL Playground**: `http://localhost:3000/graphql`
- **Health Check**: `http://localhost:3000/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.coffee-passport.com](https://docs.coffee-passport.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/coffee-passport/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/coffee-passport/discussions)

## 🙏 Acknowledgments

- GS1 for Digital Link and EPCIS standards
- W3C for Verifiable Credentials
- OpenEPCIS community
- MapLibre for open-source mapping

---

**Built with ❤️ for transparent coffee supply chains**

